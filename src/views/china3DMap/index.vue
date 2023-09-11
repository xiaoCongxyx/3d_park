<template>
  <div id="chinaMap" ref="chinaMap">
    <canvas ref="baseCanvas"></canvas>

    <OperatorPanel @start-finding-way="startFindingWayHandel"/>
  </div>
</template>

<script>
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {FXAAShader} from 'three/examples/jsm/shaders/FXAAShader.js';
import {CSS2DRenderer, CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import * as D3 from 'd3'

let _ = require('lodash');

import ObjLoopMoveAnimate from "../../utils/customerAnimateUtil/objLoopMoveAnimate";
import {Create2DTextLabel} from "../../utils/threeUtils/create2DTextLabel";

import dotMarkerVert from "@/assets/shader/mapDotMarker/vertex.glsl"
import dotMarkerFrag from "@/assets/shader/mapDotMarker/fragment.glsl"

// let dotMarkerUniforms = {
//   uDotColor: {value: '#fff'},
//   uTime: {value: 0},
//   uFrequency: {value: 0}
// }
let dotMarkerUniforms = []
let shaderI = 0

// 线shader材质
import lineVert from "@/assets/shader/flowingGlowLine/vertex.glsl"
import lineFrag from "@/assets/shader/flowingGlowLine/fragment.glsl"

import {Loop} from './modelUtils/Loop';
import {loadBirds} from './modelUtils/birds';

const projection = D3.geoMercator().center([116.412318, 39.909843]).translate([0, 0])

let scene, camera, renderer, tweakPane, controls, bloomComposer, finalComposer, raycaster, INTERSECTED, clock,
    objLoopMoveAnimate, labelRenderer, loop;
let oldTime = 0;

import OperatorPanel from './components/OperatorPanel'

export default {
  name: "index",
  data() {
    return {
      pointer: null,
      lineShaderUniforms: null
    }
  },
  watch: {},
  computed: {},
  components: {
    OperatorPanel
  },
  methods: {
    initThree() {
      scene = new this.THREE.Scene();
      clock = new this.THREE.Clock()
      let w = this.$refs.baseCanvas.clientWidth
      let h = this.$refs.baseCanvas.clientHeight

      camera = new this.THREE.PerspectiveCamera(75, w / h, 1, 1000)
      camera.position.set(0, 115, 40)
      camera.lookAt(0, 0, 0)

      scene.background = new this.THREE.CubeTextureLoader().setPath('static/textures/').load(['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'],); // 作为背景贴图


      // 创建渲染器对象
      renderer = new this.THREE.WebGLRenderer({alpha: true, antialias: true, canvas: this.$refs.baseCanvas});
      renderer.setSize(w, h); // 设置渲染区域尺寸
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor('#000')

      this.lineShaderUniforms = {
        uColor: {value: new this.THREE.Color('skyblue')}, // 设置流光颜色
        uCoefficient: {value: 1.0}, // 设置流光强度
        uTime: {value: 0.0} // 时间参数，控制流光的流动
      }

      labelRenderer = new CSS2DRenderer();
      labelRenderer.setSize(w, h);
      labelRenderer.domElement.style.position = 'absolute';
      // labelRenderer.domElement.style.top = '80px';
      labelRenderer.domElement.style.pointerEvents = 'none';
      labelRenderer.domElement.classList.add('city-marker-wraps');
      this.$refs.chinaMap.appendChild(labelRenderer.domElement);

      let axes = new this.THREE.AxesHelper(700)
      // scene.add(axes)

      //创建点光源和环境光源
      const point = new this.THREE.PointLight(0xffffff);
      point.position.set(60, 90, 60); // 点光源位置
      scene.add(point); // 点光源添加到场景中
      // 环境光
      const ambient = new this.THREE.AmbientLight(0x888888);
      scene.add(ambient);

      // 检测物体相交 归一化鼠标坐标
      raycaster = new this.THREE.Raycaster();
      this.pointer = new this.THREE.Vector2();
      this.$refs.chinaMap.addEventListener('click', this.onPointerMove)

      // 添加后期处理
      // const renderPass = new RenderPass(scene, camera);
      // const bloomPass = new UnrealBloomPass(
      //     new this.THREE.Vector2(
      //         renderer.domElement.offsetWidth,
      //         renderer.domElement.offsetHeight,
      //     ),
      //     1,
      //     1,
      //     0.1,
      // );
      // bloomPass.threshold = 0;
      // bloomPass.strength = 1.6;
      // bloomPass.radius = 0;
      // bloomComposer = new EffectComposer(renderer);
      // bloomComposer.renderToScreen = false;
      // bloomComposer.addPass(renderPass);
      // bloomComposer.addPass(bloomPass);
      // // 普通材质 自定义着色器
      // finalComposer = new EffectComposer(renderer);
      //
      // finalComposer.addPass(renderPass);


    },
    onPointerMove(event) {

      // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)

      this.pointer.x = (event.clientX / this.$refs.chinaMap.clientWidth) * 2 - 1;
      this.pointer.y = -((event.clientY - 80) / this.$refs.chinaMap.clientHeight) * 2 + 1;
      // console.log(this.pointer.x, this.pointer.y)
      this.checkMeshClick()
    },
    checkMeshClick() {
      // 检测物体相交
      // 通过摄像机和鼠标位置更新射线
      raycaster.setFromCamera(this.pointer, camera);

      // 计算物体和射线的焦点
      const intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 0) {
        // console.log(intersects)
        if (intersects[0].object.material.length > 0) {
          // 如果已经选中了一个物体，将其颜色恢复原样
          // console.log(INTERSECTED,intersects[0].object,INTERSECTED === intersects[0].object)
          if (INTERSECTED || INTERSECTED === intersects[0].object) {
            INTERSECTED.material[0].color.set('#1E293B');
          }
          if (INTERSECTED === intersects[0].object) {
            INTERSECTED.material[0].color.set('#1E293B');
            return false;
          }
          // 将当前选中的物体保存到变量中，并修改其颜色
          INTERSECTED = intersects[0].object;
          INTERSECTED.material[0].color.set('blue');
        }
      }
    },
    setControl() {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.update();
    },
    render() {
      let elapsedTime = clock.getElapsedTime();
      // 每一帧的时间
      let deltaTime = elapsedTime - oldTime;
      oldTime = elapsedTime;
      // let delta = clock.getDelta()

      // 物体循环自动移动
      if (objLoopMoveAnimate) {
        objLoopMoveAnimate.animate()
      }

      // dotMarkerUniforms.uTime.value = elapsedTime * 0.1;
      dotMarkerUniforms.forEach(v => {
        v.uTime.value = elapsedTime * 0.1;
      })

      // 线的uniforms
      this.lineShaderUniforms.uTime.value = elapsedTime * 0.001;

      labelRenderer.render(scene, camera);
      renderer.render(scene, camera);
      controls.update();
      requestAnimationFrame(this.render);

      this.TWEEN.update()

      if (loop) {
        loop.start(deltaTime)
      }

      // 2. 用 bloomComposer 产生辉光
      // bloomComposer.render();
      // 3. 将转成黑色材质的物体还原成初始材质
      // scene.traverse(restoreMaterial);
      // 4. 用 finalComposer 作最后渲染
      // finalComposer.render();
    },
    async setLoop() {
      loop = new Loop()
      const {parrot} = await loadBirds();

      loop.updatables.push(parrot);
      scene.add(parrot);
    },
    loadChinaMap() {
      this.THREE.Cache.enabled = true;
      let fileLoader = new this.THREE.FileLoader().setPath('/static/models/')
      fileLoader.load('china_map.json',
          data => {
            const jsonData = JSON.parse(data)


            const map = new this.THREE.Object3D()
            this.operationData(jsonData, map)
            console.log(jsonData)

            // 绘制高度曲线
            // let linePoint = [[115.857972, 28.682976], [110.001598, 27.569813]] // 南昌 --- 怀化
            let linePoint = [
              {
                city: '南昌',
                pos: [115.857972, 28.682976]
              }, {
                city: '西安',
                pos: [108.939645, 34.343207]
              },
            ] // 南昌 --- 西安
            this.drawHeightLine(linePoint, 10) // height没传就是绘制直线 离地高度为0


          }
      )
    },
    // 会之描边
    setMapBorder(e) {
      const province = new this.THREE.Object3D();

      e.features.forEach((item, index) => {
        let cod = item.geometry.coordinates[0];
        cod = cod.length > 1 ? [[...cod]] : cod;
        cod.forEach((polygon) => {
          const shape = new this.THREE.Shape();
          const lineGeometry = new this.THREE.BufferGeometry();
          const pointsArray = [];
          for (let i = 0; i < polygon.length; i++) {
            // projection -- 坐标转化
            let [x, y] = projection(polygon[i]);
            pointsArray.push(new this.THREE.Vector3(x, -y, 3));
            if (i === 0) {
              shape.moveTo(x, -y);
            }
            shape.lineTo(x, -y);
          }
          // 添加多个线
          lineGeometry.setFromPoints(pointsArray);
          const lineMaterial = new this.THREE.LineBasicMaterial({
            color: '#f59e0b',
          });
          // 创建线
          let lines = new this.THREE.Line(lineGeometry, lineMaterial);
          lines.rotation.x = -0.5 * Math.PI;
          lines.position.set(0, 0.2, 0);
          // 地图厚度
          lines.scale.set(1, 1, 1);
          lines.layers.enable(1);
          scene.add(lines);
        });
      });
      scene.add(province);
    },
    // 相机tween动画
    CameraAnimation() {
      let tweenA = this.cameraCon(
          {x: 89.67626699596627, y: 107.58058095557215, z: 51.374711690741705},
          {x: 89.67626699596627, y: 107.58058095557215, z: 51.374711690741705},
          3000,
      );
      let tweenB = this.cameraCon(
          {x: 89.67626699596627, y: 107.58058095557215, z: 51.374711690741705},
          {x: 31.366485208227502, y: 42.7325471436067, z: 26.484221462746017},
          8000,
      );
      let tweenC = this.cameraCon(
          {x: 31.366485208227502, y: 42.7325471436067, z: 26.484221462746017},
          {x: 32.19469382023058, y: 22.87664020700182, z: 27.742681212371384},
          10000,
      );

      tweenA.chain(tweenB);
      tweenB.chain(tweenC);
      tweenA.start();
    },
    cameraCon(
        p1 = {x: 0, y: 0, z: 0},
        p2 = {x: 30, y: 30, z: 30},
        time = 6000,
    ) {
      let tween1 = new this.TWEEN.Tween(p1)
          .to(p2, time || 200000)
          .easing(this.TWEEN.Easing.Quadratic.InOut);
      let update = () => {
        camera.position.set(p1.x, p1.y, p1.z);
      };
      tween1.onUpdate(update);
      return tween1;
    },
    // 光点柱
    dotBarLight(posStart, colors) {
      let frequency = ((Math.random() * 35) + 15).toFixed(0)

      dotMarkerUniforms.push({
        uColor: {value: colors},
        uTime: {value: 0},
        uFrequency: {value: frequency}
      })

      const [x0, y0, z0] = [...posStart, 5.2];
      this.AniRingGeometry([x0, y0], colors, frequency);
      let geometry = new this.THREE.ConeGeometry(0.25, 3.5, 5);
      let material1 = new this.THREE.MeshBasicMaterial({
        color: colors,
        transparent: true,
        opacity: 0.4,
      });
      let cylinder = new this.THREE.Mesh(geometry, material1);
      cylinder.position.set(x0, z0, y0);
      cylinder.layers.enable(1);
      scene.add(cylinder);
    },
    // 波动光圈
    AniRingGeometry(post, colors, frequency) {

      const [x0, y0, z0] = [...post, 4.001];
      const geometry2 = new this.THREE.RingGeometry(0, 0.80, 50);
      // transparent 设置 true 开启透明
      const material2 = new this.THREE.MeshBasicMaterial({
        color: colors,
        side: this.THREE.FrontSide,
        transparent: true,
      });
      const dotShaderMaterial = new this.THREE.ShaderMaterial({
        uniforms: dotMarkerUniforms[shaderI],
        vertexShader: dotMarkerVert,
        fragmentShader: dotMarkerFrag,
        transparent: true
      })
      const circleY = new this.THREE.Mesh(geometry2, dotShaderMaterial);
      // 绘制地图时 y轴取反 这里同步
      circleY.position.set(x0, z0, y0);
      circleY.scale.set(2, 2, 1);
      circleY.rotation.x = -0.5 * Math.PI;
      scene.add(circleY);
      console.log(frequency, shaderI)
    },


    /***
     * 立体几何图形*
     * @param polygon 多边形 点数组*
     * @param color 材质颜色
     * * */
    drawExtrudeMesh(polygon, color) {
      const shape = new this.THREE.Shape()

      polygon.forEach((row, i) => {
        const [x, y] = projection(row)
        if (i === 0) {
          shape.moveTo(x, -y)
        }
        shape.lineTo(x, -y)
      })// 拉伸
      const geometry = new this.THREE.ExtrudeGeometry(shape, {depth: 10, bevelEnabled: false})
      const material = new this.THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 1,
      })
      const material1 = new this.THREE.MeshBasicMaterial({
        color: '#6b7280',
        opacity: 1,
      })
      return new this.THREE.Mesh(geometry, [material, material1])
    },
    // 解析数据
    operationData(jsonData, map) {
      // 全国信息
      const features = jsonData.features
      // features.map(v => {
      //   let cod = v.geometry.coordinates[0];
      //   cod = cod.length > 1 ? [[...cod]] : cod;
      //   console.log(v)
      //   console.log(cod,'cod---')
      //
      // })
      features.map((feature) => {
        if (
            feature.properties.name === '广东省' ||
            feature.properties.name === '北京市' ||
            feature.properties.name === '上海市' ||
            feature.properties.name === '江苏省' ||
            feature.properties.name === '陕西省'
        ) {
          this.dotBarLight(
              projection(feature.properties.center),
              feature.properties.name === '北京市' ? '#008c8c' : 'yellow',
          );
          shaderI++;
        }

        // 单个省份
        const province = new this.THREE.Object3D()
        // 地址
        province.properties = feature.properties.name
        const coordinates = feature.geometry.coordinates
        const color = '#1E293B'
        // const color = ['重庆市', '上海市'].includes(feature.properties.name) ? 'blue' : '#1E293B'
        if (feature.geometry.type === 'MultiPolygon') {
          // 多个，多边形
          coordinates.forEach((coordinate) => {
            // coordinate 多边形数据
            coordinate.forEach((rows) => {
              const mesh = this.drawExtrudeMesh(rows, color)
              const line = this.lineDraw(rows, '#b45309')
              line.position.set(0, 0, 1.100001);
              province.add(line)
              province.add(mesh)
            })
          })
        }
        if (feature.geometry.type === 'Polygon') {
          // 多边形
          coordinates.forEach((coordinate) => {
            const mesh = this.drawExtrudeMesh(coordinate, color)
            const line = this.lineDraw(coordinate, '#b45309')
            line.position.set(0, 0, 1.100001);
            province.add(line)
            province.add(mesh)
          })
        }
        map.add(province)
      })
      map.rotation.x = -0.5 * Math.PI;
      map.position.set(0, 2, 0);
      map.scale.set(1, 1, 0.2)

      // const box = new this.THREE.Box3();
      // box.setFromCenterAndSize( new this.THREE.Vector3( 1, 1, 1 ), new this.THREE.Vector3( 2, 1, 3 ) );
      //
      // const helper = new this.THREE.Box3Helper( box, 0xffff00 );
      // scene.add( helper );

      const box = new this.THREE.BoxHelper(map, 0xffff00);
      // scene.add(box);


      scene.add(map)

    },
    /**
     * 边框 图形绘制*
     * @param polygon 多边形 点数组
     * @param color 材质颜色
     * */
    lineDraw(polygon, color) {
      const lineGeometry = new this.THREE.BufferGeometry()
      const pointsArray = new Array()
      polygon.forEach((row) => {
        const [x, y] = projection(row)
        // 创建三维点
        pointsArray.push(new this.THREE.Vector3(x, -y, 9))
      })
      // 放入多个点
      lineGeometry.setFromPoints(pointsArray)
      const lineMaterial = new this.THREE.LineBasicMaterial({color: color, linewidth: 3,})
      return new this.THREE.Line(lineGeometry, lineMaterial)
    },
    // 绘制离地高度曲线
    drawHeightLine(startAndEndP, height = 4.001) {
      let newStartAndEndP = []
      startAndEndP.forEach(v => {
        newStartAndEndP.push(projection(v.pos))
        new Create2DTextLabel({
          scene,
          position: projection(v.pos),
          textContent: v.city,
          textLabelClassName: 'city-marker',
        })
      })
      let startP = new this.THREE.Vector3(newStartAndEndP[0][0], 4.001, newStartAndEndP[0][1])
      let endP = new this.THREE.Vector3(newStartAndEndP[1][0], 4.001, newStartAndEndP[1][1])
      let controlP = new this.THREE.Vector3((startP.x + endP.x) / 2, height, (startP.z + endP.z) / 2)

      console.log(startP, endP, controlP, height)

      const curve = new this.THREE.QuadraticBezierCurve3(
          startP,
          controlP,
          endP
      );

      const points = curve.getPoints(50);
      const geometry = new this.THREE.BufferGeometry().setFromPoints(points);

      const material = new this.THREE.LineBasicMaterial({
        color: 0xff3850,
        linewidth: 1,
      });

      let lineShaderMaterial = new this.THREE.ShaderMaterial({
        uniforms: this.lineShaderUniforms,
        side: 2, // 仅渲染正面
        blending: this.THREE.AdditiveBlending, // 使用加法混合
        transparent: true, // 开启透明度
        depthTest: true,
        vertexShader: lineVert,
        fragmentShader: lineFrag
      })

      // Create the final object to add to the scene
      const curveObject = new this.THREE.Line(geometry, material);

      scene.add(curveObject)

      // 测试用物体
      let obj = new this.THREE.Mesh(
          new this.THREE.BoxGeometry(1, 1, 1, 8, 8, 8),
          new this.THREE.MeshBasicMaterial({color: 'red'})
      )
      scene.add(obj)

      objLoopMoveAnimate = new ObjLoopMoveAnimate({
        scene,
        useTime: 0.1,
        curveObj: curve,
        points,
        modelTurnAround: {
          modelTurnAngle: 0
        },
        modelTurnAroundStart: {
          modelTurnAngleStart: 0
        },
        moveModel: obj
      })
    },

    // 开始寻路
    startFindingWayHandel(theWay) {
      console.log(theWay, '开始寻路...')
      // this.drawHeightLine(theWay,8)
    }
  }
  ,
  created() {
  }
  ,
  mounted() {
    this.initThree()
    this.setControl()
    // 地图加载
    this.loadChinaMap()
    this.render()
    this.setLoop()
    // 相机运动动画
    // this.CameraAnimation()
    window.addEventListener('resize', () => {
      if (scene) {
        // this.R(this.$refs.chinaMap.clientWidth, this.$refs.chinaMap.clientHeight, renderer, camera)
        let w = this.$refs.chinaMap.clientWidth
        let h = this.$refs.chinaMap.clientHeight
        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        labelRenderer.setSize(w, h);
        renderer.setSize(w, h);
        // 像素比 保持2或1
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }
    });
  }
  ,
  beforeDestroy() {
    this.D(scene)
  }
}
</script>

<style lang="scss" scoped>
#chinaMap {
  display: flex;
  width: 100%;
  position: relative;
  height: calc(100% - 80px);
  overflow: hidden;


  canvas {
    //pointer-events: none;
    width: 100%;
    height: 100%;
  }
}

</style>
<style lang="scss">
.city-marker-wraps {

  .city-marker {
    color: #fff;
    font-size: 12px;
  }

}
</style>