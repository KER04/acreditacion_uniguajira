/* Piezas comunes de los módulos REST respaldados por PostgreSQL.
 *
 * Noticias, eventos y convocatorias son la misma forma tres veces: listar,
 * crear, modificar por id y borrar por id, sobre una tabla con lista blanca de
 * columnas. Antes de esto el patrón estaba copiado entero en docentes.js y
 * estudiantes.js; repetirlo una tercera, cuarta y quinta vez garantizaba que
 * las cinco copias se fueran separando.
 *
 * Lo que NO vive aquí es lo que cada módulo tiene de propio: sus columnas, su
 * validación y los mensajes de sus restricciones. Eso se pasa como argumento.
 */
import { validar, hayErrores } from '../../shared/validacion.js'

/* Traduce los errores de PostgreSQL a algo que el editor pueda entender.
 *
 * `mensajes` mapea el nombre de la restricción CHECK al texto en español. La
 * base es la última red: si algo se salta la validación del formulario y la de
 * la API, el editor ve esto en vez de "violates check constraint
 * noticia_categoria_valida". */
export function fallo(res, e, mensajes = {}, etiqueta = 'api') {
  if (e.code === '23514') {
    return res.status(400).json({
      error: mensajes[e.constraint] ?? `Dato fuera de rango (${e.constraint})`,
    })
  }
  if (e.code === '23505') return res.status(409).json({ error: 'Ya existe un registro igual' })
  if (e.code === '23503') return res.status(404).json({ error: 'El registro referido no existe' })
  if (e.code === '22P02') return res.status(400).json({ error: 'Formato de dato inválido' })
  if (e.code === '22008' || e.code === '22007') {
    return res.status(400).json({ error: 'Fecha u hora con formato inválido' })
  }
  console.error(`[${etiqueta}]`, e)
  return res.status(500).json({ error: 'Error interno del servidor' })
}

/* Corre el esquema compartido con el panel. Devuelve true si ya respondió.
   `parcial` es para PATCH: no exige los campos obligatorios que no vengan. */
export function rechazaPorValidacion(recurso, req, res, parcial) {
  const errores = validar(recurso, req.body ?? {}, { parcial })
  if (!hayErrores(errores)) return false
  res.status(400).json({ error: Object.values(errores)[0], errores })
  return true
}

/* Solo las columnas de la lista blanca que el cliente mandó de verdad. Nada
   que venga del cuerpo entra al SQL como identificador. */
export function camposDe(columnas, body) {
  return columnas.filter(c => body?.[c] !== undefined)
}

/* Convierte '' en null para columnas que aceptan null (fechas y horas). Un
   input vacío del formulario llega como cadena vacía, y PostgreSQL rechaza
   '' como DATE: sin esto, borrar una fecha en el panel daría error 500. */
export function valorPara(columna, valor, columnasNulas) {
  if (columnasNulas.has(columna) && (valor === '' || valor === null)) return null
  return valor
}

export function sentenciaInsert(tabla, campos, sel) {
  const marcadores = campos.map((_, i) => '$' + (i + 1)).join(', ')
  return `INSERT INTO ${tabla} (${campos.join(', ')}) VALUES (${marcadores}) RETURNING ${sel}`
}

export function sentenciaUpdate(tabla, campos, sel) {
  const asignaciones = campos.map((c, i) => `${c} = $${i + 2}`).join(', ')
  return `UPDATE ${tabla} SET ${asignaciones} WHERE id = $1 RETURNING ${sel}`
}
