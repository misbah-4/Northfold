import { gsap, reducedMotion } from './motion.js';

/**
 * Pops a burst of 3D pixel-smiley coins out of `origin` (an element).
 * Each coin is a stack of discs (face, edge layers, back) in a
 * preserve-3d box, so it shows real thickness as it flips. Motion is a
 * small physics step on the GSAP ticker: radial launch, heavy air drag
 * so they hang in place, spin, then shrink away.
 */
const FACES = [
  { src: '/images/coin-happy.png', edge: '#1f9c62' },
  { src: '/images/coin-sad.png', edge: '#c41848' },
  { src: '/images/coin-neutral.png', edge: '#c41848' },
];
const LAYERS = 6;      // edge slices
const THICK = 0.16;    // thickness as a fraction of diameter

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
  const layer = (z, html) => {
    const d = document.createElement('div');
    d.className = 'coin__layer';
    d.style.transform = `translateZ(${z}px)`;
    if (html) d.innerHTML = html; else d.style.background = f.edge;
    coin.appendChild(d);
  };
  layer(-t / 2, `<img src="${f.src}" alt="" draggable="false" style="transform:scaleX(-1)">`);
  for (let i = 1; i < LAYERS; i++) layer(-t / 2 + (t * i) / LAYERS);
  layer(t / 2, `<img src="${f.src}" alt="" draggable="false">`);
  return coin;
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
    const el = makeCoin(size);
    host.appendChild(el);
    // evenly spread around a full circle, jittered so it doesn't look like a wheel
    const ang = (i / n) * Math.PI * 2 + gsap.utils.random(-0.22, 0.22);
    // distance travelled ≈ speed / DRAG, so this throws coins ~230–470px out
    const speed = gsap.utils.random(1050, 2100) * (reduced ? 0.4 : 1);
    coins.push({
      el, size, x: ox, y: oy,
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
      if (t >= c.max) { c.el.remove(); c.el = null; } else alive++;
    }
    if (!alive) gsap.ticker.remove(tick);
  };
  gsap.ticker.add(tick);
}
