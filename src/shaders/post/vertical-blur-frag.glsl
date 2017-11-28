#version 300 es
 
precision mediump float;
precision highp sampler2D;

uniform sampler2D diffuse;

in vec2 v_texcoord;

out vec4 color;

const vec3 blur_color = vec3(0,0,1.3);

float gaussian(float x, float dev) {
  return (1.0 / sqrt(6.2831853071795864769 * dev)) * exp(-((x * x) / (2.0 * dev)));
}
 
void main() {
  vec4 col = vec4(0.0);
  vec2 size = vec2(textureSize(diffuse, 0));
  vec2 u_texel_size = vec2(1.0/size.x,1.0/size.y);

  float amount = 10.0;
  float deviation = amount * 0.35;
  deviation *= deviation;

  for (float i = 0.0; i < 10.0; i += 1.0) {
    float offset = i - amount;
    color += texture(diffuse, v_texcoord + vec2(0.0, offset * u_texel_size.y * 5.0))
                   * gaussian(offset * 0.9, deviation);
  }

  col = clamp(color * vec4(blur_color,1), 0.0, 1.0);
  color = vec4(col.xyz,1.0);
}