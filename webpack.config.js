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
        contentBase: './bundle/generated/dev',
        overlay: true,
        host: "127.0.0.1",
        public: "127.0.0.1",
        disableHostCheck: true,
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