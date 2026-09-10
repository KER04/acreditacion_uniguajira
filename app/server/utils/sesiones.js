/* Sesiones respaldadas en la base de datos.

   El navegador solo recibe un token aleatorio en una cookie httpOnly;
   en `sesiones` guardamos únicamente su SHA-256. Así, quien lea la tabla
   (un backup, un dump, un DBA) no puede suplantar a ningún usuario. */
import { randomBytes, createHash } from 'node:crypto'
import { query } from '../db/pool.js'

export const COOKIE = process.env.SESSION_COOKIE ?? 'ug_sesion'
const DIAS = Number(process.env.SESSION_DIAS ?? 7)
const DURACION_MS = DIAS * 24 * 60 * 60 * 1000

const hashToken = token => createHash('sha256').update(token).digest('hex')

export const opcionesCookie = () => ({
  httpOnly: true,                                   // invisible para document.cookie
  sameSite: 'lax',                                  // no viaja en peticiones de otros sitios
  secure: process.env.NODE_ENV === 'production',    // en local va sobre http
  path: '/',
  maxAge: DURACION_MS,
})

export async function crearSesion(usuarioId, { userAgent, ip } = {}) {
  const token = randomBytes(32).toString('base64url')
  const expira = new Date(Date.now() + DURACION_MS)
  await query(
    `INSERT INTO sesiones (usuario_id, token_hash, expira_en, user_agent, ip)
     VALUES ($1, $2, $3, $4, $5)`,
    [usuarioId, hashToken(token), expira, userAgent ?? null, ip ?? null],
  )
  return token
}

/* Devuelve el usuario dueño de la sesión, o null si el token no vale,
   caducó o la cuenta fue desactivada. */
export async function usuarioDeSesion(token) {
  if (!token) return null
  const { rows } = await query(
    `SELECT u.id, u.email, u.nombre, u.rol
       FROM sesiones s
       JOIN usuarios u ON u.id = s.usuario_id
      WHERE s.token_hash = $1
        AND s.expira_en > now()
        AND u.activo = TRUE`,
    [hashToken(token)],
  )
  return rows[0] ?? null
}

export async function cerrarSesion(token) {
  if (!token) return
  await query('DELETE FROM sesiones WHERE token_hash = $1', [hashToken(token)])
}

export async function limpiarExpiradas() {
  const { rowCount } = await query('DELETE FROM sesiones WHERE expira_en <= now()')
  return rowCount
}
