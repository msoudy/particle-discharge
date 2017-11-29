#version 300 es

#define POSITION_LOCATION 0

uniform mat4 u_projectionView;

layout(location = POSITION_LOCATION) in vec3 inPos;

void main()
{
    gl_Position = u_projectionView * vec4(inPos,1.0);
}