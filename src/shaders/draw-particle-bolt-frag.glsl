#version 300 es

precision highp float;

in vec4 v_col;

out vec4 fragColor;

void main(void) {


  fragColor = v_col;
}