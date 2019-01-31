import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from 'src/components/App';

import './stylesheet.css';

const rootElement = document.getElementById('root');

ReactDOM.render(<App/>, rootElement);

// Hot Module Replacement APIs
if (module.hot) {
    module.hot.accept('./components/App', () => {
        const NextApp = require<{ App: typeof App }>('./components/App').App;
        ReactDOM.render(<NextApp/>, rootElement);
    });
}
