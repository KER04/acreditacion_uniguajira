/* Crea la base de datos si todavía no existe.
   Se conecta a la base 'postgres' porque CREATE DATABASE no puede ejecutarse
   desde dentro de la base que se quiere crear. */
import 'dotenv/config'
import pg from 'pg'

const nombre = process.env.PGDATABASE ?? 'uniguajira'

const cliente = new pg.Client({
  host:     process.env.PGHOST ?? 'localhost',
  port:     Number(process.env.PGPORT ?? 5432),
  user:     process.env.PGUSER ?? 'postgres',
  password: process.env.PGPASSWORD,
  database: 'postgres',
})

try {
  await cliente.connect()
  const { rows } = await cliente.query('SELECT 1 FROM pg_database WHERE datname = $1', [nombre])
  if (rows.length) {
    console.log('La base "' + nombre + '" ya existe.')
  } else {
    // El nombre viene de .env, no de la red; aun así lo citamos correctamente.
    await cliente.query('CREATE DATABASE "' + nombre.replace(/"/g, '""') + '"')
    console.log('Base "' + nombre + '" creada.')
  }
} catch (e) {
  console.error('No se pudo crear la base:', e.message)
  process.exitCode = 1
} finally {
  await cliente.end()
}
