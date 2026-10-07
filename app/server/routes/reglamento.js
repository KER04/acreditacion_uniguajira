/* Módulo Reglamento — documentos de la sección «Reglamento» de /estudiantes
 * (migración 031).
 *
 * REST por elemento sobre `reglamento_documento` con la fábrica común. El PDF
 * se sube aparte por /api/estudiantes/upload-doc y aquí solo se guarda el
 * `archivo_id`, igual que en Resoluciones.
 */
import { Router } from 'express'
import { query } from '../db/pool.js'
import { crearFallo, crearRecurso } from '../utils/recurso.js'
import { borrarSiHuerfano } from '../utils/archivos.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

const fallo = crearFallo('reglamento', {
  reglamento_titulo_no_vacio: 'El título debe tener al menos 3 caracteres',
  reglamento_orden_valido:    'El orden debe estar entre 0 y 999',
})
const recurso = crearRecurso({ router, fallo })

/* Fecha vaciada y adjunto quitado llegan como ''; la base quiere NULL. */
const NULABLES = ['fecha', 'archivo_id']
router.use((req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const c of NULABLES) if (req.body[c] === '') req.body[c] = null
  }
  next()
})

/* Extensión y peso del adjunto como subconsulta (la fábrica arma `FROM tabla`
   y reutiliza el SELECT en el RETURNING). La página los usa para decidir si
   el visor puede mostrar el archivo y para enseñar el peso. */
const SEL = "id, titulo, referencia, expedido_por, to_char(fecha, 'YYYY-MM-DD') AS fecha, descripcion, " +
  'archivo_id, url, principal, orden, ' +
  '(SELECT extension FROM archivos WHERE archivos.id = archivo_id) AS archivo_ext, ' +
  '(SELECT bytes FROM archivos WHERE archivos.id = archivo_id) AS archivo_bytes'
const ORD = 'principal DESC, orden ASC, id ASC'

const enlaceArchivo = id => '/api/archivos/' + id

/* El front recibe los enlaces ya armados, venga el documento de la base o de
   fuera: `enlace` se abre (y se incrusta en el visor), `descarga` lo baja. */
const conEnlaces = d => ({
  ...d,
  enlace: d.archivo_id ? enlaceArchivo(d.archivo_id) : d.url,
  descarga: d.archivo_id ? enlaceArchivo(d.archivo_id) + '/descargar' : d.url,
})

export async function leerReglamento() {
  const { rows } = await query(`SELECT ${SEL} FROM reglamento_documento ORDER BY ${ORD}`)
  return rows.map(conEnlaces)
}

/* Va ANTES del recurso genérico: al borrar el documento se suelta su PDF en
   el momento en vez de esperar al barrido de huérfanos. */
router.delete('/:id(\\d+)', requireAdmin, async (req, res) => {
  try {
    const { rows } = await query('DELETE FROM reglamento_documento WHERE id = $1 RETURNING archivo_id', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'No encontrado' })
    await borrarSiHuerfano(rows[0].archivo_id)
    res.json({ ok: true })
  } catch (e) { fallo(res, e) }
})

recurso({
  ruta: '', tabla: 'reglamento_documento', esquema: 'reglamento',
  columnas: ['titulo', 'referencia', 'expedido_por', 'fecha', 'descripcion', 'archivo_id', 'url', 'principal', 'orden'],
  seleccion: SEL, orden: ORD, mapear: conEnlaces,
})

export default router
