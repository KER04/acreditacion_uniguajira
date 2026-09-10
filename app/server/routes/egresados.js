import { Router } from 'express'
import { readData, writeData } from '../utils/data.js'
import { requireAdmin } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = Router()
const FILE = 'egresados.json'

router.get('/', async (_req, res) => res.json(await readData(FILE) ?? {}))
router.put('/', requireAdmin, async (req, res) => { await writeData(FILE, req.body); res.json({ ok: true }) })

router.get('/destacados', async (_req, res) => { const d = await readData(FILE); res.json(d?.destacados ?? []) })
router.put('/destacados', requireAdmin, async (req, res) => {
  const d = await readData(FILE) ?? {}; await writeData(FILE, { ...d, destacados: req.body }); res.json({ ok: true })
})

router.get('/ofertas', async (_req, res) => { const d = await readData(FILE); res.json(d?.ofertas ?? []) })
router.put('/ofertas', requireAdmin, async (req, res) => {
  const d = await readData(FILE) ?? {}; await writeData(FILE, { ...d, ofertas: req.body }); res.json({ ok: true })
})

router.post('/foto', requireAdmin, upload.single('foto'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Sin archivo' })
  res.json({ url: `/images/egresados/${req.file.filename}` })
})

export default router
