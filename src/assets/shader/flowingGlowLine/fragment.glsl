uniform vec3 uColor;
uniform float uCoefficient;
uniform float uTime;// 时间参数用于控制流光的流动
varying vec2 vUv;

void main() {
    vec4 glowColor = vec4(uColor, 1.0);
    vec2 p = (vUv - 0.5) * 1.0;// 调整流光的强度和大小
    float intensity = uCoefficient / length(p);// 控制流光的强度

    float offset = sin(uTime * 10.0) * 0.5 + 0.5;// 流光的流动偏移量
    p.x += offset;// 控制流光的水平流动

    gl_FragColor = glowColor * intensity;
    //    gl_FragColor = vec4(uColor, 1.0);
}