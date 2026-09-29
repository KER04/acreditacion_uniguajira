/* Extensión: convenios, proyectos con la comunidad y educación continua.
 *
 * Todo sale de la base (migración 022). Antes la página tenía su propia copia
 * escrita a mano —con cifras fijas como «18 convenios vigentes» y un botón
 * «Inscribirme» que no hacía nada— y el panel no podía tocarla.
 *
 * Las cifras se cuentan, y cada sección se oculta si no tiene nada: un bloque
 * vacío dice peor cosa que no tenerlo.
 */
import { useData } from '../../context/DataContext'
import { Icons } from '../../components/Icons'
import TramaMarca from '../../components/TramaMarca'
import { WayuuBackdrop } from '../../components/WayuuPatterns'
import { fechaLarga } from '../../../shared/validacion'

const ETIQUETA_SEDE = { riohacha: 'Riohacha', maicao: 'Maicao', ambas: 'Riohacha y Maicao' }

const COLOR_ESTADO = {
  'En ejecución': 'var(--ug-azul)',
  'Formulación': 'var(--ug-amarillo)',
  'Finalizado': 'var(--ink-3)',
}

/* '2026-03-01' -> 'mar 2026': en proyectos y cursos el día sobra. */
const mesAnio = iso => (iso ? fechaLarga(iso).replace(/^\d+\s/, '') : '')

function rango(inicio, fin) {
  if (inicio && fin) return `${mesAnio(inicio)} – ${mesAnio(fin)}`
  if (inicio) return `Desde ${mesAnio(inicio)}`
  return fin ? `Hasta ${mesAnio(fin)}` : ''
}

export default function Extension() {
  const { data } = useData()
  const convenios = (data.convenios ?? []).filter(c => c.vigente)
  const proyectos = data.proyectos_extension ?? []
  const cursos = (data.cursos_extension ?? []).filter(c => c.activo && !c.terminado)

  const activos = proyectos.filter(p => p.estado === 'En ejecución').length
  const municipios = new Set(proyectos.map(p => p.municipio?.trim()).filter(Boolean)).size
  const cifras = [
    [convenios.length, convenios.length === 1 ? 'convenio vigente' : 'convenios vigentes'],
    [activos, activos === 1 ? 'proyecto en ejecución' : 'proyectos en ejecución'],
    [municipios, municipios === 1 ? 'municipio' : 'municipios'],
    [cursos.length, cursos.length === 1 ? 'curso abierto' : 'cursos abiertos'],
  ].filter(([n]) => n > 0)

  return (
    <div className="page-in">
      <header className="sp-cabecera">
        <TramaMarca blanco escala={118} opacidad={0.12} />
        <div className="inner">
          <div className="eyebrow sp-cabecera__eyebrow">Funciones misionales · Extensión</div>
          <h1 className="sp-cabecera__titulo">Ingeniería que sale del aula y aterriza en el territorio.</h1>
          {cifras.length > 0 && (
            <div className="sp-cifras">
              {cifras.map(([n, l]) => <div key={l}><b>{n}</b><span>{l}</span></div>)}
            </div>
          )}
        </div>
      </header>

      {proyectos.length > 0 && (
        <section className="section">
          <div className="inner">
            <div className="section-head">
              <div className="title">
                <div className="eyebrow">Proyección social</div>
                <h2>Proyectos con la comunidad.</h2>
              </div>
            </div>
            <div className="grid-3">
              {proyectos.map(p => (
                <article key={p.id} className="card" style={{ background: 'var(--paper-2)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className="chip" style={{ fontSize: 10, borderColor: COLOR_ESTADO[p.estado], color: COLOR_ESTADO[p.estado] }}>● {p.estado}</span>
                    {p.municipio && <span className="chip" style={{ fontSize: 10 }}>{p.municipio}</span>}
                  </div>
                  <h3 style={{ fontSize: 19 }}>{p.titulo}</h3>
                  {p.descripcion && <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>{p.descripcion}</p>}
                  <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)', fontSize: 12, color: 'var(--ink-3)', display: 'grid', gap: 4 }}>
                    {p.comunidad && <span>Con · {p.comunidad}</span>}
                    {p.integrantes?.length > 0 && <span>Equipo · {p.integrantes.join(', ')}</span>}
                    {rango(p.fecha_inicio, p.fecha_fin) && <span>{rango(p.fecha_inicio, p.fecha_fin)}</span>}
                    {p.fuente_url && (
                      <a href={p.fuente_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ug-marino)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        Ver fuente <Icons.arrow />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {convenios.length > 0 && (
        <section className="section section--papel">
          <div className="inner">
            <div className="section-head">
              <div className="title">
                <div className="eyebrow">Convenios vigentes</div>
                <h2>Empresas, gobiernos y organizaciones aliadas.</h2>
              </div>
            </div>
            <div className="grid-3">
              {convenios.map(c => (
                <div key={c.id} className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--paper-2)' }}>
                  <div style={{ height: 100, background: c.color || 'var(--ug-azul)', padding: 20, color: 'var(--ug-negro)', display: 'flex', alignItems: 'end', position: 'relative', overflow: 'hidden' }}>
                    <WayuuBackdrop variant="a" />
                    <div style={{ position: 'relative', fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>{c.organizacion}</div>
                  </div>
                  <div style={{ padding: 22 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                      <span className="chip" style={{ fontSize: 10 }}>{c.sector}</span>
                      {c.anio_inicio && <span className="chip" style={{ fontSize: 10 }}>Desde {c.anio_inicio}</span>}
                    </div>
                    {c.tipo && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 6 }}>{c.tipo}</div>}
                    {c.descripcion && <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>{c.descripcion}</p>}
                    {c.url && (
                      <a href={c.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 13, color: 'var(--ug-marino)' }}>
                        Ver convenio <Icons.arrow />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {cursos.length > 0 && (
        <section className="section">
          <div className="inner">
            <div className="section-head">
              <div className="title">
                <div className="eyebrow">Educación continua</div>
                <h2>Diplomados y cursos abiertos.</h2>
              </div>
            </div>
            <div className="superficie">
              {cursos.map((c, i) => (
                <div key={c.id} className="ext-curso" style={{ borderTop: i > 0 ? '1px solid color-mix(in oklab, var(--ink) 7%, transparent)' : 'none' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 16 }}>{c.titulo}</div>
                    {c.descripcion && <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>{c.descripcion}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className="chip" style={{ fontSize: 11 }}>{c.tipo}</span>
                    {c.horas && <span className="chip" style={{ fontSize: 11 }}>{c.horas} horas</span>}
                    <span className="chip" style={{ fontSize: 11 }}>{c.modalidad}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>{rango(c.fecha_inicio, c.fecha_fin)}</div>
                  {c.url_inscripcion
                    ? <a className="btn ghost" href={c.url_inscripcion} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 14px', fontSize: 13 }}>Inscribirme <Icons.arrow /></a>
                    : <span />}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {proyectos.length === 0 && convenios.length === 0 && cursos.length === 0 && (
        <section className="section">
          <div className="inner" style={{ color: 'var(--ink-3)' }}>
            Los proyectos, convenios y cursos de extensión del programa se publicarán pronto.
          </div>
        </section>
      )}
    </div>
  )
}
