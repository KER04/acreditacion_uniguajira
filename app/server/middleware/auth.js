/* Autenticación por cookie de sesión.

   Antes esto comparaba un token quemado ('sistemas2024') que además viajaba
   dentro del bundle del cliente. Ahora la identidad sale de la tabla `sesiones`. */
import { COOKIE, usuarioDeSesion } from '../utils/sesiones.js'

/* Deja req.usuario listo cuando hay sesión válida. Nunca corta la petición:
   los endpoints públicos siguen funcionando para visitantes anónimos. */
export async function cargarUsuario(req, _res, next) {
  try {
    req.usuario = await usuarioDeSesion(req.cookies?.[COOKIE])
  } catch (e) {
    console.error('[auth] no se pudo resolver la sesión:', e.message)
    req.usuario = null
  }
  next()
}

export function requireAuth(req, res, next) {
  if (req.usuario) return next()
  res.status(401).json({ error: 'Necesitas iniciar sesión' })
}

export function requireRol(...roles) {
  return (req, res, next) => {
    if (!req.usuario) return res.status(401).json({ error: 'Necesitas iniciar sesión' })
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' })
    }
    next()
  }
}

/* Se mantiene el nombre porque lo importan los 11 routers que todavía no
   están migrados a la base de datos. */
export const requireAdmin = requireRol('admin')
