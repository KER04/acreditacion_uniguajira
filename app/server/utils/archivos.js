/* Guardado y lectura de archivos dentro de PostgreSQL, en base64.
 *
 * El binario no toca el disco: multer lo recibe en memoria y de ahí pasa a la
 * columna `archivos.contenido`. Se sirve de vuelta por /api/archivos/:id. */
import multer from 'multer'
import { query } from '../db/pool.js'

/* Límites pensados para guardar en base, no en disco: en base64 cada archivo
   ocupa un tercio más, y toda la fila viaja por memoria al leerla. */
export const LIMITE_DOCUMENTO = 10 * 1024 * 1024   // 10 MB
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

/* Subir un archivo y guardar el registro son dos pasos: si alguien sube algo en
   el formulario y luego no guarda, el adjunto queda sin dueño. Este barrido los
   retira pasadas unas horas, dejando margen para formularios a medio llenar. */
export async function borrarHuerfanosAntiguos(horas = 24) {
  const { rowCount } = await query(
    `DELETE FROM archivos a
      WHERE a.creado_en < now() - ($1 || ' hours')::interval
        AND NOT EXISTS (SELECT 1 FROM documentos_estudiantes d WHERE d.archivo_id = a.id)
        AND NOT EXISTS (SELECT 1 FROM documentos_honor      h WHERE h.archivo_id = a.id)
        AND NOT EXISTS (SELECT 1 FROM cuadro_honor          c WHERE c.foto_id    = a.id)`,
    [String(horas)],
  )
  return rowCount
}

/* Borra el archivo si ya no lo referencia nadie. Se llama al desvincularlo,
   para que la base no acumule adjuntos sueltos. */
export async function borrarSiHuerfano(id) {
  if (!id) return false
  const { rows } = await query(
    `SELECT
       (SELECT COUNT(*) FROM documentos_estudiantes WHERE archivo_id = $1) +
       (SELECT COUNT(*) FROM documentos_honor       WHERE archivo_id = $1) +
       (SELECT COUNT(*) FROM cuadro_honor           WHERE foto_id    = $1) AS usos`,
    [id],
  )
  if (Number(rows[0].usos) > 0) return false
  await query('DELETE FROM archivos WHERE id = $1', [id])
  return true
}
