/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { observable, transaction } from "mobx";
import { observer } from "mobx-react";
import * as React from "react";
import { endsWith, pluckExt, applyTheme, createThemeValueTable, createThemeVars, Theme } from "src/utils";
import { keyframes, style, types } from "typestyle";

export type CSSProperties = types.CSSProperties;
type NestedCssProps = types.NestedCSSProperties;
type KeyFrames = types.KeyFrames;
type ReactComponent<P> = React.StatelessComponent<P> | React.ComponentClass<P>;
type StylableComponent<T> = keyof React.ReactHTML | ReactComponent<T> | keyof React.ReactSVG;
type DynamicCss<TProps, TVars, TValues> = (
    props: Readonly<TProps>,
    themeVars: TVars,
    themeValues: TValues
) => NestedCssProps | ReadonlyArray<NestedCssProps>;
type ObjectOrCallback<TArgs, TO> = TO | ((args: TArgs) => TO);
type StaticCss<TVars> = ObjectOrCallback<TVars, NestedCssProps | ReadonlyArray<NestedCssProps>>;
type GetClassName<TVars> = (debugName: string, ...cssProps: StaticCss<TVars>[]) => string;
type StyledComponentProps<TProps, TCustomProps> = TProps & { customProps?: TCustomProps };

const staticCssField = "__sc_static_css";
const dynamicCssField = "__sc_dynamic_css";
const cssSetFlag = "__sc_css_set";

const classNameFactory = <TScopedThemeVars>(scope: string, scopedThemeVars: TScopedThemeVars) => (
    debugName: string,
    ...cssProps: StaticCss<TScopedThemeVars>[]
) => {
    const cssProperties = cssProps
        .map(css => (typeof css === "function" ? css(scopedThemeVars) : css))
        .filter(css => !!css)
        .reduce<NestedCssProps[]>((r, c) => r.concat(c), []);
    const isEmpty = cssProperties.every(css => !Object.keys(css).length);
    const debugProps: NestedCssProps = { $debugName: `${scope}-${debugName}` };
    return isEmpty ? "" : style(...cssProperties, debugProps);
};

const animationNameFactory = <TScopedThemeVars>(scopedThemeVars: TScopedThemeVars) => (
    timeline: ObjectOrCallback<TScopedThemeVars, KeyFrames>
): string => {
    const frames = typeof timeline === "function" ? timeline(scopedThemeVars) : timeline;
    return keyframes(frames);
};

// tslint:disable-next-line:no-any
const getStaticCssArrayCopy = <TVars>(Component: any): StaticCss<TVars>[] => (Component[staticCssField] || []).slice();

// tslint:disable-next-line:no-any
const getDynamicCssArrayCopy = (Component: any): DynamicCss<{}, {}, {}>[] => (Component[dynamicCssField] || []).slice();

// tslint:disable-next-line:no-any
const isStyledComponent = (Component: any) => !!Component[dynamicCssField];

type Arity3<A, B, C, O> = (a: A, b: B, c: C) => O;

const partialRight = <A, B, C, O>(fn: Arity3<A, B, C, O>, c: C, b: B) => (a: A) => fn(a, b, c);

/**
 * scopedThemeValues is a workaround for the bug below in Edge <= 15.
 * https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/11495448/
 * It should removed in favor of __scopedThemeVars__, once we don't support Edge or Edge > 15 is released.
 */
const styledComponentFactory = <TScopedThemeVars, TScopedThemeValues>(
    getClassName: GetClassName<TScopedThemeVars>,
    scopedThemeVars: TScopedThemeVars,
    scopedThemeValues: TScopedThemeValues
) => <TProps extends { className?: string }>(Component: StylableComponent<TProps>) => <TCustomProps>(
    styledComponentName: string,
    css: StaticCss<TScopedThemeVars>,
    getCss?: DynamicCss<StyledComponentProps<TProps, TCustomProps>, TScopedThemeVars, TScopedThemeValues>
) => {
    if (typeof css === "function") {
        css = css(scopedThemeVars);
    }

    const staticCssArray = getStaticCssArrayCopy<TScopedThemeVars>(Component).concat(css);

    const dynamicCssArray = getDynamicCssArrayCopy(Component)
        .concat(getCss && partialRight(getCss, scopedThemeValues, scopedThemeVars))
        .filter(fn => !!fn);

    const staticCssClassName = getClassName(styledComponentName, ...staticCssArray);

    const isTargetStyledComponent = isStyledComponent(Component);

    const StyledComponent = class extends React.Component<StyledComponentProps<TProps, TCustomProps>> {
        public static [staticCssField] = staticCssArray;
        public static [dynamicCssField] = dynamicCssArray;

        public render() {
            // tslint:disable-next-line:no-any
            const { customProps = <TCustomProps>{}, ...props } = <any>this.props;

            const cssSet = props[cssSetFlag];
            props[cssSetFlag] = undefined;

            const classNames: string[] = [];

            if (!cssSet) {
                const dynamicCss = StyledComponent[dynamicCssField].map(cssFn =>
                    cssFn({ ...props, ...{ customProps } }, scopedThemeVars, scopedThemeValues)
                );

                const dynamicCssClassName = getClassName(styledComponentName, ...dynamicCss);

                classNames.push(staticCssClassName, dynamicCssClassName);
            }

            return React.createElement(Component, {
                ...props,
                className: joinClassNames(...classNames, this.props.className),
                [cssSetFlag]: isTargetStyledComponent ? true : undefined
            });
        }
    };

    return observer(StyledComponent);
};

export function important(cssProps: CSSProperties): CSSProperties {
    const suffix = "!important";

    Object.keys(cssProps).forEach((prop: keyof CSSProperties) => {
        const val = cssProps[prop];

        if ((typeof val === "string" || typeof val === "number") && !endsWith(val, suffix)) {
            cssProps[prop] = `${val} ${suffix}`;
        }
    });

    return cssProps;
}

export const joinClassNames = (...classNames: string[]): string => classNames.filter(c => c).join(" ");

// tslint:disable-next-line:no-any
const ensureDefined = <T>(obj: T): T => obj || <any>{};

export const stylistFactory = <TThemeConfig, TTheme extends Theme>(
    namespace: string,
    initialThemeConfig: TThemeConfig,
    buildTheme: (config: TThemeConfig) => TTheme
) => {
    const currentTheme: TTheme = <any>observable(buildTheme(initialThemeConfig));
    const themeVars = createThemeVars(namespace, currentTheme);

    const themeValueTable = createThemeValueTable(namespace, currentTheme);
    applyTheme(namespace, themeValueTable);

    const createStylist = <TScope extends string>(scope: TScope) => {
        const scopedThemeVars = ensureDefined(pluckExt(themeVars, scope));
        const scopedThemeValues = pluckExt(currentTheme, scope);

        @observer
        class ScopedThemeConsumer extends React.Component<{
            children: (themeVars: typeof scopedThemeVars, themeValues: typeof scopedThemeValues) => React.ReactNode;
        }> {
            public render() {
                return this.props.children(scopedThemeVars, scopedThemeValues);
            }
        }

        const getClassName = classNameFactory(scope, scopedThemeVars);
        const getAnimationName = animationNameFactory(scopedThemeVars);
        const styleComponent = styledComponentFactory(getClassName, scopedThemeVars, scopedThemeValues);

        return {
            ScopedThemeConsumer,
            getClassName,
            getAnimationName,
            styleComponent,
            //HTML stylers
            styleDiv: styleComponent<React.HTMLAttributes<HTMLDivElement>>("div"),
            styleSpan: styleComponent<React.HTMLAttributes<HTMLSpanElement>>("span"),
            styleHeader: styleComponent<React.HTMLAttributes<HTMLElement>>("header"),
            styleFooter: styleComponent<React.HTMLAttributes<HTMLElement>>("footer"),
            styleButton: styleComponent<React.ButtonHTMLAttributes<HTMLButtonElement>>("button"),
            styleUlist: styleComponent<React.HTMLAttributes<HTMLUListElement>>("ul"),
            styleLi: styleComponent<React.LiHTMLAttributes<HTMLLIElement>>("li"),
            styleAnchor: styleComponent<React.AnchorHTMLAttributes<HTMLAnchorElement>>("a"),
            styleInput: styleComponent<React.InputHTMLAttributes<HTMLInputElement>>("input"),
            styleTextArea: styleComponent<React.TextareaHTMLAttributes<HTMLTextAreaElement>>("textarea"),
            styleParagraph: styleComponent<React.HTMLAttributes<HTMLParagraphElement>>("p"),
            styleLabel: styleComponent<React.LabelHTMLAttributes<HTMLLabelElement>>("label"),
            styleMain: styleComponent<React.HTMLAttributes<HTMLMainElement>>("main"),
            styleIFrame: styleComponent<React.IframeHTMLAttributes<HTMLIFrameElement>>("iframe"),
            styleNav: styleComponent<React.HTMLAttributes<HTMLElement>>("nav"),
            //SVG stylers
            styleSvg: styleComponent<React.SVGAttributes<SVGSVGElement>>("svg"),
            styleG: styleComponent<React.SVGAttributes<SVGGElement>>("g"),
            styleRect: styleComponent<React.SVGAttributes<SVGRectElement>>("rect"),
            styleCircle: styleComponent<React.SVGAttributes<SVGCircleElement>>("circle"),
            styleLine: styleComponent<React.SVGAttributes<SVGLineElement>>("line"),
            stylePath: styleComponent<React.SVGAttributes<SVGPathElement>>("path")
        };
    };

    const changeTheme = (themeConfig: TThemeConfig) => {
        const theme = buildTheme(themeConfig);
        const valueTable = createThemeValueTable(namespace, theme);

        applyTheme(namespace, valueTable);

        transaction(() => {
            Object.keys(theme).forEach(scope => {
                const scopedTheme = theme[scope];
                Object.keys(scopedTheme).forEach(key => {
                    if (!currentTheme[scope]) {
                        currentTheme[scope] = {};
                    }
                    currentTheme[scope][key] = scopedTheme[key];
                });
            });
        });
    };

    const devHotReloadTheme = (themeConfig: TThemeConfig, build: (config: TThemeConfig) => TTheme) => {
        buildTheme = build;
        changeTheme(themeConfig);
    };

    return {
        getStylist: createStylist,
        setTheme: changeTheme,
        devHotReloadTheme
    };
};
