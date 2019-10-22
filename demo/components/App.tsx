import { getStylist } from 'demo/themes/stylist';
import * as React from 'react';
import { ThemeSelector } from './ThemeSelector';

const { styleDiv, styleComponent, styleAnchor$V2$, styleComponent$V2$ } = getStylist('App');

const Root = styleDiv('Root', theme => ({
    height: '100vh',
    padding: '16px',
    background: theme.backgroundColor,
    color: theme.foregroundColor
}));

const Root1 = styleComponent(Root)('Root1', {
    fontSize: 32
});

const Link = styleAnchor$V2$('Link', {
    fontSize: 48
});

const Link2 = styleComponent$V2$(Link)(
    'Link2',
    (_, cssVars) => ({
        color: cssVars.foreground,
        border: '1px solid black',
        background: cssVars.background,
        fontSize: 16
    }),
    { background: '', foreground: '' },
    (params: { foo: boolean }) => ({
        background: params.foo ? 'blue' : 'red',
        foreground: params.foo ? 'red' : 'blue'
    })
);

const Link3 = styleComponent$V2$(Link2)(
    'Link3',
    (theme, cssVars) => ({
        opacity: 0.5,
        borderWidth: cssVars.c,
        $nest: {
            '&:hover': {
                opacity: cssVars.d as any,
                background: theme.backgroundColor
            }
        }
    }),
    { c: '', d: '' },
    (params: { width: string; opacity: number }) => ({
        c: params.width,
        d: params.opacity
    })
);

const MyThemeSelector = styleComponent(ThemeSelector)('MyThemeSelector', {
    margin: '16px'
});

export class App extends React.Component {
    public state = { foo: false };

    public render() {
        return (
            <Root1 originalRef={this._originalRef}>
                <MyThemeSelector />
                <Link>First link</Link>
                <Link2
                    cssVars={{
                        foo: this.state.foo
                    }}
                >
                    Hello World!
                </Link2>
                <Link3
                    cssVars={{
                        foo: true,
                        width: '10px',
                        opacity: 1
                    }}
                >
                    Another link
                </Link3>
                <button
                    onClick={() => {
                        this.setState({ foo: true });
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
