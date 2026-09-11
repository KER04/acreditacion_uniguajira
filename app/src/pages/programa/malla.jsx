/* Piezas compartidas por las dos mallas curriculares: la vigente (/pensum) y la
   propuesta de actualización (/pensum-propuesto).

   Vivían dentro de Pensum.jsx; se sacaron aquí cuando apareció la segunda malla,
   para que ambas se vean y se comporten igual. Los colores por área son el
   contrato entre las dos vistas: si una cambia de paleta, cambian las dos.

   Todo lo de aquí trabaja sobre la forma de pensum.json —semestres con materias
   que declaran `campo` y `area`—, así que no distingue cuál plan está pintando. */
import { Icons } from '../../components/Icons'
import Portal from '../../components/Portal'

/* Color por área. `filterKey` agrupa para los botones de arriba; `campoKey`,
   para la leyenda de campos de formación. Dos áreas distintas pueden caer en el
   mismo campo: Ciencias Básicas y Cs. Básicas de Ingeniería son ambas "básico
   general", y por eso el filtro no es una sola clave. */
export const AREA_CFG = {
  'Ciencias Básicas': {
    filterKey: 'basicas',     campoKey: 'basico-general',
    label:       'Ciencias Básicas',
    border:      '#62a9b6',
    borderMuted: 'rgba(98,169,182,0.6)',
    badge:       'rgba(98,169,182,0.5)',
    bg:          'rgba(98,169,182,0.15)',
    hover:       'rgba(98,169,182,0.25)',
  },
  'Ciencias Básicas de Ingeniería': {
    filterKey: 'ingenieria',  campoKey: 'basico-general',
    label:       'Ciencias Básicas de Ingeniería',
    border:      '#01616c',
    borderMuted: 'rgba(1,97,108,0.6)',
    badge:       'rgba(1,97,108,0.5)',
    bg:          'rgba(1,97,108,0.15)',
    hover:       'rgba(1,97,108,0.25)',
  },
  'Perfil Profesional': {
    filterKey: 'profesional', campoKey: 'basico-especifico',
    label:       'Perfil Profesional',
    border:      '#cc5e50',
    borderMuted: 'rgba(204,94,80,0.6)',
    badge:       'rgba(204,94,80,0.5)',
    bg:          'rgba(204,94,80,0.15)',
    hover:       'rgba(204,94,80,0.25)',
  },
  'Complementaria': {
    filterKey: 'socio',       campoKey: 'socio',
    label:       'Socio Humanístico — Complementaria',
    border:      '#e2a542',
    borderMuted: 'rgba(226,165,66,0.6)',
    badge:       'rgba(226,165,66,0.5)',
    bg:          'rgba(226,165,66,0.15)',
    hover:       'rgba(226,165,66,0.25)',
  },
  'Investigativo': {
    filterKey: 'socio',       campoKey: 'investigativo',
    label:       'Socio Humanístico — Investigativo',
    border:      '#b5832e',
    borderMuted: 'rgba(181,131,46,0.6)',
    badge:       'rgba(181,131,46,0.5)',
    bg:          'rgba(181,131,46,0.15)',
    hover:       'rgba(181,131,46,0.25)',
  },
}

/* Un área que no esté en la tabla no rompe la vista: se pinta en gris y queda
   fuera de todos los filtros. */
const CFG_NEUTRO = {
  filterKey: '', campoKey: '', label: '',
  border: '#d4cfc6', borderMuted: '#d4cfc6', badge: 'rgba(3,9,15,.35)',
  bg: '#fff', hover: 'rgba(212,207,198,.18)',
}
export const cfgDe = area => AREA_CFG[area] ?? { ...CFG_NEUTRO, label: area }

export const FILTERS = [
  { k: 'all',         l: 'Todos',                    color: '#03090f', text: '#fff' },
  { k: 'basicas',     l: 'Ciencias Básicas',          color: '#62a9b6', text: '#fff' },
  { k: 'ingenieria',  l: 'Ciencias Básicas de Ing.',  color: '#01616c', text: '#fff' },
  { k: 'profesional', l: 'Perfil Profesional',        color: '#cc5e50', text: '#fff' },
  { k: 'socio',       l: 'Complementaria',            color: '#e2a542', text: '#03090f' },
]

export const LEGEND = [
  { key: 'basico-general',    label: 'Básico General - Científico Disciplinar', colors: ['#62a9b6', '#01616c'] },
  { key: 'basico-especifico', label: 'Básico Específico Profesional',           colors: ['#cc5e50'] },
  { key: 'socio',             label: 'Socio Humanístico',                       colors: ['#e2a542'] },
  { key: 'investigativo',     label: 'Investigativo',                           colors: ['#b5832e'] },
]

/* ─── Gráfico de dona ──────────────────────────────────────────── */

const CHART_AREAS = [
  { area: 'Ciencias Básicas',               label: 'Ciencias Básicas',   color: '#62a9b6' },
  { area: 'Ciencias Básicas de Ingeniería', label: 'Cs. Básicas Ing.',   color: '#01616c' },
  { area: 'Perfil Profesional',             label: 'Perfil Profesional', color: '#cc5e50' },
  { area: 'Complementaria',                 label: 'Complementaria',     color: '#e2a542' },
  { area: 'Investigativo',                  label: 'Investigativo',      color: '#b5832e' },
]

/* Créditos por área del plan que se le pase. Se calcula por vista y no una vez
   al importar el módulo, porque ahora hay dos planes con repartos distintos. */
export function creditosPorArea(semestres) {
  const cr = {}
  semestres.forEach(s => s.materias.forEach(m => { cr[m.area] = (cr[m.area] || 0) + m.creditos }))
  return CHART_AREAS.map(s => ({
    ...s,
    credits:   cr[s.area] || 0,
    filterKey: cfgDe(s.area).filterKey,
    campoKey:  cfgDe(s.area).campoKey,
  })).filter(s => s.credits > 0)
}

function polarXY(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}

function donutArc(cx, cy, oR, iR, a0, a1) {
  if (a1 - a0 >= 359.99) {
    const [ax, ay] = polarXY(cx, cy, oR, 0), [bx, by] = polarXY(cx, cy, oR, 180)
    const [ix, iy] = polarXY(cx, cy, iR, 0), [jx, jy] = polarXY(cx, cy, iR, 180)
    return `M${ax} ${ay}A${oR} ${oR} 0 1 1 ${bx} ${by}A${oR} ${oR} 0 1 1 ${ax} ${ay}M${ix} ${iy}A${iR} ${iR} 0 1 0 ${jx} ${jy}A${iR} ${iR} 0 1 0 ${ix} ${iy}`
  }
  const lg = a1 - a0 > 180 ? 1 : 0
  const [ox1, oy1] = polarXY(cx, cy, oR, a0), [ox2, oy2] = polarXY(cx, cy, oR, a1)
  const [ix1, iy1] = polarXY(cx, cy, iR, a1), [ix2, iy2] = polarXY(cx, cy, iR, a0)
  return `M${ox1} ${oy1}A${oR} ${oR} 0 ${lg} 1 ${ox2} ${oy2}L${ix1} ${iy1}A${iR} ${iR} 0 ${lg} 0 ${ix2} ${iy2}Z`
}

export function Donut({ datos, filter, campoFilter }) {
  const isFiltering = filter !== 'all' || campoFilter !== 'all'

  const activas = new Set()
  if (filter !== 'all')           datos.forEach(s => { if (s.filterKey === filter)     activas.add(s.area) })
  else if (campoFilter !== 'all') datos.forEach(s => { if (s.campoKey === campoFilter) activas.add(s.area) })

  const totalCr  = datos.reduce((a, s) => a + s.credits, 0)
  const activeCr = isFiltering ? datos.filter(s => activas.has(s.area)).reduce((a, s) => a + s.credits, 0) : totalCr
  const centerTxt = isFiltering ? `${Math.round(activeCr / totalCr * 100)}%` : `${totalCr}cr`

  let cum = 0
  const segs = datos.map(s => {
    const angle = (s.credits / totalCr) * 360
    const seg = { ...s, a0: cum, a1: cum + angle }
    cum += angle
    return seg
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
      <svg width={120} height={120} viewBox="0 0 120 120">
        {segs.map(s => (
          <path key={s.area} d={donutArc(60, 60, 52, 34, s.a0, s.a1)}
            fill={s.color} stroke="#fff" strokeWidth={1.5}
            opacity={isFiltering && !activas.has(s.area) ? 0.15 : 1}
            style={{ transition: 'opacity 0.3s ease' }} />
        ))}
        <text x={60} y={isFiltering ? 57 : 61} textAnchor="middle" dominantBaseline="middle"
          fontSize={18} fontWeight={700} fill="#03090f">{centerTxt}</text>
        {isFiltering && (
          <text x={60} y={74} textAnchor="middle" fontSize={9} fill="rgba(3,9,15,.4)">del total</text>
        )}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {segs.map(s => (
          <div key={s.area} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            opacity: isFiltering && !activas.has(s.area) ? 0.3 : 1,
            transition: 'opacity 0.3s ease',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#03090f', whiteSpace: 'nowrap' }}>
              {s.label}{' '}
              <span style={{ color: 'rgba(3,9,15,.45)' }}>
                · {Math.round(s.credits / totalCr * 100)}% · {s.credits}cr
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Filtros por área y por campo de formación ────────────────── */

export function FiltrosMalla({ filter, setFilter, campoFilter, setCampoFilter }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {FILTERS.map(f => {
          const active = filter === f.k && campoFilter === 'all'
          return (
            <button
              key={f.k}
              onClick={() => { setFilter(f.k); setCampoFilter('all') }}
              style={{
                padding: '8px 16px', borderRadius: 20, cursor: 'pointer',
                fontSize: 12, fontWeight: 500, transition: 'all 0.2s ease',
                background:  active ? f.color : 'transparent',
                color:       active ? f.text  : '#03090f',
                border:      active ? `1px solid ${f.color}` : '1px solid #d4cfc6',
              }}
            >
              {f.l}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
        {LEGEND.map(l => {
          const active = campoFilter === l.key
          return (
            <button
              key={l.key}
              onClick={() => { setCampoFilter(active ? 'all' : l.key); setFilter('all') }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 20, cursor: 'pointer',
                border:      active ? `1px solid ${l.colors[0]}` : '1px solid #d4cfc6',
                background:  active ? l.colors[0] : 'transparent',
                fontSize: 11, fontWeight: 500,
                color:       active ? '#fff' : '#03090f',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ display: 'inline-flex', gap: 3 }}>
                {l.colors.map((c, i) => (
                  <span key={i} style={{ width: 8, height: 8, borderRadius: 2, background: c, flexShrink: 0 }} />
                ))}
              </span>
              {l.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Grilla de semestres ──────────────────────────────────────── */

export function MallaGrid({ semestres, filter, campoFilter, selected, onSelect }) {
  const isFiltering = filter !== 'all' || campoFilter !== 'all'

  return (
    <div
      className="pensum"
      style={{ gridTemplateColumns: `repeat(${semestres.length}, minmax(115px,1fr))` }}
    >
      {semestres.map((sem, si) => (
        <div key={si} className="sem-col">
          <div className="sem-head">
            Sem · {String(si + 1).padStart(2, '0')} · {sem.total_creditos} cr
          </div>

          {sem.materias.map((m, mi) => {
            const cfg       = cfgDe(m.area)
            const matches   = (filter === 'all' || cfg.filterKey === filter) &&
                              (campoFilter === 'all' || cfg.campoKey === campoFilter)
            const dimmed    = isFiltering && !matches
            const highlight = isFiltering && matches
            const isActive  = selected?.si === si && selected?.mi === mi

            return (
              <button
                key={mi}
                className={'course' + (isActive ? ' active' : '')}
                style={{
                  opacity:      dimmed ? 0.35 : 1,
                  textAlign:    'left',
                  '--c-border': highlight ? cfg.border : cfg.borderMuted,
                  '--c-bg':     highlight ? cfg.bg     : '#ffffff',
                  '--c-hover':  highlight ? cfg.hover  : 'rgba(212,207,198,.18)',
                }}
                onClick={() => onSelect(isActive ? null : { si, mi, m, sem, cfg })}
              >
                <strong style={{ fontWeight: 600 }}>{m.nombre}</strong>
                <span style={{ display: 'inline-flex', gap: 4, marginTop: 5 }}>
                  {[`${m.creditos} cr`, `${m.horas_semana} h/sem`].map(t => (
                    <span key={t} style={{
                      background: cfg.badge,
                      color: '#fff', borderRadius: 4,
                      padding: '2px 6px', fontSize: 11, fontWeight: 700,
                    }}>{t}</span>
                  ))}
                </span>
              </button>
            )
          })}

          <div style={{
            marginTop: 'auto', padding: '8px 10px',
            fontFamily: 'var(--font-mono)', fontSize: 10,
            letterSpacing: '.15em', textTransform: 'uppercase',
            color: 'rgba(3,9,15,.4)',
            borderTop: '1px solid rgba(3,9,15,.08)',
            textAlign: 'right',
          }}>
            {sem.total_creditos} cr · {sem.total_horas} h
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Ficha de la materia ──────────────────────────────────────── */

/* `pie` deja que cada vista ponga sus propios botones al final: la malla
   vigente ofrece el microcurrículo, la propuesta todavía no tiene ninguno. */
export function MateriaDrawer({ selected, onClose, pie }) {
  if (!selected) return null
  const { m, cfg, si } = selected

  const chips = [
    m.codigo && { l: 'Código', v: m.codigo },
    { l: 'Créditos', v: `${m.creditos} cr` },
    { l: 'Horas',    v: `${m.horas_semana} h / sem` },
  ].filter(Boolean)

  return (
    <Portal>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="drawer">

        <div style={{
          position: 'sticky', top: 0, zIndex: 2,
          background: cfg.border,
          padding: '24px 32px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              letterSpacing: '.16em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,.7)', marginBottom: 6,
            }}>
              Semestre {String(si + 1).padStart(2, '0')} · {m.area}
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1.3, margin: 0 }}>
              {m.nombre}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 34, height: 34, borderRadius: 999, flexShrink: 0, marginLeft: 16,
              border: '1px solid rgba(255,255,255,.35)', background: 'transparent',
              color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center',
            }}
          >
            <Icons.close />
          </button>
        </div>

        <div style={{
          background: cfg.bg.replace('0.15', '0.10'),
          padding: '28px 32px', minHeight: 'calc(100% - 110px)',
        }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
            {chips.map(({ l, v }) => (
              <span key={l} style={{
                padding: '5px 12px', borderRadius: 999,
                border: `1px solid ${cfg.border}`,
                background: '#fff', fontSize: 12, color: '#03090f',
              }}>
                <span style={{ opacity: .5, marginRight: 4, fontSize: 11 }}>{l}</span>
                <b>{v}</b>
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { label: 'Campo de formación', value: (
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '4px 12px', borderRadius: 999,
                  background: cfg.border, color: '#fff',
                  fontSize: 12, fontWeight: 600,
                }}>
                  {cfg.label}
                </span>
              )},
              { label: 'Área',                  value: m.area },
              { label: 'Componente curricular', value: m.campo },
              { label: 'Semestre',              value: `Semestre ${si + 1}°` },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{
                  fontSize: 10, fontFamily: 'var(--font-mono)',
                  letterSpacing: '.14em', textTransform: 'uppercase',
                  color: 'rgba(3,9,15,.4)', marginBottom: 5,
                }}>
                  {label}
                </div>
                <div style={{ fontSize: 14, color: '#03090f', fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 36, display: 'flex', gap: 10 }}>
            {pie}
            <button className="btn ghost" onClick={onClose}>Cerrar</button>
          </div>
        </div>

      </aside>
    </Portal>
  )
}
