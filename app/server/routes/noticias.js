/* Módulo Noticias — respaldado por PostgreSQL.
 *
 * Sustituye la lectura/escritura de src/data/noticias.json. Como en Docentes y
 * Estudiantes, la API deja de ser "reemplaza el arreglo completo" —idiom de
 * archivo, que además hacía que dos editores simultáneos se pisaran— y pasa a
 * REST por elemento.
 *
 * La imagen sigue el patrón de la foto del docente: el binario vive en
 * `archivos` y aquí queda la referencia. `imagen_url` se conserva para enlazar
 * imágenes externas que no están en la base.
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

/* Lista blanca: nada que venga del cliente entra al SQL como identificador. */
const COLUMNAS = [
  'titulo', 'resumen', 'cuerpo', 'categoria', 'fecha',
  'autor', 'sede', 'imagen_url', 'publicada',
]

/* Columnas que aceptan NULL: un input vacío llega como '' y DATE lo rechaza. */
const NULAS = new Set(['fecha'])

/* to_char evita que el driver convierta DATE a un Date en la zona local, que
   es como una noticia del día 12 termina mostrándose como del 11. */
const SEL = "id, titulo, resumen, cuerpo, categoria, " +
  "to_char(fecha, 'YYYY-MM-DD') AS fecha, autor, sede, " +
  'imagen_id, imagen_url, publicada'

const MENSAJES = {
  noticia_titulo_no_vacio:   'El título debe tener al menos 3 caracteres',
  noticia_sede_valida:       'La sede debe ser ambas, riohacha o maicao',
  noticia_categoria_valida:  'Categoría no válida',
}

/* La imagen subida manda sobre la URL externa: si hay archivo, ese es el que
   se muestra. Así el panel puede reemplazar una imagen enlazada por una real
   sin tener que limpiar el campo de texto. */
const conImagen = n => ({
  ...n,
  imagen_url: n.imagen_id ? enlaceArchivo(n.imagen_id) : (n.imagen_url ?? ''),
})

/* Usado también por /api/all. `soloPublicadas` es lo que ve el visitante. */
export async function leerNoticias({ soloPublicadas = true, id = null } = {}) {
  const condiciones = []
  const valores = []
  if (soloPublicadas) condiciones.push('publicada = TRUE')
  if (id !== null) { valores.push(id); condiciones.push('id = $' + valores.length) }

  const { rows } = await query(
    'SELECT ' + SEL + ' FROM noticia' +
    (condiciones.length ? ' WHERE ' + condiciones.join(' AND ') : '') +
    ' ORDER BY fecha DESC, id DESC',
    valores,
  )
  return rows.map(conImagen)
}

/* ─── Lectura ──────────────────────────────────────────────────── */

/* Público. `?todos=1` incluye las no publicadas y solo lo puede pedir un
   admin: si no, cualquiera vería los borradores. */
router.get('/', async (req, res) => {
  try {
    const pideTodos = req.query.todos === '1' && req.usuario?.rol === 'admin'
    res.json(await leerNoticias({ soloPublicadas: !pideTodos }))
  } catch (e) { fallo(res, e, MENSAJES, 'noticias') }
})

router.get('/:id(\\d+)', async (req, res) => {
  try {
    const [noticia] = await leerNoticias({ soloPublicadas: false, id: Number(req.params.id) })
    if (!noticia) return res.status(404).json({ error: 'Noticia no encontrada' })
    res.json(noticia)
  } catch (e) { fallo(res, e, MENSAJES, 'noticias') }
})

/* ─── Escritura ────────────────────────────────────────────────── */

router.post('/', requireAdmin, async (req, res) => {
  if (rechazaPorValidacion('noticias', req, res, false)) return

  const campos = camposDe(COLUMNAS, req.body)
  if (!campos.length) return res.status(400).json({ error: 'No se recibió ningún dato' })

  try {
    const { rows } = await query(
      sentenciaInsert('noticia', campos, SEL),
      campos.map(c => valorPara(c, req.body[c], NULAS)),
    )
    res.status(201).json(conImagen(rows[0]))
  } catch (e) { fallo(res, e, MENSAJES, 'noticias') }
})

router.patch('/:id(\\d+)', requireAdmin, async (req, res) => {
  if (rechazaPorValidacion('noticias', req, res, true)) return

  const campos = camposDe(COLUMNAS, req.body)
  if (!campos.length) return res.status(400).json({ error: 'Nada que actualizar' })

  try {
    const { rows } = await query(
      sentenciaUpdate('noticia', campos, SEL),
      [req.params.id, ...campos.map(c => valorPara(c, req.body[c], NULAS))],
    )
    if (!rows.length) return res.status(404).json({ error: 'Noticia no encontrada' })
    res.json(conImagen(rows[0]))
  } catch (e) { fallo(res, e, MENSAJES, 'noticias') }
})

router.delete('/:id(\\d+)', requireAdmin, async (req, res) => {
  try {
    const { rows } = await query('DELETE FROM noticia WHERE id = $1 RETURNING imagen_id', [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Noticia no encontrada' })
    /* La imagen hay que soltarla a mano: la tabla de archivos la comparten
       todos los módulos y el borrado en cascada no aplica. */
    await borrarSiHuerfano(rows[0].imagen_id)
    res.json({ ok: true })
  } catch (e) { fallo(res, e, MENSAJES, 'noticias') }
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
    const previa = await query('SELECT imagen_id FROM noticia WHERE id = $1', [req.params.id])
    if (!previa.rows.length) return res.status(404).json({ error: 'Noticia no encontrada' })

    const archivo = await guardarArchivo(req.file, { usuarioId: req.usuario?.id ?? null })
    const { rows } = await query(
      'UPDATE noticia SET imagen_id = $2 WHERE id = $1 RETURNING ' + SEL,
      [req.params.id, archivo.id],
    )
    await borrarSiHuerfano(previa.rows[0].imagen_id)
    res.json(conImagen(rows[0]))
  } catch (e) { fallo(res, e, MENSAJES, 'noticias') }
})

router.delete('/:id(\\d+)/imagen', requireAdmin, async (req, res) => {
  try {
    const previa = await query('SELECT imagen_id FROM noticia WHERE id = $1', [req.params.id])
    if (!previa.rows.length) return res.status(404).json({ error: 'Noticia no encontrada' })

    const { rows } = await query(
      'UPDATE noticia SET imagen_id = NULL WHERE id = $1 RETURNING ' + SEL,
      [req.params.id],
    )
    await borrarSiHuerfano(previa.rows[0].imagen_id)
    res.json(conImagen(rows[0]))
  } catch (e) { fallo(res, e, MENSAJES, 'noticias') }
})

export default router
