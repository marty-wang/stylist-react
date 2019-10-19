'use strict';

const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    devtool: 'source-map',

    resolve: {
        extensions: ['.webpack.js', '.web.js', '.ts', '.js'],
        modules: [path.resolve('.'), 'node_modules']
    },

    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader',
                exclude: path.resolve(__dirname, 'node_modules')
            },
            {
                enforce: 'pre',
                test: /\.tsx?$/,
                loader: 'tslint-loader',
                exclude: [path.resolve(__dirname, 'node_modules')],
                options: {
                    emitErrors: true,
                    failOnHint: true
                }
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    configFile: path.join(__dirname, './tsconfig.lib.json')
                },
                exclude: path.resolve(__dirname, 'node_modules')
            }
        ]
    },

    entry: './src/stylist.ts',

    optimization: {
        minimize: false
    },

    output: {
        path: path.join(__dirname, 'dist'),
        libraryTarget: 'commonjs',
        filename: 'stylist.js'
    },

    externals: {
        react: 'React',
        'react-dom': 'ReactDOM'
    },

    plugins: [
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false
        })
    ]
};
