export default function CircularProgress({ value, size = 220, stroke = 14, label = 'PROMEDIO · ESCALA 0–100' }) {
  const r = (size - stroke) / 2
  const cir = 2 * Math.PI * r
  const off = cir - (value / 100) * cir
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
      <text x="50%" y="48%" textAnchor="middle" fontFamily="var(--font-display)" fontSize={size * 0.25} fontWeight="500" fill="var(--ink)">
        {value.toFixed(1)}
      </text>
      <text x="50%" y="62%" textAnchor="middle" fontFamily="var(--font-mono)" fontSize={size * 0.05} letterSpacing="0.2em" fill="var(--ink-3)">
        {label}
      </text>
    </svg>
  )
}
