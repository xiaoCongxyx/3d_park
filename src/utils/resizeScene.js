export default function (w,h,renderer,camera) {

    // 更新相机
    camera.aspect = w/h;
    camera.updateProjectionMatrix();

    renderer.setSize(w, h);
    // 像素比 保持2或1
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}