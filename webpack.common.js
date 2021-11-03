const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require("copy-webpack-plugin");
var path = require("path");



const gameHTML = new HtmlWebpackPlugin({
    chunks: ["game"],
    template: "./bundle/basecontent/index.html",
    filename: "index.html",
    inject: false
})

const editorHTML = new HtmlWebpackPlugin({
    chunks: ["editor"],
    template: "./bundle/basecontent/editor.html",
    filename: "editor.html",
    inject: false
})

const CSSPlugin =  new CopyPlugin({
    patterns: [
        { from: "bundle/css" },
    ]
})

module.exports = {
    settings: {
        mode: "development",
        entry: {
            game: './src/game.ts',
            editor: './src/editor.ts'
        },
        module: {
            rules: [{
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }]
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js']
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'bundle/generated/dev')
        }
    },
    plugins: {
        gameHTML,editorHTML, CSSPlugin
    }
};