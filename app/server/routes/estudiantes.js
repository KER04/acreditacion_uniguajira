/* Módulo Estudiantes — respaldado por PostgreSQL.

   Sustituye la lectura/escritura de src/data/estudiantes.json. La API pasa de
   "reemplaza el arreglo completo" (idiom de archivo JSON, que perdía los ids en
   cada guardado) a REST por elemento: POST / PATCH / DELETE. */
import { Router } from 'express'
import { query } from '../db/pool.js'
import { requireAdmin } from '../middleware/auth.js'
import {
  enMemoria, guardarArchivo, borrarSiHuerfano, extensionDe,
  nombreOriginalUtf8, EXTENSIONES_IMAGEN, LIMITE_DOCUMENTO, LIMITE_FOTO,
} from '../utils/archivos.js'
import {
  validar, hayErrores,
  EXTENSIONES_ACEPTADAS, tipoDesdeArchivo, nombreDesdeArchivo, pesoLegible,
} from '../../shared/validacion.js'

/* Los adjuntos van a la base, así que multer los recibe en memoria. */
const subidaDocumento = enMemoria(LIMITE_DOCUMENTO)
const subidaFoto = enMemoria(LIMITE_FOTO)

const enlaceArchivo = id => '/api/archivos/' + id

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

const router = Router()

/* ─── Utilidades ───────────────────────────────────────────────── */

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

/* '2026-10-17' + '2026-10-22'  ->  '17 - 22 Oct'
   '2027-02-14'                 ->  '14 Feb 2027'   (el año, solo si no es el actual) */
function etiquetaFecha(inicio, fin) {
  if (!inicio) return ''
  const partes = iso => iso.split('-').map(Number)   // sin pasar por Date: nada de zonas horarias
  const dia = n => String(n).padStart(2, '0')

  const [ai, mi, di] = partes(inicio)
  const sufijo = ai === new Date().getFullYear() ? '' : ' ' + ai

  if (!fin || fin === inicio) return dia(di) + ' ' + MESES[mi - 1] + sufijo

  const [af, mf, df] = partes(fin)
  if (ai === af && mi === mf) return dia(di) + ' - ' + dia(df) + ' ' + MESES[mi - 1] + sufijo
  if (ai === af) return dia(di) + ' ' + MESES[mi - 1] + ' - ' + dia(df) + ' ' + MESES[mf - 1] + sufijo
  return dia(di) + ' ' + MESES[mi - 1] + ' ' + ai + ' - ' + dia(df) + ' ' + MESES[mf - 1] + ' ' + af
}

/* La base es la ultima red: si algo se salta la validacion de arriba, estos
   son los mensajes con los que responde en vez de un nombre de restriccion. */
const MENSAJE_RESTRICCION = {
  honor_promedio_valido:       'El promedio debe estar entre 0.0 y 5.0',
  honor_semestre_valido:       'El semestre debe estar entre 1 y 10',
  honor_periodo_valido:        'El periodo debe tener el formato 2026-I o 2026-II',
  honor_sede_valida:           'La sede debe ser riohacha o maicao',
  honor_nombre_no_vacio:       'El nombre debe tener al menos 3 caracteres',
  calendario_rango_coherente:  'La fecha final no puede ser anterior a la inicial',
  calendario_tipo_valido:      'Tipo de evento no valido',
  calendario_sede_valida:      'La sede debe ser ambas, riohacha o maicao',
  calendario_periodo_valido:   'El periodo debe tener el formato 2026-I o 2026-II',
  calendario_titulo_no_vacio:  'El evento debe tener al menos 3 caracteres',
  modalidades_nombre_no_vacio: 'El nombre debe tener al menos 3 caracteres',
  documentos_nombre_no_vacio:  'El nombre debe tener al menos 3 caracteres',
  documentos_tipo_valido:      'Tipo de documento no valido',
}

/* Traduce los errores del motor a respuestas que el panel pueda mostrar. */
function fallo(res, e) {
  if (e.code === '23514') {
    return res.status(400).json({ error: MENSAJE_RESTRICCION[e.constraint] ?? ('Dato fuera de rango (' + e.constraint + ')') })
  }
  if (e.code === '23505') return res.status(409).json({ error: 'Ese registro ya existe' })
  if (e.code === '22P02' || e.code === '22008') return res.status(400).json({ error: 'Formato de dato inválido' })
  console.error('[estudiantes]', e)
  return res.status(500).json({ error: 'Error interno del servidor' })
}

/* Monta GET / POST / PATCH / DELETE sobre una tabla.
   `columnas` es lista blanca: nada que venga del cliente entra al SQL como
   identificador, solo como parámetro numerado. */
function recurso({ ruta, tabla, columnas, seleccion, orden, mapear }) {
  const salida = fila => (mapear ? mapear(fila) : fila)

  /* Corre el esquema compartido con el panel. Devuelve true si ya respondio. */
  const rechazaPorValidacion = (req, res, parcial) => {
    const errores = validar(ruta, req.body ?? {}, { parcial })
    if (!hayErrores(errores)) return false
    res.status(400).json({ error: Object.values(errores)[0], errores })
    return true
  }

  router.get('/' + ruta, async (_req, res) => {
    try {
      const { rows } = await query('SELECT ' + seleccion + ' FROM ' + tabla + ' ORDER BY ' + orden)
      res.json(rows.map(salida))
    } catch (e) { fallo(res, e) }
  })

  router.post('/' + ruta, requireAdmin, async (req, res) => {
    if (rechazaPorValidacion(req, res, false)) return
    const campos = columnas.filter(c => req.body?.[c] !== undefined)
    if (!campos.length) return res.status(400).json({ error: 'No se recibio ningun dato' })

    try {
      const marcadores = campos.map((_, i) => '$' + (i + 1)).join(', ')
      const { rows } = await query(
        'INSERT INTO ' + tabla + ' (' + campos.join(', ') + ') VALUES (' + marcadores + ') RETURNING ' + seleccion,
        campos.map(c => req.body[c]),
      )
      res.status(201).json(salida(rows[0]))
    } catch (e) { fallo(res, e) }
  })

  router.patch('/' + ruta + '/:id', requireAdmin, async (req, res) => {
    if (rechazaPorValidacion(req, res, true)) return
    const campos = columnas.filter(c => req.body?.[c] !== undefined)
    if (!campos.length) return res.status(400).json({ error: 'Nada que actualizar' })

    try {
      const asignaciones = campos.map((c, i) => c + ' = $' + (i + 2)).join(', ')
      const { rows } = await query(
        'UPDATE ' + tabla + ' SET ' + asignaciones + ' WHERE id = $1 RETURNING ' + seleccion,
        [req.params.id, ...campos.map(c => req.body[c])],
      )
      if (!rows[0]) return res.status(404).json({ error: 'No encontrado' })
      res.json(salida(rows[0]))
    } catch (e) { fallo(res, e) }
  })

  router.delete('/' + ruta + '/:id', requireAdmin, async (req, res) => {
    try {
      const { rowCount } = await query('DELETE FROM ' + tabla + ' WHERE id = $1', [req.params.id])
      if (!rowCount) return res.status(404).json({ error: 'No encontrado' })
      res.json({ ok: true })
    } catch (e) { fallo(res, e) }
  })
}

/* ─── Los cuatro bloques ───────────────────────────────────────── */

const SEL_HONOR = 'id, nombre, promedio, semestre, periodo, sede, foto_id'
const ORD_HONOR = 'promedio DESC, nombre ASC'

/* La foto se sirve desde la base; el front solo necesita la ruta. */
const conFoto = f => ({ ...f, foto_url: f.foto_id ? enlaceArchivo(f.foto_id) : '' })

/* Un documento apunta a un adjunto en la base o, si es de tipo Enlace, a una
   URL externa. El front consume `url` sin tener que saber cuál de las dos es. */
const conEnlace = f => ({
  ...f,
  url: f.archivo_id ? enlaceArchivo(f.archivo_id) : f.url,
  descarga: f.archivo_id ? enlaceArchivo(f.archivo_id) + '/descargar' : f.url,
})

/* to_char evita que el driver convierta DATE a un Date en la zona local
   y se coma un día por el camino. */
const SEL_CALENDARIO = "id, titulo, to_char(fecha_inicio, 'YYYY-MM-DD') AS fecha_inicio, " +
  "to_char(fecha_fin, 'YYYY-MM-DD') AS fecha_fin, tipo, periodo, sede, destacado"

const SEL_MODALIDADES = 'id, nombre, descripcion, requisitos, duracion, color, documento_url, orden'
const SEL_DOCUMENTOS = 'id, nombre, descripcion, url, tipo, grupo, peso, orden, archivo_id'
const ORD_DOCUMENTOS = 'grupo ASC, orden ASC, id ASC'
const SEL_DOC_HONOR = 'id, honor_id, nombre, descripcion, tipo, peso, orden, archivo_id'

const conEtiqueta = f => ({ ...f, etiqueta_fecha: etiquetaFecha(f.fecha_inicio, f.fecha_fin) })

recurso({
  ruta: 'honor',
  tabla: 'cuadro_honor',
  // foto_url ya no se escribe a mano: la foto se sube y queda como foto_id.
  columnas: ['nombre', 'promedio', 'semestre', 'periodo', 'sede'],
  seleccion: SEL_HONOR,
  orden: ORD_HONOR,
  mapear: conFoto,
})

recurso({
  ruta: 'calendario',
  tabla: 'calendario_academico',
  columnas: ['titulo', 'fecha_inicio', 'fecha_fin', 'tipo', 'periodo', 'sede', 'destacado'],
  seleccion: SEL_CALENDARIO,
  orden: 'fecha_inicio ASC',
  // La etiqueta legible se calcula aquí para que el front no repita el formateo.
  mapear: conEtiqueta,
})

recurso({
  ruta: 'modalidades',
  tabla: 'modalidades_grado',
  columnas: ['nombre', 'descripcion', 'requisitos', 'duracion', 'color', 'documento_url', 'orden'],
  seleccion: SEL_MODALIDADES,
  orden: 'orden ASC, id ASC',
})

recurso({
  ruta: 'documentos',
  tabla: 'documentos_estudiantes',
  columnas: ['nombre', 'descripcion', 'url', 'tipo', 'grupo', 'peso', 'orden', 'archivo_id'],
  seleccion: SEL_DOCUMENTOS,
  orden: ORD_DOCUMENTOS,
  mapear: conEnlace,
})

/* Los cuatro bloques de una sola vez. Lo usan tanto GET /api/estudiantes como
   el agregador GET /api/all que alimenta la carga inicial del sitio. */
export async function bloquesEstudiantes() {
  const [honor, calendario, modalidades, documentos] = await Promise.all([
    query('SELECT ' + SEL_HONOR + ' FROM cuadro_honor ORDER BY ' + ORD_HONOR),
    query('SELECT ' + SEL_CALENDARIO + ' FROM calendario_academico ORDER BY fecha_inicio ASC'),
    query('SELECT ' + SEL_MODALIDADES + ' FROM modalidades_grado ORDER BY orden ASC, id ASC'),
    query('SELECT ' + SEL_DOCUMENTOS + ' FROM documentos_estudiantes ORDER BY ' + ORD_DOCUMENTOS),
  ])
  return {
    honor: honor.rows.map(conFoto),
    calendario: calendario.rows.map(conEtiqueta),
    modalidades_grado: modalidades.rows,
    documentos: documentos.rows.map(conEnlace),
  }
}

router.get('/', async (_req, res) => {
  try {
    res.json(await bloquesEstudiantes())
  } catch (e) { fallo(res, e) }
})

/* ─── Adjuntos ─────────────────────────────────────────────────── */

/* Comprueba el archivo recibido y lo guarda en la base. Devuelve la ficha
   lista para el panel, o null si ya respondió con un error. */
async function recibirDocumento(req, res) {
  if (!req.file) {
    res.status(400).json({
      error: 'No se recibió ningún archivo. Formatos admitidos: ' + EXTENSIONES_ACEPTADAS.join(', ').toUpperCase(),
    })
    return null
  }
  const original = nombreOriginalUtf8(req.file.originalname)
  const tipo = tipoDesdeArchivo(original)
  if (!tipo) {
    res.status(400).json({
      error: 'Tipo de archivo no admitido. Se aceptan: ' + EXTENSIONES_ACEPTADAS.join(', ').toUpperCase(),
    })
    return null
  }
  const archivo = await guardarArchivo(req.file, { usuarioId: req.usuario?.id })
  return {
    archivo_id: archivo.id,
    url: enlaceArchivo(archivo.id),
    descarga: enlaceArchivo(archivo.id) + '/descargar',
    nombre: nombreDesdeArchivo(original),
    tipo,
    peso: pesoLegible(archivo.bytes),
    bytes: archivo.bytes,
    archivo_original: original,
  }
}

/* Sube un documento a la base y devuelve nombre, tipo y peso ya deducidos,
   para que el panel solo tenga que confirmarlos. */
router.post('/upload-doc', requireAdmin, conSubida(subidaDocumento.single('archivo'), 10), async (req, res) => {
  try {
    const ficha = await recibirDocumento(req, res)
    if (ficha) res.json(ficha)
  } catch (e) { fallo(res, e) }
})

/* ─── Foto del estudiante destacado ────────────────────────────── */

router.post('/honor/:id/foto', requireAdmin, conSubida(subidaFoto.single('foto'), 3), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen' })

    const original = nombreOriginalUtf8(req.file.originalname)
    if (!EXTENSIONES_IMAGEN.includes(extensionDe(original))) {
      return res.status(400).json({ error: 'La foto debe ser ' + EXTENSIONES_IMAGEN.join(', ').toUpperCase() })
    }

    const previa = await query('SELECT foto_id FROM cuadro_honor WHERE id = $1', [req.params.id])
    if (!previa.rows[0]) return res.status(404).json({ error: 'Estudiante no encontrado' })

    const archivo = await guardarArchivo(req.file, { usuarioId: req.usuario?.id })
    const { rows } = await query(
      'UPDATE cuadro_honor SET foto_id = $2 WHERE id = $1 RETURNING ' + SEL_HONOR,
      [req.params.id, archivo.id],
    )
    // La foto anterior queda sin dueño: se borra para no acumular adjuntos.
    await borrarSiHuerfano(previa.rows[0].foto_id)

    res.json({ ...conFoto(rows[0]), bytes: archivo.bytes, peso: pesoLegible(archivo.bytes) })
  } catch (e) { fallo(res, e) }
})

router.delete('/honor/:id/foto', requireAdmin, async (req, res) => {
  try {
    /* Hay que leer el id anterior ANTES de borrarlo: en el RETURNING de un
       UPDATE la subconsulta ya vería la fila actualizada. */
    const previa = await query('SELECT foto_id FROM cuadro_honor WHERE id = $1', [req.params.id])
    if (!previa.rows[0]) return res.status(404).json({ error: 'Estudiante no encontrado' })

    const { rows } = await query(
      'UPDATE cuadro_honor SET foto_id = NULL WHERE id = $1 RETURNING ' + SEL_HONOR,
      [req.params.id],
    )
    await borrarSiHuerfano(previa.rows[0].foto_id)
    res.json(conFoto(rows[0]))
  } catch (e) { fallo(res, e) }
})

/* ─── Documentos propios de cada destacado ─────────────────────── */

router.get('/honor/:id/documentos', async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT ' + SEL_DOC_HONOR + ' FROM documentos_honor WHERE honor_id = $1 ORDER BY orden ASC, id ASC',
      [req.params.id],
    )
    res.json(rows.map(conEnlace))
  } catch (e) { fallo(res, e) }
})

/* Un solo paso: sube el archivo y crea el registro. El nombre puede venir en
   el formulario; si no, se deduce del archivo. */
router.post('/honor/:id/documentos', requireAdmin, conSubida(subidaDocumento.single('archivo'), 10), async (req, res) => {
  try {
    const existe = await query('SELECT 1 FROM cuadro_honor WHERE id = $1', [req.params.id])
    if (!existe.rowCount) return res.status(404).json({ error: 'Estudiante no encontrado' })

    const ficha = await recibirDocumento(req, res)
    if (!ficha) return

    const nombre = String(req.body?.nombre ?? '').trim() || ficha.nombre
    const errores = validar('documentos_honor', { nombre, descripcion: req.body?.descripcion ?? '', tipo: ficha.tipo, peso: ficha.peso })
    if (hayErrores(errores)) {
      await borrarSiHuerfano(ficha.archivo_id)
      return res.status(400).json({ error: Object.values(errores)[0], errores })
    }

    const { rows } = await query(
      `INSERT INTO documentos_honor (honor_id, archivo_id, nombre, descripcion, tipo, peso, orden)
       VALUES ($1, $2, $3, $4, $5, $6,
               COALESCE((SELECT MAX(orden) + 1 FROM documentos_honor WHERE honor_id = $1), 0))
       RETURNING ` + SEL_DOC_HONOR,
      [req.params.id, ficha.archivo_id, nombre, req.body?.descripcion ?? '', ficha.tipo, ficha.peso],
    )
    res.status(201).json(conEnlace(rows[0]))
  } catch (e) { fallo(res, e) }
})

router.patch('/honor/documentos/:docId', requireAdmin, async (req, res) => {
  const permitidas = ['nombre', 'descripcion', 'orden']
  const campos = permitidas.filter(c => req.body?.[c] !== undefined)
  if (!campos.length) return res.status(400).json({ error: 'Nada que actualizar' })

  const errores = validar('documentos_honor', req.body, { parcial: true })
  if (hayErrores(errores)) return res.status(400).json({ error: Object.values(errores)[0], errores })

  try {
    const asignaciones = campos.map((c, i) => c + ' = $' + (i + 2)).join(', ')
    const { rows } = await query(
      'UPDATE documentos_honor SET ' + asignaciones + ' WHERE id = $1 RETURNING ' + SEL_DOC_HONOR,
      [req.params.docId, ...campos.map(c => req.body[c])],
    )
    if (!rows[0]) return res.status(404).json({ error: 'Documento no encontrado' })
    res.json(conEnlace(rows[0]))
  } catch (e) { fallo(res, e) }
})

router.delete('/honor/documentos/:docId', requireAdmin, async (req, res) => {
  try {
    const { rows } = await query(
      'DELETE FROM documentos_honor WHERE id = $1 RETURNING archivo_id',
      [req.params.docId],
    )
    if (!rows[0]) return res.status(404).json({ error: 'Documento no encontrado' })
    await borrarSiHuerfano(rows[0].archivo_id)
    res.json({ ok: true })
  } catch (e) { fallo(res, e) }
})

export default router
