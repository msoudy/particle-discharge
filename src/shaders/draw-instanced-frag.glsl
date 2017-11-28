#version 300 es

precision highp float;

in vec4 out_col;

out vec4 fragColor;

void main(void) {
    fragColor = out_col;
}