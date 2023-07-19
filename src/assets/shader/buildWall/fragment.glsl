uniform vec3 u_color;
uniform float u_opacity;

varying float v_opacity;

void main() {
    //u_color是颜色 v_opacity * u_opacity是高度所产生的透明效果和模型传入的透明度的乘积。
    gl_FragColor = vec4(u_color, v_opacity * u_opacity);
}