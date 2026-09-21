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
const SEL_PLAN = `id, nombre, titulo, vigente, num_semestres, etapa_tramite,
                  extracurriculares, comparado_con`

export async function leerPensum({ planId = null } = {}) {
  const plan = planId
    ? (await query('SELECT ' + SEL_PLAN + ' FROM plan_estudio WHERE id = $1', [planId])).rows[0]
    : (await query('SELECT ' + SEL_PLAN + ' FROM plan_estudio WHERE vigente ORDER BY id LIMIT 1')).rows[0]

  if (!plan) return { plan: null, total_creditos: 0, total_materias: 0, semestres: [], tramite: [] }

  const { rows } = await query(
    `SELECT pm.id AS plan_materia_id, pm.semestre, pm.creditos, pm.horas_semana, pm.orden,
            m.id AS materia_id, m.nombre, m.codigo, m.area, m.campo
       FROM plan_materia pm
       JOIN materia m ON m.id = pm.materia_id
      WHERE pm.plan_id = $1
      ORDER BY pm.semestre, pm.orden, pm.id`,
    [plan.id],
  )

  /* Prerrequisitos del plan, agrupados por materia: la malla los dibuja como
     flechas y la ficha los lista, así que viajan dentro de cada materia en
     vez de obligar a una segunda petición. */
  const { rows: prerreq } = await query(
    `SELECT pp.materia_id, pp.prerrequisito_id, pp.tipo, m.nombre, m.codigo
       FROM plan_prerrequisito pp
       JOIN materia m ON m.id = pp.prerrequisito_id
      WHERE pp.plan_id = $1
      ORDER BY m.nombre`,
    [plan.id],
  )
  const porMateria = new Map()
  for (const p of prerreq) {
    if (!porMateria.has(p.materia_id)) porMateria.set(p.materia_id, [])
    porMateria.get(p.materia_id).push({
      materia_id: p.prerrequisito_id, nombre: p.nombre, codigo: p.codigo, tipo: p.tipo,
    })
  }

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
      prerrequisitos: porMateria.get(r.materia_id) ?? [],
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

  const { rows: tramite } = await query(
    'SELECT clave, etapa, detalle, orden FROM plan_tramite WHERE plan_id = $1 ORDER BY orden, id',
    [plan.id],
  )

  return {
    plan: {
      id: plan.id,
      nombre: plan.nombre,
      titulo: plan.titulo || plan.nombre,
      vigente: plan.vigente,
      num_semestres: plan.num_semestres,
      etapa_tramite: plan.etapa_tramite,
      extracurriculares: plan.extracurriculares ?? [],
      comparado_con: plan.comparado_con,
    },
    tramite,
    total_creditos: rows.reduce((a, r) => a + r.creditos, 0),
    total_horas: rows.reduce((a, r) => a + r.horas_semana, 0),
    total_materias: rows.length,
    total_prerrequisitos: prerreq.length,
    semestres,
  }
}

/* La propuesta de actualización: el plan no vigente más reciente. La usa
   /api/all para que la página pública no tenga que pedirla aparte. */
export async function leerPropuesta() {
  const { rows } = await query(
    'SELECT id FROM plan_estudio WHERE NOT vigente ORDER BY id DESC LIMIT 1',
  )
  if (!rows.length) return null
  return leerPensum({ planId: rows[0].id })
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

/* ─── Prerrequisitos ───────────────────────────────────────────── */

/* Añadir un prerrequisito a una materia dentro de un plan.
 *
 * La base impide que una materia se exija a sí misma y que la pareja se
 * repita, pero no puede comprobar lo demás con un CHECK —haría falta una
 * subconsulta—, así que aquí se verifica que ambas estén en el plan y que el
 * requisito vaya en un semestre anterior. Un prerrequisito del mismo semestre
 * o posterior es imposible de cursar y no tendría sentido dejarlo pasar. */
router.post('/plan/:planId(\\d+)/prerrequisitos', requireAdmin, async (req, res) => {
  const planId = Number(req.params.planId)
  const materiaId = Number(req.body?.materia_id)
  const requisitoId = Number(req.body?.prerrequisito_id)
  const tipo = req.body?.tipo === 'correquisito' ? 'correquisito' : 'prerrequisito'

  if (!materiaId || !requisitoId) {
    return res.status(400).json({ error: 'Faltan la materia y su prerrequisito' })
  }
  if (materiaId === requisitoId) {
    return res.status(400).json({ error: 'Una materia no puede ser prerrequisito de sí misma' })
  }

  try {
    const { rows } = await query(
      `SELECT pm.materia_id, pm.semestre, m.nombre
         FROM plan_materia pm JOIN materia m ON m.id = pm.materia_id
        WHERE pm.plan_id = $1 AND pm.materia_id = ANY($2)`,
      [planId, [materiaId, requisitoId]],
    )
    const materia = rows.find(r => r.materia_id === materiaId)
    const requisito = rows.find(r => r.materia_id === requisitoId)

    if (!materia) return res.status(400).json({ error: 'La materia no está en esta malla' })
    if (!requisito) return res.status(400).json({ error: 'El prerrequisito no está en esta malla' })

    /* El correquisito sí puede ir en el mismo semestre: se cursan a la vez. */
    const limite = tipo === 'correquisito' ? requisito.semestre > materia.semestre
                                           : requisito.semestre >= materia.semestre
    if (limite) {
      return res.status(400).json({
        error: `"${requisito.nombre}" va en el semestre ${requisito.semestre} y "${materia.nombre}" en el ${materia.semestre}: el prerrequisito debe cursarse antes`,
      })
    }

    await query(
      `INSERT INTO plan_prerrequisito (plan_id, materia_id, prerrequisito_id, tipo)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (plan_id, materia_id, prerrequisito_id) DO UPDATE SET tipo = EXCLUDED.tipo`,
      [planId, materiaId, requisitoId, tipo],
    )
    res.status(201).json(await leerPensum({ planId }))
  } catch (e) { falloMateria(res, e) }
})

router.delete('/plan/:planId(\\d+)/prerrequisitos', requireAdmin, async (req, res) => {
  const planId = Number(req.params.planId)
  try {
    const { rowCount } = await query(
      'DELETE FROM plan_prerrequisito WHERE plan_id=$1 AND materia_id=$2 AND prerrequisito_id=$3',
      [planId, Number(req.body?.materia_id), Number(req.body?.prerrequisito_id)],
    )
    if (!rowCount) return res.status(404).json({ error: 'Ese prerrequisito no estaba registrado' })
    res.json(await leerPensum({ planId }))
  } catch (e) { falloMateria(res, e) }
})

/* ─── Datos del plan ───────────────────────────────────────────── */

const COLUMNAS_PLAN = ['nombre', 'titulo', 'num_semestres', 'etapa_tramite', 'extracurriculares']

router.patch('/plan/:planId(\\d+)', requireAdmin, async (req, res) => {
  const campos = camposDe(COLUMNAS_PLAN, req.body)
  if (!campos.length) return res.status(400).json({ error: 'Nada que actualizar' })
  try {
    /* La etapa tiene que ser una de las registradas para este plan. Sin esta
       comprobación, un valor cualquiera se guardaría y la línea de tiempo
       pública —que busca la etapa por clave— caería al primer paso, dando por
       no empezado un trámite que sí avanzó. */
    if (req.body.etapa_tramite !== undefined) {
      const { rows } = await query(
        'SELECT clave FROM plan_tramite WHERE plan_id = $1', [req.params.planId])
      const claves = rows.map(r => r.clave)
      if (claves.length && !claves.includes(req.body.etapa_tramite)) {
        return res.status(400).json({
          error: `Etapa no válida. Las de este plan son: ${claves.join(', ')}`,
        })
      }
    }

    const { rowCount } = await query(
      sentenciaUpdate('plan_estudio', campos, 'id'),
      [req.params.planId, ...campos.map(c => req.body[c])],
    )
    if (!rowCount) return res.status(404).json({ error: 'Plan no encontrado' })
    res.json(await leerPensum({ planId: Number(req.params.planId) }))
  } catch (e) { falloMateria(res, e) }
})

export default router
