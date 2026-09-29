/* Ficha flotante de un acto administrativo (/resoluciones).
 *
 * Se abre al pulsar una tarjeta: cuenta de qué trata el acto sin obligar a
 * abrir el PDF, que a menudo son diez páginas de considerandos antes de llegar
 * al «resuelve». Si hay documento, se puede ver ahí mismo (VisorDocumento, el
 * lector del navegador en un iframe) o descargar.
 *
 * Va por Portal para que el fixed se mida contra la ventana y no contra la
 * página animada. Se cierra con Esc, con la X o pulsando fuera; al abrir se
 * enfoca la X y al cerrar el foco vuelve a la tarjeta, para quien navega con
 * teclado. Mientras está abierta, la página de atrás no se desplaza.
 */
import { useEffect, useRef, useState } from 'react'
import Portal from './Portal'
import VisorDocumento from './VisorDocumento'
import { Icons } from './Icons'
import { fechaLarga, pesoLegible } from '../../shared/validacion'

const ETIQUETA_CATEGORIA = {
  registro: 'Registro calificado',
  acreditacion: 'Acreditación en alta calidad',
  otro: 'Acto administrativo',
}

export default function FichaActo({ acto, color, onCerrar }) {
  const cerrar = useRef(null)
  const [viendo, setViendo] = useState(false)

  useEffect(() => {
    const previo = document.activeElement
    cerrar.current?.focus()
    const desborde = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = desborde
      previo?.focus?.()
    }
  }, [])

  useEffect(() => {
    // Con el visor abierto, Esc lo cierra a él primero, no a la ficha.
    if (viendo) return
    const alPulsar = e => { if (e.key === 'Escape') onCerrar() }
    document.addEventListener('keydown', alPulsar)
    return () => document.removeEventListener('keydown', alPulsar)
  }, [onCerrar, viendo])

  /* El resumen se escribe como texto libre: una línea en blanco separa párrafos. */
  const parrafos = String(acto.descripcion ?? '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
  const esArchivo = Boolean(acto.archivo_id)
  const titulo = `${acto.tipo} N.º ${acto.numero}`.trim()

  const datos = [
    ['Fecha', acto.fecha && fechaLarga(acto.fecha)],
    ['Expedido por', acto.expedido_por],
    ['Vigencia', [acto.vigencia, acto.fecha_fin && `hasta ${fechaLarga(acto.fecha_fin)}`].filter(Boolean).join(', ')],
    ['Estado', acto.fecha_fin ? (acto.vencido ? 'Vencido' : 'Vigente') : ''],
  ].filter(([, v]) => v)

  return (
    <Portal>
      <div className="ficha-acto__fondo" onClick={onCerrar}>
        <div className="ficha-acto" role="dialog" aria-modal="true" aria-labelledby="ficha-acto-titulo"
             onClick={e => e.stopPropagation()}>
          <header className="ficha-acto__banda" style={{ background: color }}>
            <div className="ficha-acto__eyebrow">{ETIQUETA_CATEGORIA[acto.categoria] ?? 'Acto administrativo'}</div>
            <h2 id="ficha-acto-titulo" className="ficha-acto__numero">{titulo}</h2>
            <p className="ficha-acto__asunto">{acto.asunto}</p>
            <button ref={cerrar} type="button" className="ficha-acto__cerrar" onClick={onCerrar} aria-label="Cerrar">
              <Icons.close />
            </button>
          </header>

          <div className="ficha-acto__cuerpo">
            {datos.length > 0 && (
              <dl className="ficha-acto__datos">
                {datos.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd className={k === 'Estado' ? (acto.vencido ? 'es-vencido' : 'es-vigente') : undefined}>{v}</dd>
                  </div>
                ))}
              </dl>
            )}

            <section>
              <h3 className="ficha-acto__subtitulo">De qué trata</h3>
              {parrafos.length
                ? parrafos.map((p, i) => <p key={i} className="ficha-acto__parrafo">{p}</p>)
                : <p className="ficha-acto__parrafo" style={{ color: 'var(--ink-3)' }}>Este acto todavía no tiene resumen.</p>}
            </section>

            <footer className="ficha-acto__pie">
              {acto.enlace ? (
                <>
                  <span className="ficha-acto__doc">
                    <Icons.archivo />
                    {esArchivo
                      ? `${String(acto.archivo_ext || 'pdf').toUpperCase()}${acto.archivo_bytes ? ' · ' + pesoLegible(acto.archivo_bytes) : ''}`
                      : 'Documento externo'}
                  </span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {esArchivo ? (
                      <>
                        <button type="button" className="btn accent" onClick={() => setViendo(true)}>Ver documento</button>
                        <a className="btn ghost" href={acto.descarga}><Icons.download /> Descargar</a>
                      </>
                    ) : (
                      <a className="btn accent" href={acto.enlace} target="_blank" rel="noopener noreferrer">
                        Abrir documento <Icons.external />
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <span className="ficha-acto__doc" style={{ color: 'var(--ink-3)' }}>El documento todavía no está publicado.</span>
              )}
            </footer>
          </div>
        </div>
      </div>

      {viendo && (
        <VisorDocumento url={acto.enlace} descarga={acto.descarga} nombre={titulo}
                        extension={acto.archivo_ext || 'pdf'}
                        peso={acto.archivo_bytes ? pesoLegible(acto.archivo_bytes) : ''}
                        onCerrar={() => setViendo(false)} />
      )}
    </Portal>
  )
}
