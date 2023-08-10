uniform vec3 uDotColor;
uniform float uTime;

varying vec3 vPosition;
varying vec2 vUv;

void main()
{
    vec3 distColor = uDotColor;
//    float strength = (vUv.x + uTime * 0.07) * (vUv.y + uTime * 0.055);
//    strength = step(strength, 0.1);
//    strength = clamp(0.4, fract(sin(strength * uTime)), 1.0);
//    distColor.r = sin(strength * uTime);
//    distColor.g = cos(strength * uTime);

    gl_FragColor = vec4(distColor, 0.9);
}