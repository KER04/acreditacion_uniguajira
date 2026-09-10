import { Router } from 'express'
import { readData, writeData } from '../utils/data.js'
import { requireAdmin } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = Router()
const FILE = 'docentes.json'

router.get('/', async (_req, res) => res.json(await readData(FILE) ?? []))

router.put('/', requireAdmin, async (req, res) => {
  await writeData(FILE, req.body); res.json({ ok: true })
})

router.post('/', requireAdmin, async (req, res) => {
  const list = await readData(FILE) ?? []
  const item = { ...req.body, id: Date.now() }
  list.push(item); await writeData(FILE, list); res.json(item)
})

router.put('/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id)
  let list = await readData(FILE) ?? []
  list = list.map(i => i.id === id ? { ...i, ...req.body } : i)
  await writeData(FILE, list); res.json({ ok: true })
})

router.delete('/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id)
  let list = await readData(FILE) ?? []
  await writeData(FILE, list.filter(i => i.id !== id)); res.json({ ok: true })
})

router.post('/foto/:id', requireAdmin, upload.single('foto'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' })
  const url = `/images/docentes/${req.file.filename}`
  const id = Number(req.params.id)
  let list = await readData(FILE) ?? []
  list = list.map(i => i.id === id ? { ...i, foto_url: url } : i)
  await writeData(FILE, list)
  res.json({ url })
})

export default router
