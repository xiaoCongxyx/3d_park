import * as THREE from 'three'
import wallVert from "@/assets/shader/buildWall/vertex.glsl"
import wallFrag from "@/assets/shader/buildWall/fragment.glsl"
/**
 * 波动墙
 * @param  options.scene three场景
 * @param  options.radius 中心
 * @param  options.height 墙高度
 * @param  options.opacity 墙透明度
 * @param  options.color 墙颜色
 * @example
 */

export default class Wall {
    constructor(options) {
        this.radius = options.radius || 420;
        this.height = options.height || 120;
        this.opacity = options.opacity || 0.5;
        this.color = options.color || "#efad35";
        this.speed = options.speed || 0.5;
        this.mesh = ""; //生成的模型数据
        this.createMesh()
    }

    createMesh() {
        const { radius, height, opacity, color, speed, renderOrder } = this
        const geometry = new THREE.CylinderGeometry( radius, radius, height, 32,  1,true);
        const material = new THREE.ShaderMaterial( {
            uniforms: {
                u_height: {
                    value: height,
                },
                u_opacity: {
                    value: opacity,
                },
                u_color: {
                    value: new THREE.Color(color),
                },
                time: {
                    value: 0,
                },
            },
            transparent: true,
            depthTest: false,
            depthWrite: false,
            side: 2,
            vertexShader: wallVert,
            fragmentShader: wallFrag
        });
        const cylinder = new THREE.Mesh( geometry, material );
        //设置模型遮挡，把这个模型放到最前面防止遮挡
        cylinder.renderOrder = renderOrder || 1;
        this.mesh = cylinder;
    }
}