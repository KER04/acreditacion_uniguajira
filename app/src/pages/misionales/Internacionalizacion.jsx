/* Internacionalización: convocatorias de movilidad, convenios, redes y ORI.
 *
 * Todo sale de la base (migración 024), cargado desde lo que publica la
 * universidad. Antes la página traía seis «alianzas» y cuatro becas escritas a
 * mano que no salían de ningún documento, con cifras fijas y un botón
 * «Postular» que no hacía nada.
 *
 * Las cifras se cuentan; abierta/cerrada se decide por la fecha de cierre.
 */
import { useData } from '../../context/DataContext'
import { Icons } from '../../components/Icons'
import TramaMarca from '../../components/TramaMarca'
import CarruselPaises from '../../components/CarruselPaises'
import { agruparPorPais } from '../../data/paises'
import { fechaLarga } from '../../../shared/validacion'

function Convocatoria({ c }) {
  const estado = c.abierta ? 'Abierta' : c.proxima ? 'Próxima' : 'Cerrada'
  const color = c.abierta ? 'var(--ug-marino)' : c.proxima ? 'var(--doc-ambar-texto, #9a6a14)' : 'var(--ink-3)'
  return (
    <article className="card int-conv" style={{ background: 'var(--paper-2)', opacity: c.abierta || c.proxima ? 1 : 0.82 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span className="chip" style={{ fontSize: 10, color, borderColor: color }}>● {estado}</span>
        <span className="chip" style={{ fontSize: 10 }}>{c.dirigido}</span>
        {c.destino && <span className="chip" style={{ fontSize: 10 }}>{c.destino}</span>}
      </div>
      <h3 style={{ fontSize: 20, marginTop: 14 }}>{c.titulo}</h3>
      {c.descripcion && <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 10 }}>{c.descripcion}</p>}
      {c.beneficios && (
        <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 10 }}><b>Incluye:</b> {c.beneficios}</p>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 18, paddingTop: 14, borderTop: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>
          {c.fecha_cierre ? `${c.abierta || c.proxima ? 'Cierra' : 'Cerró'} el ${fechaLarga(c.fecha_cierre)}` : 'Sin fecha de cierre'}
        </span>
        {c.url && (
          <a className={'btn ' + (c.abierta ? 'accent' : 'ghost')} href={c.url} target="_blank" rel="noopener noreferrer" style={{ padding: '7px 16px', fontSize: 13 }}>
            {c.abierta ? 'Ver convocatoria y postular' : 'Ver convocatoria'} <Icons.arrow />
          </a>
        )}
      </div>
    </article>
  )
}

export default function Internacionalizacion() {
  const { data } = useData()

  const convenios = (data.convenios_int ?? []).filter(c => c.vigente)
  const convocatorias = data.convocatorias_mov ?? []
  const redes = data.redes ?? []
  const ori = data.ori

  const abiertas = convocatorias.filter(c => c.abierta || c.proxima)
  // Sin ninguna abierta, se muestran las tres últimas cerradas: dicen qué tipo
  // de oportunidades salen y cuándo, que es lo que alguien viene a buscar.
  const aMostrar = abiertas.length ? abiertas : convocatorias.slice(0, 3)

  const porPais = agruparPorPais(convenios)

  const paises = new Set(convenios.map(c => c.pais)).size
  const destinos = convenios.filter(c => c.intercambio).length
  const cifras = [
    [convenios.length, 'convenios internacionales vigentes'],
    [paises, paises === 1 ? 'país' : 'países'],
    [destinos, 'destinos de intercambio'],
    [abiertas.length, abiertas.length === 1 ? 'convocatoria abierta' : 'convocatorias abiertas'],
  ].filter(([n]) => n > 0)

  return (
    <div className="page-in">
      <header className="sp-cabecera">
        <TramaMarca blanco escala={118} opacidad={0.12} />
        <div className="inner">
          <div className="eyebrow sp-cabecera__eyebrow">Funciones misionales · Internacionalización</div>
          <h1 className="sp-cabecera__titulo">La ingeniería de La Guajira conectada con el mundo.</h1>
          {cifras.length > 0 && (
            <div className="sp-cifras">
              {cifras.map(([n, l]) => <div key={l}><b>{n}</b><span>{l}</span></div>)}
            </div>
          )}
        </div>
      </header>

      {aMostrar.length > 0 && (
        <section className="section">
          <div className="inner">
            <div className="section-head">
              <div className="title">
                <div className="eyebrow">{abiertas.length ? 'Convocatorias abiertas' : 'Convocatorias recientes'}</div>
                <h2>{abiertas.length ? 'Oportunidades de movilidad.' : 'Ahora mismo no hay convocatorias abiertas.'}</h2>
              </div>
              {!abiertas.length && (
                <p className="desc">Estas son las últimas que publicó la ORI. Las nuevas se anuncian en su página y aparecen aquí al publicarse.</p>
              )}
            </div>
            <div className="grid-2">
              {aMostrar.map(c => <Convocatoria key={c.id} c={c} />)}
            </div>
          </div>
        </section>
      )}

      {porPais.length > 0 && (
        <section className="section section--papel">
          <div className="inner">
            <div className="section-head">
              <div className="title">
                <div className="eyebrow">Convenios de la Facultad de Ingeniería</div>
                <h2>{convenios.length} instituciones en {paises} países.</h2>
              </div>
              <p className="desc">
                Convenios internacionales vigentes que cubren a la Facultad de Ingeniería. Elige un país para
                ver sus instituciones, qué cubre cada convenio y cuáles son destino de intercambio.
              </p>
            </div>
            <CarruselPaises paises={porPais} />
            {convenios[0]?.url && (
              <a href={convenios[0].url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 20, fontSize: 13, color: 'var(--ug-marino)' }}>
                Fuente: relación de convenios internacionales de la facultad <Icons.arrow />
              </a>
            )}
          </div>
        </section>
      )}

      {redes.length > 0 && (
        <section className="section">
          <div className="inner">
            <div className="section-head">
              <div className="title">
                <div className="eyebrow">Redes académicas</div>
                <h2>Redes en las que participa el programa.</h2>
              </div>
            </div>
            <div className="int-redes">
              {redes.map(r => {
                const Caja = r.url ? 'a' : 'div'
                return (
                  <Caja key={r.id} className="card int-red" style={{ background: 'var(--paper-2)' }}
                        {...(r.url ? { href: r.url, target: '_blank', rel: 'noopener noreferrer' } : {})}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <b style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{r.sigla}</b>
                      <span className="chip" style={{ fontSize: 9.5 }}>{r.alcance}</span>
                    </div>
                    {r.nombre && <div style={{ fontSize: 13, fontWeight: 500, marginTop: 6 }}>{r.nombre}</div>}
                    {r.descripcion && <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 8 }}>{r.descripcion}</p>}
                  </Caja>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {ori && (
        <section className="section section--tinte">
          <div className="inner">
            <div className="section-head">
              <div className="title">
                <div className="eyebrow">Oficina de Relaciones Internacionales</div>
                <h2>Cómo hacer un intercambio.</h2>
              </div>
            </div>
            <div className="int-ori">
              <div className="card" style={{ background: 'var(--ug-marino)', color: '#fff', border: 'none' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, marginBottom: 18 }}>ORI · Uniguajira</div>
                <div style={{ display: 'grid', gap: 12, fontSize: 14.5 }}>
                  {ori.ubicacion && <div><Tenue>Dónde</Tenue>{ori.ubicacion}</div>}
                  {ori.telefono && <div><Tenue>Teléfono</Tenue>{ori.telefono}</div>}
                  {ori.correos?.length > 0 && (
                    <div><Tenue>Correo</Tenue>{ori.correos.map(c => <div key={c}>{c}</div>)}</div>
                  )}
                </div>
                {ori.url && (
                  <a className="btn" href={ori.url} target="_blank" rel="noopener noreferrer"
                     style={{ marginTop: 22, background: '#fff', color: 'var(--ug-marino)' }}>
                    Página de la ORI <Icons.arrow />
                  </a>
                )}
              </div>
              {ori.requisitos?.length > 0 && (
                <div className="card" style={{ background: 'var(--paper-2)' }}>
                  <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 14 }}>Requisitos</div>
                  <ul className="int-lista">
                    {ori.requisitos.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
              {ori.pasos?.length > 0 && (
                <div className="card" style={{ background: 'var(--paper-2)' }}>
                  <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 14 }}>Paso a paso</div>
                  <ol className="int-lista int-lista--pasos">
                    {ori.pasos.map((p, i) => <li key={i}>{p}</li>)}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function Tenue({ children }) {
  return (
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.7)', marginBottom: 2 }}>
      {children}
    </div>
  )
}
