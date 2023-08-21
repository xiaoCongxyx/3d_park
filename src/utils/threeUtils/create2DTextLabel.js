

import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

export class Create2DTextLabel {
    constructor(_option) {
        this.scene = _option.scene
        this.position = _option.position
        this.textContent = _option.textContent
        this.textLabelClassName = _option.textLabelClassName
        this.createLabel()
    }

    createLabel() {
        const textDiv = document.createElement('div');
        textDiv.className = this.textLabelClassName;
        textDiv.textContent = this.textContent;

        const textLabel = new CSS2DObject(textDiv);
        textLabel.position.copy(this.position);
        textLabel.center.set(0, 1);
        this.scene.add(textLabel);
        textLabel.layers.set(0);
    }
}