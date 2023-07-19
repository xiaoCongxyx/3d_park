uniform vec3 u_color;
uniform float time;
uniform float u_height;

varying float v_opacity;
void main()
{
    //模型点位置乘以一个0.0-1.0的系数，来模拟扩散效果。
    vec3 vPosition = position * mod(time/15.0, 1.0);
    //模型的透明度和模型的高度呈反比
    v_opacity =1.0- position.y / u_height;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
}