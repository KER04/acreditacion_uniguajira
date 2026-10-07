/* Guardado y lectura de archivos dentro de PostgreSQL, en base64.
 *
 * El binario no toca el disco: multer lo recibe en memoria y de ahí pasa a la
 * columna `archivos.contenido`. Se sirve de vuelta por /api/archivos/:id. */
import multer from 'multer'
import { query } from '../db/pool.js'

/* Límites pensados para guardar en base, no en disco: en base64 cada archivo
   ocupa un tercio más, y toda la fila viaja por memoria al leerla. */
export const LIMITE_DOCUMENTO = 10 * 1024 * 1024   // 10 MB
/* Documentos que sube el panel (reglamentos, actos, normativas): suelen ser
   escaneos largos. Solo para rutas con requireAdmin; lo que sube el público
   (hojas de vida) sigue con LIMITE_DOCUMENTO. */
export const LIMITE_DOCUMENTO_PANEL = 20 * 1024 * 1024   // 20 MB
export const LIMITE_FOTO = 3 * 1024 * 1024         //  3 MB

const MIME_POR_EXTENSION = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  zip: 'application/zip',
  jpg: 'image/jpeg', jpeg: 'image/jpeg',
  png: 'image/png', webp: 'image/webp', gif: 'image/gif',
}

export const EXTENSIONES_IMAGEN = ['jpg', 'jpeg', 'png', 'webp']

export const extensionDe = nombre => {
  const m = /\.([^.]+)$/.exec(String(nombre ?? ''))
  return m ? m[1].toLowerCase() : ''
}

export const mimeDe = nombre => MIME_POR_EXTENSION[extensionDe(nombre)] ?? 'application/octet-stream'

/* busboy entrega el nombre original en latin1; sin esto "Guía.pdf" llega
   como "GuÃ­a.pdf". Para nombres ASCII la conversión no cambia nada. */
export const nombreOriginalUtf8 = nombre => Buffer.from(String(nombre), 'latin1').toString('utf8')

/* multer en memoria: el buffer va directo a la base. */
export const enMemoria = limite => multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: limite },
})

/* Inserta el archivo y devuelve su ficha (sin el contenido). */
export async function guardarArchivo(file, { usuarioId = null } = {}) {
  const nombre = nombreOriginalUtf8(file.originalname)
  const { rows } = await query(
    `INSERT INTO archivos (nombre_original, extension, mime, bytes, contenido, subido_por)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, nombre_original, extension, mime, bytes, creado_en`,
    [
      nombre,
      extensionDe(nombre),
      mimeDe(nombre),
      file.size,
      file.buffer.toString('base64'),
      usuarioId,
    ],
  )
  return rows[0]
}

/* Devuelve { mime, nombre_original, bytes, buffer } o null si no existe. */
export async function leerArchivo(id) {
  const { rows } = await query(
    'SELECT nombre_original, mime, bytes, contenido FROM archivos WHERE id = $1',
    [id],
  )
  if (!rows[0]) return null
  const { nombre_original, mime, bytes, contenido } = rows[0]
  return { nombre_original, mime, bytes, buffer: Buffer.from(contenido, 'base64') }
}

/* Quién apunta a archivos.id, preguntándoselo al catálogo en vez de mantener
   una lista a mano.
 *
 * Esto no es un lujo: la lista se escribía a mano y cuando llegó la tabla
 * `docente` con su foto_id nadie la añadió, así que el barrido consideraba
 * huérfana toda foto de docente y la borraba a las 24 horas. Como la FK es
 * ON DELETE SET NULL, el borrado no fallaba: el docente simplemente se quedaba
 * sin foto y nadie se enteraba. Derivarlo del catálogo hace que cualquier
 * tabla futura quede cubierta el día que se crea su clave foránea. */
async function referenciasAArchivos() {
  const { rows } = await query(
    `SELECT c.conrelid::regclass::text AS tabla, a.attname AS columna
       FROM pg_constraint c
       JOIN unnest(c.conkey) WITH ORDINALITY AS k(attnum, ord) ON true
       JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.attnum
      WHERE c.contype = 'f'
        AND c.confrelid = 'archivos'::regclass`,
  )
  return rows
}

/* Subir un archivo y guardar el registro son dos pasos: si alguien sube algo en
   el formulario y luego no guarda, el adjunto queda sin dueño. Este barrido los
   retira pasadas unas horas, dejando margen para formularios a medio llenar. */
export async function borrarHuerfanosAntiguos(horas = 24) {
  const refs = await referenciasAArchivos()
  /* Sin referencias conocidas no se borra nada: es más seguro acumular
     adjuntos sueltos que vaciar la tabla por una consulta que no devolvió. */
  if (refs.length === 0) return 0

  const enUso = refs
    .map(r => `NOT EXISTS (SELECT 1 FROM ${r.tabla} WHERE ${r.columna} = a.id)`)
    .join('\n        AND ')

  const { rowCount } = await query(
    `DELETE FROM archivos a
      WHERE a.creado_en < now() - ($1 || ' hours')::interval
        AND ${enUso}`,
    [String(horas)],
  )
  return rowCount
}

/* Borra el archivo si ya no lo referencia nadie. Se llama al desvincularlo,
   para que la base no acumule adjuntos sueltos. */
export async function borrarSiHuerfano(id) {
  if (!id) return false
  const refs = await referenciasAArchivos()
  if (refs.length === 0) return false

  const suma = refs
    .map(r => `(SELECT COUNT(*) FROM ${r.tabla} WHERE ${r.columna} = $1)`)
    .join(' + ')

  const { rows } = await query(`SELECT ${suma} AS usos`, [id])
  if (Number(rows[0].usos) > 0) return false
  await query('DELETE FROM archivos WHERE id = $1', [id])
  return true
}
