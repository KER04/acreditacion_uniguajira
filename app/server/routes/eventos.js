/* Módulo Eventos — respaldado por PostgreSQL.
 *
 * Sustituye la lectura/escritura de src/data/eventos.json.
 *
 * El estado temporal (próximo / en curso / pasado) NO se guarda: se deduce de
 * las fechas con `faseEvento()`. Persistirlo obligaría a que alguien lo fuera
 * cambiando a mano y la cartelera acabaría anunciando como próximo un evento
 * de hace tres meses. Solo se persiste lo que el calendario no puede saber:
 * que se canceló o se aplazó.
 */
import { Router } from 'express'
import { query } from '../db/pool.js'
import { requireAdmin } from '../middleware/auth.js'
import {
  enMemoria, guardarArchivo, borrarSiHuerfano, extensionDe,
  nombreOriginalUtf8, EXTENSIONES_IMAGEN, LIMITE_FOTO,
} from '../utils/archivos.js'
import {
  fallo, rechazaPorValidacion, camposDe, valorPara,
  sentenciaInsert, sentenciaUpdate,
} from '../utils/crud.js'

const router = Router()
const subidaImagen = enMemoria(LIMITE_FOTO)
const enlaceArchivo = id => '/api/archivos/' + id

const COLUMNAS = [
  'titulo', 'descripcion', 'categoria', 'fecha', 'fecha_fin',
  'hora', 'hora_fin', 'lugar', 'ponente', 'sede',
  'imagen_url', 'url_inscripcion', 'estado',
]

const NULAS = new Set(['fecha_fin', 'hora', 'hora_fin'])

const SEL = "id, titulo, descripcion, categoria, " +
  "to_char(fecha, 'YYYY-MM-DD') AS fecha, " +
  "to_char(fecha_fin, 'YYYY-MM-DD') AS fecha_fin, " +
  "to_char(hora, 'HH24:MI') AS hora, " +
  "to_char(hora_fin, 'HH24:MI') AS hora_fin, " +
  'lugar, ponente, sede, imagen_id, imagen_url, url_inscripcion, estado'

const MENSAJES = {
  evento_titulo_no_vacio:  'El título debe tener al menos 3 caracteres',
  evento_sede_valida:      'La sede debe ser ambas, riohacha o maicao',
  evento_categoria_valida: 'Categoría no válida',
  evento_estado_valido:    'El estado debe ser programado, cancelado o aplazado',
  evento_rango_coherente:  'El evento no puede terminar antes de empezar',
}

const conImagen = e => ({
  ...e,
  imagen_url: e.imagen_id ? enlaceArchivo(e.imagen_id) : (e.imagen_url ?? ''),
})

export async function leerEventos({ id = null } = {}) {
  const valores = []
  let where = ''
  if (id !== null) { valores.push(id); where = ' WHERE id = $1' }

  const { rows } = await query(
    'SELECT ' + SEL + ' FROM evento' + where + ' ORDER BY fecha DESC, id DESC',
    valores,
  )
  return rows.map(conImagen)
}

/* ─── Lectura ──────────────────────────────────────────────────── */

router.get('/', async (_req, res) => {
  try {
    res.json(await leerEventos())
  } catch (e) { fallo(res, e, MENSAJES, 'eventos') }
})

router.get('/:id(\\d+)', async (req, res) => {
  try {
    const [evento] = await leerEventos({ id: Number(req.params.id) })
    if (!evento) return res.status(404).json({ error: 'Evento no encontrado' })
    res.json(evento)
  } catch (e) { fallo(res, e, MENSAJES, 'eventos') }
})

/* ─── Escritura ────────────────────────────────────────────────── */

router.post('/', requireAdmin, async (req, res) => {
  if (rechazaPorValidacion('eventos', req, res, false)) return

  const campos = camposDe(COLUMNAS, req.body)
  if (!campos.length) return res.status(400).json({ error: 'No se recibió ningún dato' })

  try {
    const { rows } = await query(
      sentenciaInsert('evento', campos, SEL),
      campos.map(c => valorPara(c, req.body[c], NULAS)),
    )
    res.status(201).json(conImagen(rows[0]))
  } catch (e) { fallo(res, e, MENSAJES, 'eventos') }
})

router.patch('/:id(\\d+)', requireAdmin, async (req, res) => {
  if (rechazaPorValidacion('eventos', req, res, true)) return

  const campos = camposDe(COLUMNAS, req.body)
  if (!campos.length) return res.status(400).json({ error: 'Nada que actualizar' })

  try {
    const { rows } = await query(
      sentenciaUpdate('evento', campos, SEL),
      [req.params.id, ...campos.map(c => valorPara(c, req.body[c], NULAS))],
    )
    if (!rows.length) return res.status(404).json({ error: 'Evento no encontrado' })
    res.json(conImagen(rows[0]))
  } catch (e) { fallo(res, e, MENSAJES, 'eventos') }
})

router.delete('/:id(\\d+)', requireAdmin, async (req, res) => {
  try {
    const { rows } = await query('DELETE FROM evento WHERE id = $1 RETURNING imagen_id', [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Evento no encontrado' })
    await borrarSiHuerfano(rows[0].imagen_id)
    res.json({ ok: true })
  } catch (e) { fallo(res, e, MENSAJES, 'eventos') }
})

/* ─── Imagen ───────────────────────────────────────────────────── */

router.post('/:id(\\d+)/imagen', requireAdmin, (req, res, next) => {
  subidaImagen.single('imagen')(req, res, err => {
    if (err?.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'La imagen pasa del límite de 3 MB' })
    }
    err ? next(err) : next()
  })
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No llegó ninguna imagen' })
  if (!EXTENSIONES_IMAGEN.includes(extensionDe(nombreOriginalUtf8(req.file.originalname)))) {
    return res.status(400).json({ error: 'El archivo debe ser jpg, png o webp' })
  }

  try {
    const previa = await query('SELECT imagen_id FROM evento WHERE id = $1', [req.params.id])
    if (!previa.rows.length) return res.status(404).json({ error: 'Evento no encontrado' })

    const archivo = await guardarArchivo(req.file, { usuarioId: req.usuario?.id ?? null })
    const { rows } = await query(
      'UPDATE evento SET imagen_id = $2 WHERE id = $1 RETURNING ' + SEL,
      [req.params.id, archivo.id],
    )
    await borrarSiHuerfano(previa.rows[0].imagen_id)
    res.json(conImagen(rows[0]))
  } catch (e) { fallo(res, e, MENSAJES, 'eventos') }
})

router.delete('/:id(\\d+)/imagen', requireAdmin, async (req, res) => {
  try {
    const previa = await query('SELECT imagen_id FROM evento WHERE id = $1', [req.params.id])
    if (!previa.rows.length) return res.status(404).json({ error: 'Evento no encontrado' })

    const { rows } = await query(
      'UPDATE evento SET imagen_id = NULL WHERE id = $1 RETURNING ' + SEL,
      [req.params.id],
    )
    await borrarSiHuerfano(previa.rows[0].imagen_id)
    res.json(conImagen(rows[0]))
  } catch (e) { fallo(res, e, MENSAJES, 'eventos') }
})

export default router
