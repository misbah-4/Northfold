import { useEffect, useRef } from 'react';
import { gsap, useGSAP, magnetic, press, scrollTo } from '../lib/motion.js';

const SOCIAL = ['Instagram', 'LinkedIn', 'Vimeo', 'Are.na'];

export default function Footer() {
  const root = useRef(null);
  const mail = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Giant wordmark letters rise out of the floor as the footer arrives
      gsap.from('.foot__char', {
        yPercent: 100,
        ease: 'none',
        stagger: 0.06,
        scrollTrigger: { trigger: '.foot__giant', start: 'top bottom', end: 'bottom bottom', scrub: 1 },
      });
      gsap.from('.foot__top > *', {
        y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: 'top 80%' },
      });
    });
  }, { scope: root });

  useEffect(() => {
    const offs = [magnetic(mail.current, { strength: 0.15 }), press(mail.current, { scale: 0.97 })];
    return () => offs.forEach(f => f());
  }, []);

  return (
    <footer ref={root} id="contact" className="foot">
      <div className="foot__top wrap">
        <h2 className="h2 foot__title">
          Good brands are built <br className="br-d" />with intention.
        </h2>
        <a ref={mail} href="mailto:hello@northfold.studio" className="foot__mail" data-cursor="Say hi">
          hello@northfold.studio
        </a>
        <div className="foot__cols">
          <div>
            <span className="label">Studio</span>
            <p>Independent studio<br />Working worldwide</p>
          </div>
          <div>
            <span className="label">Follow</span>
            <ul>
              {SOCIAL.map(s => (
                <li key={s}><a href="#" className="u-link">{s}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <span className="label">New business</span>
            <p><a href="mailto:new@northfold.studio" className="u-link">new@northfold.studio</a></p>
          </div>
          <button type="button" className="foot__top-btn label" onClick={() => scrollTo(0, { duration: 2 })}>
            Back to top ↑
          </button>
        </div>
      </div>

      <div className="foot__giant" aria-hidden="true">
        {'northfold'.split('').map((c, i) => (
          <span key={i} className="foot__char">{c}</span>
        ))}
      </div>

      <div className="foot__base wrap label">
        <span>We make brands that move.</span>
        <span>© {new Date().getFullYear()} Northfold Studio</span>
      </div>

      <style>{`
        .foot { position: relative; z-index: 2; background: var(--bg); padding-top: clamp(96px, 12vw, 200px); overflow: hidden; }
        .foot__top { display: grid; gap: 48px; }
        .foot__mail {
          justify-self: start;
          font-size: clamp(28px, 4.4vw, 76px); letter-spacing: -0.04em;
          color: var(--muted); text-decoration: underline; text-decoration-thickness: 1px;
          text-underline-offset: .14em; transition: color .4s var(--ease);
        }
        .foot__mail:hover { color: var(--white); }
        .foot__cols {
          display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 32px;
          padding-top: 40px; border-top: 1px solid var(--line); margin-top: 24px;
          font-size: 16px; line-height: 1.6;
        }
        .foot__cols .label { display: block; margin-bottom: 12px; }
        .foot__cols ul { list-style: none; margin: 0; padding: 0; }
        .foot__top-btn { justify-self: end; align-self: start; color: var(--white); }
        .foot__giant {
          display: flex; justify-content: space-between;
          padding: 0 var(--pad-x);
          margin-top: clamp(64px, 8vw, 140px);
          font-size: 21.5vw; line-height: .78; letter-spacing: -0.06em; font-weight: 500;
          overflow: hidden;
        }
        .foot__char { display: inline-block; }
        .foot__base { display: flex; justify-content: space-between; gap: 16px; padding-top: 20px; padding-bottom: 24px; }
        @media (max-width: 760px) {
          .foot__cols { grid-template-columns: 1fr 1fr; }
          .foot__top-btn { justify-self: start; }
          .br-d { display: none; }
        }
      `}</style>
    </footer>
  );
}
