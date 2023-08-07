<template>
  <div id="chinaMap" ref="chinaMap">
    <canvas ref="baseCanvas"></canvas>
  </div>
</template>

<script>
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import * as D3 from 'd3'

const projection = D3.geoMercator().center([116.412318, 39.909843]).translate([0, 0])

let scene, camera, renderer, tweakPane, controls;

export default {
  name: "index",
  data() {
    return {}
  },
  watch: {},
  computed: {},
  methods: {
    initThree() {
      scene = new this.THREE.Scene();
      let w = this.$refs.baseCanvas.clientWidth
      let h = this.$refs.baseCanvas.clientHeight

      camera = new this.THREE.PerspectiveCamera(75, w / h, 1, 1000)
      camera.position.set(0, 20, 100)
      camera.lookAt(0, 0, 0)

      scene.background = new this.THREE.CubeTextureLoader().setPath('static/textures/').load(['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'],); // 作为背景贴图


      // 创建渲染器对象
      renderer = new this.THREE.WebGLRenderer({alpha: true, canvas: this.$refs.baseCanvas});
      renderer.setSize(w, h); // 设置渲染区域尺寸
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor('#000')

      let axes = new this.THREE.AxesHelper(700)
      scene.add(axes)

      //创建点光源和环境光源
      const point = new this.THREE.PointLight(0xffffff);
      point.position.set(60, 90, 60); // 点光源位置
      scene.add(point); // 点光源添加到场景中
      // 环境光
      const ambient = new this.THREE.AmbientLight(0x888888);
      scene.add(ambient);


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
    },
    loadChinaMap() {
      this.THREE.Cache.enabled = true;
      let fileLoader = new this.THREE.FileLoader().setPath('/static/models/')
      fileLoader.load('china_map.json',
          data => {
            const jsonData = JSON.parse(data)


            const map = new this.THREE.Object3D()
            this.operationData(jsonData, map)

          }
      )
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
        opacity: 0.5
      })
      return new this.THREE.Mesh(geometry, material)
    },
    // 解析数据
    operationData(jsonData, map) {
      // 全国信息
      const features = jsonData.features
      features.forEach((feature) => {
        // 单个省份
        const province = new this.THREE.Object3D()
        // 地址
        province.properties = feature.properties.name
        const coordinates = feature.geometry.coordinates
        const color = 'yellow'
        if (feature.geometry.type === 'MultiPolygon') {
          // 多个，多边形
          coordinates.forEach((coordinate) => {
            // coordinate 多边形数据
            coordinate.forEach((rows) => {
              // const mesh = this.drawExtrudeMesh(rows, color)
              // province.add(mesh)
              const mesh = this.drawExtrudeMesh(rows, color)
              const line = this.lineDraw(rows, color)
              province.add(line)
              province.add(mesh)
            })
          })
        }
        if (feature.geometry.type === 'Polygon') {
          // 多边形
          coordinates.forEach((coordinate) => {
            const mesh = this.drawExtrudeMesh(coordinate, color)
            const line = this.lineDraw(coordinate, color)
            province.add(line)
            province.add(mesh)
          })
        }
        map.add(province)
      })

      // const box = new this.THREE.Box3();
      // box.setFromCenterAndSize( new this.THREE.Vector3( 1, 1, 1 ), new this.THREE.Vector3( 2, 1, 3 ) );
      //
      // const helper = new this.THREE.Box3Helper( box, 0xffff00 );
      // scene.add( helper );

      const box = new this.THREE.BoxHelper(map, 0xffff00);
      scene.add(box);


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
      const lineMaterial = new this.THREE.LineBasicMaterial({color: color})
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