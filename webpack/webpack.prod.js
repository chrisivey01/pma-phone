const { merge } = require("webpack-merge");
const common = require("./webpack.common");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = merge(common, {
    mode: "production",
    output: {
        filename: "[name].js",
        path: path.resolve("C:/FXServer/server-data/resources/8bit_phone/dist"),
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "src/assets", to: "assets" },
                { from: "src/html", to: "html" },
            ],
        }),
    ],
    optimization: {
        minimize: true,
        // Once your build outputs multiple chunks, this option will ensure they share the webpack runtime
        // instead of having their own. This also helps with long-term caching, since the chunks will only
        // change when actual code changes, not the webpack runtime.
        runtimeChunk: {
            name: "runtime",
        },
    },
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
    },
    devtool: "eval-source-map",
});
