import { stylistFactory } from "src/stylist";
import { lightThemeConfig, darkThemeConfig } from "demo/themes/themeConfig";
import { buildTheme } from "demo/themes/themeBuilder";

export const { getStylist, setTheme } = stylistFactory("DEMO", lightThemeConfig, buildTheme);

export const themeConfigs = {
    light: lightThemeConfig,
    dark: darkThemeConfig
};

export type ThemeName = keyof typeof themeConfigs;

export const switchTheme = (themeName: ThemeName) => {
    setTheme(themeConfigs[themeName]);
};
