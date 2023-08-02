<template>
  <div id="cityPark" ref="cityPark">
    <canvas ref="baseCanvas"></canvas>
  </div>
</template>

<script>
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import cityParkVert from "@/assets/shader/cityPark/vertex.glsl"
import cityParkFrag from "@/assets/shader/cityPark/fragment.glsl"
import RunRing from "../../utils/RunRing";
import Wall from "../../utils/Wall";
import FlyLine from "../../utils/flyLine";


let scene,camera,renderer,tweakPane,controls;
export default {
  name: "index",
  components: {},
  data() {
    return {
      uniforms: {}
    }
  },
  mounted() {
    this.initThree()
    this.setControl()
    this.loadGLTF()
    this.render()
    this.createRunRing()
    this.createWall()
    this.createFlyLine()

    window.addEventListener('resize', () => {
      if (scene) {
        this.R(this.$refs.cityPark.clientWidth, this.$refs.cityPark.clientHeight, renderer, camera)
      }
    });
  },
  created() {
  },
  beforeDestroy() {
    this.D(scene)
    this.runRing.delete()
  },
  methods: {
    initThree() {
      scene = new this.THREE.Scene();
      let w = this.$refs.baseCanvas.clientWidth
      let h = this.$refs.baseCanvas.clientHeight

      camera = new this.THREE.PerspectiveCamera(60, w / h, 1, 10000)
      camera.position.set(-750, 600, 500)
      camera.lookAt(scene.position)

      scene.background = new this.THREE.CubeTextureLoader().setPath('static/textures/').load(['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'],); // 作为背景贴图


      // 创建渲染器对象
      renderer = new this.THREE.WebGLRenderer({ alpha: true,canvas: this.$refs.baseCanvas });
      renderer.setSize(w, h); // 设置渲染区域尺寸
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor('#000')

      //创建点光源和环境光源
      const point = new this.THREE.PointLight(0xffffff);
      point.position.set(60, 90, 60); // 点光源位置
      scene.add(point); // 点光源添加到场景中
      // 环境光
      const ambient = new this.THREE.AmbientLight(0x888888);
      scene.add(ambient);



    },
    // 绘制扩散圆效果
    createRunRing() {
      this.runRing = new RunRing({
        img: "clice.png",
        scene: scene,
        speed: 1,
        radius: 400,
        position: [
          [400, 20, 400],
          [100, 20, 1200],
        ],
      })
    },
    // 绘制扩散墙效果
    createWall() {
      const wallData = {
        position: {
          x: -150,
          y: 15,
          z: 100,
        },
        speed: 0.5,
        color: "#efad35",
        opacity: 0.6,
        radius: 420,
        height: 120,
        renderOrder: 5,
      };

      let wallMesh = new Wall(wallData);
      wallMesh.mesh.material.uniforms.time = this.uniforms.height;
      scene.add(wallMesh.mesh);
    },
    // 绘制飞线
    createFlyLine() {
      this.runline1 = new FlyLine({
        img: "/static/textures/z1.png",
        camera: camera,
        height: 140,
        v0: new this.THREE.Vector3(60, 18, -279),
        v1: new this.THREE.Vector3(-17.5, 111.5, -23),
        el: this.$refs.baseCanvas,
        scene: scene,
        speed: 1,
        lineWidth: 40,
        type: "run",
      });
      this.runline2 = new FlyLine({
        img: "/static/textures/z_112.png",
        camera: camera,
        height: 140,
        v0: new this.THREE.Vector3(-113, 44, 666),
        v1: new this.THREE.Vector3(-17.5, 111.5, -23),
        el: this.$refs.baseCanvas,
        scene: scene,
        speed: 1,
        lineWidth: 40,
        type: "run",
      });
      this.runline3 = new FlyLine({
        img: "/static/textures/z_11.png",
        camera: camera,
        height: 140,
        v0: new this.THREE.Vector3(-418, 113, -12),
        v1: new this.THREE.Vector3(-17.5, 111.5, -23),
        el: this.$refs.baseCanvas,
        scene: scene,
        speed: 1,
        lineWidth: 40,
        type: "run",
      });
      this.runline5 = new FlyLine({
        img: "/static/textures/n.png",
        camera: camera,
        height: 140,
        v0: new this.THREE.Vector3(614, 18, 130),
        v1: new this.THREE.Vector3(-17.5, 111.5, -23),
        el: this.$refs.baseCanvas,
        scene: scene,
        speed: 1,
        lineWidth: 40,
        type: "run",
      });
    },
    setControl() {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.update();
    },
    render() {
      this.uniforms['height'].value += 0.05;
      if (this.uniforms['height'].value > 150) {
        this.uniforms['height'].value = 0
      }
      renderer.render(scene, camera);
      controls.update();
      requestAnimationFrame(this.render);
    },
    loadGLTF() {
      this.uniforms = {
        height: {
          value: 1.0
        },
        uFlowColor: {
          value: new this.THREE.Color("#5588aa"),
        },
        uCityColor: {
          value: new this.THREE.Color("#1B3045"),
        },
      }

      const loader = new GLTFLoader().setPath('/static/models/');
      loader.load("shanghai.gltf", (gltf) => {
        gltf.scene.traverse(child => {
          if (child.isMesh) {
            const xyz = {
              x: child.position.x,
              y: child.position.y,
              z: child.position.z
            }
            if (["CITY_UNTRIANGULATED"].includes(child.name)) { // 建筑群
              // 设置建筑线材质
              this.setBuildLineMesh(child,xyz)
              // 设置面材质
              this.setBuildFaceMesh(child,xyz)


            } else if (['ROADS'].includes(child.name)) { // 道路
              const material = new this.THREE.MeshBasicMaterial({
                color: 'rgb(41,46,76)'
              })

              const mesh = new this.THREE.Mesh(child.geometry, material)
              mesh.rotateX(-Math.PI / 2);
              mesh.position.set(
                  xyz.x,
                  xyz.y,
                  xyz.z
              );
              scene.add(mesh);

            } else { // 地面
              const material = new this.THREE.MeshBasicMaterial({
                color: '#040912'
              })

              const mesh = new this.THREE.Mesh(child.geometry, material)
              mesh.rotateX(-Math.PI / 2);
              mesh.position.set(
                  xyz.x,
                  xyz.y,
                  xyz.z
              );
              scene.add(mesh);
            }
          }
        })
        // scene.add(gltf.scene);
      });
    },
    setBuildLineMesh(child,xyz) {
      const edges = new this.THREE.EdgesGeometry(child.geometry,1)
      const lineMaterial = new this.THREE.LineBasicMaterial({
        color: "rgba(38,133,254)"
      })

      const lines = new this.THREE.LineSegments( edges, lineMaterial );

      lines.position.set(
          xyz.x,
          xyz.y,
          xyz.z,
      )
      lines.rotateX(-Math.PI / 2)

      scene.add(lines)
    },
    setBuildFaceMesh(child,xyz) {
      const shader = new this.THREE.ShaderMaterial({
        //从程序穿到着色器里面的值，这里先不传值
        uniforms: this.uniforms,
        //顶点着色器
        vertexShader: cityParkVert,
        //片段着色器
        fragmentShader: cityParkFrag,
      });

      const material = new this.THREE.MeshPhysicalMaterial({
        color: 'rgb(50,170,255)',
        roughness: 0.1,
        shininess: 0.5,
        transmission: 0.9,
        transparent: true
      })

      const mesh = new this.THREE.Mesh(child.geometry, shader)
      scene.add(mesh)
      mesh.position.set(
          xyz.x,
          xyz.y,
          xyz.z
      )
      mesh.rotateX(-Math.PI / 2)
    },
  }
}
</script>

<style scoped lang="scss">
#cityPark {
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