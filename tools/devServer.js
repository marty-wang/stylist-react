"use strict";

const express = require("express");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackConfig = require("../webpack.config.js");

webpackConfig.mode = "development";

const app = express();
const compiler = webpack(webpackConfig);
const port = 9898;

app.use(
    webpackDevMiddleware(compiler, {
        noInfo: true,
        publicPath: webpackConfig.output.publicPath,
        stats: { colors: true }
    })
);

app.listen(port, function() {
    console.log(`==> Listening on port ${port}. Open up http://localhost:${port}/ in your browser.`);
});
