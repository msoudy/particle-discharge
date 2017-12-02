#version 300 es

#define POSITION_LOCATION 0
#define OFFSET_LOCATION 1
#define VELOCITY_LOCATION 2

uniform mat4 u_projectionView;

layout(location = POSITION_LOCATION) in vec3 a_pos;
layout(location = OFFSET_LOCATION) in vec3 a_off;
layout(location = VELOCITY_LOCATION) in vec3 a_vel;

out vec4 out_col;

void main()
{
	out_col = vec4(0,0,1,1);
    gl_Position = u_projectionView * vec4(a_pos + a_off,1.0);
}