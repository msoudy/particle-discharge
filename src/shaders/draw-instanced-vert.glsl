#version 300 es

#define OFFSET_LOCATION 0
#define ROTATION_LOCATION 1
#define POSITION_LOCATION 2
#define COLOR_LOCATION 3

uniform mat4 u_projectionView;

layout(location = OFFSET_LOCATION) in vec4 inOffset;
layout(location = ROTATION_LOCATION) in vec3 inRotation;
layout(location = POSITION_LOCATION) in vec3 inPos;
layout(location = COLOR_LOCATION) in vec3 inCol;

out vec3 out_col;

void main()
{
    //TODO: Create 3D rotation
    vec3 dir = normalize(inRotation);
    float angle = atan(dir.x,dir.y);
    mat4 rotation;
    rotation[0] = vec4(cos(angle),-sin(angle),0,0);
    rotation[1] = vec4(sin(angle),cos(angle),0,0);
    rotation[2] = vec4(0,0,1,0);
    rotation[3] = vec4(0,0,0,1);

	float dist = length(inRotation);
    float branchWidth = inOffset.w;
    //apply rotation * scaling
    vec4 pos = rotation * vec4(vec3(inPos.x*branchWidth,inPos.y*dist,inPos.z*branchWidth), 1.0);
    //apply offset
    pos = vec4(pos.xyz + inOffset.xyz, 1.0);
    gl_Position = u_projectionView * pos;
    out_col = inCol;
}