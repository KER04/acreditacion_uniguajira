/* Recursos de infraestructura tecnológica — respaldado por PostgreSQL (011).
 *
 * Es contenido institucional público: se lee sin sesión y se escribe solo
 * desde el panel.
 *
 * Los totales (salas, puestos, metros construidos) se suman aquí y no se
 * guardan en ninguna columna. Un total escrito a mano deja de cuadrar con sus
 * partes el día que alguien añade una sala y no se acuerda de actualizarlo, y
 * es justo la cifra que va a mirar un par académico del CNA.
 */
import { Router } from 'express'
import { query } from '../db/pool.js'
import { crearFallo, crearRecurso } from '../utils/recurso.js'
import { CLAVES_INFRA } from '../../shared/validacion.js'

const router = Router()

const MENSAJES = {
  infra_nombre_no_vacio:  'El nombre debe tener al menos 3 caracteres',
  infra_categoria_valida: 'Categoría no válida',
  infra_sede_valida:      'Sede no válida',
  infra_cantidad_valida:  'La cantidad debe estar entre 1 y 10000',
  infra_capacidad_valida: 'Los puestos deben estar entre 1 y 10000',
  infra_area_valida:      'El área no es válida',
  infra_anio_valido:      'El año no es válido',
  infra_orden_valido:     'El orden debe estar entre 0 y 999',
}

const fallo = crearFallo('infraestructura', MENSAJES)
const recurso = crearRecurso({ router, fallo })

const COLUMNAS = [
  'nombre', 'categoria', 'descripcion', 'sede', 'ubicacion',
  'cantidad', 'capacidad', 'area_m2', 'anio', 'equipamiento',
  'fuente_url', 'fuente_nombre', 'destacado', 'orden', 'activo',
]

const SELECCION = 'id, ' + COLUMNAS.join(', ')
const ORDEN = 'destacado DESC, orden ASC, id ASC'

/* El listado completo, incluidos los ocultos: lo usa el panel. */
recurso({
  ruta: 'recursos',
  esquema: 'infraestructura',
  tabla: 'recurso_infraestructura',
  columnas: COLUMNAS,
  seleccion: SELECCION,
  orden: ORDEN,
  soloAdminLee: true,
})

/* Qué cifras resume la página. Se calculan sobre lo visible, no sobre todo:
   un recurso dado de baja no debe seguir sumando puestos. */
async function resumen() {
  const { rows } = await query(
    `SELECT
       coalesce(sum(coalesce(cantidad, 1)) FILTER (WHERE categoria = 'computo'), 0)::int      AS salas_computo,
       coalesce(sum(coalesce(cantidad, 1)) FILTER (WHERE categoria = 'laboratorio'), 0)::int  AS laboratorios,
       coalesce(sum(coalesce(cantidad, 1) * capacidad), 0)::int                               AS puestos,
       coalesce(sum(area_m2), 0)::int                                                         AS area_m2,
       count(*)::int                                                                          AS recursos
     FROM recurso_infraestructura
     WHERE activo`,
  )
  return rows[0]
}

/* Todo lo que la página necesita, agrupado ya por categoría para que el front
   no tenga que recorrer la lista cinco veces. */
router.get('/', async (_req, res) => {
  try {
    const [{ rows }, cifras] = await Promise.all([
      query('SELECT ' + SELECCION + ' FROM recurso_infraestructura WHERE activo ORDER BY ' + ORDEN),
      resumen(),
    ])

    const porCategoria = Object.fromEntries(CLAVES_INFRA.map(c => [c, []]))
    for (const r of rows) (porCategoria[r.categoria] ??= []).push(r)

    res.json({
      recursos: rows,
      porCategoria,
      cifras,
      /* Las fuentes citadas, sin repetir: la página las lista al pie para que
         cualquiera pueda contrastar las cifras. */
      fuentes: [...new Map(
        rows.filter(r => r.fuente_url).map(r => [r.fuente_url, { url: r.fuente_url, nombre: r.fuente_nombre }]),
      ).values()],
    })
  } catch (e) { fallo(res, e) }
})

export default router
