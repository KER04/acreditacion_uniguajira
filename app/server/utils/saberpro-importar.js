/* Escritura de un reporte Saber Pro ya leído.
 *
 * Separado de la lectura a propósito: leer la hoja no toca la base, y esto no
 * sabe nada de Excel. Así el panel puede enseñar lo que traería un archivo
 * antes de escribir nada, y el mismo código sirve para la carga de consola.
 *
 * Todo ocurre dentro de una transacción. Reemplazar es vaciar la tabla y
 * volver a llenarla: si algo falla a mitad, el vaciado se deshace y la base
 * queda con los resultados de antes, no sin ninguno.
 */
import { withTransaction } from '../db/pool.js'
import { validar, hayErrores, CLAVES_MODULOS } from '../../shared/validacion.js'

const COLUMNAS = [
  'estudiante', 'documento', 'registro', 'anio', 'periodo', 'sede',
  ...CLAVES_MODULOS,
  'percentil_nacional', 'percentil_nbc', 'nivel_ingles', 'observaciones',
]

const COLUMNAS_BASE = CLAVES_MODULOS.map(k => 'base_' + k)

/* Guarda las bases leídas de la fórmula. Se escriben todas juntas o ninguna:
   una mezcla de las bases nuevas con las de un reporte anterior daría un
   aprobatorio general que no corresponde a ningún examen. */
export async function guardarBases(cliente, bases, origen) {
  const faltan = CLAVES_MODULOS.filter(k => !Number.isInteger(bases?.[k]))
  if (faltan.length) return { guardadas: false, faltan }

  const asignaciones = COLUMNAS_BASE.map((c, i) => `${c} = $${i + 1}`).join(', ')
  await cliente.query(
    `UPDATE saberpro_parametros
        SET ${asignaciones}, bases_origen = $${COLUMNAS_BASE.length + 1},
            bases_actualizado_en = now()
      WHERE id = 1`,
    [...CLAVES_MODULOS.map(k => bases[k]), origen ?? ''],
  )
  return { guardadas: true, faltan: [] }
}

/* Importa las filas.
 *
 * `reemplazar` vacía la tabla antes de cargar: es lo que se quiere cuando el
 * archivo es la verdad completa del período. Sin él, cada fila se reconoce por
 * su número de registro del ICFES —único por examen— y se actualiza en vez de
 * duplicarse, de modo que volver a subir el mismo archivo no cambia nada.
 *
 * Devuelve el parte de la operación, que es lo que el panel enseña: cuántos
 * entraron, cuántos se actualizaron y por qué se quedó fuera cada rechazado.
 */
export async function importarResultados({
  filas, bases = null, reemplazar = false, aplicarBases = true, origen = '',
}) {
  const avisos = []
  const rechazos = []
  const validas = []

  for (const fila of filas) {
    const etiqueta = fila.estudiante || `fila ${fila.fila_hoja ?? '?'}`
    const errores = validar('saberpro', fila)
    if (hayErrores(errores)) {
      rechazos.push({ estudiante: etiqueta, motivo: Object.values(errores)[0] })
      continue
    }
    /* Sin número de registro no hay forma de reconocer la fila en una segunda
       carga, así que se insertaría otra vez. */
    if (!fila.registro) {
      rechazos.push({ estudiante: etiqueta, motivo: 'Sin número de registro del ICFES' })
      continue
    }
    validas.push(fila)
  }

  /* Un mismo registro repetido dentro del propio archivo: se queda el último y
     se avisa, porque cargar los dos dejaría al mismo examen dos veces. */
  const porRegistro = new Map()
  for (const fila of validas) {
    if (porRegistro.has(fila.registro)) {
      avisos.push(`${fila.estudiante}: el registro ${fila.registro} viene repetido en el archivo; se conserva el último`)
    }
    porRegistro.set(fila.registro, fila)
  }

  const resumen = await withTransaction(async cliente => {
    let borrados = 0
    if (reemplazar) {
      const { rowCount } = await cliente.query('DELETE FROM saberpro_resultado')
      borrados = rowCount
    }

    let nuevos = 0
    let actualizados = 0

    for (const fila of porRegistro.values()) {
      const valores = COLUMNAS.map(c => fila[c])
      /* El índice único sobre `registro` convierte el insert en actualización
         cuando el examen ya estaba cargado. Comprobarlo antes con un SELECT
         dejaría una rendija entre la consulta y la escritura. */
      const asignaciones = COLUMNAS.map((c, i) => `${c} = $${i + 1}`).join(', ')
      const { rows } = await cliente.query(
        `INSERT INTO saberpro_resultado (${COLUMNAS.join(', ')})
         VALUES (${COLUMNAS.map((_, i) => '$' + (i + 1)).join(', ')})
         ON CONFLICT (registro) WHERE registro <> ''
         DO UPDATE SET ${asignaciones}
         RETURNING (xmax = 0) AS insertado`,
        valores,
      )
      rows[0].insertado ? nuevos++ : actualizados++
    }

    let basesGuardadas = null
    if (aplicarBases && bases) {
      const r = await guardarBases(cliente, bases, origen)
      basesGuardadas = r.guardadas
      if (!r.guardadas && r.faltan.length) {
        avisos.push('No se guardaron las bases: la fórmula no trae la de ' + r.faltan.join(', '))
      }
    }

    const { rows: total } = await cliente.query(
      `SELECT count(*)::int AS total, min(anio) AS desde, max(anio) AS hasta,
              round(avg(puntaje_global)::numeric, 1)::float AS media
         FROM saberpro_resultado`,
    )

    return { borrados, nuevos, actualizados, basesGuardadas, ...total[0] }
  })

  return { ...resumen, rechazados: rechazos.length, rechazos, avisos, leidas: filas.length }
}
