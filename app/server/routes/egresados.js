/* Módulo Egresados — respaldado por PostgreSQL (migración 009).
 *
 * Sustituye la lectura/escritura de src/data/egresados.json. Como en
 * Estudiantes, la API pasa de "reemplaza el arreglo completo" —idiom de
 * archivo JSON, que perdía los ids en cada guardado— a REST por elemento.
 *
 * Además aparecen dos recursos que antes no existían en ninguna parte:
 * las postulaciones a una vacante y las actualizaciones de datos. Los dos
 * son PÚBLICOS para escribir (cualquiera aplica o se actualiza) y privados
 * para leer: son datos personales de terceros.
 */
import { Router } from 'express'
import { query } from '../db/pool.js'
import { requireAdmin } from '../middleware/auth.js'
import { crearFallo, crearRecurso } from '../utils/recurso.js'
import {
  enMemoria, guardarArchivo, borrarSiHuerfano, extensionDe,
  nombreOriginalUtf8, EXTENSIONES_IMAGEN, LIMITE_DOCUMENTO, LIMITE_FOTO,
} from '../utils/archivos.js'
import { validar, hayErrores, idYouTube, pesoLegible } from '../../shared/validacion.js'

/* Una hoja de vida es un documento, no una hoja de cálculo ni un ZIP: aceptar
   todo lo que admite el sitio abriría la puerta a adjuntos que nadie va a leer. */
const EXTENSIONES_HOJA_VIDA = ['pdf', 'doc', 'docx']

const router = Router()

const MENSAJES = {
  egresado_nombre_no_vacio:      'El nombre debe tener al menos 3 caracteres',
  egresado_sede_valida:          'La sede debe ser ambas, riohacha o maicao',
  egresado_youtube_valido:       'El identificador de YouTube no es válido',
  egresado_orden_valido:         'El orden debe estar entre 0 y 999',
  oferta_cargo_no_vacio:         'El cargo debe tener al menos 3 caracteres',
  oferta_estado_valido:          'El estado debe ser abierta, cerrada o borrador',
  oferta_modalidad_valida:       'La modalidad debe ser Presencial, Remoto o Híbrido',
  oferta_contrato_valido:        'Tipo de contrato no válido',
  oferta_vacantes_positivo:      'Debe haber al menos una vacante',
  oferta_cierre_coherente:       'El cierre no puede ser anterior a la publicación',
  postulacion_nombre_no_vacio:   'El nombre debe tener al menos 3 caracteres',
  postulacion_email_valido:      'El correo no tiene un formato válido',
  postulacion_estado_valido:     'Estado de postulación no válido',
  postulacion_unica_idx:         'Ya te postulaste a esta vacante con ese correo',
  actualizacion_nombre_no_vacio: 'El nombre debe tener al menos 3 caracteres',
  actualizacion_email_valido:    'El correo no tiene un formato válido',
  actualizacion_formacion_valida: 'Opción de formación no válida',
}

const fallo = crearFallo('egresados', MENSAJES)
const recurso = crearRecurso({ router, fallo })

const enlaceArchivo = id => '/api/archivos/' + id

/* Los adjuntos van a la base, así que multer los recibe en memoria. */
const subidaFoto = enMemoria(LIMITE_FOTO)
const subidaHojaVida = enMemoria(LIMITE_DOCUMENTO)

/* Traduce el fallo de multer (archivo demasiado grande) a algo legible. */
function conSubida(mw, limiteMB) {
  return (req, res, next) => mw(req, res, err => {
    if (!err) return next()
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'El archivo pasa del límite de ' + limiteMB + ' MB' })
    }
    next(err)
  })
}

/* ─── Egresados destacados ─────────────────────────────────────── */

const SEL_EGRESADO =
  'id, nombre, anio_grado, cargo, empresa, ciudad, pais, sede, testimonio, linkedin_url, ' +
  'color, foto_id, video_youtube, video_url, poster_id, destacado, orden, activo'

/* El destacado primero; el resto por el orden que fije el panel. */
const ORD_EGRESADO = 'destacado DESC, orden ASC, id ASC'

/* El front no debe saber de dónde sale cada imagen. Recibe rutas ya armadas:
   la foto del archivo en base, y el póster del vídeo con su cascada —póster
   propio, si no la miniatura de YouTube, que no cuesta almacenamiento. */
const conMedios = f => ({
  ...f,
  foto_url: f.foto_id ? enlaceArchivo(f.foto_id) : '',
  poster_url: f.poster_id
    ? enlaceArchivo(f.poster_id)
    : (f.video_youtube ? 'https://i.ytimg.com/vi/' + f.video_youtube + '/maxresdefault.jpg' : ''),
  tiene_video: Boolean(f.video_youtube || f.video_url),
})

/* El panel puede mandar la URL completa de YouTube; se guarda el id. */
function normalizarEgresado(req, _res, next) {
  if (req.body && req.body.video_youtube !== undefined) {
    const id = idYouTube(req.body.video_youtube)
    // Un campo vaciado a propósito debe poder vaciarse; solo se reescribe
    // cuando hay algo reconocible o cuando queda en blanco.
    if (id || String(req.body.video_youtube).trim() === '') req.body.video_youtube = id
  }
  next()
}
router.use('/destacados', normalizarEgresado)

/* Va ANTES del recurso genérico para ganarle la ruta: el DELETE de serie borra
   la fila y deja la foto y el póster sin dueño hasta el barrido de las 24 h.
   Aquí se sueltan en el momento, como hacen los documentos del cuadro de honor. */
router.delete('/destacados/:id', requireAdmin, async (req, res) => {
  try {
    const { rows } = await query(
      'DELETE FROM egresado WHERE id = $1 RETURNING foto_id, poster_id',
      [req.params.id],
    )
    if (!rows[0]) return res.status(404).json({ error: 'No encontrado' })
    await borrarSiHuerfano(rows[0].foto_id)
    await borrarSiHuerfano(rows[0].poster_id)
    res.json({ ok: true })
  } catch (e) { fallo(res, e) }
})

recurso({
  ruta: 'destacados',
  esquema: 'egresados',
  tabla: 'egresado',
  // foto_id y poster_id no se escriben a mano: se suben por su propia ruta.
  columnas: [
    'nombre', 'anio_grado', 'cargo', 'empresa', 'ciudad', 'pais', 'sede',
    'testimonio', 'linkedin_url', 'color', 'video_youtube', 'video_url',
    'destacado', 'orden', 'activo',
  ],
  seleccion: SEL_EGRESADO,
  orden: ORD_EGRESADO,
  mapear: conMedios,
})

/* Sube la foto redonda o el póster del vídeo. Misma ruta para los dos porque
   el manejo es idéntico; cambia la columna. */
function subirImagen(columna) {
  return async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen' })

      const original = nombreOriginalUtf8(req.file.originalname)
      if (!EXTENSIONES_IMAGEN.includes(extensionDe(original))) {
        return res.status(400).json({ error: 'La imagen debe ser ' + EXTENSIONES_IMAGEN.join(', ').toUpperCase() })
      }

      const previa = await query('SELECT ' + columna + ' FROM egresado WHERE id = $1', [req.params.id])
      if (!previa.rows[0]) return res.status(404).json({ error: 'Egresado no encontrado' })

      const archivo = await guardarArchivo(req.file, { usuarioId: req.usuario?.id })
      const { rows } = await query(
        'UPDATE egresado SET ' + columna + ' = $2 WHERE id = $1 RETURNING ' + SEL_EGRESADO,
        [req.params.id, archivo.id],
      )
      // La imagen anterior queda sin dueño: se borra para no acumular adjuntos.
      await borrarSiHuerfano(previa.rows[0][columna])

      res.json({ ...conMedios(rows[0]), bytes: archivo.bytes, peso: pesoLegible(archivo.bytes) })
    } catch (e) { fallo(res, e) }
  }
}

function quitarImagen(columna) {
  return async (req, res) => {
    try {
      /* Hay que leer el id anterior ANTES de borrarlo: en el RETURNING de un
         UPDATE la subconsulta ya vería la fila actualizada. */
      const previa = await query('SELECT ' + columna + ' FROM egresado WHERE id = $1', [req.params.id])
      if (!previa.rows[0]) return res.status(404).json({ error: 'Egresado no encontrado' })

      const { rows } = await query(
        'UPDATE egresado SET ' + columna + ' = NULL WHERE id = $1 RETURNING ' + SEL_EGRESADO,
        [req.params.id],
      )
      await borrarSiHuerfano(previa.rows[0][columna])
      res.json(conMedios(rows[0]))
    } catch (e) { fallo(res, e) }
  }
}

router.post('/destacados/:id/foto', requireAdmin, conSubida(subidaFoto.single('foto'), 3), subirImagen('foto_id'))
router.delete('/destacados/:id/foto', requireAdmin, quitarImagen('foto_id'))
router.post('/destacados/:id/poster', requireAdmin, conSubida(subidaFoto.single('foto'), 3), subirImagen('poster_id'))
router.delete('/destacados/:id/poster', requireAdmin, quitarImagen('poster_id'))

/* ─── Bolsa de empleo ──────────────────────────────────────────── */

const SEL_OFERTA =
  'id, cargo, empresa, ubicacion, modalidad, tipo_contrato, salario, vacantes, ' +
  'descripcion, responsabilidades, requisitos, beneficios, tags, contacto_email, url_externa, ' +
  "to_char(fecha_publicacion, 'YYYY-MM-DD') AS fecha_publicacion, " +
  "to_char(fecha_cierre, 'YYYY-MM-DD') AS fecha_cierre, estado"

/* Las abiertas primero y, dentro de cada grupo, lo más reciente arriba. */
const ORD_OFERTA = "(estado = 'abierta') DESC, fecha_publicacion DESC, id DESC"

/* Una oferta con fecha de cierre pasada sigue en la base como 'abierta' hasta
   que alguien la cierre a mano. Que esté vencida se calcula, no se guarda: si
   dependiera de un campo, bastaría con que nadie entrara al panel un día para
   que la bolsa mostrara vacantes muertas como vivas. */
const conVigencia = f => {
  const hoy = new Date().toISOString().slice(0, 10)
  const vencida = Boolean(f.fecha_cierre) && f.fecha_cierre < hoy
  return {
    ...f,
    tags: f.tags ?? [],
    vencida,
    abierta: f.estado === 'abierta' && !vencida,
    dias_restantes: f.fecha_cierre && !vencida
      ? Math.round((Date.parse(f.fecha_cierre) - Date.parse(hoy)) / 86400000)
      : null,
  }
}

recurso({
  ruta: 'ofertas',
  tabla: 'oferta_empleo',
  columnas: [
    'cargo', 'empresa', 'ubicacion', 'modalidad', 'tipo_contrato', 'salario', 'vacantes',
    'descripcion', 'responsabilidades', 'requisitos', 'beneficios', 'tags',
    'contacto_email', 'url_externa', 'fecha_publicacion', 'fecha_cierre', 'estado',
  ],
  seleccion: SEL_OFERTA,
  orden: ORD_OFERTA,
  mapear: conVigencia,
})

/* Ficha de una vacante. La pide la página propia de la oferta, que se abre en
   una pestaña nueva desde la bolsa, así que va antes de cualquier ruta con
   comodín y es pública: el enlace tiene que poder compartirse. */
router.get('/ofertas/:id', async (req, res) => {
  try {
    const { rows } = await query('SELECT ' + SEL_OFERTA + ' FROM oferta_empleo WHERE id = $1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'La vacante no existe o fue retirada' })
    if (rows[0].estado === 'borrador') return res.status(404).json({ error: 'La vacante todavía no está publicada' })
    res.json(conVigencia(rows[0]))
  } catch (e) { fallo(res, e) }
})

/* ─── Postulaciones ────────────────────────────────────────────── */

const SEL_POSTULACION =
  'id, oferta_id, nombre, documento, email, telefono, anio_grado, linkedin_url, ' +
  'mensaje, hoja_vida_id, estado, notas, creado_en'

/* Para el listado va además la ficha del adjunto. El panel necesita saber la
   extensión ANTES de abrir nada: un PDF se incrusta y se lee sin descargarlo,
   pero un DOCX ningún navegador sabe pintarlo, y hay que decirlo en vez de
   abrir un visor en blanco. El RETURNING de un UPDATE no admite JOIN, así que
   la selección con adjunto es una consulta aparte y no la de siempre. */
const SEL_POSTULACION_LISTA =
  'p.' + SEL_POSTULACION.split(', ').join(', p.') + ', ' +
  'a.nombre_original AS hoja_vida_nombre, a.extension AS hoja_vida_ext, ' +
  'a.mime AS hoja_vida_mime, a.bytes AS hoja_vida_bytes'

const conHojaVida = f => ({
  ...f,
  hoja_vida_url: f.hoja_vida_id ? enlaceArchivo(f.hoja_vida_id) : '',
  hoja_vida_descarga: f.hoja_vida_id ? enlaceArchivo(f.hoja_vida_id) + '/descargar' : '',
  hoja_vida_peso: f.hoja_vida_bytes ? pesoLegible(f.hoja_vida_bytes) : '',
})

/* Público: es el formulario de la página de la vacante. La hoja de vida viaja
   en el mismo multipart, así que el resto de campos llegan como texto. */
router.post('/ofertas/:id/postulaciones', conSubida(subidaHojaVida.single('hoja_vida'), 10), async (req, res) => {
  let archivoId = null
  try {
    /* to_char y no la columna cruda: el driver devolvería un Date en la zona
       local y la comparación con la fecha de hoy se comeria un día. */
    const oferta = await query(
      "SELECT estado, to_char(fecha_cierre, 'YYYY-MM-DD') AS fecha_cierre FROM oferta_empleo WHERE id = $1",
      [req.params.id],
    )
    if (!oferta.rows[0]) return res.status(404).json({ error: 'La vacante no existe' })

    const { estado, fecha_cierre } = oferta.rows[0]
    const hoy = new Date().toISOString().slice(0, 10)
    if (estado !== 'abierta') return res.status(409).json({ error: 'Esta vacante ya no recibe postulaciones' })
    if (fecha_cierre && fecha_cierre < hoy) {
      return res.status(409).json({ error: 'El plazo para postularse ya cerró' })
    }

    const datos = {
      nombre: String(req.body?.nombre ?? '').trim(),
      email: String(req.body?.email ?? '').trim().toLowerCase(),
      documento: String(req.body?.documento ?? '').trim(),
      telefono: String(req.body?.telefono ?? '').trim(),
      anio_grado: String(req.body?.anio_grado ?? '').trim(),
      linkedin_url: String(req.body?.linkedin_url ?? '').trim(),
      mensaje: String(req.body?.mensaje ?? '').trim(),
    }

    const errores = validar('postulaciones', datos)
    if (hayErrores(errores)) return res.status(400).json({ error: Object.values(errores)[0], errores })

    /* La hoja de vida es opcional, pero si viene tiene que ser un documento
       de los que acepta el sitio, no una imagen ni un ejecutable. */
    if (req.file) {
      const original = nombreOriginalUtf8(req.file.originalname)
      if (!EXTENSIONES_HOJA_VIDA.includes(extensionDe(original))) {
        return res.status(400).json({ error: 'La hoja de vida debe ser ' + EXTENSIONES_HOJA_VIDA.join(', ').toUpperCase() })
      }
      const archivo = await guardarArchivo(req.file, { usuarioId: null })
      archivoId = archivo.id
    }

    const { rows } = await query(
      `INSERT INTO postulacion
         (oferta_id, nombre, documento, email, telefono, anio_grado, linkedin_url, mensaje, hoja_vida_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, creado_en`,
      [
        req.params.id, datos.nombre, datos.documento, datos.email, datos.telefono,
        datos.anio_grado, datos.linkedin_url, datos.mensaje, archivoId,
      ],
    )

    /* Solo el acuse. Devolver la fila entera dejaría que cualquiera leyera de
       vuelta datos personales por el mismo endpoint público. */
    res.status(201).json({ ok: true, id: rows[0].id, creado_en: rows[0].creado_en })
  } catch (e) {
    // Si la inserción falló, el adjunto ya subido se queda sin dueño.
    if (archivoId) await borrarSiHuerfano(archivoId).catch(() => {})
    fallo(res, e)
  }
})

/* Privado: son datos personales de terceros. */
router.get('/postulaciones', requireAdmin, async (req, res) => {
  try {
    const filtro = req.query.oferta ? ' WHERE p.oferta_id = $1' : ''
    const { rows } = await query(
      'SELECT ' + SEL_POSTULACION_LISTA +
      ' FROM postulacion p LEFT JOIN archivos a ON a.id = p.hoja_vida_id' + filtro +
      ' ORDER BY p.creado_en DESC, p.id DESC',
      req.query.oferta ? [req.query.oferta] : [],
    )
    res.json(rows.map(conHojaVida))
  } catch (e) { fallo(res, e) }
})

router.patch('/postulaciones/:id', requireAdmin, async (req, res) => {
  const permitidas = ['estado', 'notas']
  const campos = permitidas.filter(c => req.body?.[c] !== undefined)
  if (!campos.length) return res.status(400).json({ error: 'Nada que actualizar' })

  const errores = validar('postulaciones', req.body, { parcial: true })
  if (hayErrores(errores)) return res.status(400).json({ error: Object.values(errores)[0], errores })

  try {
    const asignaciones = campos.map((c, i) => c + ' = $' + (i + 2)).join(', ')
    const { rows } = await query(
      'UPDATE postulacion SET ' + asignaciones + ' WHERE id = $1 RETURNING ' + SEL_POSTULACION,
      [req.params.id, ...campos.map(c => req.body[c])],
    )
    if (!rows[0]) return res.status(404).json({ error: 'Postulación no encontrada' })
    res.json(conHojaVida(rows[0]))
  } catch (e) { fallo(res, e) }
})

router.delete('/postulaciones/:id', requireAdmin, async (req, res) => {
  try {
    const { rows } = await query('DELETE FROM postulacion WHERE id = $1 RETURNING hoja_vida_id', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Postulación no encontrada' })
    await borrarSiHuerfano(rows[0].hoja_vida_id)
    res.json({ ok: true })
  } catch (e) { fallo(res, e) }
})

/* ─── Actualización de datos ───────────────────────────────────── */

const SEL_ACTUALIZACION =
  'id, nombre, documento, anio_grado, email, telefono, ciudad, empresa, cargo, ' +
  'formacion_posterior, resumen, autoriza_datos, atendida, creado_en'

/* Público: lo envía el propio egresado desde la página. */
router.post('/actualizaciones', async (req, res) => {
  try {
    const datos = {
      nombre: String(req.body?.nombre ?? '').trim(),
      email: String(req.body?.email ?? '').trim().toLowerCase(),
      documento: String(req.body?.documento ?? '').trim(),
      anio_grado: String(req.body?.anio_grado ?? '').trim(),
      telefono: String(req.body?.telefono ?? '').trim(),
      ciudad: String(req.body?.ciudad ?? '').trim(),
      empresa: String(req.body?.empresa ?? '').trim(),
      cargo: String(req.body?.cargo ?? '').trim(),
      formacion_posterior: String(req.body?.formacion_posterior ?? 'Ninguna'),
      resumen: String(req.body?.resumen ?? '').trim(),
      autoriza_datos: req.body?.autoriza_datos === true || req.body?.autoriza_datos === 'true',
    }

    const errores = validar('actualizaciones', datos)
    if (hayErrores(errores)) return res.status(400).json({ error: Object.values(errores)[0], errores })

    /* Sin autorización de habeas data no se guarda nada: el dato personal no
       se recoge primero para pedir permiso después. */
    if (!datos.autoriza_datos) {
      return res.status(400).json({ error: 'Necesitamos tu autorización para tratar los datos' })
    }

    const campos = Object.keys(datos)
    const marcadores = campos.map((_, i) => '$' + (i + 1)).join(', ')
    const { rows } = await query(
      'INSERT INTO actualizacion_egresado (' + campos.join(', ') + ') VALUES (' + marcadores + ') RETURNING id, creado_en',
      campos.map(c => datos[c]),
    )
    res.status(201).json({ ok: true, id: rows[0].id, creado_en: rows[0].creado_en })
  } catch (e) { fallo(res, e) }
})

router.get('/actualizaciones', requireAdmin, async (_req, res) => {
  try {
    const { rows } = await query(
      'SELECT ' + SEL_ACTUALIZACION + ' FROM actualizacion_egresado ORDER BY atendida ASC, creado_en DESC',
    )
    res.json(rows)
  } catch (e) { fallo(res, e) }
})

router.patch('/actualizaciones/:id', requireAdmin, async (req, res) => {
  if (req.body?.atendida === undefined) return res.status(400).json({ error: 'Nada que actualizar' })
  try {
    const { rows } = await query(
      'UPDATE actualizacion_egresado SET atendida = $2 WHERE id = $1 RETURNING ' + SEL_ACTUALIZACION,
      [req.params.id, req.body.atendida === true || req.body.atendida === 'true'],
    )
    if (!rows[0]) return res.status(404).json({ error: 'Registro no encontrado' })
    res.json(rows[0])
  } catch (e) { fallo(res, e) }
})

router.delete('/actualizaciones/:id', requireAdmin, async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM actualizacion_egresado WHERE id = $1', [req.params.id])
    if (!rowCount) return res.status(404).json({ error: 'Registro no encontrado' })
    res.json({ ok: true })
  } catch (e) { fallo(res, e) }
})

/* ─── Agregado ─────────────────────────────────────────────────── */

/* Los dos bloques públicos de una vez. Lo usan GET /api/egresados y el
   agregador /api/all que alimenta la carga inicial del sitio.

   Los borradores no salen: el sitio público solo ve lo publicado. */
export async function bloquesEgresados() {
  const [destacados, ofertas] = await Promise.all([
    query('SELECT ' + SEL_EGRESADO + ' FROM egresado WHERE activo ORDER BY ' + ORD_EGRESADO),
    query('SELECT ' + SEL_OFERTA + " FROM oferta_empleo WHERE estado <> 'borrador' ORDER BY " + ORD_OFERTA),
  ])
  return {
    destacados: destacados.rows.map(conMedios),
    ofertas: ofertas.rows.map(conVigencia),
  }
}

router.get('/', async (_req, res) => {
  try {
    res.json(await bloquesEgresados())
  } catch (e) { fallo(res, e) }
})

export default router
