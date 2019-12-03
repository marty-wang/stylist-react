import { buildTheme } from 'demo/themes/themeBuilder';
import { darkThemeConfig, lightThemeConfig } from 'demo/themes/themeConfig';
import { stylistFactory } from 'src/stylist';

export const { getStylistV2: getStylist, setTheme } = stylistFactory('DEMO', lightThemeConfig, buildTheme, {
    nonce: `${Math.random()}`
});

export const themeConfigs = {
    light: lightThemeConfig,
    dark: darkThemeConfig
};

export type ThemeName = keyof typeof themeConfigs;

export const switchTheme = (themeName: ThemeName) => {
    setTheme(themeConfigs[themeName]);
};
