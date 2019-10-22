import { remove } from './utils';

type Callback = (...args: any[]) => void;

type Disposer = () => void;

export const getEventEmitter = () => {
    const table: Record<string, Callback[]> = {};

    const on = (eventName: string, callback: Callback): Disposer => {
        if (!table[eventName]) {
            table[eventName] = [];
        }

        table[eventName].push(callback);

        return () => {
            remove(table[eventName], cb => cb === callback);
        };
    };

    const emit = (eventName: string, ...args: any[]): void => {
        (table[eventName] || []).forEach(cb => {
            try {
                cb(...args);
            } catch (error) {
                console.error(error);
            }
        });
    };

    return {
        on,
        emit
    };
};
