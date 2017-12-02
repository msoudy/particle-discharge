#version 300 es

precision highp float;

#define OFFSET_LOCATION 1
#define ROTATION_LOCATION 3
#define COLOR_LOCATION 4
 
uniform float u_time;

layout(location = OFFSET_LOCATION) in vec3 a_off;
layout(location = ROTATION_LOCATION) in vec3 a_rot;
layout(location = COLOR_LOCATION) in vec3 a_col;

out vec3 v_off;
out vec3 v_rot;
out vec3 v_col;

void main()
{     
    v_col = a_col;
    v_rot = a_rot;
    v_off = a_off;

    gl_Position = vec4(v_off, 1.0);
}

