import { useState } from 'react'
import { Icons } from '../../components/Icons'
import pensumData from '../../data/pensum.json'

const AREA_CFG = {
  'Ciencias Básicas': {
    filterKey: 'basicas',     campoKey: 'basico-general',
    label:       'Ciencias Básicas',
    border:      '#62a9b6',
    borderMuted: 'rgba(98,169,182,0.6)',
    bg:          'rgba(98,169,182,0.15)',
    hover:       'rgba(98,169,182,0.25)',
  },
  'Ciencias Básicas de Ingeniería': {
    filterKey: 'ingenieria',  campoKey: 'basico-general',
    label:       'Ciencias Básicas de Ingeniería',
    border:      '#01616c',
    borderMuted: 'rgba(1,97,108,0.6)',
    bg:          'rgba(1,97,108,0.15)',
    hover:       'rgba(1,97,108,0.25)',
  },
  'Perfil Profesional': {
    filterKey: 'profesional', campoKey: 'basico-especifico',
    label:       'Perfil Profesional',
    border:      '#cc5e50',
    borderMuted: 'rgba(204,94,80,0.6)',
    bg:          'rgba(204,94,80,0.15)',
    hover:       'rgba(204,94,80,0.25)',
  },
  'Complementaria': {
    filterKey: 'socio',       campoKey: 'socio',
    label:       'Socio Humanístico — Complementaria',
    border:      '#e2a542',
    borderMuted: 'rgba(226,165,66,0.6)',
    bg:          'rgba(226,165,66,0.15)',
    hover:       'rgba(226,165,66,0.25)',
  },
  'Investigativo': {
    filterKey: 'socio',       campoKey: 'investigativo',
    label:       'Socio Humanístico — Investigativo',
    border:      '#b5832e',
    borderMuted: 'rgba(181,131,46,0.6)',
    bg:          'rgba(181,131,46,0.15)',
    hover:       'rgba(181,131,46,0.25)',
  },
}

const FILTERS = [
  { k: 'all',         l: 'Todos',                    color: '#03090f', text: '#fff' },
  { k: 'basicas',     l: 'Ciencias Básicas',          color: '#62a9b6', text: '#fff' },
  { k: 'ingenieria',  l: 'Ciencias Básicas de Ing.',  color: '#01616c', text: '#fff' },
  { k: 'profesional', l: 'Perfil Profesional',        color: '#cc5e50', text: '#fff' },
  { k: 'socio',       l: 'Complementaria',            color: '#e2a542', text: '#03090f' },
]

const LEGEND = [
  { key: 'basico-general',    label: 'Básico General - Científico Disciplinar', colors: ['#62a9b6', '#01616c'] },
  { key: 'basico-especifico', label: 'Básico Específico Profesional',           colors: ['#cc5e50'] },
  { key: 'socio',             label: 'Socio Humanístico',                       colors: ['#e2a542'] },
  { key: 'investigativo',     label: 'Investigativo',                           colors: ['#b5832e'] },
]

export default function Pensum() {
  const [selected,    setSelected]    = useState(null)
  const [filter,      setFilter]      = useState('all')
  const [campoFilter, setCampoFilter] = useState('all')

  const { semestres, total_creditos } = pensumData
  const totalMaterias = semestres.reduce((a, s) => a + s.materias.length, 0)

  const isFiltering = filter !== 'all' || campoFilter !== 'all'

  return (
    <div className="page-in">

      {/* ── Cabecera ── */}
      <section className="section" style={{ paddingTop: 'clamp(60px,8vw,110px)', paddingBottom: 32 }}>
        <div className="inner">
          <div className="eyebrow">Plan de estudios</div>
          <h1 style={{ marginTop: 14, maxWidth: '16ch' }}>Diez semestres. Cada curso, una pieza del tejido.</h1>

          {/* Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 32, alignItems: 'center' }}>
            <div className="chip"><b style={{ marginRight: 5 }}>{total_creditos}</b>créditos totales</div>
            <div className="chip"><b style={{ marginRight: 5 }}>{totalMaterias}</b>asignaturas</div>
            <div className="chip">10 semestres · 5 años</div>
            <div className="chip"><b style={{ marginRight: 4 }}>SNIES</b>17579</div>
            <div className="chip" style={{ background: '#e2a542', color: '#03090f', borderColor: '#e2a542', fontWeight: 700 }}>
              ★ Acreditado Alta Calidad
            </div>
            <div style={{ flex: 1 }} />
            <button className="btn ghost" style={{ padding: '8px 16px', fontSize: 13 }}>
              <Icons.download /> Descargar PDF
            </button>
          </div>

          {/* Filtros de área */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 28 }}>
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

          {/* Leyenda de campos de formación — clicable */}
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
      </section>

      {/* ── Grilla de semestres ── */}
      <section style={{ padding: '0 var(--gutter) 60px' }}>
        <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>
          <div className="pensum">
            {semestres.map((sem, si) => (
              <div key={si} className="sem-col">
                <div className="sem-head">
                  Sem · {String(si + 1).padStart(2, '0')} · {sem.total_creditos} cr
                </div>

                {sem.materias.map((m, mi) => {
                  const cfg       = AREA_CFG[m.area] ?? { filterKey: '', campoKey: '', label: m.area, border: '#d4cfc6', borderMuted: '#d4cfc6', bg: '#fff', hover: 'rgba(212,207,198,.18)' }
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
                      onClick={() => setSelected(isActive ? null : { si, mi, m, sem, cfg })}
                    >
                      <strong style={{ fontWeight: 600 }}>{m.nombre}</strong>
                      <span className="cr">
                        {m.creditos} cr · {m.horas_semana} h/sem
                      </span>
                    </button>
                  )
                })}

                {/* Total al fondo */}
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
        </div>
      </section>

      {/* ── Drawer / Modal ── */}
      {selected && (
        <>
          <div className="drawer-backdrop" onClick={() => setSelected(null)} />
          <aside className="drawer">

            {/* Encabezado color sólido */}
            <div style={{
              position: 'sticky', top: 0, zIndex: 2,
              background: selected.cfg.border,
              padding: '24px 32px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  letterSpacing: '.16em', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,.7)', marginBottom: 6,
                }}>
                  Semestre {String(selected.si + 1).padStart(2, '0')} · {selected.m.area}
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1.3, margin: 0 }}>
                  {selected.m.nombre}
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{
                  width: 34, height: 34, borderRadius: 999, flexShrink: 0, marginLeft: 16,
                  border: '1px solid rgba(255,255,255,.35)', background: 'transparent',
                  color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center',
                }}
              >
                <Icons.close />
              </button>
            </div>

            {/* Cuerpo con color al 10% */}
            <div style={{
              background: selected.cfg.bg.replace('0.15', '0.10'),
              padding: '28px 32px', minHeight: 'calc(100% - 110px)',
            }}>
              {/* Chips de datos */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
                {[
                  { l: 'Código',   v: selected.m.codigo },
                  { l: 'Créditos', v: `${selected.m.creditos} cr` },
                  { l: 'Horas',    v: `${selected.m.horas_semana} h / sem` },
                ].map(({ l, v }) => (
                  <span key={l} style={{
                    padding: '5px 12px', borderRadius: 999,
                    border: `1px solid ${selected.cfg.border}`,
                    background: '#fff', fontSize: 12, color: '#03090f',
                  }}>
                    <span style={{ opacity: .5, marginRight: 4, fontSize: 11 }}>{l}</span>
                    <b>{v}</b>
                  </span>
                ))}
              </div>

              {/* Detalles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  { label: 'Campo de formación', value: (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '4px 12px', borderRadius: 999,
                      background: selected.cfg.border, color: '#fff',
                      fontSize: 12, fontWeight: 600,
                    }}>
                      {selected.cfg.label}
                    </span>
                  )},
                  { label: 'Área',                  value: selected.m.area },
                  { label: 'Componente curricular', value: selected.m.campo },
                  { label: 'Semestre',              value: `Semestre ${selected.si + 1}°` },
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
                <button className="btn" style={{ background: selected.cfg.border, borderColor: selected.cfg.border, color: '#fff' }}>
                  <Icons.download /> Microcurrículo PDF
                </button>
                <button className="btn ghost" onClick={() => setSelected(null)}>Cerrar</button>
              </div>
            </div>

          </aside>
        </>
      )}
    </div>
  )
}
