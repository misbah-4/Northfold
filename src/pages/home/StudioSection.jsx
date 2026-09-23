const PROCESS = [
  { num: '01', title: 'Listen',  text: 'We start with questions, not moodboards. Your business before your logo.' },
  { num: '02', title: 'Decide',  text: 'One idea, agreed early and defended all the way to launch.' },
  { num: '03', title: 'Make',    text: 'A small senior team designs, tests and refines. No handoffs to juniors.' },
  { num: '04', title: 'Move',    text: 'Everything we design is built to live in motion, on every screen.' },
];

export default function StudioSection() {
  return (
    <section
      id="studio"
      style={{
        maxWidth: 'var(--max-w)', margin: '0 auto',
        padding: 'clamp(120px,13vw,200px) var(--pad-x) 0',
      }}
    >
      {/* About copy */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
        gap: '32px clamp(32px,6vw,120px)',
        alignItems: 'start',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 13,
            textTransform: 'uppercase', color: '#5e5e5e',
          }}>
            The studio
          </span>
          <h2 style={{
            fontSize: 'clamp(36px,4.4vw,64px)', fontWeight: 900,
            lineHeight: 0.92, letterSpacing: '-0.045em',
            textTransform: 'uppercase', margin: 0,
          }}>
            A small studio on purpose
          </h2>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: 18,
          fontSize: 18, lineHeight: 1.6, color: '#3a3a3a', maxWidth: '62ch',
        }}>
          <p style={{ margin: 0 }}>
            Northfold started in 2026 as two designers and one shared desk. Today we're a team
            of designers, animators and art directors, still small enough that the people you
            meet are the people who do the work.
          </p>
          <p style={{ margin: 0 }}>
            We partner with founders, cultural institutions and established brands that are
            ready to change how they look, sound and move. Every project is led by a senior
            creative from first call to final file.
          </p>
        </div>
      </div>

      {/* Manifesto + process */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
        gap: '56px clamp(32px,6vw,120px)',
        marginTop: 'clamp(100px,11vw,170px)',
        alignItems: 'start',
      }}>
        <p style={{
          fontSize: 'clamp(40px,5.6vw,92px)', fontWeight: 900,
          lineHeight: 0.9, letterSpacing: '-0.05em',
          textTransform: 'uppercase', margin: '0 0 0 -0.03em',
        }}>
          <span style={{ display: 'block' }}>Northfold</span>
          <span style={{ display: 'block' }}>doesn't</span>
          <span style={{ display: 'block' }}>decorate.</span>
          <span style={{ display: 'block' }}>We find</span>
          <span style={{ display: 'block' }}>one idea</span>
          <span style={{ display: 'block' }}>and make</span>
          <span style={{ display: 'block', color: '#ee3524' }}>it move.</span>
        </p>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {PROCESS.map(s => (
            <div
              key={s.num}
              style={{
                display: 'grid', gridTemplateColumns: '56px minmax(0,1fr)',
                gap: 16, padding: '24px 0', borderTop: '1px solid #0b0b0b',
              }}
            >
              <span style={{ fontFamily: 'var(--mono)', fontSize: 14, color: '#ee3524' }}>
                {s.num}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{
                  fontSize: 'clamp(26px,2.4vw,36px)', fontWeight: 900,
                  lineHeight: 1, letterSpacing: '-0.04em', textTransform: 'uppercase',
                }}>
                  {s.title}
                </span>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: '#5e5e5e', maxWidth: '44ch' }}>
                  {s.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
