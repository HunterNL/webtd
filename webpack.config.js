var path = require("path");

module.exports = {
    mode: "development",
    entry: './src/index.ts',
    devtool: 'inline-source-map',
    module: {
    rules: [{
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
    }]
    },
    devServer: {
        contentBase: './bundle',
        overlay: true,
        host:"127.0.0.1",
        public: "127.0.0.1",
        disableHostCheck: true

    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'bundle/generated')
    }
};