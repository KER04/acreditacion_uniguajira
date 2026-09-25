/* Bloque plegable del panel.
 *
 * Cada sección del panel apila lo mismo: un formulario para crear o editar y,
 * debajo, la lista de lo que ya existe. El formulario ocupa media pantalla y
 * casi siempre está vacío —solo se usa al dar de alta algo—, así que empuja
 * hacia abajo justo lo que se viene a consultar.
 *
 * Plegado por defecto, la sección abre mostrando su contenido y el formulario
 * queda a un clic. El estado se recuerda por bloque: quien pasa la tarde
 * cargando docentes lo deja abierto y sigue abierto al volver.
 *
 * Se apoya en <details>, que ya trae el comportamiento y el teclado del
 * navegador; un div con onClick habría que enseñarle a responder a Enter, a
 * anunciarse como plegable y a dejarse buscar con Ctrl+F.
 */
import { useState, useCallback, useEffect, useRef } from 'react'

const CLAVE = 'ug_admin_plegables'

/* Qué bloques dejó abiertos quien edita. En un objeto y no en una clave por
   bloque para no llenar el almacenamiento de entradas sueltas. */
function leerAbiertos() {
  try { return JSON.parse(localStorage.getItem(CLAVE) ?? '{}') } catch { return {} }
}

export default function Plegable({
  id, titulo, resumen, abiertoPorDefecto = false, insignia, children,
}) {
  const [abierto, setAbierto] = useState(() => {
    const guardado = leerAbiertos()[id]
    return typeof guardado === 'boolean' ? guardado : abiertoPorDefecto
  })

  /* Al pulsar «editar» en una fila, la pestaña rellena este mismo formulario y
     su título cambia —«Nuevo docente» pasa a «Editar docente»—. Si el bloque
     siguiera plegado, el clic parecería no haber hecho nada. Un cambio de
     título es justo la señal de que el bloque tiene algo que enseñar. */
  const tituloPrevio = useRef(titulo)
  useEffect(() => {
    if (tituloPrevio.current !== titulo) {
      tituloPrevio.current = titulo
      setAbierto(true)
    }
  }, [titulo])

  const alternar = useCallback(e => {
    const valor = e.currentTarget.open
    setAbierto(valor)
    try {
      localStorage.setItem(CLAVE, JSON.stringify({ ...leerAbiertos(), [id]: valor }))
    } catch { /* en privado no se puede guardar; el bloque funciona igual */ }
  }, [id])

  return (
    <details className="adm-pleg" open={abierto} onToggle={alternar}>
      <summary className="adm-pleg__cabeza">
        <span className="adm-pleg__flecha" aria-hidden="true">▸</span>
        <span className="adm-pleg__titulo">{titulo}</span>
        {insignia !== undefined && insignia !== null && (
          <span className="adm-pleg__insignia">{insignia}</span>
        )}
        {resumen && <span className="adm-pleg__resumen">{resumen}</span>}
      </summary>
      <div className="adm-pleg__cuerpo">{children}</div>
    </details>
  )
}
