import { createGL, program, quad, hexToRgb } from './gl.js';

/**
 * Animated topographic contour field. Lines flow slowly with noise and
 * swell around the pointer, glowing toward the accent colour near it.
 * Returns a destroy() function. Throws if WebGL is unavailable.
 */
const frag = /* glsl */ `#version 300 es
  precision highp float;
  out vec4 outColor;
  uniform vec2  uRes;
  uniform float uTime;
  uniform vec2  uMouse;      // px, origin bottom-left
  uniform float uHover;      // 0..1, eased presence of the pointer
  uniform vec3  uBg;
  uniform vec3  uLine;
  uniform vec3  uAccent;

  // 2D simplex noise (Ashima / Stefan Gustavson, MIT)
  vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float field(vec2 p, float t) {
    float n = snoise(p * 1.1 + vec2(t * 0.05, -t * 0.03)) * 0.6;
    n += snoise(p * 2.3 - vec2(t * 0.04, t * 0.06)) * 0.28;
    n += snoise(p * 4.7 + t * 0.03) * 0.12;
    return n;
  }

  // 1 on the contour line, 0 between lines; w = pixel width in v-units
  float lineMask(float v, float w) {
    float d = abs(fract(v) - 0.5);           // 0.5 at the line
    return smoothstep(0.5 - w * 1.5, 0.5 - w * 0.25, d);
  }

  void main() {
    vec2 frag = gl_FragCoord.xy;
    float s = min(uRes.x, uRes.y);
    vec2 p = (frag - 0.5 * uRes) / s;
    vec2 m = (uMouse - 0.5 * uRes) / s;

    // pointer: a soft hill that lifts the terrain under the cursor
    float d = length(p - m);
    float hill = exp(-d * d * 12.0) * uHover;

    float h = field(p * 1.25, uTime) + hill * 0.55;

    // contour lines with screen-space anti-aliasing
    float v = h * 14.0;
    float line = lineMask(v, fwidth(v));
    float idx = lineMask(v / 5.0, fwidth(v / 5.0));   // every 5th line: an index contour

    float glow = exp(-d * d * 16.0) * uHover;
    vec3 lineCol = mix(uLine, uAccent, clamp(glow * 1.4, 0.0, 1.0));
    float alpha = line * (0.45 + 0.55 * idx) * (0.55 + glow * 0.9);

    // fade toward the top and bottom so the field sinks into the page
    vec2 uv = frag / uRes;
    alpha *= smoothstep(0.0, 0.3, uv.y) * smoothstep(1.0, 0.7, uv.y) * 0.6 + 0.4 * smoothstep(0.0, 0.3, uv.y);

    outColor = vec4(mix(uBg, lineCol, alpha), 1.0);
  }
`;

const vert = /* glsl */ `#version 300 es
  layout(location = 0) in vec2 aPos;
  void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;


export function createTopo(canvas, { bg = '#050505', line = '#2e2e2e', accent = '#ee3524', still = false } = {}) {
  const gl = createGL(canvas, { alpha: false });
  let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const MAX_PX = 1.6e6; // cap the backing store; lines are anti-aliased in-shader
  const { p, loc } = program(gl, vert, frag);
  const q = quad(gl);
  gl.useProgram(p);
  gl.uniform3fv(loc.uBg, hexToRgb(bg));
  gl.uniform3fv(loc.uLine, hexToRgb(line));
  gl.uniform3fv(loc.uAccent, hexToRgb(accent));
  const u = { time: 0, hover: 0 };

  const target = { x: -9999, y: -9999, on: 0 };

  const resize = () => {
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(MAX_PX / Math.max(1, cw * ch)));
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(loc.uRes, canvas.width, canvas.height);
    if (still) render();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const cur = { x: -9999, y: -9999 };
  resize();

  const host = canvas.parentElement;
  const move = e => {
    const r = canvas.getBoundingClientRect();
    target.x = (e.clientX - r.left) * dpr;
    target.y = (r.height - (e.clientY - r.top)) * dpr;
    if (target.on === 0) { cur.x = target.x; cur.y = target.y; }
    target.on = 1;
  };
  const leave = () => { target.on = 0; };
  host.addEventListener('pointermove', move);
  host.addEventListener('pointerleave', leave);

  let visible = true, raf = 0, last = performance.now();
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  });
  io.observe(canvas);

  function render() {
    gl.uniform1f(loc.uTime, u.time);
    gl.uniform2f(loc.uMouse, cur.x, cur.y);
    gl.uniform1f(loc.uHover, u.hover);
    q.draw();
  }

  function tick(now) {
    raf = 0;
    if (!visible) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    u.time += dt;
    cur.x += (target.x - cur.x) * Math.min(1, dt * 6);
    cur.y += (target.y - cur.y) * Math.min(1, dt * 6);
    u.hover += (target.on - u.hover) * Math.min(1, dt * 3);
    render();
    if (!still) raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect(); ro.disconnect();
    host.removeEventListener('pointermove', move);
    host.removeEventListener('pointerleave', leave);
    q.dispose(); gl.deleteProgram(p);
  };
}
