import { getStylist } from 'demo/themes/stylist';
import * as React from 'react';
import { ThemeSelector } from './ThemeSelector';

const { styleDiv, styleComponent, styleAnchor1 } = getStylist('App');

const Root = styleDiv('Root', theme => ({
    height: '100vh',
    padding: '16px',
    background: theme.backgroundColor,
    color: theme.foregroundColor
}));

const Root1 = styleComponent(Root)('Root1', {
    fontSize: 32
});

const Link = styleAnchor1<{ backgroundColor: string }, 'bgColor'>(
    'Link',
    {
        fontSize: 48
    },
    {
        bgColor: props => props.customProps.backgroundColor
    },
    vars => ({
        backgroundColor: vars.bgColor
    })
);

const MyThemeSelector = styleComponent(ThemeSelector)('MyThemeSelector', {
    margin: '16px'
});

export class App extends React.Component {
    public state = { color: 'red' };

    public render() {
        return (
            <Root1 originalRef={this._originalRef}>
                <MyThemeSelector />
                <Link customProps={{ backgroundColor: this.state.color }}>Hello World!</Link>
                <button
                    onClick={() => {
                        this.setState({ color: 'blue' });
                    }}
                >
                    Change background color to blue
                </button>
            </Root1>
        );
    }

    public componentDidMount() {
        console.log(this._originalRef);
    }

    private _originalRef = React.createRef<HTMLDivElement>();
}
