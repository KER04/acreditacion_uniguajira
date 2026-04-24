import multer from 'multer'
import { join, extname, dirname } from 'path'
import { fileURLToPath } from 'url'
import { mkdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(__dirname, '../../public')

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

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const tipo = req.params.tipo ?? req.query.tipo ?? 'general-imagen'
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
  fileFilter(_req, file, cb) {
    const ok = /\.(jpg|jpeg|png|gif|webp|pdf|doc|docx|ppt|pptx|xls|xlsx|zip)$/i.test(file.originalname)
    cb(null, ok)
  },
})
