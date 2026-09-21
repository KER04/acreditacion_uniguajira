/* Módulo Egresados / trámite de grado — respaldado por PostgreSQL.
 *
 * Alimenta la vista pública "Egresados", que reúne cuatro bloques. Tres se
 * editan aquí; el cuarto se lee de donde ya vivía, para que el panel siga
 * teniendo un único sitio donde editarlo:
 *
 *   modalidades de grado     ->  modalidades_grado        (aquí)
 *   normativas               ->  normativa_grado          (aquí)
 *   ideas de investigación   ->  idea_investigacion       (aquí)
 *   convocatorias de práctica->  convocatoria 'Prácticas' (módulo Convocatorias)
 *
 * Las modalidades vivían en el módulo Estudiantes. Se mudaron con la tabla
 * intacta —sigue llamándose `modalidades_grado`— porque pertenecen al trámite
 * de grado, no a la vida del estudiante que todavía cursa: quien las consulta
 * ya terminó materias.
 *
 * De ahí que `bloquesGrado()` haga cuatro consultas: la vista pide una sola
 * cosa y esto le arma la respuesta completa.
 */
import { Router } from 'express'
import { query } from '../db/pool.js'
import { requireAdmin } from '../middleware/auth.js'
import { borrarSiHuerfano } from '../utils/archivos.js'
import {
  fallo, rechazaPorValidacion, camposDe, valorPara,
  sentenciaInsert, sentenciaUpdate,
} from '../utils/crud.js'

const router = Router()

const MENSAJES = {
  modalidades_nombre_no_vacio: 'El nombre debe tener al menos 3 caracteres',
  normativa_titulo_no_vacio: 'El título debe tener al menos 3 caracteres',
  normativa_tipo_valido:     'Tipo de norma no válido',
  normativa_anio_valido:     'El año debe estar entre 1976 y 2100',
  idea_titulo_no_vacio:      'El título debe tener al menos 3 caracteres',
  idea_estado_valido:        'El estado debe ser Disponible, Tomada, En curso o Terminada',
  idea_dificultad_valida:    'La dificultad debe ser Inicial, Intermedia o Avanzada',
}

const enlaceArchivo = id => '/api/archivos/' + id

/* ─── Modalidades de grado ─────────────────────────────────────── */

const COL_MODALIDAD = ['nombre', 'descripcion', 'requisitos', 'duracion', 'color', 'documento_url', 'orden']

const SEL_MODALIDAD = 'id, nombre, descripcion, requisitos, duracion, color, documento_url, orden'

export async function leerModalidades() {
  const { rows } = await query(
    'SELECT ' + SEL_MODALIDAD + ' FROM modalidades_grado ORDER BY orden ASC, id ASC')
  return rows.map(m => ({ ...m, requisitos: m.requisitos ?? [] }))
}

/* ─── Normativas ───────────────────────────────────────────────── */

const COL_NORMATIVA = [
  'titulo', 'descripcion', 'tipo', 'numero', 'anio',
  'expedida_por', 'url', 'archivo_id', 'vigente', 'orden',
]

/* El formulario manda '' cuando se borra el año o se quita el adjunto, y
   PostgreSQL rechaza '' como INTEGER. */
const NULAS_NORMATIVA = new Set(['anio', 'archivo_id'])

const SEL_NORMATIVA = 'id, titulo, descripcion, tipo, numero, anio, expedida_por, ' +
  'url, archivo_id, vigente, orden'

/* La norma apunta a un adjunto de la base o a una URL externa. El front usa
   `enlace` sin tener que saber cuál de las dos es. */
const conEnlace = n => ({
  ...n,
  enlace: n.archivo_id ? enlaceArchivo(n.archivo_id) : n.url,
  descarga: n.archivo_id ? enlaceArchivo(n.archivo_id) + '/descargar' : n.url,
  /* La cita como se escribe: "Acuerdo 015 de 2019". */
  referencia: [n.tipo, n.numero].filter(Boolean).join(' '),
})

export async function leerNormativas() {
  const { rows } = await query(
    'SELECT ' + SEL_NORMATIVA + ' FROM normativa_grado ORDER BY vigente DESC, orden ASC, id ASC')
  return rows.map(conEnlace)
}

/* ─── Ideas de investigación ───────────────────────────────────── */

const COL_IDEA = [
  'titulo', 'descripcion', 'linea', 'docente_id', 'modalidad_id',
  'estado', 'dificultad', 'palabras', 'contacto', 'orden',
]
const NULAS_IDEA = new Set(['docente_id', 'modalidad_id'])

/* El nombre del docente y el de la modalidad se traen resueltos: la vista los
   pinta como texto y sin esto tendría que cruzar tres colecciones en el
   navegador solo para escribir "Propuesta por …". */
const SEL_IDEA = `i.id, i.titulo, i.descripcion, i.linea, i.docente_id, i.modalidad_id,
  i.estado, i.dificultad, i.palabras, i.contacto, i.orden,
  d.nombre AS docente, m.nombre AS modalidad`

const DE_IDEA = `FROM idea_investigacion i
  LEFT JOIN docente d           ON d.id = i.docente_id
  LEFT JOIN modalidades_grado m ON m.id = i.modalidad_id`

/* Primero lo que todavía se puede tomar: quien entra busca una idea libre, no
   el catálogo histórico. */
const ORD_IDEA = "ORDER BY (i.estado = 'Disponible') DESC, i.orden ASC, i.id DESC"

const conTextos = i => ({
  ...i,
  palabras: i.palabras ?? [],
  docente: i.docente ?? '',
  modalidad: i.modalidad ?? '',
  disponible: i.estado === 'Disponible',
})

export async function leerIdeas() {
  const { rows } = await query(`SELECT ${SEL_IDEA} ${DE_IDEA} ${ORD_IDEA}`)
  return rows.map(conTextos)
}

/* ─── CRUD genérico sobre las dos tablas ───────────────────────── */

/* Mismo molde que el resto de módulos: listar, crear, modificar y borrar
   sobre una lista blanca de columnas. Nada que venga del cliente entra al SQL
   como identificador, solo como parámetro numerado. */
function recurso({ ruta, tabla, esquema, columnas, nulas, leer, seleccion, mapear, alBorrar }) {
  router.get('/' + ruta, async (_req, res) => {
    try { res.json(await leer()) } catch (e) { fallo(res, e, MENSAJES, ruta) }
  })

  router.post('/' + ruta, requireAdmin, async (req, res) => {
    if (rechazaPorValidacion(esquema, req, res, false)) return
    const campos = camposDe(columnas, req.body)
    if (!campos.length) return res.status(400).json({ error: 'No se recibió ningún dato' })
    try {
      const { rows } = await query(
        sentenciaInsert(tabla, campos, seleccion),
        campos.map(c => valorPara(c, req.body[c], nulas)),
      )
      res.status(201).json(await mapear(rows[0]))
    } catch (e) { fallo(res, e, MENSAJES, ruta) }
  })

  router.patch('/' + ruta + '/:id(\\d+)', requireAdmin, async (req, res) => {
    if (rechazaPorValidacion(esquema, req, res, true)) return
    const campos = camposDe(columnas, req.body)
    if (!campos.length) return res.status(400).json({ error: 'Nada que actualizar' })
    try {
      const { rows } = await query(
        sentenciaUpdate(tabla, campos, seleccion),
        [req.params.id, ...campos.map(c => valorPara(c, req.body[c], nulas))],
      )
      if (!rows.length) return res.status(404).json({ error: 'No encontrado' })
      res.json(await mapear(rows[0]))
    } catch (e) { fallo(res, e, MENSAJES, ruta) }
  })

  router.delete('/' + ruta + '/:id(\\d+)', requireAdmin, async (req, res) => {
    try {
      const { rows } = await query(
        'DELETE FROM ' + tabla + ' WHERE id = $1 RETURNING ' + seleccion, [req.params.id])
      if (!rows.length) return res.status(404).json({ error: 'No encontrado' })
      if (alBorrar) await alBorrar(rows[0])
      res.json({ ok: true })
    } catch (e) { fallo(res, e, MENSAJES, ruta) }
  })
}

recurso({
  ruta: 'modalidades',
  tabla: 'modalidades_grado',
  esquema: 'modalidades',
  columnas: COL_MODALIDAD,
  nulas: new Set(),
  leer: leerModalidades,
  seleccion: SEL_MODALIDAD,
  mapear: async f => ({ ...f, requisitos: f.requisitos ?? [] }),
})

recurso({
  ruta: 'normativas',
  tabla: 'normativa_grado',
  esquema: 'normativas',
  columnas: COL_NORMATIVA,
  nulas: NULAS_NORMATIVA,
  leer: leerNormativas,
  seleccion: SEL_NORMATIVA,
  mapear: async f => conEnlace(f),
  // El PDF de una norma borrada se queda sin dueño: no hay que acumularlo.
  alBorrar: f => borrarSiHuerfano(f.archivo_id),
})

recurso({
  ruta: 'ideas',
  tabla: 'idea_investigacion',
  esquema: 'ideas',
  columnas: COL_IDEA,
  nulas: NULAS_IDEA,
  leer: leerIdeas,
  seleccion: 'id, titulo, descripcion, linea, docente_id, modalidad_id, estado, dificultad, palabras, contacto, orden',
  /* El INSERT/UPDATE devuelve solo la fila; el nombre del docente y el de la
     modalidad viven en otras tablas y hay que volver a leerlos para que el
     panel reciba exactamente lo mismo que recibe al listar. */
  mapear: async f => {
    const { rows } = await query(`SELECT ${SEL_IDEA} ${DE_IDEA} WHERE i.id = $1`, [f.id])
    return conTextos(rows[0] ?? f)
  },
})

/* ─── Los cuatro bloques de una vez ────────────────────────────── */

/* Lo usan GET /api/grado y el agregador GET /api/all. Las prácticas se leen
   de la tabla de convocatorias, no de una copia. */
export async function bloquesGrado() {
  const [normativas, ideas, modalidades, practicas] = await Promise.all([
    leerNormativas(),
    leerIdeas(),
    leerModalidades(),
    query("SELECT id, titulo, descripcion, estado, dirigida_a, sede, requisitos," +
          " to_char(fecha_apertura, 'YYYY-MM-DD') AS fecha_apertura," +
          " to_char(fecha_cierre, 'YYYY-MM-DD') AS fecha_cierre," +
          " url_postulacion, documento_url" +
          " FROM convocatoria WHERE categoria = 'Prácticas'" +
          ' ORDER BY fecha_cierre ASC NULLS LAST, id DESC'),
  ])

  const hoy = new Date().toISOString().slice(0, 10)
  return {
    normativas,
    ideas,
    modalidades,
    /* `vencida` es derivado, como en convocatorias: dice si el cierre ya pasó
       aunque el estado siga diciendo "Abierta" porque nadie lo actualizó. */
    practicas: practicas.rows.map(p => ({
      ...p,
      requisitos: p.requisitos ?? [],
      vencida: Boolean(p.fecha_cierre) && p.fecha_cierre < hoy,
    })),
  }
}

router.get('/', async (_req, res) => {
  try { res.json(await bloquesGrado()) } catch (e) { fallo(res, e, MENSAJES, 'grado') }
})

export default router
