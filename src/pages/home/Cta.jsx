import { useEffect, useRef } from 'react';
import { gsap, useGSAP, revealLines, magnetic, press } from '../../lib/motion.js';

/**
 * "Have a project in mind?" — the image pins in place and the footer
 * slides up over it like a curtain.
 */
export default function Cta() {
  const root = useRef(null);
  const btn = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      revealLines('.cta__title', { scrollTrigger: { trigger: '.cta__title', start: 'top 85%' } });
      gsap.from('.cta__btn', {
        scale: 0, rotate: -30, duration: 1.2, ease: 'expo.out',
        scrollTrigger: { trigger: '.cta__title', start: 'top 80%' },
      });

      // Image opens from a narrow window to full bleed while scaling down
      gsap.timeline({
        scrollTrigger: { trigger: '.cta__media', start: 'top bottom', end: 'top top', scrub: true },
      })
        .fromTo('.cta__media', { clipPath: 'inset(0% 18% 0% 18% round 12px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none' }, 0)
        .fromTo('.cta__zoom', { scale: 1.35 }, { scale: 1, ease: 'none' }, 0);

      // Then it holds while the footer covers it
      gsap.to('.cta__img', {
        yPercent: 10, scale: 1.05, ease: 'none',
        scrollTrigger: { trigger: '.cta__media', start: 'top top', end: 'bottom top', scrub: true, pin: true, pinSpacing: false },
      });
    });
  }, { scope: root });

  useEffect(() => {
    const offs = [magnetic(btn.current, { strength: 0.35 }), press(btn.current)];
    return () => offs.forEach(f => f());
  }, []);

  return (
    <section ref={root} className="cta">
      <div className="wrap cta__head">
        <h2 className="display cta__title">Have a project<br />in mind?</h2>
        <a ref={btn} href="mailto:hello@northfold.studio?subject=New%20project" className="cta__btn">
          <span>Let’s<br />talk</span>
        </a>
      </div>
      <div className="cta__media">
        <div className="cta__zoom">
          <img className="cta__img" src="/images/blueprint.jpg" alt="" />
        </div>
      </div>

      <style>{`
        .cta { padding-top: clamp(60px, 8vw, 120px); }
        .cta__head {
          display: flex; justify-content: space-between; align-items: center; gap: 32px;
          margin-bottom: clamp(56px, 7vw, 120px);
        }
        .cta__btn {
          flex: none; width: clamp(120px, 12vw, 190px); aspect-ratio: 1; border-radius: 50%;
          background: var(--accent); color: #fff;
          display: flex; align-items: center; justify-content: center; text-align: center;
          font-size: clamp(18px, 1.6vw, 26px); line-height: 1; letter-spacing: -0.02em;
          transition: background .5s var(--ease), color .5s var(--ease);
        }
        .cta__btn:hover { background: var(--white); color: #0b0b0b; }
        .cta__media { position: relative; height: 100vh; overflow: hidden; background: #0d2a66; }
        .cta__zoom { position: absolute; inset: 0; }
        .cta__img { position: absolute; left: 0; top: -15%; width: 100%; height: 130%; object-fit: cover; }
        @media (max-width: 640px) {
          .cta__head { flex-direction: column; align-items: flex-start; }
          .cta__media { height: 70vh; }
        }
      `}</style>
    </section>
  );
}
