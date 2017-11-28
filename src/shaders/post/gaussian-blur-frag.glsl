#version 300 es
 
precision mediump float;
precision highp sampler2D;

uniform sampler2D diffuse;
uniform sampler2D u_blur;

in vec2 v_texcoord;

out vec4 color;
 
void main() {
  color = min(texture(u_blur,  v_texcoord) + texture(diffuse, v_texcoord), 1.0);
}