import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ImageSlot from '../components/ImageSlot.jsx';

const EASE = 'cubic-bezier(.2,.7,.2,1)';

const MOCKUP_LAYOUT = [
  { span: '1 / -1', ratio: '16 / 9', caption: 'Hero application' },
  { span: 'auto',   ratio: '4 / 5',  caption: 'Detail' },
  { span: 'auto',   ratio: '4 / 5',  caption: 'In context' },
  { span: '1 / -1', ratio: '21 / 9', caption: 'System overview' },
];

export default function CaseStudyPage() {
  const { slug }      = useParams();
  const [projects, setProjects] = useState([]);
  const rootRef = useRef(null);

  const project = projects.find(p => p.slug === slug) || projects[0];
  const idx     = projects.indexOf(project);

  /* ── Fetch data ── */
  useEffect(() => {
    fetch('/projects.json').then(r => r.json()).then(setProjects).catch(console.error);
  }, []);

  /* ── Scroll to top on slug change ── */
  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  /* ── Animations ── */
  useEffect(() => {
    if (!project || !rootRef.current) return;
    document.title = `${project.title} — Northfold`;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const root = rootRef.current;

    root.querySelectorAll('[data-hero-line]').forEach(el =>
      el.animate(
        [{ transform: 'translateY(105%)' }, { transform: 'none' }],
        { duration: 1100, delay: 100, easing: EASE, fill: 'backwards' }
      )
    );
    root.querySelectorAll('[data-hero-fade]').forEach((el, i) =>
      el.animate(
        [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }],
        { duration: 900, delay: 400 + i * 100, easing: EASE, fill: 'backwards' }
      )
    );

    if (!window.IntersectionObserver) return;
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.animate(
        [{ opacity: 0, transform: 'translateY(32px)' }, { opacity: 1, transform: 'none' }],
        { duration: 900, easing: EASE, fill: 'backwards' }
      );
      io.unobserve(e.target);
    }));
    root.querySelectorAll('[data-reveal]').forEach(el => {
      if (el.getBoundingClientRect().top >= window.innerHeight) io.observe(el);
    });
    return () => io.disconnect();
  }, [project]);

  if (!project && projects.length > 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 14 }}>Project not found.</p>
      </div>
    );
  }

  /* ── Loading skeleton ── */
  if (!project) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: '80vh' }} />
        <Footer backLabel="← All work" backHref="/#work" />
      </>
    );
  }

  const num = `${String(idx + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`;
  const meta = [
    { label: 'Client',   value: project.client },
    { label: 'Year',     value: project.year },
    { label: 'Services', value: project.services.join(', ') },
  ];
  const story = [
    { label: 'Challenge', text: project.challenge },
    { label: 'Approach',  text: project.approach },
  ];

  return (
    <div ref={rootRef} style={{ position: 'relative', overflowX: 'clip' }}>
      <Navbar />
      <main>

        {/* ── Hero ── */}
        <section style={{
          maxWidth: 'var(--max-w)', margin: '0 auto',
          padding: 'clamp(56px,8vw,120px) var(--pad-x) 0',
        }}>
          <div data-hero-fade="" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            fontFamily: 'var(--mono)', fontSize: 13,
            textTransform: 'uppercase', color: '#5e5e5e', marginBottom: 24,
          }}>
            <span style={{ width: 8, height: 8, background: '#ee3524', display: 'block' }} />
            <span>{project.category} — Case study {num}</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(52px,10vw,160px)', fontWeight: 900,
            lineHeight: 0.86, letterSpacing: '-0.055em',
            textTransform: 'uppercase', margin: '0 0 0 -0.04em',
            overflow: 'hidden', paddingBottom: '0.04em',
          }}>
            <span data-hero-line="" style={{ display: 'block' }}>{project.title}</span>
          </h1>

          <p data-hero-fade="" style={{
            fontSize: 'clamp(22px,2.4vw,34px)', fontWeight: 700,
            lineHeight: 1.15, letterSpacing: '-0.02em',
            margin: 'clamp(20px,3vw,36px) 0 0', maxWidth: '26ch',
          }}>
            {project.tagline}
          </p>

          {/* Meta grid */}
          <div data-hero-fade="" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            gap: '0 clamp(16px,3vw,48px)',
            marginTop: 'clamp(40px,5vw,72px)',
          }}>
            {meta.map(m => (
              <div key={m.label} style={{
                padding: '16px 0', borderTop: '1px solid #0b0b0b',
                display: 'flex', flexDirection: 'column', gap: 6,
              }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, textTransform: 'uppercase', color: '#5e5e5e' }}>{m.label}</span>
                <span style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.4 }}>{m.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Cover image ── */}
        <section style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: 'clamp(32px,4vw,56px) var(--pad-x) 0' }}>
          <div data-reveal="" style={{ aspectRatio: '16 / 9', borderRadius: 4, overflow: 'hidden', background: '#f2f2ef' }}>
            <ImageSlot label={`Cover — ${project.title}`} />
          </div>
        </section>

        {/* ── Challenge & Approach ── */}
        <section style={{
          maxWidth: 'var(--max-w)', margin: '0 auto',
          padding: 'clamp(96px,11vw,170px) var(--pad-x) 0',
          display: 'flex', flexDirection: 'column', gap: 'clamp(64px,8vw,120px)',
        }}>
          {story.map(s => (
            <div key={s.label} data-reveal="" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
              gap: '20px clamp(32px,6vw,120px)', alignItems: 'start',
            }}>
              <h2 style={{
                fontSize: 'clamp(36px,4.4vw,64px)', fontWeight: 900,
                lineHeight: 0.92, letterSpacing: '-0.045em',
                textTransform: 'uppercase', margin: 0,
              }}>
                {s.label}
              </h2>
              <p style={{
                margin: 0, fontSize: 'clamp(19px,1.6vw,24px)',
                lineHeight: 1.5, color: '#3a3a3a', maxWidth: '48ch',
              }}>
                {s.text}
              </p>
            </div>
          ))}
        </section>

        {/* ── Design process ── */}
        <section style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: 'clamp(96px,11vw,170px) var(--pad-x) 0' }}>
          <h2 data-reveal="" style={{
            fontSize: 'clamp(44px,7vw,112px)', fontWeight: 900,
            lineHeight: 0.88, letterSpacing: '-0.05em',
            textTransform: 'uppercase', margin: '0 0 clamp(28px,3vw,40px) -0.03em',
          }}>
            Design process
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: '0 clamp(16px,2.4vw,36px)',
          }}>
            {project.process.map((s, n) => (
              <div key={n} data-reveal="" style={{
                padding: '24px 0', borderTop: '1px solid #0b0b0b',
                display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 14, color: '#ee3524' }}>
                  {String(n + 1).padStart(2, '0')}
                </span>
                <span style={{
                  fontSize: 'clamp(26px,2.4vw,36px)', fontWeight: 900,
                  lineHeight: 1, letterSpacing: '-0.04em', textTransform: 'uppercase',
                }}>
                  {s.title}
                </span>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: '#5e5e5e', maxWidth: '34ch' }}>
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Mockups ── */}
        <section style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: 'clamp(96px,11vw,170px) var(--pad-x) 0' }}>
          <div style={{
            display: 'flex', flexWrap: 'wrap',
            justifyContent: 'space-between', alignItems: 'flex-end',
            gap: 12, marginBottom: 'clamp(28px,3vw,40px)',
          }}>
            <h2 data-reveal="" style={{
              fontSize: 'clamp(44px,7vw,112px)', fontWeight: 900,
              lineHeight: 0.88, letterSpacing: '-0.05em',
              textTransform: 'uppercase', margin: '0 0 0 -0.03em',
            }}>
              Mockups
            </h2>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 13, textTransform: 'uppercase', color: '#5e5e5e' }}>
              {project.client} / {project.year}
            </span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 420px), 1fr))',
            gap: 'clamp(16px,2vw,24px)',
          }}>
            {MOCKUP_LAYOUT.map((m, n) => (
              <figure key={n} data-reveal="" style={{
                margin: 0, gridColumn: m.span,
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div style={{ aspectRatio: m.ratio, borderRadius: 4, overflow: 'hidden', background: '#f2f2ef' }}>
                  <ImageSlot label={`${project.title} — ${m.caption}`} />
                </div>
                <figcaption style={{
                  margin: 0, fontFamily: 'var(--mono)',
                  fontSize: 12, textTransform: 'uppercase', color: '#5e5e5e',
                }}>
                  {project.title} — {m.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ── Outcome ── */}
        <section style={{ marginTop: 'clamp(96px,11vw,170px)', background: '#0b0b0b', color: '#fff' }}>
          <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: 'clamp(80px,9vw,140px) var(--pad-x)' }}>
            <h2 style={{
              fontSize: 'clamp(44px,7vw,112px)', fontWeight: 900,
              lineHeight: 0.88, letterSpacing: '-0.05em',
              textTransform: 'uppercase', margin: '0 0 clamp(24px,3vw,40px) -0.03em',
            }}>
              Final <span style={{ color: '#ee3524' }}>outcome</span>
            </h2>
            <p data-reveal="" style={{
              margin: 0, fontSize: 'clamp(22px,2.4vw,36px)',
              fontWeight: 600, lineHeight: 1.25,
              letterSpacing: '-0.02em', maxWidth: '34ch',
            }}>
              {project.outcome}
            </p>

            {/* Results */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
              gap: '0 clamp(16px,3vw,48px)',
              marginTop: 'clamp(48px,6vw,88px)',
            }}>
              {project.results.map(r => (
                <div key={r.label} data-reveal="" style={{
                  padding: '24px 0', borderTop: '1px solid #3a3a3a',
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                  <span style={{
                    fontSize: 'clamp(48px,5.6vw,92px)', fontWeight: 900,
                    lineHeight: 0.9, letterSpacing: '-0.05em', color: '#ee3524',
                  }}>
                    {r.value}
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 13, textTransform: 'uppercase', color: '#a3a3a3' }}>
                    {r.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer backLabel="← All work" backHref="/#work" />
    </div>
  );
}
