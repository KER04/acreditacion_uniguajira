const SEDES = [
  { k: 'ambas', l: 'Ambas sedes' },
  { k: 'riohacha', l: 'Riohacha' },
  { k: 'maicao', l: 'Maicao' },
]

export default function SedeFilter({ value, onChange, style }) {
  return (
    <div className="sede-filtro" style={style}>
      {SEDES.map(s => (
        <button key={s.k} onClick={() => onChange(s.k)} aria-pressed={value === s.k}
          className={'sede-filtro__opcion' + (value === s.k ? ' sede-filtro__opcion--activa' : '')}>
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
