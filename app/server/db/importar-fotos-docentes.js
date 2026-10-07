/* Carga en bloque las fotos de los docentes.
 *
 *   node server/db/importar-fotos-docentes.js <carpeta> [--simular] [--reemplazar]
 *
 * La carpeta trae las fotos ya procesadas (cuadradas, en webp) y un
 * manifiesto.json con la lista [{ docente, archivo }]. Las fotos no se versionan:
 * son datos personales y pesan, así que viven fuera del repositorio y este
 * script es lo único que se guarda con el código.
 *
 * El docente se identifica por su NOMBRE, sin tildes ni mayúsculas, y no por
 * id: los ids de la base local y los de producción no coinciden.
 *
 * Por defecto no toca a quien ya tenga foto (pudo subirla él mismo desde el
 * panel); --reemplazar la sustituye. --simular solo informa qué haría.
 * Mismo resultado que subir la foto desde el panel: se guarda en `archivos` y
 * la anterior, si queda sin dueño, se borra.
 */
import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pool, query } from './pool.js'
import { guardarArchivo, borrarSiHuerfano, LIMITE_FOTO, EXTENSIONES_IMAGEN, extensionDe } from '../utils/archivos.js'

const args = process.argv.slice(2)
const CARPETA = args.find(a => !a.startsWith('--'))
const SIMULAR = args.includes('--simular')
const REEMPLAZAR = args.includes('--reemplazar')

if (!CARPETA) {
  console.error('Uso: node server/db/importar-fotos-docentes.js <carpeta> [--simular] [--reemplazar]')
  process.exit(1)
}

const clave = s => String(s ?? '')
  .normalize('NFD').replace(/\p{M}/gu, '')
  .toLowerCase().replace(/\s+/g, ' ').trim()

async function main() {
  const manifiesto = JSON.parse(readFileSync(join(CARPETA, 'manifiesto.json'), 'utf-8'))
  const { rows } = await query('SELECT id, nombre, foto_id FROM docente')
  const porNombre = new Map(rows.map(d => [clave(d.nombre), d]))

  const cuenta = { cargadas: 0, reemplazadas: 0, conFoto: 0, sinDocente: 0, invalidas: 0 }

  for (const { docente, archivo } of manifiesto) {
    const d = porNombre.get(clave(docente))
    if (!d) { cuenta.sinDocente++; console.log('  sin docente   ', docente); continue }
    if (d.foto_id && !REEMPLAZAR) { cuenta.conFoto++; console.log('  ya tiene foto ', d.nombre); continue }

    const buffer = readFileSync(join(CARPETA, archivo))
    if (!EXTENSIONES_IMAGEN.includes(extensionDe(archivo)) || buffer.length > LIMITE_FOTO) {
      cuenta.invalidas++; console.log('  no válida     ', archivo); continue
    }

    if (!SIMULAR) {
      /* Nombre ASCII: guardarArchivo lo reinterpreta como latin1 (así llega
         de multer), y con tildes quedaría mal escrito en la base. */
      const guardado = await guardarArchivo({ originalname: 'foto-' + archivo, size: buffer.length, buffer })
      await query('UPDATE docente SET foto_id = $2 WHERE id = $1', [d.id, guardado.id])
      if (d.foto_id) await borrarSiHuerfano(d.foto_id)
    }
    if (d.foto_id) cuenta.reemplazadas++; else cuenta.cargadas++
    console.log('  ' + (d.foto_id ? 'reemplazada   ' : 'cargada       '), d.nombre)
  }

  console.log((SIMULAR ? '\n[simulación] ' : '\n') +
    `${cuenta.cargadas} cargadas, ${cuenta.reemplazadas} reemplazadas, ` +
    `${cuenta.conFoto} omitidas por tener ya foto, ${cuenta.sinDocente} sin docente, ${cuenta.invalidas} no válidas.`)
}

main()
  .catch(e => { console.error('Error:', e.message); process.exitCode = 1 })
  .finally(() => pool.end())
