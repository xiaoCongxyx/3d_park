/*** 边框 图形绘制* @param polygon 多边形 点数组* @param color 材质颜色* */
function lineDraw(polygon, color) {
    const lineGeometry = new THREE.BufferGeometry()
    const pointsArray = new Array()
    polygon.forEach((row) => {
        const [x, y] = projection(row)
        // 创建三维点
        / pointsArray.push(new THREE.Vector3(x, -y, 9))
    })
// 放入多个点
    lineGeometry.setFromPoints(pointsArray)
    const lineMaterial = new THREE.LineBasicMaterial({color: color})
    return new THREE.Line(lineGeometry, lineMaterial)
}