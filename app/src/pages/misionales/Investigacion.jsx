/* Investigación: grupos, líneas, semilleros y producción destacada.
 *
 * Todo sale de la base (migración 019) por DataContext. Antes esta página
 * tenía su propia copia escrita a mano —con catorce semilleros cuando el panel
 * publicaba cinco— y lo que se editaba en la pestaña «Funciones misionales»
 * solo llegaba a la portada, nunca aquí.
 *
 * Las cifras del titular se cuentan: un número escrito en el texto se queda
 * viejo en cuanto alguien añade o quita un semillero.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { Icons } from '../../components/Icons'
import TramaMarca from '../../components/TramaMarca'

const PALABRAS = ['cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho',
  'diecinueve', 'veinte']

/* 3 -> 'Tres grupos'; 1 -> 'Un grupo' / 'Una forma'. Más de veinte va en cifras. */
function cuenta(n, singular, plural, { mayuscula = false, femenino = false } = {}) {
  const palabra = n === 1 && femenino ? 'una' : (PALABRAS[n] ?? String(n))
  const texto = `${palabra} ${n === 1 ? singular : plural}`
  return mayuscula ? texto.charAt(0).toUpperCase() + texto.slice(1) : texto
}

const ETIQUETA_SEDE = { riohacha: 'Riohacha', maicao: 'Maicao', ambas: 'Riohacha y Maicao' }

/* Líneas de investigación del programa (migración 028). Cada una es una
   tarjeta plegable: cerrada dice cuántos ejes tiene; abierta, el objetivo y
   los ejes. Abiertas todas a la vez serían un muro de texto de diez párrafos
   y más de cien ejes. */
function LineasInvestigacion({ lineas }) {
  const [abiertas, setAbiertas] = useState(() => new Set())
  const alternar = id => setAbiertas(prev => {
    const s = new Set(prev)
    if (s.has(id)) s.delete(id); else s.add(id)
    return s
  })

  return (
    <section className="section section--tinte">
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Líneas de investigación</div>
            <h2>{cuenta(lineas.length, 'línea', 'líneas', { mayuscula: true, femenino: true })} que orientan la investigación del programa.</h2>
          </div>
          <p className="desc">Cada línea define un objetivo y los ejes temáticos en los que se inscriben los proyectos, semilleros y trabajos de grado. Ábrelas para ver el detalle.</p>
        </div>

        <div className="lineas-inv">
          {lineas.map((l, i) => {
            const abierta = abiertas.has(l.id)
            const ejes = l.ejes ?? []
            return (
              <article key={l.id} className={'linea-inv' + (abierta ? ' is-abierta' : '')}>
                <button type="button" className="linea-inv__cab" aria-expanded={abierta}
                        aria-controls={'linea-' + l.id} onClick={() => alternar(l.id)}>
                  <span className="linea-inv__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="linea-inv__textos">
                    <span className="linea-inv__nombre">{l.nombre}</span>
                    {ejes.length > 0 && (
                      <span className="linea-inv__cuenta">{ejes.length} {ejes.length === 1 ? 'eje temático' : 'ejes temáticos'}</span>
                    )}
                  </span>
                  <span className="linea-inv__signo" aria-hidden="true">{abierta ? '–' : '+'}</span>
                </button>
                {abierta && (
                  <div id={'linea-' + l.id} className="linea-inv__cuerpo">
                    {l.objetivo && (
                      <>
                        <div className="linea-inv__rotulo">Objetivo</div>
                        <p className="linea-inv__objetivo">{l.objetivo}</p>
                      </>
                    )}
                    {ejes.length > 0 && (
                      <>
                        <div className="linea-inv__rotulo">Ejes temáticos</div>
                        <ul className="linea-inv__ejes">
                          {ejes.map(e => <li key={e}>{e}</li>)}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default function Investigacion() {
  const { data } = useData()
  const grupos = data.grupos ?? []
  const semilleros = data.semilleros ?? []
  const produccion = data.produccion ?? []
  const lineas = data.lineas_investigacion ?? []

  const titular = grupos.length || semilleros.length
    ? `${cuenta(grupos.length, 'grupo', 'grupos', { mayuscula: true })}, ${cuenta(semilleros.length, 'semillero', 'semilleros')}, una región que se investiga a sí misma.`
    : 'Una región que se investiga a sí misma.'

  const anios = produccion.map(p => p.anio).filter(Boolean)
  const periodo = anios.length
    ? (Math.min(...anios) === Math.max(...anios) ? String(anios[0]) : `${Math.min(...anios)}–${Math.max(...anios)}`)
    : ''

  return (
    <div className="page-in">
      {/* Misma cabecera que Infraestructura y Saber Pro: el tejido del emblema
          de la universidad en filigrana sobre el teal institucional. */}
      <header className="sp-cabecera">
        <TramaMarca blanco escala={118} opacidad={0.12} />
        <div className="inner">
          <div className="eyebrow sp-cabecera__eyebrow">Investigación e innovación</div>
          <h1 className="sp-cabecera__titulo">{titular}</h1>
          {(grupos.length > 0 || produccion.length > 0) && (
            <div className="sp-cifras">
              <div><b>{grupos.length}</b><span>{grupos.length === 1 ? 'grupo' : 'grupos'} de investigación</span></div>
              <div><b>{semilleros.length}</b><span>{semilleros.length === 1 ? 'semillero' : 'semilleros'}</span></div>
              {produccion.length > 0 && <div><b>{produccion.length}</b><span>productos destacados</span></div>}
            </div>
          )}
        </div>
      </header>

      <section className="section">
        <div className="inner">
          {grupos.length === 0 ? (
            <p style={{ color: 'var(--ink-3)' }}>Los grupos de investigación del programa se publicarán pronto.</p>
          ) : (
            <div className="grid-3">
              {grupos.map(g => (
                <div key={g.id} className="card" style={{ background: 'var(--paper-2)', padding: 0, overflow: 'hidden' }}>
                  <div style={{ height: 120, background: g.color || 'var(--ug-azul)', padding: 20, color: g.color === 'var(--ug-marino)' ? '#fff' : 'var(--ug-negro)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase' }}>
                      {g.categoria ? `${g.categoria} · MinCiencias` : 'Sin categoría MinCiencias'}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em' }}>{g.nombre}</div>
                  </div>
                  <div style={{ padding: 24 }}>
                    {g.nombre_completo && <h3 style={{ fontSize: 18 }}>{g.nombre_completo}</h3>}
                    {g.descripcion && <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 8 }}>{g.descripcion}</p>}
                    {g.lineas?.length > 0 && (
                      <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {g.lineas.map(l => <span key={l} className="chip" style={{ fontSize: 11 }}>{l}</span>)}
                      </div>
                    )}
                    <hr className="rule" style={{ margin: '18px 0 14px' }} />
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <span>{g.lider ? `Líder · ${g.lider}` : ETIQUETA_SEDE[g.sede]}</span>
                      {g.gruplac_url && (
                        <a href={g.gruplac_url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          GrupLAC <Icons.arrow />
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

      {lineas.length > 0 && <LineasInvestigacion lineas={lineas} />}

      {semilleros.length > 0 && (
        <section className="section section--papel">
          <div className="inner">
            <div className="section-head">
              <div className="title">
                <div className="eyebrow">Semilleros activos</div>
                <h2>{cuenta(semilleros.length, 'forma', 'formas', { mayuscula: true, femenino: true })} de aprender investigando.</h2>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 12 }}>
              {semilleros.map((s, i) => (
                <div key={s.id} title={s.descripcion || undefined} style={{ padding: '16px 18px', background: 'var(--paper-2)', borderRadius: 10, border: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', color: 'var(--ink-3)', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    {s.grupo && <span>{s.grupo}</span>}
                  </div>
                  <div style={{ fontWeight: 500, marginTop: 4 }}>{s.nombre}</div>
                  {s.lider && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>{s.lider}</div>}
                  {/* Activo, pero con la propuesta aún en manos de los pares:
                      no se presenta como oficializado. */}
                  {s.en_evaluacion && <span className="chip semillero-eval">En evaluación</span>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sin producción cargada la sección no se pinta: un bloque «Lo que
          publicamos» vacío dice peor cosa que no tenerlo. */}
      {produccion.length > 0 && (
        <section className="section">
          <div className="inner">
            <div className="section-head">
              <div className="title">
                <div className="eyebrow">Producción destacada{periodo && ` ${periodo}`}</div>
                <h2>Lo que publicamos.</h2>
              </div>
            </div>
            <div className="superficie">
              {/* Cada fila abre la página de la publicación, que tiene el
                  resumen y el enlace al texto. Sin portada, la miniatura
                  muestra el año sobre el teal de la marca. */}
              {produccion.map(p => (
                <Link key={p.id} to={`/investigacion/publicacion/${p.id}`} className="pub-fila">
                  <div className="pub-fila__miniatura">
                    {p.portada_url ? <img src={p.portada_url} alt="" loading="lazy" /> : p.anio}
                  </div>
                  <div>
                    <div className="pub-fila__titulo">{p.titulo}</div>
                    {p.resumen
                      ? <div className="pub-fila__resumen">{p.resumen}</div>
                      : p.autores && <div className="pub-fila__resumen">{p.autores}</div>}
                  </div>
                  <div className="pub-fila__medio">
                    <span>{p.medio || p.tipo} · {p.anio}</span>
                    <Icons.arrow />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
