/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import * as React from 'react';
import { keyframes, style, types } from 'typestyle';
import { applyTheme, createThemeValueTable, createThemeVars, endsWith, pluckExt, Theme } from './utils';

export type CSSProperties = types.CSSProperties;
export type NestedCSSProperties = types.NestedCSSProperties;

type KeyFrames = types.KeyFrames;
type ReactComponent<P> = React.StatelessComponent<P> | React.ComponentClass<P>;
type StylableComponent<T> = keyof React.ReactHTML | ReactComponent<T> | keyof React.ReactSVG;
type DynamicCss<TProps, TVars> = (
    props: Readonly<TProps>,
    themeVars: TVars
) => NestedCSSProperties | ReadonlyArray<NestedCSSProperties>;
type ObjectOrCallback<TArgs, TO> = TO | ((args: TArgs) => TO);
type StaticCss<TVars> = ObjectOrCallback<TVars, NestedCSSProperties | ReadonlyArray<NestedCSSProperties>>;
type GetClassName<TVars> = (debugName: string, ...cssProps: StaticCss<TVars>[]) => string;
type StyledComponentProps<TProps, TCustomProps> = TProps & { customProps?: TCustomProps; originalRef?: React.Ref<{}> };

const staticCssField = '__sc_static_css';
const dynamicCssField = '__sc_dynamic_css';
const cssSetFlag = '__sc_css_set';

const classNameFactory = <TScopedThemeVars>(scope: string, scopedThemeVars: TScopedThemeVars) => (
    debugName: string,
    ...cssProps: StaticCss<TScopedThemeVars>[]
) => {
    const cssProperties = cssProps
        .map(css => (typeof css === 'function' ? css(scopedThemeVars) : css))
        .filter(css => !!css)
        .reduce<NestedCSSProperties[]>((r, c) => r.concat(c), []);
    const isEmpty = cssProperties.every(css => !Object.keys(css).length);
    const debugProps: NestedCSSProperties = { $debugName: `${scope}-${debugName}` };
    return isEmpty ? '' : style(...cssProperties, debugProps);
};

const animationNameFactory = <TScopedThemeVars>(scopedThemeVars: TScopedThemeVars) => (
    timeline: ObjectOrCallback<TScopedThemeVars, KeyFrames>
): string => {
    const frames = typeof timeline === 'function' ? timeline(scopedThemeVars) : timeline;
    return keyframes(frames);
};

const getStaticCssArrayCopy = <TVars>(Component: any): StaticCss<TVars>[] => (Component[staticCssField] || []).slice();

const getDynamicCssArrayCopy = (Component: any): DynamicCss<{}, {}>[] => (Component[dynamicCssField] || []).slice();

const isStyledComponent = (Component: any) => !!Component[dynamicCssField];

type Arity2<A, B, O> = (a: A, b: B) => O;

const partialRight = <A, B, O>(fn: Arity2<A, B, O>, b: B) => (a: A) => fn(a, b);

const styledComponentFactory = <TScopedThemeVars>(
    getClassName: GetClassName<TScopedThemeVars>,
    scopedThemeVars: TScopedThemeVars
) => <TProps extends { className?: string }>(Component: StylableComponent<TProps>) => <TCustomProps>(
    styledComponentName: string,
    css: StaticCss<TScopedThemeVars>,
    getCss?: DynamicCss<StyledComponentProps<TProps, TCustomProps>, TScopedThemeVars>
) => {
    if (typeof css === 'function') {
        css = css(scopedThemeVars);
    }

    const staticCssArray = getStaticCssArrayCopy<TScopedThemeVars>(Component).concat(css);

    const dynamicCssArray = getDynamicCssArrayCopy(Component)
        .concat(getCss && partialRight(getCss, scopedThemeVars))
        .filter(fn => !!fn);

    const staticCssClassName = getClassName(styledComponentName, ...staticCssArray);

    const isTargetStyledComponent = isStyledComponent(Component);

    const StyledComponent = class extends React.Component<StyledComponentProps<TProps, TCustomProps>> {
        public static [staticCssField] = staticCssArray;
        public static [dynamicCssField] = dynamicCssArray;

        public render() {
            const { customProps = <TCustomProps>{}, originalRef, ...props } = <any>this.props;

            const cssSet = props[cssSetFlag];
            props[cssSetFlag] = undefined;

            const classNames: string[] = [];

            if (!cssSet) {
                const dynamicCss = StyledComponent[dynamicCssField].map(cssFn =>
                    cssFn({ ...props, ...{ customProps } }, scopedThemeVars)
                );

                const dynamicCssClassName = getClassName(styledComponentName, ...dynamicCss);

                classNames.push(staticCssClassName, dynamicCssClassName);
            }

            return React.createElement(Component, {
                ...props,
                ...(isTargetStyledComponent ? { originalRef } : { ref: originalRef }),
                className: joinClassNames(...classNames, this.props.className),
                [cssSetFlag]: isTargetStyledComponent ? true : undefined
            });
        }
    };

    (<any>StyledComponent).displayName = styledComponentName;

    return StyledComponent;
};

export const important = (cssProps: CSSProperties): CSSProperties => {
    const suffix = '!important';

    Object.keys(cssProps).forEach((prop: keyof CSSProperties) => {
        const val = cssProps[prop];

        if ((typeof val === 'string' || typeof val === 'number') && !endsWith(val, suffix)) {
            cssProps[prop] = `${val} ${suffix}`;
        }
    });

    return cssProps;
};

export const joinClassNames = (...classNames: string[]): string => classNames.filter(c => c).join(' ');

const ensureDefined = <T>(obj: T): T => obj || <any>{};

export const stylistFactory = <TThemeConfig, TTheme extends Theme>(
    namespace: string,
    initialThemeConfig: TThemeConfig,
    buildTheme: (config: TThemeConfig) => TTheme
) => {
    const currentTheme = buildTheme(initialThemeConfig);
    const themeVars = createThemeVars(namespace, currentTheme);

    const themeValueTable = createThemeValueTable(namespace, currentTheme);
    applyTheme(namespace, themeValueTable);

    const getStylist = <TScope extends string>(scope: TScope) => {
        const scopedThemeVars = ensureDefined(pluckExt(themeVars, scope));
        const getClassName = classNameFactory(scope, scopedThemeVars);
        const getAnimationName = animationNameFactory(scopedThemeVars);
        const styleComponent = styledComponentFactory(getClassName, scopedThemeVars);

        const ScopedThemeConsumer = class extends React.Component<{
            children: (themeVars: typeof scopedThemeVars) => React.ReactNode;
        }> {
            public render() {
                return this.props.children(scopedThemeVars);
            }
        };

        return {
            ScopedThemeConsumer,
            getClassName,
            getAnimationName,
            styleComponent,
            //HTML stylers
            styleDiv: styleComponent<React.HTMLAttributes<HTMLDivElement>>('div'),
            styleSpan: styleComponent<React.HTMLAttributes<HTMLSpanElement>>('span'),
            styleHeader: styleComponent<React.HTMLAttributes<HTMLElement>>('header'),
            styleFooter: styleComponent<React.HTMLAttributes<HTMLElement>>('footer'),
            styleButton: styleComponent<React.ButtonHTMLAttributes<HTMLButtonElement>>('button'),
            styleUlist: styleComponent<React.HTMLAttributes<HTMLUListElement>>('ul'),
            styleLi: styleComponent<React.LiHTMLAttributes<HTMLLIElement>>('li'),
            styleAnchor: styleComponent<React.AnchorHTMLAttributes<HTMLAnchorElement>>('a'),
            styleInput: styleComponent<React.InputHTMLAttributes<HTMLInputElement>>('input'),
            styleTextArea: styleComponent<React.TextareaHTMLAttributes<HTMLTextAreaElement>>('textarea'),
            styleParagraph: styleComponent<React.HTMLAttributes<HTMLParagraphElement>>('p'),
            styleLabel: styleComponent<React.LabelHTMLAttributes<HTMLLabelElement>>('label'),
            styleMain: styleComponent<React.HTMLAttributes<HTMLMainElement>>('main'),
            styleIFrame: styleComponent<React.IframeHTMLAttributes<HTMLIFrameElement>>('iframe'),
            styleNav: styleComponent<React.HTMLAttributes<HTMLElement>>('nav'),
            //SVG stylers
            styleSvg: styleComponent<React.SVGAttributes<SVGSVGElement>>('svg'),
            styleG: styleComponent<React.SVGAttributes<SVGGElement>>('g'),
            styleRect: styleComponent<React.SVGAttributes<SVGRectElement>>('rect'),
            styleCircle: styleComponent<React.SVGAttributes<SVGCircleElement>>('circle'),
            styleLine: styleComponent<React.SVGAttributes<SVGLineElement>>('line'),
            stylePath: styleComponent<React.SVGAttributes<SVGPathElement>>('path')
        };
    };

    const getScopedTheme = <T extends keyof ReturnType<typeof buildTheme>>(scope: T): ReturnType<typeof buildTheme>[T] => {
        return {...currentTheme[scope]};
    }

    const setTheme = (themeConfig: TThemeConfig) => {
        const theme = buildTheme(themeConfig);
        const valueTable = createThemeValueTable(namespace, theme);

        applyTheme(namespace, valueTable);

        Object.keys(theme).forEach(scope => {
            const scopedTheme = theme[scope];
            Object.keys(scopedTheme).forEach(name => {
                if (!currentTheme[scope]) {
                    currentTheme[scope] = {};
                }
                currentTheme[scope][name] = scopedTheme[name];
            });
        });
    };

    const devHotReloadTheme = (themeConfig: TThemeConfig, build: (config: TThemeConfig) => TTheme) => {
        buildTheme = build;
        setTheme(themeConfig);
    };

    return {
        getStylist,
        setTheme,
        getScopedTheme,
        devHotReloadTheme
    };
};
