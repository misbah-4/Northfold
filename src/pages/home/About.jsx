import { useRef } from 'react';
import { gsap, useGSAP, SplitText } from '../../lib/motion.js';

const LEAD = 'We are a small, senior studio working where brand identity, motion and digital product meet.';
const REST = 'Our work is for founders, cultural institutions and teams who know that design is not decoration. It is direction.';

const PROCESS = [
  { num: '01', title: 'Listen', text: 'We start with questions, not moodboards. Your business before your logo.' },
  { num: '02', title: 'Decide', text: 'One idea, agreed early and defended all the way to launch.' },
  { num: '03', title: 'Make',   text: 'A small senior team designs, tests and refines. No handoffs to juniors.' },
  { num: '04', title: 'Move',   text: 'Everything we design is built to live in motion, on every screen.' },
];

export default function About() {
  const root = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      /* Statement: words light up one by one as you scroll through it */
      const lead = SplitText.create('.about__lead', { type: 'words' });
      const rest = SplitText.create('.about__rest', { type: 'words' });
      gsap.timeline({
        scrollTrigger: { trigger: '.about__text', start: 'top 80%', end: 'bottom 45%', scrub: 1 },
      })
        .from(lead.words, { color: '#262626', stagger: 0.1, ease: 'none' })
        .from(rest.words, { color: '#1c1c1c', stagger: 0.1, ease: 'none' });

      gsap.from('.about__label', {
        opacity: 0, x: -20, duration: 1, ease: 'expo.out',
        scrollTrigger: { trigger: '.about__text', start: 'top 80%' },
      });

      /* Process: rule draws in, then each step rises */
      gsap.utils.toArray('.step').forEach((step, i) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: '.steps', start: 'top 85%' }, delay: i * 0.1 });
        tl.from(step.querySelector('.step__rule'), { scaleX: 0, duration: 1.2, ease: 'expo.inOut' })
          .from(step.querySelectorAll('.step__in'), { yPercent: 110, duration: 1, stagger: 0.06, ease: 'expo.out' }, '-=0.6');
      });
    });
  }, { scope: root });

  return (
    <section ref={root} id="studio" className="about">
      <div className="wrap about__grid">
        <span className="label about__label">(The studio)</span>
        <p className="about__text lead">
          <span className="about__lead">{LEAD}</span>{' '}
          <span className="about__rest">{REST}</span>
        </p>
      </div>

      <div className="wrap steps">
        {PROCESS.map(s => (
          <div key={s.num} className="step">
            <span className="step__rule" />
            <span className="step__mask"><span className="step__in label accent">{s.num}</span></span>
            <span className="step__mask"><span className="step__in step__title">{s.title}</span></span>
            <span className="step__mask"><span className="step__in step__text">{s.text}</span></span>
          </div>
        ))}
      </div>

      <style>{`
        .about { padding: clamp(120px, 16vw, 260px) 0 clamp(80px, 10vw, 160px); }
        .about__grid {
          display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr);
          gap: 40px; align-items: start;
        }
        .about__text { color: var(--white); max-width: 30ch; font-size: clamp(26px, 2.9vw, 50px); }
        .about__rest { color: var(--muted); }
        .steps {
          display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: clamp(16px, 2vw, 32px);
          margin-top: clamp(100px, 12vw, 200px);
        }
        .step { display: flex; flex-direction: column; gap: 14px; }
        .step__rule { height: 1px; background: var(--line); transform-origin: left; margin-bottom: 10px; }
        .step__mask { overflow: hidden; display: block; }
        .step__in { display: block; }
        .step__title { font-size: clamp(26px, 2.4vw, 40px); letter-spacing: -0.03em; }
        .step__text { color: var(--muted); font-size: 16px; line-height: 1.5; max-width: 30ch; }
        @media (max-width: 900px) {
          .about__grid { grid-template-columns: 1fr; }
          .steps { grid-template-columns: 1fr 1fr; row-gap: 48px; }
        }
        @media (max-width: 520px) { .steps { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}
