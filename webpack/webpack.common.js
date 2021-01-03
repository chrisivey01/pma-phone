const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const paths = require('./paths')

module.exports = {
    entry: [paths.src + '/app.js'],

    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            inject: true,
            template: "src/index.html",
        }),
    ],

    module: {
        rules: [

            {
                test: /\.(sa|sc|c)ss$/,
                use: ["style-loader", "css-loader", "sass-loader"],
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                use: "url-loader?limit=100000",
            },
        ],
    },
};
