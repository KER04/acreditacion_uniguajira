import { Router } from 'express'
import { readData, writeData } from '../utils/data.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()
const FILE = 'internacionalizacion.json'

router.get('/', async (_req, res) => res.json(await readData(FILE) ?? {}))
router.put('/', requireAdmin, async (req, res) => { await writeData(FILE, req.body); res.json({ ok: true }) })

;['convenios', 'movilidad_estudiantil', 'movilidad_docente', 'redes'].forEach(key => {
  router.get(`/${key.replace('_', '-')}`, async (_req, res) => { const d = await readData(FILE); res.json(d?.[key] ?? []) })
  router.put(`/${key.replace('_', '-')}`, requireAdmin, async (req, res) => {
    const d = await readData(FILE) ?? {}; await writeData(FILE, { ...d, [key]: req.body }); res.json({ ok: true })
  })
})

export default router
