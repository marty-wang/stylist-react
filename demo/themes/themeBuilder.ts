import { ThemeConfig } from "./themeConfig";

export const buildTheme = (themeConfig: ThemeConfig) => {
    const { backgroundColor, foregroundColor } = themeConfig;

    return {
        App: {
            backgroundColor,
            foregroundColor
        }
    };
};
