import { Router } from 'express'
import { readData, writeData } from '../utils/data.js'
import { requireAdmin } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = Router()
const FILE = 'estudiantes.json'

router.get('/', async (_req, res) => res.json(await readData(FILE) ?? {}))
router.put('/', requireAdmin, async (req, res) => { await writeData(FILE, req.body); res.json({ ok: true }) })

const section = (key) => [
  async (_req, res) => { const d = await readData(FILE); res.json(d?.[key] ?? []) },
  requireAdmin,
  async (req, res) => { const d = await readData(FILE) ?? {}; await writeData(FILE, { ...d, [key]: req.body }); res.json({ ok: true }) },
]

router.get('/honor', section('honor')[0])
router.put('/honor', ...section('honor').slice(1))

router.get('/calendario', async (_req, res) => { const d = await readData(FILE); res.json(d?.calendario ?? []) })
router.put('/calendario', requireAdmin, async (req, res) => { const d = await readData(FILE) ?? {}; await writeData(FILE, { ...d, calendario: req.body }); res.json({ ok: true }) })

router.get('/modalidades', async (_req, res) => { const d = await readData(FILE); res.json(d?.modalidades_grado ?? []) })
router.put('/modalidades', requireAdmin, async (req, res) => { const d = await readData(FILE) ?? {}; await writeData(FILE, { ...d, modalidades_grado: req.body }); res.json({ ok: true }) })

router.get('/documentos', async (_req, res) => { const d = await readData(FILE); res.json(d?.documentos ?? []) })
router.put('/documentos', requireAdmin, async (req, res) => { const d = await readData(FILE) ?? {}; await writeData(FILE, { ...d, documentos: req.body }); res.json({ ok: true }) })

router.post('/upload-doc', requireAdmin, upload.single('archivo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Sin archivo' })
  res.json({ url: `/docs/estudiantes/${req.file.filename}` })
})

export default router
