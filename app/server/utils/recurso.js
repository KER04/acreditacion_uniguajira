/* REST genérico sobre una tabla, y traducción de los errores del motor.
 *
 * Esto vivía dentro de routes/estudiantes.js. Al migrar egresados hacía falta
 * exactamente lo mismo —GET/POST/PATCH/DELETE con lista blanca de columnas y
 * el esquema compartido de validación—, así que en vez de copiarlo se saca
 * aquí. Cada módulo pone lo único que de verdad cambia: sus columnas, su orden
 * y los mensajes de sus restricciones.
 */
import { query } from '../db/pool.js'
import { requireAdmin } from '../middleware/auth.js'
import { validar, hayErrores } from '../../shared/validacion.js'

/* Construye el traductor de errores SQL del módulo. `mensajes` va de nombre de
   restricción a texto en español; lo que no esté ahí cae en un genérico que al
   menos nombra la restricción, para poder añadirla después. */
export function crearFallo(etiqueta, mensajes = {}) {
  return function fallo(res, e) {
    if (e.code === '23514') {
      return res.status(400).json({ error: mensajes[e.constraint] ?? ('Dato fuera de rango (' + e.constraint + ')') })
    }
    if (e.code === '23505') return res.status(409).json({ error: mensajes[e.constraint] ?? 'Ese registro ya existe' })
    if (e.code === '23503') return res.status(400).json({ error: 'El registro relacionado no existe' })
    /* Violación de NOT NULL. Sin este caso el fallo caía al 500 genérico y el
       panel solo decia "Error interno del servidor", que no dice nada de qué
       columna se quedó vacía ni a quién le toca arreglarlo. */
    if (e.code === '23502') {
      return res.status(400).json({
        error: mensajes[e.column] ?? ('Falta un dato obligatorio' + (e.column ? ': ' + e.column : '')),
      })
    }
    if (e.code === '22P02' || e.code === '22008') return res.status(400).json({ error: 'Formato de dato inválido' })
    console.error('[' + etiqueta + ']', e)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

/* Devuelve la función `recurso` ya atada a un router y a su traductor. */
export function crearRecurso({ router, fallo }) {
  /* Monta GET / POST / PATCH / DELETE sobre una tabla.

     `columnas` es lista blanca: nada que venga del cliente entra al SQL como
     identificador, solo como parámetro numerado.
     `esquema` es la clave en ESQUEMAS; por defecto la misma que la ruta. */
  return function recurso({ ruta, tabla, columnas, seleccion, orden, mapear, esquema, soloAdminLee = false }) {
    const clave = esquema ?? ruta
    const salida = fila => (mapear ? mapear(fila) : fila)
    const base = ruta ? '/' + ruta : ''

    /* Corre el esquema compartido con el panel. Devuelve true si ya respondió. */
    const rechazaPorValidacion = (req, res, parcial) => {
      const errores = validar(clave, req.body ?? {}, { parcial })
      if (!hayErrores(errores)) return false
      res.status(400).json({ error: Object.values(errores)[0], errores })
      return true
    }

    const leer = async (_req, res) => {
      try {
        const { rows } = await query('SELECT ' + seleccion + ' FROM ' + tabla + ' ORDER BY ' + orden)
        res.json(rows.map(salida))
      } catch (e) { fallo(res, e) }
    }
    if (soloAdminLee) router.get(base || '/', requireAdmin, leer)
    else router.get(base || '/', leer)

    router.post(base || '/', requireAdmin, async (req, res) => {
      if (rechazaPorValidacion(req, res, false)) return
      const campos = columnas.filter(c => req.body?.[c] !== undefined)
      if (!campos.length) return res.status(400).json({ error: 'No se recibió ningún dato' })

      try {
        const marcadores = campos.map((_, i) => '$' + (i + 1)).join(', ')
        const { rows } = await query(
          'INSERT INTO ' + tabla + ' (' + campos.join(', ') + ') VALUES (' + marcadores + ') RETURNING ' + seleccion,
          campos.map(c => req.body[c]),
        )
        res.status(201).json(salida(rows[0]))
      } catch (e) { fallo(res, e) }
    })

    router.patch(base + '/:id', requireAdmin, async (req, res) => {
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

    router.delete(base + '/:id', requireAdmin, async (req, res) => {
      try {
        const { rowCount } = await query('DELETE FROM ' + tabla + ' WHERE id = $1', [req.params.id])
        if (!rowCount) return res.status(404).json({ error: 'No encontrado' })
        res.json({ ok: true })
      } catch (e) { fallo(res, e) }
    })
  }
}
