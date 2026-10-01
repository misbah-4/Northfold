import { useEffect, useRef } from 'react';
import { gsap, reducedMotion } from '../lib/motion.js';

/**
 * A pill that trails the pointer and grows over any element carrying
 * `data-cursor="Label"`.
 */
export default function Cursor() {
  const el = useRef(null);

  useEffect(() => {
    const c = el.current;
    if (!c || reducedMotion() || matchMedia('(hover: none)').matches) return;
    const xTo = gsap.quickTo(c, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(c, 'y', { duration: 0.6, ease: 'power3.out' });
    let current = null;

    const move = e => {
      xTo(e.clientX);
      yTo(e.clientY);
      const t = e.target.closest?.('[data-cursor]');
      if (t !== current) {
        current = t;
        if (t) {
          c.textContent = t.dataset.cursor;
          gsap.to(c, { scale: 1, duration: 0.5, ease: 'expo.out', overwrite: 'auto' });
        } else {
          gsap.to(c, { scale: 0, duration: 0.4, ease: 'expo.out', overwrite: 'auto' });
        }
      }
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);

  return <div ref={el} className="cursor" aria-hidden="true" />;
}
