import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'


export default class ObjLoopMoveAnimate {

    constructor(_option) {

        this.option = _option
        console.log(this.option, 'FPSAnimate');


        // 场景
        this.scene = this.option.scene;

        // 需要运动的模型
        this.moveModel = this.option.moveModel;


        // 走完需要的时间
        this.useTime = this.option.useTime;
        this.curveObj = this.option.curveObj
        this.points = this.option.points

        this.startPoint = this.points[0]
        this.endPoint = this.points[this.points.length - 1]

        this.modelTurnAround = this.option.modelTurnAround || {
            modelTurnAngle: 0,
        }
        this.modelTurnAngle = this.modelTurnAround.modelTurnAngle


        this.modelTurnAroundStart = this.option.modelTurnAroundStart || {
            modelTurnAngleStart: 0,
        }
        this.modelTurnAngleStart = this.modelTurnAroundStart.modelTurnAngleStart


        this.curveTension = this.option.tension || 0.1
        this.turnAroundOffset = this.option.turnAroundOffset || 0.5;

        this.turnModelAngle = this.option.turnModelAngle || false;

        this.clock = new THREE.Clock()


    }


    changeLookAtFn(t) {

        // 当前点在线条上的位置
        this.play(t)
    }

    play(t) {
        // console.log(t)
        if (this.moveModel.position.distanceTo(this.endPoint) < 0.5) {
            // this.moveModel.position.copy(this.startPoint)
            new TWEEN.Tween(this.moveModel.position)
                .to({x: this.startPoint.x, y: this.startPoint.y, z: this.startPoint.z}, 500)
                .easing(TWEEN.Easing.Linear.None)
                .onComplete(() => {
                    // 动画完成后的回调函数
                })
                .start();
            // // this.play(t-0.03)
            // const position = this.curveObj.getPointAt(t-0.03);
        } else {
            const position = this.curveObj.getPointAt(t);
            // const cameraPosition = this.cameraCurve.getPointAt(t);
            let nPos = new THREE.Vector3(position.x, position.y, position.z);
            // nPos.y -= 4; // 控制模型离地距离
            this.moveModel.position.copy(nPos);
            // 返回点t在曲线上位置切线向量
            const tangent = this.curveObj.getTangentAt(t);
            // 位置向量和切线向量相加即为所需朝向的点向量
            const lookAtVec = tangent.add(new THREE.Vector3(position.x, position.y, position.z));
            this.moveModel.lookAt(lookAtVec);
        }

    }

    // 判断一个数是否在某个区间内
    showNum(n, qu) {
        let a = `${qu - this.turnAroundOffset}~${qu + this.turnAroundOffset}`;
        let b = a.replace('~', ',');
        let c = b.split(',');
        let d = Number(c[0])
        let m = Number(c[1])
        return (!isNaN(n) && n > d && n < m);
    }

    animate() {
        if (this.curveObj) {
            let t1 = this.clock.getElapsedTime() * this.useTime; // 计算当前时间进度百分比
            let t2 = this.clock.getElapsedTime() * 0.085; // 计算当前时间进度百分比
            // 开始移动关闭控制器
            this.changeLookAtFn(t1);
            if (t1 > 1) {
                this.clock.start();
            }

            // }
        }
    }

}