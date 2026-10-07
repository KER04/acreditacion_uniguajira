/* Carga la galería de la página de un semillero.
 *
 *   node server/db/importar-fotos-semillero.js <carpeta> [--simular]
 *
 * La carpeta trae las fotos ya procesadas y un manifiesto.json:
 *   { "semillero": "<slug>", "fotos": [{ "archivo", "logro", "pie" }] }
 * `logro` es el resultado tal como está en semillero_logro ("Primer lugar a
 * nivel regional"): ata la foto a esa competencia. Puede omitirse.
 *
 * Como el importador de fotos de docentes, las imágenes no se versionan y se
 * identifica todo por texto, no por id, porque los ids de local y producción
 * no coinciden. Es idempotente: una foto con el mismo nombre de archivo ya
 * cargada en ese semillero se salta.
 */
import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pool, query } from './pool.js'
import { guardarArchivo, LIMITE_FOTO, EXTENSIONES_IMAGEN, extensionDe } from '../utils/archivos.js'

const args = process.argv.slice(2)
const CARPETA = args.find(a => !a.startsWith('--'))
const SIMULAR = args.includes('--simular')

if (!CARPETA) {
  console.error('Uso: node server/db/importar-fotos-semillero.js <carpeta> [--simular]')
  process.exit(1)
}

async function main() {
  const { semillero: slug, fotos } = JSON.parse(readFileSync(join(CARPETA, 'manifiesto.json'), 'utf-8'))

  const s = (await query('SELECT id, nombre FROM semillero WHERE slug = $1', [slug])).rows[0]
  if (!s) throw new Error(`No hay semillero con slug "${slug}". ¿Se aplicó la migración 033?`)

  const logros = (await query('SELECT id, resultado FROM semillero_logro WHERE semillero_id = $1', [s.id])).rows
  const yaCargadas = new Set((await query(
    `SELECT a.nombre_original FROM semillero_foto f JOIN archivos a ON a.id = f.archivo_id
     WHERE f.semillero_id = $1`, [s.id])).rows.map(r => r.nombre_original))

  let cargadas = 0, saltadas = 0
  for (const [orden, f] of fotos.entries()) {
    const nombreArchivo = `${slug}-${f.archivo}`
    if (yaCargadas.has(nombreArchivo)) { saltadas++; console.log('  ya estaba    ', f.archivo); continue }

    const logro = f.logro ? logros.find(l => l.resultado === f.logro) : null
    if (f.logro && !logro) throw new Error(`El logro "${f.logro}" no existe en ${s.nombre}`)

    const buffer = readFileSync(join(CARPETA, f.archivo))
    if (!EXTENSIONES_IMAGEN.includes(extensionDe(f.archivo)) || buffer.length > LIMITE_FOTO) {
      throw new Error(`${f.archivo}: debe ser imagen de menos de 3 MB`)
    }

    if (!SIMULAR) {
      const a = await guardarArchivo({ originalname: nombreArchivo, size: buffer.length, buffer })
      await query(
        'INSERT INTO semillero_foto (semillero_id, logro_id, archivo_id, pie, orden) VALUES ($1, $2, $3, $4, $5)',
        [s.id, logro?.id ?? null, a.id, f.pie ?? '', orden])
    }
    cargadas++
    console.log('  cargada      ', f.archivo, logro ? '→ ' + f.logro : '')
  }
  console.log(`\n${SIMULAR ? '[simulación] ' : ''}${s.nombre}: ${cargadas} cargadas, ${saltadas} ya estaban.`)
}

main()
  .catch(e => { console.error('Error:', e.message); process.exitCode = 1 })
  .finally(() => pool.end())
