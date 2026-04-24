import { Router } from 'express'
import { readData, writeData } from '../utils/data.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()
const FILE = 'sedes.json'

router.get('/', async (_req, res) => res.json(await readData(FILE) ?? {}))
router.put('/', requireAdmin, async (req, res) => { await writeData(FILE, req.body); res.json({ ok: true }) })

router.get('/:sede', async (req, res) => {
  const d = await readData(FILE)
  res.json(d?.[req.params.sede] ?? {})
})

router.put('/:sede', requireAdmin, async (req, res) => {
  const d = await readData(FILE) ?? {}
  await writeData(FILE, { ...d, [req.params.sede]: req.body })
  res.json({ ok: true })
})

export default router
