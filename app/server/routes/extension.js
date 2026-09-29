/* Módulo Extensión — respaldado por PostgreSQL (migración 022).
 *
 * Sustituye la lectura/escritura de src/data/extension.json. REST por
 * elemento sobre tres recursos, con la fábrica común de utils/recurso.js:
 *
 *   /convenios  ->  convenio_extension
 *   /proyectos  ->  proyecto_extension
 *   /cursos     ->  curso_extension
 *
 * GET / devuelve los tres de una vez para la página y para /api/all.
 */
import { Router } from 'express'
import { query } from '../db/pool.js'
import { crearFallo, crearRecurso } from '../utils/recurso.js'

const router = Router()

const MENSAJES = {
  convenio_organizacion_no_vacia: 'La organización debe tener al menos 2 caracteres',
  convenio_sector_valido:         'Sector no válido',
  convenio_anio_valido:           'El año debe estar entre 1976 y 2100',
  convenio_orden_valido:          'El orden debe estar entre 0 y 999',
  proyecto_ext_titulo_no_vacio:   'El título debe tener al menos 3 caracteres',
  proyecto_ext_sede_valida:       'La sede debe ser ambas, riohacha o maicao',
  proyecto_ext_estado_valido:     'Estado no válido',
  proyecto_ext_fechas:            'La fecha final no puede ser anterior a la inicial',
  proyecto_ext_orden_valido:      'El orden debe estar entre 0 y 999',
  curso_ext_titulo_no_vacio:      'El título debe tener al menos 3 caracteres',
  curso_ext_tipo_valido:          'Tipo de curso no válido',
  curso_ext_modalidad:            'Modalidad no válida',
  curso_ext_horas_valido:         'Las horas deben estar entre 1 y 2000',
  curso_ext_fechas:               'La fecha final no puede ser anterior a la inicial',
  curso_ext_orden_valido:         'El orden debe estar entre 0 y 999',
}

const fallo = crearFallo('extension', MENSAJES)
const recurso = crearRecurso({ router, fallo })

/* Un campo de fecha o número vaciado en el formulario llega como '', y
   PostgreSQL rechaza '' como DATE o INTEGER. Vaciar tiene que poder vaciar. */
const NULABLES = ['anio_inicio', 'fecha_fin', 'fecha_inicio', 'horas']
router.use((req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const c of NULABLES) if (req.body[c] === '') req.body[c] = null
  }
  next()
})

const hoy = () => new Date().toISOString().slice(0, 10)
const fecha = c => `to_char(${c}, 'YYYY-MM-DD') AS ${c}`

/* ─── Convenios ────────────────────────────────────────────────── */

const SEL_CONVENIO =
  `id, organizacion, sector, tipo, descripcion, anio_inicio, ${fecha('fecha_fin')}, url, color, orden`
const ORD_CONVENIO = 'orden ASC, anio_inicio DESC NULLS LAST, id ASC'

/* Vigente se calcula: si dependiera de un campo, bastaría con que nadie
   entrara al panel para que un convenio vencido siguiera contando. */
const conVigencia = c => ({ ...c, vigente: !c.fecha_fin || c.fecha_fin >= hoy() })

recurso({
  ruta: 'convenios', tabla: 'convenio_extension', esquema: 'convenios',
  columnas: ['organizacion', 'sector', 'tipo', 'descripcion', 'anio_inicio', 'fecha_fin', 'url', 'color', 'orden'],
  seleccion: SEL_CONVENIO, orden: ORD_CONVENIO, mapear: conVigencia,
})

/* ─── Proyectos ────────────────────────────────────────────────── */

const SEL_PROYECTO =
  `id, titulo, descripcion, comunidad, municipio, sede, estado, ${fecha('fecha_inicio')}, ` +
  `${fecha('fecha_fin')}, integrantes, fuente_url, orden`
/* Lo que está en marcha primero; lo terminado al final. */
const ORD_PROYECTO =
  "CASE estado WHEN 'En ejecución' THEN 0 WHEN 'Formulación' THEN 1 ELSE 2 END, orden ASC, fecha_inicio DESC NULLS LAST, id DESC"
const conIntegrantes = p => ({ ...p, integrantes: p.integrantes ?? [] })

recurso({
  ruta: 'proyectos', tabla: 'proyecto_extension', esquema: 'proyectos_extension',
  columnas: ['titulo', 'descripcion', 'comunidad', 'municipio', 'sede', 'estado', 'fecha_inicio', 'fecha_fin', 'integrantes', 'fuente_url', 'orden'],
  seleccion: SEL_PROYECTO, orden: ORD_PROYECTO, mapear: conIntegrantes,
})

/* ─── Educación continua ───────────────────────────────────────── */

const SEL_CURSO =
  `id, titulo, tipo, descripcion, horas, modalidad, ${fecha('fecha_inicio')}, ${fecha('fecha_fin')}, ` +
  'url_inscripcion, activo, orden'
const ORD_CURSO = 'activo DESC, fecha_inicio ASC NULLS LAST, orden ASC, id ASC'

/* Un curso ya terminado sigue en el panel pero no se ofrece en la página. */
const conCierre = c => ({ ...c, terminado: Boolean(c.fecha_fin) && c.fecha_fin < hoy() })

recurso({
  ruta: 'cursos', tabla: 'curso_extension', esquema: 'cursos_extension',
  columnas: ['titulo', 'tipo', 'descripcion', 'horas', 'modalidad', 'fecha_inicio', 'fecha_fin', 'url_inscripcion', 'activo', 'orden'],
  seleccion: SEL_CURSO, orden: ORD_CURSO, mapear: conCierre,
})

/* ─── Los tres bloques de una vez ──────────────────────────────── */

export async function bloquesExtension() {
  const [convenios, proyectos, cursos] = await Promise.all([
    query(`SELECT ${SEL_CONVENIO} FROM convenio_extension ORDER BY ${ORD_CONVENIO}`),
    query(`SELECT ${SEL_PROYECTO} FROM proyecto_extension ORDER BY ${ORD_PROYECTO}`),
    query(`SELECT ${SEL_CURSO} FROM curso_extension ORDER BY ${ORD_CURSO}`),
  ])
  return {
    convenios: convenios.rows.map(conVigencia),
    proyectos: proyectos.rows.map(conIntegrantes),
    cursos: cursos.rows.map(conCierre),
  }
}

router.get('/', async (_req, res) => {
  try { res.json(await bloquesExtension()) } catch (e) { fallo(res, e) }
})

export default router
