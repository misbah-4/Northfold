import { gsap, reducedMotion } from './motion.js';

/**
 * Pops a burst of 3D pixel-smiley coins out of `origin` (an element).
 *
 * Coins are built in CSS 3D (no WebGL): a front and back face plus a
 * stack of rim slices in a preserve-3d box. The slices nearest each face
 * are slightly smaller and lighter, which reads as a rounded bevel.
 * Every frame each coin is lit by a fixed key light: the faces darken or
 * catch a highlight as they turn, and the rim colour follows.
 * Motion: radial launch, heavy air drag so they hang in place, spin,
 * then shrink away.
 */
const FACES = [
  { src: '/images/coin-happy.webp', rim: [35, 168, 108], dark: [10, 70, 42] },
  { src: '/images/coin-sad.webp', rim: [226, 26, 80], dark: [104, 8, 36] },
  { src: '/images/coin-neutral.webp', rim: [226, 26, 80], dark: [104, 8, 36] },
];
const SLICES = 14;     // rim slices
const THICK = 0.16;    // thickness as a fraction of diameter
const FACE_INSET = 0.955;
// key light from the upper left, toward the viewer (CSS y points down)
const L = (() => { const v = [-0.38, -0.55, 0.74]; const m = Math.hypot(...v); return v.map(c => c / m); })();

let stage = null;
function getStage() {
  if (stage?.isConnected) return stage;
  stage = document.createElement('div');
  stage.className = 'coins';
  stage.setAttribute('aria-hidden', 'true');
  document.body.appendChild(stage);
  return stage;
}

function makeCoin(size) {
  // ~1 in 4 coins is the green happy one, as in the reference
  const f = Math.random() < 0.25 ? FACES[0] : FACES[1 + (Math.random() < 0.5 ? 0 : 1)];
  const coin = document.createElement('div');
  coin.className = 'coin';
  coin.style.width = coin.style.height = `${size}px`;
  const t = size * THICK;

  for (let i = 0; i < SLICES; i++) {
    const u = i / (SLICES - 1);                  // 0 … 1 across the thickness
    const e = Math.min(u, 1 - u) * (SLICES - 1); // slices from the nearest face
    const d = document.createElement('div');
    d.className = 'coin__rim';
    const scale = e < 1 ? 0.968 : e < 2 ? 0.99 : 1;
    const lift = e < 1 ? 22 : e < 2 ? 10 : 0;    // bevel catches more light
    d.style.transform = `translateZ(${-t / 2 + t * u}px) scale(${scale})`;
    d.style.background = `color-mix(in srgb, var(--rim), #fff ${lift}%)`;
    coin.appendChild(d);
  }
  const face = (z, flip) => {
    const w = document.createElement('div');
    w.className = 'coin__face';
    w.style.transform = `translateZ(${z}px) ${flip ? 'rotateY(180deg) ' : ''}scale(${FACE_INSET})`;
    w.innerHTML = `<img src="${f.src}" alt="" draggable="false"><i class="coin__shade"></i><i class="coin__shine"></i>`;
    coin.appendChild(w);
    return { shade: w.children[1], shine: w.children[2] };
  };
  const back = face(-t / 2 - 0.5, true);
  const front = face(t / 2 + 0.5, false);
  return { el: coin, front, back, mat: f };
}

const mix = (a, b, k) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(',')})`;

/** Shade one coin for its current orientation. */
function light(c) {
  const m = new DOMMatrix(`rotateX(${c.rx}deg) rotateY(${c.ry}deg) rotateZ(${c.rz}deg)`);
  const n = m.transformPoint(new DOMPoint(0, 0, 1));
  const lam = n.x * L[0] + n.y * L[1] + n.z * L[2];           // front face vs light
  for (const [f, l] of [[c.front, lam], [c.back, -lam]]) {
    const k = Math.max(0, l);
    f.shade.style.opacity = Math.max(0, 0.45 - 0.6 * k).toFixed(3);
    f.shine.style.opacity = (Math.max(0, k - 0.72) * 2.2).toFixed(3);
  }
  // the rim faces sideways: brightest when the faces are edge-on to the light
  const rimLit = 0.35 + 0.65 * Math.sqrt(Math.max(0, 1 - lam * lam)) * (0.6 + 0.4 * Math.max(0, -n.y));
  c.el.style.setProperty('--rim', mix(c.mat.dark, c.mat.rim, Math.min(1, rimLit)));
}

export function coinBurst(origin, { count = 26, x, y } = {}) {
  if (!origin) return;
  const r = origin.getBoundingClientRect();
  // burst from the click point if given, else the element's centre
  const ox = x ?? r.left + r.width / 2, oy = y ?? r.top + r.height / 2;
  const reduced = reducedMotion();
  const n = reduced ? 8 : count;

  // the clicked element squashes and pops
  gsap.fromTo(origin, { scale: 0.86 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });

  const host = getStage();
  const coins = [];
  for (let i = 0; i < n; i++) {
    const size = gsap.utils.random(56, 110);
    const coin = makeCoin(size);
    host.appendChild(coin.el);
    // evenly spread around a full circle, jittered so it doesn't look like a wheel
    const ang = (i / n) * Math.PI * 2 + gsap.utils.random(-0.22, 0.22);
    // distance travelled ≈ speed / DRAG, so this throws coins ~230–470px out
    const speed = gsap.utils.random(1050, 2100) * (reduced ? 0.4 : 1);
    coins.push({
      ...coin, size, x: ox, y: oy,
      vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed,
      rx: gsap.utils.random(0, 360), ry: gsap.utils.random(0, 360), rz: gsap.utils.random(-30, 30),
      sx: reduced ? 0 : gsap.utils.random(-900, 900), sy: reduced ? 0 : gsap.utils.random(-1100, 1100), sz: gsap.utils.random(-200, 200),
      life: 0, max: gsap.utils.random(1.05, 1.45), scale: 0,
    });
  }

  // strong air drag: coins shoot out, then decelerate and hang in place
  const DRAG = 4.5, SPIN_DRAG = 2.2, OUT = 0.32;
  const tick = (time, dtMs) => {
    const dt = Math.min(dtMs, 40) / 1000;
    const k = Math.exp(-DRAG * dt), ks = Math.exp(-SPIN_DRAG * dt);
    let alive = 0;
    for (const c of coins) {
      if (!c.el) continue;
      c.life += dt;
      c.vx *= k; c.vy *= k;
      c.x += c.vx * dt; c.y += c.vy * dt;
      c.sx *= ks; c.sy *= ks; c.sz *= ks;
      c.rx += c.sx * dt; c.ry += c.sy * dt; c.rz += c.sz * dt;
      // pop in fast with a little overshoot, shrink away at the end
      const t = c.life;
      let s = t < 0.18 ? gsap.parseEase('back.out(3)')(t / 0.18) : 1;
      const end = gsap.utils.clamp(0, 1, (c.max - t) / OUT);
      s *= end;
      c.el.style.opacity = Math.min(1, end * 1.6);
      c.el.style.transform =
        `translate3d(${c.x - c.size / 2}px, ${c.y - c.size / 2}px, 0) scale(${s}) rotateX(${c.rx}deg) rotateY(${c.ry}deg) rotateZ(${c.rz}deg)`;
      light(c);
      if (t >= c.max) { c.el.remove(); c.el = null; } else alive++;
    }
    if (!alive) gsap.ticker.remove(tick);
  };
  gsap.ticker.add(tick);
}
