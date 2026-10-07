import { useState } from 'react'
import { Icons } from '../../components/Icons'
import { useData } from '../../context/DataContext'
import SedeFilter, { sedeMatch } from '../../components/SedeFilter'
import GaleriaFotos from '../../components/GaleriaFotos'
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

/* Vitrina: el afiche de una convocatoria, como lo publica la universidad, y su
   texto al lado, en un mismo panel. Solo entran las que tienen fotos; primero
   las vigentes, después las ya cerradas (sus fotos siguen contando el evento).
   Se pasa de una a otra con las flechas o con las miniaturas del panel.

   El afiche no se recorta (cada pieza trae su proporción y su texto no puede
   perder los bordes). El hueco que deja lo llena la misma imagen, difuminada,
   para que el panel se lea como una sola pieza y no como una foto suelta. */
function Vitrina({ lista, onGaleria }) {
  const [i, setI] = useState(0)
  const n = lista.length
  const actual = Math.min(i, n - 1)
  const c = lista[actual]
  if (!c) return null
  const cerrada = Boolean(c.vencida)
  const postular = !cerrada && c.url_postulacion
  /* Misma regla que las tarjetas: cerrada, el enlace de postulación pasa a
     ser el de consulta, y no se repite si es el mismo que «Postularme». */
  const verDoc = c.documento_url || (cerrada ? c.url_postulacion : '')
  const mostrarDoc = verDoc && verDoc !== postular
  const fotos = c.fotos
  const datos = [
    ['Dirigida a', c.dirigida_a],
    ['Sede', c.sede && c.sede !== 'ambas' ? c.sede[0].toUpperCase() + c.sede.slice(1) : 'Riohacha y Maicao'],
    ['Cierre', c.fecha_cierre && fechaLarga(c.fecha_cierre)],
  ].filter(([, v]) => v)
  const ir = d => setI(x => (Math.min(x, n - 1) + d + n) % n)

  return (
    <section className="section conv-vitrina" aria-roledescription="carrusel" aria-label="Convocatorias y eventos en imágenes">
      <div className="inner">
        <article className="conv-vitrina__panel">
          <figure className="conv-vitrina__afiche">
            <div className="conv-vitrina__fondo" style={{ backgroundImage: `url("${fotos[0].url}")` }} aria-hidden="true" />
            <button type="button" onClick={() => onGaleria(c, 0)}
                    aria-label={`Ver ${fotos.length > 1 ? 'las ' + fotos.length + ' fotos' : 'el afiche'} de ${c.titulo}`}>
              <img key={fotos[0].id} src={fotos[0].url} alt={fotos[0].pie || 'Afiche: ' + c.titulo} />
            </button>
            {fotos.length > 1 && (
              <span className="conv-vitrina__mas"><Icons.camara size={14} /> {fotos.length} fotos</span>
            )}
          </figure>

          <div className="conv-vitrina__texto">
            <div className="conv-vitrina__cabeza">
              <div className="eyebrow">En imágenes</div>
              {n > 1 && (
                <div className="conv-vitrina__nav">
                  <span>{actual + 1} / {n}</span>
                  <button type="button" onClick={() => ir(-1)} aria-label="Convocatoria anterior">‹</button>
                  <button type="button" onClick={() => ir(1)} aria-label="Convocatoria siguiente">›</button>
                </div>
              )}
            </div>

            <div className="conv-vitrina__meta">
              <span className="chip" style={{ fontSize: 10, background: colorMap[c.categoria] ?? 'var(--paper-3)', color: 'var(--ug-negro)', border: 'none' }}>{c.categoria}</span>
              <span className={'conv-estado' + (cerrada ? ' is-cerrada' : '')}>{cerrada ? 'Cerrada' : (c.estado || 'Abierta')}</span>
              {(c.fecha_apertura || c.fecha_cierre) && (
                <span className="conv-vitrina__fecha">
                  {[c.fecha_apertura && fechaLarga(c.fecha_apertura), c.fecha_cierre && fechaLarga(c.fecha_cierre)].filter(Boolean).join(' – ')}
                </span>
              )}
            </div>
            <h2>{c.titulo}</h2>
            {c.descripcion && <p>{c.descripcion}</p>}

            {/* La ficha va al pie: llena la columna cuando la descripción es
                corta y deja las acciones siempre en el mismo sitio. */}
            {datos.length > 0 && (
              <dl className="conv-vitrina__datos">
                {datos.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
              </dl>
            )}
            <div className="conv-acciones">
              {postular && (
                <a className="btn accent" href={postular} target="_blank" rel="noopener noreferrer">Postularme <Icons.external /></a>
              )}
              {mostrarDoc && (
                <a className="btn ghost" href={verDoc} target="_blank" rel="noopener noreferrer">Ver convocatoria <Icons.external /></a>
              )}
              {fotos.length > 1 && (
                <button type="button" className="btn ghost" onClick={() => onGaleria(c, 0)}>
                  <Icons.camara size={15} /> Ver galería
                </button>
              )}
            </div>

            {n > 1 && (
              <div className="conv-vitrina__tira" role="tablist" aria-label="Elegir convocatoria">
                {lista.map((x, j) => (
                  <button key={x.id} type="button" role="tab" aria-selected={j === actual} title={x.titulo}
                          aria-label={x.titulo}
                          className={'conv-vitrina__mini' + (j === actual ? ' is-activa' : '')} onClick={() => setI(j)}>
                    <img src={x.fotos[0].url} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </article>
      </div>
    </section>
  )
}

export default function Convocatorias() {
  const { data } = useData()
  const [cat, setCat] = useState('all')
  const [sede, setSede] = useState('ambas')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)
  const [galeria, setGaleria] = useState(null)
  const verGaleria = (c, inicio) => setGaleria({ fotos: c.fotos, titulo: c.titulo, inicio })

  const conFotos = (data.convocatorias ?? []).filter(c => c.fotos?.length)
  const vitrina = [...conFotos.filter(c => !c.vencida), ...conFotos.filter(c => c.vencida)]

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

      {vitrina.length > 0 && <Vitrina lista={vitrina} onGaleria={verGaleria} />}

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
                    {c.fotos?.length > 0 && (
                      <button type="button" className="conv-card__foto" onClick={() => verGaleria(c, 0)}
                              aria-label={`Ver fotos de ${c.titulo}`}>
                        <img src={c.fotos[0].url} alt="" loading="lazy" />
                        {c.fotos.length > 1 && <span><Icons.camara size={13} /> {c.fotos.length}</span>}
                      </button>
                    )}
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

      {galeria && (
        <GaleriaFotos fotos={galeria.fotos} inicio={galeria.inicio} titulo={galeria.titulo}
                      onCerrar={() => setGaleria(null)} />
      )}
    </div>
  )
}
