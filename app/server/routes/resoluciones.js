/* Módulo Resoluciones — marco legal del programa (migración 025).
 *
 * REST por elemento sobre `acto_programa` con la fábrica común. El PDF se sube
 * aparte por /api/estudiantes/upload-doc (el mismo que usan las normativas de
 * grado) y aquí solo se guarda el `archivo_id` que devuelve.
 */
import { Router } from 'express'
import { query } from '../db/pool.js'
import { crearFallo, crearRecurso } from '../utils/recurso.js'
import { borrarSiHuerfano } from '../utils/archivos.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

const fallo = crearFallo('resoluciones', {
  acto_asunto_no_vacio:  'El asunto debe tener al menos 3 caracteres',
  acto_categoria_valida: 'Categoría no válida',
  acto_tipo_valido:      'Tipo de acto no válido',
  acto_fechas:           'El vencimiento no puede ser anterior a la fecha del acto',
  acto_orden_valido:     'El orden debe estar entre 0 y 999',
})
const recurso = crearRecurso({ router, fallo })

/* Fechas vaciadas y el adjunto quitado llegan como ''; la base quiere NULL. */
const NULABLES = ['fecha', 'fecha_fin', 'archivo_id']
router.use((req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const c of NULABLES) if (req.body[c] === '') req.body[c] = null
  }
  next()
})

const fecha = c => `to_char(${c}, 'YYYY-MM-DD') AS ${c}`
/* Extensión y peso del adjunto van como subconsulta y no como JOIN: la fábrica
   común arma el SQL con `FROM tabla` y el mismo SELECT sirve en el RETURNING.
   La ficha de la página los necesita para saber si el PDF se puede previsualizar. */
const SEL = `id, categoria, tipo, numero, ${fecha('fecha')}, expedido_por, asunto, descripcion, ` +
  `vigencia, ${fecha('fecha_fin')}, archivo_id, url, orden, ` +
  '(SELECT extension FROM archivos WHERE archivos.id = archivo_id) AS archivo_ext, ' +
  '(SELECT bytes FROM archivos WHERE archivos.id = archivo_id) AS archivo_bytes'
/* Registro y acreditación primero; dentro de cada grupo, lo más reciente. */
const ORD = "CASE categoria WHEN 'registro' THEN 0 WHEN 'acreditacion' THEN 1 ELSE 2 END, " +
  'fecha DESC NULLS LAST, orden ASC, id DESC'

const enlaceArchivo = id => '/api/archivos/' + id

/* Vigente se deduce del vencimiento; sin fecha de fin no se afirma que haya
   vencido. El front recibe el enlace armado, venga de la base o de fuera. */
const conEstado = a => ({
  ...a,
  vencido: Boolean(a.fecha_fin) && a.fecha_fin < new Date().toISOString().slice(0, 10),
  referencia: [a.tipo, a.numero].filter(Boolean).join(' '),
  enlace: a.archivo_id ? enlaceArchivo(a.archivo_id) : a.url,
  descarga: a.archivo_id ? enlaceArchivo(a.archivo_id) + '/descargar' : a.url,
})

export async function leerActos() {
  const { rows } = await query(`SELECT ${SEL} FROM acto_programa ORDER BY ${ORD}`)
  return rows.map(conEstado)
}

/* Va ANTES del recurso genérico: el DELETE de serie dejaría el PDF sin dueño
   hasta el barrido de 24 h. Aquí se suelta en el momento. */
router.delete('/:id(\\d+)', requireAdmin, async (req, res) => {
  try {
    const { rows } = await query('DELETE FROM acto_programa WHERE id = $1 RETURNING archivo_id', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'No encontrado' })
    await borrarSiHuerfano(rows[0].archivo_id)
    res.json({ ok: true })
  } catch (e) { fallo(res, e) }
})

recurso({
  ruta: '', tabla: 'acto_programa', esquema: 'actos_programa',
  columnas: ['categoria', 'tipo', 'numero', 'fecha', 'expedido_por', 'asunto', 'descripcion',
    'vigencia', 'fecha_fin', 'archivo_id', 'url', 'orden'],
  seleccion: SEL, orden: ORD, mapear: conEstado,
})

export default router
