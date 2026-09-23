import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Work',     href: '/#work' },
  { label: 'Studio',   href: '/#studio' },
  { label: 'Services', href: '/#services' },
  { label: 'Gallery',  href: '/#gallery' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [narrow, setNarrow]     = useState(false);
  const [menuOpen, setMenu]     = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onResize = () => {
      const n = window.innerWidth < 820;
      setNarrow(n);
      if (!n) setMenu(false);
    };
    onScroll(); onResize();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Smooth-scroll anchor links that are on the home page
  const handleAnchor = (e, href) => {
    if (!isHome) return; // let React Router handle navigation
    const hash = href.split('#')[1];
    if (!hash) return;
    e.preventDefault();
    setMenu(false);
    document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
  };

  const borderCol = scrolled || menuOpen ? '#e3e3e0' : 'transparent';

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#fff',
        borderBottom: `1px solid ${borderCol}`,
        transition: 'border-color .3s ease',
      }}>
        <div style={{
          maxWidth: 'var(--max-w)', margin: '0 auto',
          padding: '14px var(--pad-x)',
          display: 'flex', alignItems: 'center', gap: 32,
        }}>
          <Link
            to="/"
            style={{
              fontSize: 20, fontWeight: 900, letterSpacing: '-0.03em',
              textTransform: 'uppercase', color: '#0b0b0b',
              textDecoration: 'none', marginRight: 'auto',
            }}
          >
            Northfold
          </Link>

          {!narrow && (
            <>
              <nav style={{ display: 'flex', gap: 28, alignItems: 'center', fontSize: 15, fontWeight: 500 }}>
                {NAV_LINKS.map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    onClick={(e) => handleAnchor(e, href)}
                    style={{ color: '#0b0b0b', textDecoration: 'none' }}
                    onMouseEnter={e => e.target.style.color = '#ee3524'}
                    onMouseLeave={e => e.target.style.color = '#0b0b0b'}
                  >
                    {label}
                  </a>
                ))}
              </nav>
              <a
                href="mailto:hello@northfold.studio?subject=New%20project"
                className="btn-cta btn-cta--sm"
              >
                Start a project
              </a>
            </>
          )}

          {narrow && (
            <button
              type="button"
              id="nav-menu-btn"
              onClick={() => setMenu(o => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              style={{
                minWidth: 44, minHeight: 44, padding: '0 14px',
                background: 'transparent', border: '1px solid #0b0b0b',
                borderRadius: 4, color: '#0b0b0b',
                fontFamily: 'var(--mono)', fontSize: 13,
                textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              {menuOpen ? 'Close' : 'Menu'}
            </button>
          )}
        </div>
      </header>

      {/* Mobile fullscreen menu */}
      {narrow && menuOpen && (
        <div style={{
          position: 'fixed', inset: '73px 0 0 0', zIndex: 45,
          background: '#fff', padding: '32px var(--pad-x) 40px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={(e) => { handleAnchor(e, href); setMenu(false); }}
                style={{
                  fontSize: 'clamp(48px,14vw,88px)', fontWeight: 900,
                  lineHeight: 0.95, letterSpacing: '-0.045em',
                  textTransform: 'uppercase', color: '#0b0b0b',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => e.target.style.color = '#ee3524'}
                onMouseLeave={e => e.target.style.color = '#0b0b0b'}
              >
                {label}
              </a>
            ))}
          </nav>
          <a
            href="mailto:hello@northfold.studio?subject=New%20project"
            style={{
              alignSelf: 'stretch', display: 'flex', alignItems: 'center',
              justifyContent: 'center', minHeight: 52,
              background: '#ee3524', color: '#fff',
              textDecoration: 'none', fontFamily: 'var(--mono)',
              fontSize: 14, textTransform: 'uppercase', borderRadius: 4,
            }}
          >
            Start a project
          </a>
        </div>
      )}
    </>
  );
}
