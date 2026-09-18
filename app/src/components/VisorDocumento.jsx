import { useEffect } from 'react'
import Portal from './Portal'
import { Icons } from './Icons'

/* Visor de un adjunto guardado en la base, sin bajarlo al disco.
 *
 * Funciona porque /api/archivos/:id ya responde con el mime real y
 * `Content-Disposition: inline`, así que el navegador pinta el PDF en su lector
 * incorporado dentro del iframe. Nada que instalar ni ninguna librería de
 * medio megabyte para dibujar páginas a mano.
 *
 * DOC y DOCX son otra historia: NINGÚN navegador sabe representarlos. Los
 * visores de Google y de Office podrían, pero exigen que el archivo esté en
 * una URL pública de internet, y estos viven en la base detrás de la sesión
 * del panel. Mandarlos allí significaría publicar la hoja de vida de alguien
 * en un tercero para poder mirarla, que es justo lo que no se debe hacer con
 * un dato personal. Así que para esos formatos se dice con todas las letras y
 * se ofrece la descarga, en vez de abrir un marco en blanco.
 */

const PREVISUALIZABLES = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'txt']

export default function VisorDocumento({ url, descarga, nombre = 'Documento', extension = '', peso = '', onCerrar }) {
  useEffect(() => {
    const alPulsar = e => { if (e.key === 'Escape') onCerrar() }
    document.addEventListener('keydown', alPulsar)
    return () => document.removeEventListener('keydown', alPulsar)
  }, [onCerrar])

  const ext = String(extension || '').toLowerCase()
  const sePuedeVer = PREVISUALIZABLES.includes(ext)
  const esImagen = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)

  return (
    <Portal>
      <div className="visor__fondo" role="dialog" aria-modal="true" aria-label={'Vista previa de ' + nombre}
           onClick={onCerrar}>
        <div className="visor" onClick={e => e.stopPropagation()}>

          <header className="visor__barra">
            <div className="visor__id">
              <span className="visor__ext">{ext || 'doc'}</span>
              <div className="visor__texto">
                <div className="visor__nombre">{nombre}</div>
                {peso && <div className="visor__peso">{peso}</div>}
              </div>
            </div>

            <div className="visor__acciones">
              <a className="btn ghost visor__btn" href={url} target="_blank" rel="noopener noreferrer">
                Abrir aparte <Icons.external />
              </a>
              <a className="btn ghost visor__btn" href={descarga}>
                <Icons.download /> Descargar
              </a>
              <button className="icon-btn" onClick={onCerrar} aria-label="Cerrar la vista previa">
                <Icons.close />
              </button>
            </div>
          </header>

          <div className="visor__lienzo">
            {sePuedeVer ? (
              esImagen
                ? <img className="visor__imagen" src={url} alt={nombre} />
                : <iframe className="visor__marco" src={url} title={'Vista previa de ' + nombre} />
            ) : (
              <div className="visor__sinvista">
                <Icons.archivo />
                <h4>Este formato no se puede ver dentro del navegador</h4>
                <p>
                  Los archivos <strong>{ext.toUpperCase() || 'de este tipo'}</strong> no tienen
                  visor nativo. No los mandamos a un visor externo a propósito: sería publicar la
                  hoja de vida de una persona en un servicio de terceros solo para poder leerla.
                </p>
                <a className="btn accent" href={descarga}>
                  <Icons.download /> Descargar para abrirla
                </a>
                <p className="visor__truco">
                  Si quieres verlas sin descargar, pide las hojas de vida en PDF: ese sí se abre aquí.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  )
}
