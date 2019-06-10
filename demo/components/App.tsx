import { getStylist } from 'demo/themes/stylist';
import * as React from 'react';
import { ThemeSelector } from './ThemeSelector';

const { styleDiv, styleComponent } = getStylist('App');

const Root = styleDiv('Root', theme => ({
    height: '100vh',
    padding: '16px',
    background: theme.backgroundColor,
    color: theme.foregroundColor
}));

const Root1 = styleComponent(Root)('Root1', {
    fontSize: 32
});

const MyThemeSelector = styleComponent(ThemeSelector)('MyThemeSelector', {
    margin: '16px'
});

export class App extends React.Component {
    private _originalRef = React.createRef<HTMLDivElement>();

    public render() {
        return (
            <Root1 originalRef={this._originalRef}>
                <MyThemeSelector />
                <h1>Hello World!</h1>
            </Root1>
        );
    }

    public componentDidMount() {
        console.log(this._originalRef);
    }
}
