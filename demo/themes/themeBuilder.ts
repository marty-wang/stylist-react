import { ThemeConfig } from 'demo/themes/themeConfig';

export const buildTheme = (themeConfig: ThemeConfig) => {
    const { backgroundColor, foregroundColor, foo } = themeConfig;

    return {
        App: {
            backgroundColor,
            foregroundColor,
            foo
        },
        Something: {
            bar: foo
        }
    };
};
