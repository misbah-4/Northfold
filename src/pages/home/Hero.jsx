import { useRef } from 'react';
import { gsap, useGSAP, introDone, scrollTo } from '../../lib/motion.js';
import Media from '../../components/Media.jsx';

const WORDS = ['move', 'speak', 'last', 'sell'];

export default function Hero() {
  const root = useRef(null);
  const rot = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      /* Intro: masked lines slide up once the preloader lifts */
      gsap.set('.hero__line > span', { yPercent: 110 });
      gsap.set('.hero__fade', { opacity: 0, y: 24 });
      gsap.set('.hero__media', { clipPath: 'inset(100% 0% 0% 0%)' });

      introDone.then(() => {
        gsap.timeline({ delay: 0.15 })
          .to('.hero__line > span', { yPercent: 0, duration: 1.4, stagger: 0.1, ease: 'expo.out' })
          .to('.hero__media', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' }, 0.2)
          .from('.hero__img', { scale: 1.4, duration: 2.2, ease: 'expo.out' }, 0.5)
          .to('.hero__fade', { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: 'expo.out' }, 0.7);
      });

      /* Scroll: media widens to full bleed, image drifts, headline lifts away */
      const padX = () => parseFloat(getComputedStyle(root.current.querySelector('.wrap')).paddingLeft) + 'px';
      gsap.timeline({
        scrollTrigger: { trigger: '.hero__media', start: 'top 85%', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
      })
        .fromTo('.hero__frame', { '--inset': padX }, { '--inset': '0px', ease: 'none', duration: 0.4 }, 0)
        .fromTo('.hero__img', { yPercent: -8 }, { yPercent: 12, ease: 'none', duration: 1 }, 0);

      gsap.to('.hero__title', {
        yPercent: -30, opacity: 0.15, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: '45% top', scrub: true },
      });

      /* Rotating accent word. GSAP owns every word's transform: all words
         share one grid cell, and inactive ones sit below the mask. */
      const words = gsap.utils.toArray('.hero__word', rot.current);
      let i = 0;
      gsap.set(words, { y: 0, yPercent: 110, opacity: 1 });
      gsap.set(words[0], { yPercent: 0 });
      const fit = () => gsap.set(rot.current, { width: words[i].offsetWidth });
      fit();
      document.fonts?.ready.then(fit);
      window.addEventListener('resize', fit);

      // delayedCall runs on the GSAP ticker, so it pauses with hidden tabs
      // instead of queueing overlapping swaps like setInterval would.
      let call;
      const tick = () => {
        const cur = words[i];
        i = (i + 1) % words.length;
        const next = words[i];
        gsap.timeline({ onComplete: () => { call = gsap.delayedCall(1.8, tick); } })
          .to(cur, { yPercent: -110, duration: 0.8, ease: 'expo.inOut' })
          .fromTo(next, { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: 'expo.inOut' }, 0)
          .to(rot.current, { width: next.offsetWidth, duration: 0.8, ease: 'expo.inOut' }, 0);
      };
      call = gsap.delayedCall(2.6, tick);
      return () => { call?.kill(); window.removeEventListener('resize', fit); };
    });
  }, { scope: root });

  return (
    <section ref={root} className="hero" id="top" data-cursor-zone="arrow">
      <div className="wrap hero__head">
        <h1 className="display hero__title" aria-label="We make brands that move.">
          <span className="hero__line" aria-hidden="true"><span>We make brands</span></span>
          <span className="hero__line" aria-hidden="true">
            <span>
              that{' '}
              <span ref={rot} className="hero__rot accent">
                {WORDS.map(w => <span key={w} className="hero__word">{w}</span>)}
              </span>.
            </span>
          </span>
        </h1>

        <div className="hero__row">
          <p className="hero__fade hero__intro">
            Northfold is an independent brand &amp; motion studio. Identities, campaigns and
            digital products for companies with something worth saying.
          </p>
          <button type="button" className="hero__fade hero__scroll label" onClick={() => scrollTo('#studio', { duration: 1.6 })}>
            <span className="hero__scroll-line" /> Scroll to explore
          </button>
        </div>
      </div>

      <div className="hero__frame">
        <div className="hero__media">
          <div className="hero__img"><Media item={{ type: 'video', src: '/videos/hero-ink.mp4', poster: '/videos/hero-ink.jpg', alt: 'Red ink blooming through water' }} eager /></div>
          <div className="hero__caption wrap">
            <span className="label">Selected work 2026—27</span>
            <span className="label">Brand · Motion · Digital</span>
          </div>
        </div>
      </div>

      <style>{`
        .hero { padding-top: calc(var(--nav-h) + clamp(80px, 12vw, 200px)); }
        .hero__head { display: flex; flex-direction: column; gap: clamp(40px, 6vw, 96px); }
        .hero__title { max-width: 14ch; will-change: transform; }
        .hero__line { display: block; overflow: hidden; padding-bottom: .08em; margin-bottom: -.08em; }
        .hero__line > span { display: block; }
        .hero__rot {
          display: inline-grid; grid-template-columns: max-content; justify-items: start;
          overflow: hidden; white-space: nowrap;
          padding-bottom: .12em; margin-bottom: -.12em;
        }
        .hero__word { grid-area: 1 / 1; }
        .hero__word:not(:first-child) { opacity: 0; }
        .hero__row {
          display: flex; justify-content: space-between; align-items: flex-end; gap: 32px;
          padding-bottom: clamp(32px, 4vw, 56px);
        }
        .hero__intro { max-width: 34ch; font-size: clamp(17px, 1.4vw, 22px); line-height: 1.4; color: var(--muted); }
        .hero__scroll { display: flex; align-items: center; gap: 12px; color: var(--white); white-space: nowrap; }
        .hero__scroll-line { width: 48px; height: 1px; background: currentColor; transform-origin: left; animation: heroLine 2.2s var(--ease) infinite; }
        @keyframes heroLine { 0% { transform: scaleX(0); } 50% { transform: scaleX(1); transform-origin: left; } 51% { transform-origin: right; } 100% { transform: scaleX(0); transform-origin: right; } }
        .hero__frame { --inset: var(--pad-x); padding: 0 var(--inset); }
        .hero__media {
          position: relative; overflow: hidden;
          height: clamp(380px, 52vw, 860px);
          border-radius: calc(var(--inset) * 0.5);
          background: #e6e4e2;
        }
        .hero__img { width: 100%; height: 124%; object-fit: cover; position: absolute; top: -12%; left: 0; }
        .hero__caption {
          position: absolute; left: 0; right: 0; bottom: 0; padding-top: 80px; padding-bottom: 20px;
          background: linear-gradient(to top, rgba(0,0,0,.35), transparent);
          display: flex; justify-content: space-between;
        }
        .hero__caption .label { color: #fff; }
        @media (max-width: 640px) {
          .hero__row { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </section>
  );
}
