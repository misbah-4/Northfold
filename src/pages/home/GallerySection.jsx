import { useEffect, useRef, useState } from 'react';
import ImageSlot from '../../components/ImageSlot.jsx';

/* ── Data ─────────────────────────────────────────────────────── */
const FRAMES = [
  ['Halden',    'Bag family',       '4 / 5'],
  ['Signal FM', 'Ident still',      '16 / 10'],
  ['Atlas',     'Wayfinding',       '4 / 5'],
  ['Mora',      'Carton detail',    '1 / 1'],
  ['Tidewater', 'Poster wall',      '4 / 5'],
  ['Orbit',     'App screens',      '16 / 10'],
  ['Parallel',  'Cover series',     '1 / 1'],
  ['Northline', 'Field shoot',      '4 / 5'],
].map(([proj, what, ratio], i) => ({
  num: String(i + 1).padStart(2, '0'),
  label: `${proj} — ${what}`,
  ratio,
}));

const REVEALS = [
  ['Mora',      'Packaging — carton system'],
  ['Signal FM', 'Motion — live logotype'],
  ['Parallel',  'Graphic design — cover series'],
].map(([title, label], i) => ({
  title, label, num: String(i + 1).padStart(2, '0'),
}));

const DISCIPLINES = [
  'Brand Identity', 'Art Direction', 'Graphic Design',
  'Digital Design', 'Social Media', 'Packaging', 'Motion Graphics',
];

const EASE = 'cubic-bezier(.2,.7,.2,1)';
const motionOk = () => !matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Horizontal scroll strip ─────────────────────────────────── */
function Strip() {
  const secRef   = useRef(null);
  const trackRef = useRef(null);

  const updateStrip = () => {
    const sec = secRef.current, tr = trackRef.current;
    if (!sec || !tr) return;
    const r     = sec.getBoundingClientRect();
    const total = sec.offsetHeight - window.innerHeight;
    const p     = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
    tr.style.transform = `translate3d(${-p * Math.max(0, tr.scrollWidth - window.innerWidth)}px,0,0)`;
  };

  useEffect(() => {
    const sec = secRef.current, tr = trackRef.current;
    const onResize = () => {
      if (sec && tr)
        sec.style.height = Math.max(window.innerHeight, tr.scrollWidth - window.innerWidth + window.innerHeight) + 'px';
      updateStrip();
    };
    const onScroll = () => { requestAnimationFrame(updateStrip); };

    onResize();
    window.addEventListener('resize', onResize);
    document.addEventListener('scroll', onScroll, { passive: true });
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(onResize);
      if (tr) ro.observe(tr);
      return () => { ro.disconnect(); window.removeEventListener('resize', onResize); document.removeEventListener('scroll', onScroll); };
    }
    return () => { window.removeEventListener('resize', onResize); document.removeEventListener('scroll', onScroll); };
  }, []);

  return (
    <div ref={secRef} style={{ position: 'relative', height: '300vh' }}>
      <div style={{
        position: 'sticky', top: 0, height: '100svh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28,
      }}>
        {/* Strip header */}
        <div style={{
          maxWidth: 'var(--max-w)', width: '100%', margin: '0 auto',
          padding: '0 var(--pad-x)',
          display: 'flex', justifyContent: 'space-between', gap: 16,
          fontFamily: 'var(--mono)', fontSize: 13,
          textTransform: 'uppercase', color: '#a3a3a3',
        }}>
          <span>Frames from the studio, 2024–2026</span>
          <span>Keep scrolling →</span>
        </div>

        {/* Scrolling track */}
        <div
          ref={trackRef}
          style={{
            display: 'flex', alignItems: 'flex-end',
            gap: 'clamp(12px,1.6vw,24px)',
            padding: '0 var(--pad-x)',
            width: 'max-content', willChange: 'transform',
          }}
        >
          {FRAMES.map((f, i) => (
            <figure key={i} style={{ flex: 'none', margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{
                height: 'min(60svh, 600px)',
                aspectRatio: f.ratio,
                borderRadius: 4, overflow: 'hidden',
                background: '#1c1c1c',
              }}>
                <ImageSlot label={f.label} dark />
              </div>
              <figcaption style={{
                margin: 0, display: 'flex',
                justifyContent: 'space-between', gap: 16,
                fontFamily: 'var(--mono)', fontSize: 12,
                textTransform: 'uppercase', color: '#a3a3a3',
              }}>
                <span style={{ color: '#ee3524' }}>{f.num}</span>
                <span>{f.label}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Image reveal cards ──────────────────────────────────────── */
function RevealCard({ title, label, num, narrow }) {
  const [active, setActive] = useState(false);

  const handleEnter = () => { if (!narrow) setActive(true); };
  const handleLeave = () => { if (!narrow) setActive(false); };
  const handleClick = () => { if (narrow) setActive(a => !a); };

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      style={{
        position: 'relative', aspectRatio: '4 / 5',
        borderRadius: 4, overflow: 'hidden',
        background: '#1c1c1c', cursor: 'pointer',
      }}
    >
      {/* Info layer */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'clamp(18px,2vw,28px)',
      }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: '#ee3524' }}>{num}</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{
            fontSize: 'clamp(32px,3.4vw,52px)', fontWeight: 900,
            lineHeight: 0.9, letterSpacing: '-0.045em', textTransform: 'uppercase',
          }}>
            {title}
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, textTransform: 'uppercase', color: '#a3a3a3' }}>
            {label}
          </span>
        </div>
      </div>

      {/* Reveal image layer */}
      <div style={{
        position: 'absolute', inset: 0,
        background: '#262626',
        transition: 'clip-path .9s cubic-bezier(.7,0,.2,1)',
        clipPath: active ? 'inset(0 0 0 0)' : 'inset(100% 0 0 0)',
      }}>
        <ImageSlot label={`${title} — ${label}`} dark />
      </div>
    </div>
  );
}

/* ── Animated letters ────────────────────────────────────────── */
function MottoLetters() {
  const words = 'Make it move'.split(' ');
  return (
    <div
      aria-label="Make it move"
      style={{
        display: 'flex', flexWrap: 'wrap',
        columnGap: '0.22em',
        fontSize: 'clamp(64px,15vw,260px)', fontWeight: 900,
        lineHeight: 0.85, letterSpacing: '-0.06em',
        textTransform: 'uppercase', marginLeft: '-0.04em',
      }}
    >
      {words.map((word, wi) => (
        <span key={wi} style={{ display: 'inline-flex', whiteSpace: 'nowrap' }}>
          {word.split('').map((ch, ci) => (
            <span
              key={ci}
              aria-hidden="true"
              style={{ display: 'inline-block', cursor: 'default', transition: 'transform .45s cubic-bezier(.2,.7,.2,1), color .25s ease' }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-0.12em) rotate(-6deg)'; e.target.style.color = '#ee3524'; }}
              onMouseLeave={e => { e.target.style.transform = 'none'; e.target.style.color = 'inherit'; }}
            >
              {ch}
            </span>
          ))}
        </span>
      ))}
    </div>
  );
}

/* ── Marquee ──────────────────────────────────────────────────── */
function Marquee() {
  const ref = useRef(null);
  const items = [...DISCIPLINES, ...DISCIPLINES];

  useEffect(() => {
    const el = ref.current;
    if (!el || !motionOk()) return;
    const anim = el.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }],
      { duration: 32000, iterations: Infinity }
    );
    return () => anim.cancel();
  }, []);

  return (
    <div style={{ marginTop: 'clamp(40px,5vw,72px)', borderTop: '1px solid #2a2a2a', borderBottom: '1px solid #2a2a2a', overflow: 'hidden' }}>
      <div ref={ref} style={{ display: 'flex', width: 'max-content', padding: '18px 0' }}>
        {items.map((m, i) => (
          <span key={i} style={{
            flex: 'none', display: 'flex', alignItems: 'center',
            gap: 28, paddingRight: 28,
            fontSize: 'clamp(22px,2.4vw,36px)', fontWeight: 800,
            letterSpacing: '-0.03em', textTransform: 'uppercase', whiteSpace: 'nowrap',
          }}>
            {m}
            <span style={{ width: 10, height: 10, background: '#ee3524', display: 'block' }} />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Main export ─────────────────────────────────────────────── */
export default function GallerySection() {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 820);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <section id="gallery" style={{ marginTop: 'clamp(120px,13vw,200px)', background: '#0b0b0b', color: '#fff' }}>
      {/* Heading */}
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: 'clamp(80px,9vw,140px) var(--pad-x) 0' }}>
        <h2 style={{
          fontSize: 'clamp(44px,7vw,112px)', fontWeight: 900,
          lineHeight: 0.88, letterSpacing: '-0.05em',
          textTransform: 'uppercase', margin: '0 0 0 -0.03em',
        }}>
          <span style={{ display: 'block' }}>Interactive</span>
          <span style={{ display: 'block', color: '#ee3524' }}>gallery</span>
        </h2>
      </div>

      {/* Horizontal scroll strip */}
      <Strip />

      {/* Reveal cards */}
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: 'clamp(80px,9vw,140px) var(--pad-x) 0' }}>
        <div style={{
          display: 'flex', flexWrap: 'wrap',
          justifyContent: 'space-between', gap: 12, marginBottom: 20,
          fontFamily: 'var(--mono)', fontSize: 13,
          textTransform: 'uppercase', color: '#a3a3a3',
        }}>
          <span>Image reveals</span>
          <span>Hover or tap a card</span>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 'clamp(12px,1.6vw,24px)',
        }}>
          {REVEALS.map(r => (
            <RevealCard key={r.title} {...r} narrow={narrow} />
          ))}
        </div>
      </div>

      {/* Motto + marquee */}
      <div style={{ padding: 'clamp(80px,9vw,140px) 0' }}>
        <div style={{
          maxWidth: 'var(--max-w)', margin: '0 auto 24px',
          padding: '0 var(--pad-x)',
          display: 'flex', flexWrap: 'wrap',
          justifyContent: 'space-between', gap: 12,
          fontFamily: 'var(--mono)', fontSize: 13,
          textTransform: 'uppercase', color: '#a3a3a3',
        }}>
          <span>Our motto, in motion</span>
        </div>
        <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '0 var(--pad-x)' }}>
          <MottoLetters />
        </div>
        <Marquee />
      </div>
    </section>
  );
}
