/* Módulo Contacto — dirección, sedes y organigrama (migración 026).
 *
 * Sustituye a routes/sedes.js y src/data/sedes.json.
 *
 *   /sedes/:sede  ->  contacto_sede      (GET lista en /, PATCH por sede)
 *   /cargos       ->  cargo_programa     (REST por elemento)
 *   /programa     ->  contacto_programa  (fila única: GET y PATCH)
 *
 * `infoSedes()` arma el objeto `info_sedes` con la forma que ya leía el pie de
 * página, para que el pie no tenga que cambiar.
 */
import { Router } from 'express'
import { query } from '../db/pool.js'
import { requireAdmin } from '../middleware/auth.js'
import { crearFallo, crearRecurso } from '../utils/recurso.js'
import { validar, hayErrores } from '../../shared/validacion.js'
import {
  enMemoria, guardarArchivo, borrarSiHuerfano, extensionDe,
  nombreOriginalUtf8, EXTENSIONES_IMAGEN, LIMITE_FOTO,
} from '../utils/archivos.js'

const router = Router()

const fallo = crearFallo('contacto', {
  cargo_nombre_no_vacio: 'El nombre debe tener al menos 3 caracteres',
  cargo_cargo_no_vacio:  'El cargo debe tener al menos 3 caracteres',
  cargo_nivel_valido:    'Nivel no válido',
  cargo_sede_valida:     'La sede debe ser ambas, riohacha o maicao',
  cargo_orden_valido:    'El orden debe estar entre 0 y 999',
})
const recurso = crearRecurso({ router, fallo })

/* El selector de docente manda '' cuando se deja «sin vincular». */
router.use((req, _res, next) => {
  if (req.body && req.body.docente_id === '') req.body.docente_id = null
  next()
})

const rechaza = (esquema, req, res) => {
  const errores = validar(esquema, req.body ?? {}, { parcial: true })
  if (!hayErrores(errores)) return false
  res.status(400).json({ error: Object.values(errores)[0], errores })
  return true
}

/* PATCH de una fila fija: solo columnas de la lista blanca, como parámetros. */
async function actualizarFila(tabla, clave, valor, columnas, body) {
  const campos = columnas.filter(c => body?.[c] !== undefined)
  if (!campos.length) return null
  const asignaciones = campos.map((c, i) => `${c} = $${i + 2}`).join(', ')
  const { rows } = await query(
    `UPDATE ${tabla} SET ${asignaciones} WHERE ${clave} = $1 RETURNING *`,
    [valor, ...campos.map(c => body[c])],
  )
  return rows[0] ?? null
}

/* ─── Sedes ────────────────────────────────────────────────────── */

const COL_SEDE = ['nombre', 'ubicacion', 'direccion', 'ciudad', 'correo', 'telefono', 'extension', 'horario', 'url']
const SEL_SEDE = 'sede, ' + COL_SEDE.join(', ') + ', orden'

async function leerSedes() {
  const { rows } = await query(`SELECT ${SEL_SEDE} FROM contacto_sede ORDER BY orden, sede`)
  return rows
}

router.patch('/sedes/:sede', requireAdmin, async (req, res) => {
  if (rechaza('contacto_sede', req, res)) return
  try {
    const fila = await actualizarFila('contacto_sede', 'sede', req.params.sede, COL_SEDE, req.body)
    if (!fila) return res.status(404).json({ error: 'Sede no encontrada o nada que actualizar' })
    res.json(fila)
  } catch (e) { fallo(res, e) }
})

/* ─── Organigrama ──────────────────────────────────────────────── */

const COL_CARGO = ['nombre', 'cargo', 'nivel', 'sede', 'area', 'descripcion', 'correo', 'extension', 'ubicacion', 'docente_id', 'orden']
/* Dos fuentes de foto: la propia del cargo (027) y, si no hay, la de la ficha
   del docente vinculado. `foto_id` no está en COL_CARGO: se cambia solo por
   las rutas de subida, nunca con un PATCH que traiga un id cualquiera. */
const SEL_CARGO = 'id, ' + COL_CARGO.join(', ') + ', foto_id, ' +
  '(SELECT foto_id FROM docente WHERE docente.id = docente_id) AS foto_docente_id'
const ORD_CARGO = "CASE nivel WHEN 'direccion' THEN 0 WHEN 'coordinacion' THEN 1 ELSE 2 END, orden ASC, id ASC"
const conFoto = c => {
  const id = c.foto_id ?? c.foto_docente_id
  return {
    ...c,
    foto_url: id ? '/api/archivos/' + id : '',
    foto_propia: Boolean(c.foto_id),
    foto_de_docente: !c.foto_id && Boolean(c.foto_docente_id),
  }
}

async function unCargo(id) {
  const { rows } = await query(`SELECT ${SEL_CARGO} FROM cargo_programa WHERE id = $1`, [id])
  return rows[0] ? conFoto(rows[0]) : null
}

/* ─── Foto propia del cargo ────────────────────────────────────── */

const subidaFoto = enMemoria(LIMITE_FOTO)

router.post('/cargos/:id(\\d+)/foto', requireAdmin, (req, res, next) =>
  subidaFoto.single('foto')(req, res, err => {
    if (!err) return next()
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'La foto pasa del límite de 3 MB' })
    next(err)
  }),
async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen' })
    if (!EXTENSIONES_IMAGEN.includes(extensionDe(nombreOriginalUtf8(req.file.originalname)))) {
      return res.status(400).json({ error: 'La foto debe ser ' + EXTENSIONES_IMAGEN.join(', ').toUpperCase() })
    }
    const previa = await query('SELECT foto_id FROM cargo_programa WHERE id = $1', [req.params.id])
    if (!previa.rows[0]) return res.status(404).json({ error: 'Cargo no encontrado' })
    const archivo = await guardarArchivo(req.file, { usuarioId: req.usuario?.id })
    await query('UPDATE cargo_programa SET foto_id = $2 WHERE id = $1', [req.params.id, archivo.id])
    // La anterior queda sin dueño: se borra para no acumular adjuntos.
    await borrarSiHuerfano(previa.rows[0].foto_id)
    res.json(await unCargo(req.params.id))
  } catch (e) { fallo(res, e) }
})

router.delete('/cargos/:id(\\d+)/foto', requireAdmin, async (req, res) => {
  try {
    // El id anterior se lee ANTES: el RETURNING del UPDATE ya vería el NULL.
    const previa = await query('SELECT foto_id FROM cargo_programa WHERE id = $1', [req.params.id])
    if (!previa.rows[0]) return res.status(404).json({ error: 'Cargo no encontrado' })
    await query('UPDATE cargo_programa SET foto_id = NULL WHERE id = $1', [req.params.id])
    await borrarSiHuerfano(previa.rows[0].foto_id)
    res.json(await unCargo(req.params.id))
  } catch (e) { fallo(res, e) }
})

/* Va ANTES del recurso genérico: el DELETE de serie dejaría la foto sin dueño
   hasta el barrido de 24 h. Aquí se suelta en el momento. */
router.delete('/cargos/:id(\\d+)', requireAdmin, async (req, res) => {
  try {
    const { rows } = await query('DELETE FROM cargo_programa WHERE id = $1 RETURNING foto_id', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'No encontrado' })
    await borrarSiHuerfano(rows[0].foto_id)
    res.json({ ok: true })
  } catch (e) { fallo(res, e) }
})

recurso({
  ruta: 'cargos', tabla: 'cargo_programa', esquema: 'cargos_programa',
  columnas: COL_CARGO, seleccion: SEL_CARGO, orden: ORD_CARGO, mapear: conFoto,
})

/* ─── Presentación (fila única) ────────────────────────────────── */

const COL_PROGRAMA = ['presentacion', 'ejes', 'horario', 'nota_cita']

async function leerPrograma() {
  const { rows } = await query(`SELECT ${COL_PROGRAMA.join(', ')} FROM contacto_programa WHERE id = 1`)
  return rows[0] ? { ...rows[0], ejes: rows[0].ejes ?? [] } : null
}

router.patch('/programa', requireAdmin, async (req, res) => {
  if (rechaza('contacto_programa', req, res)) return
  try {
    await query('INSERT INTO contacto_programa (id) VALUES (1) ON CONFLICT (id) DO NOTHING')
    const fila = await actualizarFila('contacto_programa', 'id', 1, COL_PROGRAMA, req.body)
    if (!fila) return res.status(400).json({ error: 'Nada que actualizar' })
    res.json(await leerPrograma())
  } catch (e) { fallo(res, e) }
})

/* ─── Bloques ──────────────────────────────────────────────────── */

export async function bloquesContacto() {
  const [sedes, cargos, programa] = await Promise.all([
    leerSedes(),
    query(`SELECT ${SEL_CARGO} FROM cargo_programa ORDER BY ${ORD_CARGO}`).then(r => r.rows.map(conFoto)),
    leerPrograma(),
  ])
  return { sedes, cargos, programa }
}

/* La forma que espera el pie: { riohacha: { nombre, direccion, tel, email, director } }.
   El responsable de cada sede es su cargo de nivel «direccion». */
export function infoSedes({ sedes, cargos }) {
  return Object.fromEntries(sedes.map(s => {
    const jefe = cargos.find(c => c.nivel === 'direccion' && c.sede === s.sede)
    return [s.sede, {
      nombre: s.nombre,
      direccion: [s.ubicacion, s.direccion].filter(Boolean).join(', '),
      tel: s.telefono + (s.extension ? ` ext. ${s.extension}` : ''),
      email: s.correo,
      director: jefe?.nombre ?? '',
    }]
  }))
}

/* Con info_sedes incluido: el panel lo pone tal cual en el estado y el pie
   de página se actualiza sin recargar. */
router.get('/', async (_req, res) => {
  try {
    const b = await bloquesContacto()
    res.json({ ...b, info_sedes: infoSedes(b) })
  } catch (e) { fallo(res, e) }
})

export default router
