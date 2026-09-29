import { Router } from 'express'
import { query } from '../db/pool.js'
import { verifyPassword, hashPassword } from '../utils/password.js'
import {
  COOKIE, COOKIE_REFRESCO, opcionesCookie, opcionesCookieRefresco,
  opcionesBorrado, opcionesBorradoRefresco,
  abrirSesion, renovarSesion, cerrarSesion, cerrarTodas,
} from '../utils/sesiones.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

/* ─── Freno a la fuerza bruta ──────────────────────────────────────
   Contador en memoria por IP + correo. Se pierde al reiniciar el
   servidor, y con eso basta: solo busca encarecer el goteo de intentos. */
const MAX_INTENTOS = 5
const VENTANA_MS = 15 * 60 * 1000
const intentos = new Map()

function bloqueado(clave) {
  const reg = intentos.get(clave)
  if (!reg) return 0
  if (Date.now() - reg.desde > VENTANA_MS) { intentos.delete(clave); return 0 }
  if (reg.n < MAX_INTENTOS) return 0
  return Math.ceil((VENTANA_MS - (Date.now() - reg.desde)) / 1000)
}

function anotarFallo(clave) {
  const reg = intentos.get(clave)
  if (!reg || Date.now() - reg.desde > VENTANA_MS) intentos.set(clave, { n: 1, desde: Date.now() })
  else reg.n += 1
}

/* Hash de descarte: se verifica contra él cuando el correo no existe, para que
   una cuenta inexistente tarde lo mismo que una con contraseña equivocada y no
   se pueda deducir qué correos están registrados. */
const HASH_SEÑUELO = await hashPassword('contraseña-que-nadie-usa-jamas')

const publico = u => ({ id: u.id, email: u.email, nombre: u.nombre, rol: u.rol })

const meta = req => ({ userAgent: req.get('user-agent'), ip: req.ip })

function ponerCookies(res, { acceso, refresco, refrescoExpira }) {
  res.cookie(COOKIE, acceso, opcionesCookie())
  res.cookie(COOKIE_REFRESCO, refresco, opcionesCookieRefresco(refrescoExpira))
}

function quitarCookies(res) {
  res.clearCookie(COOKIE, opcionesBorrado())
  res.clearCookie(COOKIE_REFRESCO, opcionesBorradoRefresco())
}

/* POST /api/auth/login */
router.post('/login', async (req, res) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase()
  const password = String(req.body?.password ?? '')

  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' })
  }

  const clave = `${req.ip}:${email}`
  const espera = bloqueado(clave)
  if (espera) {
    return res.status(429).json({ error: `Demasiados intentos. Espera ${Math.ceil(espera / 60)} minuto(s).` })
  }

  const { rows } = await query(
    'SELECT id, email, nombre, rol, password_hash, activo FROM usuarios WHERE lower(email) = $1',
    [email],
  )
  const usuario = rows[0]

  const valida = usuario
    ? await verifyPassword(password, usuario.password_hash)
    : await verifyPassword(password, HASH_SEÑUELO)

  if (!usuario || !valida || !usuario.activo) {
    anotarFallo(clave)
    return res.status(401).json({ error: 'Credenciales incorrectas' })
  }

  intentos.delete(clave)
  const tokens = await abrirSesion(usuario.id, meta(req))
  await query('UPDATE usuarios SET ultimo_acceso = now() WHERE id = $1', [usuario.id])

  ponerCookies(res, tokens)
  res.json({ usuario: publico(usuario) })
})

/* POST /api/auth/refresh — cambia el refresco por un acceso y un refresco nuevos.

   El front lo llama cuando la API le responde 401: el acceso dura minutos y
   caduca a mitad de una jornada de edición sin que nadie haya cerrado nada.
     200 -> cookies nuevas puestas; repetir la petición que falló
     409 -> otra pestaña acaba de renovar; repetir sin más (la cookie ya llegó)
     401 -> hay que volver a iniciar sesión */
router.post('/refresh', async (req, res) => {
  /* Express 4 no captura rechazos async: sin esto una caída de la base dejaría
     la petición colgada, y el front esperando para siempre su renovación. */
  let r
  try {
    r = await renovarSesion(req.cookies?.[COOKIE_REFRESCO], meta(req))
  } catch (e) {
    console.error('[auth] no se pudo renovar la sesión:', e.message)
    return res.status(503).json({ error: 'No se pudo renovar la sesión. Intenta de nuevo.' })
  }
  if (r.estado === 'ok') {
    ponerCookies(res, r)
    return res.json({ usuario: publico(r.usuario) })
  }
  if (r.estado === 'reintentar') return res.status(409).json({ reintentar: true })
  quitarCookies(res)
  res.status(401).json({
    error: r.estado === 'robo'
      ? 'Tu sesión se usó desde otro lugar y se cerró por seguridad. Vuelve a iniciar sesión.'
      : 'Tu sesión caducó. Vuelve a iniciar sesión.',
  })
})

/* POST /api/auth/logout — cierra este login en todas sus pestañas. */
router.post('/logout', async (req, res) => {
  await cerrarSesion(req.cookies?.[COOKIE], req.cookies?.[COOKIE_REFRESCO])
  quitarCookies(res)
  res.json({ ok: true })
})

/* GET /api/auth/me — el front lo usa al montar para saber si sigue autenticado */
router.get('/me', (req, res) => {
  if (!req.usuario) return res.status(401).json({ error: 'Sin sesión' })
  res.json({ usuario: publico(req.usuario) })
})

/* POST /api/auth/password — cambio de contraseña del propio usuario */
router.post('/password', requireAuth, async (req, res) => {
  const actual = String(req.body?.actual ?? '')
  const nueva = String(req.body?.nueva ?? '')

  const { rows } = await query('SELECT password_hash FROM usuarios WHERE id = $1', [req.usuario.id])
  if (!rows[0] || !(await verifyPassword(actual, rows[0].password_hash))) {
    return res.status(401).json({ error: 'La contraseña actual no es correcta' })
  }
  try {
    const hash = await hashPassword(nueva)
    await query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [hash, req.usuario.id])
  } catch (e) {
    return res.status(400).json({ error: e.message })
  }
  // Cerrar el resto de sesiones obliga a volver a entrar en los demás dispositivos.
  await cerrarTodas(req.usuario.id)
  quitarCookies(res)
  res.json({ ok: true, mensaje: 'Contraseña actualizada. Vuelve a iniciar sesión.' })
})

export default router
