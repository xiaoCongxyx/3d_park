import {Clock} from 'three';

const clock = new Clock();

class Loop {
    constructor() {
        this.updatables = [];
    }

    start(delta) {
        // this.renderer.setAnimationLoop(() => {
        // tell every animated object to tick forward one frame
        this.tick(delta);

        // render a frame
        //     this.renderer.render(this.scene, this.camera);
        // });
    }

    stop() {
        // this.renderer.setAnimationLoop(null);
    }

    tick(delta) {
        // only call the getDelta function once per frame!
        // const delta = clock.getDelta();

        // console.log(
        //   `The last frame rendered in ${delta * 1000} milliseconds`,
        // );

        for (const object of this.updatables) {
            object.tick(delta);
        }
    }
}

export {Loop};
