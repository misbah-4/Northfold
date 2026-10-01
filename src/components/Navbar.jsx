import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { gsap, ScrollTrigger, useGSAP, scrollTo, lockScroll, magnetic, press, introDone } from '../lib/motion.js';
import { coinBurst } from '../lib/coinBurst.js';

const LINKS = [
  { label: 'Work',     hash: '#work' },
  { label: 'Studio',   hash: '#studio' },
  { label: 'Services', hash: '#services' },
  { label: 'Contact',  hash: '#contact' },
];

function Roll({ children }) {
  return (
    <span className="roll"><span>{children}</span><span aria-hidden="true">{children}</span></span>
  );
}

export default function Navbar() {
  const root = useRef(null);
  const menu = useRef(null);
  const burger = useRef(null);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const first = useRef(true);

  const go = (e, hash) => {
    e.preventDefault();
    setOpen(false);
    if (pathname === '/') scrollTo(hash, { duration: 1.6 });
    else navigate('/' + hash);
  };

  /* Intro + hide on scroll down, show on scroll up */
  useGSAP(() => {
    gsap.set(root.current, { yPercent: -100 });
    introDone.then(() => gsap.to(root.current, { yPercent: 0, duration: 1.2, ease: 'expo.out', delay: 0.5 }));

    let shown = true;
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: self => {
        const show = self.direction === -1 || self.scroll() < 120;
        if (show !== shown) {
          shown = show;
          gsap.to(root.current, { yPercent: show ? 0 : -100, duration: 0.8, ease: 'expo.out', overwrite: 'auto' });
        }
      },
    });
  }, { scope: root });

  /* Magnetic burger */
  useEffect(() => {
    const offs = [magnetic(burger.current, { strength: 0.4 }), press(burger.current)];
    return () => offs.forEach(f => f());
  }, []);

  /* Fullscreen menu timeline */
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const m = menu.current;
    lockScroll(open);
    if (open) {
      gsap.timeline()
        .set(m, { display: 'flex' })
        .fromTo(m, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'expo.inOut' })
        .fromTo(m.querySelectorAll('.menu__link'), { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.06, ease: 'expo.out' }, '-=0.35')
        .fromTo(m.querySelectorAll('.menu__foot > *'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.05 }, '-=0.7');
    } else {
      gsap.timeline({ onComplete: () => gsap.set(m, { display: 'none' }) })
        .to(m.querySelectorAll('.menu__link'), { yPercent: -110, duration: 0.5, stagger: 0.03, ease: 'expo.in' })
        .to(m, { clipPath: 'inset(0 0 100% 0)', duration: 0.7, ease: 'expo.inOut' }, '-=0.2');
    }
  }, [open]);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <header ref={root} className={`nav${open ? ' is-menu' : ''}`}>
        <div className="nav__inner wrap">
          <Link to="/" className="nav__logo" aria-label="Northfold home" onClick={e => { coinBurst(e.currentTarget); if (pathname === '/') { e.preventDefault(); scrollTo(0, { duration: 1.6 }); } }}>
            <Roll>Northfold</Roll>
          </Link>
          <span className="nav__status label">
            <i className="nav__dot" /> Booking 2027
          </span>
          <nav className="nav__links" aria-label="Primary">
            {LINKS.map(l => (
              <a key={l.label} href={'/' + l.hash} onClick={e => go(e, l.hash)}>
                <Roll>{l.label}</Roll>
              </a>
            ))}
          </nav>
          <button
            ref={burger}
            type="button"
            className={`nav__burger${open ? ' is-open' : ''}`}
            aria-expanded={open}
            aria-controls="menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(o => !o)}
          >
            <span /><span />
          </button>
        </div>
      </header>

      <div ref={menu} id="menu" className="menu" style={{ display: 'none' }}>
        <nav className="menu__nav wrap" aria-label="Menu">
          {LINKS.map((l, i) => (
            <a key={l.label} href={'/' + l.hash} onClick={e => go(e, l.hash)} className="menu__row">
              <span className="label">0{i + 1}</span>
              <span className="menu__mask"><span className="menu__link">{l.label}</span></span>
            </a>
          ))}
        </nav>
        <div className="menu__foot wrap">
          <a href="mailto:hello@northfold.studio" className="u-link">hello@northfold.studio</a>
          <span className="label">Instagram · LinkedIn · Vimeo</span>
        </div>
      </div>

      <style>{`
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 80;
          mix-blend-mode: difference; color: #fff;
        }
        .nav.is-menu { mix-blend-mode: normal; color: #0b0b0b; }
        .nav.is-menu .nav__status { color: #0b0b0b; }
        .nav__inner {
          height: var(--nav-h);
          display: flex; align-items: center; gap: 32px;
        }
        .nav__logo { display: inline-block; font-size: 26px; letter-spacing: -0.04em; font-weight: 500; }
        .nav__status { display: flex; align-items: center; gap: 8px; color: #fff; opacity: .7; }
        .nav__dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; animation: navPing 2.4s ease-in-out infinite; }
        @keyframes navPing { 50% { opacity: .2; } }
        .nav__links { margin-left: auto; display: flex; gap: clamp(24px, 4vw, 64px); font-size: 16px; }
        .nav__burger { display: none; width: 48px; height: 48px; border-radius: 50%; position: relative; }
        .nav__burger span {
          position: absolute; left: 14px; right: 14px; height: 1.5px; background: currentColor;
          transition: transform .5s var(--ease), top .5s var(--ease);
        }
        .nav__burger span:first-child { top: 20px; }
        .nav__burger span:last-child { top: 27px; }
        .nav__burger.is-open span:first-child { top: 23.5px; transform: rotate(45deg); }
        .nav__burger.is-open span:last-child { top: 23.5px; transform: rotate(-45deg); }

        .menu {
          position: fixed; inset: 0; z-index: 79;
          background: var(--accent); color: #0b0b0b;
          flex-direction: column; justify-content: space-between;
          padding: calc(var(--nav-h) + 24px) 0 32px;
        }
        .menu__nav { display: flex; flex-direction: column; }
        .menu__row { display: flex; align-items: baseline; gap: 16px; border-bottom: 1px solid rgba(0,0,0,.18); padding: 6px 0; }
        .menu__row .label { color: rgba(0,0,0,.6); }
        .menu__mask { overflow: hidden; display: block; }
        .menu__link { display: block; font-size: clamp(48px, 13vw, 120px); letter-spacing: -0.05em; line-height: 1; }
        .menu__foot { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; font-size: 18px; }
        .menu__foot .label { color: rgba(0,0,0,.6); }

        @media (max-width: 860px) {
          .nav__links, .nav__status { display: none; }
          .nav__burger { display: block; margin-left: auto; }
        }
      `}</style>
    </>
  );
}
