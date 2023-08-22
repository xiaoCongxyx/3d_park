

import {CSS2DRenderer, CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import * as THREE from 'three'

export class Create2DTextLabel {
    constructor(_option) {
        this.scene = _option.scene
        this.position = new THREE.Vector3(_option.position[0], 4.001, _option.position[1])
        this.textContent = _option.textContent || '打点'
        this.textLabelClassName = _option.textLabelClassName
        this.createLabel()
    }

    createLabel() {
        const textDiv = document.createElement('div');
        textDiv.className = this.textLabelClassName;
        // void textDiv.offsetWidth; // 强制刷新样式
        textDiv.textContent = this.textContent;

        const textLabel = new CSS2DObject(textDiv);
        textLabel.position.copy(this.position);
        textLabel.center.set(0.3, 0.3);
        console.log(textLabel)
        this.scene.add(textLabel);
        textLabel.layers.set(0);
    }
}