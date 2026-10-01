import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap, useGSAP, revealLines, getLenis, ScrollTrigger } from '../../lib/motion.js';
import { createStage } from '../../lib/webgl/stage.js';
import Media from '../../components/Media.jsx';

const still = m => (m?.type === 'video' ? m.poster : m?.src);

/**
 * Selected work, after cynx.io: the section pins and scrolling steps
 * through projects. The active one is a large WebGL stage (noise
 * dissolve between covers, bends with scroll speed, ripples on hover);
 * the rest sit in a filmstrip that parts around it.
 */
export default function Work({ projects }) {
  const root = useRef(null);
  const [active, setActive] = useState(0);
  const [glOn, setGlOn] = useState(false);
  const n = projects.length;
  const p = projects[active];

  useGSAP(() => {
    if (!n) return;
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      revealLines('.wk__title', { scrollTrigger: { trigger: '.wk__title', start: 'top 85%' } });
    });

    /* ── Desktop gallery ───────────────────────────────────────── */
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const el = root.current;
      const pin = el.querySelector('.wk__pin');
      const canvas = el.querySelector('.wk__gl');
      const link = el.querySelector('.wk__stage');
      const thumbs = gsap.utils.toArray('.wk__thumb', el);
      const TW = 76, TH = 56, GAP = 8;

      // stage box follows each cover's aspect ratio
      const aspects = projects.map(() => 1.5);
      const box = { w: 0, h: 0 };
      const fit = i => {
        const maxW = pin.clientWidth * 0.36, maxH = pin.clientHeight * 0.58;
        const a = aspects[i];
        return a >= maxW / maxH ? { w: maxW, h: maxW / a } : { w: maxH * a, h: maxH };
      };
      Object.assign(box, fit(0));

      let stage = null;
      let cur = 0, prog = null;
      try {
        stage = createStage(canvas);
        setGlOn(true);
      } catch (e) { /* DOM fallback stays visible */ }

      // load every cover; record real aspect ratios
      const loads = projects.map((pr, i) =>
        (stage ? stage.load(still(pr.media?.[0])) : Promise.reject())
          .then(t => { aspects[i] = t.w / t.h; return t; }));
      loads[0]?.then(t => {
        stage.state.a = t;
        if (cur === 0) gsap.to(box, { ...fit(0), duration: 0.6, ease: 'power3.out' });
      }).catch(() => {});

      // ── switching projects ──
      const go = i => {
        if (i === cur) return;
        const from = cur; cur = i;
        setActive(i);
        gsap.to(box, { ...fit(i), duration: 1.1, ease: 'power3.inOut', overwrite: true });
        if (!stage) return;
        loads[i].then(t => {
          if (cur !== i) return;
          if (prog) { prog.kill(); stage.state.a = stage.state.b; }
          stage.state.b = t;
          stage.state.prog = 0;
          prog = gsap.to(stage.state, {
            prog: 1, duration: 1.2, ease: 'power2.inOut',
            onComplete: () => { stage.state.a = t; stage.state.prog = 0; prog = null; },
          });
        }).catch(() => {});
        // info panel: out, swap (React), in
        gsap.fromTo('.wk__swap', { yPercent: i > from ? 100 : -100, opacity: 0 }, {
          yPercent: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.04, delay: 0.05, overwrite: true,
        });
      };

      // ── scroll drives a continuous index p ──
      let pos = 0, vel = 0;
      const st = ScrollTrigger.create({
        trigger: pin,
        start: 'top top',
        end: () => `+=${(n - 1) * window.innerHeight * 0.75}`,
        pin: true,
        scrub: true,
        snap: { snapTo: 1 / (n - 1), duration: { min: 0.3, max: 0.8 }, ease: 'power2.inOut', delay: 0.05 },
        onUpdate: self => {
          pos = self.progress * (n - 1);
          go(Math.round(pos));
          vel = gsap.utils.clamp(-1, 1, self.getVelocity() / 2500);
          gsap.set('.wk__bar', { scaleX: self.progress });
        },
      });

      // thumbnails jump straight to their project
      const onThumb = e => {
        const i = +e.currentTarget.dataset.i;
        const y = st.start + (i / (n - 1)) * (st.end - st.start);
        getLenis() ? getLenis().scrollTo(y, { duration: 1.2 }) : window.scrollTo({ top: y, behavior: 'smooth' });
      };
      thumbs.forEach(t => t.addEventListener('click', onThumb));

      // pointer over the stage
      const ptr = { x: -1e4, y: -1e4, on: 0 };
      const onMove = e => {
        const r = canvas.getBoundingClientRect();
        ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top;
      };
      const onEnter = () => { ptr.on = 1; };
      const onLeave = () => { ptr.on = 0; };
      link.addEventListener('pointermove', onMove);
      link.addEventListener('pointerenter', onEnter);
      link.addEventListener('pointerleave', onLeave);

      const ro = new ResizeObserver(() => { stage?.resize(); Object.assign(box, fit(cur)); });
      ro.observe(canvas);

      // ── per-frame layout + render ──
      let shown = pos;
      const tick = (time, dt) => {
        const W = pin.clientWidth, H = pin.clientHeight;
        const cx = W / 2, cy = H / 2;
        shown += (pos - shown) * (1 - Math.exp(-dt / 90));
        const sep = box.w / 2 + 28;
        thumbs.forEach((t, i) => {
          const o = i - shown;
          const x = cx + o * (TW + GAP) + gsap.utils.clamp(-1, 1, o) * (sep + TW / 2 - (TW + GAP));
          const a = gsap.utils.clamp(0, 1, Math.abs(o) * 1.6 - 0.25);
          t.style.transform = `translate3d(${x - TW / 2}px, ${cy - TH / 2}px, 0)`;
          t.style.opacity = a;
          t.classList.toggle('is-active', Math.round(shown) === i);
        });
        const rect = { x: cx - box.w / 2, y: cy - box.h / 2, w: box.w, h: box.h };
        link.style.transform = `translate3d(${rect.x}px, ${rect.y}px, 0)`;
        link.style.width = `${rect.w}px`;
        link.style.height = `${rect.h}px`;
        if (stage) {
          const s = stage.state;
          s.time = time;
          // frame-rate independent easing: bend relaxes within ~0.3s of stopping
          const k = 1 - Math.exp(-dt / 70);
          vel *= Math.exp(-dt / 90);
          s.vel += (vel - s.vel) * k;
          s.hover += (ptr.on - s.hover) * (1 - Math.exp(-dt / 160));
          s.mouse = [ptr.x, ptr.y];
          stage.render(rect);
        }
      };
      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
        st.kill(); ro.disconnect(); prog?.kill();
        thumbs.forEach(t => t.removeEventListener('click', onThumb));
        link.removeEventListener('pointermove', onMove);
        link.removeEventListener('pointerenter', onEnter);
        link.removeEventListener('pointerleave', onLeave);
        stage?.destroy();
        setGlOn(false);
      };
    });

    /* ── Mobile / reduced motion: vertical list ─────────────────── */
    mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray('.wk__card').forEach(card => {
        gsap.from(card, { y: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 90%' } });
      });
    });
  }, { scope: root, dependencies: [n] });

  return (
    <section ref={root} id="work" className="wk">
      {/* desktop gallery */}
      <div className="wk__pin">
        <div className="wrap wk__head">
          <h2 className="h2 wk__title">Selected work</h2>
          <span className="label">Scroll to browse · {String(n).padStart(2, '0')} projects</span>
        </div>

        <div className="wk__strip" aria-hidden="true">
          {projects.map((pr, i) => (
            <button key={pr.slug} type="button" className="wk__thumb" data-i={i} tabIndex={-1}>
              <img src={still(pr.media?.[0])} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>

        <canvas className="wk__gl" aria-hidden="true" />

        {p && (
          <Link to={`/case-study/${p.slug}`} className="wk__stage" data-cursor="View" aria-label={`${p.title} case study`}>
            {!glOn && projects.map((pr, i) => (
              <span key={pr.slug} className={`wk__dom${i === active ? ' is-active' : ''}`}>
                <Media item={pr.media?.[0]} />
              </span>
            ))}
          </Link>
        )}

        {p && (
          <aside className="wk__info">
            <div className="wk__mask"><span className="wk__swap wk__num">{String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span></div>
            <div className="wk__mask"><h3 className="wk__swap wk__name">{p.title}</h3></div>
            <div className="wk__mask"><p className="wk__swap wk__tagline">{p.tagline}</p></div>
            <div className="wk__mask"><div className="wk__swap wk__tags">{p.services.map(s => <span key={s} className="tag">{s}</span>)}</div></div>
            <div className="wk__mask"><Link to={`/case-study/${p.slug}`} className="wk__swap wk__cta u-link">View case study ↗</Link></div>
          </aside>
        )}

        <div className="wk__meta wrap">
          <div className="wk__mask"><span className="wk__swap label">{p?.category} — {p?.year}</span></div>
          <div className="wk__progress"><span className="wk__bar" /></div>
        </div>
      </div>

      {/* mobile + reduced-motion list */}
      <div className="wk__list wrap">
        {projects.map((pr, i) => (
          <Link key={pr.slug} to={`/case-study/${pr.slug}`} className="wk__card">
            <div className="wk__card-art"><Media item={pr.media?.[0]} /></div>
            <div className="wk__card-row">
              <h3>{pr.title}</h3>
              <span className="label">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <p>{pr.tagline}</p>
          </Link>
        ))}
      </div>

      <style>{`
        .wk { position: relative; }
        .wk__pin { position: relative; height: 100vh; overflow: hidden; display: none; }
        .wk__head {
          position: absolute; top: calc(var(--nav-h) + 8px); left: 0; right: 0;
          display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; z-index: 3;
        }
        .wk__strip { position: absolute; inset: 0; z-index: 1; }
        .wk__thumb {
          position: absolute; left: 0; top: 0; width: 76px; height: 56px; padding: 0;
          border-radius: 3px; overflow: hidden; cursor: pointer; will-change: transform, opacity;
          filter: grayscale(.4) brightness(.8); transition: filter .4s var(--ease);
        }
        .wk__thumb:hover { filter: none; }
        .wk__thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .wk__gl { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 2; pointer-events: none; }
        .wk__stage {
          position: absolute; left: 0; top: 0; z-index: 3; display: block;
          border-radius: 8px; overflow: hidden; will-change: transform, width, height;
        }
        .wk__dom { position: absolute; inset: 0; opacity: 0; transition: opacity .8s var(--ease); }
        .wk__dom.is-active { opacity: 1; }

        .wk__info {
          position: absolute; z-index: 3; left: var(--pad-x); bottom: 72px;
          width: min(26vw, 380px); display: flex; flex-direction: column; gap: 10px;
        }
        .wk__mask { overflow: hidden; }
        .wk__swap { display: block; }
        .wk__num { font-family: var(--mono); font-size: 12px; color: var(--muted); }
        .wk__name { font-weight: 400; font-size: clamp(28px, 2.4vw, 44px); letter-spacing: -0.035em; line-height: 1; }
        .wk__tagline { color: var(--muted); font-size: 15px; line-height: 1.45; }
        .wk__tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .wk__cta { font-size: 15px; margin-top: 6px; width: fit-content; }
        .wk__meta {
          position: absolute; left: 0; right: 0; bottom: 28px; z-index: 3;
          display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 24px;
        }
        .wk__meta > .wk__mask { justify-self: start; }
        @media (max-height: 760px) { .wk__tagline { display: none; } }
        .wk__progress { height: 1px; background: var(--line); }
        .wk__bar { display: block; height: 1px; background: var(--white); transform: scaleX(0); transform-origin: left; }

        .wk__list { display: flex; flex-direction: column; gap: 48px; padding-top: 96px; }
        .wk__card { display: flex; flex-direction: column; gap: 12px; }
        .wk__card-art { aspect-ratio: 4 / 3; border-radius: 6px; overflow: hidden; }
        .wk__card-row { display: flex; justify-content: space-between; align-items: baseline; }
        .wk__card h3 { font-weight: 400; font-size: 24px; letter-spacing: -0.02em; }
        .wk__card p { color: var(--muted); font-size: 15px; }
        .wk__list-head { display: none; }

        @media (min-width: 768px) and (prefers-reduced-motion: no-preference) {
          .wk__pin { display: block; }
          .wk__list { display: none; }
        }
        @media (max-width: 767px), (prefers-reduced-motion: reduce) {
          .wk::before {
            content: 'Selected work'; display: block; padding: 96px var(--pad-x) 0;
            font-size: clamp(34px, 9vw, 56px); letter-spacing: -0.04em; line-height: 1;
          }
          .wk__list { padding-top: 32px; }
        }
      `}</style>
    </section>
  );
}
