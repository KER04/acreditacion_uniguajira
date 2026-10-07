/* Módulo Convocatorias — respaldado por PostgreSQL.
 *
 * Sustituye la lectura/escritura de src/data/convocatorias.json.
 *
 * A diferencia de los eventos, aquí el estado SÍ se guarda. No es un descuido:
 * la dirección puede cerrar una convocatoria antes de la fecha prevista o
 * dejarla abierta unos días más, y eso no se deduce del calendario. Lo que sí
 * se deduce —si ya pasó el cierre— viaja aparte en `vencida`, para que la
 * vista pueda avisar sin que nadie tenga que editar nada.
 *
 * Los requisitos son un arreglo nativo, igual que en modalidades_grado:
 * siempre se leen y se escriben enteros junto a su convocatoria.
 *
 * Las fotos (migración 033) viajan dentro de cada convocatoria como `fotos`,
 * ya en orden: la primera es el afiche. Se suben, se ordenan y se borran por
 * sus propias rutas, como la imagen de una noticia.
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
/* Un afiche exportado desde el diseño suele pasar de 3 MB; 6 MB da margen sin
   dejar entrar fotos de cámara sin comprimir. */
const LIMITE_AFICHE = 2 * LIMITE_FOTO
const MAX_FOTOS_POR_ENVIO = 12
const subidaFotos = enMemoria(LIMITE_AFICHE)

const COLUMNAS = [
  'titulo', 'descripcion', 'categoria', 'estado',
  'fecha_apertura', 'fecha_cierre', 'dirigida_a', 'sede',
  'requisitos', 'url_postulacion', 'documento_url',
]

const NULAS = new Set(['fecha_apertura', 'fecha_cierre'])

const SEL = 'id, titulo, descripcion, categoria, estado, ' +
  "to_char(fecha_apertura, 'YYYY-MM-DD') AS fecha_apertura, " +
  "to_char(fecha_cierre, 'YYYY-MM-DD') AS fecha_cierre, " +
  'dirigida_a, sede, requisitos, url_postulacion, documento_url'

const MENSAJES = {
  convocatoria_titulo_no_vacio:  'El título debe tener al menos 3 caracteres',
  convocatoria_sede_valida:      'La sede debe ser ambas, riohacha o maicao',
  convocatoria_categoria_valida: 'Categoría no válida',
  convocatoria_estado_valido:    'El estado debe ser Abierta, Próxima o Cerrada',
  convocatoria_rango_coherente:  'El cierre no puede ser anterior a la apertura',
}

/* `vencida` es derivado, no una columna: dice si la fecha de cierre ya pasó.
   Permite que el portal marque una convocatoria caducada aunque su estado
   siga diciendo "Abierta" porque nadie la ha actualizado. */
const conVigencia = c => ({
  ...c,
  requisitos: c.requisitos ?? [],
  vencida: Boolean(c.fecha_cierre) && c.fecha_cierre < new Date().toISOString().slice(0, 10),
})

/* Las fotos se agregan en la misma consulta: una sola ida a la base aunque
   haya treinta convocatorias. */
const SEL_FOTOS = `coalesce((
    SELECT json_agg(json_build_object(
             'id', f.id, 'url', '/api/archivos/' || f.archivo_id, 'pie', f.pie
           ) ORDER BY f.orden, f.id)
      FROM convocatoria_foto f
     WHERE f.convocatoria_id = convocatoria.id
  ), '[]'::json) AS fotos`

export async function leerConvocatorias({ id = null } = {}) {
  const valores = []
  let where = ''
  if (id !== null) { valores.push(id); where = ' WHERE id = $1' }

  const { rows } = await query(
    'SELECT ' + SEL + ', ' + SEL_FOTOS + ' FROM convocatoria' + where +
    ' ORDER BY fecha_cierre ASC NULLS LAST, id DESC',
    valores,
  )
  return rows.map(conVigencia)
}

/* Tras tocar las fotos se devuelve la convocatoria entera: el panel la
   reemplaza tal cual, sin recomponer el orden por su cuenta. */
const releer = async id => (await leerConvocatorias({ id: Number(id) }))[0]

/* ─── Lectura ──────────────────────────────────────────────────── */

router.get('/', async (_req, res) => {
  try {
    res.json(await leerConvocatorias())
  } catch (e) { fallo(res, e, MENSAJES, 'convocatorias') }
})

router.get('/:id(\\d+)', async (req, res) => {
  try {
    const [convocatoria] = await leerConvocatorias({ id: Number(req.params.id) })
    if (!convocatoria) return res.status(404).json({ error: 'Convocatoria no encontrada' })
    res.json(convocatoria)
  } catch (e) { fallo(res, e, MENSAJES, 'convocatorias') }
})

/* ─── Escritura ────────────────────────────────────────────────── */

router.post('/', requireAdmin, async (req, res) => {
  if (rechazaPorValidacion('convocatorias', req, res, false)) return

  const campos = camposDe(COLUMNAS, req.body)
  if (!campos.length) return res.status(400).json({ error: 'No se recibió ningún dato' })

  try {
    const { rows } = await query(
      sentenciaInsert('convocatoria', campos, SEL),
      campos.map(c => valorPara(c, req.body[c], NULAS)),
    )
    res.status(201).json(conVigencia({ ...rows[0], fotos: [] }))
  } catch (e) { fallo(res, e, MENSAJES, 'convocatorias') }
})

router.patch('/:id(\\d+)', requireAdmin, async (req, res) => {
  if (rechazaPorValidacion('convocatorias', req, res, true)) return

  const campos = camposDe(COLUMNAS, req.body)
  if (!campos.length) return res.status(400).json({ error: 'Nada que actualizar' })

  try {
    const { rows } = await query(
      sentenciaUpdate('convocatoria', campos, SEL),
      [req.params.id, ...campos.map(c => valorPara(c, req.body[c], NULAS))],
    )
    if (!rows.length) return res.status(404).json({ error: 'Convocatoria no encontrada' })
    res.json(await releer(req.params.id))
  } catch (e) { fallo(res, e, MENSAJES, 'convocatorias') }
})

router.delete('/:id(\\d+)', requireAdmin, async (req, res) => {
  try {
    /* Las filas de foto caen en cascada; sus archivos hay que soltarlos a
       mano porque la tabla `archivos` la comparten todos los módulos. */
    const { rows: fotos } = await query(
      'SELECT archivo_id FROM convocatoria_foto WHERE convocatoria_id = $1', [req.params.id])
    const { rowCount } = await query('DELETE FROM convocatoria WHERE id = $1', [req.params.id])
    if (!rowCount) return res.status(404).json({ error: 'Convocatoria no encontrada' })
    for (const f of fotos) await borrarSiHuerfano(f.archivo_id)
    res.json({ ok: true })
  } catch (e) { fallo(res, e, MENSAJES, 'convocatorias') }
})

/* ─── Fotos ────────────────────────────────────────────────────── */

/* Varias a la vez: quien sube las fotos de un evento las elige todas juntas.
   Se añaden al final, así que en una convocatoria sin fotos la primera que
   se sube queda como afiche. */
router.post('/:id(\\d+)/fotos', requireAdmin, (req, res, next) => {
  subidaFotos.array('fotos', MAX_FOTOS_POR_ENVIO)(req, res, err => {
    if (err?.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Alguna imagen pasa del límite de 6 MB' })
    }
    if (err?.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: `Se pueden subir hasta ${MAX_FOTOS_POR_ENVIO} fotos a la vez` })
    }
    err ? next(err) : next()
  })
}, async (req, res) => {
  const archivos = req.files ?? []
  if (!archivos.length) return res.status(400).json({ error: 'No llegó ninguna imagen' })
  const invalida = archivos.find(f => !EXTENSIONES_IMAGEN.includes(extensionDe(nombreOriginalUtf8(f.originalname))))
  if (invalida) {
    return res.status(400).json({ error: `«${nombreOriginalUtf8(invalida.originalname)}» no es jpg, png o webp` })
  }

  try {
    const existe = await query('SELECT 1 FROM convocatoria WHERE id = $1', [req.params.id])
    if (!existe.rows.length) return res.status(404).json({ error: 'Convocatoria no encontrada' })

    const { rows: [{ siguiente }] } = await query(
      'SELECT coalesce(max(orden) + 1, 0) AS siguiente FROM convocatoria_foto WHERE convocatoria_id = $1',
      [req.params.id])
    let orden = Number(siguiente)
    for (const file of archivos) {
      const archivo = await guardarArchivo(file, { usuarioId: req.usuario?.id ?? null })
      await query(
        'INSERT INTO convocatoria_foto (convocatoria_id, archivo_id, orden) VALUES ($1, $2, $3)',
        [req.params.id, archivo.id, orden++])
    }
    res.status(201).json(await releer(req.params.id))
  } catch (e) { fallo(res, e, MENSAJES, 'convocatorias') }
})

/* Reordenar de una vez, como las tarjetas: el panel manda la lista completa.
   Una por una dejaría dos fotos compartiendo posición si una fallara. */
router.put('/:id(\\d+)/fotos/orden', requireAdmin, async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(Number) : null
  if (!ids || ids.some(n => !Number.isInteger(n) || n <= 0)) {
    return res.status(400).json({ error: 'Se esperaba la lista de fotos en orden' })
  }
  try {
    await query(
      `UPDATE convocatoria_foto AS f
          SET orden = n.pos
         FROM unnest($2::int[]) WITH ORDINALITY AS n(id, pos)
        WHERE f.id = n.id AND f.convocatoria_id = $1`,
      [req.params.id, ids],
    )
    const convocatoria = await releer(req.params.id)
    if (!convocatoria) return res.status(404).json({ error: 'Convocatoria no encontrada' })
    res.json(convocatoria)
  } catch (e) { fallo(res, e, MENSAJES, 'convocatorias') }
})

router.patch('/fotos/:fotoId(\\d+)', requireAdmin, async (req, res) => {
  const pie = String(req.body?.pie ?? '').trim().slice(0, 300)
  try {
    const { rows } = await query(
      'UPDATE convocatoria_foto SET pie = $2 WHERE id = $1 RETURNING convocatoria_id',
      [req.params.fotoId, pie])
    if (!rows.length) return res.status(404).json({ error: 'Foto no encontrada' })
    res.json(await releer(rows[0].convocatoria_id))
  } catch (e) { fallo(res, e, MENSAJES, 'convocatorias') }
})

router.delete('/fotos/:fotoId(\\d+)', requireAdmin, async (req, res) => {
  try {
    const { rows } = await query(
      'DELETE FROM convocatoria_foto WHERE id = $1 RETURNING convocatoria_id, archivo_id',
      [req.params.fotoId])
    if (!rows.length) return res.status(404).json({ error: 'Foto no encontrada' })
    await borrarSiHuerfano(rows[0].archivo_id)
    res.json(await releer(rows[0].convocatoria_id))
  } catch (e) { fallo(res, e, MENSAJES, 'convocatorias') }
})

export default router
