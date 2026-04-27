import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { FACTORES, EQUIPO_GENERAL, EVIDENCIAS_GENERALES } from '../data/acreditacion'

/* ─── API helpers ──────────────────────────────────────────────── */
const API = 'http://localhost:3001/api'

function adminToken() {
  return sessionStorage.getItem('ug_admin') ?? ''
}

function authHeaders() {
  return { 'Content-Type': 'application/json', 'x-admin-token': adminToken() }
}

const KEY_ENDPOINT = {
  noticias:              'noticias',
  convocatorias:         'convocatorias',
  docentes:              'docentes',
  honor:                 'estudiantes/honor',
  calendario:            'estudiantes/calendario',
  modalidades_grado:     'estudiantes/modalidades',
  documentos_estudiantes:'estudiantes/documentos',
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
  pensum:                'programa/pensum',
}

async function syncToAPI(key, value) {
  const endpoint = KEY_ENDPOINT[key]
  if (!endpoint || !adminToken()) return
  try {
    await fetch(`${API}/${endpoint}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(value),
    })
  } catch { /* silent — local state already updated */ }
}

export async function apiUpload(tipo, file, extra = {}) {
  const fd = new FormData()
  fd.append('archivo', file)
  const qs = new URLSearchParams(extra).toString()
  const res = await fetch(`${API}/upload/${tipo}${qs ? '?' + qs : ''}`, {
    method: 'POST',
    headers: { 'x-admin-token': adminToken() },
    body: fd,
  })
  if (!res.ok) throw new Error('Upload failed')
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
  honor: [
    { id: 1, nombre: 'María José Iguarán Pushaina', promedio: '4.92', semestre: '8º', periodo: '2026-I', sede: 'riohacha', foto_url: '' },
    { id: 2, nombre: 'Luis Enrique Gutiérrez Epiayú', promedio: '4.88', semestre: '6º', periodo: '2026-I', sede: 'riohacha', foto_url: '' },
    { id: 3, nombre: 'Carolina Brito Mendoza', promedio: '4.85', semestre: '10º', periodo: '2026-I', sede: 'riohacha', foto_url: '' },
    { id: 4, nombre: 'Samuel Cotes Jr.', promedio: '4.80', semestre: '4º', periodo: '2026-I', sede: 'maicao', foto_url: '' },
    { id: 5, nombre: 'Andrea Uriana Jayariyú', promedio: '4.78', semestre: '8º', periodo: '2026-I', sede: 'maicao', foto_url: '' },
    { id: 6, nombre: 'Jorge David Palmar', promedio: '4.76', semestre: '2º', periodo: '2026-I', sede: 'riohacha', foto_url: '' },
    { id: 7, nombre: 'Nayely Bolaños Curvelo', promedio: '4.75', semestre: '6º', periodo: '2026-I', sede: 'maicao', foto_url: '' },
    { id: 8, nombre: 'Héctor Mengual Solano', promedio: '4.72', semestre: '10º', periodo: '2026-I', sede: 'riohacha', foto_url: '' },
    { id: 9, nombre: 'Catalina Ipuana Pérez', promedio: '4.70', semestre: '4º', periodo: '2026-I', sede: 'riohacha', foto_url: '' },
    { id: 10, nombre: 'Pablo Ramírez Jusayú', promedio: '4.68', semestre: '8º', periodo: '2026-I', sede: 'maicao', foto_url: '' },
  ],
  docentes: [
    { id: 1, n: 'Dra. Luz Marina Ipuana', r: 'Directora de Programa', a: 'IA aplicada · Datos territoriales', e: 'direccion.is@uniguajira.edu.co', h: 'Lun–Mié · 2:00–4:00 pm · Oficina 4-302', cat: 'Titular', sede: 'riohacha', foto_url: '', telefono: '', hoja_vida_url: '', activo: true },
    { id: 2, n: 'MSc. Jorge Epieyú Palmar', r: 'Docente tiempo completo', a: 'Ingeniería de software · DevOps', e: 'jepalmar@uniguajira.edu.co', h: 'Mar y Jue · 10:00–12:00 am · Lab Software', cat: 'Asociado', sede: 'riohacha', foto_url: '', telefono: '', hoja_vida_url: '', activo: true },
    { id: 3, n: 'Dr. Héctor Brito Mendoza', r: 'Investigador GITUG', a: 'Ciberseguridad · Redes', e: 'hbrito@uniguajira.edu.co', h: 'Lun y Vie · 3:00–5:00 pm · Oficina 4-205', cat: 'Titular', sede: 'riohacha', foto_url: '', telefono: '', hoja_vida_url: '', activo: true },
    { id: 4, n: 'MSc. Catalina Uriana Iguarán', r: 'Docente tiempo completo', a: 'Bases de datos · Ingeniería web', e: 'cuiguaran@uniguajira.edu.co', h: 'Mié · 9:00–11:00 am · Oficina 4-210', cat: 'Asistente', sede: 'riohacha', foto_url: '', telefono: '', hoja_vida_url: '', activo: true },
    { id: 5, n: 'Dr. Samuel Cotes Ramírez', r: 'Investigador Caribe.AI', a: 'Machine learning · Visión', e: 'scotes@uniguajira.edu.co', h: 'Mar y Jue · 2:00–4:00 pm · Lab IA', cat: 'Asociado', sede: 'riohacha', foto_url: '', telefono: '', hoja_vida_url: '', activo: true },
    { id: 6, n: 'MSc. Andrea Bolaños Curvelo', r: 'Coord. semilleros', a: 'IoT · Sistemas embebidos', e: 'abolanos@uniguajira.edu.co', h: 'Lun y Mié · 10:00–12:00 am · Lab Hardware', cat: 'Asistente', sede: 'riohacha', foto_url: '', telefono: '', hoja_vida_url: '', activo: true },
    { id: 7, n: 'Dr. Pablo Mengual Solano', r: 'Docente tiempo completo', a: 'Algoritmos · Ciencias básicas', e: 'pmengual@uniguajira.edu.co', h: 'Mar y Vie · 8:00–10:00 am · Oficina 4-207', cat: 'Asociado', sede: 'maicao', foto_url: '', telefono: '', hoja_vida_url: '', activo: true },
    { id: 8, n: 'MSc. Nayely Uriana Jayariyú', r: 'Docente tiempo completo', a: 'HCI · Diseño interacción', e: 'nuriana@uniguajira.edu.co', h: 'Jue · 1:00–4:00 pm · Oficina 4-215', cat: 'Asistente', sede: 'maicao', foto_url: '', telefono: '', hoja_vida_url: '', activo: true },
    { id: 9, n: 'Esp. Carlos Pushaina Iguarán', r: 'Docente cátedra', a: 'Telecomunicaciones · Redes', e: 'cpushaina@uniguajira.edu.co', h: 'Lun y Jue · 6:00–8:00 pm', cat: 'Asistente', sede: 'maicao', foto_url: '', telefono: '', hoja_vida_url: '', activo: true },
  ],
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
  pensum: [
    { semestre: 1, materias: [{ n: 'Cálculo Diferencial', cr: 4, tipo: 'Básica' }, { n: 'Fundamentos de Programación', cr: 3, tipo: 'Disciplinar' }, { n: 'Álgebra Lineal', cr: 3, tipo: 'Básica' }, { n: 'Lógica Matemática', cr: 3, tipo: 'Básica' }, { n: 'Lenguaje y Comunicación', cr: 2, tipo: 'Complementaria' }] },
    { semestre: 2, materias: [{ n: 'Cálculo Integral', cr: 4, tipo: 'Básica' }, { n: 'Programación Orientada a Objetos', cr: 3, tipo: 'Disciplinar' }, { n: 'Estadística y Probabilidad', cr: 3, tipo: 'Básica' }, { n: 'Sistemas Operativos I', cr: 3, tipo: 'Disciplinar' }, { n: 'Inglés I', cr: 2, tipo: 'Complementaria' }] },
    { semestre: 3, materias: [{ n: 'Cálculo Multivariable', cr: 3, tipo: 'Básica' }, { n: 'Estructuras de Datos', cr: 3, tipo: 'Disciplinar' }, { n: 'Análisis y Diseño de Sistemas', cr: 3, tipo: 'Disciplinar' }, { n: 'Bases de Datos I', cr: 3, tipo: 'Disciplinar' }, { n: 'Inglés II', cr: 2, tipo: 'Complementaria' }] },
    { semestre: 4, materias: [{ n: 'Ecuaciones Diferenciales', cr: 3, tipo: 'Básica' }, { n: 'Algoritmos y Complejidad', cr: 3, tipo: 'Disciplinar' }, { n: 'Bases de Datos II', cr: 3, tipo: 'Disciplinar' }, { n: 'Ingeniería de Software I', cr: 3, tipo: 'Disciplinar' }, { n: 'Redes de Computadoras I', cr: 3, tipo: 'Disciplinar' }] },
    { semestre: 5, materias: [{ n: 'Arquitectura de Computadoras', cr: 3, tipo: 'Disciplinar' }, { n: 'Ingeniería de Software II', cr: 3, tipo: 'Disciplinar' }, { n: 'Redes de Computadoras II', cr: 3, tipo: 'Disciplinar' }, { n: 'Inteligencia Artificial I', cr: 3, tipo: 'Disciplinar' }, { n: 'Electiva I', cr: 2, tipo: 'Electiva' }] },
    { semestre: 6, materias: [{ n: 'Sistemas Distribuidos', cr: 3, tipo: 'Disciplinar' }, { n: 'Seguridad Informática', cr: 3, tipo: 'Disciplinar' }, { n: 'Desarrollo Web', cr: 3, tipo: 'Disciplinar' }, { n: 'Inteligencia Artificial II', cr: 3, tipo: 'Disciplinar' }, { n: 'Electiva II', cr: 2, tipo: 'Electiva' }] },
    { semestre: 7, materias: [{ n: 'Gestión de Proyectos TI', cr: 3, tipo: 'Disciplinar' }, { n: 'Computación en la Nube', cr: 3, tipo: 'Disciplinar' }, { n: 'Minería de Datos', cr: 3, tipo: 'Disciplinar' }, { n: 'Emprendimiento Tecnológico', cr: 2, tipo: 'Complementaria' }, { n: 'Electiva III', cr: 3, tipo: 'Electiva' }] },
    { semestre: 8, materias: [{ n: 'Tópicos Avanzados en IS', cr: 3, tipo: 'Disciplinar' }, { n: 'Legislación Informática', cr: 2, tipo: 'Complementaria' }, { n: 'Electiva IV', cr: 3, tipo: 'Electiva' }, { n: 'Electiva V', cr: 3, tipo: 'Electiva' }, { n: 'Seminario de Investigación', cr: 2, tipo: 'Disciplinar' }] },
    { semestre: 9, materias: [{ n: 'Práctica Profesional I', cr: 6, tipo: 'Práctica' }, { n: 'Opción de Grado I', cr: 4, tipo: 'Grado' }, { n: 'Electiva VI', cr: 3, tipo: 'Electiva' }] },
    { semestre: 10, materias: [{ n: 'Práctica Profesional II', cr: 6, tipo: 'Práctica' }, { n: 'Opción de Grado II', cr: 4, tipo: 'Grado' }, { n: 'Electiva VII', cr: 3, tipo: 'Electiva' }] },
  ],
  calendario: [
    { id: 1, fecha: '26 may 2026', evento: 'Inicio semestre 2026-II', tipo: 'académico', sede: 'ambas' },
    { id: 2, fecha: '05 jun 2026', evento: 'Plazo matrícula ordinaria', tipo: 'administrativo', sede: 'ambas' },
    { id: 3, fecha: '25 jul 2026', evento: 'Semana de receso universitario', tipo: 'académico', sede: 'ambas' },
    { id: 4, fecha: '15 ago 2026', evento: 'Exámenes parciales', tipo: 'evaluacion', sede: 'ambas' },
    { id: 5, fecha: '30 sep 2026', evento: 'Exámenes finales', tipo: 'evaluacion', sede: 'ambas' },
    { id: 6, fecha: '10 oct 2026', evento: 'Cierre académico 2026-II', tipo: 'académico', sede: 'ambas' },
  ],
  modalidades_grado: [
    { id: 1, nombre: 'Trabajo de grado', desc: 'Proyecto de investigación o desarrollo bajo la dirección de un docente del programa.', documento_url: '' },
    { id: 2, nombre: 'Práctica empresarial', desc: 'Vinculación mínima de 6 meses con empresa en cargo relacionado con la carrera.', documento_url: '' },
    { id: 3, nombre: 'Estudios de posgrado', desc: 'Aprobación de al menos 12 créditos de especialización o maestría afín.', documento_url: '' },
    { id: 4, nombre: 'Emprendimiento', desc: 'Creación y formalización de empresa tecnológica con acompañamiento del programa.', documento_url: '' },
  ],
  documentos_estudiantes: [
    { id: 1, nombre: 'Reglamento estudiantil', url: '', tipo: 'PDF', descripcion: 'Acuerdo 018 de 2021 vigente' },
    { id: 2, nombre: 'Calendario académico 2026', url: '', tipo: 'PDF', descripcion: 'Fechas oficiales semestre 2026-I y 2026-II' },
    { id: 3, nombre: 'Guía de opciones de grado', url: '', tipo: 'PDF', descripcion: 'Requisitos y procedimiento para cada modalidad' },
    { id: 4, nombre: 'Formato inscripción práctica', url: '', tipo: 'DOCX', descripcion: 'Formulario de vinculación práctica profesional' },
  ],
  info_sedes: {
    riohacha: { nombre: 'Sede Riohacha', direccion: 'Bloque 1 — 2.° piso, Km 3+354 Vía Maicao', tel: '+57 (605) 7282729 Ext. 240, 241', email: 'ingsistemas@uniguajira.edu.co', director: 'Adanud S. Meza Valle' },
    maicao: { nombre: 'Sede Maicao', direccion: 'Calle 15 No. 14-37, Centro, Maicao', tel: '+57 (605) 7271500 Ext. 110', email: 'sistemas.maicao@uniguajira.edu.co', director: 'Coordinador por designar' },
  },
  eventos: [],
}

/* ─── localStorage fallback ────────────────────────────────────── */
function loadState() {
  try {
    const s = localStorage.getItem('uniguajira_data_v4')
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
    try { localStorage.setItem('uniguajira_data_v4', JSON.stringify(data)) } catch {}
  }, [data])

  const update = useCallback((key, value) => {
    setData(d => ({ ...d, [key]: value }))
    syncToAPI(key, value)
  }, [])

  const updateNested = useCallback((key, subKey, value) => {
    setData(d => ({ ...d, [key]: { ...d[key], [subKey]: value } }))
  }, [])

  const addItem = useCallback((key, item) => {
    setData(d => {
      const next = [...(d[key] ?? []), { ...item, id: item.id ?? Date.now() }]
      syncToAPI(key, next)
      return { ...d, [key]: next }
    })
  }, [])

  const removeItem = useCallback((key, id) => {
    setData(d => {
      const next = d[key].filter(i => i.id !== id)
      syncToAPI(key, next)
      return { ...d, [key]: next }
    })
  }, [])

  const updateItem = useCallback((key, id, patch) => {
    setData(d => {
      const next = d[key].map(i => i.id === id ? { ...i, ...patch } : i)
      syncToAPI(key, next)
      return { ...d, [key]: next }
    })
  }, [])

  const reset = () => {
    localStorage.removeItem('uniguajira_data_v4')
    setData(INITIAL)
  }

  return (
    <DataContext.Provider value={{ data, update, updateNested, addItem, removeItem, updateItem, reset, apiReady }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
