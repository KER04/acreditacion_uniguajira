/* Importa los resultados Saber Pro desde el reporte de la facultad.
 *
 *   node server/db/importar-saberpro.js [archivo.xlsx] [--simular] [--reemplazar]
 *
 * Sin argumento usa public/docs/Saber Pro 2025.xlsx, que es el reporte tal
 * como lo entrega la facultad. Antes este script leía un JSON intermedio que
 * alguien tenía que volcar a mano desde la hoja; ese paso sobra desde que la
 * hoja se lee directamente, y era donde se perdía la fórmula con los umbrales.
 *
 * Qué hace cada opción:
 *   --simular     lee y cuenta, sin escribir nada.
 *   --reemplazar  vacía la tabla antes de cargar, para cuando el archivo es el
 *                 censo completo y no un añadido.
 *
 * Sin --reemplazar es idempotente: cada fila se reconoce por su número de
 * registro del ICFES, así que reimportar actualiza en vez de duplicar.
 *
 * `puntaje_global` NO se escribe: en la tabla es columna generada y la calcula
 * PostgreSQL como promedio de los cinco módulos. El lector comprueba que el
 * global de la hoja coincida con ese cálculo y avisa si no.
 *
 * Las BASES por competencia —los umbrales de la última columna de la hoja— se
 * guardan en saberpro_parametros, que es de donde sale el puntaje aprobatorio
 * que publica el sitio.
 */
import 'dotenv/config'
import { dirname, join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from './pool.js'
import { leerHojaSaberPro } from '../utils/saberpro-hoja.js'
import { importarResultados } from '../utils/saberpro-importar.js'
import { CLAVES_MODULOS, ETIQUETA_MODULO, globalSaberPro } from '../../shared/validacion.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FUENTE = join(__dirname, '..', '..', 'public', 'docs', 'Saber Pro 2025.xlsx')

const argumento = process.argv.slice(2).find(a => !a.startsWith('--'))
const ARCHIVO = argumento ?? FUENTE
const SIMULAR = process.argv.includes('--simular')
const REEMPLAZAR = process.argv.includes('--reemplazar')

try {
  const { filas, bases, formula, avisos, hoja } = await leerHojaSaberPro(ARCHIVO)

  console.log(`\n  archivo  ${basename(ARCHIVO)}  (hoja «${hoja}»)`)
  console.log(`  filas    ${filas.length}\n`)

  if (formula) {
    console.log('  Bases leídas de la fórmula de la hoja:')
    for (const k of CLAVES_MODULOS) {
      const v = bases[k]
      console.log(`    ${ETIQUETA_MODULO[k].padEnd(28)} ${v ?? '—'}`)
    }
    const completas = CLAVES_MODULOS.every(k => Number.isInteger(bases[k]))
    if (completas) {
      const promedio = CLAVES_MODULOS.reduce((a, k) => a + bases[k], 0) / CLAVES_MODULOS.length
      console.log(`    ${'APROBATORIO GENERAL'.padEnd(28)} ${promedio.toFixed(1)}  (promedio de las cinco)`)
    }
    console.log('')
  } else {
    console.log('  La hoja no trae la fórmula con los umbrales: no hay bases que leer.\n')
  }

  if (SIMULAR) {
    console.log('  SIMULACIÓN — no se escribe nada\n')
    for (const f of filas.slice(0, 10)) {
      console.log(`    ${String(globalSaberPro(f)).padStart(3)}  ${f.estudiante.padEnd(36)} `
        + `${f.sede.padEnd(9)} ${f.periodo}`)
    }
    if (filas.length > 10) console.log(`    … y ${filas.length - 10} más`)
  } else {
    const r = await importarResultados({
      filas, bases, reemplazar: REEMPLAZAR, aplicarBases: true, origen: basename(ARCHIVO),
    })
    if (r.borrados) console.log(`  borrados antes de cargar  ${r.borrados}`)
    console.log(`  resultados nuevos         ${r.nuevos}`)
    console.log(`  resultados actualizados   ${r.actualizados}`)
    if (r.rechazados) console.log(`  rechazados                ${r.rechazados}`)
    if (r.basesGuardadas) console.log('  bases guardadas en los parámetros de grado')
    console.log(`\n  en la base: ${r.total} resultados`
      + (r.total ? ` (${r.desde}–${r.hasta}, media ${r.media})` : ''))

    for (const x of r.rechazos) console.log(`    · rechazado ${x.estudiante}: ${x.motivo}`)
    avisos.push(...r.avisos)
  }

  if (avisos.length) {
    console.log(`\n  REVISAR — ${avisos.length} aviso(s):`)
    for (const a of avisos) console.log(`    · ${a}`)
  }
} catch (e) {
  console.error('Falló la importación:', e.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
