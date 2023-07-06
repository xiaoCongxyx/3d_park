const name = '物流专区'

/**
 * @description 获取页面标题
 * @param pageTitle
 * @returns {string}
 */
function getPageTitle(pageTitle) {
    if (pageTitle) {
        return `${name} - ${pageTitle}`
    }
    return `${name}`
}

module.exports = {
    name,
    getPageTitle
}