import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

export const pool = new Pool({
  host:     process.env.PGHOST ?? 'localhost',
  port:     Number(process.env.PGPORT ?? 5432),
  user:     process.env.PGUSER ?? 'postgres',
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE ?? 'uniguajira',
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

pool.on('error', err => console.error('[db] error en cliente inactivo:', err.message))

/* Atajo para consultas sueltas: query('SELECT * FROM usuarios WHERE id = $1', [id]) */
export const query = (text, params) => pool.query(text, params)

/* Ejecuta fn dentro de una transacción; revierte si algo lanza. */
export async function withTransaction(fn) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

/* Comprueba que la base responde; se llama al arrancar el servidor. */
export async function checkConnection() {
  const { rows } = await pool.query('SELECT current_database() AS db, version() AS v')
  return rows[0]
}
