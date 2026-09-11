/* Módulo Docentes — respaldado por PostgreSQL.

   Sustituye la lectura/escritura de src/data/docentes.json. Igual que en
   Estudiantes, la API deja de ser "reemplaza el arreglo completo" —idiom de
   archivo JSON, que perdía los ids en cada guardado— y pasa a REST por
   elemento.

   La formación académica vive en su propia tabla y viaja anidada dentro de cada
   docente, porque la vista siempre la necesita junta. */
import { Router } from 'express'
import { query, withTransaction } from '../db/pool.js'
import { requireAdmin } from '../middleware/auth.js'
import {
  enMemoria, guardarArchivo, borrarSiHuerfano, extensionDe,
  nombreOriginalUtf8, EXTENSIONES_IMAGEN, LIMITE_FOTO,
} from '../utils/archivos.js'
import { validar, hayErrores, pesoLegible } from '../../shared/validacion.js'

const subidaFoto = enMemoria(LIMITE_FOTO)
const enlaceArchivo = id => '/api/archivos/' + id

/* Traduce el fallo de multer (imagen demasiado grande) a algo legible. */
function conSubida(mw, limiteMB) {
  return (req, res, next) => mw(req, res, err => {
    if (!err) return next()
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'La imagen pasa del límite de ' + limiteMB + ' MB' })
    }
    next(err)
  })
}

const router = Router()

/* ─── Columnas y utilidades ────────────────────────────────────── */

/* Lista blanca: nada que venga del cliente entra al SQL como identificador. */
const COLUMNAS = [
  'nombre', 'vinculacion', 'sede', 'email',
  'cvlac_url', 'orcid_url', 'scholar_url', 'posgrado',
  'dedicacion', 'oficina', 'extension', 'horario',
  'grupo', 'grupo_categoria', 'semillero', 'activo',
]
const SEL = 'id, ' + COLUMNAS.join(', ') + ', foto_id'

const COLUMNAS_FORMACION = ['titulo', 'nivel', 'institucion', 'anio', 'en_curso', 'orden']
const SEL_FORMACION = 'id, docente_id, ' + COLUMNAS_FORMACION.join(', ')

/* La foto se sirve desde la base; el front solo necesita la ruta. */
const conFoto = d => ({ ...d, foto_url: d.foto_id ? enlaceArchivo(d.foto_id) : '' })

/* La base es la última red: si algo se salta la validación de arriba, estos son
   los mensajes con los que responde en vez de un nombre de restricción. */
const MENSAJE_RESTRICCION = {
  docente_nombre_no_vacio:        'El nombre debe tener al menos 3 caracteres',
  docente_vinculacion_valida:     'La vinculación debe ser planta, catedratico u ocasional',
  docente_sede_valida:            'La sede debe ser riohacha o maicao',
  docente_categoria_grupo_valida: 'Categoría de grupo no válida (A1, A, B, C o Reconocido)',
  formacion_titulo_no_vacio:      'El título debe tener al menos 3 caracteres',
  formacion_nivel_valido:         'Nivel de formación no válido',
  formacion_anio_valido:          'El año del título está fuera de rango',
}

function fallo(res, e) {
  if (e.code === '23514') {
    return res.status(400).json({ error: MENSAJE_RESTRICCION[e.constraint] ?? ('Dato fuera de rango (' + e.constraint + ')') })
  }
  if (e.code === '23505') return res.status(409).json({ error: 'Ya hay un docente con ese correo' })
  if (e.code === '23503') return res.status(404).json({ error: 'El docente no existe' })
  if (e.code === '22P02') return res.status(400).json({ error: 'Formato de dato inválido' })
  console.error('[docentes]', e)
  return res.status(500).json({ error: 'Error interno del servidor' })
}

/* Corre el esquema compartido con el panel. Devuelve true si ya respondió. */
function rechazaPorValidacion(recurso, req, res, parcial) {
  const errores = validar(recurso, req.body ?? {}, { parcial })
  if (!hayErrores(errores)) return false
  res.status(400).json({ error: Object.values(errores)[0], errores })
  return true
}

/* Lee docentes con su formación anidada. Dos consultas y un Map en vez de un
   JOIN con agregado: es más fácil de leer y evita duplicar la fila del docente
   por cada título. */
export async function leerDocentes({ soloActivos = true, id = null } = {}) {
  const condiciones = []
  const valores = []
  if (soloActivos) condiciones.push('activo = TRUE')
  if (id != null) { valores.push(id); condiciones.push('id = $' + valores.length) }
  const donde = condiciones.length ? ' WHERE ' + condiciones.join(' AND ') : ''

  const { rows } = await query('SELECT ' + SEL + ' FROM docente' + donde + ' ORDER BY nombre ASC', valores)
  if (!rows.length) return []

  const ids = rows.map(d => d.id)
  const { rows: formacion } = await query(
    'SELECT ' + SEL_FORMACION + ' FROM docente_formacion WHERE docente_id = ANY($1) ORDER BY orden ASC, id ASC',
    [ids],
  )

  const porDocente = new Map(ids.map(i => [i, []]))
  for (const f of formacion) porDocente.get(f.docente_id)?.push(f)

  return rows.map(d => ({ ...conFoto(d), formacion: porDocente.get(d.id) ?? [] }))
}

/* ─── Docentes ─────────────────────────────────────────────────── */

/* Público. `?todos=1` incluye a los retirados y solo lo puede pedir un admin:
   si no, cualquiera vería a quien fue dado de baja del directorio. */
router.get('/', async (req, res) => {
  try {
    const pideTodos = req.query.todos === '1' && req.usuario?.rol === 'admin'
    res.json(await leerDocentes({ soloActivos: !pideTodos }))
  } catch (e) { fallo(res, e) }
})

router.get('/:id(\\d+)', async (req, res) => {
  try {
    const [docente] = await leerDocentes({ soloActivos: false, id: Number(req.params.id) })
    if (!docente) return res.status(404).json({ error: 'Docente no encontrado' })
    res.json(docente)
  } catch (e) { fallo(res, e) }
})

router.post('/', requireAdmin, async (req, res) => {
  if (rechazaPorValidacion('docentes', req, res, false)) return

  const campos = COLUMNAS.filter(c => req.body?.[c] !== undefined)
  if (!campos.length) return res.status(400).json({ error: 'No se recibió ningún dato' })

  try {
    const marcadores = campos.map((_, i) => '$' + (i + 1)).join(', ')
    const { rows } = await query(
      'INSERT INTO docente (' + campos.join(', ') + ') VALUES (' + marcadores + ') RETURNING ' + SEL,
      campos.map(c => req.body[c]),
    )
    res.status(201).json({ ...conFoto(rows[0]), formacion: [] })
  } catch (e) { fallo(res, e) }
})

router.patch('/:id(\\d+)', requireAdmin, async (req, res) => {
  if (rechazaPorValidacion('docentes', req, res, true)) return

  const campos = COLUMNAS.filter(c => req.body?.[c] !== undefined)
  if (!campos.length) return res.status(400).json({ error: 'Nada que actualizar' })

  try {
    const asignaciones = campos.map((c, i) => c + ' = $' + (i + 2)).join(', ')
    const { rowCount } = await query(
      'UPDATE docente SET ' + asignaciones + ' WHERE id = $1',
      [req.params.id, ...campos.map(c => req.body[c])],
    )
    if (!rowCount) return res.status(404).json({ error: 'Docente no encontrado' })

    const [docente] = await leerDocentes({ soloActivos: false, id: Number(req.params.id) })
    res.json(docente)
  } catch (e) { fallo(res, e) }
})

router.delete('/:id(\\d+)', requireAdmin, async (req, res) => {
  try {
    /* La formación se va en cascada; la foto hay que soltarla a mano porque la
       tabla de archivos la comparten todos los módulos. */
    const previa = await query('SELECT foto_id FROM docente WHERE id = $1', [req.params.id])
    if (!previa.rows[0]) return res.status(404).json({ error: 'Docente no encontrado' })

    await query('DELETE FROM docente WHERE id = $1', [req.params.id])
    await borrarSiHuerfano(previa.rows[0].foto_id)
    res.json({ ok: true })
  } catch (e) { fallo(res, e) }
})

/* ─── Fotografía ───────────────────────────────────────────────── */

router.post('/:id(\\d+)/foto', requireAdmin, conSubida(subidaFoto.single('foto'), 3), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen' })

    const original = nombreOriginalUtf8(req.file.originalname)
    if (!EXTENSIONES_IMAGEN.includes(extensionDe(original))) {
      return res.status(400).json({ error: 'La foto debe ser ' + EXTENSIONES_IMAGEN.join(', ').toUpperCase() })
    }

    const previa = await query('SELECT foto_id FROM docente WHERE id = $1', [req.params.id])
    if (!previa.rows[0]) return res.status(404).json({ error: 'Docente no encontrado' })

    const archivo = await guardarArchivo(req.file, { usuarioId: req.usuario?.id })
    const { rows } = await query(
      'UPDATE docente SET foto_id = $2 WHERE id = $1 RETURNING ' + SEL,
      [req.params.id, archivo.id],
    )
    /* La foto anterior queda sin dueño: se borra para no acumular adjuntos. */
    await borrarSiHuerfano(previa.rows[0].foto_id)

    res.json({ ...conFoto(rows[0]), bytes: archivo.bytes, peso: pesoLegible(archivo.bytes) })
  } catch (e) { fallo(res, e) }
})

router.delete('/:id(\\d+)/foto', requireAdmin, async (req, res) => {
  try {
    /* Hay que leer el id anterior ANTES de borrarlo: en el RETURNING de un
       UPDATE la subconsulta ya vería la fila actualizada. */
    const previa = await query('SELECT foto_id FROM docente WHERE id = $1', [req.params.id])
    if (!previa.rows[0]) return res.status(404).json({ error: 'Docente no encontrado' })

    const { rows } = await query(
      'UPDATE docente SET foto_id = NULL WHERE id = $1 RETURNING ' + SEL,
      [req.params.id],
    )
    await borrarSiHuerfano(previa.rows[0].foto_id)
    res.json(conFoto(rows[0]))
  } catch (e) { fallo(res, e) }
})

/* ─── Formación académica ──────────────────────────────────────── */

router.get('/:id(\\d+)/formacion', async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT ' + SEL_FORMACION + ' FROM docente_formacion WHERE docente_id = $1 ORDER BY orden ASC, id ASC',
      [req.params.id],
    )
    res.json(rows)
  } catch (e) { fallo(res, e) }
})

router.post('/:id(\\d+)/formacion', requireAdmin, async (req, res) => {
  if (rechazaPorValidacion('formacion', req, res, false)) return

  const campos = COLUMNAS_FORMACION.filter(c => req.body?.[c] !== undefined)
  try {
    const marcadores = campos.map((_, i) => '$' + (i + 2)).join(', ')
    const { rows } = await query(
      'INSERT INTO docente_formacion (docente_id' + (campos.length ? ', ' + campos.join(', ') : '') + ') ' +
      'VALUES ($1' + (campos.length ? ', ' + marcadores : '') + ') RETURNING ' + SEL_FORMACION,
      [req.params.id, ...campos.map(c => req.body[c])],
    )
    res.status(201).json(rows[0])
  } catch (e) { fallo(res, e) }
})

/* Reemplaza de una vez toda la formación de un docente. Es lo que necesita el
   formulario del panel, donde los títulos se editan como una lista: mandar la
   lista entera evita tener que ir contando altas, bajas y reordenamientos. */
router.put('/:id(\\d+)/formacion', requireAdmin, async (req, res) => {
  const lista = req.body?.formacion
  if (!Array.isArray(lista)) return res.status(400).json({ error: 'Se esperaba una lista de títulos' })

  for (const [i, titulo] of lista.entries()) {
    const errores = validar('formacion', titulo ?? {}, { parcial: false })
    if (hayErrores(errores)) {
      return res.status(400).json({ error: 'Título ' + (i + 1) + ': ' + Object.values(errores)[0], errores, indice: i })
    }
  }

  try {
    const existe = await query('SELECT 1 FROM docente WHERE id = $1', [req.params.id])
    if (!existe.rows[0]) return res.status(404).json({ error: 'Docente no encontrado' })

    /* En una transacción: si falla un título, no queremos haber borrado los
       que ya tenía. */
    await withTransaction(async cliente => {
      await cliente.query('DELETE FROM docente_formacion WHERE docente_id = $1', [req.params.id])
      for (const [i, t] of lista.entries()) {
        await cliente.query(
          'INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden) ' +
          'VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [
            req.params.id,
            t.titulo,
            t.nivel ?? '',
            t.institucion ?? '',
            t.anio === '' || t.anio === undefined ? null : t.anio,
            t.en_curso ?? false,
            t.orden ?? i,
          ],
        )
      }
    })

    const [docente] = await leerDocentes({ soloActivos: false, id: Number(req.params.id) })
    res.json(docente)
  } catch (e) { fallo(res, e) }
})

router.patch('/formacion/:formacionId(\\d+)', requireAdmin, async (req, res) => {
  if (rechazaPorValidacion('formacion', req, res, true)) return

  const campos = COLUMNAS_FORMACION.filter(c => req.body?.[c] !== undefined)
  if (!campos.length) return res.status(400).json({ error: 'Nada que actualizar' })

  try {
    const asignaciones = campos.map((c, i) => c + ' = $' + (i + 2)).join(', ')
    const { rows } = await query(
      'UPDATE docente_formacion SET ' + asignaciones + ' WHERE id = $1 RETURNING ' + SEL_FORMACION,
      [req.params.formacionId, ...campos.map(c => req.body[c])],
    )
    if (!rows[0]) return res.status(404).json({ error: 'Título no encontrado' })
    res.json(rows[0])
  } catch (e) { fallo(res, e) }
})

router.delete('/formacion/:formacionId(\\d+)', requireAdmin, async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM docente_formacion WHERE id = $1', [req.params.formacionId])
    if (!rowCount) return res.status(404).json({ error: 'Título no encontrado' })
    res.json({ ok: true })
  } catch (e) { fallo(res, e) }
})

export default router
