const SEDES = [
  { k: 'ambas', l: 'Ambas sedes' },
  { k: 'riohacha', l: 'Riohacha' },
  { k: 'maicao', l: 'Maicao' },
]

export default function SedeFilter({ value, onChange, style }) {
  return (
    <div style={{ display: 'flex', gap: 0, border: '1px solid color-mix(in oklab, var(--ink) 15%, transparent)', borderRadius: 999, overflow: 'hidden', ...style }}>
      {SEDES.map(s => (
        <button key={s.k} onClick={() => onChange(s.k)}
          style={{ padding: '8px 16px', fontSize: 13, fontFamily: 'var(--font-mono)', letterSpacing: '.06em', border: 'none', background: value === s.k ? 'var(--ug-marino)' : 'transparent', color: value === s.k ? 'var(--paper)' : 'var(--ink-2)', cursor: 'pointer', transition: 'background .15s, color .15s', whiteSpace: 'nowrap' }}>
          {s.l}
        </button>
      ))}
    </div>
  )
}

export function sedeMatch(itemSede, filter) {
  if (filter === 'ambas') return true
  if (!itemSede || itemSede === 'ambas') return true
  return itemSede === filter
}
