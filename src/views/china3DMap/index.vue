<template>
  <div id="chinaMap" ref="chinaMap">
    <canvas ref="baseCanvas"></canvas>
  </div>
</template>

<script>
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {FXAAShader} from 'three/examples/jsm/shaders/FXAAShader.js';
import * as D3 from 'd3'
let _ = require('lodash');

const projection = D3.geoMercator().center([116.412318, 39.909843]).translate([0, 0])

let scene, camera, renderer, tweakPane, controls, bloomComposer, finalComposer, raycaster, INTERSECTED;


export default {
  name: "index",
  data() {
    return {
      pointer: null
    }
  },
  watch: {},
  computed: {},
  methods: {
    initThree() {
      scene = new this.THREE.Scene();
      let w = this.$refs.baseCanvas.clientWidth
      let h = this.$refs.baseCanvas.clientHeight

      camera = new this.THREE.PerspectiveCamera(75, w / h, 1, 1000)
      camera.position.set(0, 150, 70)
      camera.lookAt(0, 0, 0)

      scene.background = new this.THREE.CubeTextureLoader().setPath('static/textures/').load(['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'],); // 作为背景贴图


      // 创建渲染器对象
      renderer = new this.THREE.WebGLRenderer({alpha: true, antialias: true, canvas: this.$refs.baseCanvas});
      renderer.setSize(w, h); // 设置渲染区域尺寸
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor('#000')

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
      // if (intersects[i].object.material.length > 0) {
      //
      // }
      // for ( let i = 0; i < intersects.length; i ++ ) {
      //
      //   if (intersects[i].object.material.length > 0) {
      //     intersects[i].object.material[0].color.set('blue')
      //   }
      //
      // }
      if (intersects.length > 0) {
        // console.log(intersects)
        if (intersects[0].object.material.length > 0) {
          // 如果已经选中了一个物体，将其颜色恢复原样
          // console.log(INTERSECTED,intersects[0].object,INTERSECTED === intersects[0].object)
          if (INTERSECTED||INTERSECTED === intersects[0].object) {
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
      renderer.render(scene, camera);
      controls.update();
      requestAnimationFrame(this.render);



      // 2. 用 bloomComposer 产生辉光
      // bloomComposer.render();
      // 3. 将转成黑色材质的物体还原成初始材质
      // scene.traverse(restoreMaterial);
      // 4. 用 finalComposer 作最后渲染
      // finalComposer.render();
    },
    loadChinaMap() {
      this.THREE.Cache.enabled = true;
      let fileLoader = new this.THREE.FileLoader().setPath('/static/models/')
      fileLoader.load('china_map.json',
          data => {
            const jsonData = JSON.parse(data)


            const map = new this.THREE.Object3D()
            this.operationData(jsonData, map)

            // this.setMapDom(jsonData)
            // this.setMapBorder(jsonData)

          }
      )
    },
    // 绘制地图
    setMapDom(e) {
      const color = '#008c8c';
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
            color: '#b45309',
          });
          // 创建线
          let lines = new this.THREE.Line(lineGeometry, lineMaterial);
          lines.rotation.x = -0.5 * Math.PI;
          lines.position.set(0, 2.5, 0);
          // 地图厚度
          lines.scale.set(1, 1, 0.3);
          // lines.layers.enable(1);
          scene.add(lines);

          const extrudeSettings = {
            depth: 4,
            bevelEnabled: false,
            bevelSegments: 1,
            bevelThickness: 0.2,
          };
          const geometry = new this.THREE.ExtrudeGeometry(shape, extrudeSettings);
          const material = new this.THREE.MeshBasicMaterial({
            color: `#1E293B`,
            transparent: true,
            opacity: 1,
          });
          const material1 = new this.THREE.MeshBasicMaterial({
            color: '#6b7280',
            opacity: 1,
          });
          const mesh = new this.THREE.Mesh(geometry, [material, material1]);
          mesh.position.set(0, 2, 0);
          // 地图厚度
          mesh.scale.set(1, 1, 0.3);
          // 给mesh开启阴影
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh._color = color;
          mesh.rotation.x = -0.5 * Math.PI;
          province.add(mesh);
        });
      });
      scene.add(province);
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
    // 几何体集合
    setTerritory() {
      // //-------------------- 圆柱1

      const geometry1a = new this.THREE.CylinderGeometry(29, 29, 1, 100, 1);
      // transparent 设置 true 开启透明
      const material1 = new this.THREE.MeshStandardMaterial({
        color: '#0F172A',
        transparent: false,
      });
      // 374151 1E293B
      // 使用分层渲染，不管用什么材质对象，都必须克隆 geometry1a.clone()
      const circleY1 = new this.THREE.Mesh(geometry1a.clone(), material1);
      // 绘制地图时 y轴取反 这里同步
      circleY1.position.set(0, 1, 0);
      circleY1.material.opacity = 1;
      circleY1.scale.set(1, 1, 1);
      circleY1.rotation.y = -0.5 * Math.PI;

      // //--------------- 圆环1

      const geometry4a = new this.THREE.RingGeometry(31, 31.5, 200);
      // transparent 设置 true 开启透明
      const material4 = new this.THREE.MeshStandardMaterial({
        side: this.THREE.DoubleSide,
        color: '#f40',
        transparent: true,
        opacity: 0.8,
      });
      const circleY4 = new this.THREE.Mesh(geometry4a.clone(), material4.clone());
      // 绘制地图时 y轴取反 这里同步
      circleY4.position.set(0, 0, -0.5);
      circleY4.scale.set(1, 1, 1);
      circleY4.scale.multiplyScalar(1.2);
      circleY4.rotation.x = -0.5 * Math.PI;
      circleY4.layers.enable(1);
      //半圆环
      const geometry5a = new this.THREE.RingGeometry(31.5, 32.7, 200, 0.6, 1, 3);
      // transparent 设置 true 开启透明
      const material5 = new this.THREE.MeshStandardMaterial({
        side: this.THREE.DoubleSide,
        color: '#f40',
        transparent: true,
        opacity: 0.8,
      });
      const circleY5 = new this.THREE.Mesh(geometry5a.clone(), material5.clone());
      // 绘制地图时 y轴取反 这里同步
      circleY5.position.set(0, 0, -0.5);
      circleY5.scale.set(1, 1, 1);
      circleY5.rotation.x = -0.5 * Math.PI;
      circleY5.layers.enable(1);
      //整圆
      const geometry5b = new this.THREE.RingGeometry(0, 28.5, 200);
      // transparent 设置 true 开启透明
      const material5a = new this.THREE.MeshStandardMaterial({
        side: this.THREE.DoubleSide,
        color: '#6b7280',
        transparent: true,
      });
      const circleY5a = new this.THREE.Mesh(geometry5b.clone(), material5a.clone());
      // 绘制地图时 y轴取反 这里同步
      circleY5a.position.set(0, 1.6, 0);
      circleY5a.scale.set(1, 1, 1);
      circleY5a.rotation.x = -0.5 * Math.PI;
      //圆环4
      const geometry5r = new this.THREE.RingGeometry(28, 29, 200);
      // transparent 设置 true 开启透明
      const material5r = new this.THREE.MeshStandardMaterial({
        side: this.THREE.DoubleSide,
        color: '#1E293B',
        transparent: true,
      });
      const circleY5r = new this.THREE.Mesh(geometry5r.clone(), material5r.clone());
      // 绘制地图时 y轴取反 这里同步
      circleY5r.position.set(0, 1.65, 0);
      circleY5r.scale.set(1, 1, 1);
      circleY5r.rotation.x = -0.5 * Math.PI;
      scene.add(circleY5r);
      scene.add(circleY5a);
      scene.add(circleY1);
      scene.add(this.ArcCurveGeometry());
      scene.add(circleY5);
      scene.add(circleY4);
      scene.add(this.rectShape());
    },
    // 多面圆环
    rectShape() {
      var geometry = new this.THREE.TorusGeometry(27, 0.3, 16, 100, 5);
      var material = new this.THREE.MeshBasicMaterial({color: '#64748B'});
      var torus = new this.THREE.Mesh(geometry, material);
      torus.position.set(0, 1.65, 0);
      torus.scale.set(1, 1, 1);
      torus.rotation.x = -0.5 * Math.PI;
      return torus;
    },
    // 椭圆
    ArcCurveGeometry() {
      var positions = [];
      var colors = [];
      // 椭圆
      const lineGeometry = new this.THREE.BufferGeometry();
      var curve = new this.THREE.EllipseCurve(
          0,
          0, // ax, aY
          30,
          30, // xRadius, yRadius
          0,
          2 * Math.PI, // aStartAngle, aEndAngle
          false, // aClockwise
          0, // aRotation
      );
      var points = curve.getPoints(100);
      lineGeometry.setAttribute(
          'position',
          new this.THREE.BufferAttribute(new Float32Array(positions), 3, true),
      );
      lineGeometry.setAttribute(
          'color',
          new this.THREE.BufferAttribute(new Float32Array(colors), 3, true),
      );

      lineGeometry.setFromPoints(points);
      var material = new this.THREE.LineDashedMaterial({
        color: '#64748B',
        scale: 1.1,
        dashSize: 10,
        gapSize: 10,
      });
      var ellipse = new this.THREE.Line(lineGeometry, material);
      ellipse.computeLineDistances();
      ellipse.rotation.x = -0.5 * Math.PI;
      ellipse.layers.enable(1);
      return ellipse;
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
      features.forEach((feature) => {
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
              line.position.set(0, 0, 2.1);
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
            line.position.set(0, 0, 2.1);
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
    }
  }
  ,
  created() {
  }
  ,
  mounted() {
    this.initThree()
    this.setControl()
    this.loadChinaMap()
    // this.setTerritory()
    this.render()
    window.addEventListener('resize', () => {
      if (scene) {
        this.R(this.$refs.chinaMap.clientWidth, this.$refs.chinaMap.clientHeight, renderer, camera)
      }
    });
  }
  ,
  beforeDestroy() {
  }
}
</script>

<style lang="scss" scoped>
#chinaMap {
  display: flex;
  width: 100%;
  height: calc(100% - 80px);
  overflow: hidden;

  canvas {
    width: 100%;
    height: 100%;
  }
}
</style>