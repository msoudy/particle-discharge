#version 300 es

#define POSITION_LOCATION 0
#define OFFSET_LOCATION 2

uniform mat4 u_projectionView;

layout(location = POSITION_LOCATION) in vec3 a_pos;
layout(location = OFFSET_LOCATION) in vec3 a_off;

out vec4 out_col;

void main()
{
	//out_col = vec4(0.0/255.0,191.0/255.0,255.0/255.0,1);
	out_col = vec4(0,0,0,1);
	gl_PointSize = 2.0;
    gl_Position = u_projectionView * vec4(a_pos * 0.1 + a_off,1.0);
}