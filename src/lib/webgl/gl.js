/** Minimal WebGL2 helpers: one full-screen triangle pair + a shader program. */
export function createGL(canvas, opts = {}) {
  const gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: true, alpha: true, ...opts });
  if (!gl) throw new Error('WebGL2 unavailable');
  return gl;
}

export function program(gl, vsSrc, fsSrc) {
  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const p = gl.createProgram();
  gl.attachShader(p, sh(gl.VERTEX_SHADER, vsSrc));
  gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fsSrc));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const loc = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) {
    const { name } = gl.getActiveUniform(p, i);
    loc[name] = gl.getUniformLocation(p, name);
  }
  return { p, loc };
}

/** Binds a unit quad (-1..1) to attribute 0 and returns a draw() call. */
export function quad(gl) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  return { draw: () => { gl.bindVertexArray(vao); gl.drawArrays(gl.TRIANGLES, 0, 6); }, dispose: () => { gl.deleteBuffer(buf); gl.deleteVertexArray(vao); } };
}

export const hexToRgb = h => {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
};
