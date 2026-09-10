/* Corre las migraciones pendientes en orden alfabético.
   Cada archivo se aplica una sola vez y dentro de su propia transacción. */
import 'dotenv/config'
import { readdir, readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { pool, withTransaction } from './pool.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIR = join(__dirname, 'migrations')

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migraciones (
      nombre      TEXT PRIMARY KEY,
      aplicada_en TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  const { rows } = await pool.query('SELECT nombre FROM _migraciones')
  const aplicadas = new Set(rows.map(r => r.nombre))

  const archivos = (await readdir(DIR)).filter(f => f.endsWith('.sql')).sort()
  const pendientes = archivos.filter(f => !aplicadas.has(f))

  if (pendientes.length === 0) {
    console.log(`Sin migraciones pendientes (${archivos.length} ya aplicadas).`)
    return
  }

  for (const archivo of pendientes) {
    const sql = await readFile(join(DIR, archivo), 'utf-8')
    await withTransaction(async client => {
      await client.query(sql)
      await client.query('INSERT INTO _migraciones (nombre) VALUES ($1)', [archivo])
    })
    console.log(`  aplicada  ${archivo}`)
  }
  console.log(`${pendientes.length} migracion(es) aplicada(s).`)
}

main()
  .catch(e => { console.error('Error migrando:', e.message); process.exitCode = 1 })
  .finally(() => pool.end())
