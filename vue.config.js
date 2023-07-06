const path = require('path')
const resolve = (dir) => path.join(__dirname, dir)

const { name } = require('./src/utils/getPageTitle')
const devServer = require('./src/config/devServer')
const plugins = require('./src/config/plugins')
const chainConfig = require('./src/config/chainWebpackConfig')

module.exports = {
    // 项目公共路径
    publicPath: '/xiao_cong',
    // build输出目录名
    outputDir: 'dist',
    // build输出静态目录名
    assetsDir: 'static',
    productionSourceMap: false,
    runtimeCompiler: true,
    configureWebpack: {
        name,
        resolve: {
            alias: {
                '@': resolve('src')
            }
        },
        plugins: plugins
    },
    chainWebpack: chainConfig,
    devServer
}