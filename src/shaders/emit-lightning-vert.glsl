#version 300 es

precision highp float;

#define POSITION_LOCATION 0
#define COLOR_LOCATION 1
 
uniform float u_time;

layout(location = POSITION_LOCATION) in vec3 inPos;
layout(location = COLOR_LOCATION) in vec4 inCol;

out vec3 outPos;
out vec4 outCol;

void main()
{     
    outPos = inPos;
    float num = u_time;
    float modulo = 60.0;
    float div = num - (modulo * floor(num/modulo));
    outCol = vec4(inCol.xyz, inCol.a - 0.025);

    gl_Position = vec4(outPos, 1.0);
}

