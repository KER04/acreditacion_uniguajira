/* Normalización de nombres de materia, compartida por los importadores.
 *
 * Vive aparte porque los scripts de importación ejecutan su `main()` al
 * cargarse: importar la función desde uno de ellos dispararía esa importación
 * entera y cerraría el pool de conexiones.
 *
 * La fuente escribe "Lógica Y Teoría De Conjuntos" —título con mayúscula en
 * cada palabra, incluidas las que no la llevan en español—. Sin normalizar,
 * el catálogo acaba con la misma materia escrita de dos formas.
 */

const MINUSCULAS = new Set(['y', 'e', 'o', 'u', 'de', 'del', 'la', 'las', 'los', 'el', 'a', 'al', 'en', 'para', 'con', 'por'])

/* Siglas y números romanos que conservan las mayúsculas. */
const MAYUSCULAS = new Set(['I', 'II', 'III', 'IV', 'V', 'VI', 'TIC', 'TICS', 'IA', 'BD', 'SO'])

export function normalizarNombre(bruto) {
  const limpio = String(bruto ?? '').trim().replace(/\s+/g, ' ')
  if (!limpio) return ''

  return limpio
    .split(' ')
    .map((palabra, i) => {
      /* Se compara y se capitaliza sobre las letras, ignorando la puntuación
         que las rodea: sin esto "(Datos" quedaba como "(datos" —el paréntesis
         se lleva la mayúscula— y "estructurados)" se capitalizaba por no
         reconocerse como partícula. */
      const nucleo = palabra.replace(/[^\p{L}\p{N}]/gu, '')
      if (!nucleo) return palabra

      if (MAYUSCULAS.has(nucleo.toUpperCase()) && nucleo.length <= 4) {
        return palabra.toUpperCase()
      }

      const baja = palabra.toLowerCase()
      /* La primera palabra siempre capitalizada, aunque sea partícula. */
      if (i > 0 && MINUSCULAS.has(nucleo.toLowerCase())) return baja

      const pos = baja.search(/\p{L}|\p{N}/u)
      return baja.slice(0, pos) + baja.charAt(pos).toUpperCase() + baja.slice(pos + 1)
    })
    .join(' ')
}
