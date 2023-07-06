/**
 * @description 该函数用于批量导入 @/router/modules/* 文件目录下暴露的所有router.js文件，自动导入所有路由信息
 * @param ctx
 * @returns {*}
 */
export default function importAll(ctx = {}) {
    return (ctx.keys().map(item => ctx(item).default || [])).flat(2)
}
