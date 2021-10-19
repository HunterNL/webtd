var path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const copyplugin =  new CopyPlugin({
    patterns: [
        { from: "bundle/basecontent"}
    ]
})

module.exports = {
    mode: "development",
    entry: './src/index.ts',
    devtool: 'eval-source-map',
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }]
    },
    devServer: {
        static: {
            directory: path.join(__dirname,"bundle/generated/dev"),
            serveIndex: true,
            watch: false
        },
        host: "127.0.0.1",
        port: 8080

    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'bundle/generated/dev')
    },
    plugins: [copyplugin]
};