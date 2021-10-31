var path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const { DefinePlugin } = require("webpack");

const copyplugin =  new CopyPlugin({
    patterns: [
        { from: "bundle/basecontent" },
    ]
})

const buildPlugin = new DefinePlugin({
    __PRODUCTION__: "true"
})

module.exports = {
    mode: "production",
    entry: './src/index.ts',
    devtool: "source-map",
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'bundle/generated/prod'),
    },
    plugins: [copyplugin,buildPlugin]
};