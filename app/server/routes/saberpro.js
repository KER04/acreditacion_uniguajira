/* Módulo Saber Pro — respaldado por PostgreSQL (migración 010).
 *
 * Qué se publica y qué no. Un resultado Saber Pro es un dato personal, así que
 * el reparto no es simétrico:
 *
 *   · PÚBLICO  las medias por año (agregados, sin nombres), los destacados por
 *              competencia y por media general, y quiénes alcanzan el puntaje
 *              para la opción de grado. Es lo mismo que ya hace el cuadro de
 *              honor: se publica el logro, no el expediente.
 *   · PRIVADO  el listado completo fila a fila, con documento y número de
 *              registro del ICFES. Eso no sale nunca del panel.
 *
 * Los cálculos van en SQL y no en el navegador, para que la página reciba ya
 * resuelto lo que necesita en vez de bajarse el censo entero para ordenarlo.
 */
import { Router } from 'express'
import { query } from '../db/pool.js'
import { requireAdmin } from '../middleware/auth.js'
import { crearFallo, crearRecurso } from '../utils/recurso.js'
import { enMemoria, extensionDe, nombreOriginalUtf8, LIMITE_DOCUMENTO } from '../utils/archivos.js'
import { leerHojaSaberPro } from '../utils/saberpro-hoja.js'
import { importarResultados } from '../utils/saberpro-importar.js'
import { validar, hayErrores, CLAVES_MODULOS } from '../../shared/validacion.js'

const router = Router()

const MENSAJES = {
  saberpro_estudiante_no_vacio:  'El nombre debe tener al menos 3 caracteres',
  saberpro_anio_valido:          'El año no es válido',
  saberpro_sede_valida:          'La sede debe ser riohacha o maicao',
  saberpro_lectura_rango:        'Lectura Crítica debe estar entre 0 y 300',
  saberpro_razonamiento_rango:   'Razonamiento Cuantitativo debe estar entre 0 y 300',
  saberpro_ciudadanas_rango:     'Competencias Ciudadanas debe estar entre 0 y 300',
  saberpro_escrita_rango:        'Comunicación Escrita debe estar entre 0 y 300',
  saberpro_ingles_rango:         'Inglés debe estar entre 0 y 300',
  saberpro_percentil_nacional_rango: 'El percentil nacional debe estar entre 0 y 100',
  saberpro_percentil_nbc_rango:      'El percentil NBC debe estar entre 0 y 100',
  saberpro_nivel_ingles_valido:  'Nivel de inglés no válido',
  saberpro_registro_idx:         'Ese número de registro del ICFES ya está cargado',
  saberpro_puntaje_minimo_rango: 'El puntaje mínimo debe estar entre 0 y 300',
}

const fallo = crearFallo('saberpro', MENSAJES)
const recurso = crearRecurso({ router, fallo })

/* puntaje_global no se lista aquí: es columna generada y la base la rellena. */
const COLUMNAS = [
  'estudiante', 'documento', 'registro', 'anio', 'periodo', 'sede',
  ...CLAVES_MODULOS,
  'percentil_nacional', 'percentil_nbc', 'nivel_ingles', 'observaciones',
]

const SEL_COMPLETO = 'id, ' + COLUMNAS.join(', ') + ', puntaje_global'

/* Lo que puede ver cualquiera: ni documento ni registro del ICFES. */
const SEL_PUBLICO = 'id, estudiante, anio, periodo, sede, ' +
  CLAVES_MODULOS.join(', ') + ', puntaje_global, percentil_nacional, percentil_nbc, nivel_ingles'

/* El listado fila a fila es privado, y cuelga de /resultados y no de la raiz:
   en la raiz vive el agregado publico, y un recurso montado en '' se la
   quedaría además de convertir su PATCH en '/:id', que se tragaría
   '/parametros'. */
recurso({
  ruta: 'resultados',
  esquema: 'saberpro',
  tabla: 'saberpro_resultado',
  columnas: COLUMNAS,
  seleccion: SEL_COMPLETO,
  orden: 'anio DESC, puntaje_global DESC, estudiante ASC',
  soloAdminLee: true,
})

/* ─── Parámetros de la opción de grado ─────────────────────────── */

const COLUMNAS_BASE = CLAVES_MODULOS.map(k => 'base_' + k)

const SEL_PARAMETROS =
  "id, puntaje_minimo, percentil_minimo, minimo_por_modulo, norma, " +
  COLUMNAS_BASE.join(', ') + ', base_global::float AS base_global, bases_origen, ' +
  "to_char(bases_actualizado_en, 'YYYY-MM-DD') AS bases_actualizado_en, " +
  "to_char(vigente_desde, 'YYYY-MM-DD') AS vigente_desde"

async function leerParametros() {
  const { rows } = await query('SELECT ' + SEL_PARAMETROS + ' FROM saberpro_parametros WHERE id = 1')
  return rows[0]
}

router.get('/parametros', async (_req, res) => {
  try { res.json(await leerParametros()) } catch (e) { fallo(res, e) }
})

/* Cuáles de estos campos aceptan NULL de verdad.
 *
 * El formulario manda cadena vacía en todo lo que el usuario deja en blanco, y
 * antes se convertía TODO vacio a null. Para los numéricos y la fecha está
 * bien —son columnas nulables y ese es el "no aplica"—, pero `norma` es TEXT
 * NOT NULL DEFAULT '': mandarle null hacía que Postgres rechazara el UPDATE
 * entero, así que guardar los requisitos sin escribir la norma fallaba siempre. */
const PARAMETROS_NULABLES = new Set([
  'percentil_minimo', 'minimo_por_modulo', 'vigente_desde', ...CLAVES_MODULOS.map(k => 'base_' + k),
])

router.patch('/parametros', requireAdmin, async (req, res) => {
  const permitidas = [
    'puntaje_minimo', 'percentil_minimo', 'minimo_por_modulo', 'norma', 'vigente_desde',
    /* Las bases se leen del reporte, pero se pueden corregir a mano: si el
       Consejo fija otra cifra, no hay por qué esperar a un archivo nuevo. */
    ...COLUMNAS_BASE,
  ]
  const campos = permitidas.filter(c => req.body?.[c] !== undefined)
  if (!campos.length) return res.status(400).json({ error: 'Nada que actualizar' })

  const errores = validar('saberpro_parametros', req.body, { parcial: true })
  if (hayErrores(errores)) return res.status(400).json({ error: Object.values(errores)[0], errores })

  try {
    const asignaciones = campos.map((c, i) => c + ' = $' + (i + 1)).join(', ')
    /* Una base tocada a mano ya no es la del reporte: se anota de dónde viene
       ahora, para que la página no siga citando un archivo que ya no manda. */
    const aMano = campos.some(c => c.startsWith('base_'))
      ? ", bases_origen = 'Corregido a mano en el panel', bases_actualizado_en = now()"
      : ''
    const { rows } = await query(
      'UPDATE saberpro_parametros SET ' + asignaciones + aMano + ' WHERE id = 1 RETURNING ' + SEL_PARAMETROS,
      campos.map(c => (req.body[c] === '' && PARAMETROS_NULABLES.has(c) ? null : req.body[c])),
    )
    res.json(rows[0])
  } catch (e) { fallo(res, e) }
})

/* ─── Agregados públicos ───────────────────────────────────────── */

/* Media de cada módulo y del global, año por año. Es la tabla que pide el
   módulo: cómo se mueve el programa con el tiempo, no cómo le fue a alguien. */
async function mediasPorAnio() {
  const promedios = CLAVES_MODULOS
    .map(k => 'round(avg(' + k + ')::numeric, 1)::float AS ' + k)
    .join(', ')
  const { rows } = await query(
    `SELECT anio,
            count(*)::int AS evaluados,
            round(avg(puntaje_global)::numeric, 1)::float AS puntaje_global,
            ${promedios},
            max(puntaje_global) AS maximo,
            min(puntaje_global) AS minimo,
            round(avg(percentil_nacional)::numeric, 1)::float AS percentil_nacional
       FROM saberpro_resultado
      GROUP BY anio
      ORDER BY anio DESC`,
  )
  return rows
}

/* Los mejores de cada competencia y de la media general.
 *
 * `campo` sale de una lista blanca (CLAVES_MODULOS más 'puntaje_global'), así
 * que nunca entra texto del cliente en el SQL como identificador. */
async function mejoresPor(campo, { anio, cuantos = 3 }) {
  /* Viajan también los cinco módulos y el período: la tarjeta del destacado
     enseña el desglose de su desempeño, y pedirlo aparte por cada uno serían
     cinco consultas más para datos que ya están en la misma fila. */
  const { rows } = await query(
    `SELECT id, estudiante, anio, periodo, sede, ${campo} AS puntaje, puntaje_global,
            ${CLAVES_MODULOS.join(', ')}
       FROM saberpro_resultado
      WHERE ($1::smallint IS NULL OR anio = $1)
      ORDER BY ${campo} DESC, estudiante ASC
      LIMIT $2`,
    [anio ?? null, cuantos],
  )
  return rows
}

/* ¿Hay bases por competencia cargadas? Sirven solo completas: comparar tres
   competencias contra su base y dejar dos sueltas no es la regla del reporte
   ni ninguna otra. */
const hayBases = p => CLAVES_MODULOS.every(k => p['base_' + k] !== null && p['base_' + k] !== undefined)

/* El puntaje aprobatorio, general y por competencia.
 *
 * El general NO es un número aparte: es el promedio de las bases, tal como lo
 * calcula la base de datos. Así el acumulado de las competencias y el global
 * no pueden decir cosas distintas. */
export function aprobatorioDe(parametros) {
  if (!hayBases(parametros)) {
    return {
      modo: 'parametros',
      general: parametros.puntaje_minimo,
      competencias: parametros.minimo_por_modulo === null
        ? null
        : Object.fromEntries(CLAVES_MODULOS.map(k => [k, parametros.minimo_por_modulo])),
      origen: parametros.norma || '',
    }
  }
  return {
    modo: 'bases',
    general: parametros.base_global,
    competencias: Object.fromEntries(CLAVES_MODULOS.map(k => [k, parametros['base_' + k]])),
    origen: parametros.bases_origen || '',
    actualizado_en: parametros.bases_actualizado_en,
  }
}

/* Quiénes alcanzan la opción de grado por Saber Pro.
 *
 * Con las bases cargadas, la condición es la del reporte: igualar o superar la
 * base de CADA competencia. No se le suma el puntaje global, porque el global
 * es el promedio de las mismas cinco cifras: exigirlo además dejaría fuera a
 * quien cumple las cinco por poco, que es justo a quien la regla aprueba.
 *
 * Sin bases se mantiene el criterio viejo —global mínimo, y opcionalmente
 * percentil y piso por módulo—, que es lo que había antes de que el reporte
 * trajera sus umbrales. */
async function elegiblesGrado(parametros, anio) {
  const donde = ['($1::smallint IS NULL OR anio = $1)']
  const valores = [anio ?? null]

  if (hayBases(parametros)) {
    for (const k of CLAVES_MODULOS) {
      valores.push(parametros['base_' + k])
      donde.push(k + ' >= $' + valores.length)
    }
  } else {
    valores.push(parametros.puntaje_minimo)
    donde.push('puntaje_global >= $' + valores.length)

    if (parametros.percentil_minimo !== null) {
      valores.push(parametros.percentil_minimo)
      donde.push('percentil_nacional >= $' + valores.length)
    }
    if (parametros.minimo_por_modulo !== null) {
      valores.push(parametros.minimo_por_modulo)
      const n = '$' + valores.length
      donde.push('(' + CLAVES_MODULOS.map(k => k + ' >= ' + n).join(' AND ') + ')')
    }
  }

  const { rows } = await query(
    'SELECT ' + SEL_PUBLICO + ' FROM saberpro_resultado WHERE ' + donde.join(' AND ') +
    ' ORDER BY puntaje_global DESC, estudiante ASC',
    valores,
  )
  return rows
}

/* Cuántos alcanzan cada base por separado. Un solo número —"37 elegibles"— no
   dice dónde se atasca la gente; esto sí, y es lo que permite decidir qué
   competencia reforzar. */
async function cumplimientoPorCompetencia(parametros, anio) {
  if (!hayBases(parametros)) return null
  const columnas = CLAVES_MODULOS
    .map((k, i) => `count(*) FILTER (WHERE ${k} >= $${i + 2})::int AS ${k}`)
    .join(', ')
  const { rows } = await query(
    `SELECT count(*)::int AS evaluados, ${columnas}
       FROM saberpro_resultado
      WHERE ($1::smallint IS NULL OR anio = $1)`,
    [anio ?? null, ...CLAVES_MODULOS.map(k => parametros['base_' + k])],
  )
  return rows[0]
}

/* Todo lo que la página pública necesita, en una sola llamada. */
router.get('/', async (req, res) => {
  try {
    /* El año viaja en la URL y puede venir escrito a mano. Un NaN llegaría a
       Postgres como parámetro de un smallint y reventaría la consulta, así que
       lo que no sea un entero se trata como "todos los años". */
    const crudo = Number(req.query.anio)
    const anio = Number.isInteger(crudo) ? crudo : null
    const parametros = await leerParametros()

    const [medias, general, elegibles, totales, cumplimiento] = await Promise.all([
      mediasPorAnio(),
      mejoresPor('puntaje_global', { anio, cuantos: 5 }),
      elegiblesGrado(parametros, anio),
      query('SELECT count(*)::int AS n, min(anio) AS desde, max(anio) AS hasta FROM saberpro_resultado'),
      cumplimientoPorCompetencia(parametros, anio),
    ])

    /* Un podio por competencia. Se piden en paralelo porque son cinco
       consultas independientes y encadenarlas solo sumaría esperas. */
    const porModulo = await Promise.all(
      CLAVES_MODULOS.map(k => mejoresPor(k, { anio, cuantos: 3 })),
    )

    res.json({
      parametros,
      aprobatorio: aprobatorioDe(parametros),
      cumplimiento,
      anio,
      anios: medias.map(m => m.anio),
      medias,
      destacados: {
        general,
        competencias: Object.fromEntries(CLAVES_MODULOS.map((k, i) => [k, porModulo[i]])),
      },
      elegibles,
      total: totales.rows[0].n,
      desde: totales.rows[0].desde,
      hasta: totales.rows[0].hasta,
    })
  } catch (e) { fallo(res, e) }
})


/* ─── Carga del reporte del ICFES ──────────────────────────────── */

/* Sube el .xlsx que entrega la facultad y lo vuelca a la base.
 *
 * `simular` lee el archivo y contesta lo que haría, sin escribir: es la forma
 * de mirar un reporte antes de sustituir con él lo que ya está publicado.
 * `reemplazar` vacía la tabla primero, para cuando el archivo es el censo
 * completo y no un añadido. */
const subidaHoja = enMemoria(LIMITE_DOCUMENTO)
const EXTENSIONES_HOJA = ['xlsx', 'xlsm']

const esSi = v => v === true || v === 'true' || v === '1' || v === 'on'

router.post('/importar', requireAdmin, (req, res, next) => {
  subidaHoja.single('archivo')(req, res, err => {
    if (err?.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'El archivo pasa del límite de 10 MB' })
    }
    err ? next(err) : next()
  })
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No llegó ningún archivo' })

  const nombre = nombreOriginalUtf8(req.file.originalname)
  if (!EXTENSIONES_HOJA.includes(extensionDe(nombre))) {
    return res.status(400).json({ error: 'El archivo debe ser una hoja de cálculo .xlsx' })
  }

  let hoja
  try {
    hoja = await leerHojaSaberPro(req.file.buffer)
  } catch (e) {
    /* Un archivo que no se deja leer no es un fallo del servidor: es un
       archivo que no sirve, y quien lo subió necesita saber por qué. */
    return res.status(400).json({ error: 'No se pudo leer la hoja: ' + e.message })
  }

  const simular = esSi(req.body?.simular)
  const reemplazar = esSi(req.body?.reemplazar)
  const aplicarBases = req.body?.aplicar_bases === undefined ? true : esSi(req.body.aplicar_bases)

  try {
    if (simular) {
      return res.json({
        simulado: true,
        archivo: nombre,
        hoja: hoja.hoja,
        leidas: hoja.filas.length,
        bases: hoja.bases,
        formula: hoja.formula,
        avisos: hoja.avisos,
        muestra: hoja.filas.slice(0, 5).map(f => ({
          estudiante: f.estudiante, periodo: f.periodo, sede: f.sede,
          ...Object.fromEntries(CLAVES_MODULOS.map(k => [k, f[k]])),
        })),
      })
    }

    const resumen = await importarResultados({
      filas: hoja.filas,
      bases: hoja.bases,
      reemplazar,
      aplicarBases,
      origen: nombre,
    })

    res.json({
      simulado: false,
      archivo: nombre,
      hoja: hoja.hoja,
      bases: hoja.bases,
      formula: hoja.formula,
      ...resumen,
      avisos: [...hoja.avisos, ...resumen.avisos],
      parametros: await leerParametros(),
    })
  } catch (e) { fallo(res, e) }
})

export default router
