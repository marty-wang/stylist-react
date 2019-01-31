# stylist
Theming first, fully static typed styled component library for React. 

## How to

1. Create your own stylist factory

```typescript
import { stylistFactory } from 'stylist-react';

/**
 * @param {string} namespace It allows multiple stylist factory.
 * @param {object} initialThemeConfig The configuration to build the initial theme. It can be empty if you are not yet ready for theming your app.
 * @param {function} buildThemeFunction It produces the actual theme for the given theme configuration
 * @returns {getStylist, setTheme} getStylist returns the stylist that can create styled components. setTheme can change themes.
 */
export const { getStylist, setTheme } = stylistFactory('MyNamespace', initialThemeConfig, buildThemeFunction);
```

2. Use getStylist to create style components. Keep in mind that stylist is always scoped to a component and is used to create styled sub-components to compose the aforementioned component

```typescript
// MyComponent.tsx

const { styleDiv } = getStylist('MyComponent');

const Root = styleDiv("Root", theme => ({
    height: "100vh",
    padding: "16px",
    background: theme.backgroundColor,
    color: theme.foregroundColor
}));

export class MyComponent extends React.Component {
    public render() {
      return (
          <Root>
          {this.props.children}
          </Root>
      );
    }
}
```

For details, Please take a look at the demo folder.
