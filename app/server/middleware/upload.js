import multer from 'multer'
import { join, extname } from 'path'
import { mkdirSync } from 'fs'
import { PUBLIC_DIR } from '../utils/data.js'

/* public/ del repo, o el volumen persistente si hay STORAGE_DIR. */
const PUBLIC = PUBLIC_DIR

const DEST_MAP = {
  'docente-foto':       join(PUBLIC, 'images/docentes'),
  'egresado-foto':      join(PUBLIC, 'images/egresados'),
  'noticia-imagen':     join(PUBLIC, 'images/noticias'),
  'general-imagen':     join(PUBLIC, 'images/general'),
  'estudiante-doc':     join(PUBLIC, 'docs/estudiantes'),
  'egresado-doc':       join(PUBLIC, 'docs/egresados'),
  'doc-general':        join(PUBLIC, 'docs/generales'),
}

function factorDocDest(tipo, factorId) {
  const num = String(factorId).padStart(2, '0')
  if (tipo === 'factor-presentacion') return join(PUBLIC, `presentaciones/factor-${num}`)
  return join(PUBLIC, `docs/factores/factor-${num}`)
}

/* Fija el destino cuando la ruta no lleva :tipo en la URL. Sin esto, multer
   caia en 'images/general' mientras el endpoint devolvia /docs/estudiantes/...,
   asi que el archivo se guardaba en un sitio y el enlace apuntaba a otro. */
export const fijarTipo = tipo => (req, _res, next) => { req.tipoSubida = tipo; next() }

const tipoDeSubida = req => req.tipoSubida ?? req.params?.tipo ?? req.query?.tipo ?? 'general-imagen'

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const tipo = tipoDeSubida(req)
    const factorId = req.query.factor
    let dest
    if ((tipo === 'factor-doc' || tipo === 'factor-presentacion') && factorId) {
      dest = factorDocDest(tipo, factorId)
    } else {
      dest = DEST_MAP[tipo] ?? join(PUBLIC, 'images/general')
    }
    mkdirSync(dest, { recursive: true })
    cb(null, dest)
  },
  filename(_req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`
    cb(null, `${unique}${extname(file.originalname)}`)
  },
})

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter(req, file, cb) {
    /* Las imagenes siguen permitidas para fotos de docentes y noticias; los
       documentos se limitan a lo que `documentos_estudiantes.tipo` acepta. */
    const esDocumento = String(tipoDeSubida(req)).endsWith('-doc')
    const permitidas = esDocumento
      ? /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip)$/i
      : /\.(jpg|jpeg|png|gif|webp|pdf|doc|docx|ppt|pptx|xls|xlsx|zip)$/i
    cb(null, permitidas.test(file.originalname))
  },
})
