/* Módulo Convocatorias — respaldado por PostgreSQL.
 *
 * Sustituye la lectura/escritura de src/data/convocatorias.json.
 *
 * A diferencia de los eventos, aquí el estado SÍ se guarda. No es un descuido:
 * la dirección puede cerrar una convocatoria antes de la fecha prevista o
 * dejarla abierta unos días más, y eso no se deduce del calendario. Lo que sí
 * se deduce —si ya pasó el cierre— viaja aparte en `vencida`, para que la
 * vista pueda avisar sin que nadie tenga que editar nada.
 *
 * Los requisitos son un arreglo nativo, igual que en modalidades_grado:
 * siempre se leen y se escriben enteros junto a su convocatoria.
 */
import { Router } from 'express'
import { query } from '../db/pool.js'
import { requireAdmin } from '../middleware/auth.js'
import {
  fallo, rechazaPorValidacion, camposDe, valorPara,
  sentenciaInsert, sentenciaUpdate,
} from '../utils/crud.js'

const router = Router()

const COLUMNAS = [
  'titulo', 'descripcion', 'categoria', 'estado',
  'fecha_apertura', 'fecha_cierre', 'dirigida_a', 'sede',
  'requisitos', 'url_postulacion', 'documento_url',
]

const NULAS = new Set(['fecha_apertura', 'fecha_cierre'])

const SEL = 'id, titulo, descripcion, categoria, estado, ' +
  "to_char(fecha_apertura, 'YYYY-MM-DD') AS fecha_apertura, " +
  "to_char(fecha_cierre, 'YYYY-MM-DD') AS fecha_cierre, " +
  'dirigida_a, sede, requisitos, url_postulacion, documento_url'

const MENSAJES = {
  convocatoria_titulo_no_vacio:  'El título debe tener al menos 3 caracteres',
  convocatoria_sede_valida:      'La sede debe ser ambas, riohacha o maicao',
  convocatoria_categoria_valida: 'Categoría no válida',
  convocatoria_estado_valido:    'El estado debe ser Abierta, Próxima o Cerrada',
  convocatoria_rango_coherente:  'El cierre no puede ser anterior a la apertura',
}

/* `vencida` es derivado, no una columna: dice si la fecha de cierre ya pasó.
   Permite que el portal marque una convocatoria caducada aunque su estado
   siga diciendo "Abierta" porque nadie la ha actualizado. */
const conVigencia = c => ({
  ...c,
  requisitos: c.requisitos ?? [],
  vencida: Boolean(c.fecha_cierre) && c.fecha_cierre < new Date().toISOString().slice(0, 10),
})

export async function leerConvocatorias({ id = null } = {}) {
  const valores = []
  let where = ''
  if (id !== null) { valores.push(id); where = ' WHERE id = $1' }

  const { rows } = await query(
    'SELECT ' + SEL + ' FROM convocatoria' + where +
    ' ORDER BY fecha_cierre ASC NULLS LAST, id DESC',
    valores,
  )
  return rows.map(conVigencia)
}

/* ─── Lectura ──────────────────────────────────────────────────── */

router.get('/', async (_req, res) => {
  try {
    res.json(await leerConvocatorias())
  } catch (e) { fallo(res, e, MENSAJES, 'convocatorias') }
})

router.get('/:id(\\d+)', async (req, res) => {
  try {
    const [convocatoria] = await leerConvocatorias({ id: Number(req.params.id) })
    if (!convocatoria) return res.status(404).json({ error: 'Convocatoria no encontrada' })
    res.json(convocatoria)
  } catch (e) { fallo(res, e, MENSAJES, 'convocatorias') }
})

/* ─── Escritura ────────────────────────────────────────────────── */

router.post('/', requireAdmin, async (req, res) => {
  if (rechazaPorValidacion('convocatorias', req, res, false)) return

  const campos = camposDe(COLUMNAS, req.body)
  if (!campos.length) return res.status(400).json({ error: 'No se recibió ningún dato' })

  try {
    const { rows } = await query(
      sentenciaInsert('convocatoria', campos, SEL),
      campos.map(c => valorPara(c, req.body[c], NULAS)),
    )
    res.status(201).json(conVigencia(rows[0]))
  } catch (e) { fallo(res, e, MENSAJES, 'convocatorias') }
})

router.patch('/:id(\\d+)', requireAdmin, async (req, res) => {
  if (rechazaPorValidacion('convocatorias', req, res, true)) return

  const campos = camposDe(COLUMNAS, req.body)
  if (!campos.length) return res.status(400).json({ error: 'Nada que actualizar' })

  try {
    const { rows } = await query(
      sentenciaUpdate('convocatoria', campos, SEL),
      [req.params.id, ...campos.map(c => valorPara(c, req.body[c], NULAS))],
    )
    if (!rows.length) return res.status(404).json({ error: 'Convocatoria no encontrada' })
    res.json(conVigencia(rows[0]))
  } catch (e) { fallo(res, e, MENSAJES, 'convocatorias') }
})

router.delete('/:id(\\d+)', requireAdmin, async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM convocatoria WHERE id = $1', [req.params.id])
    if (!rowCount) return res.status(404).json({ error: 'Convocatoria no encontrada' })
    res.json({ ok: true })
  } catch (e) { fallo(res, e, MENSAJES, 'convocatorias') }
})

export default router
