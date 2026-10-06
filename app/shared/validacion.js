/* Reglas de validación compartidas por el panel (React) y la API (Express).
 *
 * Están en un solo archivo a propósito: si el formulario y el servidor
 * validaran por separado, tarde o temprano uno aceptaría algo que el otro
 * rechaza. Aquí no hay nada de Node ni de navegador, así que ambos lo importan.
 *
 * Cada validador devuelve `null` si el valor es correcto, o un mensaje en
 * español si no lo es.
 */

/* ─── Rangos del dominio ───────────────────────────────────────── */
export const SEMESTRE_MIN = 1
export const SEMESTRE_MAX = 10       // el plan de estudios tiene 10 semestres
export const PROMEDIO_MIN = 0
export const PROMEDIO_MAX = 5        // escala colombiana 0.0 – 5.0

export const SEDES = ['riohacha', 'maicao']
export const SEDES_CON_AMBAS = ['ambas', 'riohacha', 'maicao']
export const TIPOS_CALENDARIO = ['academico', 'administrativo', 'evaluacion', 'grado', 'otro']
export const TIPOS_DOCUMENTO = ['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'PPT', 'PPTX', 'ZIP', 'Enlace']

/* Extension del archivo -> tipo guardado. Lo usan la subida (servidor) y el
   formulario (navegador) para rellenar el campo sin que nadie lo escriba. */
export const TIPO_POR_EXTENSION = {
  pdf: 'PDF', doc: 'DOC', docx: 'DOCX', xls: 'XLS', xlsx: 'XLSX',
  ppt: 'PPT', pptx: 'PPTX', zip: 'ZIP',
}

export const EXTENSIONES_ACEPTADAS = Object.keys(TIPO_POR_EXTENSION)

/* 1536 -> '2 KB'; 1887437 -> '1.8 MB'. El formato coincide con el que valida
   `tamanoArchivo`, para que el peso autocompletado nunca se rechace. */
export function pesoLegible(bytes) {
  const n = Number(bytes)
  if (!Number.isFinite(n) || n < 0) return ''
  if (n < 1024) return n + ' B'
  const kb = n / 1024
  if (kb < 1024) return Math.round(kb) + ' KB'
  const mb = kb / 1024
  if (mb < 1024) return (mb < 10 ? mb.toFixed(1) : String(Math.round(mb))) + ' MB'
  return (mb / 1024).toFixed(1) + ' GB'
}

/* 'Reglamento_estudiantil-2021.pdf' -> 'Reglamento estudiantil 2021' */
export function nombreDesdeArchivo(original) {
  const sinExtension = String(original ?? '').replace(/\.[^.]+$/, '')
  const limpio = sinExtension.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
  if (!limpio) return ''
  return limpio.charAt(0).toUpperCase() + limpio.slice(1)
}

/* 'guia.PDF' -> 'PDF'; desconocido -> null */
export function tipoDesdeArchivo(original) {
  const m = /\.([^.]+)$/.exec(String(original ?? ''))
  return m ? (TIPO_POR_EXTENSION[m[1].toLowerCase()] ?? null) : null
}
export const GRUPOS_DOCUMENTO = ['Académicos', 'Trabajo de grado', 'Prácticas y extensión', 'Bienestar y apoyos']

/* ─── Cuerpo docente ───────────────────────────────────────────── */

/* Tipo de vinculación contractual, no escalafón. El vacío es un valor legítimo:
   docente cargado sin que nadie haya registrado todavía su vinculación. */
export const VINCULACIONES = ['', 'planta', 'catedratico', 'ocasional']
export const ETIQUETA_VINCULACION = {
  '': 'Sin registrar',
  planta: 'Planta',
  catedratico: 'Catedrático',
  ocasional: 'Ocasional',
}

export const NIVELES_FORMACION = ['', 'especializacion', 'maestria', 'doctorado', 'posdoctorado', 'otro']
export const ETIQUETA_NIVEL = {
  '': 'Sin clasificar',
  especializacion: 'Especialización',
  maestria: 'Maestría',
  doctorado: 'Doctorado',
  posdoctorado: 'Posdoctorado',
  otro: 'Otro',
}

export const CATEGORIAS_GRUPO = ['', 'A1', 'A', 'B', 'C', 'Reconocido']

export const ANIO_FORMACION_MIN = 1950
export const ANIO_FORMACION_MAX = new Date().getFullYear() + 1

/* ─── Expresiones ──────────────────────────────────────────────── */
const RE_ENTERO   = /^-?\d+$/
const RE_DECIMAL  = /^-?\d+(?:[.,]\d+)?$/
const RE_NOMBRE   = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ'’.\- ]*$/
const RE_PERIODO  = /^(\d{4})-(I|II)$/
const RE_FECHA    = /^(\d{4})-(\d{2})-(\d{2})$/
const RE_PESO     = /^\d+(?:[.,]\d+)?\s?(B|KB|MB|GB)$/i

const vacio = v => v === undefined || v === null || String(v).trim() === ''

/* ─── Validadores ──────────────────────────────────────────────── */

export function requerido(v, etiqueta) {
  return vacio(v) ? `${etiqueta} es obligatorio` : null
}

export function texto(v, { etiqueta, min = 0, max = 500 } = {}) {
  if (vacio(v)) return null
  const s = String(v).trim()
  if (s.length < min) return `${etiqueta} debe tener al menos ${min} caracteres`
  if (s.length > max) return `${etiqueta} no puede pasar de ${max} caracteres`
  return null
}

/* Identificador interno, no texto para leer: minúsculas, números y guiones.
   Lo usan las claves de etapa del trámite, que viajan en el value de un
   <select> y se comparan por igualdad exacta con lo guardado en el plan. */
export function clave(v, etiqueta = 'Clave') {
  if (vacio(v)) return null
  const s = String(v).trim()
  if (s.length < 2) return `${etiqueta} debe tener al menos 2 caracteres`
  if (s.length > 40) return `${etiqueta} no puede pasar de 40 caracteres`
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(s)) {
    return `${etiqueta} solo admite minúsculas, números, guiones y guiones bajos`
  }
  return null
}

/* Nombres de persona: letras, espacios, tildes, apóstrofos y guiones.
   Rechaza dígitos, que es lo que se colaba antes. */
export function nombrePersona(v, etiqueta = 'Nombre') {
  if (vacio(v)) return null
  const s = String(v).trim()
  if (s.length < 3) return `${etiqueta} debe tener al menos 3 caracteres`
  if (s.length > 120) return `${etiqueta} no puede pasar de 120 caracteres`
  if (/\d/.test(s)) return `${etiqueta} no puede contener números`
  if (!RE_NOMBRE.test(s)) return `${etiqueta} solo admite letras, espacios, guiones y apóstrofos`
  return null
}

export function entero(v, { etiqueta, min = -Infinity, max = Infinity } = {}) {
  if (vacio(v)) return null
  const s = String(v).trim()
  if (!RE_ENTERO.test(s)) return `${etiqueta} debe ser un número entero, sin letras ni símbolos`
  const n = Number(s)
  if (n < min || n > max) return `${etiqueta} debe estar entre ${min} y ${max}`
  return null
}

export function decimal(v, { etiqueta, min = -Infinity, max = Infinity, decimales = 2 } = {}) {
  if (vacio(v)) return null
  const s = String(v).trim()
  if (!RE_DECIMAL.test(s)) return `${etiqueta} debe ser un número, sin letras ni símbolos`
  const n = Number(s.replace(',', '.'))
  if (Number.isNaN(n)) return `${etiqueta} no es un número válido`
  if (n < min || n > max) return `${etiqueta} debe estar entre ${min.toFixed(1)} y ${max.toFixed(1)}`
  const parteDecimal = s.replace(',', '.').split('.')[1]
  if (parteDecimal && parteDecimal.length > decimales) {
    return `${etiqueta} admite como máximo ${decimales} decimales`
  }
  return null
}

/* '2026-I' o '2026-II' */
export function periodo(v, etiqueta = 'Período') {
  if (vacio(v)) return null
  const m = RE_PERIODO.exec(String(v).trim())
  if (!m) return `${etiqueta} debe tener el formato 2026-I o 2026-II`
  const anio = Number(m[1])
  if (anio < 2000 || anio > 2100) return `${etiqueta} tiene un año fuera de rango (2000–2100)`
  return null
}

/* Fecha ISO que además exista en el calendario: descarta 2026-02-31. */
export function fechaISO(v, etiqueta = 'Fecha') {
  if (vacio(v)) return null
  const m = RE_FECHA.exec(String(v).trim())
  if (!m) return `${etiqueta} debe tener el formato AAAA-MM-DD`
  const [, a, mes, d] = m.map(Number)
  if (a < 2000 || a > 2100) return `${etiqueta} tiene un año fuera de rango (2000–2100)`
  if (mes < 1 || mes > 12) return `${etiqueta} tiene un mes inválido`
  const diasDelMes = new Date(a, mes, 0).getDate()
  if (d < 1 || d > diasDelMes) return `${etiqueta} no existe: ${mes}/${a} tiene ${diasDelMes} días`
  return null
}

export function enumerado(v, valores, etiqueta) {
  if (vacio(v)) return null
  return valores.includes(String(v)) ? null : `${etiqueta} debe ser uno de: ${valores.join(', ')}`
}

export function booleano(v, etiqueta) {
  if (v === undefined || v === null) return null
  return typeof v === 'boolean' ? null : `${etiqueta} debe ser verdadero o falso`
}

/* Ruta interna (/docs/...) o URL http(s). Nada de javascript: ni data:. */
export function rutaOUrl(v, etiqueta = 'URL') {
  if (vacio(v)) return null
  const s = String(v).trim()
  if (s.startsWith('/')) {
    return s.includes('..') ? `${etiqueta} no puede contener ".."` : null
  }
  if (/^https?:\/\/[^\s]+\.[^\s]+/i.test(s)) return null
  return `${etiqueta} debe empezar por / o ser una dirección http(s)://`
}

/* Correo electrónico. Deliberadamente laxo: validar direcciones con una
   expresión estricta rechaza correos válidos y no evita los inventados. Solo
   se comprueba la forma mínima y que no venga con espacios. */
export function correo(v, etiqueta = 'Correo') {
  if (vacio(v)) return null
  const s = String(v).trim()
  if (/\s/.test(s)) return `${etiqueta} no puede llevar espacios`
  return /^[^@]+@[^@]+\.[^@]+$/.test(s) ? null : `${etiqueta} no tiene forma de dirección válida`
}

/* '1.8 MB', '420 KB' */
export function tamanoArchivo(v, etiqueta = 'Peso') {
  if (vacio(v)) return null
  return RE_PESO.test(String(v).trim()) ? null : `${etiqueta} debe tener el formato "1.8 MB" o "420 KB"`
}

/* Un arreglo de cadenas cortas: requisitos, palabras clave y demás listas que
   la base guarda como TEXT[] y el panel edita como un textarea de líneas. */
export function listaDeTextos(v, { etiqueta = 'Lista', maximo = 20, largo = 200 } = {}) {
  if (v === undefined || v === null) return null
  if (!Array.isArray(v)) return `${etiqueta} debe ser una lista`
  if (v.length > maximo) return `${etiqueta} no puede pasar de ${maximo} elementos`
  if (v.some(x => typeof x !== 'string' || x.trim() === '')) return `${etiqueta}: ningún elemento puede ir vacío`
  if (v.some(x => x.length > largo)) return `${etiqueta}: cada elemento debe caber en ${largo} caracteres`
  return null
}

/* ─── Plan de estudios ─────────────────────────────────────────── */

/* Clasificación curricular de la materia. Las dos listas son del plan de
   estudios de la facultad y las comparten el panel, la API y el CHECK. */
export const AREAS_MATERIA = [
  'Ciencias Básicas', 'Ciencias Básicas de Ingeniería',
  'Perfil Profesional', 'Complementaria', 'Investigativo',
]
export const CAMPOS_MATERIA = [
  'Básico General Científico Disciplinar',
  'Básico Específico Profesional',
  'Socio Humanístico',
]

/* ─── Contenidos del portal ────────────────────────────────────── */

/* Forma canónica de las categorías. Existe una sola lista y la usan el panel,
   la API y el CHECK de la base.
   Antes el panel ofrecía 'investigación' en minúscula mientras el contenido
   guardaba 'Investigación': como el filtro público compara con ===, la noticia
   desaparecía al filtrar por su propia categoría. */
export const CATEGORIAS_NOTICIA = [
  'Académico', 'Investigación', 'Extensión', 'Institucional',
  'Acreditación', 'Egresados', 'Docencia',
]
export const CATEGORIAS_EVENTO = [
  'Académico', 'Cultural', 'Investigación', 'Extensión', 'Institucional',
  'Deportivo', 'Competencia', 'Taller', 'Laboral',
]
export const CATEGORIAS_CONVOCATORIA = [
  'Investigación', 'Internacionalización', 'Extensión', 'Prácticas',
  'Estímulos', 'Becas', 'Eventos',
]

/* Del evento solo se guarda lo que NO se deduce del calendario: si está
   próximo, en curso o pasado lo dice `faseEvento()` comparando con hoy. */
export const ESTADOS_EVENTO = ['programado', 'cancelado', 'aplazado']
export const ESTADOS_CONVOCATORIA = ['Abierta', 'Próxima', 'Cerrada']

/* ─── Trámite de grado (vista Egresados) ───────────────────────── */

/* Dos momentos que el portal separa a propósito: el *egresado* terminó el
   plan y está en trámite de grado; el *graduado* ya tiene el título. Cada uno
   tiene su vista porque necesitan cosas distintas. Estas listas son de la
   primera. */
export const TIPOS_NORMATIVA = [
  'Acuerdo', 'Resolución', 'Circular', 'Reglamento', 'Guía', 'Formato', 'Ley', 'Decreto',
]
export const ESTADOS_IDEA = ['Disponible', 'Tomada', 'En curso', 'Terminada']
export const DIFICULTADES_IDEA = ['Inicial', 'Intermedia', 'Avanzada']

/* El año de una norma: 1976 es la primera promoción del programa y el tope
   solo descarta erratas de tecleo. Coincide con el CHECK de la migración 013. */
export const ANIO_NORMATIVA_MIN = 1976
export const ANIO_NORMATIVA_MAX = 2100

/* ─── Investigación ────────────────────────────────────────────── */

/* Coinciden con los CHECK de la migración 019. */
export const TIPOS_PRODUCCION = [
  'Artículo', 'Ponencia', 'Libro', 'Capítulo de libro', 'Software', 'Patente', 'Otro',
]

/* ─── Extensión ────────────────────────────────────────────────── */

/* Coinciden con los CHECK de la migración 022. */
export const SECTORES_CONVENIO = ['Empresarial', 'Público', 'Tercer sector', 'Académico']
export const ESTADOS_PROYECTO_EXT = ['Formulación', 'En ejecución', 'Finalizado']
export const TIPOS_CURSO = ['Diplomado', 'Curso', 'Taller', 'Seminario']
export const MODALIDADES_CURSO = ['Presencial', 'Virtual', 'Híbrido']

/* ─── Internacionalización ─────────────────────────────────────── */

/* Coinciden con los CHECK de la migración 024. */
export const TIPOS_CONVENIO_INT = ['Marco', 'Específico']
export const DIRIGIDO_CONVOCATORIA = ['Estudiantes', 'Docentes', 'Estudiantes y docentes', 'Graduados']
export const ALCANCES_RED = ['Nacional', 'Internacional']

/* ─── Marco legal (Resoluciones) ───────────────────────────────── */

/* Coinciden con los CHECK de la migración 025. */
export const CATEGORIAS_ACTO = [
  ['registro', 'Registro calificado'],
  ['acreditacion', 'Acreditación en alta calidad'],
  ['otro', 'Otro acto'],
]
export const TIPOS_ACTO = ['Resolución', 'Acuerdo', 'Decreto', 'Circular', 'Ley']

/* ─── Contacto ─────────────────────────────────────────────────── */

/* Coinciden con los CHECK de la migración 026. */
export const NIVELES_CARGO = [
  ['direccion', 'Dirección / coordinación de sede'],
  ['coordinacion', 'Coordinación misional'],
  ['apoyo', 'Apoyo administrativo'],
]

/* --- Egresados y bolsa de empleo ------------------------------- */

export const MODALIDADES_OFERTA = ['Presencial', 'Remoto', 'Híbrido']
export const CONTRATOS_OFERTA = [
  'Tiempo completo', 'Medio tiempo', 'Práctica', 'Contrato por obra', 'Prestación de servicios',
]
export const ESTADOS_OFERTA = ['abierta', 'cerrada', 'borrador']
export const ESTADOS_POSTULACION = ['recibida', 'revisada', 'preseleccionada', 'descartada']
export const ETIQUETA_POSTULACION = {
  recibida: 'Recibida',
  revisada: 'Revisada',
  preseleccionada: 'Preseleccionada',
  descartada: 'Descartada',
}
export const FORMACION_POSTERIOR = [
  'Ninguna', 'Especialización', 'Maestría en curso', 'Maestría terminada',
  'Doctorado en curso', 'Doctorado terminado',
]

/* Tokens de la paleta institucional, no hex sueltos: así la tarjeta sigue al
   tema claro/oscuro sin que nadie tenga que reescribir el color. */
export const COLORES_TARJETA = [
  ['var(--ug-azul)', 'Teal institucional'],
  ['var(--ug-amarillo)', 'Ámbar'],
  ['var(--ug-flamingo)', 'Terracota'],
  ['var(--ug-marino)', 'Teal profundo'],
]

/* Año de grado. La base lo guarda como texto porque la planilla trae tanto
   "2018" como "2018-II", pero "cualquier cosa" no es un año: sin esto el
   formulario público aceptaba lo que se escribiera. */
export const ANIO_GRADO_MIN = 1976        // primera promoción del programa
const RE_ANIO_GRADO = /^(\d{4})(?:-(I|II))?$/

export function anioGrado(v, etiqueta = 'Año de grado') {
  if (vacio(v)) return null
  const m = RE_ANIO_GRADO.exec(String(v).trim())
  if (!m) return `${etiqueta} debe ser un año de cuatro cifras (2018) o un período (2018-II)`
  const a = Number(m[1])
  const max = new Date().getFullYear() + 1
  if (a < ANIO_GRADO_MIN || a > max) return `${etiqueta} debe estar entre ${ANIO_GRADO_MIN} y ${max}`
  return null
}

/* Documento de identidad: solo dígitos. Se admiten los puntos con que mucha
   gente los escribe, pero se cuentan las cifras, no los caracteres. */
export function documentoIdentidad(v, etiqueta = 'Documento') {
  if (vacio(v)) return null
  const s = String(v).trim()
  if (/[^\d.\s]/.test(s)) return `${etiqueta} solo admite números`
  const digitos = s.replace(/\D/g, '')
  if (digitos.length < 6 || digitos.length > 12) return `${etiqueta} debe tener entre 6 y 12 cifras`
  return null
}

/* --- Saber Pro --------------------------------------------------
   La estructura sale del reporte del ICFES: cinco módulos genéricos en escala
   0-300 y un global que es su promedio simple. El orden es el del reporte. */

export const PUNTAJE_SABERPRO_MIN = 0
export const PUNTAJE_SABERPRO_MAX = 300

export const MODULOS_SABERPRO = [
  ['lectura_critica', 'Lectura Crítica', 'LC'],
  ['razonamiento_cuantitativo', 'Razonamiento Cuantitativo', 'RC'],
  ['competencias_ciudadanas', 'Competencias Ciudadanas', 'CC'],
  ['comunicacion_escrita', 'Comunicación Escrita', 'CE'],
  ['ingles', 'Inglés', 'IN'],
]

export const CLAVES_MODULOS = MODULOS_SABERPRO.map(m => m[0])
export const ETIQUETA_MODULO = Object.fromEntries(MODULOS_SABERPRO.map(m => [m[0], m[1]]))
export const SIGLA_MODULO = Object.fromEntries(MODULOS_SABERPRO.map(m => [m[0], m[2]]))

/* Marco Común Europeo, tal como lo reporta el módulo de inglés. */
export const NIVELES_INGLES = ['', '-A1', 'A1', 'A2', 'B1', 'B2']

/* El mismo cálculo que hace la columna generada de la base y que define el
   ICFES: promedio simple de los cinco módulos. Está aquí para que el panel
   pueda enseñar el global mientras se teclea, antes de guardar nada. */
export function globalSaberPro(fila) {
  const valores = CLAVES_MODULOS.map(k => Number(fila?.[k]))
  if (valores.some(v => !Number.isFinite(v))) return null
  return Math.round(valores.reduce((a, b) => a + b, 0) / valores.length)
}

/* Si una fila cumple el acuerdo de grado por Saber Pro. Vive aquí, y no en el
   servidor ni en la página, porque las tres cosas tienen que responder lo
   mismo: la lista pública, el panel y cualquier informe que salga después. */
export function cumpleGrado(fila, parametros) {
  if (!fila || !parametros) return false
  const global = fila.puntaje_global ?? globalSaberPro(fila)
  if (global === null || global < parametros.puntaje_minimo) return false

  if (parametros.percentil_minimo !== null && parametros.percentil_minimo !== undefined) {
    if ((fila.percentil_nacional ?? -1) < parametros.percentil_minimo) return false
  }
  if (parametros.minimo_por_modulo !== null && parametros.minimo_por_modulo !== undefined) {
    if (CLAVES_MODULOS.some(k => Number(fila[k]) < parametros.minimo_por_modulo)) return false
  }
  return true
}

export function puntajeSaberPro(v, etiqueta = 'Puntaje') {
  return entero(v, { etiqueta, min: PUNTAJE_SABERPRO_MIN, max: PUNTAJE_SABERPRO_MAX })
}

/* --- Infraestructura tecnológica ---------------------------------- */

export const CATEGORIAS_INFRA = [
  ['computo', 'Salas de informática'],
  ['laboratorio', 'Laboratorios'],
  ['audiovisual', 'Salas de audiovisuales'],
  ['conectividad', 'Conectividad y red'],
  ['plataforma', 'Plataformas y sistemas'],
  ['espacio', 'Otros espacios'],
]

export const CLAVES_INFRA = CATEGORIAS_INFRA.map(c => c[0])
export const ETIQUETA_INFRA = Object.fromEntries(CATEGORIAS_INFRA)

/* Las sedes de la universidad, que son más que las dos del programa. */
export const SEDES_INFRA = ['ambas', 'riohacha', 'maicao', 'fonseca', 'villanueva']
export const ETIQUETA_SEDE_INFRA = {
  ambas: 'Todas las sedes',
  riohacha: 'Riohacha',
  maicao: 'Maicao',
  fonseca: 'Fonseca',
  villanueva: 'Villanueva',
}

/* Puestos totales que aporta un recurso: 22 salas de 30 puestos son 660.
   Se calcula, nunca se guarda, para que no pueda dejar de cuadrar con sus
   dos factores cuando alguien corrija uno de ellos. */
export function puestosDe(recurso) {
  const cantidad = Number(recurso?.cantidad)
  const capacidad = Number(recurso?.capacidad)
  if (!Number.isFinite(capacidad)) return null
  return (Number.isFinite(cantidad) ? cantidad : 1) * capacidad
}

const RE_YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/

/* Acepta el identificador pelado o cualquiera de las formas en que YouTube
   reparte un enlace (watch?v=, youtu.be/, /embed/, /shorts/) y devuelve solo
   el id. La base guarda el id, no la URL: volver a analizarla en cada render
   sería repetir este trabajo en cada tarjeta. Devuelve '' si no reconoce nada. */
export function idYouTube(entrada) {
  const s = String(entrada ?? '').trim()
  if (!s) return ''
  if (RE_YOUTUBE_ID.test(s)) return s
  const m = /(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{11})/.exec(s)
  return m ? m[1] : ''
}

export function youtube(v, etiqueta = 'Vídeo de YouTube') {
  if (vacio(v)) return null
  return idYouTube(v) ? null : `${etiqueta} no parece un enlace ni un identificador de YouTube`
}

/* Teléfonos colombianos y extranjeros: dígitos, espacios, guiones, paréntesis
   y un + inicial. No se normaliza a un formato porque el dato lo escribe el
   propio egresado y forzarlo haría rechazar números válidos de otros países;
   lo que sí se cuenta son las CIFRAS, no los caracteres, que es lo que dejaba
   pasar un "((((((((" de ocho signos como si fuera un número. */
export function telefono(v, etiqueta = 'Teléfono') {
  if (vacio(v)) return null
  const s = String(v).trim()
  if (!/^\+?[\d\s().-]+$/.test(s)) return `${etiqueta} solo admite números, espacios, guiones y paréntesis`
  const digitos = s.replace(/\D/g, '')
  if (digitos.length < 7) return `${etiqueta} debe tener al menos 7 cifras`
  if (digitos.length > 15) return `${etiqueta} no puede pasar de 15 cifras`
  return null
}

const RE_HORA_24 = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/

/* Hora en formato de 24 horas, que es lo que entrega <input type="time">. */
export function hora24(v, etiqueta = 'Hora') {
  if (vacio(v)) return null
  return RE_HORA_24.test(String(v).trim()) ? null : `${etiqueta} debe tener el formato HH:MM`
}

/* '2026-04-12' -> '12 abr 2026'. La base guarda la fecha; el formato largo es
   cosa de la vista, igual que el ordinal del semestre. */
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export function fechaLarga(iso) {
  const m = RE_FECHA.exec(String(iso ?? '').trim())
  if (!m) return String(iso ?? '')
  const [, a, mes, d] = m
  return `${d} ${MESES_CORTOS[Number(mes) - 1]} ${a}`
}

/* '14:00:00' -> '2:00 PM'. */
export function horaLarga(v) {
  const m = RE_HORA_24.exec(String(v ?? '').trim())
  if (!m) return ''
  const h = Number(m[1])
  const sufijo = h < 12 ? 'AM' : 'PM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${m[2]} ${sufijo}`
}

/* En qué punto del calendario está un evento. No se persiste: se calcula, para
   que la cartelera no dependa de que alguien vaya cambiando un campo a mano. */
export function faseEvento({ fecha, fecha_fin, estado } = {}, hoy = new Date()) {
  if (estado && estado !== 'programado') return estado
  const dia = hoy.toISOString().slice(0, 10)
  const fin = fecha_fin || fecha
  if (!fecha) return 'programado'
  if (dia < fecha) return 'proximo'
  if (dia <= fin) return 'en_curso'
  return 'pasado'
}

/* ─── Esquemas por recurso ─────────────────────────────────────── */
/* `obligatorio` marca lo que no puede faltar al crear.
   `validar` corre siempre que el campo venga con valor. */

export const ESQUEMAS = {
  /* Docente. Solo el nombre es obligatorio: la planilla llega incompleta y es
     preferible cargar al profesor y completar después que bloquear el registro
     por un dato que nadie tiene todavía. */
  docentes: {
    nombre:          { etiqueta: 'Nombre',        obligatorio: true,  validar: v => nombrePersona(v, 'Nombre') },
    vinculacion:     { etiqueta: 'Vinculación',   obligatorio: false, validar: v => enumerado(v, VINCULACIONES, 'Vinculación') },
    sede:            { etiqueta: 'Sede',          obligatorio: false, validar: v => enumerado(v, SEDES, 'Sede') },
    email:           { etiqueta: 'Correo',        obligatorio: false, validar: v => correo(v, 'Correo') },
    cvlac_url:       { etiqueta: 'CvLAC',         obligatorio: false, validar: v => rutaOUrl(v, 'CvLAC') },
    orcid_url:       { etiqueta: 'ORCID',         obligatorio: false, validar: v => rutaOUrl(v, 'ORCID') },
    scholar_url:     { etiqueta: 'Google Scholar', obligatorio: false, validar: v => rutaOUrl(v, 'Google Scholar') },
    posgrado:        { etiqueta: 'Posgrado',      obligatorio: false, validar: v => texto(v, { etiqueta: 'Posgrado', max: 800 }) },
    dedicacion:      { etiqueta: 'Dedicación',    obligatorio: false, validar: v => texto(v, { etiqueta: 'Dedicación', max: 80 }) },
    oficina:         { etiqueta: 'Oficina',       obligatorio: false, validar: v => texto(v, { etiqueta: 'Oficina', max: 120 }) },
    extension:       { etiqueta: 'Extensión',     obligatorio: false, validar: v => texto(v, { etiqueta: 'Extensión', max: 40 }) },
    horario:         { etiqueta: 'Horario',       obligatorio: false, validar: v => texto(v, { etiqueta: 'Horario', max: 200 }) },
    grupo:           { etiqueta: 'Grupo',         obligatorio: false, validar: v => texto(v, { etiqueta: 'Grupo', max: 160 }) },
    grupo_categoria: { etiqueta: 'Categoría del grupo', obligatorio: false, validar: v => enumerado(v, CATEGORIAS_GRUPO, 'Categoría del grupo') },
    semillero:       { etiqueta: 'Semillero',     obligatorio: false, validar: v => texto(v, { etiqueta: 'Semillero', max: 160 }) },
    activo:          { etiqueta: 'Activo',        obligatorio: false, validar: v => booleano(v, 'Activo') },
  },

  /* Un título de posgrado del docente. */
  formacion: {
    titulo:      { etiqueta: 'Título',      obligatorio: true,  validar: v => texto(v, { etiqueta: 'Título', min: 3, max: 240 }) },
    nivel:       { etiqueta: 'Nivel',       obligatorio: false, validar: v => enumerado(v, NIVELES_FORMACION, 'Nivel') },
    institucion: { etiqueta: 'Institución', obligatorio: false, validar: v => texto(v, { etiqueta: 'Institución', max: 160 }) },
    anio:        { etiqueta: 'Año',         obligatorio: false, validar: v => entero(v, { etiqueta: 'Año', min: ANIO_FORMACION_MIN, max: ANIO_FORMACION_MAX }) },
    en_curso:    { etiqueta: 'En curso',    obligatorio: false, validar: v => booleano(v, 'En curso') },
    orden:       { etiqueta: 'Orden',       obligatorio: false, validar: v => entero(v, { etiqueta: 'Orden', min: 0, max: 999 }) },
  },

  honor: {
    nombre:   { etiqueta: 'Nombre',   obligatorio: true,  validar: v => nombrePersona(v, 'Nombre') },
    promedio: { etiqueta: 'Promedio', obligatorio: true,  validar: v => decimal(v, { etiqueta: 'Promedio', min: PROMEDIO_MIN, max: PROMEDIO_MAX, decimales: 2 }) },
    semestre: { etiqueta: 'Semestre', obligatorio: false, validar: v => entero(v, { etiqueta: 'Semestre', min: SEMESTRE_MIN, max: SEMESTRE_MAX }) },
    periodo:  { etiqueta: 'Período',  obligatorio: false, validar: v => periodo(v) },
    sede:     { etiqueta: 'Sede',     obligatorio: false, validar: v => enumerado(v, SEDES, 'Sede') },
  },

  /* Documentos propios de un estudiante del cuadro de honor. El archivo llega
     por multipart, así que aquí solo se validan los datos que lo acompañan. */
  documentos_honor: {
    nombre:      { etiqueta: 'Nombre',      obligatorio: true,  validar: v => texto(v, { etiqueta: 'Nombre', min: 3, max: 160 }) },
    descripcion: { etiqueta: 'Descripción', obligatorio: false, validar: v => texto(v, { etiqueta: 'Descripción', max: 300 }) },
    tipo:        { etiqueta: 'Tipo',        obligatorio: false, validar: v => enumerado(v, TIPOS_DOCUMENTO, 'Tipo') },
    peso:        { etiqueta: 'Peso',        obligatorio: false, validar: v => tamanoArchivo(v) },
    orden:       { etiqueta: 'Orden',       obligatorio: false, validar: v => entero(v, { etiqueta: 'Orden', min: 0, max: 999 }) },
  },

  calendario: {
    titulo:       { etiqueta: 'Evento',  obligatorio: true,  validar: v => texto(v, { etiqueta: 'Evento', min: 3, max: 160 }) },
    fecha_inicio: { etiqueta: 'Desde',   obligatorio: true,  validar: v => fechaISO(v, 'Desde') },
    fecha_fin:    { etiqueta: 'Hasta',   obligatorio: false, validar: v => fechaISO(v, 'Hasta') },
    tipo:         { etiqueta: 'Tipo',    obligatorio: false, validar: v => enumerado(v, TIPOS_CALENDARIO, 'Tipo') },
    periodo:      { etiqueta: 'Período', obligatorio: false, validar: v => periodo(v) },
    sede:         { etiqueta: 'Sede',    obligatorio: false, validar: v => enumerado(v, SEDES_CON_AMBAS, 'Sede') },
    destacado:    { etiqueta: 'Destacado', obligatorio: false, validar: v => booleano(v, 'Destacado') },
  },

  modalidades: {
    nombre:        { etiqueta: 'Nombre',      obligatorio: true,  validar: v => texto(v, { etiqueta: 'Nombre', min: 3, max: 120 }) },
    descripcion:   { etiqueta: 'Descripción', obligatorio: false, validar: v => texto(v, { etiqueta: 'Descripción', max: 600 }) },
    duracion:      { etiqueta: 'Duración',    obligatorio: false, validar: v => texto(v, { etiqueta: 'Duración', max: 40 }) },
    documento_url: { etiqueta: 'Documento',   obligatorio: false, validar: v => rutaOUrl(v, 'Documento') },
    orden:         { etiqueta: 'Orden',       obligatorio: false, validar: v => entero(v, { etiqueta: 'Orden', min: 0, max: 999 }) },
    requisitos:    { etiqueta: 'Requisitos', obligatorio: false, validar: v => listaDeTextos(v, { etiqueta: 'Requisitos' }) },
  },

  documentos: {
    nombre:      { etiqueta: 'Nombre',      obligatorio: true,  validar: v => texto(v, { etiqueta: 'Nombre', min: 3, max: 160 }) },
    descripcion: { etiqueta: 'Descripción', obligatorio: false, validar: v => texto(v, { etiqueta: 'Descripción', max: 300 }) },
    url:         { etiqueta: 'URL',         obligatorio: false, validar: v => rutaOUrl(v, 'URL') },
    tipo:        { etiqueta: 'Tipo',        obligatorio: false, validar: v => enumerado(v, TIPOS_DOCUMENTO, 'Tipo') },
    grupo:       { etiqueta: 'Grupo',       obligatorio: false, validar: v => enumerado(v, GRUPOS_DOCUMENTO, 'Grupo') },
    peso:        { etiqueta: 'Peso',        obligatorio: false, validar: v => tamanoArchivo(v) },
    orden:       { etiqueta: 'Orden',       obligatorio: false, validar: v => entero(v, { etiqueta: 'Orden', min: 0, max: 999 }) },
  },

  /* ─── Plan de estudios ───────────────────────────────────────── */

  /* La materia del catálogo: lo que es cierto de ella en cualquier malla. */
  materias: {
    nombre: { etiqueta: 'Nombre', obligatorio: true,  validar: v => texto(v, { etiqueta: 'Nombre', min: 3, max: 160 }) },
    codigo: { etiqueta: 'Código', obligatorio: false, validar: v => texto(v, { etiqueta: 'Código', max: 20 }) },
    area:   { etiqueta: 'Área',   obligatorio: false, validar: v => enumerado(v, AREAS_MATERIA, 'Área') },
    campo:  { etiqueta: 'Campo',  obligatorio: false, validar: v => enumerado(v, CAMPOS_MATERIA, 'Campo') },
  },

  /* La materia dentro de una malla: lo que cambia de un plan a otro. */
  plan_materia: {
    materia_id:   { etiqueta: 'Materia',  obligatorio: true,  validar: v => entero(v, { etiqueta: 'Materia', min: 1 }) },
    semestre:     { etiqueta: 'Semestre', obligatorio: true,  validar: v => entero(v, { etiqueta: 'Semestre', min: 1, max: 14 }) },
    creditos:     { etiqueta: 'Créditos', obligatorio: false, validar: v => entero(v, { etiqueta: 'Créditos', min: 0, max: 12 }) },
    horas_semana: { etiqueta: 'Horas',    obligatorio: false, validar: v => entero(v, { etiqueta: 'Horas', min: 0, max: 40 }) },
    orden:        { etiqueta: 'Orden',    obligatorio: false, validar: v => entero(v, { etiqueta: 'Orden', min: 0, max: 999 }) },
  },

  /* Una etapa del trámite. La `clave` es la que guarda plan_estudio para
     señalar en cuál va: se valida como texto corto sin espacios porque viaja
     en el valor de un <select> y se compara por igualdad. */
  plan_tramite: {
    clave:   { etiqueta: 'Clave',   obligatorio: true,  validar: v => clave(v, 'Clave') },
    etapa:   { etiqueta: 'Etapa',   obligatorio: true,  validar: v => texto(v, { etiqueta: 'Etapa', min: 3, max: 120 }) },
    detalle: { etiqueta: 'Detalle', obligatorio: false, validar: v => texto(v, { etiqueta: 'Detalle', max: 600 }) },
    orden:   { etiqueta: 'Orden',   obligatorio: false, validar: v => entero(v, { etiqueta: 'Orden', min: 0, max: 999 }) },
  },

  /* Una tarjeta del carrusel informativo, la tira que acompaña al encabezado
     de una página. Los límites son los mismos que declara la tabla: el
     formulario avisa antes y la base es la última red. */
  tarjeta_carrusel: {
    /* El título no es obligatorio a secas: una tarjeta que es solo la imagen
       no lo publica, y en un PATCH puede no viajar. Quien decide si falta es
       la API, que mira el cuerpo contra la fila guardada; aquí solo se
       comprueba que, si viene, sea un título decente. */
    titulo:      { etiqueta: 'Título',  obligatorio: false, validar: v => texto(v, { etiqueta: 'Título', min: 3, max: 120 }) },
    solo_imagen: { etiqueta: 'Solo imagen', obligatorio: false, validar: v => booleano(v, 'Solo imagen') },
    texto:      { etiqueta: 'Texto',   obligatorio: false, validar: v => texto(v, { etiqueta: 'Texto', max: 600 }) },
    pie:        { etiqueta: 'Pie',     obligatorio: false, validar: v => texto(v, { etiqueta: 'Pie', max: 80 }) },
    imagen_url: { etiqueta: 'Imagen',  obligatorio: false, validar: v => rutaOUrl(v, 'Imagen') },
    orden:      { etiqueta: 'Orden',   obligatorio: false, validar: v => entero(v, { etiqueta: 'Orden', min: 0, max: 999 }) },
    visible:    { etiqueta: 'Visible', obligatorio: false, validar: v => booleano(v, 'Visible') },
  },

  /* El encabezado de la página del plan. Solo lo usa la propuesta, pero vive
     en plan_estudio y cualquier plan podría tenerlo. */
  plan_datos: {
    nombre:             { etiqueta: 'Nombre',   obligatorio: false, validar: v => texto(v, { etiqueta: 'Nombre', min: 3, max: 120 }) },
    titulo:             { etiqueta: 'Título',   obligatorio: false, validar: v => texto(v, { etiqueta: 'Título', max: 160 }) },
    num_semestres:      { etiqueta: 'Semestres', obligatorio: false, validar: v => entero(v, { etiqueta: 'Semestres', min: 1, max: 14 }) },
    hero_insignia:      { etiqueta: 'Insignia', obligatorio: false, validar: v => texto(v, { etiqueta: 'Insignia', max: 160 }) },
    hero_titulo:        { etiqueta: 'Titular',  obligatorio: false, validar: v => texto(v, { etiqueta: 'Titular', max: 160 }) },
    hero_titulo_acento: { etiqueta: 'Titular resaltado', obligatorio: false, validar: v => texto(v, { etiqueta: 'Titular resaltado', max: 160 }) },
    hero_texto:         { etiqueta: 'Entradilla', obligatorio: false, validar: v => texto(v, { etiqueta: 'Entradilla', max: 1200 }) },
    extracurriculares:  { etiqueta: 'Extracurriculares', obligatorio: false, validar: v => listaDeTextos(v, { etiqueta: 'Extracurriculares' }) },
  },

  /* ─── Contenidos del portal ──────────────────────────────────── */

  noticias: {
    titulo:     { etiqueta: 'Título',     obligatorio: true,  validar: v => texto(v, { etiqueta: 'Título', min: 3, max: 200 }) },
    fecha:      { etiqueta: 'Fecha',      obligatorio: true,  validar: v => fechaISO(v, 'Fecha') },
    categoria:  { etiqueta: 'Categoría',  obligatorio: false, validar: v => enumerado(v, CATEGORIAS_NOTICIA, 'Categoría') },
    resumen:    { etiqueta: 'Resumen',    obligatorio: false, validar: v => texto(v, { etiqueta: 'Resumen', max: 600 }) },
    cuerpo:     { etiqueta: 'Cuerpo',     obligatorio: false, validar: v => texto(v, { etiqueta: 'Cuerpo', max: 20000 }) },
    autor:      { etiqueta: 'Autor',      obligatorio: false, validar: v => texto(v, { etiqueta: 'Autor', max: 120 }) },
    sede:       { etiqueta: 'Sede',       obligatorio: false, validar: v => enumerado(v, SEDES_CON_AMBAS, 'Sede') },
    imagen_url: { etiqueta: 'Imagen',     obligatorio: false, validar: v => rutaOUrl(v, 'Imagen') },
    publicada:  { etiqueta: 'Publicada',  obligatorio: false, validar: v => booleano(v, 'Publicada') },
  },

  eventos: {
    titulo:          { etiqueta: 'Título',      obligatorio: true,  validar: v => texto(v, { etiqueta: 'Título', min: 3, max: 200 }) },
    fecha:           { etiqueta: 'Fecha',       obligatorio: true,  validar: v => fechaISO(v, 'Fecha') },
    fecha_fin:       { etiqueta: 'Fecha final', obligatorio: false, validar: v => fechaISO(v, 'Fecha final') },
    hora:            { etiqueta: 'Hora',        obligatorio: false, validar: v => hora24(v, 'Hora') },
    hora_fin:        { etiqueta: 'Hora final',  obligatorio: false, validar: v => hora24(v, 'Hora final') },
    categoria:       { etiqueta: 'Categoría',   obligatorio: false, validar: v => enumerado(v, CATEGORIAS_EVENTO, 'Categoría') },
    descripcion:     { etiqueta: 'Descripción', obligatorio: false, validar: v => texto(v, { etiqueta: 'Descripción', max: 2000 }) },
    lugar:           { etiqueta: 'Lugar',       obligatorio: false, validar: v => texto(v, { etiqueta: 'Lugar', max: 200 }) },
    ponente:         { etiqueta: 'Ponente',     obligatorio: false, validar: v => texto(v, { etiqueta: 'Ponente', max: 160 }) },
    sede:            { etiqueta: 'Sede',        obligatorio: false, validar: v => enumerado(v, SEDES_CON_AMBAS, 'Sede') },
    estado:          { etiqueta: 'Estado',      obligatorio: false, validar: v => enumerado(v, ESTADOS_EVENTO, 'Estado') },
    imagen_url:      { etiqueta: 'Imagen',      obligatorio: false, validar: v => rutaOUrl(v, 'Imagen') },
    url_inscripcion: { etiqueta: 'Inscripción', obligatorio: false, validar: v => rutaOUrl(v, 'Inscripción') },
  },

  convocatorias: {
    titulo:          { etiqueta: 'Título',      obligatorio: true,  validar: v => texto(v, { etiqueta: 'Título', min: 3, max: 200 }) },
    categoria:       { etiqueta: 'Categoría',   obligatorio: false, validar: v => enumerado(v, CATEGORIAS_CONVOCATORIA, 'Categoría') },
    estado:          { etiqueta: 'Estado',      obligatorio: false, validar: v => enumerado(v, ESTADOS_CONVOCATORIA, 'Estado') },
    descripcion:     { etiqueta: 'Descripción', obligatorio: false, validar: v => texto(v, { etiqueta: 'Descripción', max: 2000 }) },
    fecha_apertura:  { etiqueta: 'Apertura',    obligatorio: false, validar: v => fechaISO(v, 'Apertura') },
    fecha_cierre:    { etiqueta: 'Cierre',      obligatorio: false, validar: v => fechaISO(v, 'Cierre') },
    dirigida_a:      { etiqueta: 'Dirigida a',  obligatorio: false, validar: v => texto(v, { etiqueta: 'Dirigida a', max: 120 }) },
    sede:            { etiqueta: 'Sede',        obligatorio: false, validar: v => enumerado(v, SEDES_CON_AMBAS, 'Sede') },
    url_postulacion: { etiqueta: 'Postulación', obligatorio: false, validar: v => rutaOUrl(v, 'Postulación') },
    documento_url:   { etiqueta: 'Documento',   obligatorio: false, validar: v => rutaOUrl(v, 'Documento') },
    requisitos:      {
      etiqueta: 'Requisitos', obligatorio: false,
      validar: v => {
        if (v === undefined || v === null) return null
        if (!Array.isArray(v)) return 'Requisitos debe ser una lista'
        if (v.length > 20) return 'Requisitos no puede pasar de 20 elementos'
        if (v.some(r => typeof r !== 'string' || r.trim() === '')) return 'Los requisitos no pueden estar vacíos'
        if (v.some(r => r.length > 200)) return 'Cada requisito debe caber en 200 caracteres'
        return null
      },
    },
  },

  /* --- Egresados ----------------------------------------------- */

  /* Solo el nombre es obligatorio: la coordinación carga al egresado con lo
     que tenga y completa cuando el propio egresado actualiza sus datos. */
  egresados: {
    nombre:        { etiqueta: 'Nombre',       obligatorio: true,  validar: v => nombrePersona(v, 'Nombre') },
    anio_grado:    { etiqueta: 'Año de grado', obligatorio: false, validar: v => anioGrado(v) },
    cargo:         { etiqueta: 'Cargo',        obligatorio: false, validar: v => texto(v, { etiqueta: 'Cargo', max: 120 }) },
    empresa:       { etiqueta: 'Empresa',      obligatorio: false, validar: v => texto(v, { etiqueta: 'Empresa', max: 120 }) },
    ciudad:        { etiqueta: 'Ciudad',       obligatorio: false, validar: v => texto(v, { etiqueta: 'Ciudad', max: 80 }) },
    pais:          { etiqueta: 'País',         obligatorio: false, validar: v => texto(v, { etiqueta: 'País', max: 60 }) },
    sede:          { etiqueta: 'Sede',         obligatorio: false, validar: v => enumerado(v, SEDES_CON_AMBAS, 'Sede') },
    testimonio:    { etiqueta: 'Testimonio',   obligatorio: false, validar: v => texto(v, { etiqueta: 'Testimonio', max: 600 }) },
    linkedin_url:  { etiqueta: 'LinkedIn',     obligatorio: false, validar: v => rutaOUrl(v, 'LinkedIn') },
    color:         { etiqueta: 'Color',        obligatorio: false, validar: v => enumerado(v, COLORES_TARJETA.map(c => c[0]), 'Color') },
    video_youtube: { etiqueta: 'Vídeo',        obligatorio: false, validar: v => youtube(v, 'Vídeo') },
    video_url:     { etiqueta: 'Vídeo MP4',    obligatorio: false, validar: v => rutaOUrl(v, 'Vídeo MP4') },
    destacado:     { etiqueta: 'Destacado',    obligatorio: false, validar: v => booleano(v, 'Destacado') },
    activo:        { etiqueta: 'Activo',       obligatorio: false, validar: v => booleano(v, 'Activo') },
    orden:         { etiqueta: 'Orden',        obligatorio: false, validar: v => entero(v, { etiqueta: 'Orden', min: 0, max: 999 }) },
  },

  ofertas: {
    cargo:             { etiqueta: 'Cargo',             obligatorio: true,  validar: v => texto(v, { etiqueta: 'Cargo', min: 3, max: 160 }) },
    empresa:           { etiqueta: 'Empresa',           obligatorio: true,  validar: v => texto(v, { etiqueta: 'Empresa', min: 2, max: 120 }) },
    ubicacion:         { etiqueta: 'Ubicación',         obligatorio: false, validar: v => texto(v, { etiqueta: 'Ubicación', max: 120 }) },
    modalidad:         { etiqueta: 'Modalidad',         obligatorio: false, validar: v => enumerado(v, MODALIDADES_OFERTA, 'Modalidad') },
    tipo_contrato:     { etiqueta: 'Contrato',          obligatorio: false, validar: v => enumerado(v, CONTRATOS_OFERTA, 'Contrato') },
    salario:           { etiqueta: 'Salario',           obligatorio: false, validar: v => texto(v, { etiqueta: 'Salario', max: 80 }) },
    vacantes:          { etiqueta: 'Vacantes',          obligatorio: false, validar: v => entero(v, { etiqueta: 'Vacantes', min: 1, max: 999 }) },
    descripcion:       { etiqueta: 'Descripción',       obligatorio: false, validar: v => texto(v, { etiqueta: 'Descripción', max: 4000 }) },
    responsabilidades: { etiqueta: 'Responsabilidades', obligatorio: false, validar: v => texto(v, { etiqueta: 'Responsabilidades', max: 4000 }) },
    requisitos:        { etiqueta: 'Requisitos',        obligatorio: false, validar: v => texto(v, { etiqueta: 'Requisitos', max: 4000 }) },
    beneficios:        { etiqueta: 'Beneficios',        obligatorio: false, validar: v => texto(v, { etiqueta: 'Beneficios', max: 4000 }) },
    contacto_email:    { etiqueta: 'Correo de contacto', obligatorio: false, validar: v => correo(v, 'Correo de contacto') },
    url_externa:       { etiqueta: 'Portal externo',    obligatorio: false, validar: v => rutaOUrl(v, 'Portal externo') },
    fecha_publicacion: { etiqueta: 'Publicación',       obligatorio: false, validar: v => fechaISO(v, 'Publicación') },
    fecha_cierre:      { etiqueta: 'Cierre',            obligatorio: false, validar: v => fechaISO(v, 'Cierre') },
    estado:            { etiqueta: 'Estado',            obligatorio: false, validar: v => enumerado(v, ESTADOS_OFERTA, 'Estado') },
    tags:              {
      etiqueta: 'Tecnologías', obligatorio: false,
      validar: v => {
        if (v === undefined || v === null) return null
        if (!Array.isArray(v)) return 'Tecnologías debe ser una lista'
        if (v.length > 20) return 'Tecnologías no puede pasar de 20 elementos'
        if (v.some(t => typeof t !== 'string' || t.trim() === '')) return 'Las tecnologías no pueden estar vacías'
        if (v.some(t => t.length > 40)) return 'Cada tecnología debe caber en 40 caracteres'
        return null
      },
    },
  },

  /* Lo que llena quien aplica a una vacante. Aquí sí se exige lo mínimo para
     poder responderle: sin correo la postulación no le sirve a nadie. */
  postulaciones: {
    nombre:       { etiqueta: 'Nombre',       obligatorio: true,  validar: v => nombrePersona(v, 'Nombre') },
    email:        { etiqueta: 'Correo',       obligatorio: true,  validar: v => correo(v, 'Correo') },
    documento:    { etiqueta: 'Documento',    obligatorio: false, validar: v => documentoIdentidad(v) },
    telefono:     { etiqueta: 'Celular',      obligatorio: false, validar: v => telefono(v, 'Celular') },
    anio_grado:   { etiqueta: 'Año de grado', obligatorio: false, validar: v => anioGrado(v) },
    linkedin_url: { etiqueta: 'LinkedIn',     obligatorio: false, validar: v => rutaOUrl(v, 'LinkedIn') },
    mensaje:      { etiqueta: 'Mensaje',      obligatorio: false, validar: v => texto(v, { etiqueta: 'Mensaje', max: 1500 }) },
    estado:       { etiqueta: 'Estado',       obligatorio: false, validar: v => enumerado(v, ESTADOS_POSTULACION, 'Estado') },
    notas:        { etiqueta: 'Notas',        obligatorio: false, validar: v => texto(v, { etiqueta: 'Notas', max: 1000 }) },
  },

  actualizaciones: {
    nombre:              { etiqueta: 'Nombre',       obligatorio: true,  validar: v => nombrePersona(v, 'Nombre') },
    email:               { etiqueta: 'Correo',       obligatorio: true,  validar: v => correo(v, 'Correo') },
    documento:           { etiqueta: 'Documento',    obligatorio: false, validar: v => documentoIdentidad(v) },
    anio_grado:          { etiqueta: 'Año de grado', obligatorio: false, validar: v => anioGrado(v) },
    telefono:            { etiqueta: 'Celular',      obligatorio: false, validar: v => telefono(v, 'Celular') },
    ciudad:              { etiqueta: 'Ciudad',       obligatorio: false, validar: v => texto(v, { etiqueta: 'Ciudad', max: 80 }) },
    empresa:             { etiqueta: 'Empresa',      obligatorio: false, validar: v => texto(v, { etiqueta: 'Empresa', max: 120 }) },
    cargo:               { etiqueta: 'Cargo',        obligatorio: false, validar: v => texto(v, { etiqueta: 'Cargo', max: 120 }) },
    formacion_posterior: { etiqueta: 'Formación',    obligatorio: false, validar: v => enumerado(v, FORMACION_POSTERIOR, 'Formación') },
    resumen:             { etiqueta: 'Resumen',      obligatorio: false, validar: v => texto(v, { etiqueta: 'Resumen', max: 600 }) },
    autoriza_datos:      { etiqueta: 'Autorización', obligatorio: false, validar: v => booleano(v, 'Autorización') },
    atendida:            { etiqueta: 'Atendida',     obligatorio: false, validar: v => booleano(v, 'Atendida') },
  },

  /* --- Saber Pro ------------------------------------------------ */

  /* Los cinco módulos son obligatorios: el global se calcula con ellos y un
     reporte del ICFES sin alguno no es un reporte. `puntaje_global` no está
     en el esquema a propósito, porque no se recibe: lo genera la base. */
  saberpro: {
    estudiante:                { etiqueta: 'Estudiante', obligatorio: true,  validar: v => nombrePersona(v, 'Estudiante') },
    documento:                 { etiqueta: 'Documento',  obligatorio: false, validar: v => documentoIdentidad(v) },
    registro:                  { etiqueta: 'Registro',   obligatorio: false, validar: v => texto(v, { etiqueta: 'Registro', max: 30 }) },
    anio:                      { etiqueta: 'Año',        obligatorio: true,  validar: v => entero(v, { etiqueta: 'Año', min: 2010, max: new Date().getFullYear() + 1 }) },
    periodo:                   { etiqueta: 'Período',    obligatorio: false, validar: v => periodo(v) },
    sede:                      { etiqueta: 'Sede',       obligatorio: false, validar: v => enumerado(v, SEDES, 'Sede') },

    lectura_critica:           { etiqueta: 'Lectura Crítica',           obligatorio: true, validar: v => puntajeSaberPro(v, 'Lectura Crítica') },
    razonamiento_cuantitativo: { etiqueta: 'Razonamiento Cuantitativo', obligatorio: true, validar: v => puntajeSaberPro(v, 'Razonamiento Cuantitativo') },
    competencias_ciudadanas:   { etiqueta: 'Competencias Ciudadanas',   obligatorio: true, validar: v => puntajeSaberPro(v, 'Competencias Ciudadanas') },
    comunicacion_escrita:      { etiqueta: 'Comunicación Escrita',      obligatorio: true, validar: v => puntajeSaberPro(v, 'Comunicación Escrita') },
    ingles:                    { etiqueta: 'Inglés',                    obligatorio: true, validar: v => puntajeSaberPro(v, 'Inglés') },

    percentil_nacional:        { etiqueta: 'Percentil nacional', obligatorio: false, validar: v => entero(v, { etiqueta: 'Percentil nacional', min: 0, max: 100 }) },
    percentil_nbc:             { etiqueta: 'Percentil NBC',      obligatorio: false, validar: v => entero(v, { etiqueta: 'Percentil NBC', min: 0, max: 100 }) },
    nivel_ingles:              { etiqueta: 'Nivel de inglés',    obligatorio: false, validar: v => enumerado(v, NIVELES_INGLES, 'Nivel de inglés') },
    observaciones:             { etiqueta: 'Observaciones',      obligatorio: false, validar: v => texto(v, { etiqueta: 'Observaciones', max: 600 }) },
  },

  infraestructura: {
    nombre:        { etiqueta: 'Nombre',       obligatorio: true,  validar: v => texto(v, { etiqueta: 'Nombre', min: 3, max: 160 }) },
    categoria:     { etiqueta: 'Categoría',    obligatorio: false, validar: v => enumerado(v, CLAVES_INFRA, 'Categoría') },
    descripcion:   { etiqueta: 'Descripción',  obligatorio: false, validar: v => texto(v, { etiqueta: 'Descripción', max: 2000 }) },
    sede:          { etiqueta: 'Sede',         obligatorio: false, validar: v => enumerado(v, SEDES_INFRA, 'Sede') },
    ubicacion:     { etiqueta: 'Ubicación',    obligatorio: false, validar: v => texto(v, { etiqueta: 'Ubicación', max: 160 }) },
    cantidad:      { etiqueta: 'Cantidad',     obligatorio: false, validar: v => entero(v, { etiqueta: 'Cantidad', min: 1, max: 10000 }) },
    capacidad:     { etiqueta: 'Puestos',      obligatorio: false, validar: v => entero(v, { etiqueta: 'Puestos', min: 1, max: 10000 }) },
    area_m2:       { etiqueta: 'Área (m²)',    obligatorio: false, validar: v => entero(v, { etiqueta: 'Área', min: 1, max: 1000000 }) },
    anio:          { etiqueta: 'Año',          obligatorio: false, validar: v => entero(v, { etiqueta: 'Año', min: 1976, max: new Date().getFullYear() + 1 }) },
    equipamiento:  { etiqueta: 'Equipamiento', obligatorio: false, validar: v => texto(v, { etiqueta: 'Equipamiento', max: 3000 }) },
    fuente_url:    { etiqueta: 'Fuente',       obligatorio: false, validar: v => rutaOUrl(v, 'Fuente') },
    fuente_nombre: { etiqueta: 'Nombre de la fuente', obligatorio: false, validar: v => texto(v, { etiqueta: 'Nombre de la fuente', max: 160 }) },
    destacado:     { etiqueta: 'Destacado',    obligatorio: false, validar: v => booleano(v, 'Destacado') },
    activo:        { etiqueta: 'Visible',      obligatorio: false, validar: v => booleano(v, 'Visible') },
    orden:         { etiqueta: 'Orden',        obligatorio: false, validar: v => entero(v, { etiqueta: 'Orden', min: 0, max: 999 }) },
  },

  saberpro_parametros: {
    puntaje_minimo:    { etiqueta: 'Puntaje mínimo',     obligatorio: true,  validar: v => puntajeSaberPro(v, 'Puntaje mínimo') },
    percentil_minimo:  { etiqueta: 'Percentil mínimo',   obligatorio: false, validar: v => entero(v, { etiqueta: 'Percentil mínimo', min: 0, max: 100 }) },
    minimo_por_modulo: { etiqueta: 'Mínimo por módulo',  obligatorio: false, validar: v => puntajeSaberPro(v, 'Mínimo por módulo') },
    norma:             { etiqueta: 'Norma',              obligatorio: false, validar: v => texto(v, { etiqueta: 'Norma', max: 200 }) },
    vigente_desde:     { etiqueta: 'Vigente desde',      obligatorio: false, validar: v => fechaISO(v, 'Vigente desde') },

    /* Las bases por competencia: el puntaje aprobatorio de cada una. Salen de
       la fórmula del reporte del ICFES y se pueden corregir a mano. */
    ...Object.fromEntries(MODULOS_SABERPRO.map(([clave, etiqueta]) => [
      'base_' + clave,
      { etiqueta: 'Base de ' + etiqueta, obligatorio: false, validar: v => puntajeSaberPro(v, 'Base de ' + etiqueta) },
    ])),
  },

  /* ─── Trámite de grado (vista Egresados) ─────────────────────── */

  /* Una norma del trámite. Solo el título es obligatorio: muchas se conocen
     por su nombre antes de que alguien consiga el número o el PDF. */
  normativas: {
    titulo:       { etiqueta: 'Título',      obligatorio: true,  validar: v => texto(v, { etiqueta: 'Título', min: 3, max: 200 }) },
    descripcion:  { etiqueta: 'Descripción', obligatorio: false, validar: v => texto(v, { etiqueta: 'Descripción', max: 1000 }) },
    tipo:         { etiqueta: 'Tipo',        obligatorio: false, validar: v => enumerado(v, TIPOS_NORMATIVA, 'Tipo') },
    numero:       { etiqueta: 'Número',      obligatorio: false, validar: v => texto(v, { etiqueta: 'Número', max: 40 }) },
    anio:         { etiqueta: 'Año',         obligatorio: false, validar: v => entero(v, { etiqueta: 'Año', min: ANIO_NORMATIVA_MIN, max: ANIO_NORMATIVA_MAX }) },
    expedida_por: { etiqueta: 'Expedida por', obligatorio: false, validar: v => texto(v, { etiqueta: 'Expedida por', max: 160 }) },
    url:          { etiqueta: 'Enlace',      obligatorio: false, validar: v => rutaOUrl(v, 'Enlace') },
    vigente:      { etiqueta: 'Vigente',     obligatorio: false, validar: v => booleano(v, 'Vigente') },
    orden:        { etiqueta: 'Orden',       obligatorio: false, validar: v => entero(v, { etiqueta: 'Orden', min: 0, max: 999 }) },
  },

  /* Una idea de trabajo de grado. El docente y la modalidad son opcionales:
     se puede publicar una idea antes de saber quién la dirigirá. */
  ideas: {
    titulo:       { etiqueta: 'Título',      obligatorio: true,  validar: v => texto(v, { etiqueta: 'Título', min: 3, max: 200 }) },
    descripcion:  { etiqueta: 'Descripción', obligatorio: false, validar: v => texto(v, { etiqueta: 'Descripción', max: 2000 }) },
    linea:        { etiqueta: 'Línea',       obligatorio: false, validar: v => texto(v, { etiqueta: 'Línea', max: 160 }) },
    docente_id:   { etiqueta: 'Docente',     obligatorio: false, validar: v => entero(v, { etiqueta: 'Docente', min: 1 }) },
    modalidad_id: { etiqueta: 'Modalidad',   obligatorio: false, validar: v => entero(v, { etiqueta: 'Modalidad', min: 1 }) },
    estado:       { etiqueta: 'Estado',      obligatorio: false, validar: v => enumerado(v, ESTADOS_IDEA, 'Estado') },
    dificultad:   { etiqueta: 'Dificultad',  obligatorio: false, validar: v => enumerado(v, DIFICULTADES_IDEA, 'Dificultad') },
    palabras:     { etiqueta: 'Palabras clave', obligatorio: false, validar: v => listaDeTextos(v, { etiqueta: 'Palabras clave', maximo: 12, largo: 60 }) },
    contacto:     { etiqueta: 'Contacto',    obligatorio: false, validar: v => texto(v, { etiqueta: 'Contacto', max: 160 }) },
    orden:        { etiqueta: 'Orden',       obligatorio: false, validar: v => entero(v, { etiqueta: 'Orden', min: 0, max: 999 }) },
  },

  grupos_investigacion: {
    nombre:          { etiqueta: 'Sigla',           obligatorio: true,  validar: v => texto(v, { etiqueta: 'Sigla', min: 2, max: 60 }) },
    nombre_completo: { etiqueta: 'Nombre completo', obligatorio: false, validar: v => texto(v, { etiqueta: 'Nombre completo', max: 200 }) },
    categoria:       { etiqueta: 'Categoría',       obligatorio: false, validar: v => enumerado(v, CATEGORIAS_GRUPO, 'Categoría') },
    lineas:          { etiqueta: 'Líneas',          obligatorio: false, validar: v => listaDeTextos(v, { etiqueta: 'Líneas', maximo: 10, largo: 80 }) },
    lider:           { etiqueta: 'Líder',           obligatorio: false, validar: v => texto(v, { etiqueta: 'Líder', max: 120 }) },
    sede:            { etiqueta: 'Sede',            obligatorio: false, validar: v => enumerado(v, SEDES_CON_AMBAS, 'Sede') },
    descripcion:     { etiqueta: 'Descripción',     obligatorio: false, validar: v => texto(v, { etiqueta: 'Descripción', max: 2000 }) },
    color:           { etiqueta: 'Color',           obligatorio: false, validar: v => enumerado(v, COLORES_TARJETA.map(c => c[0]), 'Color') },
    gruplac_url:     { etiqueta: 'GrupLAC',         obligatorio: false, validar: v => rutaOUrl(v, 'GrupLAC') },
    orden:           { etiqueta: 'Orden',           obligatorio: false, validar: v => entero(v, { etiqueta: 'Orden', min: 0, max: 999 }) },
  },

  lineas_investigacion: {
    nombre:   { etiqueta: 'Nombre',   obligatorio: true,  validar: v => texto(v, { etiqueta: 'Nombre', min: 3, max: 160 }) },
    objetivo: { etiqueta: 'Objetivo', obligatorio: false, validar: v => texto(v, { etiqueta: 'Objetivo', max: 2000 }) },
    ejes:     { etiqueta: 'Ejes temáticos', obligatorio: false, validar: v => listaDeTextos(v, { etiqueta: 'Ejes temáticos', maximo: 30, largo: 160 }) },
    orden:    { etiqueta: 'Orden',    obligatorio: false, validar: v => entero(v, { etiqueta: 'Orden', min: 0, max: 999 }) },
  },

  semilleros: {
    nombre:      { etiqueta: 'Nombre',      obligatorio: true,  validar: v => texto(v, { etiqueta: 'Nombre', min: 2, max: 120 }) },
    grupo_id:    { etiqueta: 'Grupo',       obligatorio: false, validar: v => entero(v, { etiqueta: 'Grupo', min: 1 }) },
    lider:       { etiqueta: 'Líder',       obligatorio: false, validar: v => texto(v, { etiqueta: 'Líder', max: 120 }) },
    sede:        { etiqueta: 'Sede',        obligatorio: false, validar: v => enumerado(v, SEDES_CON_AMBAS, 'Sede') },
    descripcion: { etiqueta: 'Descripción', obligatorio: false, validar: v => texto(v, { etiqueta: 'Descripción', max: 2000 }) },
    integrantes: { etiqueta: 'Integrantes', obligatorio: false, validar: v => entero(v, { etiqueta: 'Integrantes', min: 0, max: 500 }) },
    en_evaluacion: { etiqueta: 'En evaluación', obligatorio: false, validar: v => booleano(v, 'En evaluación') },
    orden:       { etiqueta: 'Orden',       obligatorio: false, validar: v => entero(v, { etiqueta: 'Orden', min: 0, max: 999 }) },
  },

  produccion: {
    titulo:   { etiqueta: 'Título',  obligatorio: true,  validar: v => texto(v, { etiqueta: 'Título', min: 3, max: 300 }) },
    tipo:     { etiqueta: 'Tipo',    obligatorio: false, validar: v => enumerado(v, TIPOS_PRODUCCION, 'Tipo') },
    anio:     { etiqueta: 'Año',     obligatorio: true,  validar: v => entero(v, { etiqueta: 'Año', min: 1976, max: 2100 }) },
    medio:    { etiqueta: 'Medio',   obligatorio: false, validar: v => texto(v, { etiqueta: 'Medio', max: 200 }) },
    autores:  { etiqueta: 'Autores', obligatorio: false, validar: v => texto(v, { etiqueta: 'Autores', max: 400 }) },
    resumen:  { etiqueta: 'Resumen', obligatorio: false, validar: v => texto(v, { etiqueta: 'Resumen', max: 6000 }) },
    grupo_id: { etiqueta: 'Grupo',   obligatorio: false, validar: v => entero(v, { etiqueta: 'Grupo', min: 1 }) },
    url:      { etiqueta: 'Enlace',  obligatorio: false, validar: v => rutaOUrl(v, 'Enlace') },
    orden:    { etiqueta: 'Orden',   obligatorio: false, validar: v => entero(v, { etiqueta: 'Orden', min: 0, max: 999 }) },
  },

  convenios: {
    organizacion: { etiqueta: 'Organización', obligatorio: true,  validar: v => texto(v, { etiqueta: 'Organización', min: 2, max: 160 }) },
    sector:       { etiqueta: 'Sector',       obligatorio: false, validar: v => enumerado(v, SECTORES_CONVENIO, 'Sector') },
    tipo:         { etiqueta: 'Tipo',         obligatorio: false, validar: v => texto(v, { etiqueta: 'Tipo', max: 120 }) },
    descripcion:  { etiqueta: 'Descripción',  obligatorio: false, validar: v => texto(v, { etiqueta: 'Descripción', max: 2000 }) },
    anio_inicio:  { etiqueta: 'Año',          obligatorio: false, validar: v => entero(v, { etiqueta: 'Año', min: 1976, max: 2100 }) },
    fecha_fin:    { etiqueta: 'Vigente hasta', obligatorio: false, validar: v => fechaISO(v, 'Vigente hasta') },
    url:          { etiqueta: 'Enlace',       obligatorio: false, validar: v => rutaOUrl(v, 'Enlace') },
    color:        { etiqueta: 'Color',        obligatorio: false, validar: v => enumerado(v, COLORES_TARJETA.map(c => c[0]), 'Color') },
    orden:        { etiqueta: 'Orden',        obligatorio: false, validar: v => entero(v, { etiqueta: 'Orden', min: 0, max: 999 }) },
  },

  proyectos_extension: {
    titulo:       { etiqueta: 'Título',       obligatorio: true,  validar: v => texto(v, { etiqueta: 'Título', min: 3, max: 200 }) },
    descripcion:  { etiqueta: 'Descripción',  obligatorio: false, validar: v => texto(v, { etiqueta: 'Descripción', max: 3000 }) },
    comunidad:    { etiqueta: 'Comunidad',    obligatorio: false, validar: v => texto(v, { etiqueta: 'Comunidad', max: 160 }) },
    municipio:    { etiqueta: 'Municipio',    obligatorio: false, validar: v => texto(v, { etiqueta: 'Municipio', max: 80 }) },
    sede:         { etiqueta: 'Sede',         obligatorio: false, validar: v => enumerado(v, SEDES_CON_AMBAS, 'Sede') },
    estado:       { etiqueta: 'Estado',       obligatorio: false, validar: v => enumerado(v, ESTADOS_PROYECTO_EXT, 'Estado') },
    fecha_inicio: { etiqueta: 'Inicio',       obligatorio: false, validar: v => fechaISO(v, 'Inicio') },
    fecha_fin:    { etiqueta: 'Fin',          obligatorio: false, validar: v => fechaISO(v, 'Fin') },
    integrantes:  { etiqueta: 'Integrantes',  obligatorio: false, validar: v => listaDeTextos(v, { etiqueta: 'Integrantes', maximo: 30, largo: 120 }) },
    fuente_url:   { etiqueta: 'Fuente',       obligatorio: false, validar: v => rutaOUrl(v, 'Fuente') },
    orden:        { etiqueta: 'Orden',        obligatorio: false, validar: v => entero(v, { etiqueta: 'Orden', min: 0, max: 999 }) },
  },

  cursos_extension: {
    titulo:          { etiqueta: 'Título',      obligatorio: true,  validar: v => texto(v, { etiqueta: 'Título', min: 3, max: 200 }) },
    tipo:            { etiqueta: 'Tipo',        obligatorio: false, validar: v => enumerado(v, TIPOS_CURSO, 'Tipo') },
    descripcion:     { etiqueta: 'Descripción', obligatorio: false, validar: v => texto(v, { etiqueta: 'Descripción', max: 2000 }) },
    horas:           { etiqueta: 'Horas',       obligatorio: false, validar: v => entero(v, { etiqueta: 'Horas', min: 1, max: 2000 }) },
    modalidad:       { etiqueta: 'Modalidad',   obligatorio: false, validar: v => enumerado(v, MODALIDADES_CURSO, 'Modalidad') },
    fecha_inicio:    { etiqueta: 'Inicio',      obligatorio: false, validar: v => fechaISO(v, 'Inicio') },
    fecha_fin:       { etiqueta: 'Fin',         obligatorio: false, validar: v => fechaISO(v, 'Fin') },
    url_inscripcion: { etiqueta: 'Enlace de inscripción', obligatorio: false, validar: v => rutaOUrl(v, 'Enlace de inscripción') },
    activo:          { etiqueta: 'Visible',     obligatorio: false, validar: v => booleano(v, 'Visible') },
    orden:           { etiqueta: 'Orden',       obligatorio: false, validar: v => entero(v, { etiqueta: 'Orden', min: 0, max: 999 }) },
  },

  contacto_sede: {
    nombre:    { etiqueta: 'Nombre',    obligatorio: false, validar: v => texto(v, { etiqueta: 'Nombre', max: 80 }) },
    ubicacion: { etiqueta: 'Ubicación', obligatorio: false, validar: v => texto(v, { etiqueta: 'Ubicación', max: 160 }) },
    direccion: { etiqueta: 'Dirección', obligatorio: false, validar: v => texto(v, { etiqueta: 'Dirección', max: 160 }) },
    ciudad:    { etiqueta: 'Ciudad',    obligatorio: false, validar: v => texto(v, { etiqueta: 'Ciudad', max: 80 }) },
    correo:    { etiqueta: 'Correo',    obligatorio: false, validar: v => correo(v, 'Correo') },
    telefono:  { etiqueta: 'Teléfono',  obligatorio: false, validar: v => texto(v, { etiqueta: 'Teléfono', max: 60 }) },
    extension: { etiqueta: 'Extensión', obligatorio: false, validar: v => texto(v, { etiqueta: 'Extensión', max: 40 }) },
    horario:   { etiqueta: 'Horario',   obligatorio: false, validar: v => texto(v, { etiqueta: 'Horario', max: 200 }) },
    url:       { etiqueta: 'Página',    obligatorio: false, validar: v => rutaOUrl(v, 'Página') },
  },

  cargos_programa: {
    nombre:      { etiqueta: 'Nombre',      obligatorio: true,  validar: v => texto(v, { etiqueta: 'Nombre', min: 3, max: 120 }) },
    cargo:       { etiqueta: 'Cargo',       obligatorio: true,  validar: v => texto(v, { etiqueta: 'Cargo', min: 3, max: 120 }) },
    nivel:       { etiqueta: 'Nivel',       obligatorio: false, validar: v => enumerado(v, NIVELES_CARGO.map(n => n[0]), 'Nivel') },
    sede:        { etiqueta: 'Sede',        obligatorio: false, validar: v => enumerado(v, SEDES_CON_AMBAS, 'Sede') },
    area:        { etiqueta: 'Área',        obligatorio: false, validar: v => texto(v, { etiqueta: 'Área', max: 80 }) },
    descripcion: { etiqueta: 'Descripción', obligatorio: false, validar: v => texto(v, { etiqueta: 'Descripción', max: 600 }) },
    correo:      { etiqueta: 'Correo',      obligatorio: false, validar: v => correo(v, 'Correo') },
    extension:   { etiqueta: 'Extensión',   obligatorio: false, validar: v => texto(v, { etiqueta: 'Extensión', max: 20 }) },
    ubicacion:   { etiqueta: 'Ubicación',   obligatorio: false, validar: v => texto(v, { etiqueta: 'Ubicación', max: 120 }) },
    docente_id:  { etiqueta: 'Docente',     obligatorio: false, validar: v => entero(v, { etiqueta: 'Docente', min: 1 }) },
    orden:       { etiqueta: 'Orden',       obligatorio: false, validar: v => entero(v, { etiqueta: 'Orden', min: 0, max: 999 }) },
  },

  contacto_programa: {
    presentacion: { etiqueta: 'Presentación', obligatorio: false, validar: v => texto(v, { etiqueta: 'Presentación', max: 3000 }) },
    ejes:         { etiqueta: 'Ejes',         obligatorio: false, validar: v => listaDeTextos(v, { etiqueta: 'Ejes', maximo: 8, largo: 60 }) },
    horario:      { etiqueta: 'Horario',      obligatorio: false, validar: v => texto(v, { etiqueta: 'Horario', max: 200 }) },
    nota_cita:    { etiqueta: 'Nota de cita', obligatorio: false, validar: v => texto(v, { etiqueta: 'Nota de cita', max: 200 }) },
  },

  actos_programa: {
    categoria:    { etiqueta: 'Categoría',   obligatorio: false, validar: v => enumerado(v, CATEGORIAS_ACTO.map(c => c[0]), 'Categoría') },
    tipo:         { etiqueta: 'Tipo',        obligatorio: false, validar: v => enumerado(v, TIPOS_ACTO, 'Tipo') },
    numero:       { etiqueta: 'Número',      obligatorio: false, validar: v => texto(v, { etiqueta: 'Número', max: 40 }) },
    fecha:        { etiqueta: 'Fecha',       obligatorio: false, validar: v => fechaISO(v, 'Fecha') },
    expedido_por: { etiqueta: 'Expedido por', obligatorio: false, validar: v => texto(v, { etiqueta: 'Expedido por', max: 160 }) },
    asunto:       { etiqueta: 'Asunto',      obligatorio: true,  validar: v => texto(v, { etiqueta: 'Asunto', min: 3, max: 200 }) },
    descripcion:  { etiqueta: 'Descripción', obligatorio: false, validar: v => texto(v, { etiqueta: 'Descripción', max: 2000 }) },
    vigencia:     { etiqueta: 'Vigencia',    obligatorio: false, validar: v => texto(v, { etiqueta: 'Vigencia', max: 60 }) },
    fecha_fin:    { etiqueta: 'Vence',       obligatorio: false, validar: v => fechaISO(v, 'Vence') },
    archivo_id:   { etiqueta: 'Documento',   obligatorio: false, validar: v => entero(v, { etiqueta: 'Documento', min: 1 }) },
    url:          { etiqueta: 'Enlace',      obligatorio: false, validar: v => rutaOUrl(v, 'Enlace') },
    orden:        { etiqueta: 'Orden',       obligatorio: false, validar: v => entero(v, { etiqueta: 'Orden', min: 0, max: 999 }) },
  },

  convenios_internacionales: {
    institucion: { etiqueta: 'Institución', obligatorio: true,  validar: v => texto(v, { etiqueta: 'Institución', min: 2, max: 200 }) },
    pais:        { etiqueta: 'País',        obligatorio: true,  validar: v => texto(v, { etiqueta: 'País', min: 2, max: 80 }) },
    tipo:        { etiqueta: 'Tipo',        obligatorio: false, validar: v => enumerado(v, TIPOS_CONVENIO_INT, 'Tipo') },
    tema:        { etiqueta: 'Tema',        obligatorio: false, validar: v => texto(v, { etiqueta: 'Tema', max: 200 }) },
    objeto:      { etiqueta: 'Objeto',      obligatorio: false, validar: v => texto(v, { etiqueta: 'Objeto', max: 3000 }) },
    intercambio: { etiqueta: 'Intercambio', obligatorio: false, validar: v => booleano(v, 'Intercambio') },
    fecha_fin:   { etiqueta: 'Vigente hasta', obligatorio: false, validar: v => fechaISO(v, 'Vigente hasta') },
    url:         { etiqueta: 'Enlace',      obligatorio: false, validar: v => rutaOUrl(v, 'Enlace') },
    orden:       { etiqueta: 'Orden',       obligatorio: false, validar: v => entero(v, { etiqueta: 'Orden', min: 0, max: 999 }) },
  },

  convocatorias_movilidad: {
    titulo:         { etiqueta: 'Título',      obligatorio: true,  validar: v => texto(v, { etiqueta: 'Título', min: 3, max: 200 }) },
    dirigido:       { etiqueta: 'Dirigida a',  obligatorio: false, validar: v => enumerado(v, DIRIGIDO_CONVOCATORIA, 'Dirigida a') },
    destino:        { etiqueta: 'Destino',     obligatorio: false, validar: v => texto(v, { etiqueta: 'Destino', max: 160 }) },
    descripcion:    { etiqueta: 'Descripción', obligatorio: false, validar: v => texto(v, { etiqueta: 'Descripción', max: 3000 }) },
    beneficios:     { etiqueta: 'Beneficios',  obligatorio: false, validar: v => texto(v, { etiqueta: 'Beneficios', max: 1500 }) },
    fecha_apertura: { etiqueta: 'Apertura',    obligatorio: false, validar: v => fechaISO(v, 'Apertura') },
    fecha_cierre:   { etiqueta: 'Cierre',      obligatorio: false, validar: v => fechaISO(v, 'Cierre') },
    url:            { etiqueta: 'Enlace',      obligatorio: false, validar: v => rutaOUrl(v, 'Enlace') },
    orden:          { etiqueta: 'Orden',       obligatorio: false, validar: v => entero(v, { etiqueta: 'Orden', min: 0, max: 999 }) },
  },

  redes_academicas: {
    sigla:       { etiqueta: 'Sigla',       obligatorio: true,  validar: v => texto(v, { etiqueta: 'Sigla', min: 2, max: 40 }) },
    nombre:      { etiqueta: 'Nombre',      obligatorio: false, validar: v => texto(v, { etiqueta: 'Nombre', max: 200 }) },
    alcance:     { etiqueta: 'Alcance',     obligatorio: false, validar: v => enumerado(v, ALCANCES_RED, 'Alcance') },
    descripcion: { etiqueta: 'Descripción', obligatorio: false, validar: v => texto(v, { etiqueta: 'Descripción', max: 1000 }) },
    url:         { etiqueta: 'Enlace',      obligatorio: false, validar: v => rutaOUrl(v, 'Enlace') },
    orden:       { etiqueta: 'Orden',       obligatorio: false, validar: v => entero(v, { etiqueta: 'Orden', min: 0, max: 999 }) },
  },

  ori_contacto: {
    ubicacion:  { etiqueta: 'Ubicación',  obligatorio: false, validar: v => texto(v, { etiqueta: 'Ubicación', max: 300 }) },
    correos:    { etiqueta: 'Correos',    obligatorio: false, validar: v => listaDeTextos(v, { etiqueta: 'Correos', maximo: 6, largo: 120 }) },
    telefono:   { etiqueta: 'Teléfono',   obligatorio: false, validar: v => texto(v, { etiqueta: 'Teléfono', max: 120 }) },
    url:        { etiqueta: 'Página',     obligatorio: false, validar: v => rutaOUrl(v, 'Página') },
    requisitos: { etiqueta: 'Requisitos', obligatorio: false, validar: v => listaDeTextos(v, { etiqueta: 'Requisitos', maximo: 15, largo: 400 }) },
    pasos:      { etiqueta: 'Pasos',      obligatorio: false, validar: v => listaDeTextos(v, { etiqueta: 'Pasos', maximo: 15, largo: 400 }) },
  },
}

/* Fin no anterior al inicio, para los recursos con fecha_inicio/fecha_fin. */
function fechasOrdenadas({ fecha_inicio, fecha_fin }) {
  if (!fecha_inicio || !fecha_fin || fecha_fin >= fecha_inicio) return null
  return { campo: 'fecha_fin', mensaje: 'La fecha final no puede ser anterior a la inicial' }
}

/* Comprobaciones que necesitan mirar más de un campo a la vez. */
export const REGLAS_CRUZADAS = {

  proyectos_extension: datos => fechasOrdenadas(datos),
  convocatorias_movilidad({ fecha_apertura, fecha_cierre }) {
    if (!fecha_apertura || !fecha_cierre || fecha_cierre >= fecha_apertura) return null
    return { campo: 'fecha_cierre', mensaje: 'El cierre no puede ser anterior a la apertura' }
  },
  cursos_extension: datos => fechasOrdenadas(datos),

  calendario(datos) {
    const { fecha_inicio, fecha_fin } = datos
    if (!fecha_inicio || !fecha_fin) return null
    if (fecha_fin < fecha_inicio) {
      return { campo: 'fecha_fin', mensaje: 'La fecha final no puede ser anterior a la inicial' }
    }
    return null
  },
  eventos(datos) {
    const { fecha, fecha_fin } = datos
    if (!fecha || !fecha_fin) return null
    if (fecha_fin < fecha) {
      return { campo: 'fecha_fin', mensaje: 'El evento no puede terminar antes de empezar' }
    }
    return null
  },
  ofertas(datos) {
    const { fecha_publicacion, fecha_cierre } = datos
    if (!fecha_publicacion || !fecha_cierre) return null
    if (fecha_cierre < fecha_publicacion) {
      return { campo: 'fecha_cierre', mensaje: 'El cierre no puede ser anterior a la publicación' }
    }
    return null
  },
  convocatorias(datos) {
    const { fecha_apertura, fecha_cierre } = datos
    if (!fecha_apertura || !fecha_cierre) return null
    if (fecha_cierre < fecha_apertura) {
      return { campo: 'fecha_cierre', mensaje: 'El cierre no puede ser anterior a la apertura' }
    }
    return null
  },
}

/* ─── Motor ────────────────────────────────────────────────────── */

/* Devuelve { campo: mensaje } con lo que esté mal. Vacío = todo correcto.
   `parcial` es para PATCH: solo se exige lo que venga en el cuerpo. */
export function validar(recurso, datos, { parcial = false } = {}) {
  const esquema = ESQUEMAS[recurso]
  if (!esquema) throw new Error('Recurso sin esquema de validación: ' + recurso)

  const errores = {}

  for (const [campo, regla] of Object.entries(esquema)) {
    const presente = Object.prototype.hasOwnProperty.call(datos, campo)
    if (parcial && !presente) continue

    if (regla.obligatorio && (!presente || vacio(datos[campo]))) {
      errores[campo] = `${regla.etiqueta} es obligatorio`
      continue
    }
    if (!presente) continue

    const fallo = regla.validar(datos[campo])
    if (fallo) errores[campo] = fallo
  }

  const cruzada = REGLAS_CRUZADAS[recurso]?.(datos)
  if (cruzada && !errores[cruzada.campo]) errores[cruzada.campo] = cruzada.mensaje

  return errores
}

export const hayErrores = errores => Object.keys(errores).length > 0

/* '8' -> '8º'. El número vive en la base; el ordinal es cosa de la vista. */
export function ordinalSemestre(n) {
  if (n === null || n === undefined || n === '') return ''
  return String(n) + 'º'
}
