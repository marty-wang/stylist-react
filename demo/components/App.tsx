import { getStylist } from 'demo/themes/stylist';
import * as React from 'react';
import { ThemeSelector } from './ThemeSelector';

const { styleDiv, styleComponent, styleAnchor1, styleComponent1 } = getStylist('App');

const Root = styleDiv('Root', theme => ({
    height: '100vh',
    padding: '16px',
    background: theme.backgroundColor,
    color: theme.foregroundColor
}));

const Root1 = styleComponent(Root)('Root1', {
    fontSize: 32
});

const Link = styleAnchor1('Link', {
    fontSize: 48
});

const Link2 = styleComponent1(Link)(
    'Link2',
    (_, vars) => ({
        color: 'white',
        border: '1px solid black',
        background: vars.a,
        fontSize: 16
    }),
    { a: '' }
);

const Link3 = styleComponent1(Link2)(
    'Link3',
    (theme, y) => ({
        opacity: 0.5,
        borderWidth: y.c,
        $nest: {
            '&:hover': {
                opacity: y.d as any,
                background: theme.backgroundColor
            }
        }
    }),
    { c: '', d: '' }
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
                <Link>First link</Link>
                <Link2
                    vars={{
                        a: this.state.color
                    }}
                >
                    Hello World!
                </Link2>
                <Link3
                    vars={{
                        a: 'green',
                        c: '10px',
                        d: 1
                    }}
                >
                    Another link
                </Link3>
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
