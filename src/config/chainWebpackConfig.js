const path = require('path')
const resolve = (dir) => path.join(__dirname, dir)

function chainWebpackConfig(config) {
    // it can improve the speed of the first screen, it is recommended to turn on preload
    config.plugin('preload').tap(() => [
        {
            rel: 'preload',
            // to ignore runtime.js
            // https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-service/lib/config/app.js#L171
            fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
            include: 'initial'
        }
    ])

    // when there are many pages, it will cause too many meaningless requests
    config.plugins.delete('prefetch')

    // 修复HMR
    config.resolve.symlinks(true)

    // splitChunks分包
    config
        .optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
            // element-ui分包
            // elementUI: {
            //     name: 'chunk-elementUI', // split elementUI into a single package
            //     priority: 40, // the weight needs to be larger than libs and app or it will be packaged into libs or app
            //     test: /[\\/]node_modules[\\/]_?element-ui(.*)/, // in order-query to adapt to cnpm
            //     enforce: true
            // },
            // three
            // three: {
            //     name: 'chunk-three',
            //     priority: 20,
            //     test: /[\\/]node_modules[\\/]_?@ouyeel[\\/]three(.*)/,
            //     enforce: true
            // },
            // libs: {
            //     name: 'chunk-libs',
            //     test: /[\\/]node_modules[\\/]/,
            //     priority: 10,
            //     chunks: 'initial' // only package third parties that are initially dependent
            // },
            // commons: {
            //     name: 'chunk-commons',
            //     test: resolve('src/components'), // can customize your rules
            //     minChunks: 3, //  minimum common number
            //     priority: 5,
            //     reuseExistingChunk: true
            // }
        }
    })

    // https:// webpack.js.org/configuration/optimization/#optimizationruntimechunk
    config.optimization.runtimeChunk('single')

    // 引入statics的外部cdn [ vue(2.6.10) element-ui(2.15.8) echarts(statics版本太低，弃用) tinymce(5.10.5) ]
    // config.set('externals', {
    //     vue: 'Vue',
    //     'element-ui': 'ELEMENT',
    //     'tinymce/tinymce': 'tinymce'
    //     // 'echarts': 'echarts'
    // })

}

module.exports = chainWebpackConfig