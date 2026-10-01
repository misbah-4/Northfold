import { useRef } from 'react';
import { gsap, useGSAP, revealLines } from '../../lib/motion.js';
import Media from '../../components/Media.jsx';

const SERVICES = [
  { name: 'Brand Identity', media: { type: 'image', src: '/images/work/svc-brand.webp', alt: 'Northfold business cards beside an embosser' },   desc: 'Names, marks, type, colour and the rules that hold them together.', items: ['Strategy', 'Naming', 'Logo & type', 'Guidelines'], bg: '#ee3524', fg: '#fff' },
  { name: 'Art Direction', media: { type: 'video', src: '/videos/svc-silk.mp4', poster: '/videos/svc-silk.jpg', alt: 'Gold silk rippling' },    desc: 'Shoots, films and campaigns directed from concept to final frame.', items: ['Campaigns', 'Photography', 'Casting', 'Set design'], bg: '#f2efe9', fg: '#0b0b0b' },
  { name: 'Digital Design', media: { type: 'image', src: '/images/work/orbit-2.webp', alt: 'Phone on a table showing a spending chart' },   desc: 'Websites, products and interfaces that look as good as they work.', items: ['Websites', 'Product UI', 'Design systems', 'Prototypes'], bg: '#2b3cff', fg: '#fff' },
  { name: 'Motion Graphics', media: { type: 'video', src: '/videos/svc-motion.mp4', poster: '/videos/svc-motion.jpg', alt: 'Purple fluid paint swirling' },  desc: 'Idents, product films and identities that move.', items: ['Idents', 'Product films', '3D', 'Motion systems'], bg: '#f7d066', fg: '#0b0b0b' },
  { name: 'Packaging Design', media: { type: 'image', src: '/images/work/svc-packaging.webp', alt: 'Kraft coffee bag and cup on a pink backdrop' }, desc: 'Structures and graphics that win on shelf and survive shipping.', items: ['Structure', 'Graphics', 'Print production', 'Retail'], bg: '#a9c4c9', fg: '#0d2a33' },
  { name: 'Social & Content', media: { type: 'video', src: '/videos/svc-social.mp4', poster: '/videos/svc-social.jpg', alt: 'Dancer lit by neon tubes' }, desc: 'Content systems built for the feed, not resized for it.', items: ['Templates', 'Launch kits', 'Editorial', 'Short form'], bg: '#1b1b1b', fg: '#fff' },
];

export default function Services() {
  const root = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      revealLines('.svc__title', { scrollTrigger: { trigger: '.svc__title', start: 'top 85%' } });
      gsap.from('.svc__intro', {
        opacity: 0, y: 30, duration: 1.2, ease: 'expo.out',
        scrollTrigger: { trigger: '.svc__intro', start: 'top 85%' },
      });
    });

    /* Desktop: cards slide up over each other into a pinned deck */
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const cards = gsap.utils.toArray('.svc__card');
      gsap.set(cards.slice(1), { yPercent: 110 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.svc__pin',
          start: 'top top',
          end: () => `+=${(cards.length - 1) * window.innerHeight * 0.7}`,
          pin: '.svc__pin',
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      });
      cards.forEach((card, i) => {
        if (i === 0) return;
        tl.to(card, { yPercent: 0, duration: 1, ease: 'power2.inOut' }, i - 1)
          .fromTo(cards[i - 1], { scale: 1, filter: 'brightness(1)' }, { scale: 0.94, filter: 'brightness(0.5)', duration: 1, ease: 'power2.inOut', immediateRender: false }, i - 1)
          .from(card.querySelectorAll('.svc__reveal'), { y: 60, opacity: 0, stagger: 0.05, duration: 0.6 }, i - 0.6);
      });
    });

    mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray('.svc__card').forEach(card => {
        gsap.from(card, { y: 80, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 95%' } });
      });
    });
  }, { scope: root });

  return (
    <section ref={root} id="services" className="svc">
      <div className="svc__pin">
        <div className="wrap svc__head">
          <h2 className="h2 svc__title">What we do</h2>
          <p className="svc__intro">
            Strategy, design and motion under one roof. One senior team from first call to final file.
          </p>
        </div>

        <div className="wrap">
          <div className="svc__deck">
            {SERVICES.map((s, i) => (
              <article key={s.name} className="svc__card" style={{ background: s.bg, color: s.fg, zIndex: i + 1 }}>
                <div className="svc__text">
                  <div className="svc__top">
                    <span className="svc__num">0{i + 1}</span>
                    <span className="svc__count">0{i + 1} / 0{SERVICES.length}</span>
                  </div>
                  <h3 className="svc__name svc__reveal">{s.name}</h3>
                  <div className="svc__bottom">
                    <p className="svc__desc svc__reveal">{s.desc}</p>
                    <ul className="svc__items svc__reveal">
                      {s.items.map(it => <li key={it}>{it}</li>)}
                    </ul>
                  </div>
                </div>
                <div className="svc__media"><Media item={s.media} /></div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .svc { padding-top: clamp(40px, 5vw, 80px); }
        .svc__pin { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: calc(var(--nav-h) * .6) 0 24px; }
        .svc__head {
          display: flex; justify-content: space-between; align-items: flex-end; gap: 32px;
          margin-bottom: clamp(32px, 4vw, 56px);
        }
        .svc__intro { max-width: 34ch; color: var(--muted); font-size: clamp(16px, 1.3vw, 20px); line-height: 1.45; }
        .svc__deck { position: relative; height: min(62vh, 680px); overflow: hidden; border-radius: 10px; }
        .svc__card {
          position: absolute; inset: 0;
          border-radius: 10px; overflow: hidden;
          padding: clamp(14px, 1.2vw, 20px);
          display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: clamp(14px, 1.2vw, 20px);
          transform-origin: 50% 0%;
          will-change: transform;
        }
        .svc__text {
          display: flex; flex-direction: column; justify-content: space-between;
          padding: clamp(10px, 1.8vw, 28px);
        }
        .svc__media { position: relative; border-radius: 6px; overflow: hidden; min-height: 0; }
        .svc__top { display: flex; justify-content: space-between; font-family: var(--mono); font-size: 13px; }
        .svc__name { font-weight: 400; font-size: clamp(40px, 5.4vw, 100px); letter-spacing: -0.05em; line-height: .92; }
        .svc__bottom { display: flex; justify-content: space-between; align-items: flex-end; gap: 32px; }
        .svc__desc { max-width: 30ch; font-size: clamp(18px, 1.6vw, 26px); line-height: 1.25; letter-spacing: -0.01em; }
        .svc__items { list-style: none; margin: 0; padding: 0; text-align: right; font-size: 15px; line-height: 1.7; opacity: .8; }

        @media (max-width: 767px) {
          .svc__pin { min-height: 0; padding-top: 64px; }
          .svc__head { flex-direction: column; align-items: flex-start; }
          .svc__deck { height: auto; display: flex; flex-direction: column; gap: 12px; overflow: visible; }
          .svc__card { position: relative; min-height: 0; grid-template-columns: 1fr; }
          .svc__media { order: -1; aspect-ratio: 16 / 10; }
          .svc__text { gap: 18px; padding: 8px 6px 10px; }
          .svc__bottom { flex-direction: column; align-items: flex-start; }
          .svc__items { text-align: left; }
        }
        @media (prefers-reduced-motion: reduce) and (min-width: 768px) {
          .svc__deck { height: auto; display: grid; gap: 12px; }
          .svc__card { position: relative; min-height: 60vh; }
        }
      `}</style>
    </section>
  );
}
