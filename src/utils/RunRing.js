import * as THREE from "three"
/**
 * 波纹散射图层
 * @param  options.img 照片地址
 * @param  options.speed 流动速度
 * @param  options.scene three场景
 * @param  options.radius 圆的半径
 * @param  options.position 圆的位置
 * @param  options.meshRings 存储圆形数据
 * @example
 */

class RunRing {
    constructor(options) {
        console.log(options)
        this.img = options.img || '';
        this.speed = options.speed / 100 || 0.01;
        this.scene = options.scene;
        this.radius = options.radius || 100;
        this.position = options.position || [[0,0,0]]
        this.meshRings = [];
        this.createRing()
    }

    // 创建圆环物体
    createRing() {
        const textureLoader = new THREE.TextureLoader().setPath('/static/textures/');
        textureLoader.load(this.img,texture => {
            const ringGeometry = new THREE.RingGeometry(0, this.radius, 500)
            const ringMaterial = new THREE.MeshBasicMaterial({
                // color: 0xffffff,
                side: THREE.DoubleSide,
                depthTest: true,
                blending: THREE.AdditiveBlending,
                map: texture
            })

            this.position.forEach((pos,i) => {
                this.meshRing = new THREE.Mesh(ringGeometry, ringMaterial)
                this.meshRing.rotateX(Math.PI / 2)
                this.meshRing.scale.set(0.1,0.1,0.1)
                this.meshRing.position.set(...pos)
                this.meshRings.push(this.meshRing)
                this.scene.add(this.meshRings[i])
            })

        })

        this.thing = setInterval(() => {
            this.position.forEach((v,i) => {
                if (this.meshRings[i]) {
                    if (this.meshRings[i].scale.x < 1) {
                        this.meshRings[i].scale.set(
                            this.meshRings[i].scale.x + 0.01,
                            this.meshRings[i].scale.x + 0.01,
                            this.meshRings[i].scale.x + 0.01,
                        );
                    } else {
                        this.meshRings[i].scale.set(0.1, 0.1, 0.1);
                    }
                }
            })
        },50)

    }
    delete() {
        //删除scene中对应的模型
        for (let i = 0; i < this.position.length; i += 1) {
            if (this.meshRings[i]) {
                this.scene.remove(this.meshRings[i]);
            }
        }
        if (this.thing) {
            //清除render事件
            clearInterval(this.thing);
            this.thing = null;
        }
    }

}

export default RunRing;