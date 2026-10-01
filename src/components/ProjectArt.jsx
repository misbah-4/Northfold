/**
 * ProjectArt — typographic cover art per project, used until real
 * photography is dropped in. Each slug gets its own palette and motif.
 * Swap for <img> by passing `src`.
 */
export const ART = {
  halden:    { bg: '#1f4d3a', fg: '#f3e9d2', accent: '#d9822b', mark: 'H—', motif: 'stamp' },
  orbit:     { bg: '#2b3cff', fg: '#ffffff', accent: '#c7ff3d', mark: 'Orbit', motif: 'ring' },
  tidewater: { bg: '#ee3524', fg: '#ffffff', accent: '#1a1aff', mark: 'Tide', motif: 'waves' },
  mora:      { bg: '#efe4dc', fg: '#2a1f1a', accent: '#c9a48f', mark: 'mora', motif: 'arch' },
  signal:    { bg: '#111111', fg: '#f7d066', accent: '#ee3524', mark: 'FM', motif: 'bars' },
  atlas:     { bg: '#f7d066', fg: '#111111', accent: '#ee3524', mark: 'A/26', motif: 'grid' },
  northline: { bg: '#a9c4c9', fg: '#0d2a33', accent: '#ee3524', mark: 'N↑', motif: 'peaks' },
  parallel:  { bg: '#ff8fc7', fg: '#140a2e', accent: '#140a2e', mark: '||', motif: 'stripes' },
};

function Motif({ motif, fg, accent }) {
  switch (motif) {
    case 'ring':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <ellipse cx="260" cy="150" rx="150" ry="58" fill="none" stroke={fg} strokeWidth="2" opacity=".5" transform="rotate(-18 260 150)" />
          <circle cx="260" cy="150" r="64" fill={accent} />
          <circle cx="132" cy="98" r="10" fill={fg} />
        </svg>
      );
    case 'waves':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <path key={i} d={`M-20 ${150 + i * 26} Q 80 ${110 + i * 26} 180 ${150 + i * 26} T 420 ${150 + i * 26}`}
              fill="none" stroke={i % 2 ? accent : fg} strokeWidth="10" />
          ))}
        </svg>
      );
    case 'arch':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path d="M230 300 V150 a70 70 0 0 1 140 0 V300 Z" fill={accent} />
          <circle cx="300" cy="120" r="18" fill={fg} opacity=".85" />
        </svg>
      );
    case 'bars':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {Array.from({ length: 18 }, (_, i) => {
            const h = 30 + Math.abs(Math.sin(i * 1.7)) * 160;
            return <rect key={i} x={170 + i * 12} y={250 - h} width="6" height={h} fill={i === 9 ? accent : fg} />;
          })}
        </svg>
      );
    case 'grid':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {Array.from({ length: 6 }, (_, r) => Array.from({ length: 8 }, (_, c) => (
            <rect key={`${r}-${c}`} x={160 + c * 30} y={40 + r * 36} width="22" height="22"
              fill={(r * 8 + c) % 7 === 3 ? accent : 'none'} stroke={fg} strokeWidth="1.5" />
          )))}
        </svg>
      );
    case 'peaks':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path d="M120 300 L230 120 L290 210 L330 160 L420 300 Z" fill={fg} />
          <path d="M230 120 L255 160 L240 158 L230 175 L215 150 Z" fill="#fff" />
          <circle cx="340" cy="80" r="22" fill={accent} />
        </svg>
      );
    case 'stripes':
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} x={180 + i * 26} y="-20" width="12" height="340" fill={fg} transform={`rotate(12 ${186 + i * 26} 150)`} />
          ))}
        </svg>
      );
    case 'stamp':
    default:
      return (
        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <circle cx="290" cy="150" r="92" fill="none" stroke={fg} strokeWidth="2" strokeDasharray="4 6" />
          <circle cx="290" cy="150" r="64" fill={accent} />
          <text x="290" y="158" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="18" fill={fg}>EST. 2026</text>
        </svg>
      );
  }
}

export default function ProjectArt({ slug, title = '', src, className = '', style }) {
  if (src) {
    return <img src={src} alt={title} className={`project-art ${className}`} style={{ objectFit: 'cover', ...style }} />;
  }
  const a = ART[slug] || ART.halden;
  return (
    <div
      className={`project-art ${className}`}
      role="img"
      aria-label={`${title} cover art`}
      style={{ background: a.bg, color: a.fg, ...style }}
    >
      <Motif {...a} />
      <span className="project-art__mark">{a.mark}</span>
    </div>
  );
}
