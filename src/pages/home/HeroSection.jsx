import { useEffect, useRef, useState } from 'react';

const WORDS = ['move', 'speak', 'last', 'sell'];
const EASE  = 'cubic-bezier(.2,.7,.2,1)';

export default function HeroSection() {
  const [wordIdx, setWordIdx] = useState(0);
  const wordRef   = useRef(null);
  const heroLines = useRef([]);
  const heroFade  = useRef(null);

  const motionOk = () =>
    !matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Entrance animations ── */
  useEffect(() => {
    if (!motionOk()) return;

    heroLines.current.forEach((el, i) => {
      if (!el) return;
      el.animate(
        [{ transform: 'translateY(105%)' }, { transform: 'none' }],
        { duration: 1100, delay: 120 + i * 140, easing: EASE, fill: 'backwards' }
      );
    });

    if (heroFade.current) {
      heroFade.current.animate(
        [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }],
        { duration: 900, delay: 650, easing: EASE, fill: 'backwards' }
      );
    }
  }, []);

  /* ── Rotating word ── */
  useEffect(() => {
    const id = setInterval(() => {
      if (!motionOk()) return;
      setWordIdx(i => (i + 1) % WORDS.length);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  /* Animate word swap */
  useEffect(() => {
    if (!wordRef.current || !motionOk()) return;
    wordRef.current.animate(
      [{ transform: 'translateY(60%)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 650, easing: EASE }
    );
  }, [wordIdx]);

  return (
    <section
      id="top"
      style={{
        maxWidth: 'var(--max-w)', margin: '0 auto',
        padding: 'clamp(56px,8vw,120px) var(--pad-x) clamp(40px,5vw,72px)',
        minHeight: 'calc(100svh - 73px)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', gap: 48,
      }}
    >
      <h1 style={{
        fontSize: 'clamp(52px,10vw,160px)', fontWeight: 900,
        lineHeight: 0.86, letterSpacing: '-0.055em',
        textTransform: 'uppercase', margin: '0 0 0 -0.04em',
      }}>
        <span style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.04em' }}>
          <span ref={el => heroLines.current[0] = el} style={{ display: 'block' }}>
            We make brands
          </span>
        </span>
        <span style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.06em' }}>
          <span ref={el => heroLines.current[1] = el} style={{ display: 'block' }}>
            that{' '}
            <span ref={wordRef} style={{ display: 'inline-block', color: '#ee3524' }}>
              {WORDS[wordIdx]}
            </span>
            .
          </span>
        </span>
      </h1>

      <div
        ref={heroFade}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '32px clamp(32px,6vw,120px)',
          alignItems: 'end',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 560 }}>
          <h2 style={{
            fontSize: 'clamp(22px,2vw,28px)', fontWeight: 700,
            letterSpacing: '-0.02em', lineHeight: 1.15, margin: 0,
          }}>
            Independent brand &amp; motion studio
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.55, margin: 0, color: '#5e5e5e' }}>
            Northfold builds identities, campaigns and digital products for companies
            with something worth saying. Strategy, design and motion under one roof.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
            <a
              href="mailto:hello@northfold.studio?subject=New%20project"
              className="btn-cta"
              id="hero-cta"
            >
              Start a project
            </a>
          </div>
        </div>

        <div style={{
          fontFamily: 'var(--mono)', fontSize: 13,
          textTransform: 'uppercase', color: '#5e5e5e',
          justifySelf: 'start', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ width: 8, height: 8, background: '#ee3524', display: 'block' }} />
          Now booking projects for 2027
        </div>
      </div>
    </section>
  );
}
