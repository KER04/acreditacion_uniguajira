import { Router } from 'express'
import { readData, writeData } from '../utils/data.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()
const FILE = 'investigacion.json'

router.get('/', async (_req, res) => res.json(await readData(FILE) ?? {}))
router.put('/', requireAdmin, async (req, res) => { await writeData(FILE, req.body); res.json({ ok: true }) })

router.get('/grupos', async (_req, res) => { const d = await readData(FILE); res.json(d?.grupos ?? []) })
router.put('/grupos', requireAdmin, async (req, res) => {
  const d = await readData(FILE) ?? {}; await writeData(FILE, { ...d, grupos: req.body }); res.json({ ok: true })
})

router.get('/semilleros', async (_req, res) => { const d = await readData(FILE); res.json(d?.semilleros ?? []) })
router.put('/semilleros', requireAdmin, async (req, res) => {
  const d = await readData(FILE) ?? {}; await writeData(FILE, { ...d, semilleros: req.body }); res.json({ ok: true })
})

router.get('/proyectos', async (_req, res) => { const d = await readData(FILE); res.json(d?.proyectos ?? []) })
router.put('/proyectos', requireAdmin, async (req, res) => {
  const d = await readData(FILE) ?? {}; await writeData(FILE, { ...d, proyectos: req.body }); res.json({ ok: true })
})

export default router
