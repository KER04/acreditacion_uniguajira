/* Cuadrícula del emblema de la universidad, para el fondo de quien no tiene
 * portada propia.
 *
 * El emblema que se tesela es `favicon.webp`: el tejido wayuu SIN el texto de
 * la marca. Repetir el logo completo dejaría "Universidad de La Guajira"
 * escrito veinte veces en miniatura, ilegible y ruidoso; el tejido solo se lee
 * como textura y es lo que de verdad identifica a la institución.
 *
 * Sale gratis en peso: ese mismo archivo ya lo descarga el navegador como
 * favicon (ver index.html), así que cuando la trama se pinta la imagen lleva
 * rato en caché y no hay petición nueva.
 *
 * `blanco` la convierte en una filigrana monocroma para los fondos oscuros,
 * donde el emblema a todo color competiría con el texto encima en vez de
 * quedarse detrás.
 *
 * `tono` tiñe las líneas de la retícula. Sirve para que en una tarjeta que ya
 * tiene un color propio —el del puesto en el cuadro de honor, el del egresado—
 * la cuadrícula pertenezca a esa tarjeta en vez de ser una malla gris genérica
 * pegada encima.
 */
export default function TramaMarca({ escala = 96, opacidad, blanco = false, tono, className = '' }) {
  const estilo = { '--trama-escala': escala + 'px' }
  if (opacidad !== undefined) estilo['--trama-opacidad'] = opacidad
  if (tono !== undefined) estilo['--trama-color'] = tono

  return (
    <div
      className={'trama-marca' + (blanco ? ' trama-marca--blanco' : '') + (className ? ' ' + className : '')}
      style={estilo}
      aria-hidden="true"
    />
  )
}
