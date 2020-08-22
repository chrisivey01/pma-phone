const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: "./src/app.js",
    // output: {
    //     path: path.resolve(__dirname, "../dist"),
    //     filename: "bundle.js",
    //     publicPath: "assets",
    // },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [path.resolve(__dirname, "node_modules")],
                loader: "babel-loader",
            },
            {
                test: /\.s[ac]ss$/i,
                use: ["style-loader", "css-loader", "sass-loader"],
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: ["file-loader"],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: ["file-loader"],
            },
        ],
    },
    performance: {
        hints: false,
        assetFilter: (assetFilename) =>
            !/(\.map$)|(^(main\.|favicon\.))/.test(assetFilename),
    },
};
