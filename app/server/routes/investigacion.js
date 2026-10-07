/* Módulo Investigación — respaldado por PostgreSQL (migración 019).
 *
 * Sustituye la lectura/escritura de src/data/investigacion.json. Como en el
 * resto de módulos migrados, la API deja de ser "PUT del arreglo completo"
 * —que reescribía el archivo entero y perdía los ids en cada guardado— y pasa
 * a REST por elemento sobre tres recursos:
 *
 *   /grupos      ->  grupo_investigacion
 *   /semilleros  ->  semillero                (cuelga de un grupo)
 *   /produccion  ->  produccion_investigacion (cuelga de un grupo)
 *   /lineas      ->  linea_investigacion      (líneas del programa, 028)
 *
 * GET / devuelve los cuatro de una vez para la página y para /api/all.
 */
import { Router } from 'express'
import { query } from '../db/pool.js'
import { requireAdmin } from '../middleware/auth.js'
import {
  fallo, rechazaPorValidacion, camposDe, valorPara,
  sentenciaInsert, sentenciaUpdate,
} from '../utils/crud.js'
import {
  enMemoria, guardarArchivo, borrarSiHuerfano, extensionDe,
  nombreOriginalUtf8, EXTENSIONES_IMAGEN, LIMITE_FOTO,
} from '../utils/archivos.js'

const router = Router()

const MENSAJES = {
  grupo_nombre_no_vacio:        'La sigla debe tener al menos 2 caracteres',
  grupo_categoria_valida:       'La categoría debe ser A1, A, B, C, Reconocido o ninguna',
  grupo_sede_valida:            'La sede debe ser ambas, riohacha o maicao',
  grupo_orden_valido:           'El orden debe estar entre 0 y 999',
  semillero_nombre_no_vacio:    'El nombre debe tener al menos 2 caracteres',
  semillero_sede_valida:        'La sede debe ser ambas, riohacha o maicao',
  semillero_integrantes_valido: 'Los integrantes deben estar entre 0 y 500',
  semillero_orden_valido:       'El orden debe estar entre 0 y 999',
  produccion_titulo_no_vacio:   'El título debe tener al menos 3 caracteres',
  produccion_tipo_valido:       'Tipo de producción no válido',
  produccion_anio_valido:       'El año debe estar entre 1976 y 2100',
  produccion_orden_valido:      'El orden debe estar entre 0 y 999',
  linea_nombre_no_vacio:        'El nombre debe tener al menos 3 caracteres',
  linea_orden_valido:           'El orden debe estar entre 0 y 999',
}

/* El UNIQUE de la sigla es un índice sobre lower(nombre), no una restricción
   con nombre, así que crud.fallo no lo distingue de otro duplicado. Se atiende
   aquí para que el panel diga qué choca. */
function falloInvestigacion(res, e, etiqueta) {
  if (e.code === '23505' && e.constraint === 'grupo_nombre_unico') {
    return res.status(409).json({ error: 'Ya hay un grupo con esa sigla' })
  }
  if (e.code === '23505' && e.constraint === 'linea_nombre_unico') {
    return res.status(409).json({ error: 'Ya hay una línea con ese nombre' })
  }
  return fallo(res, e, MENSAJES, etiqueta)
}

/* ─── Grupos ───────────────────────────────────────────────────── */

const COL_GRUPO = [
  'nombre', 'nombre_completo', 'categoria', 'lineas', 'lider', 'sede',
  'descripcion', 'color', 'gruplac_url', 'orden',
]
const SEL_GRUPO = 'id, ' + COL_GRUPO.join(', ')

const conLineas = g => ({ ...g, lineas: g.lineas ?? [] })

export async function leerGrupos() {
  const { rows } = await query(
    'SELECT ' + SEL_GRUPO + ' FROM grupo_investigacion ORDER BY orden ASC, id ASC')
  return rows.map(conLineas)
}

/* ─── Líneas de investigación ──────────────────────────────────── */

const COL_LINEA = ['nombre', 'objetivo', 'ejes', 'orden']
const SEL_LINEA = 'id, ' + COL_LINEA.join(', ')

const conEjes = l => ({ ...l, ejes: l.ejes ?? [] })

export async function leerLineas() {
  const { rows } = await query(
    'SELECT ' + SEL_LINEA + ' FROM linea_investigacion ORDER BY orden ASC, id ASC')
  return rows.map(conEjes)
}

/* ─── Semilleros y producción ──────────────────────────────────── */

/* Los dos cuelgan de un grupo. La sigla se trae resuelta porque la página la
   pinta como texto, y sin esto tendría que cruzar colecciones en el navegador. */

const COL_SEMILLERO = ['nombre', 'grupo_id', 'lider', 'sede', 'descripcion', 'integrantes', 'en_evaluacion', 'orden']
const SEL_SEMILLERO = `s.id, s.nombre, s.grupo_id, s.lider, s.sede, s.descripcion,
  s.integrantes, s.en_evaluacion, s.orden, s.slug, g.nombre AS grupo,
  (SELECT count(*)::int FROM semillero_logro l WHERE l.semillero_id = s.id) AS logros`
const DE_SEMILLERO = 'FROM semillero s LEFT JOIN grupo_investigacion g ON g.id = s.grupo_id'

/* `portada_id` no está en las columnas editables: la portada se cambia por
   su propia ruta multipart, nunca con un PATCH que traiga un id cualquiera. */
const COL_PRODUCCION = ['titulo', 'tipo', 'anio', 'medio', 'autores', 'resumen', 'grupo_id', 'url', 'orden']
const SEL_PRODUCCION = `p.id, p.titulo, p.tipo, p.anio, p.medio, p.autores, p.resumen, p.grupo_id,
  p.url, p.orden, p.portada_id, g.nombre AS grupo, g.nombre_completo AS grupo_nombre_completo`
const DE_PRODUCCION = 'FROM produccion_investigacion p LEFT JOIN grupo_investigacion g ON g.id = p.grupo_id'

const conGrupo = f => ({ ...f, grupo: f.grupo ?? '' })

/* El front recibe la ruta de la portada ya armada, como en egresados. */
const conPortada = f => ({
  ...conGrupo(f),
  grupo_nombre_completo: f.grupo_nombre_completo ?? '',
  portada_url: f.portada_id ? '/api/archivos/' + f.portada_id : '',
})

export async function leerSemilleros() {
  const { rows } = await query(`SELECT ${SEL_SEMILLERO} ${DE_SEMILLERO} ORDER BY s.orden ASC, s.id ASC`)
  return rows.map(conGrupo)
}

/* Lo más reciente primero: es "producción destacada", no un archivo histórico. */
export async function leerProduccion() {
  const { rows } = await query(
    `SELECT ${SEL_PRODUCCION} ${DE_PRODUCCION} ORDER BY p.anio DESC, p.orden ASC, p.id DESC`)
  return rows.map(conPortada)
}

async function unaProduccion(id) {
  const { rows } = await query(`SELECT ${SEL_PRODUCCION} ${DE_PRODUCCION} WHERE p.id = $1`, [id])
  return rows[0] ? conPortada(rows[0]) : null
}

/* ─── CRUD ─────────────────────────────────────────────────────── */

/* Mismo molde que grado.js. `releer` vuelve a pedir la fila con su JOIN: el
   INSERT/UPDATE solo devuelve columnas propias, y el panel debe recibir
   exactamente lo mismo que recibe al listar. */
function recurso({ ruta, tabla, esquema, columnas, nulas, leer, releer, alBorrar }) {
  router.get('/' + ruta, async (_req, res) => {
    try { res.json(await leer()) } catch (e) { falloInvestigacion(res, e, ruta) }
  })

  router.post('/' + ruta, requireAdmin, async (req, res) => {
    if (rechazaPorValidacion(esquema, req, res, false)) return
    const campos = camposDe(columnas, req.body)
    if (!campos.length) return res.status(400).json({ error: 'No se recibió ningún dato' })
    try {
      const { rows } = await query(
        sentenciaInsert(tabla, campos, 'id'),
        campos.map(c => valorPara(c, req.body[c], nulas)),
      )
      res.status(201).json(await releer(rows[0].id))
    } catch (e) { falloInvestigacion(res, e, ruta) }
  })

  router.patch('/' + ruta + '/:id(\\d+)', requireAdmin, async (req, res) => {
    if (rechazaPorValidacion(esquema, req, res, true)) return
    const campos = camposDe(columnas, req.body)
    if (!campos.length) return res.status(400).json({ error: 'Nada que actualizar' })
    try {
      const { rows } = await query(
        sentenciaUpdate(tabla, campos, 'id'),
        [req.params.id, ...campos.map(c => valorPara(c, req.body[c], nulas))],
      )
      if (!rows.length) return res.status(404).json({ error: 'No encontrado' })
      res.json(await releer(rows[0].id))
    } catch (e) { falloInvestigacion(res, e, ruta) }
  })

  router.delete('/' + ruta + '/:id(\\d+)', requireAdmin, async (req, res) => {
    try {
      const { rows } = await query('DELETE FROM ' + tabla + ' WHERE id = $1 RETURNING *', [req.params.id])
      if (!rows.length) return res.status(404).json({ error: 'No encontrado' })
      if (alBorrar) await alBorrar(rows[0])
      res.json({ ok: true })
    } catch (e) { falloInvestigacion(res, e, ruta) }
  })
}

recurso({
  ruta: 'grupos',
  tabla: 'grupo_investigacion',
  esquema: 'grupos_investigacion',
  columnas: COL_GRUPO,
  nulas: new Set(),
  leer: leerGrupos,
  releer: async id => {
    const { rows } = await query('SELECT ' + SEL_GRUPO + ' FROM grupo_investigacion WHERE id = $1', [id])
    return conLineas(rows[0])
  },
})

/* El formulario manda '' cuando se deja "sin grupo" o se borra el número de
   integrantes, y PostgreSQL rechaza '' como INTEGER. */
recurso({
  ruta: 'lineas',
  tabla: 'linea_investigacion',
  esquema: 'lineas_investigacion',
  columnas: COL_LINEA,
  nulas: new Set(),
  leer: leerLineas,
  releer: async id => {
    const { rows } = await query('SELECT ' + SEL_LINEA + ' FROM linea_investigacion WHERE id = $1', [id])
    return conEjes(rows[0])
  },
})

recurso({
  ruta: 'semilleros',
  tabla: 'semillero',
  esquema: 'semilleros',
  columnas: COL_SEMILLERO,
  nulas: new Set(['grupo_id', 'integrantes']),
  leer: leerSemilleros,
  releer: async id => {
    const { rows } = await query(`SELECT ${SEL_SEMILLERO} ${DE_SEMILLERO} WHERE s.id = $1`, [id])
    return conGrupo(rows[0])
  },
})

recurso({
  ruta: 'produccion',
  tabla: 'produccion_investigacion',
  esquema: 'produccion',
  columnas: COL_PRODUCCION,
  nulas: new Set(['grupo_id']),
  leer: leerProduccion,
  releer: unaProduccion,
  // La portada de una publicación borrada se queda sin dueño: no hay que acumularla.
  alBorrar: f => borrarSiHuerfano(f.portada_id),
})

/* Página propia de un semillero: la ficha, sus logros y la galería. Pública.
   Se pide por slug porque es la dirección que se comparte. */
router.get('/semilleros/pagina/:slug', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT ${SEL_SEMILLERO}, g.nombre_completo AS grupo_nombre_completo, g.color AS grupo_color
       ${DE_SEMILLERO} WHERE s.slug = $1`, [req.params.slug])
    const semillero = rows[0]
    if (!semillero) return res.status(404).json({ error: 'Semillero no encontrado' })

    const [logros, fotos] = await Promise.all([
      query(`SELECT id, tipo, nombre, resultado, puesto, alcance, lugar, fecha, descripcion, participantes, orden
             FROM semillero_logro WHERE semillero_id = $1 ORDER BY orden ASC, id ASC`, [semillero.id]),
      query(`SELECT id, logro_id, archivo_id, pie, orden
             FROM semillero_foto WHERE semillero_id = $1 ORDER BY orden ASC, id ASC`, [semillero.id]),
    ])
    res.json({
      ...conGrupo(semillero),
      logros: logros.rows.map(l => ({ ...l, participantes: l.participantes ?? [] })),
      fotos: fotos.rows.map(f => ({ ...f, url: '/api/archivos/' + f.archivo_id })),
    })
  } catch (e) { falloInvestigacion(res, e, 'semilleros') }
})

/* Ficha de una publicación, para su página propia. Pública. */
router.get('/produccion/:id(\\d+)', async (req, res) => {
  try {
    const p = await unaProduccion(req.params.id)
    if (!p) return res.status(404).json({ error: 'Publicación no encontrada' })
    res.json(p)
  } catch (e) { falloInvestigacion(res, e, 'produccion') }
})

/* ─── Portada de una publicación ───────────────────────────────── */

/* Se sube contra una publicación que ya existe: antes de guardarla no hay id
   al que colgarla. Mismo tope que las fotos del resto del sitio (3 MB). */
const subidaPortada = enMemoria(LIMITE_FOTO)

router.post('/produccion/:id(\\d+)/portada', requireAdmin, (req, res, next) =>
  subidaPortada.single('portada')(req, res, err => {
    if (!err) return next()
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'La imagen pasa del límite de 3 MB' })
    next(err)
  }),
async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen' })
    const original = nombreOriginalUtf8(req.file.originalname)
    if (!EXTENSIONES_IMAGEN.includes(extensionDe(original))) {
      return res.status(400).json({ error: 'La imagen debe ser ' + EXTENSIONES_IMAGEN.join(', ').toUpperCase() })
    }
    const previa = await query('SELECT portada_id FROM produccion_investigacion WHERE id = $1', [req.params.id])
    if (!previa.rows[0]) return res.status(404).json({ error: 'Publicación no encontrada' })

    const archivo = await guardarArchivo(req.file, { usuarioId: req.usuario?.id })
    await query('UPDATE produccion_investigacion SET portada_id = $2 WHERE id = $1', [req.params.id, archivo.id])
    // La anterior queda sin dueño: se borra para no acumular adjuntos.
    await borrarSiHuerfano(previa.rows[0].portada_id)
    res.json(await unaProduccion(req.params.id))
  } catch (e) { falloInvestigacion(res, e, 'produccion') }
})

router.delete('/produccion/:id(\\d+)/portada', requireAdmin, async (req, res) => {
  try {
    /* El id anterior se lee ANTES: el RETURNING del UPDATE ya vería el NULL. */
    const previa = await query('SELECT portada_id FROM produccion_investigacion WHERE id = $1', [req.params.id])
    if (!previa.rows[0]) return res.status(404).json({ error: 'Publicación no encontrada' })
    await query('UPDATE produccion_investigacion SET portada_id = NULL WHERE id = $1', [req.params.id])
    await borrarSiHuerfano(previa.rows[0].portada_id)
    res.json(await unaProduccion(req.params.id))
  } catch (e) { falloInvestigacion(res, e, 'produccion') }
})

/* ─── Los cuatro bloques de una vez ────────────────────────────── */

export async function bloquesInvestigacion() {
  const [grupos, semilleros, produccion, lineas] = await Promise.all([
    leerGrupos(), leerSemilleros(), leerProduccion(), leerLineas(),
  ])
  return { grupos, semilleros, produccion, lineas }
}

router.get('/', async (_req, res) => {
  try { res.json(await bloquesInvestigacion()) } catch (e) { falloInvestigacion(res, e, 'investigacion') }
})

export default router
