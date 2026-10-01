import { createGL, program, quad } from './gl.js';

/**
 * Draws one rounded image "stage" inside a transparent full-size canvas.
 * - transition(): noise dissolve from the current texture to the next
 * - scroll velocity bends the plane; hover adds a ripple + RGB split
 * The stage rect (CSS px, viewport-relative) is supplied every frame.
 */
const vert = /* glsl */ `#version 300 es
layout(location = 0) in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const frag = /* glsl */ `#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 uRes;          // canvas px
uniform vec4 uRect;         // x, y (bottom-left), w, h in canvas px
uniform float uRadius;
uniform sampler2D uTexA, uTexB;
uniform vec2 uSizeA, uSizeB; // texture px
uniform float uProg;        // 0 → 1: A dissolves into B
uniform float uVel;         // -1..1 scroll velocity
uniform vec2 uMouse;        // canvas px
uniform float uHover;
uniform float uTime;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy)); vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1; i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0; vec3 h = abs(x) - 0.5; vec3 ox = floor(x + 0.5); vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g; g.x = a0.x * x0.x + h.x * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// object-fit: cover
vec2 cover(vec2 uv, vec2 box, vec2 tex) {
  float rb = box.x / box.y, rt = tex.x / tex.y;
  vec2 s = rb > rt ? vec2(1.0, rt / rb) : vec2(rb / rt, 1.0);
  return (uv - 0.5) * s + 0.5;
}

vec3 sampleRGB(sampler2D t, vec2 uv, vec2 shift) {
  return vec3(texture(t, uv + shift).r, texture(t, uv).g, texture(t, uv - shift).b);
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 half_ = uRect.zw * 0.5;
  vec2 c = uRect.xy + half_;
  vec2 q = fc - c;

  // scroll velocity bends the plane like a sheet of paper
  float nx = q.x / half_.x;
  q.y -= uVel * (1.0 - nx * nx) * uRect.w * 0.07;

  // rounded-rect mask
  vec2 b = half_ - uRadius;
  float sd = length(max(abs(q) - b, 0.0)) + min(max(abs(q).x - b.x, abs(q).y - b.y), 0.0) - uRadius;
  float mask = 1.0 - smoothstep(-1.0, 1.0, sd);
  if (mask <= 0.0) discard;

  vec2 uv = q / uRect.zw + 0.5;
  uv.y = 1.0 - uv.y;

  // hover: water ripple radiating from the pointer
  vec2 dm = (fc - uMouse) / uRect.w;
  float dist = length(dm);
  uv += normalize(dm + 1e-5) * sin(dist * 46.0 - uTime * 5.0) * exp(-dist * 7.0) * 0.006 * uHover;

  float split = 0.0025 * uHover + 0.012 * abs(uVel);
  vec2 shift = vec2(split, 0.0);

  // noise dissolve: A swells away, B settles in
  float n = snoise(uv * 2.6 + uTime * 0.05) * 0.5 + 0.5;
  float edge = uProg * 1.4 - 0.2;
  float t = smoothstep(n - 0.18, n + 0.18, edge);

  vec2 uvA = cover((uv - 0.5) / (1.0 + uProg * 0.12) + 0.5, uRect.zw, uSizeA);
  vec2 uvB = cover((uv - 0.5) / (1.15 - uProg * 0.15) + 0.5, uRect.zw, uSizeB);
  vec3 col = mix(sampleRGB(uTexA, uvA, shift), sampleRGB(uTexB, uvB, shift), t);

  // a thin bright seam rides the dissolve front
  float seam = smoothstep(0.08, 0.0, abs(n - edge)) * step(0.001, uProg) * step(uProg, 0.999);
  col += seam * 0.35;

  outColor = vec4(col * mask, mask);
}`;

export function createStage(canvas) {
  const gl = createGL(canvas, { alpha: true, premultipliedAlpha: true });
  const { p, loc } = program(gl, vert, frag);
  const q = quad(gl);
  gl.useProgram(p);
  gl.uniform1i(loc.uTexA, 0);
  gl.uniform1i(loc.uTexB, 1);
  gl.clearColor(0, 0, 0, 0);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cache = new Map();
  const empty = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, empty);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([18, 18, 18, 255]));

  /** Load (once) an image URL into a texture. Resolves to { tex, w, h }. */
  function load(url) {
    if (cache.has(url)) return cache.get(url);
    const pr = new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
        resolve({ tex, w: img.naturalWidth, h: img.naturalHeight });
      };
      img.onerror = reject;
      img.src = url;
    });
    cache.set(url, pr);
    return pr;
  }

  const s = {
    a: { tex: empty, w: 1, h: 1 }, b: { tex: empty, w: 1, h: 1 },
    prog: 0, vel: 0, hover: 0, time: 0, mouse: [-1e4, -1e4], rect: [0, 0, 0, 0], radius: 8,
  };

  function resize() {
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  /** rect: { x, y, w, h } in CSS px relative to the canvas' top-left */
  function render({ x, y, w, h }) {
    const H = canvas.height;
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (w < 2 || h < 2) return;
    gl.uniform2f(loc.uRes, canvas.width, H);
    gl.uniform4f(loc.uRect, x * dpr, H - (y + h) * dpr, w * dpr, h * dpr);
    gl.uniform1f(loc.uRadius, s.radius * dpr);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, s.a.tex);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, s.b.tex);
    gl.uniform2f(loc.uSizeA, s.a.w, s.a.h);
    gl.uniform2f(loc.uSizeB, s.b.w, s.b.h);
    gl.uniform1f(loc.uProg, s.prog);
    gl.uniform1f(loc.uVel, s.vel);
    gl.uniform2f(loc.uMouse, s.mouse[0] * dpr, H - s.mouse[1] * dpr);
    gl.uniform1f(loc.uHover, s.hover);
    gl.uniform1f(loc.uTime, s.time);
    q.draw();
  }

  function destroy() {
    for (const pr of cache.values()) pr.then(t => gl.deleteTexture(t.tex)).catch(() => {});
    gl.deleteTexture(empty);
    q.dispose(); gl.deleteProgram(p);
  }

  resize();
  return { state: s, load, render, resize, destroy };
}
