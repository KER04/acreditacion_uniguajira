/* Importa la propuesta de actualización curricular.
 *
 *   node server/db/importar-propuesta.js [--simular]
 *
 * Fuente: db/datos/pensum-propuesto-pdf.json, transcripción del diagrama
 * "PROPUESTA CURRICULAR DE ACTUALIZACIÓN" que aprobó el programa.
 *
 * La propuesta es otra fila de plan_estudio con vigente = false. Las materias
 * van al MISMO catálogo que la malla vigente: las 17 que comparten ambas son
 * una sola fila, con créditos y semestre distintos en cada plan. Por eso en la
 * migración 008 esos campos quedaron en plan_materia y no en materia.
 *
 * Es idempotente: identifica el plan por nombre y la materia por nombre
 * normalizado, así que reimportar actualiza en vez de duplicar.
 */
import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool, query } from './pool.js'
import { normalizarNombre } from './nombres.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FUENTE = join(__dirname, 'datos', 'pensum-propuesto-pdf.json')
const SIMULAR = process.argv.includes('--simular')

const avisos = []
const txt = v => String(v ?? '').trim()

/* Devuelve el id de la materia, creándola si hace falta. Comparte catálogo con
   la malla vigente: si la materia ya existe, se reutiliza. */
async function idDeMateria(m, cuenta) {
  const nombre = normalizarNombre(m.nombre)
  const { rows } = await query(
    'SELECT id, area, campo FROM materia WHERE lower(btrim(nombre)) = lower(btrim($1))',
    [nombre],
  )

  if (rows.length) {
    cuenta.compartidas++
    return rows[0].id
  }

  cuenta.nuevas++
  if (SIMULAR) return null
  const { rows: creada } = await query(
    'INSERT INTO materia (nombre, area, campo) VALUES ($1, $2, $3) RETURNING id',
    [nombre, txt(m.area), txt(m.campo)],
  )
  return creada[0].id
}

async function main() {
  const p = JSON.parse(readFileSync(FUENTE, 'utf-8'))

  /* El plan vigente sirve de referencia: la propuesta se compara con él. */
  const vigente = (await query('SELECT id FROM plan_estudio WHERE vigente LIMIT 1')).rows[0]

  let plan = (await query('SELECT id FROM plan_estudio WHERE lower(nombre) = lower($1)', [p.nombre])).rows[0]

  if (SIMULAR) {
    console.log('\nSIMULACIÓN — no se escribió nada\n')
  } else if (plan) {
    await query(
      `UPDATE plan_estudio SET titulo=$2, num_semestres=$3, etapa_tramite=$4,
              extracurriculares=$5, comparado_con=$6 WHERE id=$1`,
      [plan.id, p.titulo, p.num_semestres, p.etapa_tramite, p.extracurriculares, vigente?.id ?? null],
    )
  } else {
    plan = (await query(
      `INSERT INTO plan_estudio (nombre, titulo, vigente, num_semestres, etapa_tramite, extracurriculares, comparado_con)
       VALUES ($1, $2, FALSE, $3, $4, $5, $6) RETURNING id`,
      [p.nombre, p.titulo, p.num_semestres, p.etapa_tramite, p.extracurriculares, vigente?.id ?? null],
    )).rows[0]
  }

  const planId = plan?.id ?? null

  /* ─── Etapas del trámite ─── */
  if (!SIMULAR) {
    for (const [i, t] of p.tramite.entries()) {
      await query(
        `INSERT INTO plan_tramite (plan_id, clave, etapa, detalle, orden)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (plan_id, clave) DO UPDATE
           SET etapa = EXCLUDED.etapa, detalle = EXCLUDED.detalle, orden = EXCLUDED.orden`,
        [planId, t.clave, t.etapa, t.detalle, i],
      )
    }
  }

  /* ─── Materias ─── */
  const cuenta = { nuevas: 0, compartidas: 0, filas: 0, actualizadas: 0 }
  const idPorNombre = new Map()

  for (const semestre of p.semestres) {
    for (const [i, m] of semestre.materias.entries()) {
      const materiaId = await idDeMateria(m, cuenta)
      idPorNombre.set(normalizarNombre(m.nombre).toLowerCase(), materiaId)
      if (SIMULAR) { cuenta.filas++; continue }

      const { rowCount } = await query(
        `UPDATE plan_materia SET semestre=$3, creditos=$4, horas_semana=$5, orden=$6
          WHERE plan_id=$1 AND materia_id=$2`,
        [planId, materiaId, semestre.numero, m.creditos, m.horas_semana, i],
      )
      if (rowCount) cuenta.actualizadas++
      else {
        await query(
          `INSERT INTO plan_materia (plan_id, materia_id, semestre, creditos, horas_semana, orden)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [planId, materiaId, semestre.numero, m.creditos, m.horas_semana, i],
        )
        cuenta.filas++
      }
    }
  }

  /* ─── Prerrequisitos ─── */
  let prerreq = 0
  for (const [materia, requisito] of p.prerrequisitos ?? []) {
    /* En simulación no hay ids que resolver —las materias nuevas aún no
       existen—, así que solo se comprueba que los nombres estén en el plan. */
    if (SIMULAR) { prerreq++; continue }

    const a = idPorNombre.get(normalizarNombre(materia).toLowerCase())
    const b = idPorNombre.get(normalizarNombre(requisito).toLowerCase())
    if (!a || !b) { avisos.push(`prerrequisito sin resolver: ${materia} ← ${requisito}`); continue }
    prerreq++
    await query(
      `INSERT INTO plan_prerrequisito (plan_id, materia_id, prerrequisito_id)
       VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
      [planId, a, b],
    )
  }

  console.log(`  materias nuevas en el catálogo      ${cuenta.nuevas}`)
  console.log(`  materias compartidas con la vigente ${cuenta.compartidas}`)
  console.log(`  filas nuevas en el plan             ${cuenta.filas}`)
  console.log(`  filas actualizadas                  ${cuenta.actualizadas}`)
  console.log(`  prerrequisitos                      ${prerreq}`)

  if (!SIMULAR) {
    const { rows } = await query(
      `SELECT count(*)::int materias, coalesce(sum(creditos),0)::int creditos,
              coalesce(sum(horas_semana),0)::int horas
         FROM plan_materia WHERE plan_id=$1`, [planId])
    console.log(`\n  en la base: ${rows[0].materias} asignaturas, ${rows[0].creditos} créditos, ${rows[0].horas} horas`)
    if (rows[0].creditos !== p.total_creditos) {
      console.log(`  OJO: el documento declara ${p.total_creditos} créditos`)
    }
  }

  if (avisos.length) {
    console.log(`\n  REVISAR — ${avisos.length} aviso(s):`)
    for (const a of avisos) console.log(`    · ${a}`)
  }
}

try {
  await main()
} catch (e) {
  console.error('Falló la importación:', e.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
