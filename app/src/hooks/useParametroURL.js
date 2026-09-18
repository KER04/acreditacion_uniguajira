import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

/* Estado que vive en la URL en vez de dentro del componente.
 *
 * El problema que resuelve: una pestaña guardada en `useState` existe solo en
 * memoria. Al recargar, al volver con el botón de atrás o al abrir un enlace
 * que alguien te pasó, el componente se monta de cero y aterrizas en la
 * primera pestaña, no en la que estabas mirando. Con el estado en la URL la
 * página sabe dónde estabas y, de regalo, la dirección se puede compartir:
 * `#/estudiantes?seccion=honor` abre directo el cuadro de honor.
 *
 * Funciona con el HashRouter del sitio: la consulta va después de la
 * almohadilla y `useSearchParams` la lee igual.
 *
 * Tres decisiones:
 *
 *  · El valor por defecto NO se escribe en la URL. Así la dirección limpia
 *    sigue siendo la dirección limpia y solo aparece parámetro cuando el
 *    visitante se movió de sitio a propósito.
 *
 *  · Se reemplaza la entrada del historial en vez de apilar una nueva. Si cada
 *    clic en una pestaña dejara rastro, salir de una página con cuatro
 *    pestañas exigiría pulsar atrás cinco veces.
 *
 *  · `validos` es lista blanca. Un parámetro escrito a mano o heredado de una
 *    versión anterior ("?seccion=loquesea") cae en el valor por defecto en vez
 *    de dejar la página sin pintar ninguna sección, que se vería como un fallo.
 */
/* La consulta que resulta de mover un parámetro. Se saca del hook para poder
   comprobarla sin montar React: es donde está la regla de "el valor por
   defecto no se escribe", que es fácil de romper sin enterarse. */
export function siguienteConsulta(previos, clave, valor, porDefecto) {
  const p = new URLSearchParams(previos)
  if (valor === porDefecto || valor === null || valor === undefined || valor === '') p.delete(clave)
  else p.set(clave, valor)
  return p
}

export function useParametroURL(clave, porDefecto, validos) {
  const [params, setParams] = useSearchParams()

  const crudo = params.get(clave)
  const valor = crudo !== null && (!validos || validos.includes(crudo)) ? crudo : porDefecto

  const fijar = useCallback(siguiente => {
    setParams(previos => siguienteConsulta(previos, clave, siguiente, porDefecto), { replace: true })
  }, [clave, porDefecto, setParams])

  return [valor, fijar]
}

/* Azúcar para el caso más común: una fila de pestañas definida como
   [['clave', 'Etiqueta'], ...]. Saca sola la lista blanca y el valor por
   defecto de la propia definición, para que no haya que repetirlos. */
export function usePestana(pestanas, { clave = 'seccion', porDefecto } = {}) {
  const valores = pestanas.map(p => (Array.isArray(p) ? p[0] : p))
  return useParametroURL(clave, porDefecto ?? valores[0], valores)
}
