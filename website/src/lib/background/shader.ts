// code adapted from https://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html

import vertexShaderSource from "./vertex.glsl";
import fragmentShaderSource from "./fragment.glsl";

function createShader(
  gl: WebGL2RenderingContext,
  type: GLenum,
  source: string,
) {
  const shader = gl.createShader(type);
  if (shader === null) {
    gl.deleteShader(shader);
    throw new Error("Error creating shader");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader;
  } else {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error("Error creating shader: " + log);
  }
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return program;
  } else {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error("Error creating program: " + log);
  }
}

export class ShaderInstance {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;

  loadTime: Date;
  timeLocation: WebGLUniformLocation;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2");
    if (gl === null) {
      throw new Error("WebGL not supported!");
    }
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource,
    );
    const program = createProgram(gl, vertexShader, fragmentShader);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.useProgram(program);

    const attributeLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(attributeLocation);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(attributeLocation, 2, gl.FLOAT, false, 0, 0);
    const positions = [-1, -1, 3, -1, -1, 3];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    this.gl = gl;
    this.program = program;
    const timeLocation = gl.getUniformLocation(program, "u_time");
    if (timeLocation === null) {
      throw new Error("Could not get location of u_time");
    }
    this.timeLocation = timeLocation;
    this.loadTime = new Date();
    this.draw();
  }

  draw() {
    const gl = this.gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const dt = (new Date().getTime() - this.loadTime.getTime()) / 1000; // in seconds
    gl.uniform1f(this.timeLocation, dt);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(() => {
      this.draw();
    });
  }
}
