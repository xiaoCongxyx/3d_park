import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

import {setupModel} from './setupModel.js';

async function loadBirds() {
    const loader = new GLTFLoader();

    // const [parrotData] = await Promise.all([
    //     loader.loadAsync('/static/models/Parrot.glb'),
    // ]);
    // const parrotData = await loader.loadAsync('/static/models/Parrot.glb')
    const parrotData = await loader.loadAsync('/static/models/Horse.glb')

    console.log(parrotData)
    const parrot = setupModel(parrotData);
    parrot.position.set(0, 8, 2.5);
    parrot.scale.set(0.02, 0.02, 0.02)


    return {
        parrot,
    };
}

export {loadBirds};
