/* Importa la malla curricular vigente al catálogo de materias y al plan.
 *
 *   node server/db/importar-pensum.js [--simular]
 *
 * Lee src/data/pensum.json —donde vivía el plan antes de la migración 008— y
 * lo reparte en las tres tablas: cada materia va al catálogo una sola vez, y
 * su semestre, créditos y horas van a plan_materia, que es donde dependen del
 * plan y no de la materia.
 *
 * Es idempotente: la materia se identifica por nombre normalizado y la fila
 * del plan por (plan, materia), así que reimportar actualiza en vez de
 * duplicar. No toca la propuesta de actualización curricular, que sigue
 * sirviéndose desde su JSON.
 */
import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool, query } from './pool.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SIMULAR = process.argv.includes('--simular')

const COPIA = join(__dirname, 'datos', 'pensum-original.json')
const VIVO = join(__dirname, '..', '..', 'src', 'data', 'pensum.json')

const PLAN = 'Plan 169 créditos (vigente)'

const avisos = []

/* ─── Normalización de nombres ─────────────────────────────────── */

/* La fuente escribe "Lógica Y Teoría De Conjuntos": título con mayúscula en
   cada palabra, incluidas las que no la llevan en español. Se corrigen para
   que el catálogo no acabe con la misma materia escrita de dos formas. */
const MINUSCULAS = new Set(['y', 'e', 'o', 'u', 'de', 'del', 'la', 'las', 'los', 'el', 'a', 'al', 'en', 'para', 'con', 'por'])

/* Siglas y números romanos que deben conservar las mayúsculas. */
const MAYUSCULAS = new Set(['I', 'II', 'III', 'IV', 'V', 'VI', 'TIC', 'TICS', 'IA', 'BD', 'SO'])

export function normalizarNombre(bruto) {
  const limpio = String(bruto ?? '').trim().replace(/\s+/g, ' ')
  if (!limpio) return ''

  return limpio
    .split(' ')
    .map((palabra, i) => {
      const sinPuntos = palabra.replace(/[.,;:]/g, '')
      if (MAYUSCULAS.has(sinPuntos.toUpperCase()) && sinPuntos.length <= 4) {
        return palabra.toUpperCase()
      }
      const baja = palabra.toLowerCase()
      /* La primera palabra siempre va capitalizada, aunque sea partícula. */
      if (i > 0 && MINUSCULAS.has(baja)) return baja
      return baja.charAt(0).toUpperCase() + baja.slice(1)
    })
    .join(' ')
}

function leerPensum() {
  for (const ruta of [VIVO, COPIA]) {
    try {
      return JSON.parse(readFileSync(ruta, 'utf-8'))
    } catch { /* probar la siguiente */ }
  }
  throw new Error('no se encontró pensum.json ni la copia en db/datos')
}

/* ─── Importación ──────────────────────────────────────────────── */

async function idDelPlan() {
  const existe = await query('SELECT id FROM plan_estudio WHERE lower(nombre) = lower($1)', [PLAN])
  if (existe.rows.length) return existe.rows[0].id
  if (SIMULAR) return null

  const { rows } = await query(
    'INSERT INTO plan_estudio (nombre, vigente, num_semestres) VALUES ($1, TRUE, $2) RETURNING id',
    [PLAN, 10],
  )
  return rows[0].id
}

/* Devuelve el id de la materia, creándola si hace falta. Identifica por nombre
   normalizado, que es lo que hace única la tabla. */
async function idDeMateria(datos, cuenta) {
  const nombre = normalizarNombre(datos.nombre)
  const { rows } = await query(
    'SELECT id, codigo, area, campo FROM materia WHERE lower(btrim(nombre)) = lower(btrim($1))',
    [nombre],
  )

  if (rows.length) {
    cuenta.existentes++
    const m = rows[0]
    /* Completa lo que faltara sin pisar lo que ya hubiera: el código puede
       haberse asignado a mano después de una importación anterior. */
    const codigo = m.codigo || String(datos.codigo ?? '').trim()
    const area = m.area || String(datos.area ?? '').trim()
    const campo = m.campo || String(datos.campo ?? '').trim()
    if (!SIMULAR && (codigo !== m.codigo || area !== m.area || campo !== m.campo)) {
      await query('UPDATE materia SET codigo = $2, area = $3, campo = $4 WHERE id = $1',
        [m.id, codigo, area, campo])
    }
    return m.id
  }

  cuenta.nuevas++
  if (SIMULAR) return null

  const { rows: creada } = await query(
    'INSERT INTO materia (nombre, codigo, area, campo) VALUES ($1, $2, $3, $4) RETURNING id',
    [nombre, String(datos.codigo ?? '').trim(), String(datos.area ?? '').trim(), String(datos.campo ?? '').trim()],
  )
  return creada[0].id
}

async function main() {
  const pensum = leerPensum()
  const planId = await idDelPlan()

  const cuenta = { nuevas: 0, existentes: 0, filas: 0, actualizadas: 0 }
  const vistos = new Set()

  for (const semestre of pensum.semestres ?? []) {
    const materias = semestre.materias ?? []
    for (const [i, m] of materias.entries()) {
      const nombre = normalizarNombre(m.nombre)
      if (!nombre) { avisos.push('materia sin nombre en el semestre ' + semestre.numero); continue }

      /* La misma materia dos veces en la misma malla rompería el UNIQUE de
         plan_materia; es mejor avisar que dejar que reviente el INSERT. */
      const clave = nombre.toLowerCase()
      if (vistos.has(clave)) {
        avisos.push(`"${nombre}" aparece más de una vez en la malla; solo se carga la primera`)
        continue
      }
      vistos.add(clave)

      const materiaId = await idDeMateria(m, cuenta)
      if (SIMULAR) { cuenta.filas++; continue }

      const fila = {
        plan_id: planId,
        materia_id: materiaId,
        semestre: Number(semestre.numero),
        creditos: Number(m.creditos ?? 0),
        horas_semana: Number(m.horas_semana ?? 0),
        orden: i,
      }

      const { rowCount } = await query(
        `UPDATE plan_materia SET semestre = $3, creditos = $4, horas_semana = $5, orden = $6
          WHERE plan_id = $1 AND materia_id = $2`,
        [fila.plan_id, fila.materia_id, fila.semestre, fila.creditos, fila.horas_semana, fila.orden],
      )
      if (rowCount) { cuenta.actualizadas++ } else {
        await query(
          `INSERT INTO plan_materia (plan_id, materia_id, semestre, creditos, horas_semana, orden)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [fila.plan_id, fila.materia_id, fila.semestre, fila.creditos, fila.horas_semana, fila.orden],
        )
        cuenta.filas++
      }
    }
  }

  if (SIMULAR) console.log('\nSIMULACIÓN — no se escribió nada\n')
  console.log(`  materias nuevas en el catálogo   ${cuenta.nuevas}`)
  console.log(`  materias que ya existían         ${cuenta.existentes}`)
  console.log(`  filas nuevas en el plan          ${cuenta.filas}`)
  console.log(`  filas del plan actualizadas      ${cuenta.actualizadas}`)

  if (!SIMULAR) {
    const { rows } = await query(
      `SELECT count(*)::int materias, coalesce(sum(creditos),0)::int creditos
         FROM plan_materia WHERE plan_id = $1`, [planId])
    const guardado = pensum.total_creditos
    console.log(`\n  en la base: ${rows[0].materias} materias, ${rows[0].creditos} créditos`)
    if (guardado && guardado !== rows[0].creditos) {
      console.log(`  OJO: el JSON declaraba ${guardado} créditos y la suma real es ${rows[0].creditos}`)
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
