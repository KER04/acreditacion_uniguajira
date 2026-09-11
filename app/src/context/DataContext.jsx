import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { FACTORES, EQUIPO_GENERAL, EVIDENCIAS_GENERALES } from '../data/acreditacion'
import pensumData from '../data/pensum.json'

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
  noticias:              'noticias',
  eventos:               'eventos',
  convocatorias:         'convocatorias',
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
  pensum:                'programa/pensum',
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
  noticias: [
    { id: 1, fecha: '12 abr 2026', cat: 'Investigación', titulo: 'Semillero IoT Wayuu presenta ponencia en IEEE Colombia 2026', resumen: 'El estudiante Luis Enrique Gutiérrez presentó resultados del proyecto ArenaNet en el encuentro nacional.', cuerpo: '', imagen_url: '', autor: 'Comunicaciones IS', sede: 'riohacha' },
    { id: 2, fecha: '05 abr 2026', cat: 'Acreditación', titulo: 'Avanza el proceso de autoevaluación con miras a acreditación CNA', resumen: 'El programa completó la recolección documental de los 12 factores y entra en fase de redacción del informe.', cuerpo: '', imagen_url: '', autor: 'Dirección del programa', sede: 'ambas' },
    { id: 3, fecha: '28 mar 2026', cat: 'Egresados', titulo: 'Egresada de Ingeniería de Sistemas lidera área de datos en empresa global', resumen: 'Diana Cotes (2018) asumió recientemente el cargo de Head of Data en una multinacional con sede en Bogotá.', cuerpo: '', imagen_url: '', autor: 'Egresados IS', sede: 'ambas' },
    { id: 4, fecha: '14 mar 2026', cat: 'Extensión', titulo: 'Firmado convenio con Cluster TIC del Caribe', resumen: 'La alianza permitirá a estudiantes acceder a prácticas profesionales en empresas del gremio regional.', cuerpo: '', imagen_url: '', autor: 'Extensión IS', sede: 'riohacha' },
    { id: 5, fecha: '01 mar 2026', cat: 'Docencia', titulo: 'Nuevo laboratorio de ciberseguridad habilitado en el bloque 4', resumen: 'Dotación con 20 estaciones, rack para cyber-range y licencias académicas de herramientas SIEM.', cuerpo: '', imagen_url: '', autor: 'Dirección del programa', sede: 'riohacha' },
    { id: 6, fecha: '15 feb 2026', cat: 'Extensión', titulo: 'Estudiantes de Maicao ganan primer lugar en hackathon regional', resumen: "El equipo 'Guajira Data' de la sede Maicao obtuvo el primer puesto en el Hackathon Guajira Tech 2026.", cuerpo: '', imagen_url: '', autor: 'Comunicaciones IS', sede: 'maicao' },
  ],
  convocatorias: [
    { id: 1, cat: 'Investigación', titulo: 'Jóvenes Investigadores 2026', estado: 'Abierta', cierre: '28 may 2026', sede: 'ambas', requisitos: ['Estudiantes de 6.º a 10.º semestre', 'Promedio acumulado ≥ 3.8'], desc: 'Vinculación semestral remunerada a grupos de investigación. Cupos: 6.', fecha_apertura: '', dirigida_a: 'Estudiantes', url_postulacion: '', documento_url: '' },
    { id: 2, cat: 'Internacionalización', titulo: 'Intercambio UNAM 2026-II', estado: 'Abierta', cierre: '15 jul 2026', sede: 'riohacha', requisitos: ['Promedio ≥ 4.0', 'Haber cursado al menos 5 semestres'], desc: 'Un semestre en Ciudad de México con homologación de créditos.', fecha_apertura: '', dirigida_a: 'Estudiantes', url_postulacion: '', documento_url: '' },
    { id: 3, cat: 'Extensión', titulo: 'Hackathon Guajira Tech 2026', estado: 'Abierta', cierre: '15 may 2026', sede: 'ambas', requisitos: ['Todos los estudiantes activos'], desc: 'Reto de 48 horas con Cluster TIC Caribe. Premio $8M y prácticas aseguradas.', fecha_apertura: '', dirigida_a: 'Estudiantes', url_postulacion: '', documento_url: '' },
    { id: 4, cat: 'Prácticas', titulo: 'Práctica profesional 2026-II', estado: 'Abierta', cierre: '30 jun 2026', sede: 'ambas', requisitos: ['Estudiantes de 9.º semestre', 'Haber aprobado seminario de investigación'], desc: '22 empresas aliadas con cupos garantizados en el Caribe y Bogotá.', fecha_apertura: '', dirigida_a: 'Estudiantes', url_postulacion: '', documento_url: '' },
    { id: 5, cat: 'Investigación', titulo: 'Semilleros 2026-II', estado: 'Abierta', cierre: '10 ago 2026', sede: 'ambas', requisitos: ['Estudiantes de 2.º a 8.º semestre'], desc: '14 semilleros activos con plazas en IA, IoT, Ciberseguridad y HCI.', fecha_apertura: '', dirigida_a: 'Estudiantes', url_postulacion: '', documento_url: '' },
    { id: 6, cat: 'Estímulos', titulo: 'Beca de excelencia académica', estado: 'Próxima', cierre: '15 ago 2026', sede: 'maicao', requisitos: ['Promedio ≥ 4.5', 'No tener materias reprobadas'], desc: 'Cubrimiento del 100% de matrícula durante el semestre 2026-II.', fecha_apertura: '', dirigida_a: 'Estudiantes', url_postulacion: '', documento_url: '' },
  ],
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
  pensum: pensumData.semestres,
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

  /* Hydrate from backend on mount */
  useEffect(() => {
    fetch(`${API}/all`, { signal: AbortSignal.timeout(3000) })
      .then(r => r.ok ? r.json() : null)
      .then(remote => {
        if (!remote) return
        setData(d => ({
          ...d, ...remote,
          inicio: { ...d.inicio, ...remote.inicio },
          programa: { ...d.programa, ...remote.programa, ficha: { ...d.programa?.ficha, ...remote.programa?.ficha } },
          info_sedes: { ...d.info_sedes, ...remote.info_sedes, riohacha: { ...d.info_sedes?.riohacha, ...remote.info_sedes?.riohacha }, maicao: { ...d.info_sedes?.maicao, ...remote.info_sedes?.maicao } },
        }))
        setApiReady(true)
      })
      .catch(() => { /* backend not running — use localStorage */ })
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

  return (
    <DataContext.Provider value={{ data, update, addItem, removeItem, updateItem, recargar, reset, apiReady, error, limpiarError }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
