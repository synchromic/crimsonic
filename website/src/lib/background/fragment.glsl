precision mediump float;

#include noise3D.glsl

vec4 color(float v) {
  float n = 1.0 - pow(abs(v), 0.2);
  return vec4(n * 0.6, n * 0.2, 0.0, 1.0);
}

void main() {
  float noise = snoise(vec3(gl_FragCoord.xy / 300.0, 0.0));
  gl_FragColor = color(noise);
}
