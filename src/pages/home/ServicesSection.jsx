import { useState } from 'react';

const SERVICES = [
  ['Brand Identity',     'Names, marks, type, colour and the rules that hold them together.'],
  ['Art Direction',      'Shoots, films and campaigns directed from concept to final frame.'],
  ['Graphic Design',     'Print, editorial and environmental design with a point of view.'],
  ['Digital Design',     'Websites, products and interfaces that look as good as they work.'],
  ['Social Media Design','Content systems built for the feed, not resized for it.'],
  ['Packaging Design',   'Structures and graphics that win on shelf and survive shipping.'],
  ['Motion Graphics',    'Idents, product films and identities that move.'],
];

function ServiceRow({ num, name, desc }) {
  const [hot, setHot] = useState(false);
  return (
    <div
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: 'clamp(40px,5vw,80px) minmax(0,1.2fr) minmax(0,1fr)',
        gap: '8px 24px', alignItems: 'center',
        padding: 'clamp(18px,2vw,28px) clamp(0px,1vw,16px)',
        borderTop: '1px solid #0b0b0b',
        background: hot ? '#0b0b0b' : 'transparent',
        color: hot ? '#fff' : '#0b0b0b',
        transition: 'background .3s ease, color .3s ease',
      }}
    >
      <span style={{ fontFamily: 'var(--mono)', fontSize: 14, color: '#ee3524' }}>{num}</span>
      <span style={{
        fontSize: 'clamp(26px,3.8vw,60px)', fontWeight: 900,
        lineHeight: 0.95, letterSpacing: '-0.045em', textTransform: 'uppercase',
      }}>
        {name}
      </span>
      <span style={{ fontSize: 16, lineHeight: 1.5, opacity: 0.7 }}>{desc}</span>
    </div>
  );
}

export default function ServicesSection() {
  return (
    <section
      id="services"
      style={{
        maxWidth: 'var(--max-w)', margin: '0 auto',
        padding: 'clamp(120px,13vw,200px) var(--pad-x) 0',
      }}
    >
      <div style={{
        display: 'flex', flexWrap: 'wrap',
        justifyContent: 'space-between', alignItems: 'flex-end',
        gap: 20, marginBottom: 'clamp(28px,3vw,40px)',
      }}>
        <h2 style={{
          fontSize: 'clamp(44px,7vw,112px)', fontWeight: 900,
          lineHeight: 0.88, letterSpacing: '-0.05em',
          textTransform: 'uppercase', margin: '0 0 0 -0.03em',
        }}>
          Services
        </h2>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: 13,
          textTransform: 'uppercase', color: '#5e5e5e',
        }}>
          Strategy to launch, under one roof
        </span>
      </div>

      <div style={{ borderBottom: '1px solid #0b0b0b' }}>
        {SERVICES.map(([name, desc], i) => (
          <ServiceRow
            key={name}
            num={String(i + 1).padStart(2, '0')}
            name={name}
            desc={desc}
          />
        ))}
      </div>
    </section>
  );
}
