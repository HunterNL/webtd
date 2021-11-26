const { DefinePlugin } = require("webpack");
var path = require("path");
const {settings,plugins} = require("./webpack.common");
const {CSSPlugin,editorHTML,gameHTML} = plugins

const envDefines = new DefinePlugin({
    __PRODUCTION__: "false"
})

module.exports = {...settings,
    mode: "development",
    devtool: 'source-map',
    devServer: {
        static: {
            directory: path.join(__dirname,"bundle/generated/dev"),
            serveIndex: true,
            watch: false
        },
        host: "127.0.0.1",
        port: 8080

    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'bundle/generated/dev')
    },
    plugins: [CSSPlugin,editorHTML,gameHTML,envDefines]
}