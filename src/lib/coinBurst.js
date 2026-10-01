import { gsap, reducedMotion } from './motion.js';

/**
 * Pops a burst of 3D pixel-smiley coins out of `origin` (an element).
 * Each coin is a stack of discs (face, edge layers, back) in a
 * preserve-3d box, so it shows real thickness as it flips. Motion is a
 * small physics step on the GSAP ticker: launch, gravity, air drag, spin.
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

export function coinBurst(origin, { count = 26 } = {}) {
  if (!origin) return;
  const r = origin.getBoundingClientRect();
  const ox = r.left + r.width / 2, oy = r.top + r.height / 2;
  const reduced = reducedMotion();
  const n = reduced ? 8 : count;

  // the logo itself gives a little squash-and-pop
  gsap.fromTo(origin, { scale: 0.86 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });

  // centre of the viewport, nudged up so coins arc rather than drop
  const aim = Math.atan2(innerHeight * 0.4 - oy, innerWidth / 2 - ox);

  const host = getStage();
  const coins = [];
  for (let i = 0; i < n; i++) {
    const size = gsap.utils.random(56, 110);
    const el = makeCoin(size);
    host.appendChild(el);
    // spray around the word, fanned toward the open part of the screen
    const ang = aim + gsap.utils.random(-1.25, 1.25);
    const speed = gsap.utils.random(520, 1150) * (reduced ? 0.5 : 1);
    coins.push({
      el, size,
      x: ox + gsap.utils.random(-r.width / 2, r.width / 2), y: oy,
      vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed - 520,
      rx: gsap.utils.random(0, 360), ry: gsap.utils.random(0, 360), rz: gsap.utils.random(-30, 30),
      sx: reduced ? 0 : gsap.utils.random(-720, 720), sy: reduced ? 0 : gsap.utils.random(-900, 900), sz: gsap.utils.random(-180, 180),
      life: 0, max: gsap.utils.random(1.8, 2.6), scale: 0,
    });
  }

  const G = 2200, DRAG = 0.6;
  const tick = (time, dtMs) => {
    const dt = Math.min(dtMs, 40) / 1000;
    let alive = 0;
    for (const c of coins) {
      if (!c.el) continue;
      c.life += dt;
      c.vy += G * dt;
      c.vx *= 1 - DRAG * dt; c.vy *= 1 - DRAG * dt * 0.4;
      c.x += c.vx * dt; c.y += c.vy * dt;
      c.rx += c.sx * dt; c.ry += c.sy * dt; c.rz += c.sz * dt;
      c.scale = Math.min(1, c.scale + dt * 7);
      const fade = gsap.utils.clamp(0, 1, (c.max - c.life) / 0.35);
      c.el.style.opacity = fade;
      c.el.style.transform =
        `translate3d(${c.x - c.size / 2}px, ${c.y - c.size / 2}px, 0) scale(${c.scale}) rotateX(${c.rx}deg) rotateY(${c.ry}deg) rotateZ(${c.rz}deg)`;
      if (c.life >= c.max || c.y > innerHeight + 120) { c.el.remove(); c.el = null; } else alive++;
    }
    if (!alive) gsap.ticker.remove(tick);
  };
  gsap.ticker.add(tick);
}
