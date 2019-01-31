import * as React from "react";
import { getStylist } from "demo/themes/stylist";
import { ThemeSelector } from "./ThemeSelector";

const { styleDiv, styleComponent } = getStylist("App");

const Root = styleDiv("Root", theme => ({
    height: "100vh",
    padding: "16px",
    background: theme.backgroundColor,
    color: theme.foregroundColor
}));

const MyThemeSelector = styleComponent(ThemeSelector)("MyThemeSelector", {
    margin: "16px"
});

export class App extends React.Component {
    public render() {
        return (
            <Root>
                <MyThemeSelector />
                <h1>Hello World!</h1>
            </Root>
        );
    }
}
