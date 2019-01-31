"use strict";

const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackNotifierPlugin = require("webpack-notifier");

module.exports = {
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
        modules: [path.resolve("."), "node_modules"]
    },

    module: {
        rules: [
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader",
                exclude: path.resolve(__dirname, "node_modules")
            },
            {
                enforce: "pre",
                test: /\.tsx?$/,
                loader: "tslint-loader",
                exclude: [path.resolve(__dirname, "node_modules")],
                options: {
                    emitErrors: true,
                    failOnHint: true
                }
            },
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: path.resolve(__dirname, "node_modules")
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            }
        ]
    },

    entry: { app: ["./demo/Index.tsx"] },

    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].[hash].js"
    },

    plugins: [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
            __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || "true"))
        }),
        new HtmlWebpackPlugin({
            template: "demo/index.html"
        }),
        new WebpackNotifierPlugin()
    ]
};
