uniform vec3 uDotColor;
uniform float uTime;
uniform float uFrequency;

varying vec3 vPosition;
varying vec2 vUv;

//void main()
//{
//    vec3 distColor = uDotColor;
////    float strength = (vUv.x + uTime * 0.07) * (vUv.y + uTime * 0.055);
////    strength = step(strength, 0.1);
////    strength = clamp(0.4, fract(sin(strength * uTime)), 1.0);
////    distColor.r = sin(strength * uTime);
////    distColor.g = cos(strength * uTime);
//
//    gl_FragColor = vec4(distColor, 0.3);
//}

// effect1

//float hexLength(vec2 v) {
//    vec2 a = abs(v);
//    return max((2.0/sqrt(3.0))*a.x, (1.0/sqrt(3.0))*a.x + a.y);
//}

//void main(void) {
//    vec3 c;
//    float l,z=uTime * 2.0;
//    for(int i=0;i<3;i++) {
//        vec2 uv,p=vUv;
//        uv=p;
//        p-=.5;
////        p.x*=iResolution.x/iResolution.y;
//        z+=.07;
//        l=hexLength(p);
//        uv+=p/l*(sin(z)+1.)*abs(sin(l*9.-z*2.));
//        c[i]=.01/hexLength(abs(mod(uv,1.)-.5));
//    }
//    gl_FragColor=vec4(c/l,uTime);
//}

// effect2

//uniform float iTime;
const float PI = 3.14159265359;


float random(float p){
    return fract(sin(p) * 10000.0);
}

float noise(vec2 p){
    float t = uTime / 2000.0;
    if(t > 1.0) t -= floor(t);
    return random(p.x * 14. + p.y * sin(t) * 0.5);
}

vec2 sw(vec2 p){
    return vec2(floor(p.x), floor(p.y));
}

vec2 se(vec2 p){
    return vec2(ceil(p.x), floor(p.y));
}

vec2 nw(vec2 p){
    return vec2(floor(p.x), ceil(p.y));
}

vec2 ne(vec2 p){
    return vec2(ceil(p.x), ceil(p.y));
}

float smoothNoise(vec2 p){
    vec2 inter = smoothstep(0.0, 1.0, fract(p));
    float s = mix(noise(sw(p)), noise(se(p)), inter.x);
    float n = mix(noise(nw(p)), noise(ne(p)), inter.x);
    return mix(s, n, inter.y);
}

mat2 rotate (in float theta){
    float c = cos(theta);
    float s = sin(theta);
    return mat2(c, -s, s, c);
}

float circ(vec2 p){
    float r = length(p);
    r = log(sqrt(r));
    return abs(mod(4.0 * r, PI * 2.0) - PI) * 3.0 + 0.2;
}

float fbm(in vec2 p){
    float z = 2.0;
    float rz = 0.0;
    vec2 bp = p;
    for(float i = 1.0; i < 6.0; i++){
        rz += abs((smoothNoise(p) - 0.5)* 2.0) / z;
        z *= 2.0;
        p *= 2.0;
    }
    return rz;
}
float distanceTo(vec2 src, vec2 dst) {
    float dx = src.x - dst.x;
    float dy = src.y - dst.y;
    float dv = dx * dx + dy * dy;
    return sqrt(dv);
}
//varying vec2 vUv;
//uniform vec2 iResolution;
void main() {
    float len = distanceTo(vec2(0.5, 0.5), vec2(vUv.x, vUv.y)) * 2.0;

    vec2 p = vUv - 0.5;
//    p.x *= iResolution.x / iResolution.y;
    p *= 8.0;
    float rz = fbm(p);
    p /= exp(mod(uTime * uFrequency, PI));
    rz *= pow(abs(0.1 - circ(p)), 0.9);
    vec3 col = vec3(0.2, 0.1, 0.643);

    gl_FragColor = vec4(col / rz,  1.0 - pow(len, 3.0))  ;

}