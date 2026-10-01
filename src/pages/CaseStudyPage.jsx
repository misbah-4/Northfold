import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { gsap, useGSAP, ScrollTrigger, revealLines, introDone } from '../lib/motion.js';
import Footer from '../components/Footer.jsx';
import ProjectArt from '../components/ProjectArt.jsx';

const GALLERY = [
  { cls: 'g--wide', caption: 'Hero application' },
  { cls: 'g--tall', caption: 'Detail' },
  { cls: 'g--tall', caption: 'In context' },
  { cls: 'g--wide', caption: 'System overview' },
];

/** Animates the numeric part of "+38%", "4 days", "60" etc. */
function Counter({ value }) {
  const ref = useRef(null);
  const m = String(value).match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);

  useGSAP(() => {
    if (!m || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const n = { v: 0 };
    const end = parseFloat(m[2]);
    gsap.to(n, {
      v: end, duration: 2, ease: 'expo.out',
      scrollTrigger: { trigger: ref.current, start: 'top 90%' },
      onUpdate: () => { ref.current.textContent = m[1] + Math.round(n.v) + m[3]; },
    });
  }, { scope: ref, dependencies: [value] });

  return <span ref={ref}>{value}</span>;
}

export default function CaseStudyPage() {
  const { slug } = useParams();
  const [projects, setProjects] = useState(null);
  const root = useRef(null);

  useEffect(() => {
    fetch('/projects.json').then(r => r.json()).then(setProjects).catch(console.error);
  }, []);

  const project = projects?.find(p => p.slug === slug);
  const idx = projects ? projects.indexOf(project) : -1;
  const next = project ? projects[(idx + 1) % projects.length] : null;

  useEffect(() => {
    if (project) document.title = `${project.title} — Northfold`;
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [project]);

  useGSAP(() => {
    if (!project) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set('.cs__title-in', { yPercent: 110 });
      gsap.set('.cs__fade', { opacity: 0, y: 24 });
      gsap.set('.cs__cover', { clipPath: 'inset(100% 0% 0% 0%)' });
      introDone.then(() => {
        gsap.timeline({ delay: 0.1 })
          .to('.cs__title-in', { yPercent: 0, duration: 1.4, ease: 'expo.out' })
          .to('.cs__fade', { opacity: 1, y: 0, duration: 1, stagger: 0.07, ease: 'expo.out' }, 0.3)
          .to('.cs__cover', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' }, 0.2);
      });

      gsap.fromTo('.cs__cover-in', { yPercent: -10, scale: 1.15 }, {
        yPercent: 10, scale: 1, ease: 'none',
        scrollTrigger: { trigger: '.cs__cover', start: 'top bottom', end: 'bottom top', scrub: true },
      });

      gsap.utils.toArray('.cs__lines').forEach(el =>
        revealLines(el, { stagger: 0.05, scrollTrigger: { trigger: el, start: 'top 85%' } }));

      gsap.utils.toArray('.cs__rise').forEach(el =>
        gsap.from(el, { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));

      gsap.utils.toArray('.g').forEach(g => {
        gsap.fromTo(g.querySelector('.g__in'), { yPercent: -8 }, {
          yPercent: 8, ease: 'none',
          scrollTrigger: { trigger: g, start: 'top bottom', end: 'bottom top', scrub: true },
        });
        gsap.from(g, { clipPath: 'inset(15% 15% 15% 15% round 12px)', duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: g, start: 'top 85%' } });
      });
    });
  }, { scope: root, dependencies: [slug, !!project], revertOnUpdate: true });

  if (projects && !project) {
    return (
      <main className="cs-missing wrap">
        <p className="label">404</p>
        <h1 className="h2">Project not found.</h1>
        <Link to="/" className="pill">Back home</Link>
        <style>{`.cs-missing { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; gap: 24px; align-items: flex-start; }`}</style>
      </main>
    );
  }
  if (!project) return <main style={{ minHeight: '100vh' }} />;

  return (
    <div ref={root} key={slug}>
      <main className="cs">
        <header className="wrap cs__head">
          <div className="cs__crumbs cs__fade label">
            <Link to="/#work" className="u-link">← All work</Link>
            <span>{project.category} · {project.year}</span>
          </div>
          <h1 className="display cs__title">
            <span className="cs__title-mask"><span className="cs__title-in">{project.title}</span></span>
          </h1>
          <div className="cs__meta">
            <p className="lead cs__fade cs__tagline">{project.tagline}</p>
            <dl className="cs__facts">
              <div className="cs__fade"><dt className="label">Client</dt><dd>{project.client}</dd></div>
              <div className="cs__fade"><dt className="label">Services</dt><dd>{project.services.join(', ')}</dd></div>
              <div className="cs__fade"><dt className="label">Year</dt><dd>{project.year}</dd></div>
            </dl>
          </div>
        </header>

        <div className="cs__cover">
          <div className="cs__cover-in"><ProjectArt slug={project.slug} title={project.title} /></div>
        </div>

        <section className="wrap cs__two">
          <div>
            <span className="label">(Challenge)</span>
            <p className="lead cs__lines">{project.challenge}</p>
          </div>
          <div>
            <span className="label">(Approach)</span>
            <p className="lead cs__lines cs__muted">{project.approach}</p>
          </div>
        </section>

        <section className="wrap cs__process">
          {project.process.map((s, i) => (
            <div key={s.title} className="cs__step cs__rise">
              <span className="label accent">0{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </section>

        <section className="wrap cs__gallery">
          {GALLERY.map(g => (
            <figure key={g.caption} className={`g ${g.cls}`}>
              <div className="g__frame">
                <div className="g__in"><ProjectArt slug={project.slug} title={`${project.title} — ${g.caption}`} /></div>
              </div>
              <figcaption className="label">{g.caption}</figcaption>
            </figure>
          ))}
        </section>

        <section className="wrap cs__outcome">
          <span className="label">(Outcome)</span>
          <p className="h2 cs__lines">{project.outcome}</p>
          <div className="cs__results">
            {project.results.map(r => (
              <div key={r.label} className="cs__result cs__rise">
                <span className="cs__num"><Counter value={r.value} /></span>
                <span className="label">{r.label}</span>
              </div>
            ))}
          </div>
        </section>

        {next && (
          <Link to={`/case-study/${next.slug}`} className="cs__next" data-cursor="Next">
            <div className="wrap cs__next-in">
              <span className="label">Next project</span>
              <span className="display cs__next-title">{next.title}</span>
              <span className="cs__next-art"><ProjectArt slug={next.slug} title={next.title} /></span>
            </div>
          </Link>
        )}
      </main>
      <Footer />

      <style>{`
        .cs__head { padding-top: calc(var(--nav-h) + clamp(64px, 9vw, 160px)); display: flex; flex-direction: column; gap: clamp(28px, 3vw, 48px); }
        .cs__crumbs { display: flex; justify-content: space-between; gap: 16px; }
        .cs__crumbs a { color: var(--white); }
        .cs__title-mask { display: block; overflow: hidden; padding-bottom: .08em; }
        .cs__title-in { display: block; }
        .cs__meta { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 40px; padding-bottom: clamp(40px, 5vw, 72px); }
        .cs__tagline { color: var(--muted); max-width: 22ch; }
        .cs__facts { margin: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; align-self: end; }
        .cs__facts dd { margin: 8px 0 0; font-size: 16px; line-height: 1.45; }
        .cs__cover { position: relative; height: clamp(360px, 60vw, 960px); overflow: hidden; }
        .cs__cover-in { position: absolute; inset: -6% 0; }
        .cs__two { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(32px, 6vw, 120px); padding-top: clamp(100px, 12vw, 200px); }
        .cs__two .label { display: block; margin-bottom: 24px; }
        .cs__muted { color: var(--muted); }
        .cs__process { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; padding-top: clamp(80px, 10vw, 160px); }
        .cs__step { border-top: 1px solid var(--line); padding-top: 20px; display: flex; flex-direction: column; gap: 10px; }
        .cs__step h3 { font-weight: 400; font-size: clamp(24px, 2vw, 34px); letter-spacing: -0.03em; }
        .cs__step p { color: var(--muted); font-size: 15px; line-height: 1.5; }
        .cs__gallery { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(12px, 1.4vw, 24px); padding-top: clamp(100px, 12vw, 200px); }
        .g { margin: 0; display: flex; flex-direction: column; gap: 12px; }
        .g--wide { grid-column: 1 / -1; }
        .g__frame { position: relative; overflow: hidden; border-radius: 6px; aspect-ratio: 16 / 8; }
        .g--tall .g__frame { aspect-ratio: 4 / 5; }
        .g__in { position: absolute; inset: -8% 0; }
        .cs__outcome { padding-top: clamp(120px, 14vw, 220px); display: flex; flex-direction: column; gap: 32px; }
        .cs__outcome .h2 { max-width: 22ch; }
        .cs__results { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; margin-top: 40px; }
        .cs__result { border-top: 1px solid var(--line); padding-top: 20px; display: flex; flex-direction: column; gap: 10px; }
        .cs__num { font-size: clamp(48px, 6vw, 104px); letter-spacing: -0.05em; line-height: 1; }
        .cs__next { display: block; margin-top: clamp(120px, 14vw, 220px); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); overflow: hidden; }
        .cs__next-in { position: relative; display: flex; flex-direction: column; gap: 16px; padding-top: clamp(48px, 6vw, 96px); padding-bottom: clamp(48px, 6vw, 96px); }
        .cs__next-title { transition: transform 1s var(--ease), color .6s var(--ease); }
        .cs__next:hover .cs__next-title { transform: translateX(2vw); color: var(--accent); }
        .cs__next-art {
          position: absolute; right: var(--pad-x); top: 50%; width: clamp(160px, 20vw, 340px); aspect-ratio: 4 / 3;
          border-radius: 6px; overflow: hidden;
          transform: translateY(-50%) scale(0) rotate(-6deg); transition: transform .9s var(--ease);
        }
        .cs__next:hover .cs__next-art { transform: translateY(-50%) scale(1) rotate(3deg); }
        @media (max-width: 860px) {
          .cs__meta, .cs__two { grid-template-columns: 1fr; }
          .cs__facts { grid-template-columns: 1fr 1fr; }
          .cs__process { grid-template-columns: 1fr 1fr; }
          .cs__results { grid-template-columns: 1fr; }
        }
        @media (max-width: 520px) {
          .cs__gallery, .cs__process { grid-template-columns: 1fr; }
          .cs__next-art { display: none; }
        }
      `}</style>
    </div>
  );
}
