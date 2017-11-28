#version 300 es
 
precision mediump float;

#define TEXPOS_LOCATION 4
#define TEXCOORD_LOCATION 5

layout(location = TEXPOS_LOCATION) in vec2 inTexPos;

out vec2 v_texcoord;
  
void main() {
  v_texcoord = inTexPos * .5 + .5;
  gl_Position = vec4(inTexPos, 0.0, 1.0);
}