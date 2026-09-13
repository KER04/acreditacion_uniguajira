/* Módulo Pensum — catálogo de materias y armado de la malla.
 *
 * Sustituye la lectura/escritura de src/data/pensum.json.
 *
 * Dos recursos distintos, y conviene no confundirlos:
 *   · /materias        el catálogo. Qué materias existen, con su área y campo.
 *   · /plan/:id/materias  qué materias componen una malla, en qué semestre y
 *                      con cuántos créditos. Eso depende del plan: la misma
 *                      "Desarrollo Web" vale 3 créditos en la malla vigente y
 *                      4 en la propuesta.
 *
 * GET / devuelve la malla ya armada con la forma que esperan las vistas
 * (semestres con materias dentro), para que malla.jsx siga funcionando sin
 * tocar una línea. Los totales van calculados, no guardados.
 */
import { Router } from 'express'
import { query } from '../db/pool.js'
import { requireAdmin } from '../middleware/auth.js'
import {
  fallo, rechazaPorValidacion, camposDe, sentenciaInsert, sentenciaUpdate,
} from '../utils/crud.js'

const router = Router()

const COLUMNAS_MATERIA = ['nombre', 'codigo', 'area', 'campo']
const SEL_MATERIA = 'id, nombre, codigo, area, campo'

const COLUMNAS_PLAN_MATERIA = ['materia_id', 'semestre', 'creditos', 'horas_semana', 'orden']

const MENSAJES = {
  materia_nombre_no_vacio:        'El nombre debe tener al menos 3 caracteres',
  materia_area_valida:            'Área no válida',
  materia_campo_valido:           'Campo de formación no válido',
  plan_materia_semestre_valido:   'El semestre debe estar entre 1 y 14',
  plan_materia_creditos_validos:  'Los créditos deben estar entre 0 y 12',
  plan_materia_horas_validas:     'Las horas por semana deben estar entre 0 y 40',
  plan_nombre_no_vacio:           'El nombre del plan debe tener al menos 3 caracteres',
  plan_semestres_validos:         'El número de semestres debe estar entre 1 y 14',
}

/* El UNIQUE de nombre y el de código comparten el código 23505; distinguirlos
   evita decirle al editor "ya existe" sin decirle de qué. */
function falloMateria(res, e) {
  if (e.code === '23505') {
    if (e.constraint === 'materia_codigo_idx') return res.status(409).json({ error: 'Ya hay una materia con ese código' })
    if (e.constraint === 'materia_nombre_idx') return res.status(409).json({ error: 'Ya hay una materia con ese nombre' })
    if (e.constraint === 'plan_materia_unica') return res.status(409).json({ error: 'Esa materia ya está en la malla' })
  }
  if (e.code === '23503' && e.constraint?.includes('materia_id')) {
    return res.status(409).json({ error: 'No se puede borrar: la materia está usada en una malla' })
  }
  return fallo(res, e, MENSAJES, 'pensum')
}

/* ─── La malla armada ──────────────────────────────────────────── */

/* Devuelve el plan vigente con la forma de pensum.json, que es la que ya
   consumen malla.jsx, Pensum.jsx y Programa.jsx. Los totales por semestre y
   del plan se calculan aquí: guardarlos era lo que hacía que descuadraran
   en cuanto alguien agregaba una materia sin actualizar el número. */
export async function leerPensum({ planId = null } = {}) {
  const plan = planId
    ? (await query('SELECT id, nombre, vigente, num_semestres FROM plan_estudio WHERE id = $1', [planId])).rows[0]
    : (await query('SELECT id, nombre, vigente, num_semestres FROM plan_estudio WHERE vigente ORDER BY id LIMIT 1')).rows[0]

  if (!plan) return { plan: null, total_creditos: 0, total_materias: 0, semestres: [] }

  const { rows } = await query(
    `SELECT pm.id AS plan_materia_id, pm.semestre, pm.creditos, pm.horas_semana, pm.orden,
            m.id AS materia_id, m.nombre, m.codigo, m.area, m.campo
       FROM plan_materia pm
       JOIN materia m ON m.id = pm.materia_id
      WHERE pm.plan_id = $1
      ORDER BY pm.semestre, pm.orden, pm.id`,
    [plan.id],
  )

  const porSemestre = new Map()
  for (const r of rows) {
    if (!porSemestre.has(r.semestre)) porSemestre.set(r.semestre, [])
    porSemestre.get(r.semestre).push({
      plan_materia_id: r.plan_materia_id,
      materia_id: r.materia_id,
      nombre: r.nombre,
      codigo: r.codigo,
      creditos: r.creditos,
      horas_semana: r.horas_semana,
      campo: r.campo,
      area: r.area,
    })
  }

  /* Se emiten todos los semestres del plan, incluso los vacíos: el panel
     necesita poder abrir un semestre sin materias para empezar a llenarlo. */
  const semestres = []
  for (let n = 1; n <= plan.num_semestres; n++) {
    const materias = porSemestre.get(n) ?? []
    semestres.push({
      numero: n,
      materias,
      total_creditos: materias.reduce((a, m) => a + m.creditos, 0),
      total_horas: materias.reduce((a, m) => a + m.horas_semana, 0),
    })
  }

  return {
    plan: { id: plan.id, nombre: plan.nombre, vigente: plan.vigente, num_semestres: plan.num_semestres },
    total_creditos: rows.reduce((a, r) => a + r.creditos, 0),
    total_materias: rows.length,
    semestres,
  }
}

router.get('/', async (req, res) => {
  try {
    const planId = req.query.plan ? Number(req.query.plan) : null
    res.json(await leerPensum({ planId }))
  } catch (e) { falloMateria(res, e) }
})

router.get('/planes', async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT p.id, p.nombre, p.vigente, p.num_semestres,
              count(pm.id)::int AS materias,
              coalesce(sum(pm.creditos), 0)::int AS creditos
         FROM plan_estudio p
         LEFT JOIN plan_materia pm ON pm.plan_id = p.id
        GROUP BY p.id ORDER BY p.vigente DESC, p.nombre`,
    )
    res.json(rows)
  } catch (e) { falloMateria(res, e) }
})

/* ─── Catálogo de materias ─────────────────────────────────────── */

/* `?libres=<plan>` deja fuera las que ya están en esa malla, que es lo que
   necesita el desplegable al agregar: ofrecer solo lo que falta. */
router.get('/materias', async (req, res) => {
  try {
    const plan = req.query.libres ? Number(req.query.libres) : null
    const { rows } = await query(
      'SELECT ' + SEL_MATERIA + ' FROM materia' +
      (plan ? ' WHERE id NOT IN (SELECT materia_id FROM plan_materia WHERE plan_id = $1)' : '') +
      ' ORDER BY nombre',
      plan ? [plan] : [],
    )
    res.json(rows)
  } catch (e) { falloMateria(res, e) }
})

router.post('/materias', requireAdmin, async (req, res) => {
  if (rechazaPorValidacion('materias', req, res, false)) return
  const campos = camposDe(COLUMNAS_MATERIA, req.body)
  if (!campos.length) return res.status(400).json({ error: 'No se recibió ningún dato' })
  try {
    const { rows } = await query(sentenciaInsert('materia', campos, SEL_MATERIA), campos.map(c => req.body[c]))
    res.status(201).json(rows[0])
  } catch (e) { falloMateria(res, e) }
})

router.patch('/materias/:id(\\d+)', requireAdmin, async (req, res) => {
  if (rechazaPorValidacion('materias', req, res, true)) return
  const campos = camposDe(COLUMNAS_MATERIA, req.body)
  if (!campos.length) return res.status(400).json({ error: 'Nada que actualizar' })
  try {
    const { rows } = await query(
      sentenciaUpdate('materia', campos, SEL_MATERIA),
      [req.params.id, ...campos.map(c => req.body[c])],
    )
    if (!rows.length) return res.status(404).json({ error: 'Materia no encontrada' })
    res.json(rows[0])
  } catch (e) { falloMateria(res, e) }
})

router.delete('/materias/:id(\\d+)', requireAdmin, async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM materia WHERE id = $1', [req.params.id])
    if (!rowCount) return res.status(404).json({ error: 'Materia no encontrada' })
    res.json({ ok: true })
  } catch (e) { falloMateria(res, e) }
})

/* ─── Materias dentro de un plan ───────────────────────────────── */

/* Agregar una materia a la malla. El orden, si no viene, va al final del
   semestre, que es lo que espera quien acaba de pulsar "agregar". */
router.post('/plan/:planId(\\d+)/materias', requireAdmin, async (req, res) => {
  if (rechazaPorValidacion('plan_materia', req, res, false)) return
  try {
    const orden = req.body.orden !== undefined ? Number(req.body.orden) : (
      await query(
        'SELECT coalesce(max(orden) + 1, 0) AS siguiente FROM plan_materia WHERE plan_id = $1 AND semestre = $2',
        [req.params.planId, req.body.semestre],
      )
    ).rows[0].siguiente

    await query(
      `INSERT INTO plan_materia (plan_id, materia_id, semestre, creditos, horas_semana, orden)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.params.planId, req.body.materia_id, req.body.semestre,
       req.body.creditos ?? 0, req.body.horas_semana ?? 0, orden],
    )
    res.status(201).json(await leerPensum({ planId: Number(req.params.planId) }))
  } catch (e) { falloMateria(res, e) }
})

router.patch('/plan-materia/:id(\\d+)', requireAdmin, async (req, res) => {
  if (rechazaPorValidacion('plan_materia', req, res, true)) return
  const campos = camposDe(COLUMNAS_PLAN_MATERIA, req.body)
  if (!campos.length) return res.status(400).json({ error: 'Nada que actualizar' })
  try {
    const { rows } = await query(
      sentenciaUpdate('plan_materia', campos, 'plan_id'),
      [req.params.id, ...campos.map(c => req.body[c])],
    )
    if (!rows.length) return res.status(404).json({ error: 'Esa materia no está en la malla' })
    res.json(await leerPensum({ planId: rows[0].plan_id }))
  } catch (e) { falloMateria(res, e) }
})

/* Quitar la materia de la malla. No borra la materia del catálogo: sigue
   existiendo para poder ponerla en otro semestre o en otro plan. */
router.delete('/plan-materia/:id(\\d+)', requireAdmin, async (req, res) => {
  try {
    const { rows } = await query('DELETE FROM plan_materia WHERE id = $1 RETURNING plan_id', [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Esa materia no está en la malla' })
    res.json(await leerPensum({ planId: rows[0].plan_id }))
  } catch (e) { falloMateria(res, e) }
})

export default router
