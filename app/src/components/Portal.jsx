import { createPortal } from 'react-dom'

/* Monta a los hijos directamente en <body>.
 *
 * Hace falta para cualquier cosa con position:fixed (modales, drawers). Las
 * páginas llevan la animación `.page-in`, y un elemento con una animación sobre
 * `transform` y fill-mode forwards sigue siendo bloque contenedor en Chrome
 * aunque su estado final sea `transform: none`. Un overlay fixed dentro de la
 * página se posicionaba entonces respecto a la página y no a la ventana, así
 * que aparecía desplazado o fuera de la pantalla según el scroll.
 */
export default function Portal({ children }) {
  return createPortal(children, document.body)
}
