#version 300 es

precision highp float;

#define OFFSET_LOCATION 0
#define ROTATION_LOCATION 1
 
uniform float u_time;

layout(location = OFFSET_LOCATION) in vec4 inOffset;
layout(location = ROTATION_LOCATION) in vec3 inRotation;

out vec4 outOffset;
out vec3 outRotation;

void main()
{     
    outOffset = inOffset;
    outRotation = inRotation;
    gl_Position = vec4(outOffset.xyz, 1.0);
}