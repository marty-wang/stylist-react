import * as React from "react";
import { Counter } from "src/components/Counter";

interface IAppState {
    count: number;
}

export class App extends React.Component<{}, IAppState> {
    public state: IAppState = { count: 0 };

    public render() {
        return (
            <div>
                <h1>Hello React!</h1>
                <Counter
                    count={this.state.count}
                    onDecrease={() => this._updateCount(-1)}
                    onIncrease={() => this._updateCount(1)}
                />
            </div>
        );
    }

    private _updateCount(by: number) {
        this.setState(prevState => {
            return { count: prevState.count + by };
        });
    }
}
