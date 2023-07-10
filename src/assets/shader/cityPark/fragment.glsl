
varying vec3 vPosition;
uniform float height;
// uniform float uStartTime;
// uniform vec3 uSize;
// uniform vec3 uFlow;
uniform vec3 uFlowColor;
uniform vec3 uCityColor;

void main()
{
    vec3 distColor = uCityColor;
    // 流动范围当前点z的高度加上流动线的高度
    float topY = vPosition.z + 5.0;

    if(height>vPosition.z&&height<topY){
        // 颜色渐变
        float dIndex = sin((height - vPosition.z) / 10.0 * 3.14);
        distColor = mix(uFlowColor, distColor, 1.0-dIndex);

    }

    vec2 originPos2D = vec2(vPosition.x,vPosition.y);
    float len = distance(originPos2D, vec2(0,0));

    if (len > height * 50.0 && len < height * 50.0 + 130.0) {
        float strength = sin((len - height * 50.0) / 130.0 * 3.14);
        // 颜色渐变
        distColor = mix(uFlowColor,distColor,strength);
    }
    gl_FragColor = vec4(distColor,0.6);
}