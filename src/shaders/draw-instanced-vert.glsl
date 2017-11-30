#version 300 es

#define OFFSET_LOCATION 0
#define ROTATION_LOCATION 1
#define POSITION_LOCATION 2
#define COLOR_LOCATION 3

uniform mat4 u_projectionView;
uniform float u_time;

layout(location = OFFSET_LOCATION) in vec4 inOffset;
layout(location = ROTATION_LOCATION) in vec3 inRotation;
layout(location = POSITION_LOCATION) in vec3 inPos;
layout(location = COLOR_LOCATION) in vec4 inCol;

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
  vec3 dir = normalize(inRotation);
  vec3 up = vec3(0,1,0);

  float angle = dot(up, dir);
  vec3 axis = normalize(cross(up, dir));
  mat4 rotation = rotationMatrix(axis, -acos(angle));

	float dist = length(inRotation);
  float branchWidth = inOffset.w;
  //apply rotation * scaling
  vec4 pos = rotation * vec4(vec3(inPos.x*branchWidth,inPos.y*dist,inPos.z*branchWidth), 1.0);
  //apply offset
  pos = vec4(pos.xyz + inOffset.xyz, 1.0);
  gl_Position = u_projectionView * pos;

  out_col = inCol;
}