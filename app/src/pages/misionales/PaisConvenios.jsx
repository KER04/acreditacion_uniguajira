/* Página de un país con convenio internacional: /internacionalizacion/pais/:slug
 *
 * Se llega desde el carrusel o las mini tarjetas de /internacionalizacion.
 * Muestra cada institución del país con lo que cubre el convenio (tipo, tema
 * y objeto), cuáles son destino de intercambio, las convocatorias cuyo
 * destino menciona el país y el paso a paso de la ORI para postular.
 *
 * Los datos ya vienen en /api/all; no hace falta pedirlos aparte. Si el país
 * no existe (enlace viejo o mal escrito), se dice y se ofrecen los demás.
 */
import { Link, useParams } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { Icons } from '../../components/Icons'
import TramaMarca from '../../components/TramaMarca'
import { agruparPorPais, normalizarTexto } from '../../data/paises'
import { fechaLarga } from '../../../shared/validacion'

function Convenio({ c }) {
  return (
    <article className="superficie paisc-convenio">
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span className="chip" style={{ fontSize: 10 }}>Convenio {c.tipo.toLowerCase()}</span>
        {c.intercambio && <span className="chip paisc-chip-intercambio" style={{ fontSize: 10 }}>● Destino de intercambio</span>}
      </div>
      <h3 style={{ fontSize: 19, marginTop: 12 }}>{c.institucion}</h3>
      {c.tema && <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>{c.tema}</div>}
      {c.objeto && <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 12 }}>{c.objeto}</p>}
      {c.fecha_fin && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)', marginTop: 12 }}>Vigente hasta {fechaLarga(c.fecha_fin)}</div>}
    </article>
  )
}

export default function PaisConvenios() {
  const { slug } = useParams()
  const { data } = useData()
  const grupos = agruparPorPais((data.convenios_int ?? []).filter(c => c.vigente))
  const grupo = grupos.find(g => g.slug === slug)
  const otros = grupos.filter(g => g.slug !== slug)

  if (!grupo) {
    return (
      <section className="section">
        <div className="inner">
          {/* Mientras llega /api/all la lista está vacía: no es «no existe» todavía. */}
          <p style={{ color: 'var(--ink-3)' }}>{grupos.length ? 'No hay convenios vigentes con ese país.' : 'Cargando…'}</p>
          <Link className="btn ghost" to="/internacionalizacion" style={{ marginTop: 16 }}>Volver a Internacionalización</Link>
        </div>
      </section>
    )
  }

  const { pais, convenios, foto } = grupo
  const intercambio = convenios.filter(c => c.intercambio)
  const resto = convenios.filter(c => !c.intercambio)
  const convocatorias = (data.convocatorias_mov ?? []).filter(c => normalizarTexto(c.destino).includes(normalizarTexto(pais)))
  const ori = data.ori

  return (
    <div className="page-in">
      <header className={'sp-cabecera pub-cabecera' + (foto ? ' pub-cabecera--foto' : '')}
              style={foto ? { '--pub-portada': `url(${foto.foto})` } : undefined}>
        {!foto && <TramaMarca blanco escala={118} opacidad={0.12} />}
        <div className="inner">
          <Link to="/internacionalizacion" className="pub-volver"><Icons.arrow /> Internacionalización</Link>
          <div className="eyebrow sp-cabecera__eyebrow">Convenios internacionales · {foto?.lugar ?? pais}</div>
          <h1 className="sp-cabecera__titulo pub-cabecera__titulo">{pais}</h1>
          <div className="sp-cifras">
            <div><b>{convenios.length}</b><span>{convenios.length === 1 ? 'institución' : 'instituciones'} con convenio</span></div>
            {intercambio.length > 0 && <div><b>{intercambio.length}</b><span>{intercambio.length === 1 ? 'destino' : 'destinos'} de intercambio</span></div>}
          </div>
        </div>
        {foto && (
          <a className="paisc-credito" href={foto.fuente} target="_blank" rel="noopener noreferrer">
            Foto: {foto.autor} · {foto.licencia} · Wikimedia Commons
          </a>
        )}
      </header>

      {intercambio.length > 0 && (
        <section className="section">
          <div className="inner">
            <div className="section-head">
              <div className="title">
                <div className="eyebrow">Puedes estudiar un semestre aquí</div>
                <h2>Destinos de intercambio en {pais}.</h2>
              </div>
              <p className="desc">La ORI ofrece estas instituciones como destino de intercambio estudiantil. Los requisitos y el paso a paso están al final de la página.</p>
            </div>
            <div className="grid-2">{intercambio.map(c => <Convenio key={c.id} c={c} />)}</div>
          </div>
        </section>
      )}

      {resto.length > 0 && (
        <section className={'section' + (intercambio.length ? ' section--papel' : '')}>
          <div className="inner">
            <div className="section-head">
              <div className="title">
                <div className="eyebrow">Cooperación académica</div>
                <h2>{intercambio.length ? 'Otros convenios' : `Convenios con ${pais}`}.</h2>
              </div>
              <p className="desc">Convenios de cooperación en docencia, investigación o prácticas que no figuran como destino de intercambio estudiantil.</p>
            </div>
            <div className="grid-2">{resto.map(c => <Convenio key={c.id} c={c} />)}</div>
          </div>
        </section>
      )}

      {convocatorias.length > 0 && (
        <section className="section">
          <div className="inner">
            <div className="section-head">
              <div className="title">
                <div className="eyebrow">Convocatorias</div>
                <h2>Movilidad hacia {pais}.</h2>
              </div>
            </div>
            <div className="superficie">
              {convocatorias.map((c, n) => (
                <div key={c.id} className="paisc-conv" style={{ borderTop: n ? '1px solid color-mix(in oklab, var(--ink) 8%, transparent)' : 'none' }}>
                  <div><b>{c.titulo}</b><div style={{ fontSize: 13, color: 'var(--ink-3)' }}>{c.dirigido} · {c.abierta ? 'Abierta' : c.proxima ? 'Próxima' : 'Cerrada'}{c.fecha_cierre ? ` · cierre ${fechaLarga(c.fecha_cierre)}` : ''}</div></div>
                  {c.url && <a className="btn ghost" href={c.url} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 14px', fontSize: 13 }}>Ver <Icons.arrow /></a>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {intercambio.length > 0 && ori?.pasos?.length > 0 && (
        <section className="section section--tinte">
          <div className="inner">
            <div className="section-head">
              <div className="title">
                <div className="eyebrow">Oficina de Relaciones Internacionales</div>
                <h2>Cómo postularte.</h2>
              </div>
            </div>
            <div className="grid-2" style={{ alignItems: 'start' }}>
              <div className="card" style={{ background: 'var(--paper-2)' }}>
                <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 14 }}>Requisitos</div>
                <ul className="int-lista">{(ori.requisitos ?? []).map((r, n) => <li key={n}>{r}</li>)}</ul>
              </div>
              <div className="card" style={{ background: 'var(--paper-2)' }}>
                <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 14 }}>Paso a paso</div>
                <ol className="int-lista int-lista--pasos">{ori.pasos.map((p, n) => <li key={n}>{p}</li>)}</ol>
                {ori.correos?.[0] && <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 16 }}>Dudas: {ori.correos[0]}{ori.telefono ? ` · ${ori.telefono}` : ''}</p>}
              </div>
            </div>
          </div>
        </section>
      )}

      {otros.length > 0 && (
        <section className="section">
          <div className="inner">
            <div className="eyebrow" style={{ marginBottom: 16 }}>Otros países con convenio</div>
            <nav className="carpais__minis" aria-label="Otros países">
              {otros.map(p => (
                <Link key={p.pais} to={`/internacionalizacion/pais/${p.slug}`} className="carpais__mini">
                  <span className="carpais__mini-foto" style={p.foto ? { backgroundImage: `url(${p.foto.foto})` } : undefined} />
                  <span className="carpais__mini-texto">
                    <b>{p.pais}</b>
                    <span>{p.convenios.length} {p.convenios.length === 1 ? 'convenio' : 'convenios'}</span>
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </section>
      )}
    </div>
  )
}
