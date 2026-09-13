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

/* El pensum se fue a PostgreSQL en la migración 008 y lo sirve /api/pensum.
   Aquí había un GET y un PUT sobre programa.json que ya no usa nadie; dejarlos
   vivos significaba tener dos sitios donde escribir la malla y que el panel
   pudiera guardar en el equivocado. La clave `pensum` que queda dentro de
   programa.json es el histórico previo a la migración. */

/* Ficha institucional editable desde TabPrograma.
   No se puede usar el PUT de '/' para esto: aquel reemplaza el archivo entero
   y el panel solo envía cinco campos, así que se llevaría por delante 'inicio'
   y 'pensum'. Aquí se fusiona campo a campo y se traducen los nombres que usa
   el panel (perfilEgresado, ficha) a los del archivo (perfil_egresado,
   ficha_tecnica), que son los que lee /api/all. */
router.put('/info', requireAdmin, async (req, res) => {
  const { mision, vision, objetivos, perfilEgresado, ficha } = req.body ?? {}
  const d = await readData(FILE) ?? {}
  await writeData(FILE, {
    ...d,
    ...(mision         !== undefined && { mision }),
    ...(vision         !== undefined && { vision }),
    ...(objetivos      !== undefined && { objetivos }),
    ...(perfilEgresado !== undefined && { perfil_egresado: perfilEgresado }),
    ...(ficha          !== undefined && { ficha_tecnica: { ...d.ficha_tecnica, ...ficha } }),
  })
  res.json({ ok: true })
})

router.get('/ficha', async (_req, res) => { const d = await readData(FILE); res.json(d?.ficha_tecnica ?? {}) })
router.put('/ficha', requireAdmin, async (req, res) => {
  const d = await readData(FILE) ?? {}; await writeData(FILE, { ...d, ficha_tecnica: req.body }); res.json({ ok: true })
})

export default router
