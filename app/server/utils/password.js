/* Hash de contraseñas con scrypt, que viene en el core de Node.
   No añadimos bcrypt como dependencia: scrypt es memory-hard y está
   recomendado por OWASP, y así hay una pieza menos que mantener.

   Formato almacenado:  scrypt$N$r$p$salt_base64$hash_base64
   Guardar los parámetros junto al hash permite subirlos más adelante
   sin invalidar las contraseñas que ya existen. */
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const derivar = promisify(scrypt)

const N = 32_768   // coste de CPU/memoria (2^15)
const R = 8        // tamaño de bloque
const P = 1        // paralelismo
const LARGO = 64   // bytes de la clave derivada
const MAXMEM = 128 * N * R * 2   // scrypt necesita 128*N*r; damos margen

export async function hashPassword(plana) {
  if (typeof plana !== 'string' || plana.length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres')
  }
  const salt = randomBytes(16)
  const clave = await derivar(plana, salt, LARGO, { N, r: R, p: P, maxmem: MAXMEM })
  return ['scrypt', N, R, P, salt.toString('base64'), clave.toString('base64')].join('$')
}

export async function verifyPassword(plana, almacenado) {
  try {
    const [algo, n, r, p, saltB64, claveB64] = String(almacenado).split('$')
    if (algo !== 'scrypt') return false

    const salt = Buffer.from(saltB64, 'base64')
    const esperada = Buffer.from(claveB64, 'base64')
    const calculada = await derivar(plana, salt, esperada.length, {
      N: Number(n), r: Number(r), p: Number(p), maxmem: MAXMEM,
    })
    // Comparación en tiempo constante: no filtra cuántos bytes coincidían.
    return timingSafeEqual(calculada, esperada)
  } catch {
    return false
  }
}
