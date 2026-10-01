import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, useGSAP, revealLines } from '../../lib/motion.js';
import Media from '../../components/Media.jsx';

export default function Work({ projects }) {
  const root = useRef(null);
  const track = useRef(null);

  useGSAP(() => {
    if (!projects.length) return;
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      revealLines('.work__title', { scrollTrigger: { trigger: '.work__title', start: 'top 85%' } });
    });

    /* Desktop: pin the section and translate the track sideways */
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const distance = () => track.current.scrollWidth - window.innerWidth;

      const scroller = gsap.to(track.current, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: '.work__pin',
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      /* Each card's art drifts against the track (parallax inside the frame) */
      gsap.utils.toArray('.card__art-in').forEach(art => {
        gsap.fromTo(art, { xPercent: -8 }, {
          xPercent: 8, ease: 'none',
          scrollTrigger: { trigger: art.parentElement, containerAnimation: scroller, start: 'left right', end: 'right left', scrub: true },
        });
      });

      /* Cards rise in as they enter from the right */
      gsap.utils.toArray('.card__meta').forEach(meta => {
        gsap.from(meta.children, {
          y: 40, opacity: 0, stagger: 0.06, duration: 1, ease: 'expo.out',
          scrollTrigger: { trigger: meta, containerAnimation: scroller, start: 'left 85%' },
        });
      });
    });

    /* Mobile: plain vertical list with per-card reveals */
    mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray('.card').forEach(card => {
        gsap.from(card, { y: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 90%' } });
      });
    });
  }, { scope: root, dependencies: [projects.length] });

  return (
    <section ref={root} id="work" className="work">
      <div className="work__pin">
        <div className="wrap work__head">
          <h2 className="h2 work__title">Selected work</h2>
          <span className="label">({String(projects.length).padStart(2, '0')}) Projects · 2026—27</span>
        </div>

        <div ref={track} className="work__track">
          {projects.map((p, i) => (
            <Link key={p.slug} to={`/case-study/${p.slug}`} className="card" data-cursor="View">
              <div className="card__art">
                <div className="card__art-in"><Media item={p.media?.[0]} /></div>
              </div>
              <div className="card__meta">
                <div className="card__row">
                  <h3 className="card__title">{p.title}</h3>
                  <span className="label">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <p className="card__tagline">{p.tagline}</p>
                <div className="card__tags">
                  {p.services.slice(0, 3).map(s => <span key={s} className="tag">{s}</span>)}
                </div>
              </div>
            </Link>
          ))}
          <a href="#contact" className="card card--end" data-cursor="Talk">
            <span className="label">Next could be yours</span>
            <span className="card__end-title">Start a<br />project <span className="accent">↗</span></span>
          </a>
        </div>

      </div>

      <style>{`
        .work { position: relative; }
        .work__pin {
          min-height: 100vh; display: flex; flex-direction: column; justify-content: center;
          gap: clamp(32px, 4vw, 56px); padding: calc(var(--nav-h) + 8px) 0 32px; overflow: hidden;
        }
        .work__head { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; }
        .work__track {
          display: flex; gap: clamp(16px, 1.6vw, 28px);
          padding: 0 var(--pad-x); width: max-content;
        }
        .card { flex: none; width: clamp(300px, 36vw, 620px); display: flex; flex-direction: column; gap: 18px; }
        .card:nth-child(3n + 2) { width: clamp(260px, 28vw, 480px); }
        .card__art { position: relative; overflow: hidden; aspect-ratio: 4 / 3; border-radius: 6px; background: var(--surface); }
        .card:nth-child(3n + 2) .card__art { aspect-ratio: 4 / 5; }
        .card__art-in {
          position: absolute; inset: 0 -12%;
          transition: transform 1s var(--ease);
        }
        .card__art-in .media { transition: transform 1.2s var(--ease); }
        .card:hover .card__art-in .media { transform: scale(1.06); }
        .card__meta { display: flex; flex-direction: column; gap: 10px; }
        .card__row { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; }
        .card__title { font-size: clamp(20px, 1.6vw, 28px); font-weight: 400; letter-spacing: -0.02em; }
        .card__tagline { color: var(--muted); font-size: 15px; line-height: 1.45; max-width: 40ch; }
        .card__tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .card--end {
          width: clamp(260px, 26vw, 420px); align-self: stretch;
          justify-content: space-between; padding: 28px;
          border: 1px solid var(--line); border-radius: 6px;
          transition: background .6s var(--ease), border-color .6s var(--ease);
        }
        .card--end:hover { background: var(--accent); border-color: var(--accent); }
        .card--end:hover .label, .card--end:hover .accent { color: #fff; }
        .card__end-title { font-size: clamp(36px, 3.6vw, 64px); line-height: .95; letter-spacing: -0.04em; }

        @media (max-width: 767px) {
          .work__pin { min-height: 0; padding-top: 96px; }
          .work__track { flex-direction: column; width: auto; gap: 56px; }
          .card, .card:nth-child(3n + 2), .card--end { width: 100%; }
          .card:nth-child(3n + 2) .card__art { aspect-ratio: 4 / 3; }
          .card--end { min-height: 260px; }
        }
        @media (prefers-reduced-motion: reduce) and (min-width: 768px) {
          .work__track { width: auto; overflow-x: auto; }
        }
      `}</style>
    </section>
  );
}
