#version 300 es

precision highp float;

#define OFFSET_LOCATION 0
#define ROTATION_LOCATION 1
#define COLOR_LOCATION 3
 
uniform float u_time;

layout(location = OFFSET_LOCATION) in vec4 inOffset;
layout(location = ROTATION_LOCATION) in vec3 inRotation;
layout(location = COLOR_LOCATION) in vec4 inColor;

out vec4 outOffset;
out vec3 outRotation;
out vec4 outColor;

void main()
{     
    outColor = inColor;
    //outColor = vec4(inColor.xyz, inColor.w - 0.025);
    outOffset = vec4(inOffset.xyz, inOffset.w - 0.025 * inOffset.w * 2.0);

    outRotation = inRotation;
    gl_Position = vec4(outOffset.xyz, 1.0);
}