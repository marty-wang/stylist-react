export type ValueOrUndefined<TO, TK> = TK extends keyof TO ? TO[TK] : undefined;

export type Theme = { [scope: string]: { [name: string]: string | number } };

export type ThemeVars<TTheme extends Theme> = { [scope in keyof TTheme]: { [name in keyof TTheme[scope]]: string } };

export function endsWith(val: string | number, searchString: string): boolean {
    return new RegExp(`${searchString}$`).test(`${val}`);
}

export const pluckExt = <O extends Record<string, any>, K extends string>(obj: O, key: K): ValueOrUndefined<O, K> => {
    // tslint:disable-next-line:no-any
    return <any>obj[key];
};

const buildVarName = (namespace: string, scope: string, name: string) => `--${namespace}-${scope}-${name}`;

export const createThemeVars = <TTheme extends Theme>(namespace: string, theme: TTheme) => {
    // tslint:disable-next-line:no-any
    const vars: ThemeVars<TTheme> = <any>{};

    Object.keys(theme).forEach(scope => {
        // tslint:disable-next-line:no-any
        vars[scope] = <any>{};
        Object.keys(theme[scope]).forEach(name => {
            vars[scope][name] = `var(${buildVarName(namespace, scope, name)})`;
        });
    });

    return vars;
};

export const createThemeValueTable = <TTheme extends Theme>(namespace: string, theme: TTheme) => {
    // tslint:disable-next-line:no-any
    const table: Record<string, string> = <any>{};

    Object.keys(theme).forEach(scope => {
        Object.keys(theme[scope]).forEach(name => {
            table[buildVarName(namespace, scope, name)] = `${theme[scope][name]}`;
        });
    });

    return table;
};

export const applyTheme = (tagId: string, themeValueTable: Record<string, string>) => {
    let styleTag = document.getElementById(tagId);

    if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = tagId;
        styleTag.setAttribute("type", "text/css");
        document.head.appendChild(styleTag);
    }

    const themeValueStr = Object.keys(themeValueTable)
        .reduce((r, k) => {
            r.push(`${k}:${themeValueTable[k]}`);
            return r;
        }, [])
        .join(";");

    styleTag.innerText = `:root {${themeValueStr}}`;
};
