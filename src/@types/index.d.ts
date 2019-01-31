interface NodeRequire {
    <T>(path: string): T;
}

interface NodeModule {
    hot: any;
}

declare var module: NodeModule;
declare var require: NodeRequire;
declare var __DEV__: boolean;
