#version 300 es

precision highp float;
precision highp sampler3D;

#define POSITION_LOCATION 0
#define VELOCITY_LOCATION 1
#define PROPERTY_LOCATION 3
#define COLOR_LOCATION 4

uniform mat4 u_projectionView;

layout(location = POSITION_LOCATION) in vec4 a_pos;
layout(location = VELOCITY_LOCATION) in vec3 a_vel;
layout(location = PROPERTY_LOCATION) in vec4 a_pro;
layout(location = COLOR_LOCATION) in vec4 a_col;

out vec4 v_col; 

void main()
{
  v_col = vec4(a_col.xyz, 1.0);

  gl_PointSize = a_col.w;
  gl_Position = u_projectionView * vec4(a_pos.xyz, 1.0);
}