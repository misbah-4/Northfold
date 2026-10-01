import { useRef } from 'react';
import { gsap, useGSAP, getLenis, reducedMotion } from '../../lib/motion.js';

const CLIENTS = [
  { name: 'Halden',    style: { fontFamily: 'Georgia, serif', fontStyle: 'italic' } },
  { name: 'ORBIT',     style: { letterSpacing: '0.2em', fontWeight: 600 } },
  { name: 'tidewater', style: { fontWeight: 300, letterSpacing: '-0.06em' } },
  { name: 'MORA',      style: { fontFamily: 'Georgia, serif', letterSpacing: '0.3em' } },
  { name: 'Signal FM', style: { fontFamily: 'var(--mono)', fontWeight: 500 } },
  { name: 'Atlas/26',  style: { fontWeight: 700, letterSpacing: '-0.04em' } },
  { name: 'Northline', style: { fontWeight: 500, fontStyle: 'italic' } },
  { name: 'PARALLEL',  style: { fontWeight: 300, letterSpacing: '0.12em' } },
];

/**
 * Infinite logo rail: drifts on its own, speeds up with scroll velocity,
 * and can be dragged with inertia.
 */
export default function Clients() {
  const root = useRef(null);
  const rail = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.clients__head > *', {
        y: 40, opacity: 0, duration: 1.2, stagger: 0.08, ease: 'expo.out',
        scrollTrigger: { trigger: root.current, start: 'top 80%' },
      });
    });

    if (reducedMotion()) return;
    const el = rail.current;
    const setX = gsap.quickSetter(el, 'x', 'px');
    const setSkew = gsap.quickSetter(el, 'skewX', 'deg');
    let half = el.scrollWidth / 2;
    let x = 0, vel = 0, skew = 0;
    let dragging = false, lastX = 0, dir = -1;
    const BASE = 50; // px per second

    const wrap = v => {
      let r = v % half;
      if (r > 0) r -= half;
      return r;
    };

    const tick = (_, dt) => {
      const s = dt / 1000;
      const lv = getLenis()?.velocity ?? 0;
      if (lv) dir = lv > 0 ? -1 : 1;
      if (!dragging) {
        vel *= 0.92; // inertia decay after a fling
        x += (dir * (BASE + Math.abs(lv) * 25)) * s + vel;
      }
      x = wrap(x);
      setX(x);
      skew += ((dragging ? vel * 0.4 : lv * -0.25) - skew) * 0.1;
      setSkew(gsap.utils.clamp(-8, 8, skew));
    };
    gsap.ticker.add(tick);

    const down = e => {
      dragging = true; lastX = e.clientX; vel = 0;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = 'grabbing';
    };
    const move = e => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      x += dx; vel = dx;
      if (dx) dir = dx > 0 ? 1 : -1;
    };
    const up = () => { dragging = false; el.style.cursor = ''; };
    const resize = () => { half = el.scrollWidth / 2; };

    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    window.addEventListener('resize', resize);
    return () => {
      gsap.ticker.remove(tick);
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      window.removeEventListener('resize', resize);
    };
  }, { scope: root });

  const items = [...CLIENTS, ...CLIENTS];

  return (
    <section ref={root} className="clients" aria-label="Clients">
      <div className="wrap clients__head">
        <h2 className="lead">We’ve grown alongside<br /><span style={{ color: 'var(--muted)' }}>brands worth backing.</span></h2>
        <span className="label">Drag to explore ⟷</span>
      </div>
      <div className="clients__viewport">
        <ul ref={rail} className="clients__rail" data-cursor="Drag">
          {items.map((c, i) => (
            <li key={i} className="clients__tile" aria-hidden={i >= CLIENTS.length}>
              <span style={c.style}>{c.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <style>{`
        .clients { padding: clamp(120px, 14vw, 220px) 0 clamp(80px, 10vw, 160px); }
        .clients__head { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; margin-bottom: clamp(40px, 5vw, 72px); }
        .clients__viewport { overflow: hidden; }
        .clients__rail {
          display: flex; gap: 12px; width: max-content;
          list-style: none; margin: 0; padding: 0 0 0 var(--pad-x);
          cursor: grab; user-select: none; touch-action: pan-y;
        }
        .clients__tile {
          flex: none; width: clamp(180px, 18vw, 300px); aspect-ratio: 1;
          display: flex; align-items: center; justify-content: center;
          background: var(--surface); border-radius: 6px;
          font-size: clamp(24px, 2.2vw, 36px); color: var(--white);
          transition: background .5s var(--ease), color .5s var(--ease);
        }
        .clients__tile:hover { background: var(--white); color: #0b0b0b; }
        @media (prefers-reduced-motion: reduce) { .clients__viewport { overflow-x: auto; } }
      `}</style>
    </section>
  );
}
