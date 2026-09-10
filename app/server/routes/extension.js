import { Router } from 'express'
import { readData, writeData } from '../utils/data.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()
const FILE = 'extension.json'

router.get('/', async (_req, res) => res.json(await readData(FILE) ?? {}))
router.put('/', requireAdmin, async (req, res) => { await writeData(FILE, req.body); res.json({ ok: true }) })

router.get('/proyectos', async (_req, res) => { const d = await readData(FILE); res.json(d?.proyectos ?? []) })
router.put('/proyectos', requireAdmin, async (req, res) => {
  const d = await readData(FILE) ?? {}; await writeData(FILE, { ...d, proyectos: req.body }); res.json({ ok: true })
})

router.get('/alianzas', async (_req, res) => { const d = await readData(FILE); res.json(d?.alianzas ?? []) })
router.put('/alianzas', requireAdmin, async (req, res) => {
  const d = await readData(FILE) ?? {}; await writeData(FILE, { ...d, alianzas: req.body }); res.json({ ok: true })
})

export default router
