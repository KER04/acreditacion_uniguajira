import { Router } from 'express'
import { readData, writeData } from '../utils/data.js'
import { requireAdmin } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = Router()
const FILE = 'acreditacion.json'

router.get('/', async (_req, res) => res.json(await readData(FILE) ?? {}))

router.put('/', requireAdmin, async (req, res) => {
  await writeData(FILE, req.body); res.json({ ok: true })
})

/* Factores */
router.get('/factores', async (_req, res) => {
  const d = await readData(FILE)
  res.json(d?.factores ?? [])
})

router.put('/factores', requireAdmin, async (req, res) => {
  const d = await readData(FILE) ?? {}
  await writeData(FILE, { ...d, factores: req.body })
  res.json({ ok: true })
})

router.put('/factores/:n', requireAdmin, async (req, res) => {
  const n = Number(req.params.n)
  const d = await readData(FILE) ?? {}
  const factores = (d.factores ?? []).map(f => f.n === n ? { ...f, ...req.body } : f)
  await writeData(FILE, { ...d, factores })
  res.json({ ok: true })
})

/* Cronograma */
router.get('/cronograma', async (_req, res) => {
  const d = await readData(FILE)
  res.json(d?.cronograma ?? [])
})

router.put('/cronograma', requireAdmin, async (req, res) => {
  const d = await readData(FILE) ?? {}
  await writeData(FILE, { ...d, cronograma: req.body })
  res.json({ ok: true })
})

/* Equipo general */
router.get('/equipo', async (_req, res) => {
  const d = await readData(FILE)
  res.json(d?.equipo ?? [])
})

router.put('/equipo', requireAdmin, async (req, res) => {
  const d = await readData(FILE) ?? {}
  await writeData(FILE, { ...d, equipo: req.body })
  res.json({ ok: true })
})

/* Evidencias centrales */
router.get('/evidencias', async (_req, res) => {
  const d = await readData(FILE)
  res.json(d?.evidencias ?? [])
})

router.put('/evidencias', requireAdmin, async (req, res) => {
  const d = await readData(FILE) ?? {}
  await writeData(FILE, { ...d, evidencias: req.body })
  res.json({ ok: true })
})

/* Upload: doc o presentación de factor */
router.post('/upload', requireAdmin, upload.single('archivo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Sin archivo' })
  const tipo = req.query.tipo ?? 'factor-doc'
  const n = String(req.query.factor ?? '01').padStart(2, '0')
  const folder = tipo === 'factor-presentacion' ? 'presentaciones' : 'docs/factores'
  const url = `/${folder}/factor-${n}/${req.file.filename}`
  res.json({ url })
})

export default router
