import * as THREE from "three";
import { MeshLine, MeshLineMaterial } from "./THREE.MeshLine";
import { Geometry } from "three/examples/jsm/deprecated/Geometry";
THREE.Geometry = Geometry;
/**
 * 波纹散射图层
 * @param  options.img 照片地址
 * @param  options.lineWidth 线宽度
 * @param  options.side 贴图样式
 * @param  options.camera 相机
 * @param  options.height 高度
 * @param  options.v0 点一
 * @param  options.v1 点二
 * @param  options.speed 流动速度
 * @param  options.el 节目场景元素
 * @param  options.type 线类型分run和top
 * @param  options.maxheight 当类型为top时最高上升高度
 * @param  options.line 存储线
 * @param  options.thing 存储setInterval事件
 * @example
 */