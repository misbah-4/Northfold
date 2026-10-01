import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { gsap, useGSAP, ScrollTrigger, SplitText, scrollTo } from '../lib/motion.js';

const SITEMAP = [
  { label: 'Work',     hash: '#work' },
  { label: 'Studio',   hash: '#studio' },
  { label: 'Services', hash: '#services' },
  { label: 'Contact',  hash: '#contact' },
];
const SOCIAL = ['Instagram', 'LinkedIn', 'Vimeo', 'Are.na'];
const WORDMARK = 'Northfold';

function Roll({ children }) {
  return <span className="roll"><span>{children}</span><span aria-hidden="true">{children}</span></span>;
}

export default function Footer() {
  const root = useRef(null);
  const mark = useRef(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  /* Size the wordmark so it spans the content width edge to edge */
  useLayoutEffect(() => {
    const el = mark.current;
    const fit = () => {
      const avail = el.parentElement.clientWidth;
      el.style.fontSize = '100px';
      const w = el.scrollWidth;
      if (w) el.style.fontSize = `${(100 * avail) / w}px`;
      ScrollTrigger.refresh();
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(el.parentElement);
    return () => ro.disconnect();
  }, []);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const split = SplitText.create('.foot__title', { type: 'lines', mask: 'lines', linesClass: 'line' });
      gsap.timeline({ scrollTrigger: { trigger: '.foot__cta', start: 'top 75%' } })
        .from(split.lines, { yPercent: 110, duration: 1.3, stagger: 0.08, ease: 'expo.out' })
        .from('.foot__cta-row > *', { y: 40, opacity: 0, duration: 1, stagger: 0.08, ease: 'expo.out' }, 0.3);

      gsap.timeline({ scrollTrigger: { trigger: '.foot__grid', start: 'top 85%' } })
        .from('.foot__rule', { scaleX: 0, duration: 1.4, ease: 'expo.inOut' })
        .from('.foot__col > *', { y: 24, opacity: 0, duration: 0.9, stagger: 0.03, ease: 'expo.out' }, 0.4);

      // Wordmark letters rise out of the floor, outside-in, scrubbed to scroll
      gsap.from('.foot__char', {
        yPercent: 105,
        ease: 'none',
        stagger: { each: 0.08, from: 'edges' },
        scrollTrigger: { trigger: '.foot__mark-wrap', start: 'top bottom', end: 'bottom bottom', scrub: 1 },
      });
    });
  }, { scope: root });

  const go = (e, hash) => {
    e.preventDefault();
    if (pathname === '/') scrollTo(hash, { duration: 1.6 });
    else navigate('/' + hash);
  };

  return (
    <footer ref={root} id="contact" className="foot">
      <div className="wrap foot__cta">
        <span className="label">(Contact)</span>
        <h2 className="foot__title">
          Let’s make something <br className="foot__br" />that <span className="accent">moves</span>.
        </h2>
        <div className="foot__cta-row">
          <a href="mailto:hello@northfold.studio" className="foot__mail" data-cursor="Write">
            <Roll>hello@northfold.studio</Roll>
            <svg className="foot__arrow" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 18 18 6M8 6h10v10" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </a>
          <p className="foot__note">
            Tell us about the brand, the deadline and what success looks like.
            A senior creative reads every brief.
          </p>
        </div>
      </div>

      <div className="wrap foot__grid">
        <span className="foot__rule" />
        <div className="foot__col">
          <span className="label">Sitemap</span>
          {SITEMAP.map(l => (
            <a key={l.label} href={'/' + l.hash} onClick={e => go(e, l.hash)}><Roll>{l.label}</Roll></a>
          ))}
        </div>
        <div className="foot__col">
          <span className="label">Follow</span>
          {SOCIAL.map(s => (
            <a key={s} href="#" onClick={e => e.preventDefault()}><Roll>{s} ↗</Roll></a>
          ))}
        </div>
        <div className="foot__col">
          <span className="label">New business</span>
          <a href="mailto:new@northfold.studio"><Roll>new@northfold.studio</Roll></a>
          <p className="foot__muted">Independent studio,<br />working worldwide.</p>
        </div>
        <div className="foot__col">
          <span className="label">Availability</span>
          <p className="foot__avail"><i className="foot__dot" /> Booking projects for 2027</p>
          <p className="foot__muted">We reply within two working days.</p>
        </div>
      </div>

      <div className="foot__mark-wrap" aria-hidden="true" data-cursor-zone="arrow">
        <div ref={mark} className="foot__mark">
          {WORDMARK.split('').map((c, i) => (
            <span key={i} className="foot__char"><span>{c}</span></span>
          ))}
        </div>
      </div>

      <div className="wrap foot__base label">
        <span>© {new Date().getFullYear()} Northfold Studio</span>
        <span className="foot__tag">Brand · Motion · Digital</span>
        <button type="button" onClick={() => scrollTo(0, { duration: 2 })}>
          <Roll>Back to top ↑</Roll>
        </button>
      </div>

      <style>{`
        .foot {
          position: relative; z-index: 2; overflow: hidden;
          background: var(--bg);
          padding-top: clamp(96px, 12vw, 200px);
        }

        /* CTA */
        .foot__cta { display: flex; flex-direction: column; gap: clamp(24px, 3vw, 40px); }
        .foot__title {
          font-weight: 400; font-size: clamp(42px, 7vw, 128px);
          line-height: .98; letter-spacing: -0.05em; max-width: 13ch;
        }
        .foot__cta-row {
          display: flex; justify-content: space-between; align-items: flex-end; gap: 32px;
          margin-top: clamp(8px, 2vw, 24px);
        }
        .foot__mail {
          display: inline-flex; align-items: center; gap: .3em;
          font-size: clamp(22px, 3.2vw, 52px); letter-spacing: -0.03em;
          padding-bottom: 10px; border-bottom: 1px solid var(--line);
          transition: border-color .6s var(--ease);
        }
        .foot__mail:hover { border-color: var(--white); }
        .foot__mail .roll { height: 1.15em; line-height: 1.15em; }
        .foot__arrow { width: .8em; height: .8em; flex: none; transition: transform .6s var(--ease); }
        .foot__mail:hover .foot__arrow { transform: translate(.12em, -.12em); color: var(--accent); }
        .foot__note { max-width: 32ch; color: var(--muted); font-size: clamp(15px, 1.2vw, 18px); line-height: 1.45; }

        /* Columns */
        .foot__grid {
          position: relative;
          display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 32px;
          margin-top: clamp(80px, 10vw, 160px); padding-top: 32px;
        }
        .foot__rule {
          position: absolute; top: 0; left: var(--pad-x); right: var(--pad-x);
          height: 1px; background: var(--line); transform-origin: left;
        }
        .foot__col { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; font-size: 17px; line-height: 1.4; }
        .foot__col .label { margin-bottom: 10px; }
        .foot__col a .roll { height: 1.4em; line-height: 1.4em; }
        .foot__muted { color: var(--muted); font-size: 15px; margin-top: 8px; }
        .foot__avail { display: flex; align-items: center; gap: 10px; }
        .foot__dot { width: 8px; height: 8px; border-radius: 50%; background: #3ddc84; flex: none; box-shadow: 0 0 0 0 rgba(61,220,132,.6); animation: footPing 2.4s ease-out infinite; }
        @keyframes footPing { 70% { box-shadow: 0 0 0 10px rgba(61,220,132,0); } 100% { box-shadow: 0 0 0 0 rgba(61,220,132,0); } }

        /* Wordmark */
        .foot__mark-wrap {
          margin: clamp(56px, 7vw, 120px) var(--pad-x) 0;
          overflow: hidden;
        }
        .foot__mark {
          display: flex; width: max-content;
          font-weight: 500; line-height: .78; letter-spacing: -0.045em;
          padding: .05em .04em 0 0; white-space: nowrap;
        }
        .foot__char { display: inline-block; }
        .foot__char > span { display: inline-block; transition: transform .7s var(--ease), color .5s var(--ease); }
        .foot__mark:hover .foot__char > span { color: #262626; }
        .foot__mark .foot__char:hover > span { color: var(--accent); transform: translateY(-6%); }

        /* Base */
        .foot__base {
          display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 16px;
          padding-top: 20px; padding-bottom: 24px; border-top: 1px solid var(--line); margin-top: 0;
        }
        .foot__base button { justify-self: end; color: var(--white); font: inherit; letter-spacing: inherit; text-transform: inherit; }
        .foot__base .roll { height: 1.3em; line-height: 1.3em; }

        @media (max-width: 900px) {
          .foot__grid { grid-template-columns: 1fr 1fr; row-gap: 44px; }
        }
        @media (max-width: 640px) {
          .foot { padding-top: 88px; }
          .foot__br { display: none; }
          .foot__title { font-size: clamp(40px, 12.5vw, 64px); }
          .foot__cta-row { flex-direction: column; align-items: stretch; gap: 28px; }
          .foot__mail { font-size: clamp(20px, 6.6vw, 30px); justify-content: space-between; width: 100%; }
          .foot__grid { margin-top: 72px; column-gap: 20px; }
          .foot__col { font-size: 16px; }
          .foot__mark-wrap { margin-top: 64px; }
          .foot__base { grid-template-columns: 1fr auto; row-gap: 8px; padding-bottom: 20px; }
          .foot__tag { display: none; }
        }
      `}</style>
    </footer>
  );
}
