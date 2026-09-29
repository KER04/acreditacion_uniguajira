/* Página propia de una publicación de investigación.
 *
 * Se llega desde «Lo que publicamos» en /investigacion. Pide su ficha por su
 * cuenta (como Vacante): el enlace se puede compartir pelado y tiene que
 * funcionar sin haber pasado antes por la lista.
 *
 * La portada, si la hay, ocupa la cabecera con un velo oscuro encima —el mismo
 * montaje que el vídeo de la portada del sitio—. Sin portada, la cabecera es
 * el tejido teal de Investigación, así que nunca queda en blanco.
 */
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Icons } from '../../components/Icons'
import TramaMarca from '../../components/TramaMarca'
import { apiProduccion } from '../../context/DataContext'

/* El resumen se escribe como texto libre en el panel: cada línea en blanco
   separa un párrafo. */
function parrafos(texto) {
  return String(texto ?? '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
}

export default function ProduccionDetalle() {
  const { id } = useParams()
  const [pub, setPub] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let vivo = true
    setPub(null); setError('')
    apiProduccion(id)
      .then(p => { if (vivo) setPub(p) })
      .catch(e => { if (vivo) setError(e.message) })
    return () => { vivo = false }
  }, [id])

  if (error) {
    return (
      <section className="section">
        <div className="inner">
          <p style={{ color: 'var(--ink-3)' }}>{error}</p>
          <Link className="btn ghost" to="/investigacion" style={{ marginTop: 16 }}>Volver a Investigación</Link>
        </div>
      </section>
    )
  }
  if (!pub) {
    return <section className="section"><div className="inner" style={{ color: 'var(--ink-3)' }}>Cargando…</div></section>
  }

  const ficha = [
    ['Tipo', pub.tipo],
    ['Año', pub.anio],
    ['Publicado en', pub.medio],
    ['Autores', pub.autores],
    ['Grupo', pub.grupo_nombre_completo ? `${pub.grupo} · ${pub.grupo_nombre_completo}` : pub.grupo],
  ].filter(([, v]) => v)

  const cuerpo = parrafos(pub.resumen)

  return (
    <div className="page-in">
      <header className={'sp-cabecera pub-cabecera' + (pub.portada_url ? ' pub-cabecera--foto' : '')}
              style={pub.portada_url ? { '--pub-portada': `url(${pub.portada_url})` } : undefined}>
        {!pub.portada_url && <TramaMarca blanco escala={118} opacidad={0.12} />}
        <div className="inner">
          <Link to="/investigacion" className="pub-volver"><Icons.arrow /> Investigación</Link>
          <div className="eyebrow sp-cabecera__eyebrow">{pub.tipo} · {pub.anio}</div>
          <h1 className="sp-cabecera__titulo pub-cabecera__titulo">{pub.titulo}</h1>
          {pub.autores && <p className="sp-cabecera__texto">{pub.autores}</p>}
        </div>
      </header>

      <section className="section" style={{ paddingTop: 56 }}>
        <div className="inner pub-rejilla">
          <article className="superficie pub-cuerpo">
            <div className="eyebrow">Resumen</div>
            {cuerpo.length
              ? cuerpo.map((p, i) => <p key={i} className="pub-parrafo">{p}</p>)
              : <p className="pub-parrafo" style={{ color: 'var(--ink-3)' }}>Esta publicación todavía no tiene resumen.</p>}
          </article>

          <aside className="superficie pub-ficha">
            <div className="eyebrow">Ficha</div>
            <dl>
              {ficha.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
            {pub.url && (
              <a className="btn accent" href={pub.url} target="_blank" rel="noopener noreferrer"
                 style={{ width: '100%', justifyContent: 'center', marginTop: 20 }}>
                Leer la publicación <Icons.arrow />
              </a>
            )}
          </aside>
        </div>
      </section>
    </div>
  )
}
