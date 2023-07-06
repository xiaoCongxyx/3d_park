export default function destroy(scene) {
    // if (this.timeIndex) {
    //     cancelAnimationFrame(this.timeIndex)
    // }
    // 遍历场景中的所有对象，调用dispose，防止内存泄漏
    const clearThree = obj => {
        while (obj.children.length > 0) {
            clearThree(obj.children[0])
            obj.remove(obj.children[0])
        }
        obj.geometry && obj.geometry.dispose()
        if (obj.material) {
            Object.keys(obj.material).forEach(prop => {
                if (obj.material[prop] && typeof (obj.material[prop].dispose) === 'function') {
                    obj.material[prop].dispose()
                } else {
                    obj.material.dispose()
                }
            })
        }
    }
    clearThree(scene)
    // this.isDestroy = true
    // this.scene.children.map(x => {
    //   x.geometry && x.geometry.dispose()
    //   x.material && x.material.dispose()
    // //   this.scene.remove(x)
    // //   x = undefined
    // })
    // this._option.container.innerHTML = ''
    // window.removeEventListener('click', this.onDocumentMouseMove, false)
}