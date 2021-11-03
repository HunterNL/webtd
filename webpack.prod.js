var path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const { DefinePlugin } = require("webpack");
const {settings,plugins} = require("./webpack.common");
const {CSSPlugin,editorHTML,gameHTML} = plugins

const envDefine = new DefinePlugin({
    __PRODUCTION__: "true"
})

module.exports = {...settings,
    mode: "production",
    devtool: "source-map",
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'bundle/generated/prod'),
    },
    plugins: [CSSPlugin,editorHTML,gameHTML,envDefine]
}
