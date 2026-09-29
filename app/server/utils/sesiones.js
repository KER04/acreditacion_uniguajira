/* Sesiones respaldadas en la base de datos: acceso corto + refresco rotativo.

   El navegador recibe dos tokens aleatorios, cada uno en su cookie httpOnly;
   en la base guardamos únicamente su SHA-256. Así, quien lea las tablas
   (un backup, un dump, un DBA) no puede suplantar a ningún usuario.

     · ACCESO   (`sesiones`)       — minutos. Viaja en cada petición a /api.
     · REFRESCO (`refresh_tokens`) — días. Solo viaja a /api/auth, y cada vez
       que se usa se cambia por uno nuevo (rotación).

   Todos los refrescos que salen de un mismo login forman una familia. Si llega
   uno que ya se había cambiado, hay una copia en otras manos: se revoca la
   familia entera. Ver migración 020. */
import { randomBytes, createHash, randomUUID } from 'node:crypto'
import { query, withTransaction } from '../db/pool.js'

export const COOKIE = process.env.SESSION_COOKIE ?? 'ug_sesion'
export const COOKIE_REFRESCO = process.env.REFRESH_COOKIE ?? 'ug_refresco'

const MINUTO = 60 * 1000
const DIA = 24 * 60 * MINUTO

/* Acceso: lo bastante corto para que una cookie copiada sirva poco. */
const ACCESO_MS = Number(process.env.SESSION_MINUTOS ?? 15) * MINUTO
/* Refresco: caduca tras estos días SIN USO; cada rotación reinicia la cuenta.
   SESSION_DIAS se respeta porque es la variable que ya traía el .env. */
const REFRESCO_MS = Number(process.env.REFRESH_DIAS ?? process.env.SESSION_DIAS ?? 7) * DIA
/* Tope absoluto desde el login: pasado esto se vuelve a pedir contraseña
   aunque el panel se use a diario. */
const FAMILIA_MS = Number(process.env.REFRESH_MAX_DIAS ?? 30) * DIA

/* Margen para refrescos simultáneos legítimos: dos pestañas del panel que
   caducan a la vez mandan el mismo refresco casi en el mismo instante. La
   segunda no es un robo; se le pide que reintente con la cookie que acaba de
   dejar la primera. Fuera de este margen, reutilizar sí es señal de copia. */
const GRACIA_MS = 30 * 1000

const hashToken = token => createHash('sha256').update(token).digest('hex')
const nuevoToken = () => randomBytes(32).toString('base64url')

const base = {
  httpOnly: true,                                   // invisible para document.cookie
  secure: process.env.NODE_ENV === 'production',    // en local va sobre http
}

export const opcionesCookie = () => ({
  ...base,
  sameSite: 'lax',                                  // no viaja en peticiones de otros sitios
  path: '/',
  maxAge: ACCESO_MS,
})

/* El refresco solo lo necesita /api/auth: con este `path` el navegador ni
   siquiera lo adjunta al resto de la API, así que no aparece en ningún log de
   peticiones corrientes. `strict` porque nunca hace falta desde otro sitio. */
export const opcionesCookieRefresco = expira => ({
  ...base,
  sameSite: 'strict',
  path: '/api/auth',
  expires: expira,
})

/* Para clearCookie: mismas opciones sin caducidad, o el navegador no la borra. */
export const opcionesBorrado = () => ({ ...opcionesCookie(), maxAge: undefined })
export const opcionesBorradoRefresco = () => ({ ...opcionesCookieRefresco(undefined), expires: undefined })

async function emitirAcceso(db, usuarioId, familia, { userAgent, ip } = {}) {
  const token = nuevoToken()
  await db.query(
    `INSERT INTO sesiones (usuario_id, token_hash, expira_en, user_agent, ip, familia)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [usuarioId, hashToken(token), new Date(Date.now() + ACCESO_MS), userAgent ?? null, ip ?? null, familia],
  )
  return token
}

async function emitirRefresco(db, usuarioId, familia, familiaExpira, { userAgent, ip } = {}) {
  const token = nuevoToken()
  const expira = new Date(Math.min(Date.now() + REFRESCO_MS, familiaExpira.getTime()))
  await db.query(
    `INSERT INTO refresh_tokens
       (usuario_id, familia, token_hash, expira_en, familia_expira_en, user_agent, ip)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [usuarioId, familia, hashToken(token), expira, familiaExpira, userAgent ?? null, ip ?? null],
  )
  return { token, expira }
}

async function revocarFamilia(db, familia) {
  await db.query(
    'UPDATE refresh_tokens SET revocado_en = now() WHERE familia = $1 AND revocado_en IS NULL', [familia])
  await db.query('DELETE FROM sesiones WHERE familia = $1', [familia])
}

/* Login: abre una familia nueva. Devuelve { acceso, refresco, refrescoExpira }. */
export async function abrirSesion(usuarioId, meta = {}) {
  return withTransaction(async db => {
    const familia = randomUUID()
    const familiaExpira = new Date(Date.now() + FAMILIA_MS)
    const refresco = await emitirRefresco(db, usuarioId, familia, familiaExpira, meta)
    const acceso = await emitirAcceso(db, usuarioId, familia, meta)
    return { acceso, refresco: refresco.token, refrescoExpira: refresco.expira }
  })
}

/* Cambia un refresco por un par nuevo. Devuelve { estado, ... }:
     'ok'         -> acceso, refresco, refrescoExpira, usuario
     'reintentar' -> otra petición acaba de rotarlo; la cookie nueva ya va en camino
     'robo'       -> se reutilizó uno ya cambiado; la familia queda revocada
     'invalido'   -> no existe, caducó, fue revocado o la cuenta está inactiva

   FOR UPDATE serializa dos refrescos del mismo token: el segundo espera a que
   el primero confirme y entonces ve `usado_en` relleno. */
export async function renovarSesion(refresco, meta = {}) {
  if (!refresco) return { estado: 'invalido' }
  return withTransaction(async db => {
    const { rows } = await db.query(
      `SELECT r.id, r.usuario_id, r.familia, r.expira_en, r.familia_expira_en,
              r.usado_en, r.revocado_en,
              u.email, u.nombre, u.rol, u.activo
         FROM refresh_tokens r
         JOIN usuarios u ON u.id = r.usuario_id
        WHERE r.token_hash = $1
        FOR UPDATE OF r`,
      [hashToken(refresco)],
    )
    const r = rows[0]
    if (!r || r.revocado_en) return { estado: 'invalido' }

    if (r.usado_en) {
      if (Date.now() - new Date(r.usado_en).getTime() < GRACIA_MS) return { estado: 'reintentar' }
      await revocarFamilia(db, r.familia)
      console.warn(`[auth] refresco reutilizado: familia ${r.familia} del usuario ${r.usuario_id} revocada`)
      return { estado: 'robo' }
    }

    if (new Date(r.expira_en) <= new Date() || !r.activo) return { estado: 'invalido' }

    await db.query('UPDATE refresh_tokens SET usado_en = now() WHERE id = $1', [r.id])
    const nuevo = await emitirRefresco(db, r.usuario_id, r.familia, new Date(r.familia_expira_en), meta)
    const acceso = await emitirAcceso(db, r.usuario_id, r.familia, meta)
    return {
      estado: 'ok',
      acceso,
      refresco: nuevo.token,
      refrescoExpira: nuevo.expira,
      usuario: { id: r.usuario_id, email: r.email, nombre: r.nombre, rol: r.rol },
    }
  })
}

/* Devuelve el usuario dueño de la sesión de acceso, o null si el token no
   vale, caducó o la cuenta fue desactivada. */
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

/* Logout: cierra la familia completa, no solo el acceso de esta pestaña. Se
   busca por cualquiera de los dos tokens porque el de acceso puede haber
   caducado ya y el refresco puede no haber llegado (otra ruta, otro path). */
export async function cerrarSesion(acceso, refresco) {
  await withTransaction(async db => {
    const familias = new Set()
    if (refresco) {
      const { rows } = await db.query('SELECT familia FROM refresh_tokens WHERE token_hash = $1', [hashToken(refresco)])
      if (rows[0]) familias.add(rows[0].familia)
    }
    if (acceso) {
      const { rows } = await db.query(
        'DELETE FROM sesiones WHERE token_hash = $1 RETURNING familia', [hashToken(acceso)])
      if (rows[0]?.familia) familias.add(rows[0].familia)
    }
    for (const f of familias) await revocarFamilia(db, f)
  })
}

/* Cambio de contraseña o cuenta comprometida: fuera de todos los dispositivos. */
export async function cerrarTodas(usuarioId) {
  await withTransaction(async db => {
    await db.query(
      'UPDATE refresh_tokens SET revocado_en = now() WHERE usuario_id = $1 AND revocado_en IS NULL', [usuarioId])
    await db.query('DELETE FROM sesiones WHERE usuario_id = $1', [usuarioId])
  })
}

/* Los refrescos ya rotados se conservan hasta que caduca su familia: son los
   que permiten reconocer una reutilización. Pasado el tope ya no sirven ni
   para eso. */
export async function limpiarExpiradas() {
  const { rowCount: accesos } = await query('DELETE FROM sesiones WHERE expira_en <= now()')
  const { rowCount: refrescos } = await query('DELETE FROM refresh_tokens WHERE familia_expira_en <= now()')
  return accesos + refrescos
}
