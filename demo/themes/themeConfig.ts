export type ThemeConfig = {
    backgroundColor: string;
    foregroundColor: string;
    foo: number;
};

export const darkThemeConfig: ThemeConfig = {
    backgroundColor: '#3d3d3d',
    foregroundColor: '#bbbbbb',
    foo: 1
};

export const lightThemeConfig: ThemeConfig = {
    backgroundColor: '#bbbbbb',
    foregroundColor: '#3d3d3d',
    foo: 2
};
