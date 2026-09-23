import { Link } from 'react-router-dom';

export default function Footer({ backLabel = 'Back to the top ↑', backHref = '#top' }) {
  return (
    <footer style={{ background: '#0b0b0b', color: '#fff', borderTop: '1px solid #2a2a2a' }}>
      <div style={{
        maxWidth: 'var(--max-w)', margin: '0 auto',
        padding: '40px var(--pad-x)',
        display: 'flex', flexWrap: 'wrap',
        justifyContent: 'space-between', alignItems: 'center', gap: 20,
        fontFamily: 'var(--mono)', fontSize: 13, textTransform: 'uppercase',
      }}>
        <span style={{
          fontFamily: "'Inter Tight', 'Helvetica Neue', Arial, sans-serif",
          fontSize: 20, fontWeight: 900, letterSpacing: '-0.03em',
        }}>
          Northfold
        </span>
        <a
          href="mailto:hello@northfold.studio"
          style={{ color: '#fff', textDecoration: 'none' }}
          onMouseEnter={e => e.target.style.color = '#ee3524'}
          onMouseLeave={e => e.target.style.color = '#fff'}
        >
          hello@northfold.studio
        </a>
        <span style={{ color: '#a3a3a3' }}>© 2026 Northfold Studio</span>
        <a
          href={backHref}
          style={{ color: '#fff', textDecoration: 'none' }}
          onMouseEnter={e => e.target.style.color = '#ee3524'}
          onMouseLeave={e => e.target.style.color = '#fff'}
        >
          {backLabel}
        </a>
      </div>
    </footer>
  );
}
