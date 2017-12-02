#version 300 es

#define POSITION_LOCATION 0
#define OFFSET_LOCATION 1
#define ROTATION_LOCATION 3
#define COLOR_LOCATION 4

uniform mat4 u_projectionView;

layout(location = POSITION_LOCATION) in vec3 a_pos;
layout(location = OFFSET_LOCATION) in vec3 a_off;
layout(location = ROTATION_LOCATION) in vec3 a_rot;
layout(location = COLOR_LOCATION) in vec3 a_col;

out vec4 out_col;

mat4 rotationMatrix(vec3 ax, float angle)
{
  ax = normalize(ax);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;

  return mat4(oc * ax.x * ax.x + c,        oc * ax.x * ax.y - ax.z * s, oc * ax.z * ax.x + ax.y * s, 0.0,
              oc * ax.x * ax.y + ax.z * s, oc * ax.y * ax.y + c,        oc * ax.y * ax.z - ax.x * s, 0.0,
              oc * ax.z * ax.x - ax.y * s, oc * ax.y * ax.z + ax.x * s, oc * ax.z * ax.z + c,        0.0,
              0.0,                         0.0,                         0.0,                         1.0);
}

void main()
{
  vec3 dir = normalize(a_rot);
  vec3 up = vec3(0,1,0);

  float angle = dot(up, dir);
  vec3 axis = normalize(cross(up, dir));
  mat4 rotation = rotationMatrix(axis, -acos(angle));

  float dist = length(a_rot);
  //apply rotation
  vec4 pos = rotation * vec4(vec3(a_pos.x*0.4,a_pos.y*dist,a_pos.z*0.4), 1.0);
  //apply offset
  pos = vec4(pos.xyz + a_off.xyz, 1.0);
  gl_Position = u_projectionView * pos;

  out_col = vec4(a_col, 1.0);
}