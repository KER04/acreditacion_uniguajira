export function wayuuSvgURL(color = '#e2a542', bg = 'transparent') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 28" width="56" height="28">
    <rect width="56" height="28" fill="${bg}"/>
    <g fill="${color}">
      <path d="M14 0 L28 14 L14 28 L0 14 Z"/>
      <path d="M42 0 L56 14 L42 28 L28 14 Z" opacity="0.55"/>
    </g>
    <g stroke="${color}" stroke-width="1" fill="none" opacity="0.6">
      <path d="M0 14 L14 0 M28 14 L42 0 M14 28 L28 14 M42 28 L56 14"/>
    </g>
  </svg>`
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`
}

export function WayuuBand({ height = 60, colors, className = '' }) {
  const C = colors || ['var(--ug-amarillo)', 'var(--ug-flamingo)', 'var(--ug-azul)', 'var(--ug-negro)']
  const cells = 24
  return (
    <svg className={className} viewBox={`0 0 ${cells * 40} 60`} preserveAspectRatio="none"
         style={{ width: '100%', height, display: 'block' }}>
      {Array.from({ length: cells }).map((_, i) => {
        const x = i * 40
        const c = C[i % C.length]
        return (
          <g key={i} fill={c}>
            <path d={`M${x} 0 L${x + 20} 30 L${x} 60 L${x - 20} 30 Z`} opacity={i % 2 === 0 ? 1 : 0.4} />
          </g>
        )
      })}
    </svg>
  )
}

export function WayuuBackdrop({ variant = 'a' }) {
  if (variant === 'a') {
    return (
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.45 }}
           preserveAspectRatio="xMidYMid slice" viewBox="0 0 1600 900" aria-hidden>
        <defs>
          <pattern id="wp-a" x="0" y="0" width="160" height="80" patternUnits="userSpaceOnUse">
            <g fill="var(--accent)" opacity="0.12">
              <path d="M40 0 L80 40 L40 80 L0 40 Z"/>
              <path d="M120 0 L160 40 L120 80 L80 40 Z"/>
            </g>
            <g stroke="var(--accent)" strokeWidth="1" fill="none" opacity="0.18">
              <path d="M0 40 L40 0 M80 40 L120 0 M40 80 L80 40 M120 80 L160 40"/>
            </g>
          </pattern>
        </defs>
        <rect width="1600" height="900" fill="url(#wp-a)"/>
      </svg>
    )
  }
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.35 }}
         preserveAspectRatio="xMidYMid slice" viewBox="0 0 1600 900" aria-hidden>
      <g fill="none" stroke="var(--accent)" strokeWidth="1.2">
        {[0,1,2,3,4,5,6].map(k => (
          <path key={k}
            d={`M${800} ${450-(60+k*70)} L${800+(60+k*70)*1.6} ${450} L${800} ${450+(60+k*70)} L${800-(60+k*70)*1.6} ${450} Z`}
            opacity={0.15+k*0.04}
          />
        ))}
      </g>
    </svg>
  )
}

export function WayuuGlyph({ size = 56, color = 'var(--ink)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <g fill={color}>
        <path d="M28 4 L40 16 L28 28 L16 16 Z" opacity="0.9"/>
        <path d="M28 28 L40 40 L28 52 L16 40 Z" opacity="0.45"/>
      </g>
      <g stroke={color} strokeWidth="1" fill="none" opacity="0.6">
        <path d="M28 4 L28 52 M16 16 L40 40 M40 16 L16 40"/>
      </g>
    </svg>
  )
}

export function Placeholder({ label, aspect = '1/1', style = {} }) {
  return (
    <div className="placeholder" style={{ aspectRatio: aspect, ...style }}>
      <div className="inside">{label}</div>
    </div>
  )
}
