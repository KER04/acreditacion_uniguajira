/* Visor a pantalla completa para las fotos de una convocatoria.
 *
 * Va por Portal, como FichaActo, para que el fixed se mida contra la ventana y
 * no contra la página animada. Esc o la X cierran; las flechas del teclado y
 * de la pantalla pasan de foto; en táctil se desliza. Mientras está abierto,
 * la página de atrás no se desplaza y al cerrar el foco vuelve a donde estaba.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import Portal from './Portal'
import { Icons } from './Icons'

const UMBRAL_DESLIZ = 45

export default function GaleriaFotos({ fotos, inicio = 0, titulo, onCerrar }) {
  const [i, setI] = useState(inicio)
  const cerrar = useRef(null)
  const toque = useRef(null)
  const n = fotos.length
  const ir = useCallback(d => setI(x => (x + d + n) % n), [n])

  useEffect(() => {
    const previo = document.activeElement
    cerrar.current?.focus()
    const desborde = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = desborde; previo?.focus?.() }
  }, [])

  useEffect(() => {
    const tecla = e => {
      if (e.key === 'Escape') onCerrar()
      else if (e.key === 'ArrowRight' && n > 1) ir(1)
      else if (e.key === 'ArrowLeft' && n > 1) ir(-1)
    }
    document.addEventListener('keydown', tecla)
    return () => document.removeEventListener('keydown', tecla)
  }, [ir, n, onCerrar])

  const foto = fotos[i]
  if (!foto) return null

  return (
    <Portal>
      <div className="galeria" role="dialog" aria-modal="true" aria-label={'Fotos: ' + titulo} onClick={onCerrar}>
        <div className="galeria__barra" onClick={e => e.stopPropagation()}>
          <span className="galeria__titulo">{titulo}</span>
          {n > 1 && <span className="galeria__cuenta">{i + 1} / {n}</span>}
          <button ref={cerrar} type="button" className="galeria__cerrar" onClick={onCerrar} aria-label="Cerrar">
            <Icons.close />
          </button>
        </div>

        <figure className="galeria__escena" onClick={e => e.stopPropagation()}
                onTouchStart={e => { toque.current = e.touches[0].clientX }}
                onTouchEnd={e => {
                  if (toque.current === null || n < 2) return
                  const dx = e.changedTouches[0].clientX - toque.current
                  toque.current = null
                  if (Math.abs(dx) > UMBRAL_DESLIZ) ir(dx < 0 ? 1 : -1)
                }}>
          <img key={foto.id} src={foto.url} alt={foto.pie || `${titulo}, foto ${i + 1}`} />
          {foto.pie && <figcaption>{foto.pie}</figcaption>}
        </figure>

        {n > 1 && (
          <>
            <button type="button" className="galeria__flecha is-izq" aria-label="Foto anterior"
                    onClick={e => { e.stopPropagation(); ir(-1) }}>‹</button>
            <button type="button" className="galeria__flecha is-der" aria-label="Foto siguiente"
                    onClick={e => { e.stopPropagation(); ir(1) }}>›</button>
            <div className="galeria__tira" onClick={e => e.stopPropagation()}>
              {fotos.map((f, j) => (
                <button key={f.id} type="button" className={'galeria__mini' + (j === i ? ' is-activa' : '')}
                        aria-label={`Ver foto ${j + 1}`} aria-current={j === i} onClick={() => setI(j)}>
                  <img src={f.url} alt="" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </Portal>
  )
}
