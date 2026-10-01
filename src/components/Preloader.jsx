import { useRef, useState } from 'react';
import { gsap, useGSAP, finishIntro, lockScroll, reducedMotion } from '../lib/motion.js';

/**
 * First-load curtain: a counter runs to 100 while the wordmark rises,
 * then the panel lifts away and releases the page intro.
 */
export default function Preloader() {
  const root = useRef(null);
  const count = useRef(null);
  const [gone, setGone] = useState(false);

  useGSAP(() => {
    if (reducedMotion()) {
      finishIntro();
      setGone(true);
      return;
    }
    lockScroll(true);
    const n = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => { lockScroll(false); setGone(true); },
    });
    tl.from('.pre__char', { yPercent: 110, duration: 1, stagger: 0.04, ease: 'expo.out' }, 0.1)
      .to(n, {
        v: 100, duration: 1.6, ease: 'power3.inOut',
        onUpdate: () => { if (count.current) count.current.textContent = String(Math.round(n.v)).padStart(3, '0'); },
      }, 0)
      .to('.pre__bar', { scaleX: 1, duration: 1.6, ease: 'power3.inOut' }, 0)
      .to('.pre__char', { yPercent: -110, duration: 0.7, stagger: 0.025, ease: 'expo.in' }, 1.7)
      .to('.pre__meta', { opacity: 0, duration: 0.3 }, 1.8)
      .add(finishIntro, 2.15)
      .to(root.current, { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, 2.1);
  }, { scope: root });

  if (gone) return null;

  return (
    <div ref={root} className="pre" aria-hidden="true">
      <div className="pre__word">
        {'Northfold'.split('').map((c, i) => (
          <span key={i} className="pre__mask"><span className="pre__char">{c}</span></span>
        ))}
      </div>
      <div className="pre__meta">
        <span className="label">Brand &amp; motion studio</span>
        <span ref={count} className="pre__count">000</span>
      </div>
      <div className="pre__track"><div className="pre__bar" /></div>
      <style>{`
        .pre {
          position: fixed; inset: 0; z-index: 100;
          background: #0b0b0b;
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          padding: var(--pad-x);
        }
        .pre__word { display: flex; font-size: clamp(56px, 14vw, 240px); letter-spacing: -0.06em; line-height: .9; }
        .pre__mask { display: inline-block; overflow: hidden; padding-bottom: .05em; }
        .pre__char { display: inline-block; }
        .pre__meta {
          position: absolute; left: var(--pad-x); right: var(--pad-x); bottom: 40px;
          display: flex; justify-content: space-between; align-items: flex-end;
        }
        .pre__count { font-family: var(--mono); font-size: 13px; color: #fff; }
        .pre__track { position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: #1d1d1d; }
        .pre__bar { height: 100%; background: var(--accent); transform: scaleX(0); transform-origin: left; }
      `}</style>
    </div>
  );
}
