const { merge } = require("webpack-merge");
const common = require("./webpack.common");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const path = require("path");

module.exports = merge(common, {
    mode: "production",

    output: {
        filename: "index.js",
        path: path.resolve(
            "C:/FXServer/server-data/resources/8bit_phone/dist"
        )
        // path: path.join(__dirname, "../dist"),
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: "src/index.html",
        }),
        new CleanWebpackPlugin(),
        new CopyPlugin({
            patterns: [
                { from: "src/assets", to: "assets" },
                { from: "src/html", to: "html" },
            ],
        }),
    ],
    devtool: "inline-source-map",
});
