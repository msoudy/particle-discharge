#version 300 es

precision highp float;

in vec4 outCol;

out vec4 fragColor;

void main(void) {

  fragColor = vec4(outCol);
}