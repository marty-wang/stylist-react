import * as React from 'react';
import { themeConfigs, ThemeName, switchTheme, getStylist } from 'demo/themes/stylist';

const { styleDiv$V2$ } = getStylist('ThemeSelector');

const Root = styleDiv$V2$('Root', {
    display: 'flex',
    $nest: {
        '& > *': {
            marginRight: '8px'
        }
    }
});

export class ThemeSelector extends React.Component<{ className?: string }> {
    public render() {
        const options = Object.keys(themeConfigs).map((themeName: ThemeName) => (
            <option value={themeName} key={themeName}>
                {themeName}
            </option>
        ));

        return (
            <Root className={this.props.className}>
                <span>Switch theme:</span>
                <select onChange={this._onChange}>{options}</select>
            </Root>
        );
    }

    private _onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newThemeName = event.target.value as ThemeName;
        switchTheme(newThemeName);
    };
}
