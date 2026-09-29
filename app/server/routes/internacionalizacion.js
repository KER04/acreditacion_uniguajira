/* Módulo Internacionalización — respaldado por PostgreSQL (migración 024).
 *
 * Sustituye la lectura/escritura de src/data/internacionalizacion.json.
 *
 *   /convenios      ->  convenio_internacional
 *   /convocatorias  ->  convocatoria_movilidad
 *   /redes          ->  red_academica
 *   /ori            ->  ori_contacto (fila única: GET y PATCH)
 *
 * GET / devuelve los cuatro de una vez para la página y para /api/all.
 */
import { Router } from 'express'
import { query } from '../db/pool.js'
import { requireAdmin } from '../middleware/auth.js'
import { crearFallo, crearRecurso } from '../utils/recurso.js'
import { validar, hayErrores } from '../../shared/validacion.js'

const router = Router()

const MENSAJES = {
  convenio_int_institucion:  'La institución debe tener al menos 2 caracteres',
  convenio_int_pais:         'El país debe tener al menos 2 caracteres',
  convenio_int_tipo:         'El tipo debe ser Marco o Específico',
  convenio_int_orden:        'El orden debe estar entre 0 y 999',
  convocatoria_mov_titulo:   'El título debe tener al menos 3 caracteres',
  convocatoria_mov_dirigido: 'Destinatario no válido',
  convocatoria_mov_fechas:   'El cierre no puede ser anterior a la apertura',
  convocatoria_mov_orden:    'El orden debe estar entre 0 y 999',
  red_sigla:                 'La sigla debe tener al menos 2 caracteres',
  red_alcance:               'El alcance debe ser Nacional o Internacional',
  red_orden:                 'El orden debe estar entre 0 y 999',
}

const fallo = crearFallo('internacionalizacion', MENSAJES)
const recurso = crearRecurso({ router, fallo })

/* Una fecha vaciada en el formulario llega como ''; PostgreSQL no la acepta. */
const NULABLES = ['fecha_fin', 'fecha_apertura', 'fecha_cierre']
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
  `id, institucion, pais, tipo, tema, objeto, intercambio, ${fecha('fecha_fin')}, url, orden`
const ORD_CONVENIO = 'pais ASC, orden ASC, institucion ASC'
const conVigencia = c => ({ ...c, vigente: !c.fecha_fin || c.fecha_fin >= hoy() })

recurso({
  ruta: 'convenios', tabla: 'convenio_internacional', esquema: 'convenios_internacionales',
  columnas: ['institucion', 'pais', 'tipo', 'tema', 'objeto', 'intercambio', 'fecha_fin', 'url', 'orden'],
  seleccion: SEL_CONVENIO, orden: ORD_CONVENIO, mapear: conVigencia,
})

/* ─── Convocatorias ────────────────────────────────────────────── */

const SEL_CONVOCATORIA =
  `id, titulo, dirigido, destino, descripcion, beneficios, ${fecha('fecha_apertura')}, ` +
  `${fecha('fecha_cierre')}, url, orden`
/* Las que cierran antes, primero; las cerradas, de la más reciente hacia atrás. */
const ORD_CONVOCATORIA =
  '(fecha_cierre IS NULL OR fecha_cierre >= CURRENT_DATE) DESC, ' +
  'CASE WHEN fecha_cierre >= CURRENT_DATE THEN fecha_cierre END ASC, fecha_cierre DESC NULLS FIRST, orden ASC'

/* Abierta se calcula: una convocatoria no puede quedarse «abierta» porque
   nadie entró al panel el día que cerraba. */
const conEstado = c => {
  const h = hoy()
  const abierta = (!c.fecha_apertura || c.fecha_apertura <= h) && (!c.fecha_cierre || c.fecha_cierre >= h)
  const proxima = Boolean(c.fecha_apertura) && c.fecha_apertura > h
  return { ...c, abierta, proxima }
}

recurso({
  ruta: 'convocatorias', tabla: 'convocatoria_movilidad', esquema: 'convocatorias_movilidad',
  columnas: ['titulo', 'dirigido', 'destino', 'descripcion', 'beneficios', 'fecha_apertura', 'fecha_cierre', 'url', 'orden'],
  seleccion: SEL_CONVOCATORIA, orden: ORD_CONVOCATORIA, mapear: conEstado,
})

/* ─── Redes ────────────────────────────────────────────────────── */

const SEL_RED = 'id, sigla, nombre, alcance, descripcion, url, orden'
const ORD_RED = 'orden ASC, sigla ASC'

recurso({
  ruta: 'redes', tabla: 'red_academica', esquema: 'redes_academicas',
  columnas: ['sigla', 'nombre', 'alcance', 'descripcion', 'url', 'orden'],
  seleccion: SEL_RED, orden: ORD_RED,
})

/* ─── ORI (fila única) ─────────────────────────────────────────── */

const COL_ORI = ['ubicacion', 'correos', 'telefono', 'url', 'requisitos', 'pasos']
const SEL_ORI = COL_ORI.join(', ')
const conListas = o => (o ? { ...o, correos: o.correos ?? [], requisitos: o.requisitos ?? [], pasos: o.pasos ?? [] } : null)

async function leerOri() {
  const { rows } = await query(`SELECT ${SEL_ORI} FROM ori_contacto WHERE id = 1`)
  return conListas(rows[0])
}

router.get('/ori', async (_req, res) => {
  try { res.json(await leerOri() ?? {}) } catch (e) { fallo(res, e) }
})

router.patch('/ori', requireAdmin, async (req, res) => {
  const errores = validar('ori_contacto', req.body ?? {}, { parcial: true })
  if (hayErrores(errores)) return res.status(400).json({ error: Object.values(errores)[0], errores })
  const campos = COL_ORI.filter(c => req.body?.[c] !== undefined)
  if (!campos.length) return res.status(400).json({ error: 'Nada que actualizar' })
  try {
    /* La fila puede no existir en una base anterior a la 024 sembrada a mano:
       se crea en el primer guardado. */
    await query('INSERT INTO ori_contacto (id) VALUES (1) ON CONFLICT (id) DO NOTHING')
    const asignaciones = campos.map((c, i) => `${c} = $${i + 1}`).join(', ')
    const { rows } = await query(
      `UPDATE ori_contacto SET ${asignaciones} WHERE id = 1 RETURNING ${SEL_ORI}`,
      campos.map(c => req.body[c]),
    )
    res.json(conListas(rows[0]))
  } catch (e) { fallo(res, e) }
})

/* ─── Los cuatro bloques de una vez ────────────────────────────── */

export async function bloquesInternacionalizacion() {
  const [convenios, convocatorias, redes, ori] = await Promise.all([
    query(`SELECT ${SEL_CONVENIO} FROM convenio_internacional ORDER BY ${ORD_CONVENIO}`),
    query(`SELECT ${SEL_CONVOCATORIA} FROM convocatoria_movilidad ORDER BY ${ORD_CONVOCATORIA}`),
    query(`SELECT ${SEL_RED} FROM red_academica ORDER BY ${ORD_RED}`),
    leerOri(),
  ])
  return {
    convenios: convenios.rows.map(conVigencia),
    convocatorias: convocatorias.rows.map(conEstado),
    redes: redes.rows,
    ori,
  }
}

router.get('/', async (_req, res) => {
  try { res.json(await bloquesInternacionalizacion()) } catch (e) { fallo(res, e) }
})

export default router
