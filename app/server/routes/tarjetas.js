/* Módulo Tarjetas — el carrusel informativo que va al costado de un hero.
 *
 * Empezó dentro del plan de estudios, para la propuesta curricular. Cuando
 * Saber Pro pidió el mismo costado quedó claro que las tarjetas no son de un
 * plan ni de un examen: son de la PÁGINA que las muestra. De ahí que vivan en
 * su propio recurso, con la sección como llave.
 *
 * Qué se publica: en la vista pública solo las visibles. El panel las pide
 * todas, porque necesita poder devolver al carrusel una que se ocultó.
 *
 * Las secciones son una lista blanca. Aceptar cualquier texto dejaría entrar
 * tarjetas a páginas que no existen, invisibles para siempre y sin forma de
 * encontrarlas salvo mirando la tabla.
 */
import { Router } from 'express'
import { query } from '../db/pool.js'
import { requireAdmin } from '../middleware/auth.js'
import {
  enMemoria, guardarArchivo, borrarSiHuerfano, extensionDe,
  nombreOriginalUtf8, EXTENSIONES_IMAGEN, LIMITE_FOTO,
} from '../utils/archivos.js'
import {
  fallo, rechazaPorValidacion, camposDe, sentenciaInsert, sentenciaUpdate,
} from '../utils/crud.js'

const router = Router()
const subidaImagen = enMemoria(LIMITE_FOTO)

/* Las páginas que tienen carrusel, con el nombre que el panel enseña. */
export const SECCIONES = {
  'pensum-propuesto': 'Propuesta curricular',
  'saber-pro': 'Saber Pro',
}

const COLUMNAS = ['titulo', 'texto', 'pie', 'imagen_url', 'orden', 'visible', 'solo_imagen']
const SEL = 'id, seccion, titulo, texto, pie, imagen_id, imagen_url, orden, visible, solo_imagen'

const MENSAJES = {
  carrusel_titulo_no_vacio: 'El título de la tarjeta debe tener al menos 3 caracteres',
  carrusel_texto_razonable: 'El texto de la tarjeta no puede pasar de 600 caracteres',
  carrusel_pie_razonable:   'El pie de la tarjeta no puede pasar de 80 caracteres',
  carrusel_solo_imagen_con_imagen:
    'Una tarjeta sin texto necesita una imagen: súbela antes de quitarle el texto',
  carrusel_seccion_no_vacia: 'Sección no válida',
}

const falloTarjeta = (res, e) => fallo(res, e, MENSAJES, 'tarjetas')

/* Un archivo subido gana a la ruta escrita a mano: es lo que el editor acaba
   de poner, frente a lo que quedó de antes. */
const conImagen = t => ({
  ...t,
  imagen_url: t.imagen_id ? '/api/archivos/' + t.imagen_id : (t.imagen_url ?? ''),
})

/* Una tarjeta con texto necesita título; una de solo imagen, no —ahí el título
   es el texto alternativo y puede faltar—. Se comprueba contra lo que quedaría
   tras el cambio, no contra el cuerpo suelto: quitar el título de una tarjeta
   que ya es solo imagen es válido, y de una con texto no lo es, aunque el
   cuerpo de la petición sea idéntico. */
function faltaTitulo({ titulo, solo_imagen }) {
  if (solo_imagen) return null
  if (String(titulo ?? '').trim().length >= 3) return null
  return 'El título es obligatorio salvo que la tarjeta sea solo imagen'
}

const seccionValida = s => Object.prototype.hasOwnProperty.call(SECCIONES, s)

/* Lee las tarjetas de una sección. Lo usa también /api/all, para que la página
   pública no tenga que pedirlas aparte. */
export async function leerTarjetas(seccion, { soloVisibles = false } = {}) {
  const { rows } = await query(
    'SELECT ' + SEL + ' FROM tarjeta_carrusel WHERE seccion = $1' +
    (soloVisibles ? ' AND visible' : '') + ' ORDER BY orden, id',
    [seccion],
  )
  return rows.map(conImagen)
}

/* Todas las secciones de una vez, para el arranque del sitio. */
export async function leerTodasLasTarjetas({ soloVisibles = true } = {}) {
  const { rows } = await query(
    'SELECT ' + SEL + ' FROM tarjeta_carrusel' +
    (soloVisibles ? ' WHERE visible' : '') + ' ORDER BY seccion, orden, id',
  )
  const por = Object.fromEntries(Object.keys(SECCIONES).map(s => [s, []]))
  for (const t of rows) (por[t.seccion] ??= []).push(conImagen(t))
  return por
}

/* ─── Lectura ──────────────────────────────────────────────────── */

/* `?todas=1` incluye las ocultas, y solo para quien tiene sesión: una tarjeta
   se oculta justamente para que no se vea. */
router.get('/:seccion', async (req, res) => {
  const { seccion } = req.params
  if (!seccionValida(seccion)) return res.status(404).json({ error: 'Sección no válida' })
  try {
    const todas = req.query.todas === '1' && Boolean(req.usuario)
    res.json(await leerTarjetas(seccion, { soloVisibles: !todas }))
  } catch (e) { falloTarjeta(res, e) }
})

/* ─── Escritura ────────────────────────────────────────────────── */

router.post('/:seccion', requireAdmin, async (req, res) => {
  const { seccion } = req.params
  if (!seccionValida(seccion)) return res.status(404).json({ error: 'Sección no válida' })
  if (rechazaPorValidacion('tarjeta_carrusel', req, res, false)) return

  req.body.titulo = String(req.body.titulo ?? '').trim()
  const falta = faltaTitulo(req.body)
  if (falta) return res.status(400).json({ error: falta, errores: { titulo: falta } })

  try {
    /* Sin orden explícito va al final: una tarjeta se agrega para sumarla a lo
       que ya se cuenta, no para colarse en medio. */
    const orden = req.body.orden !== undefined ? Number(req.body.orden) : (
      await query('SELECT coalesce(max(orden) + 1, 0) AS siguiente FROM tarjeta_carrusel WHERE seccion = $1', [seccion])
    ).rows[0].siguiente

    const campos = ['seccion', ...camposDe(COLUMNAS, req.body).filter(c => c !== 'orden'), 'orden']
    const valores = campos.map(c => (c === 'seccion' ? seccion : c === 'orden' ? orden : req.body[c]))

    const { rows } = await query(sentenciaInsert('tarjeta_carrusel', campos, SEL), valores)
    res.status(201).json(conImagen(rows[0]))
  } catch (e) { falloTarjeta(res, e) }
})

router.patch('/tarjeta/:id(\\d+)', requireAdmin, async (req, res) => {
  if (rechazaPorValidacion('tarjeta_carrusel', req, res, true)) return
  const campos = camposDe(COLUMNAS, req.body)
  if (!campos.length) return res.status(400).json({ error: 'Nada que actualizar' })
  try {
    const actual = await query('SELECT titulo, solo_imagen FROM tarjeta_carrusel WHERE id = $1', [req.params.id])
    if (!actual.rows.length) return res.status(404).json({ error: 'Tarjeta no encontrada' })

    const falta = faltaTitulo({ ...actual.rows[0], ...req.body })
    if (falta) return res.status(400).json({ error: falta, errores: { titulo: falta } })

    const { rows } = await query(
      sentenciaUpdate('tarjeta_carrusel', campos, SEL),
      [req.params.id, ...campos.map(c => req.body[c])],
    )
    res.json(conImagen(rows[0]))
  } catch (e) { falloTarjeta(res, e) }
})

router.delete('/tarjeta/:id(\\d+)', requireAdmin, async (req, res) => {
  try {
    const { rows } = await query('DELETE FROM tarjeta_carrusel WHERE id = $1 RETURNING imagen_id', [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Tarjeta no encontrada' })
    await borrarSiHuerfano(rows[0].imagen_id)
    res.json({ ok: true })
  } catch (e) { falloTarjeta(res, e) }
})

/* Reordenar de una vez: el panel manda la lista completa tras pulsar las
   flechas. Una por una dejaría dos tarjetas compartiendo posición si la
   segunda petición fallara. */
router.put('/:seccion/orden', requireAdmin, async (req, res) => {
  const { seccion } = req.params
  if (!seccionValida(seccion)) return res.status(404).json({ error: 'Sección no válida' })

  const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(Number) : null
  if (!ids || ids.some(n => !Number.isInteger(n) || n <= 0)) {
    return res.status(400).json({ error: 'Se esperaba la lista de identificadores en orden' })
  }
  try {
    await query(
      `UPDATE tarjeta_carrusel AS t
          SET orden = n.pos
         FROM unnest($2::int[]) WITH ORDINALITY AS n(id, pos)
        WHERE t.id = n.id AND t.seccion = $1`,
      [seccion, ids],
    )
    res.json(await leerTarjetas(seccion))
  } catch (e) { falloTarjeta(res, e) }
})

/* ─── Imagen ───────────────────────────────────────────────────── */

router.post('/tarjeta/:id(\\d+)/imagen', requireAdmin, (req, res, next) => {
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
    const previa = await query('SELECT imagen_id FROM tarjeta_carrusel WHERE id = $1', [req.params.id])
    if (!previa.rows.length) return res.status(404).json({ error: 'Tarjeta no encontrada' })

    const archivo = await guardarArchivo(req.file, { usuarioId: req.usuario?.id ?? null })
    const { rows } = await query(
      'UPDATE tarjeta_carrusel SET imagen_id = $2 WHERE id = $1 RETURNING ' + SEL,
      [req.params.id, archivo.id],
    )
    await borrarSiHuerfano(previa.rows[0].imagen_id)
    res.json(conImagen(rows[0]))
  } catch (e) { falloTarjeta(res, e) }
})

router.delete('/tarjeta/:id(\\d+)/imagen', requireAdmin, async (req, res) => {
  try {
    const previa = await query('SELECT imagen_id FROM tarjeta_carrusel WHERE id = $1', [req.params.id])
    if (!previa.rows.length) return res.status(404).json({ error: 'Tarjeta no encontrada' })

    const { rows } = await query(
      'UPDATE tarjeta_carrusel SET imagen_id = NULL WHERE id = $1 RETURNING ' + SEL,
      [req.params.id],
    )
    await borrarSiHuerfano(previa.rows[0].imagen_id)
    res.json(conImagen(rows[0]))
  } catch (e) { falloTarjeta(res, e) }
})

export default router
