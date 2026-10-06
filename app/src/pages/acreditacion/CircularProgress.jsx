export default function CircularProgress({ value, size = 220, stroke = 14, label = 'PROMEDIO · ESCALA 0–100', texto }) {
  const r = (size - stroke) / 2
  const cir = 2 * Math.PI * r
  const off = cir - (value / 100) * cir
  /* La leyenda va por dentro del anillo, así que no puede ser más ancha que
     el hueco: cada tramo separado por « · » ocupa su propia línea. */
  const lineas = String(label).split(' · ')
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id={`cna-g-${size}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--ug-amarillo)" />
          <stop offset="50%" stopColor="var(--ug-flamingo)" />
          <stop offset="100%" stopColor="var(--ug-azul)" />
        </linearGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="color-mix(in oklab, var(--ink) 10%, transparent)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`url(#cna-g-${size})`} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={cir} strokeDashoffset={off} transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x="50%" y={lineas.length > 1 ? '46%' : '48%'} textAnchor="middle" fontFamily="var(--font-display)" fontSize={size * 0.25} fontWeight="500" fill="var(--ink)">
        {texto ?? value.toFixed(1)}
      </text>
      <text x="50%" y={lineas.length > 1 ? '58%' : '62%'} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={size * 0.048} letterSpacing="0.16em" fill="var(--ink-3)">
        {lineas.map((l, i) => <tspan key={l} x="50%" dy={i === 0 ? 0 : '1.5em'}>{l}</tspan>)}
      </text>
    </svg>
  )
}
