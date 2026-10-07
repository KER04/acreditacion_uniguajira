import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { FACTORES, EQUIPO_GENERAL, EVIDENCIAS_GENERALES } from '../data/acreditacion'
import { fetchApi } from './sesion'

/* ─── API helpers ──────────────────────────────────────────────── */
/* Ruta relativa: Vite hace de proxy hacia :3001 (ver vite.config.js), así que
   front y API comparten origen y la cookie de sesión viaja sola. */
const API = '/api'

/* Claves cuyo contenido ya vive en PostgreSQL. Para éstas, el estado local es
   un espejo del servidor: cada cambio va por REST al elemento concreto y luego
   se recarga la colección, de modo que ids y orden salen siempre de la base.
   El resto de claves sigue con el flujo viejo de "PUT del arreglo completo"
   contra los archivos JSON, hasta que les toque su turno de migración. */
const EN_BASE = {
  docentes:               'docentes',
  destacados:             'egresados/destacados',
  ofertas:                'egresados/ofertas',
  honor:                  'estudiantes/honor',
  calendario:             'estudiantes/calendario',
  modalidades_grado:      'grado/modalidades',
  documentos_estudiantes: 'estudiantes/documentos',
  noticias:               'noticias',
  eventos:                'eventos',
  convocatorias:          'convocatorias',
  normativas:             'grado/normativas',
  ideas_investigacion:    'grado/ideas',
  grupos:                 'investigacion/grupos',
  semilleros:             'investigacion/semilleros',
  produccion:             'investigacion/produccion',
  convenios:              'extension/convenios',
  proyectos_extension:    'extension/proyectos',
  cursos_extension:       'extension/cursos',
  convenios_int:          'internacionalizacion/convenios',
  convocatorias_mov:      'internacionalizacion/convocatorias',
  redes:                  'internacionalizacion/redes',
  actos:                  'resoluciones',
  reglamento:             'reglamento',
  cargos:                 'contacto/cargos',
}

async function apiJSON(endpoint, { method = 'GET', body } = {}) {
  const res = await fetchApi(`${API}/${endpoint}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) {
    const cuerpo = await res.json().catch(() => ({}))
    throw new Error(cuerpo.error ?? `Error ${res.status}`)
  }
  return res.json()
}

/* Camino antiguo: claves que todavía se guardan como un PUT del arreglo
   completo contra un archivo JSON. Las claves de EN_BASE NO van aquí: esas
   viajan por REST elemento a elemento y listarlas otra vez solo confundiría. */
const KEY_ENDPOINT = {
  factores:              'acreditacion/factores',
  cronograma_cna:        'acreditacion/cronograma',
  equipo_cna:            'acreditacion/equipo',
  evidencias_cna:        'acreditacion/evidencias',
  inicio:                'programa/inicio',
  programa:              'programa/info',
}

/* Devuelve el mensaje de error si el guardado falló, o null si todo fue bien.

   Una clave sin endpoint es un ERROR, no un caso normal: significa que la
   pestaña cree estar guardando contra el servidor y en realidad su cambio solo
   existe en este navegador. Antes esto devolvía null —la señal de éxito— y así
   se perdieron en silencio los eventos y la ficha del programa. */
async function syncToAPI(key, value) {
  const endpoint = KEY_ENDPOINT[key]
  if (!endpoint) {
    return `"${key}" no está conectado con el servidor: el cambio solo quedó en este navegador y se perderá al recargar`
  }
  try {
    const res = await fetchApi(`${API}/${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(value),
    })
    if (res.ok) return null
    const cuerpo = await res.json().catch(() => ({}))
    return cuerpo.error ?? `El servidor rechazó el guardado (${res.status})`
  } catch {
    return 'Sin conexión con el servidor: el cambio solo quedó en este navegador'
  }
}

/* Envía un formulario multipart y devuelve el JSON de respuesta. */
async function enviarArchivo(ruta, formData, metodo = 'POST') {
  const res = await fetchApi(`${API}/${ruta}`, {
    method: metodo,
    credentials: 'include',
    body: formData,
  })
  const cuerpo = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(cuerpo.error ?? 'No se pudo subir el archivo')
  return cuerpo
}

/* Sube un documento y devuelve lo que el servidor deduce del archivo:
   { archivo_id, url, descarga, nombre, tipo, peso, bytes }. */
export function apiSubirDocumento(file) {
  const fd = new FormData()
  fd.append('archivo', file)
  return enviarArchivo('estudiantes/upload-doc', fd)
}

/* ─── Foto y documentos de un estudiante destacado ─────────────── */

export function apiSubirFotoHonor(honorId, file) {
  const fd = new FormData()
  fd.append('foto', file)
  return enviarArchivo(`estudiantes/honor/${honorId}/foto`, fd)
}

export async function apiBorrarFotoHonor(honorId) {
  const res = await fetchApi(`${API}/estudiantes/honor/${honorId}/foto`, {
    method: 'DELETE',
    credentials: 'include',
  })
  const cuerpo = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(cuerpo.error ?? 'No se pudo quitar la foto')
  return cuerpo
}

export function apiDocumentosHonor(honorId) {
  return apiJSON(`estudiantes/honor/${honorId}/documentos`)
}

export function apiSubirDocumentoHonor(honorId, file, { nombre = '', descripcion = '' } = {}) {
  const fd = new FormData()
  fd.append('archivo', file)
  if (nombre) fd.append('nombre', nombre)
  if (descripcion) fd.append('descripcion', descripcion)
  return enviarArchivo(`estudiantes/honor/${honorId}/documentos`, fd)
}

export async function apiBorrarDocumentoHonor(docId) {
  const res = await fetchApi(`${API}/estudiantes/honor/documentos/${docId}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  const cuerpo = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(cuerpo.error ?? 'No se pudo borrar el documento')
  return cuerpo
}

/* ─── Foto y formación de un docente ───────────────────────────── */

export function apiSubirFotoDocente(docenteId, file) {
  const fd = new FormData()
  fd.append('foto', file)
  return enviarArchivo(`docentes/${docenteId}/foto`, fd)
}

export async function apiBorrarFotoDocente(docenteId) {
  const res = await fetchApi(`${API}/docentes/${docenteId}/foto`, {
    method: 'DELETE',
    credentials: 'include',
  })
  const cuerpo = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(cuerpo.error ?? 'No se pudo quitar la foto')
  return cuerpo
}

/* Reemplaza de una vez toda la formación del docente: el formulario la edita
   como lista, así que mandar la lista entera evita contar altas y bajas. */
export function apiGuardarFormacion(docenteId, formacion) {
  return apiJSON(`docentes/${docenteId}/formacion`, { method: 'PUT', body: { formacion } })
}

/* ─── Plan de estudios ─────────────────────────────────────────── */

/* El pensum no encaja en addItem/updateItem: son dos recursos distintos —el
   catálogo de materias y la malla que las coloca en semestres— y la respuesta
   es un objeto con los semestres armados, no un arreglo de elementos. Por eso
   lleva sus propias funciones y su propia recarga. */

export const apiMaterias = ({ libres } = {}) =>
  apiJSON('pensum/materias' + (libres ? `?libres=${libres}` : ''))

export const apiCrearMateria = datos =>
  apiJSON('pensum/materias', { method: 'POST', body: datos })

export const apiEditarMateria = (id, datos) =>
  apiJSON(`pensum/materias/${id}`, { method: 'PATCH', body: datos })

export const apiBorrarMateria = id =>
  apiJSON(`pensum/materias/${id}`, { method: 'DELETE' })

/* Las tres siguientes devuelven la malla completa ya recalculada, para que la
   vista no tenga que sumar créditos por su cuenta ni volver a pedirla. */
export const apiAgregarAMalla = (planId, datos) =>
  apiJSON(`pensum/plan/${planId}/materias`, { method: 'POST', body: datos })

export const apiEditarEnMalla = (planMateriaId, datos) =>
  apiJSON(`pensum/plan-materia/${planMateriaId}`, { method: 'PATCH', body: datos })

export const apiQuitarDeMalla = planMateriaId =>
  apiJSON(`pensum/plan-materia/${planMateriaId}`, { method: 'DELETE' })

/* Planes: la malla vigente y la propuesta de actualización. El panel edita
   cualquiera de las dos con la misma interfaz. */
export const apiPlanes = () => apiJSON('pensum/planes')

export const apiPensum = planId =>
  apiJSON('pensum' + (planId ? `?plan=${planId}` : ''))

export const apiEditarPlan = (planId, datos) =>
  apiJSON(`pensum/plan/${planId}`, { method: 'PATCH', body: datos })

/* Prerrequisitos. Devuelven la malla recalculada, como el resto de
   operaciones del pensum. */
export const apiAgregarPrerrequisito = (planId, datos) =>
  apiJSON(`pensum/plan/${planId}/prerrequisitos`, { method: 'POST', body: datos })

export const apiQuitarPrerrequisito = (planId, datos) =>
  apiJSON(`pensum/plan/${planId}/prerrequisitos`, { method: 'DELETE', body: datos })

/* Etapas del trámite. Como los prerrequisitos, devuelven la malla entera:
   mover una etapa cambia también cuál es la actual, y con una sola respuesta
   el panel no tiene que adivinar el estado resultante. */
export const apiCrearEtapa = (planId, datos) =>
  apiJSON(`pensum/plan/${planId}/tramite`, { method: 'POST', body: datos })

export const apiEditarEtapa = (id, datos) =>
  apiJSON(`pensum/tramite/${id}`, { method: 'PATCH', body: datos })

export const apiBorrarEtapa = id =>
  apiJSON(`pensum/tramite/${id}`, { method: 'DELETE' })

export const apiOrdenarEtapas = (planId, ids) =>
  apiJSON(`pensum/plan/${planId}/tramite/orden`, { method: 'PUT', body: { ids } })

/* Tarjetas del carrusel informativo. Cuelgan de la SECCIÓN que las muestra
   —'pensum-propuesto', 'saber-pro'—, no del contenido de esa página: son
   material editorial que acompaña al encabezado.

   `todas` incluye las ocultas, que es lo que necesita el panel para poder
   devolverlas al carrusel; la vista pública recibe solo las visibles. */
export const apiTarjetas = (seccion, { todas = false } = {}) =>
  apiJSON(`tarjetas/${seccion}` + (todas ? '?todas=1' : ''))

export const apiCrearTarjeta = (seccion, datos) =>
  apiJSON(`tarjetas/${seccion}`, { method: 'POST', body: datos })

export const apiEditarTarjeta = (id, datos) =>
  apiJSON(`tarjetas/tarjeta/${id}`, { method: 'PATCH', body: datos })

export const apiBorrarTarjeta = id =>
  apiJSON(`tarjetas/tarjeta/${id}`, { method: 'DELETE' })

export const apiOrdenarTarjetas = (seccion, ids) =>
  apiJSON(`tarjetas/${seccion}/orden`, { method: 'PUT', body: { ids } })

export function apiSubirImagenTarjeta(id, file) {
  const fd = new FormData()
  fd.append('imagen', file)
  return enviarArchivo(`tarjetas/tarjeta/${id}/imagen`, fd)
}

export const apiBorrarImagenTarjeta = id =>
  apiJSON(`tarjetas/tarjeta/${id}/imagen`, { method: 'DELETE' })

/* ─── Egresados ────────────────────────────────────────────────── */

/* Foto redonda del egresado y fotograma del vídeo. Son la misma operación
   contra columnas distintas, así que comparten el envío. */
export function apiSubirFotoEgresado(egresadoId, file, campo = 'foto') {
  const fd = new FormData()
  fd.append('foto', file)
  return enviarArchivo(`egresados/destacados/${egresadoId}/${campo}`, fd)
}

export async function apiBorrarFotoEgresado(egresadoId, campo = 'foto') {
  const res = await fetchApi(`${API}/egresados/destacados/${egresadoId}/${campo}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  const cuerpo = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(cuerpo.error ?? 'No se pudo quitar la imagen')
  return cuerpo
}

/* Ficha de una vacante. La pide la página propia de la oferta, que se abre en
   su pestaña y no puede depender del estado cargado en la otra. */
export const apiOferta = id => apiJSON(`egresados/ofertas/${id}`)

/* Postularse. Va como multipart porque puede traer la hoja de vida adjunta.
   No exige sesión: quien aplica es alguien de fuera. */
export function apiPostular(ofertaId, datos, hojaVida) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(datos)) if (v !== undefined && v !== null) fd.append(k, v)
  if (hojaVida) fd.append('hoja_vida', hojaVida)
  return enviarArchivo(`egresados/ofertas/${ofertaId}/postulaciones`, fd)
}

export const apiActualizarDatos = datos =>
  apiJSON('egresados/actualizaciones', { method: 'POST', body: datos })

/* Las dos bandejas del panel: datos personales, solo para administradores. */
export const apiPostulaciones = ofertaId =>
  apiJSON('egresados/postulaciones' + (ofertaId ? `?oferta=${ofertaId}` : ''))

export const apiEstadoPostulacion = (id, cambios) =>
  apiJSON(`egresados/postulaciones/${id}`, { method: 'PATCH', body: cambios })

export const apiBorrarPostulacion = id =>
  apiJSON(`egresados/postulaciones/${id}`, { method: 'DELETE' })

export const apiActualizaciones = () => apiJSON('egresados/actualizaciones')

export const apiMarcarActualizacion = (id, atendida) =>
  apiJSON(`egresados/actualizaciones/${id}`, { method: 'PATCH', body: { atendida } })

export const apiBorrarActualizacion = id =>
  apiJSON(`egresados/actualizaciones/${id}`, { method: 'DELETE' })

/* ─── Infraestructura tecnológica ──────────────────────────────── */

/* Contenido institucional publico; el listado del panel incluye los ocultos. */
export const apiInfraestructura = () => apiJSON('infraestructura')
export const apiInfraRecursos = () => apiJSON('infraestructura/recursos')
export const apiInfraCrear = datos => apiJSON('infraestructura/recursos', { method: 'POST', body: datos })
export const apiInfraEditar = (id, datos) => apiJSON(`infraestructura/recursos/${id}`, { method: 'PATCH', body: datos })
export const apiInfraBorrar = id => apiJSON(`infraestructura/recursos/${id}`, { method: 'DELETE' })

/* ─── Investigación ────────────────────────────────────────────── */

/* Ficha de una publicación. La pide su página propia, que puede abrirse
   directamente desde un enlace sin pasar antes por /investigacion. */
export const apiProduccion = id => apiJSON(`investigacion/produccion/${id}`)

export function apiSubirPortadaProduccion(id, file) {
  const fd = new FormData()
  fd.append('portada', file)
  return enviarArchivo(`investigacion/produccion/${id}/portada`, fd)
}

export const apiBorrarPortadaProduccion = id =>
  apiJSON(`investigacion/produccion/${id}/portada`, { method: 'DELETE' })

/* ─── Internacionalización ────────────────────────────────────── */

/* La ficha de la ORI es una fila única: se guarda entera y vuelve normalizada. */
export const apiGuardarOri = datos =>
  apiJSON('internacionalizacion/ori', { method: 'PATCH', body: datos })

/* ─── Contacto ─────────────────────────────────────────────────── */

export const apiContacto = () => apiJSON('contacto')
export const apiGuardarSede = (sede, datos) =>
  apiJSON(`contacto/sedes/${sede}`, { method: 'PATCH', body: datos })
export const apiGuardarContactoPrograma = datos =>
  apiJSON('contacto/programa', { method: 'PATCH', body: datos })

/* Foto propia de una persona del organigrama. */
export function apiSubirFotoCargo(id, file) {
  const fd = new FormData()
  fd.append('foto', file)
  return enviarArchivo(`contacto/cargos/${id}/foto`, fd)
}
export const apiBorrarFotoCargo = id =>
  apiJSON(`contacto/cargos/${id}/foto`, { method: 'DELETE' })

/* ─── Saber Pro ────────────────────────────────────────────────── */

/* La página pide sus propios datos: el módulo no entra en /api/all para no
   engordar la carga inicial de todo el sitio con agregados que solo usa él. */
export const apiSaberPro = anio => apiJSON('saberpro' + (anio ? `?anio=${anio}` : ''))

/* Listado fila a fila, con documento y registro del ICFES: solo panel. */
export const apiSaberProResultados = () => apiJSON('saberpro/resultados')
export const apiSaberProCrear = datos => apiJSON('saberpro/resultados', { method: 'POST', body: datos })
export const apiSaberProEditar = (id, datos) => apiJSON(`saberpro/resultados/${id}`, { method: 'PATCH', body: datos })
export const apiSaberProBorrar = id => apiJSON(`saberpro/resultados/${id}`, { method: 'DELETE' })

export const apiSaberProParametros = () => apiJSON('saberpro/parametros')

/* Sube el reporte .xlsx de la facultad. `simular` lee y cuenta sin escribir:
   sirve para ver qué traería el archivo antes de sustituir lo publicado. */
export function apiSaberProImportar(file, { simular = false, reemplazar = false, aplicarBases = true } = {}) {
  const fd = new FormData()
  fd.append('archivo', file)
  fd.append('simular', String(simular))
  fd.append('reemplazar', String(reemplazar))
  fd.append('aplicar_bases', String(aplicarBases))
  return enviarArchivo('saberpro/importar', fd)
}
export const apiSaberProGuardarParametros = datos =>
  apiJSON('saberpro/parametros', { method: 'PATCH', body: datos })

export async function apiUpload(tipo, file, extra = {}) {
  const fd = new FormData()
  fd.append('archivo', file)
  const qs = new URLSearchParams(extra).toString()
  const res = await fetchApi(`${API}/upload/${tipo}${qs ? '?' + qs : ''}`, {
    method: 'POST',
    credentials: 'include',
    body: fd,
  })
  if (!res.ok) throw new Error('No se pudo subir el archivo')
  return res.json()
}

/* ─── Estado inicial ───────────────────────────────────────────── */
const INITIAL = {
  /* Vacíos a propósito: noticias, eventos y convocatorias viven en
     PostgreSQL. Sembrar aquí ejemplos inventados hacía que un visitante con
     el caché vacío y el backend caído los viera como contenido real. */
  noticias: [],
  eventos: [],
  convocatorias: [],
  /* Vive en PostgreSQL: se llena al hidratar desde /api/all. */
  honor: [],
  /* Vive en PostgreSQL: se llena al hidratar desde /api/all. Antes había aquí
     una lista de ejemplo con la forma vieja (n, r, a, e...), que reventaba la
     vista pública en el primer render, antes de que respondiera la API. */
  docentes: [],
  /* Viven en PostgreSQL (migración 009): se llenan al hidratar desde /api/all.
     Antes había aquí cinco egresados y tres vacantes de ejemplo, y un visitante
     con el caché vacío y el backend caído los veía como contenido real. */
  ofertas: [],
  destacados: [],
  /* Viven en PostgreSQL (migración 019): se llenan al hidratar desde /api/all.
     Antes había aquí los mismos grupos y semilleros de ejemplo del JSON, y un
     visitante con el caché vacío y el backend caído los veía como reales. */
  grupos: [],
  semilleros: [],
  produccion: [],
  /* Viven en PostgreSQL (migración 022). */
  convenios: [],
  proyectos_extension: [],
  cursos_extension: [],
  /* Viven en PostgreSQL (migración 024). `ori` es la ficha única de la oficina. */
  convenios_int: [],
  convocatorias_mov: [],
  redes: [],
  ori: null,
  /* Marco legal del programa (migración 025). */
  actos: [],
  reglamento: [],
  /* Contacto (migración 026): sedes, organigrama y presentación. `cargos`
     se edita por REST; `contacto` trae los tres bloques para la página. */
  cargos: [],
  contacto: null,
  factores: FACTORES.map(f => ({
    ...f,
    caracteristicas: f.caracteristicas.map(c => ({ ...c })),
    equipo: f.equipo.map(e => ({ ...e, sede: e.sede ?? 'riohacha', foto: e.foto ?? '' })),
    evidencias: f.evidencias.map(ev => ({ ...ev, url: ev.url ?? '' })),
    anexos: f.anexos.map(a => ({ ...a, items: [...a.items] })),
    presentacionUrl: f.presentacionUrl ?? '',
    metodologiaFactor: f.metodologiaFactor ?? '',
    documentos: f.documentos ?? [],
  })),
  equipo_cna: EQUIPO_GENERAL.map(e => ({ ...e })),
  evidencias_cna: EVIDENCIAS_GENERALES.map(e => ({ ...e, url: '' })),
  cronograma_cna: [
    { d: '2022', t: 'Acuerdo 017 — Estructura del proceso de autoevaluación', s: 'done' },
    { d: '2022', t: 'Resolución 007 — Definición de ponderaciones', s: 'done' },
    { d: '2022', t: 'Modelo de autoevaluación y autorregulación UniGuajira', s: 'done' },
    { d: '2024', t: 'Conformación del comité de autoevaluación del programa', s: 'done' },
    { d: '2025', t: 'Recolección de información — población y muestra', s: 'done' },
    { d: '2025', t: 'Informe de Autoevaluación — resultados finales', s: 'done' },
    { d: '28 jul 2025', t: 'Radicación del Informe ante el CNA', s: 'done' },
    { d: '2025–2026', t: 'Ejecución del Plan de Mejoramiento', s: 'current' },
    { d: 'Pendiente', t: 'Visita de pares académicos', s: 'next' },
    { d: 'Pendiente', t: 'Resolución de acreditación de alta calidad', s: 'next' },
  ],
  inicio: {
    slogan: 'Formamos ingenieros que transforman La Guajira y el Caribe.',
    cifras: [
      { label: 'Estudiantes activos', value: '1 240' },
      { label: 'Docentes de planta', value: '32' },
      { label: 'Egresados', value: '2 800+' },
      { label: 'Años acreditados', value: '4' },
    ],
    proyectoDestacado: {
      titulo: 'ArenaNet: IoT para comunidades Wayuu',
      resumen: 'Sistema de monitoreo de jagüeyes usando sensores de bajo costo y visualización en tiempo real.',
      grupo: 'Semillero IoT Wayuu · GITUG',
    },
  },
  programa: {
    mision: 'Formar ingenieros de sistemas con sólido fundamento científico-tecnológico, sentido ético, pertinencia cultural y compromiso con el desarrollo sostenible de La Guajira y el Caribe.',
    vision: 'Para 2030, ser un programa de ingeniería de sistemas con acreditación de alta calidad, reconocido por su investigación aplicada, pertinencia social y vinculación con el ecosistema digital del Caribe colombiano.',
    objetivos: [
      'Formar profesionales con dominio de las ciencias de la computación y sus aplicaciones.',
      'Desarrollar competencias investigativas orientadas a la solución de problemas regionales.',
      'Articular la docencia con la extensión y la proyección social.',
      'Fortalecer la movilidad académica nacional e internacional.',
    ],
    perfilEgresado: 'El egresado de Ingeniería de Sistemas de la Universidad de La Guajira es un profesional capaz de diseñar, desarrollar, implantar y gestionar sistemas de información y soluciones tecnológicas, con capacidad de liderazgo, pensamiento crítico y compromiso social con su región.',
    ficha: {
      codigo: '4400-11-02-00', creditos: '169', duracion: '10 semestres', jornada: 'Diurna y Nocturna',
      modalidad: 'Presencial', titulo: 'Ingeniero(a) de Sistemas', registro: '02872 (21 feb 2018)',
      acreditacion: '014528 (28 jul 2022 – 28 jul 2026)', snies: '17579',
    },
  },
  /* Vive en PostgreSQL (migracion 008). Se llena al hidratar desde /api/all. */
  pensum: [],
  pensum_info: null,
  /* Vive en PostgreSQL: se llena al hidratar desde /api/all. */
  calendario: [],
  /* Vive en PostgreSQL: se llena al hidratar desde /api/all. */
  modalidades_grado: [],
  /* Vive en PostgreSQL: se llena al hidratar desde /api/all. */
  documentos_estudiantes: [],
  /* Trámite de grado (vista Egresados). `practicas` es de solo lectura: son
     las convocatorias de categoría "Prácticas", que se editan en su módulo. */
  normativas: [],
  ideas_investigacion: [],
  practicas: [],
  /* Vive en PostgreSQL (migración 026) y llega armado desde /api/all. Antes
     había aquí direcciones que no eran las de la universidad (Bloque 1, Calle
     15) y el pie las mostraba cada vez que el backend no respondía. */
  info_sedes: { riohacha: {}, maicao: {} },
}

/* ─── localStorage fallback ──────────────────────────────────────
   La clave lleva versión y sube cuando cambia la FORMA de los datos, no su
   contenido: al migrar egresados (009) las claves de una letra —n, y, r, c—
   pasaron a nombre, anio_grado, cargo y empresa, y un visitante con el caché
   viejo habría visto la red de egresados con todos los nombres en blanco.
   v10: investigación (019) cambió cat/desc por categoria/descripcion. */
const CLAVE_CACHE = 'uniguajira_data_v10'

function loadState() {
  try {
    const s = localStorage.getItem(CLAVE_CACHE)
    if (!s) return INITIAL
    const saved = JSON.parse(s)
    return {
      ...INITIAL, ...saved,
      inicio: { ...INITIAL.inicio, ...saved.inicio },
      programa: { ...INITIAL.programa, ...saved.programa, ficha: { ...INITIAL.programa.ficha, ...(saved.programa?.ficha ?? {}) } },
      info_sedes: { ...INITIAL.info_sedes, ...saved.info_sedes, riohacha: { ...INITIAL.info_sedes.riohacha, ...(saved.info_sedes?.riohacha ?? {}) }, maicao: { ...INITIAL.info_sedes.maicao, ...(saved.info_sedes?.maicao ?? {}) } },
    }
  } catch { return INITIAL }
}

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [data, setData] = useState(loadState)
  const [apiReady, setApiReady] = useState(false)
  /* Ultimo fallo de guardado. Antes los errores se tragaban en silencio y el
     panel parecia haber guardado cuando el servidor habia respondido 401. */
  const [error, setError] = useState(null)
  /* Aviso de LECTURA (datos viejos o incompletos), distinto del de escritura. */
  const [avisoCarga, setAvisoCarga] = useState(null)

  /* Hydrate from backend on mount.

     Si esto falla, lo que queda en pantalla es el contenido de localStorage:
     una foto de la última vez que el servidor respondió. Antes el fallo se
     tragaba en silencio y esos datos viejos se presentaban como recién
     cargados; ahora se avisa. `fallos` viene de /api/all y dice qué orígenes
     concretos no se pudieron leer cuando el resto sí. */
  useEffect(() => {
    fetch(`${API}/all`, { signal: AbortSignal.timeout(3000) })
      .then(r => {
        if (!r.ok) throw new Error(`el servidor respondió ${r.status}`)
        return r.json()
      })
      .then(remote => {
        setAvisoCarga(remote.fallos?.length
          ? `No se pudo cargar: ${remote.fallos.join(', ')}. Esas secciones muestran lo último guardado en este navegador.`
          : null)
        setData(d => ({
          ...d, ...remote,
          inicio: { ...d.inicio, ...remote.inicio },
          programa: { ...d.programa, ...remote.programa, ficha: { ...d.programa?.ficha, ...remote.programa?.ficha } },
          info_sedes: { ...d.info_sedes, ...remote.info_sedes, riohacha: { ...d.info_sedes?.riohacha, ...remote.info_sedes?.riohacha }, maicao: { ...d.info_sedes?.maicao, ...remote.info_sedes?.maicao } },
        }))
        setApiReady(true)
      })
      .catch(() => {
        setAvisoCarga('Sin conexión con el servidor: estás viendo los últimos datos guardados en este navegador y pueden estar desactualizados. No guardes cambios hasta que vuelva la conexión.')
      })
  }, [])

  /* Persist to localStorage on every change */
  useEffect(() => {
    try { localStorage.setItem(CLAVE_CACHE, JSON.stringify(data)) } catch {}
  }, [data])

  /* Espejo del estado para poder calcular el "siguiente" arreglo sin meter
     efectos dentro del updater de setData (que en StrictMode corre dos veces). */
  const dataRef = useRef(data)
  useEffect(() => { dataRef.current = data }, [data])

  /* Relee la colección desde la base: ids, orden y campos calculados (como
     etiqueta_fecha) los decide el servidor, no el cliente. */
  const recargar = useCallback(async key => {
    const lista = await apiJSON(EN_BASE[key])
    setData(d => ({ ...d, [key]: lista }))
  }, [])

  const update = useCallback(async (key, value) => {
    setData(d => ({ ...d, [key]: value }))
    const fallo = await syncToAPI(key, value)
    if (fallo) setError(fallo)
  }, [])

  const addItem = useCallback(async (key, item) => {
    if (EN_BASE[key]) {
      try {
        await apiJSON(EN_BASE[key], { method: 'POST', body: item })
        await recargar(key)
      } catch (e) { setError(e.message) }
      return
    }
    const next = [...(dataRef.current[key] ?? []), { ...item, id: item.id ?? Date.now() }]
    setData(d => ({ ...d, [key]: next }))
    const fallo = await syncToAPI(key, next)
    if (fallo) setError(fallo)
  }, [recargar])

  const removeItem = useCallback(async (key, id) => {
    if (EN_BASE[key]) {
      try {
        await apiJSON(`${EN_BASE[key]}/${id}`, { method: 'DELETE' })
        await recargar(key)
      } catch (e) { setError(e.message) }
      return
    }
    const next = (dataRef.current[key] ?? []).filter(i => i.id !== id)
    setData(d => ({ ...d, [key]: next }))
    const fallo = await syncToAPI(key, next)
    if (fallo) setError(fallo)
  }, [recargar])

  const updateItem = useCallback(async (key, id, patch) => {
    if (EN_BASE[key]) {
      try {
        await apiJSON(`${EN_BASE[key]}/${id}`, { method: 'PATCH', body: patch })
        await recargar(key)
      } catch (e) { setError(e.message) }
      return
    }
    const next = (dataRef.current[key] ?? []).map(i => i.id === id ? { ...i, ...patch } : i)
    setData(d => ({ ...d, [key]: next }))
    const fallo = await syncToAPI(key, next)
    if (fallo) setError(fallo)
  }, [recargar])

  const reset = () => {
    localStorage.removeItem(CLAVE_CACHE)
    setData(INITIAL)
  }

  const limpiarError = useCallback(() => setError(null), [])

  /* Pone una clave tal cual la devolvió el servidor, para los recursos que no
     son listas (la ficha de la ORI) y no pasan por recargar(). */
  const fijar = useCallback((key, value) => setData(d => ({ ...d, [key]: value })), [])

  /* Guarda la malla que devuelven las operaciones del pensum. Evita una
     segunda petición: el servidor ya la mandó recalculada.

     Un plan no vigente es la propuesta, y esa se guarda entera bajo
     `pensum_propuesto`: su página pinta el encabezado, el trámite y las
     tarjetas, no solo los semestres. */
  const aplicarPensum = useCallback(malla => {
    setData(d => (malla?.plan && !malla.plan.vigente
      ? { ...d, pensum_propuesto: malla }
      : {
          ...d,
          pensum: malla.semestres ?? [],
          pensum_info: { plan: malla.plan, total_creditos: malla.total_creditos, total_materias: malla.total_materias },
        }))
  }, [])

  return (
    <DataContext.Provider value={{ data, update, addItem, removeItem, updateItem, recargar, reset, apiReady, error, limpiarError, avisoCarga, aplicarPensum, setError, fijar }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
