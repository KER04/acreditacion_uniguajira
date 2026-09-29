/* Peticiones a la API que sobreviven a la caducidad del token de acceso.

   El acceso dura minutos (ver server/utils/sesiones.js). Cuando caduca, la API
   responde 401 aunque el editor siga trabajando; aquí se renueva con el token
   de refresco —que JavaScript no ve: va en una cookie httpOnly— y se repite la
   petición una vez. Quien llama no se entera.

   Si la renovación también falla, la sesión terminó de verdad: se avisa con el
   evento EVENTO_CADUCADA para que el panel vuelva al login en vez de seguir
   mostrando formularios que ya no pueden guardar. */

export const EVENTO_CADUCADA = 'ug:sesion-caducada'

/* Una sola renovación en vuelo. Al abrir una pestaña del panel salen varias
   peticiones a la vez; si todas caducaron y cada una renovara por su cuenta,
   la segunda presentaría un refresco ya cambiado y el servidor lo tomaría por
   un robo. */
let enCurso = null

export function renovarSesion() {
  enCurso ??= fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
    .then(async res => {
      // 409: otra pestaña acaba de renovar y la cookie nueva ya está puesta.
      if (res.ok || res.status === 409) return true
      if (res.status === 401) {
        const cuerpo = await res.json().catch(() => ({}))
        window.dispatchEvent(new CustomEvent(EVENTO_CADUCADA, { detail: cuerpo.error ?? null }))
      }
      return false
    })
    .catch(() => false)
    .finally(() => { enCurso = null })
  return enCurso
}

/* Rutas donde un 401 no es sesión caducada: en el login y en el cambio de
   contraseña es una contraseña mala, y renovar desde /refresh o /logout no
   tiene sentido. /me sí entra: es lo primero que se pide al volver al panel. */
const SIN_RENOVAR = ['/api/auth/login', '/api/auth/refresh', '/api/auth/logout', '/api/auth/password']

/* fetch con la cookie de sesión y un reintento tras renovar. El cuerpo se
   puede reenviar tal cual (cadena o FormData). */
export async function fetchApi(url, opciones = {}) {
  const init = { credentials: 'include', ...opciones }
  const res = await fetch(url, init)
  if (res.status !== 401 || SIN_RENOVAR.some(r => url.startsWith(r))) return res
  if (!(await renovarSesion())) return res
  return fetch(url, init)
}
