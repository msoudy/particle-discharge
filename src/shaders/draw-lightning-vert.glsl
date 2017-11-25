#version 300 es

#define POSITION_LOCATION 0
#define COLOR_LOCATION 1

uniform mat4 u_projectionView;

layout(location = POSITION_LOCATION) in vec3 inPos;
layout(location = COLOR_LOCATION) in vec4 inCol;

out vec4 outCol;

void main()
{
    gl_Position = u_projectionView * vec4(inPos,1.0);
    outCol = inCol;
}