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
    requisitos:    {
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
}

/* Comprobaciones que necesitan mirar más de un campo a la vez. */
export const REGLAS_CRUZADAS = {
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
