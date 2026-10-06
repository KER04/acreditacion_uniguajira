import { readFile, writeFile, access, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/* Lo que trae el repositorio. */
export const DATA_REPO_DIR = join(__dirname, '../../src/data')
export const PUBLIC_REPO_DIR = join(__dirname, '../../public')

/* STORAGE_DIR apunta a un disco persistente (el volumen de Railway). Sin él,
   todo se lee y escribe en el repo como siempre. Con él, lo que el panel
   escribe (los JSON y los archivos subidos) va al volumen y sobrevive a cada
   despliegue, porque el disco del contenedor se borra al redesplegar. */
const STORAGE_DIR = process.env.STORAGE_DIR
export const DATA_DIR = STORAGE_DIR ? join(STORAGE_DIR, 'data') : DATA_REPO_DIR
export const PUBLIC_DIR = STORAGE_DIR ? join(STORAGE_DIR, 'public') : PUBLIC_REPO_DIR

/* Si el volumen todavía no tiene el archivo (nadie lo ha editado desde el
   panel), se usa la copia del repo. La primera escritura lo crea en el volumen
   y desde entonces manda esa. */
export async function readData(filename) {
  const rutas = DATA_DIR === DATA_REPO_DIR
    ? [join(DATA_DIR, filename)]
    : [join(DATA_DIR, filename), join(DATA_REPO_DIR, filename)]
  for (const ruta of rutas) {
    try {
      return JSON.parse(await readFile(ruta, 'utf-8'))
    } catch {}
  }
  return null
}

export async function writeData(filename, data) {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf-8')
}

export async function fileExists(path) {
  try { await access(path); return true } catch { return false }
}
