#version 300 es

precision highp float;

#define POSITION_LOCATION 0
#define OFFSET_LOCATION 1
#define VELOCITY_LOCATION 2
 
uniform float u_time;

layout(location = OFFSET_LOCATION) in vec3 a_off;
layout(location = VELOCITY_LOCATION) in vec3 a_vel;

out vec3 v_off;
out vec3 v_vel;

void main()
{     
	// float x = a_off.x + a_vel.x;
	// float y = a_off.y + a_vel.y;
	// float z = a_off.z + a_vel.z;

    v_vel = a_vel;

	// if (x <= -5.0 || x >= 5.0)
	// 	v_vel.x = -v_vel.x;
	// if (y <= -5.0 || y >= 5.0)
	// 	v_vel.y = -v_vel.y;
	// if (z <= -5.0 || z >= 5.0)
	// 	v_vel.z = -v_vel.z;

    v_off = a_off;// + v_vel;
    gl_Position = vec4(v_off, 1.0);
}

