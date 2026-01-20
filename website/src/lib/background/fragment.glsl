precision mediump float;

#include noise3D.glsl

uniform float u_time;

vec4 color(float v) {
  float n = 1.0 - pow(abs(v), 0.2);
  return vec4(n * 0.6, n * 0.2, 0.0, 1.0);
}

float avg_noise(vec2 pos, float time) {
  return (snoise(vec3(pos, time)) + snoise(vec3(pos*1.8, time*0.7))) / 2.0;
}

void main() {
  float noise = avg_noise(gl_FragCoord.xy / 300.0, u_time / 20.0);
  gl_FragColor = color(noise);
}
