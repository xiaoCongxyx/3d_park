const port = 3333;

const devServer = {
    port,
    open: true,
    overlay: {
        warnings: false,
        errors: true
    },
    // 添加开发服务器代理配置
    proxy: {
        '/local-api': {
            target: 'http://localhost:8082/issls-sls-web',
            changeOrigin: true,
            pathRewrite: {
                '^/local-api': ''
            }
        }
    },
    // 修复反向代理后热更新持续报错
    host: '0.0.0.0',
    disableHostCheck: true
}

module.exports = devServer