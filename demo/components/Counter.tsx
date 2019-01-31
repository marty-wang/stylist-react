import * as React from "react";

export interface ICounterProps {
    count: number;
    onIncrease: () => void;
    onDecrease: () => void;
}

export class Counter extends React.Component<ICounterProps> {
    public render() {
        const { count, onIncrease, onDecrease } = this.props;
        return (
            <div>
                <div>The current count: {count}</div>
                <button onClick={onIncrease}>Increase</button>
                <button onClick={onDecrease}>Decrease</button>
            </div>
        );
    }
}
