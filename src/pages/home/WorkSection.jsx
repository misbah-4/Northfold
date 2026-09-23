import { useState } from 'react';
import { Link } from 'react-router-dom';
import ImageSlot from '../../components/ImageSlot.jsx';

const CATS = ['All', 'Brand Identity', 'Graphic Design', 'UI/UX', 'Campaign Design', 'Packaging', 'Motion/Video'];

export default function WorkSection({ projects }) {
  const [filter, setFilter] = useState('All');
  const [hot,    setHot]    = useState(-1);

  const visible = projects.filter(p =>
    filter === 'All' || p.category === filter
  );

  return (
    <section
      id="work"
      style={{
        maxWidth: 'var(--max-w)', margin: '0 auto',
        paddingTop: 'clamp(80px,9vw,140px)',
        paddingLeft: 'var(--pad-x)', paddingRight: 'var(--pad-x)',
        borderTop: '1px solid #e3e3e0',
      }}
    >
      {/* Heading */}
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
          Selected work
        </h2>
      </div>

      {/* Filter tabs */}
      <div style={{
        display: 'flex', gap: 24, overflowX: 'auto',
        scrollbarWidth: 'none',
        borderBottom: '1px solid #e3e3e0',
        marginBottom: 'clamp(28px,3vw,40px)',
      }} className="no-scrollbar">
        {CATS.map(cat => {
          const on = filter === cat;
          return (
            <button
              key={cat}
              type="button"
              id={`filter-${cat.toLowerCase().replace(/[^a-z]/g, '-')}`}
              onClick={() => { setFilter(cat); setHot(-1); }}
              style={{
                flex: 'none', whiteSpace: 'nowrap',
                background: 'transparent', border: 0,
                borderBottom: `2px solid ${on ? '#ee3524' : 'transparent'}`,
                marginBottom: -1, padding: '12px 0', minHeight: 44,
                cursor: 'pointer', fontFamily: 'var(--mono)',
                fontSize: 13, textTransform: 'uppercase',
                color: on ? '#0b0b0b' : '#8a8a8a',
                transition: 'color .2s ease, border-color .2s ease',
              }}
              onMouseEnter={e => { if (!on) e.target.style.color = '#0b0b0b'; }}
              onMouseLeave={e => { if (!on) e.target.style.color = '#8a8a8a'; }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 440px), 1fr))',
        gap: 'clamp(36px,4vw,56px) clamp(16px,2vw,24px)',
        paddingBottom: 0,
      }}>
        {projects.map((p, i) => {
          const show = filter === 'All' || p.category === filter;
          const isHot = hot === i;
          return (
            <Link
              key={p.slug}
              to={`/case-study/${p.slug}`}
              id={`project-tile-${p.slug}`}
              onMouseEnter={() => setHot(i)}
              onMouseLeave={() => setHot(-1)}
              style={{
                display: show ? 'flex' : 'none',
                flexDirection: 'column', gap: 14,
                textDecoration: 'none', color: '#0b0b0b',
              }}
            >
              {/* Thumbnail */}
              <div style={{
                position: 'relative', height: 391,
                overflow: 'hidden', borderRadius: 4, background: '#f2f2ef',
              }}>
                {/* Scale wrapper */}
                <div style={{
                  position: 'absolute', inset: 0,
                  transition: 'transform 1s cubic-bezier(.2,.7,.2,1)',
                  transform: isHot ? 'scale(1.04)' : 'scale(1)',
                }}>
                  <ImageSlot label={`Cover — ${p.title}`} />
                </div>

                {/* Hover overlay */}
                <div style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  background: 'rgba(11,11,11,0.78)',
                  opacity: isHot ? 1 : 0,
                  transition: 'opacity .4s ease',
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: 'clamp(16px,2vw,28px)',
                  color: '#fff',
                }}>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 13,
                    textTransform: 'uppercase', color: '#ee3524',
                    transition: 'transform .5s cubic-bezier(.2,.7,.2,1)',
                    transform: isHot ? 'none' : 'translateY(-16px)',
                  }}>
                    {p.category}
                  </span>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-end', gap: 16,
                    transition: 'transform .5s cubic-bezier(.2,.7,.2,1)',
                    transform: isHot ? 'none' : 'translateY(24px)',
                  }}>
                    <span style={{
                      fontSize: 'clamp(28px,3.4vw,56px)', fontWeight: 900,
                      lineHeight: 0.9, letterSpacing: '-0.045em',
                      textTransform: 'uppercase',
                    }}>
                      {p.title}
                    </span>
                    <span style={{ flex: 'none', fontFamily: 'var(--mono)', fontSize: 13, textTransform: 'uppercase' }}>
                      View case →
                    </span>
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div style={{
                display: 'flex', flexWrap: 'wrap',
                justifyContent: 'space-between', alignItems: 'baseline',
                gap: '4px 16px',
              }}>
                <h3 style={{
                  fontSize: 'clamp(20px,1.8vw,26px)', fontWeight: 800,
                  letterSpacing: '-0.03em', textTransform: 'uppercase', margin: 0,
                }}>
                  {p.title}
                </h3>
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 12,
                  textTransform: 'uppercase', color: '#5e5e5e',
                }}>
                  {p.category} / {p.year}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
