import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { FACTORES, EQUIPO_GENERAL, EVIDENCIAS_GENERALES } from '../data/acreditacion'

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
  honor:                  'estudiantes/honor',
  calendario:             'estudiantes/calendario',
  modalidades_grado:      'estudiantes/modalidades',
  documentos_estudiantes: 'estudiantes/documentos',
  noticias:               'noticias',
  eventos:                'eventos',
  convocatorias:          'convocatorias',
}

async function apiJSON(endpoint, { method = 'GET', body } = {}) {
  const res = await fetch(`${API}/${endpoint}`, {
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
  destacados:            'egresados/destacados',
  ofertas:               'egresados/ofertas',
  grupos:                'investigacion/grupos',
  semilleros:            'investigacion/semilleros',
  factores:              'acreditacion/factores',
  cronograma_cna:        'acreditacion/cronograma',
  equipo_cna:            'acreditacion/equipo',
  evidencias_cna:        'acreditacion/evidencias',
  info_sedes:            'sedes',
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
    const res = await fetch(`${API}/${endpoint}`, {
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
  const res = await fetch(`${API}/${ruta}`, {
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
  const res = await fetch(`${API}/estudiantes/honor/${honorId}/foto`, {
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
  const res = await fetch(`${API}/estudiantes/honor/documentos/${docId}`, {
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
  const res = await fetch(`${API}/docentes/${docenteId}/foto`, {
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

export async function apiUpload(tipo, file, extra = {}) {
  const fd = new FormData()
  fd.append('archivo', file)
  const qs = new URLSearchParams(extra).toString()
  const res = await fetch(`${API}/upload/${tipo}${qs ? '?' + qs : ''}`, {
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
  ofertas: [
    { id: 1, emp: 'Cluster TIC Caribe', p: 'Desarrollador(a) Full-stack Jr.', loc: 'Barranquilla · Híbrido', tipo: 'Tiempo completo', s: '$3.2M – $4.5M', t: ['React','Node','Postgres'], url: '', fecha: 'Abr 2026' },
    { id: 2, emp: 'Ecopetrol Digital', p: 'Analista de datos', loc: 'Bogotá · Presencial', tipo: 'Tiempo completo', s: '$4.0M – $5.5M', t: ['Python','SQL','PowerBI'], url: '', fecha: 'Abr 2026' },
    { id: 3, emp: 'TejerData SAS', p: 'Ingeniero(a) DevOps', loc: 'Riohacha · Remoto', tipo: 'Tiempo completo', s: '$5.0M – $7.0M', t: ['AWS','K8s','CI/CD'], url: '', fecha: 'Mar 2026' },
  ],
  destacados: [
    { id: 1, n: 'Diana Cotes Ramírez', y: '2018', r: 'Head of Data', c: 'Grupo Éxito', ciudad: 'Bogotá', color: 'var(--ug-azul)', q: 'Estudié aquí, pero el mundo cabe en La Guajira. Solo hay que saber mirarlo.', foto_url: '', sede: 'riohacha' },
    { id: 2, n: 'Luis Enrique Ariza', y: '2015', r: 'Senior SWE', c: 'Globant', ciudad: 'Medellín', color: 'var(--ug-amarillo)', q: 'La ingeniería te da el método; La Guajira te da el alma.', foto_url: '', sede: 'riohacha' },
    { id: 3, n: 'Nayely Epieyú Pushaina', y: '2020', r: 'CTO & Co-founder', c: 'TejerData SAS', ciudad: 'Riohacha', color: 'var(--ug-flamingo)', q: 'Volví para fundar una empresa donde mis tías wayuu venden por internet.', foto_url: '', sede: 'riohacha' },
    { id: 4, n: 'Samuel Palmar Iguarán', y: '2012', r: 'Security Architect', c: 'BBVA Digital', ciudad: 'Ciudad de México', color: 'var(--ug-azul)', q: 'Ningún framework me enseñó tanto como sustentar una tesis frente a mis profesores.', foto_url: '', sede: 'maicao' },
    { id: 5, n: 'Carolina Brito Solano', y: '2019', r: 'PhD Researcher', c: 'MIT Media Lab', ciudad: 'Cambridge, MA', color: 'var(--ug-flamingo)', q: 'Hago investigación en interfaces culturalmente situadas. Mi pregrado me dio ese marco.', foto_url: '', sede: 'riohacha' },
  ],
  grupos: [
    { id: 1, nombre: 'GITUG', cat: 'A1', lider: 'Dr. Héctor Brito Mendoza', sede: 'riohacha', desc: 'Grupo de Investigación en TIC de La Guajira. Énfasis en ciberseguridad, redes y sistemas embebidos.', foto_url: '' },
    { id: 2, nombre: 'WayuuLab', cat: 'B', lider: 'Dra. Luz Marina Ipuana', sede: 'riohacha', desc: 'Laboratorio de innovación social y cultural digital. Diseño de tecnologías situadas culturalmente.', foto_url: '' },
    { id: 3, nombre: 'Caribe.AI', cat: 'B', lider: 'Dr. Samuel Cotes Ramírez', sede: 'maicao', desc: 'Investigación en inteligencia artificial aplicada al contexto caribeño colombiano.', foto_url: '' },
  ],
  semilleros: [
    { id: 1, nombre: 'IoT Wayuu', grupo: 'GITUG', lider: 'MSc. Andrea Bolaños', sede: 'riohacha', desc: 'Internet de las cosas para comunidades indígenas y rurales.', integrantes: 8 },
    { id: 2, nombre: 'CiberSeg', grupo: 'GITUG', lider: 'Dr. Héctor Brito', sede: 'riohacha', desc: 'Ciberseguridad, hacking ético y forensia digital.', integrantes: 6 },
    { id: 3, nombre: 'DataCaribe', grupo: 'Caribe.AI', lider: 'Dr. Samuel Cotes', sede: 'maicao', desc: 'Ciencia de datos aplicada al contexto caribeño.', integrantes: 5 },
    { id: 4, nombre: 'WebDev IS', grupo: 'GITUG', lider: 'MSc. Catalina Uriana', sede: 'riohacha', desc: 'Desarrollo web moderno y aplicaciones móviles.', integrantes: 7 },
    { id: 5, nombre: 'AlgoLab', grupo: 'WayuuLab', lider: 'Dr. Pablo Mengual', sede: 'maicao', desc: 'Algoritmos, complejidad computacional y optimización.', integrantes: 4 },
  ],
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
  info_sedes: {
    riohacha: { nombre: 'Sede Riohacha', direccion: 'Bloque 1 — 2.° piso, Km 3+354 Vía Maicao', tel: '+57 (605) 7282729 Ext. 240, 241', email: 'ingsistemas@uniguajira.edu.co', director: 'Adanud S. Meza Valle' },
    maicao: { nombre: 'Sede Maicao', direccion: 'Calle 15 No. 14-37, Centro, Maicao', tel: '+57 (605) 7271500 Ext. 110', email: 'sistemas.maicao@uniguajira.edu.co', director: 'Coordinador por designar' },
  },
  eventos: [],
}

/* ─── localStorage fallback ────────────────────────────────────── */
function loadState() {
  try {
    const s = localStorage.getItem('uniguajira_data_v8')
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
    try { localStorage.setItem('uniguajira_data_v8', JSON.stringify(data)) } catch {}
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
    localStorage.removeItem('uniguajira_data_v8')
    setData(INITIAL)
  }

  const limpiarError = useCallback(() => setError(null), [])

  /* Guarda la malla que devuelven las operaciones del pensum. Evita una
     segunda petición: el servidor ya la mandó recalculada. */
  const aplicarPensum = useCallback(malla => {
    setData(d => ({
      ...d,
      pensum: malla.semestres ?? [],
      pensum_info: { plan: malla.plan, total_creditos: malla.total_creditos, total_materias: malla.total_materias },
    }))
  }, [])

  return (
    <DataContext.Provider value={{ data, update, addItem, removeItem, updateItem, recargar, reset, apiReady, error, limpiarError, avisoCarga, aplicarPensum, setError }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
