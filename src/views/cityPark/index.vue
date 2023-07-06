<template>
  <div id="cityPark" ref="cityPark">
    <canvas ref="baseCanvas"></canvas>
  </div>
</template>

<script>
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

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
  },
  methods: {
    initThree() {
      scene = new this.THREE.Scene();
      let w = this.$refs.baseCanvas.clientWidth
      let h = this.$refs.baseCanvas.clientHeight

      camera = new this.THREE.PerspectiveCamera(60, w / h, 1, 10000)
      camera.position.set(-750, 600, 500)
      camera.lookAt(scene.position)

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
    setControl() {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.update();
    },
    render() {
      this.uniforms['height'].value += 0.05;
      if (this.uniforms['height'].value > 100) {
        this.uniforms['height'].value = 0
      }
      renderer.render(scene, camera);
      controls.update();
      requestAnimationFrame(this.render);
    },
    loadGLTF() {
      this.uniforms = {
        height: {
          value: 0
        },
        uFlowColor: {
          value: new this.THREE.Color("#5588aa"),
        },
        uCityColor: {
          value: new this.THREE.Color("#FFFFDC"),
        },
      }
      const shader = new this.THREE.ShaderMaterial({
        //从程序穿到着色器里面的值，这里先不传值
        uniforms: this.uniforms,
        //顶点着色器
        vertexShader: `
                varying vec3 vPosition;
                void main()
                {
                  vPosition = position;
                  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }`,
        //片段着色器
        fragmentShader: `
                  varying vec3 vPosition;
                  uniform float height;
                  // uniform float uStartTime;
                  // uniform vec3 uSize;
                  // uniform vec3 uFlow;
                  uniform vec3 uFlowColor;
                  uniform vec3 uCityColor;
                  void main()
                  {
                    vec3 distColor = uCityColor;
                    // 流动范围当前点z的高度加上流动线的高度
                    float topY = vPosition.z + 5.0;
                    if (height > vPosition.z && height < topY) {
                     // 颜色渐变
                      distColor = uFlowColor;
                    }
                    gl_FragColor = vec4(distColor,0.6);
                  }`,
      });

      const loader = new GLTFLoader().setPath('/static/models/');
      loader.load("shanghai.gltf", (gltf) => {
        gltf.scene.traverse(child => {
          console.log(child)
          if (child.isMesh) {
            const xyz = {
              x: child.position.x,
              y: child.position.y,
              z: child.position.z
            }
            if (["CITY_UNTRIANGULATED"].includes(child.name)) { // 建筑群
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

              // 设置面材质
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
    }
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