import { Router } from 'express'
import { readData, writeData } from '../utils/data.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()
const FILE = 'programa.json'

router.get('/', async (_req, res) => res.json(await readData(FILE) ?? {}))
router.put('/', requireAdmin, async (req, res) => { await writeData(FILE, req.body); res.json({ ok: true }) })

router.get('/inicio', async (_req, res) => { const d = await readData(FILE); res.json(d?.inicio ?? {}) })
router.put('/inicio', requireAdmin, async (req, res) => {
  const d = await readData(FILE) ?? {}; await writeData(FILE, { ...d, inicio: req.body }); res.json({ ok: true })
})

router.get('/pensum', async (_req, res) => { const d = await readData(FILE); res.json(d?.pensum ?? []) })
router.put('/pensum', requireAdmin, async (req, res) => {
  const d = await readData(FILE) ?? {}; await writeData(FILE, { ...d, pensum: req.body }); res.json({ ok: true })
})

router.get('/ficha', async (_req, res) => { const d = await readData(FILE); res.json(d?.ficha_tecnica ?? {}) })
router.put('/ficha', requireAdmin, async (req, res) => {
  const d = await readData(FILE) ?? {}; await writeData(FILE, { ...d, ficha_tecnica: req.body }); res.json({ ok: true })
})

export default router
