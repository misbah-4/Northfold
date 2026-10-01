import { useEffect, useRef } from 'react';
import { gsap, reducedMotion } from '../lib/motion.js';

// What the cursor is drawn to, and what is drawn to the cursor
const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, [data-cursor]';
const PULLS_ELEMENT = '[data-magnetic], .nav__links a, .nav__logo, .foot__mail, .foot__col a, .foot__base button, .u-link, .hero__scroll, .menu__row, .pill';

const DOT = 12, RING = 44, LABEL = 96;

/**
 * Circle cursor.
 * - a small dot that trails the pointer
 * - over links/buttons it grows into a ring and is pulled toward the
 *   target's centre; small targets (nav, footer…) drift toward it too
 * - over `data-cursor="Label"` it becomes the white label circle
 * Touch devices and reduced motion keep the native cursor.
 */
export default function Cursor() {
  const el = useRef(null);
  const txt = useRef(null);

  useEffect(() => {
    const c = el.current, t = txt.current;
    if (!c || reducedMotion() || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    document.documentElement.classList.add('has-cursor');
    const xTo = gsap.quickTo(c, 'x', { duration: 0.35, ease: 'power3.out' });
    const yTo = gsap.quickTo(c, 'y', { duration: 0.35, ease: 'power3.out' });

    let target = null, label = null, pulled = null, shown = false;
    let mode = null;

    const setMode = m => {
      if (m === mode) return;
      mode = m;
      const size = m === 'label' ? LABEL : m === 'link' ? RING : DOT;
      c.classList.toggle('is-label', m === 'label');
      c.classList.toggle('is-link', m === 'link');
      gsap.to(c, { width: size, height: size, duration: 0.45, ease: 'back.out(1.8)', overwrite: 'auto' });
      gsap.to(t, { autoAlpha: m === 'label' ? 1 : 0, scale: m === 'label' ? 1 : 0.6, duration: 0.3, overwrite: 'auto' });
    };

    const release = () => {
      if (!pulled) return;
      gsap.to(pulled, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });
      pulled = null;
    };

    const move = e => {
      const { clientX: px, clientY: py } = e;
      if (!shown) {
        shown = true;
        gsap.set(c, { x: px, y: py });
        gsap.to(c, { autoAlpha: 1, duration: 0.3 });
      }

      const l = e.target.closest?.('[data-cursor]');
      if (l !== label) { label = l; if (l) t.textContent = l.dataset.cursor; }
      const tg = e.target.closest?.(INTERACTIVE);
      if (tg !== target) {
        target = tg;
        if (pulled && pulled !== tg?.closest(PULLS_ELEMENT)) release();
      }
      setMode(label ? 'label' : target ? 'link' : 'dot');

      let cx = px, cy = py;
      if (target && !label) {
        const r = target.getBoundingClientRect();
        const mx = r.left + r.width / 2, my = r.top + r.height / 2;
        // small targets pull the circle harder than big ones
        const k = gsap.utils.clamp(0.1, 0.4, 60 / Math.max(r.width, r.height));
        cx += (mx - px) * k;
        cy += (my - py) * k;
        const p = target.closest(PULLS_ELEMENT);
        if (p && r.width < 420) {
          pulled = p;
          gsap.to(p, { x: (px - mx) * 0.25, y: (py - my) * 0.3, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
        }
      }
      xTo(cx);
      yTo(cy);
    };

    const down = () => gsap.to(c, { scale: 0.8, duration: 0.12, ease: 'power2.in', overwrite: 'auto' });
    const up = () => gsap.to(c, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
    const hide = () => { shown = false; release(); gsap.to(c, { autoAlpha: 0, duration: 0.2 }); };

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    document.documentElement.addEventListener('pointerleave', hide);
    return () => {
      release();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.documentElement.removeEventListener('pointerleave', hide);
      document.documentElement.classList.remove('has-cursor');
    };
  }, []);

  return (
    <div ref={el} className="cursor" aria-hidden="true">
      <span ref={txt} className="cursor__label" />
    </div>
  );
}
