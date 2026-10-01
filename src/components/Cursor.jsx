import { useEffect, useRef } from 'react';
import { gsap, reducedMotion } from '../lib/motion.js';

// Tip of the arrow inside cursor.png (128×114), in image pixels
const TIP = { x: 4.5, y: 2.7 };
const SIZE = 52;                    // rendered width in CSS px
const K = SIZE / 128;

// What the cursor is drawn to, and what is drawn to the cursor
const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, [data-cursor]';
const PULLS_ELEMENT = '[data-magnetic], .nav__links a, .nav__logo, .foot__mail, .foot__col a, .foot__base button, .u-link, .hero__scroll, .menu__row, .pill';

/**
 * 3D pixel-arrow cursor.
 * - follows the pointer with a short lag and leans into its motion
 * - magnetic: over links and buttons it is pulled toward their centre,
 *   and small targets (nav, footer links…) drift toward it in return
 * - `data-cursor="Label"` elements show a label chip beside the arrow
 * Touch devices and reduced motion keep the native cursor.
 */
export default function Cursor() {
  const root = useRef(null);
  const arrow = useRef(null);
  const chip = useRef(null);

  useEffect(() => {
    const el = root.current, img = arrow.current, lab = chip.current;
    if (!el || reducedMotion() || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    document.documentElement.classList.add('has-cursor');
    const xTo = gsap.quickTo(el, 'x', { duration: 0.18, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.18, ease: 'power3.out' });
    const rotTo = gsap.quickTo(img, 'rotation', { duration: 0.5, ease: 'power3.out' });

    let target = null;       // interactive element under the pointer
    let pulled = null;       // element currently drifting toward the cursor
    let label = null;
    let lastX = 0, shown = false, idle = 0;

    const release = () => {
      if (!pulled) return;
      gsap.to(pulled, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });
      pulled = null;
    };

    const move = e => {
      const { clientX: px, clientY: py } = e;
      if (!shown) {
        shown = true;
        gsap.set(el, { x: px, y: py });
        gsap.to(el, { autoAlpha: 1, duration: 0.3 });
      }

      const t = e.target.closest?.(INTERACTIVE);
      if (t !== target) {
        target = t;
        gsap.to(img, { scale: t ? 1.18 : 1, duration: 0.45, ease: 'back.out(2.5)', overwrite: 'auto' });
        if (pulled && pulled !== t?.closest(PULLS_ELEMENT)) release();
      }

      let cx = px, cy = py;
      if (t) {
        const r = t.getBoundingClientRect();
        const mx = r.left + r.width / 2, my = r.top + r.height / 2;
        // small targets pull harder; big cards barely tug
        const k = gsap.utils.clamp(0.08, 0.35, 60 / Math.max(r.width, r.height));
        cx += (mx - px) * k;
        cy += (my - py) * k;

        const p = t.closest(PULLS_ELEMENT);
        if (p && r.width < 420) {
          pulled = p;
          gsap.to(p, { x: (px - mx) * 0.25, y: (py - my) * 0.3, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
        }
      }
      xTo(cx);
      yTo(cy);
      rotTo(gsap.utils.clamp(-14, 14, (px - lastX) * 0.6));
      lastX = px;
      clearTimeout(idle);
      idle = setTimeout(() => rotTo(0), 90);

      const l = e.target.closest?.('[data-cursor]');
      if (l !== label) {
        label = l;
        if (l) {
          lab.textContent = l.dataset.cursor;
          gsap.to(lab, { scale: 1, autoAlpha: 1, duration: 0.45, ease: 'back.out(2)', overwrite: 'auto' });
        } else {
          gsap.to(lab, { scale: 0.4, autoAlpha: 0, duration: 0.25, ease: 'power2.in', overwrite: 'auto' });
        }
      }
    };

    const down = () => gsap.to(img, { scale: (target ? 1.18 : 1) * 0.82, duration: 0.12, ease: 'power2.in', overwrite: 'auto' });
    const up = () => gsap.to(img, { scale: target ? 1.18 : 1, duration: 0.5, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
    const hide = () => { shown = false; release(); gsap.to(el, { autoAlpha: 0, duration: 0.2 }); };

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    document.documentElement.addEventListener('pointerleave', hide);
    return () => {
      clearTimeout(idle);
      release();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.documentElement.removeEventListener('pointerleave', hide);
      document.documentElement.classList.remove('has-cursor');
    };
  }, []);

  return (
    <div ref={root} className="cursor" aria-hidden="true">
      <img
        ref={arrow}
        className="cursor__arrow"
        src="/images/cursor.png"
        alt=""
        width={SIZE}
        style={{ marginLeft: -TIP.x * K, marginTop: -TIP.y * K, transformOrigin: `${TIP.x * K}px ${TIP.y * K}px` }}
        draggable="false"
      />
      <span ref={chip} className="cursor__chip" />
    </div>
  );
}
