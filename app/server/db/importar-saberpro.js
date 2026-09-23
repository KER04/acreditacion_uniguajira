/* Importa los resultados Saber Pro.
 *
 *   node server/db/importar-saberpro.js [archivo.json] [--simular]
 *
 * Sin argumento usa db/datos/saberpro-2025.json, el volcado de la hoja que
 * entrega la facultad, filtrado por su columna "Supero la media". Está
 * versionado por lo mismo que la planilla de docentes: que cualquiera pueda
 * reconstruir la base tras clonar el repo.
 *
 * El JSON es la hoja tal cual, con sus encabezados en mayúsculas y sus valores
 * como texto. Toda la normalización ocurre aquí, para que volver a correrlo
 * sobre una hoja actualizada dé el mismo resultado.
 *
 * Es idempotente: identifica el resultado por el número de registro del ICFES,
 * que es único por examen, así que reimportar actualiza en vez de duplicar.
 *
 * `puntaje_global` NO se escribe: en la tabla es columna generada y la calcula
 * PostgreSQL como promedio de los cinco módulos. El importador comprueba que
 * el global que trae la hoja coincide con ese cálculo y avisa si no.
 */
import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool, query } from './pool.js'
import { validar, hayErrores, CLAVES_MODULOS, globalSaberPro } from '../../shared/validacion.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FUENTE = join(__dirname, 'datos', 'saberpro-2025.json')

const argumento = process.argv.slice(2).find(a => !a.startsWith('--'))
const ARCHIVO = argumento ?? FUENTE
const SIMULAR = process.argv.includes('--simular')

/* ─── Normalización ────────────────────────────────────────────── */

/* Partículas que en un nombre español van en minúscula. */
const PARTICULAS = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'e', 'da', 'do'])

/* "SOLANO RODRIGUEZ ALAN DAVID" -> "Solano Rodriguez Alan David".
   No se reordena: la hoja trae los apellidos delante, que es como los emite el
   ICFES, y adivinar dónde acaban los apellidos de alguien es peor que dejar el
   orden que puso la fuente. */
function normalizarNombre(bruto) {
  const s = String(bruto ?? '').trim().replace(/\s+/g, ' ')
  if (!s) return ''
  if (s !== s.toUpperCase()) return s
  return s.split(' ')
    .map((p, i) => (i > 0 && PARTICULAS.has(p.toLowerCase())
      ? p.toLowerCase()
      : p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()))
    .join(' ')
}

/* "2025 - I" -> { anio: 2025, periodo: '2025-I' }. El formato con espacios no
   pasa la validación de período, que espera 2025-I o 2025-II. */
function partirPeriodo(bruto) {
  const s = String(bruto ?? '').trim()
  const m = /^(\d{4})\s*-\s*(I{1,2})$/.exec(s)
  if (m) return { anio: Number(m[1]), periodo: m[1] + '-' + m[2] }
  const soloAnio = /^(\d{4})$/.exec(s)
  if (soloAnio) return { anio: Number(soloAnio[1]), periodo: '' }
  return { anio: null, periodo: '' }
}

const SEDES = { riohacha: 'riohacha', maicao: 'maicao' }
const normalizarSede = b => SEDES[String(b ?? '').trim().toLowerCase()] ?? 'riohacha'

const entero = b => {
  const n = Number(String(b ?? '').trim())
  return Number.isFinite(n) ? Math.round(n) : null
}

/* Cada módulo de la tabla con su encabezado en la hoja del ICFES. */
const COLUMNA_HOJA = {
  lectura_critica:           'LECTURA CRÍTICA',
  razonamiento_cuantitativo: 'RAZONAMIENTO CUANTITATIVO',
  competencias_ciudadanas:   'COMPETENCIAS CIUDADANAS',
  comunicacion_escrita:      'COMUNICACIÓN ESCRITA',
  ingles:                    'INGLÉS',
}

/* ─── Preparación ──────────────────────────────────────────────── */

const entrada = JSON.parse(readFileSync(ARCHIVO, 'utf-8'))
const filas = Array.isArray(entrada) ? entrada : entrada.filas
if (!Array.isArray(filas)) {
  console.error('El archivo no contiene una lista de filas')
  process.exit(1)
}

const avisos = []

const preparados = filas.map(f => {
  const { anio, periodo } = partirPeriodo(f['Periodo'])
  const fila = {
    estudiante: normalizarNombre(f['Nombre']),
    documento:  String(f['Documento'] ?? '').trim(),
    registro:   String(f['Número de registro'] ?? '').trim(),
    anio,
    periodo,
    sede:       normalizarSede(f['Sede']),
    percentil_nacional: null,
    percentil_nbc: null,
    nivel_ingles: '',
    observaciones: '',
  }
  for (const [clave, encabezado] of Object.entries(COLUMNA_HOJA)) {
    fila[clave] = entero(f[encabezado])
  }

  /* El global de la hoja tiene que cuadrar con el promedio de los cinco
     módulos, porque es lo que va a calcular la base. Si no cuadra, alguno de
     los seis números está mal y conviene mirarlo antes de publicarlo. */
  const declarado = entero(f['Puntaje global'])
  const calculado = globalSaberPro(fila)
  if (declarado !== null && calculado !== null && declarado !== calculado) {
    avisos.push(`${fila.estudiante}: la hoja dice ${declarado} y sus módulos dan ${calculado}`)
  }

  return fila
})

/* ─── Importación ──────────────────────────────────────────────── */

const COLUMNAS = [
  'estudiante', 'documento', 'registro', 'anio', 'periodo', 'sede',
  ...CLAVES_MODULOS,
  'percentil_nacional', 'percentil_nbc', 'nivel_ingles', 'observaciones',
]

async function importar() {
  let nuevos = 0, actualizados = 0, rechazados = 0

  for (const r of preparados) {
    const errores = validar('saberpro', r)
    if (hayErrores(errores)) {
      rechazados++
      avisos.push(`${r.estudiante || '(sin nombre)'}: ${Object.values(errores)[0]}`)
      continue
    }

    /* Sin número de registro no hay forma de reconocerlo en una segunda
       corrida, y se insertaría otra vez. */
    if (!r.registro) {
      rechazados++
      avisos.push(`${r.estudiante}: sin número de registro del ICFES, no se carga`)
      continue
    }

    const previo = await query('SELECT id FROM saberpro_resultado WHERE registro = $1', [r.registro])

    if (SIMULAR) {
      previo.rows[0] ? actualizados++ : nuevos++
      console.log(`${previo.rows[0] ? '~' : '+'} ${String(globalSaberPro(r)).padStart(3)}  `
        + `${r.estudiante.padEnd(36)} ${r.sede.padEnd(9)} ${r.periodo}`)
      continue
    }

    const valores = COLUMNAS.map(c => r[c])
    if (previo.rows[0]) {
      const asignaciones = COLUMNAS.map((c, i) => `${c} = $${i + 2}`).join(', ')
      await query(`UPDATE saberpro_resultado SET ${asignaciones} WHERE id = $1`,
        [previo.rows[0].id, ...valores])
      actualizados++
    } else {
      const marcadores = COLUMNAS.map((_, i) => '$' + (i + 1)).join(', ')
      await query(
        `INSERT INTO saberpro_resultado (${COLUMNAS.join(', ')}) VALUES (${marcadores})`,
        valores)
      nuevos++
    }
  }

  console.log(SIMULAR ? '\nSIMULACIÓN — no se escribió nada\n' : '')
  console.log(`  resultados nuevos       ${nuevos}`)
  console.log(`  resultados actualizados ${actualizados}`)
  if (rechazados) console.log(`  rechazados              ${rechazados}`)

  if (!SIMULAR) {
    const { rows } = await query(
      `SELECT count(*)::int total, min(anio) desde, max(anio) hasta,
              round(avg(puntaje_global)::numeric, 1)::float media
         FROM saberpro_resultado`)
    const r = rows[0]
    console.log(`\n  en la base: ${r.total} resultados`
      + (r.total ? ` (${r.desde}–${r.hasta}, media ${r.media})` : ''))
  }

  if (avisos.length) {
    console.log(`\n  REVISAR — ${avisos.length} aviso(s):`)
    for (const a of avisos) console.log(`    · ${a}`)
  }
}

try {
  await importar()
} catch (e) {
  console.error('Falló la importación:', e.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
