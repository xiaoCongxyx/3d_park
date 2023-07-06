const CompressionWebpackPlugin = require('compression-webpack-plugin')
const MomentLocalePlugin = require('moment-locales-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')

const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i

const plugins = [
    new CompressionWebpackPlugin({
        filename: '[path].gz[query]',
        algorithm: 'gzip',
        test: productionGzipExtensions,
        threshold: 10240,
        minRatio: 0.8,
        deleteOriginalAssets: false // 是否删除原始文件
    }),
    new MomentLocalePlugin(),
    new LodashModuleReplacementPlugin()
]

module.exports = plugins