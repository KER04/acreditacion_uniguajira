import { useState } from 'react'
import { Icons } from '../../components/Icons'
import { useData } from '../../context/DataContext'
import SedeFilter, { sedeMatch } from '../../components/SedeFilter'
import { fechaLarga } from '../../../shared/validacion'

const CATS = [
  ['all', 'Todas'],
  ['Investigación', 'Investigación'],
  ['Internacionalización', 'Internacional'],
  ['Extensión', 'Extensión'],
  ['Prácticas', 'Prácticas'],
  ['Estímulos', 'Estímulos / Becas'],
  ['Eventos', 'Eventos'],
]

const colorMap = {
  Investigación: 'var(--ug-azul)',
  Internacionalización: 'var(--ug-amarillo)',
  Extensión: 'var(--ug-flamingo)',
  Prácticas: 'var(--ug-marino)',
  Estímulos: 'var(--ug-amarillo)',
  Eventos: 'var(--ug-azul)',
}

export default function Convocatorias() {
  const { data } = useData()
  const [cat, setCat] = useState('all')
  const [sede, setSede] = useState('ambas')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)

  const items = (data.convocatorias ?? []).filter(c => {
    const matchCat = cat === 'all' || c.categoria === cat
    const matchQ = !q || c.titulo.toLowerCase().includes(q.toLowerCase()) || (c.descripcion ?? '').toLowerCase().includes(q.toLowerCase())
    const matchSede = sedeMatch(c.sede, sede)
    return matchCat && matchQ && matchSede
  })

  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: 'clamp(60px,8vw,110px)' }}>
        <div className="inner">
          <div className="eyebrow">Convocatorias y Eventos</div>
          <h1 style={{ marginTop: 14, maxWidth: '22ch' }}>Oportunidades abiertas para la comunidad del programa.</h1>
          <p style={{ fontSize: 18, color: 'var(--ink-2)', marginTop: 24, maxWidth: '58ch' }}>
            Prácticas, becas, semilleros, eventos y más. Actualizadas permanentemente por el equipo administrativo.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 16 }}>
        <div className="inner">
          <div className="filtros-barra" style={{ marginTop: 0, marginBottom: 16 }}>
            <div className="filtros-barra__chips">
              {CATS.map(([k, l]) => (
                <button key={k} className="chip" onClick={() => setCat(k)}
                  style={{ cursor: 'pointer', background: cat === k ? 'var(--ink)' : undefined, color: cat === k ? 'var(--paper)' : undefined, borderColor: cat === k ? 'var(--ink)' : undefined }}>{l}</button>
              ))}
            </div>
            <div className="filtros-barra__hueco" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar convocatorias..."
              aria-label="Buscar convocatorias" className="filtros-barra__buscar" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.1em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>Sede:</span>
            <SedeFilter value={sede} onChange={setSede} />
          </div>

          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-3)' }}>No hay convocatorias con ese criterio.</div>
          ) : (
            <div className="grid-3">
              {items.map((c, i) => {
                const id = c.id ?? i
                const abierta = open === id
                /* `vencida` la calcula el servidor con la fecha de cierre: una
                   convocatoria vencida no ofrece postularse aunque su estado
                   en el panel siga diciendo «Abierta». */
                const cerrada = Boolean(c.vencida)
                const postular = !cerrada && c.url_postulacion
                const verDoc = c.documento_url || (cerrada ? c.url_postulacion : '')
                const mostrarDoc = verDoc && verDoc !== postular
                const reqs = (Array.isArray(c.requisitos) ? c.requisitos : [c.requisitos]).filter(Boolean)
                const hayDetalles = reqs.length > 0 || c.fecha_apertura || c.dirigida_a
                return (
                  <article key={id} className="card conv-card" style={{ background: 'var(--paper-2)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}>
                      <span className="chip" style={{ fontSize: 10, background: colorMap[c.categoria] ?? 'var(--paper-3)', color: 'var(--ug-negro)', border: 'none' }}>{c.categoria}</span>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: 4 }}>
                        <span className={'conv-estado' + (cerrada ? ' is-cerrada' : '')}>{cerrada ? 'Cerrada' : (c.estado || 'Abierta')}</span>
                        {c.fecha_cierre && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>Cierre: {fechaLarga(c.fecha_cierre)}</span>
                        )}
                        {c.sede && c.sede !== 'ambas' && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.08em', color: 'var(--ug-marino)', textTransform: 'uppercase' }}>● {c.sede}</span>
                        )}
                      </div>
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, letterSpacing: '-0.01em', lineHeight: 1.2, margin: 0 }}>{c.titulo}</h2>
                    <p style={{ fontSize: 14, color: 'var(--ink-2)', flex: 1, margin: 0 }}>{c.descripcion}</p>

                    {abierta && (
                      <div id={'conv-detalle-' + id} className="conv-detalle">
                        {(c.fecha_apertura || c.fecha_cierre) && (
                          <div><b>Fechas:</b> {[c.fecha_apertura && 'del ' + fechaLarga(c.fecha_apertura), c.fecha_cierre && 'al ' + fechaLarga(c.fecha_cierre)].filter(Boolean).join(' ')}</div>
                        )}
                        {c.dirigida_a && <div><b>Dirigida a:</b> {c.dirigida_a}</div>}
                        {reqs.length > 0 && (
                          <>
                            <div style={{ fontWeight: 600, marginTop: 6 }}>Requisitos</div>
                            <ul>{reqs.map((r, j) => <li key={j}>{r}</li>)}</ul>
                          </>
                        )}
                      </div>
                    )}

                    <div className="conv-acciones">
                      {postular && (
                        <a className="btn accent" href={postular} target="_blank" rel="noopener noreferrer">
                          Postularme <Icons.external />
                        </a>
                      )}
                      {mostrarDoc && (
                        <a className="btn ghost" href={verDoc} target="_blank" rel="noopener noreferrer">
                          Ver convocatoria <Icons.external />
                        </a>
                      )}
                      {hayDetalles && (
                        <button type="button" className="conv-toggle" aria-expanded={abierta} aria-controls={'conv-detalle-' + id}
                                onClick={() => setOpen(abierta ? null : id)}>
                          {abierta ? 'Ocultar detalles' : 'Ver detalles'}
                        </button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
