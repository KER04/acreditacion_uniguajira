/* Lectura del reporte Saber Pro que entrega la facultad (.xlsx).
 *
 * Lo usan dos sitios —el importador de consola y la carga desde el panel—, y
 * por eso vive aquí y no dentro de ninguno de los dos: leer la hoja de dos
 * maneras distintas terminaría con dos criterios distintos sobre qué es un
 * dato válido.
 *
 * Dos cosas se sacan del archivo, no una:
 *
 *   · las FILAS, una por estudiante evaluado;
 *   · las BASES, que están escondidas en la fórmula de la última columna.
 *     Esa columna dice "Supero la media" / "No supero la media" comparando
 *     cada competencia con un número, y esos números son la condición real
 *     para graduarse. Leer solo el texto del resultado perdería el umbral:
 *     sabríamos quién pasó, pero no a partir de cuánto.
 *
 * El archivo se lee sin ejecutar nada: `exceljs` entrega la fórmula como
 * texto y de ahí se extraen las cifras con una expresión regular.
 */
import ExcelJS from 'exceljs'
import { CLAVES_MODULOS, globalSaberPro } from '../../shared/validacion.js'

/* Cada módulo de la tabla con el encabezado que trae la hoja del ICFES. La
   comparación es laxa —sin tildes, sin mayúsculas, sin espacios de más—
   porque el reporte cambia de estilo entre semestres. */
const ENCABEZADOS = {
  lectura_critica:           ['lectura critica'],
  razonamiento_cuantitativo: ['razonamiento cuantitativo'],
  competencias_ciudadanas:   ['competencias ciudadanas'],
  comunicacion_escrita:      ['comunicacion escrita'],
  ingles:                    ['ingles'],
}

const OTRAS_COLUMNAS = {
  estudiante: ['nombre', 'nombres', 'estudiante'],
  documento:  ['documento', 'numero de documento', 'identificacion'],
  registro:   ['numero de registro', 'registro', 'no de registro'],
  periodo:    ['periodo', 'semestre'],
  sede:       ['sede'],
  global:     ['puntaje global', 'global'],
}

export const llanear = texto => String(texto ?? '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/\s+/g, ' ').trim()

/* Partículas que en un nombre español van en minúscula. */
const PARTICULAS = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'e', 'da', 'do'])

/* "SOLANO RODRIGUEZ ALAN DAVID" -> "Solano Rodriguez Alan David".
   No se reordena: la hoja trae los apellidos delante, que es como los emite el
   ICFES, y adivinar dónde acaban los apellidos de alguien es peor que dejar el
   orden que puso la fuente. */
export function normalizarNombre(bruto) {
  const s = String(bruto ?? '').trim().replace(/\s+/g, ' ')
  if (!s) return ''
  if (s !== s.toUpperCase()) return s
  return s.split(' ')
    .map((p, i) => (i > 0 && PARTICULAS.has(p.toLowerCase())
      ? p.toLowerCase()
      : p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()))
    .join(' ')
}

/* "2025 - I" -> { anio: 2025, periodo: '2025-I' }. El formato con espacios no
   pasa la validación de período, que espera 2025-I o 2025-II. */
export function partirPeriodo(bruto) {
  const s = String(bruto ?? '').trim()
  const m = /^(\d{4})\s*-\s*(I{1,2})$/.exec(s)
  if (m) return { anio: Number(m[1]), periodo: m[1] + '-' + m[2] }
  const soloAnio = /^(\d{4})$/.exec(s)
  if (soloAnio) return { anio: Number(soloAnio[1]), periodo: '' }
  return { anio: null, periodo: '' }
}

const SEDES = { riohacha: 'riohacha', maicao: 'maicao' }
export const normalizarSede = b => SEDES[llanear(b)] ?? 'riohacha'

/* Una celda de exceljs puede ser un número, un texto, un objeto con la fórmula
   y su resultado, o texto enriquecido por trozos. Todas acaban en cadena. */
function textoDeCelda(celda) {
  const v = celda?.value
  if (v === null || v === undefined) return ''
  if (typeof v === 'object') {
    if (Array.isArray(v.richText)) return v.richText.map(t => t.text).join('')
    if (v.result !== undefined) return String(v.result)
    if (v.text !== undefined) return String(v.text)
    if (v.formula !== undefined) return ''
  }
  return String(v)
}

const formulaDeCelda = celda => {
  const v = celda?.value
  if (typeof v === 'object' && v !== null && typeof v.formula === 'string') return v.formula
  return typeof celda?.formula === 'string' ? celda.formula : ''
}

const entero = b => {
  const n = Number(String(b ?? '').trim())
  return Number.isFinite(n) ? Math.round(n) : null
}

/* ─── Las bases, sacadas de la fórmula ─────────────────────────── */

/* Busca, para cada competencia, la comparación que la fórmula hace con ella:
 *
 *   Tabla1[[#This Row],[LECTURA CRÍTICA]]>=152   ->  152
 *
 * Se acepta cualquier envoltorio alrededor del nombre —referencia de tabla,
 * celda suelta o el nombre pelado— porque lo único estable entre versiones del
 * reporte es el par "nombre de la competencia … >= número". */
export function basesDesdeFormula(formula) {
  const texto = String(formula ?? '')
  if (!texto) return {}

  const llano = llanear(texto)
  const bases = {}

  for (const [clave, nombres] of Object.entries(ENCABEZADOS)) {
    for (const nombre of nombres) {
      /* Entre el nombre de la competencia y el >= solo puede haber cierres de
         corchete, comillas y espacios: así "ingles" no captura el >= de la
         siguiente competencia si la suya faltara. */
      const re = new RegExp(nombre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\]"\'\\s]*>\\s*=\\s*(\\d{1,3})')
      const m = re.exec(llano)
      if (m) { bases[clave] = Number(m[1]); break }
    }
  }
  return bases
}

/* ─── Lectura de la hoja ───────────────────────────────────────── */

/* Devuelve { filas, bases, formula, avisos, hoja }.
 *
 * `filas` viene normalizada y lista para validar contra el esquema; `bases`
 * trae las cinco cifras de la fórmula, o las que haya encontrado. Nada se
 * escribe en la base aquí: esto solo lee. */
export async function leerHojaSaberPro(origen) {
  const libro = new ExcelJS.Workbook()
  if (Buffer.isBuffer(origen)) await libro.xlsx.load(origen)
  else await libro.xlsx.readFile(origen)

  const hoja = libro.worksheets[0]
  if (!hoja) throw new Error('El archivo no tiene ninguna hoja')

  /* Dónde está cada dato. El orden de las columnas del reporte no es fijo, así
     que se busca por encabezado en vez de por posición. */
  const cabecera = hoja.getRow(1)
  const columna = {}
  let columnaFormula = null

  cabecera.eachCell((celda, n) => {
    const titulo = llanear(textoDeCelda(celda))
    if (!titulo) return
    for (const [clave, nombres] of Object.entries(ENCABEZADOS)) {
      if (nombres.includes(titulo)) columna[clave] = n
    }
    for (const [clave, nombres] of Object.entries(OTRAS_COLUMNAS)) {
      if (nombres.includes(titulo)) columna[clave] = n
    }
    /* La columna del veredicto no tiene un nombre fijo ("Supero la media",
       "Cumple", …). Se reconoce por lo que hace, no por cómo se llama. */
    if (/super|cumple|aprueba|media/.test(titulo)) columnaFormula = n
  })

  const avisos = []
  const faltantes = CLAVES_MODULOS.filter(k => !columna[k])
  if (faltantes.length) {
    throw new Error('La hoja no tiene las columnas de: ' + faltantes.join(', '))
  }

  /* La fórmula se busca en la primera fila de datos que la tenga: si alguien
     pegó valores en las primeras filas, las de abajo suelen conservarla. */
  let formula = ''
  if (columnaFormula) {
    for (let n = 2; n <= hoja.rowCount && !formula; n++) {
      formula = formulaDeCelda(hoja.getRow(n).getCell(columnaFormula))
    }
  }
  const bases = basesDesdeFormula(formula)
  if (columnaFormula && !formula) {
    avisos.push('La columna del veredicto no conserva su fórmula: no se pudieron leer las bases')
  }

  const filas = []
  for (let n = 2; n <= hoja.rowCount; n++) {
    const f = hoja.getRow(n)
    const valor = clave => (columna[clave] ? textoDeCelda(f.getCell(columna[clave])) : '')

    const nombre = normalizarNombre(valor('estudiante'))
    const registro = String(valor('registro') ?? '').trim()
    const puntajes = Object.fromEntries(CLAVES_MODULOS.map(k => [k, entero(valor(k))]))

    /* El reporte cierra con las filas de totales de la tabla de Excel: sin
       nombre y sin registro, pero con números —promedios— en las columnas de
       las competencias. Si se colaran, entrarían a la base como un estudiante
       fantasma que además arrastraría la media hacia sí misma. Lo que las
       distingue no es estar vacías, sino no identificar a nadie. */
    if (!nombre && !registro) continue

    const { anio, periodo } = partirPeriodo(valor('periodo'))
    const fila = {
      estudiante: nombre,
      documento: String(valor('documento') ?? '').trim(),
      registro,
      anio,
      periodo,
      sede: normalizarSede(valor('sede')),
      ...puntajes,
      percentil_nacional: null,
      percentil_nbc: null,
      nivel_ingles: '',
      observaciones: '',
      fila_hoja: n,
    }

    /* El global de la hoja tiene que cuadrar con el promedio de los cinco
       módulos, porque es lo que va a calcular la base. Si no cuadra, alguno de
       los seis números está mal y conviene mirarlo antes de publicarlo. */
    const declarado = entero(valor('global'))
    const calculado = globalSaberPro(fila)
    if (declarado !== null && calculado !== null && declarado !== calculado) {
      avisos.push(`Fila ${n} · ${nombre || 'sin nombre'}: la hoja dice ${declarado} y sus módulos dan ${calculado}`)
    }

    filas.push(fila)
  }

  return { filas, bases, formula, avisos, hoja: hoja.name }
}
