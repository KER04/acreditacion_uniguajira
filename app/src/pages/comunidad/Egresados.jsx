/* Vista Egresados — el trámite de grado.
 *
 * Distinta de Graduados a propósito. En el uso colombiano son dos momentos:
 * el *egresado* terminó el plan y está en trámite; el *graduado* ya tiene el
 * título. Esta página es para el primero y reúne las cuatro cosas que busca:
 * por dónde graduarse, qué norma lo rige, qué prácticas hay abiertas y sobre
 * qué puede investigar.
 *
 * Todo sale de la base y se edita desde el panel. Dos bloques se leen de
 * tablas que ya existían —las modalidades del módulo Estudiantes y las
 * prácticas del de Convocatorias—, así que se editan en su sitio de siempre
 * y aquí solo se muestran: un único catálogo, sin copias que se contradigan.
 */
import { useState } from 'react'
import { Icons } from '../../components/Icons'
import { useData } from '../../context/DataContext'
import { usePestana } from '../../hooks/useParametroURL'
import { fechaLarga } from '../../../shared/validacion'

/* Encabezado de sección, repetido cuatro veces con distinto texto. */
function Cabecera({ eyebrow, titulo, desc }) {
  return (
    <div className="section-head">
      <div className="title">
        <div className="eyebrow">{eyebrow}</div>
        <h2 style={{ marginTop: 10 }}>{titulo}</h2>
      </div>
      {desc && <p className="desc">{desc}</p>}
    </div>
  )
}

function Vacio({ children }) {
  return <div style={{ color: 'var(--ink-3)' }}>{children}</div>
}

/* ─── Modalidades de grado ─────────────────────────────────────── */

function Modalidades() {
  const { data } = useData()
  const modalidades = data.modalidades_grado ?? []

  return (
    <section className="section" style={{ paddingTop: 30 }}>
      <div className="inner">
        <Cabecera
          eyebrow="Modalidades de grado"
          titulo={modalidades.length > 0
            ? modalidades.length + ' caminos válidos hacia tu título.'
            : 'Modalidades de grado.'}
          desc="Escoge la que mejor se ajuste a tu perfil y al tiempo del que dispones. Todas exigen paz y salvo financiero y dominio de lengua extranjera (B1)." />

        {modalidades.length === 0 ? (
          <Vacio>Todavía no hay modalidades publicadas.</Vacio>
        ) : (
          <div className="grid-3">
            {modalidades.map(m => (
              <div key={m.id} className="card" style={{ background: 'var(--paper-2)', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 320 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: m.color || 'var(--ug-azul)' }} />
                <h3 style={{ fontSize: 20 }}>{m.nombre}</h3>
                {m.descripcion && <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>{m.descripcion}</p>}

                <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)' }}>
                  {(m.requisitos ?? []).length > 0 && (
                    <>
                      <div className="eyebrow" style={{ marginBottom: 10 }}>Requisitos</div>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {m.requisitos.map((r, j) => (
                          <li key={j} style={{ display: 'flex', alignItems: 'start', gap: 8, fontSize: 13, color: 'var(--ink-2)' }}>
                            <Icons.check /> {r}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 14 }}>
                    {m.duracion
                      ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.1em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>Duración · {m.duracion}</span>
                      : <span />}
                    {m.documento_url && (
                      <a className="btn ghost" style={{ padding: '6px 14px', fontSize: 12 }} href={m.documento_url} target="_blank" rel="noopener noreferrer">
                        Guía <Icons.download />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ─── Normativas ───────────────────────────────────────────────── */

function Normativas() {
  const { data } = useData()
  const todas = data.normativas ?? []
  const [verDerogadas, setVerDerogadas] = useState(false)

  const vigentes = todas.filter(n => n.vigente)
  const derogadas = todas.filter(n => !n.vigente)
  const lista = verDerogadas ? derogadas : vigentes

  return (
    <section className="section" style={{ paddingTop: 30 }}>
      <div className="inner">
        <Cabecera
          eyebrow="Normativa aplicable"
          titulo="Lo que dice la norma sobre tu grado."
          desc="Acuerdos, resoluciones y reglamentos que rigen el trámite. Descarga el texto completo antes de radicar cualquier solicitud." />

        {/* Las derogadas no se borran: los trámites viejos las siguen citando. */}
        {derogadas.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }} role="tablist" aria-label="Vigencia de las normas">
            <button role="tab" aria-selected={!verDerogadas}
                    className={'btn ' + (verDerogadas ? 'ghost' : 'accent')}
                    style={{ padding: '8px 18px', fontSize: 13 }}
                    onClick={() => setVerDerogadas(false)}>
              Vigentes ({vigentes.length})
            </button>
            <button role="tab" aria-selected={verDerogadas}
                    className={'btn ' + (verDerogadas ? 'accent' : 'ghost')}
                    style={{ padding: '8px 18px', fontSize: 13 }}
                    onClick={() => setVerDerogadas(true)}>
              Derogadas ({derogadas.length})
            </button>
          </div>
        )}

        {lista.length === 0 ? (
          <Vacio>{verDerogadas ? 'No hay normas derogadas registradas.' : 'Todavía no hay normativa publicada.'}</Vacio>
        ) : (
          <div className="card" style={{ background: 'var(--paper-2)' }}>
            {lista.map((n, j) => (
              <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: j < lista.length - 1 ? '1px solid color-mix(in oklab, var(--ink) 7%, transparent)' : 'none' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span className="chip" style={{ fontSize: 10 }}>{n.tipo}</span>
                    {n.numero && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>
                        {n.numero}
                      </span>
                    )}
                    {!n.vigente && (
                      <span className="chip" style={{ fontSize: 9, background: 'color-mix(in oklab, var(--ug-flamingo) 20%, transparent)' }}>derogada</span>
                    )}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 500, marginTop: 6 }}>{n.titulo}</div>
                  {n.descripcion && (
                    <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>{n.descripcion}</p>
                  )}
                  {(n.expedida_por || n.anio) && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.06em', color: 'var(--ink-3)', marginTop: 6 }}>
                      {[n.expedida_por, n.anio].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>

                {/* `descarga` apunta al PDF de la base o, si es un enlace
                    externo, a la URL tal cual. */}
                {n.descarga
                  ? <a className="icon-btn" href={n.descarga} target="_blank" rel="noopener noreferrer"
                       style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', flexShrink: 0 }}
                       aria-label={'Abrir ' + n.titulo}><Icons.download /></a>
                  : <button className="icon-btn" style={{ width: 36, height: 36, opacity: .35, flexShrink: 0 }} disabled title="Sin documento cargado"><Icons.download /></button>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ─── Convocatorias de prácticas ───────────────────────────────── */

/* Son las convocatorias de categoría "Prácticas", filtradas por el servidor.
   No hay tabla aparte: se publican desde el módulo Convocatorias del panel. */
function Practicas() {
  const { data } = useData()
  const todas = data.practicas ?? []

  /* Una convocatoria cerrada o con el plazo vencido no debe competir por la
     atención con las que todavía se pueden aprovechar. */
  const abiertas = todas.filter(p => p.estado !== 'Cerrada' && !p.vencida)
  const pasadas = todas.filter(p => p.estado === 'Cerrada' || p.vencida)

  const Tarjeta = ({ p, apagada }) => (
    <div className="card" style={{ background: 'var(--paper-2)', display: 'flex', flexDirection: 'column', gap: 12, opacity: apagada ? .62 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span className="chip" style={{ fontSize: 10 }}>{p.estado}</span>
        {p.vencida && p.estado !== 'Cerrada' && (
          <span className="chip" style={{ fontSize: 9, background: 'color-mix(in oklab, var(--ug-flamingo) 20%, transparent)' }}>plazo vencido</span>
        )}
        {p.dirigida_a && <span className="chip" style={{ fontSize: 10 }}>{p.dirigida_a}</span>}
      </div>

      <h3 style={{ fontSize: 18 }}>{p.titulo}</h3>
      {p.descripcion && <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>{p.descripcion}</p>}

      {(p.requisitos ?? []).length > 0 && (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {p.requisitos.map((r, j) => (
            <li key={j} style={{ display: 'flex', alignItems: 'start', gap: 8, fontSize: 13, color: 'var(--ink-2)' }}>
              <Icons.check /> {r}
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>
          {p.fecha_cierre ? 'Cierra ' + fechaLarga(p.fecha_cierre) : 'Sin fecha de cierre'}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          {p.documento_url && (
            <a className="btn ghost" style={{ padding: '6px 14px', fontSize: 12 }} href={p.documento_url} target="_blank" rel="noopener noreferrer">
              Términos <Icons.download />
            </a>
          )}
          {p.url_postulacion && !apagada && (
            <a className="btn accent" style={{ padding: '6px 14px', fontSize: 12 }} href={p.url_postulacion} target="_blank" rel="noopener noreferrer">
              Postularme <Icons.external />
            </a>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <section className="section" style={{ paddingTop: 30 }}>
      <div className="inner">
        <Cabecera
          eyebrow="Convocatorias de prácticas"
          titulo={abiertas.length > 0
            ? abiertas.length + (abiertas.length === 1 ? ' convocatoria abierta.' : ' convocatorias abiertas.')
            : 'Convocatorias de prácticas.'}
          desc="Práctica empresarial, pasantía y prácticas sociales. Revisa los requisitos antes de postularte: casi todas piden estar a paz y salvo académico." />

        {todas.length === 0 ? (
          <Vacio>Ahora mismo no hay convocatorias de prácticas publicadas.</Vacio>
        ) : (
          <>
            {abiertas.length === 0
              ? <Vacio>No hay convocatorias abiertas en este momento. Abajo quedan las anteriores como referencia.</Vacio>
              : <div className="grid-2">{abiertas.map(p => <Tarjeta key={p.id} p={p} />)}</div>}

            {pasadas.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <div className="eyebrow" style={{ marginBottom: 16 }}>Cerradas</div>
                <div className="grid-2">{pasadas.map(p => <Tarjeta key={p.id} p={p} apagada />)}</div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

/* ─── Ideas de investigación ───────────────────────────────────── */

const TONO_ESTADO = {
  Disponible: 'var(--ug-azul)',
  'En curso': 'var(--ug-amarillo)',
  Tomada: 'var(--ink-3)',
  Terminada: 'var(--ug-marino)',
}

function Ideas() {
  const { data } = useData()
  const todas = data.ideas_investigacion ?? []

  /* Las líneas no son un catálogo cerrado: salen de lo que hay publicado, así
     que el filtro se adapta solo cuando el panel añade una línea nueva. */
  const lineas = [...new Set(todas.map(i => i.linea).filter(Boolean))].sort()
  const [linea, setLinea] = useState('')
  const [soloLibres, setSoloLibres] = useState(true)

  const lista = todas
    .filter(i => (linea ? i.linea === linea : true))
    .filter(i => (soloLibres ? i.disponible : true))

  const libres = todas.filter(i => i.disponible).length

  return (
    <section className="section" style={{ paddingTop: 30 }}>
      <div className="inner">
        <Cabecera
          eyebrow="Ideas de investigación"
          titulo={libres > 0
            ? libres + (libres === 1 ? ' idea disponible para tomar.' : ' ideas disponibles para tomar.')
            : 'Ideas de investigación.'}
          desc="Temas que los docentes del programa proponen como punto de partida para el trabajo de grado. Escribe al tutor para conversarla antes de radicar la propuesta." />

        {todas.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}>
            <button className="chip" onClick={() => setSoloLibres(s => !s)}
                    aria-pressed={soloLibres}
                    style={{ cursor: 'pointer', background: soloLibres ? 'var(--ink)' : undefined, color: soloLibres ? 'var(--paper)' : undefined, borderColor: soloLibres ? 'var(--ink)' : undefined }}>
              Solo disponibles
            </button>
            {lineas.length > 0 && (
              <>
                <button className="chip" onClick={() => setLinea('')}
                        style={{ cursor: 'pointer', background: linea === '' ? 'var(--ink)' : undefined, color: linea === '' ? 'var(--paper)' : undefined, borderColor: linea === '' ? 'var(--ink)' : undefined }}>
                  Todas las líneas
                </button>
                {lineas.map(l => (
                  <button key={l} className="chip" onClick={() => setLinea(l)}
                          style={{ cursor: 'pointer', background: linea === l ? 'var(--ink)' : undefined, color: linea === l ? 'var(--paper)' : undefined, borderColor: linea === l ? 'var(--ink)' : undefined }}>
                    {l}
                  </button>
                ))}
              </>
            )}
          </div>
        )}

        {lista.length === 0 ? (
          <Vacio>
            {todas.length === 0
              ? 'Todavía no hay ideas publicadas.'
              : 'Ninguna idea coincide con el filtro. Prueba quitando "solo disponibles" o cambiando de línea.'}
          </Vacio>
        ) : (
          <div className="grid-2">
            {lista.map(i => (
              <div key={i.id} className="card"
                   style={{ background: 'var(--paper-2)', display: 'flex', flexDirection: 'column', gap: 12, borderLeft: '3px solid ' + (TONO_ESTADO[i.estado] ?? 'var(--ug-azul)') }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span className="chip" style={{ fontSize: 10 }}>{i.estado}</span>
                  <span className="chip" style={{ fontSize: 10 }}>{i.dificultad}</span>
                  {i.linea && <span className="chip" style={{ fontSize: 10, background: 'color-mix(in oklab, var(--ug-marino) 14%, transparent)' }}>{i.linea}</span>}
                </div>

                <h3 style={{ fontSize: 18 }}>{i.titulo}</h3>
                {i.descripcion && <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>{i.descripcion}</p>}

                {i.palabras.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {i.palabras.map((p, j) => (
                      <span key={j} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.06em', color: 'var(--ink-3)' }}>#{p}</span>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)', fontSize: 13, color: 'var(--ink-2)' }}>
                  {i.docente
                    ? <div>Propuesta por <strong>{i.docente}</strong></div>
                    : <div style={{ color: 'var(--ink-3)' }}>Tutor por asignar</div>}
                  {i.modalidad && (
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Apunta a {i.modalidad}</div>
                  )}
                  {i.contacto && (
                    <a href={i.contacto.includes('@') ? 'mailto:' + i.contacto : i.contacto}
                       style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12 }}>
                      <Icons.mail /> {i.contacto}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ─── Página ───────────────────────────────────────────────────── */

const TABS = [
  ['modalidades', 'Modalidades de grado'],
  ['normativas', 'Normativas'],
  ['practicas', 'Convocatorias de prácticas'],
  ['ideas', 'Ideas de investigación'],
]

export default function Egresados() {
  /* En la URL, como en el resto del sitio: recargar no devuelve a la primera
     pestaña y se puede enlazar directo (#/egresados?seccion=ideas). */
  const [tab, setTab] = usePestana(TABS, { clave: 'seccion' })

  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: 'clamp(60px,8vw,110px)', paddingBottom: 30 }}>
        <div className="inner">
          <div className="eyebrow">Comunidad · Egresados</div>
          <h1 style={{ marginTop: 14, maxWidth: '22ch' }}>Terminaste las materias. Esto es lo que sigue.</h1>
          <p style={{ fontSize: 18, color: 'var(--ink-2)', marginTop: 24, maxWidth: '60ch' }}>
            Las modalidades entre las que puedes escoger, la norma que rige cada una, las prácticas
            abiertas y las ideas de investigación que proponen los docentes — todo en un solo sitio,
            para que el trámite no se te alargue por no saber dónde buscar.
          </p>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 36 }}>
            {TABS.map(([k, l]) => (
              <button key={k} className="chip" onClick={() => setTab(k)}
                style={{ cursor: 'pointer', background: tab === k ? 'var(--ink)' : undefined, color: tab === k ? 'var(--paper)' : undefined, borderColor: tab === k ? 'var(--ink)' : undefined }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </section>

      {tab === 'modalidades' && <Modalidades />}
      {tab === 'normativas' && <Normativas />}
      {tab === 'practicas' && <Practicas />}
      {tab === 'ideas' && <Ideas />}
    </div>
  )
}
