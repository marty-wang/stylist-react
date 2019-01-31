import { stylistFactory } from "src/stylist";
import { lightThemeConfig } from "demo/themes/lightThemeConfig";
import { buildTheme } from "demo/themes/themeBuilder";
import { darkThemeConfig } from "demo/themes/darkThemeConfig";

export const { getStylist, setTheme } = stylistFactory("DEMO", lightThemeConfig, buildTheme);

export const themeConfigs = {
    light: lightThemeConfig,
    dark: darkThemeConfig
};

export type ThemeName = keyof typeof themeConfigs;

export const switchTheme = (themeName: ThemeName) => {
    setTheme(themeConfigs[themeName]);
};
