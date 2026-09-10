/* Servido de los archivos guardados en la base.
   Público a propósito: son los documentos y las fotos que el sitio muestra. */
import { Router } from 'express'
import { leerArchivo } from '../utils/archivos.js'

const router = Router()

async function servir(req, res, comoDescarga) {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Identificador de archivo inválido' })
  }

  const archivo = await leerArchivo(id)
  if (!archivo) return res.status(404).json({ error: 'Archivo no encontrado' })

  /* El nombre va en filename* (RFC 5987) porque puede llevar tildes. */
  const nombreCodificado = encodeURIComponent(archivo.nombre_original)
  res.setHeader('Content-Type', archivo.mime)
  res.setHeader('Content-Length', archivo.buffer.length)
  res.setHeader(
    'Content-Disposition',
    (comoDescarga ? 'attachment' : 'inline') + "; filename*=UTF-8''" + nombreCodificado,
  )
  /* El contenido de un id nunca cambia: se puede cachear de forma agresiva. */
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  res.send(archivo.buffer)
}

/* Ver en el navegador (PDF incrustado, imagen en un <img>). */
router.get('/:id', (req, res, next) => servir(req, res, false).catch(next))

/* Forzar la descarga con el nombre original. */
router.get('/:id/descargar', (req, res, next) => servir(req, res, true).catch(next))

export default router
