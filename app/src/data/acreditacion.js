export const STATUS_LABELS = { pleno: 'Pleno', alto: 'Alto', desarrollo: 'En Desarrollo' }
export const STATUS_COLOR = { pleno: 'var(--ug-azul)', alto: 'var(--ug-amarillo)', desarrollo: 'var(--ug-flamingo)' }

export function judgmentFromScore(s) {
  if (s >= 4.5) return 'Cumple Plenamente'
  if (s >= 4.0) return 'Cumple en Alto Grado'
  if (s >= 3.0) return 'Cumple Aceptablemente'
  if (s >= 2.0) return 'Cumple Insatisfactoriamente'
  return 'No Cumple'
}
export function statusFromScore(s) {
  if (s >= 4.5) return 'pleno'
  if (s >= 4.0) return 'alto'
  return 'desarrollo'
}

export const FACTORES = [
  {
    n: 1, t: 'Misión y Proyecto Institucional', score: 4.6,
    summary: 'Coherencia entre el Proyecto Educativo del Programa (PEP) y la Misión institucional de la Universidad de La Guajira.',
    fortalezas: ['PEP actualizado y articulado con la misión institucional.', 'Apropiación de la misión por parte de estudiantes y docentes.', 'Compromiso explícito con la diversidad étnica y territorial.'],
    oportunidades: ['Ampliar la difusión del PEP a egresados y sector externo.', 'Sistematizar la evaluación periódica del PEP.'],
    caracteristicas: [
      { n: 1, name: 'Misión, visión y Proyecto Institucional', score: 4.7, desc: 'Coherencia y apropiación de la misión institucional por parte de la comunidad académica del programa.' },
      { n: 2, name: 'Proyecto Educativo del Programa (PEP)', score: 4.5, desc: 'Pertinencia del PEP frente a las necesidades del contexto y articulación con el PEI.' },
      { n: 3, name: 'Relevancia académica y pertinencia social del programa', score: 4.6, desc: 'Impacto del programa en la región y coherencia con la demanda del sector TIC del Caribe.' },
    ],
    equipo: [
      { n: 'Adanud Segundo Meza Valle', cargo: 'Director del programa', rol: 'Líder del factor' },
      { n: 'MSc. Jorge Epieyú Palmar', cargo: 'Docente tiempo completo', rol: 'Análisis PEP' },
      { n: 'Luis Enrique Gutiérrez', cargo: 'Representante estudiantil', rol: 'Apoyo documental' },
    ],
    evidencias: [
      { t: 'PEI 2020–2030 UniGuajira', d: 'Proyecto Educativo Institucional vigente', f: 'Mar 2025' },
      { t: 'PEP Ingeniería de Sistemas 2024', d: 'Proyecto Educativo del Programa actualizado', f: 'Oct 2024' },
      { t: 'Acta Consejo Académico 045', d: 'Aprobación de ajustes al PEP', f: 'Ago 2024' },
    ],
    anexos: [
      { cat: 'Normativa', items: ['Acuerdo de aprobación del PEI', 'Resolución rectoral adopción PEP'] },
      { cat: 'Encuestas', items: ['Encuesta de apropiación PEP 2025'] },
    ],
  },
  {
    n: 2, t: 'Estudiantes', score: 4.5,
    summary: 'Políticas de admisión, permanencia, participación y reglamento estudiantil pertinentes y conocidas por la comunidad.',
    fortalezas: ['Reglamento estudiantil vigente y socializado.', 'Políticas diferenciales para estudiantes wayuu y afrodescendientes.', 'Tasa de permanencia superior al promedio nacional.'],
    oportunidades: ['Fortalecer tutorías académicas en primer semestre.', 'Ampliar participación estudiantil en órganos colegiados.'],
    caracteristicas: [
      { n: 4, name: 'Mecanismos de selección e ingreso', score: 4.5, desc: 'Procesos transparentes, con criterios diferenciales para pueblos indígenas y comunidades vulnerables.' },
      { n: 5, name: 'Estudiantes admitidos y capacidad institucional', score: 4.4, desc: 'Relación entre cupos, demanda y capacidad de atención del programa.' },
      { n: 6, name: 'Permanencia y graduación estudiantil', score: 4.5, desc: 'Estrategias efectivas de acompañamiento y reducción de deserción.' },
      { n: 7, name: 'Participación en actividades de formación integral', score: 4.3, desc: 'Vinculación estudiantil a semilleros, cultura, deporte y bienestar.' },
      { n: 8, name: 'Reglamentos estudiantil y académico', score: 4.6, desc: 'Socialización, aplicación y actualización del reglamento estudiantil.' },
    ],
    equipo: [
      { n: 'Adanud Segundo Meza Valle', cargo: 'Director del programa', rol: 'Líder del factor' },
      { n: 'MSc. Catalina Uriana Iguarán', cargo: 'Docente tiempo completo', rol: 'Análisis permanencia' },
      { n: 'Daniela Pushaina', cargo: 'Representante estudiantil', rol: 'Grupos focales' },
    ],
    evidencias: [
      { t: 'Acuerdo 018 de 2021 — Reglamento estudiantil', d: 'Reglamento vigente', f: 'Jun 2021' },
      { t: 'Informe SPADIES 2025', d: 'Indicadores de deserción y permanencia', f: 'Feb 2025' },
      { t: 'Encuesta de bienestar estudiantil 2025', d: 'Resultados y análisis', f: 'Nov 2025' },
    ],
    anexos: [
      { cat: 'Estadísticas', items: ['Matriz de admisiones 2018–2025', 'Tasas de permanencia por cohorte'] },
      { cat: 'Actas', items: ['Actas del comité curricular', 'Actas representación estudiantil'] },
    ],
  },
  {
    n: 3, t: 'Profesores', score: 4.4,
    summary: 'Planta docente cualificada con carrera, dedicación y producción académica consistente con las exigencias del programa.',
    fortalezas: ['Planta con 9 doctores y 17 magísteres activos.', 'Plan de desarrollo profesoral 2024–2028 en ejecución.', 'Vinculación creciente con redes académicas internacionales.'],
    oportunidades: ['Incrementar la producción indexada Q1/Q2.', 'Fortalecer la formación en pedagogía universitaria.'],
    caracteristicas: [
      { n: 9, name: 'Selección, vinculación y permanencia de profesores', score: 4.5, desc: 'Procesos rigurosos de selección docente y políticas de permanencia.' },
      { n: 10, name: 'Estatuto profesoral', score: 4.5, desc: 'Estatuto vigente, aplicado y socializado entre los docentes del programa.' },
      { n: 11, name: 'Número, dedicación, nivel de formación y experiencia', score: 4.3, desc: 'Planta suficiente en número, nivel formativo y tiempos de dedicación.' },
      { n: 12, name: 'Desarrollo profesoral', score: 4.2, desc: 'Programas institucionales de capacitación, actualización y formación avanzada.' },
      { n: 13, name: 'Estímulos a la docencia, investigación, creación e innovación', score: 4.4, desc: 'Sistema de estímulos académicos y reconocimiento a la producción.' },
      { n: 14, name: 'Producción de materiales académicos', score: 4.3, desc: 'Publicación de libros, artículos, ponencias y material didáctico.' },
      { n: 15, name: 'Remuneración por méritos', score: 4.5, desc: 'Política salarial que reconoce formación, categoría y productividad.' },
    ],
    equipo: [
      { n: 'Dr. Héctor Brito Mendoza', cargo: 'Investigador principal GITUG', rol: 'Líder del factor' },
      { n: 'MSc. Andrea Bolaños Curvelo', cargo: 'Docente tiempo completo', rol: 'Análisis de dedicación' },
      { n: 'Claudia Mendoza', cargo: 'Secretaria académica', rol: 'Apoyo documental' },
    ],
    evidencias: [
      { t: 'Estatuto profesoral UniGuajira', d: 'Normativa de carrera docente', f: '2019' },
      { t: 'GrupLac y CvLac de la planta', d: 'Hojas de vida registradas en MinCiencias', f: 'Act. Abr 2026' },
      { t: 'Plan de desarrollo profesoral 2024–2028', d: 'Ruta de formación docente', f: 'Ene 2024' },
    ],
    anexos: [
      { cat: 'Planta', items: ['Listado completo planta docente', 'Dedicación y categorías'] },
      { cat: 'Producción', items: ['Publicaciones 2021–2025', 'Ponencias nacionales e internacionales'] },
    ],
  },
  {
    n: 4, t: 'Procesos Académicos', score: 4.5,
    summary: 'Currículo pertinente, con flexibilidad, interdisciplinariedad y relación con la investigación.',
    fortalezas: ['Reforma curricular 2024 aprobada e implementada.', 'Electivas de profundización alineadas con el ecosistema TIC del Caribe.', 'Matriz de competencias mapeada a resultados de aprendizaje.'],
    oportunidades: ['Ampliar electivas interdisciplinares con otros programas.', 'Fortalecer evaluación por competencias.'],
    caracteristicas: [
      { n: 16, name: 'Integralidad del currículo', score: 4.6, desc: 'Formación integral articulando fundamentación, profundización, flexibilidad y contexto.' },
      { n: 17, name: 'Flexibilidad del currículo', score: 4.4, desc: 'Electivas, movilidad, reconocimiento y homologación de créditos.' },
      { n: 18, name: 'Interdisciplinariedad', score: 4.3, desc: 'Articulación entre áreas y con otros programas de la Universidad.' },
      { n: 19, name: 'Metodologías de enseñanza-aprendizaje', score: 4.5, desc: 'Estrategias pedagógicas activas centradas en el estudiante.' },
      { n: 20, name: 'Sistema de evaluación de estudiantes', score: 4.5, desc: 'Evaluación formativa, sumativa y por competencias.' },
      { n: 21, name: 'Trabajos de los estudiantes', score: 4.6, desc: 'Pertinencia y calidad de los trabajos académicos y de grado.' },
      { n: 22, name: 'Evaluación y autorregulación del programa', score: 4.4, desc: 'Procesos permanentes de evaluación curricular y mejora.' },
      { n: 23, name: 'Extensión o proyección social', score: 4.3, desc: 'Articulación del currículo con proyectos de proyección social.' },
      { n: 24, name: 'Recursos bibliográficos', score: 4.5, desc: 'Acceso y uso de recursos bibliográficos especializados.' },
      { n: 25, name: 'Recursos informáticos y de comunicación', score: 4.6, desc: 'Infraestructura TIC, plataformas y laboratorios disponibles.' },
      { n: 26, name: 'Recursos de apoyo docente', score: 4.5, desc: 'Apoyos institucionales para la labor docente y la investigación.' },
    ],
    equipo: [
      { n: 'Dra. Luz Marina Ipuana', cargo: 'Coord. curricular', rol: 'Líder del factor' },
      { n: 'Dr. Pablo Mengual Solano', cargo: 'Docente tiempo completo', rol: 'Análisis currículo' },
      { n: 'MSc. Nayely Uriana Jayariyú', cargo: 'Docente tiempo completo', rol: 'Análisis metodologías' },
    ],
    evidencias: [
      { t: 'Microcurrículos actualizados 2025', d: '50 cursos con syllabus vigente', f: 'Feb 2025' },
      { t: 'Matriz de competencias del programa', d: 'Competencias y resultados de aprendizaje', f: 'Oct 2024' },
      { t: 'Informe de reforma curricular', d: 'Análisis, propuesta y aprobación', f: 'Ago 2024' },
    ],
    anexos: [
      { cat: 'Currículo', items: ['Malla curricular 169 cr', 'Reglamento de opciones de grado'] },
      { cat: 'Evaluaciones', items: ['Encuestas de curso 2023–2025'] },
    ],
  },
  {
    n: 5, t: 'Visibilidad Nacional e Internacional', score: 4.1,
    summary: 'Inserción en redes académicas y científicas, movilidad entrante y saliente, y referentes externos reconocidos.',
    fortalezas: ['Convenios activos con UNAM (México) y UPV (España).', 'Participación en la Red Colombiana de Ingeniería de Sistemas.'],
    oportunidades: ['Incrementar movilidad saliente estudiantil.', 'Atraer profesores visitantes extranjeros.'],
    caracteristicas: [
      { n: 27, name: 'Inserción del programa en contextos académicos nacionales e internacionales', score: 4.0, desc: 'Presencia del programa en redes, eventos y espacios académicos.' },
      { n: 28, name: 'Relaciones externas de profesores y estudiantes', score: 4.1, desc: 'Movilidad, ponencias, publicaciones en coautoría internacional.' },
    ],
    equipo: [
      { n: 'Dra. Luz Marina Ipuana', cargo: 'Líder ORI programa', rol: 'Líder del factor' },
      { n: 'MSc. Jorge Epieyú Palmar', cargo: 'Docente tiempo completo', rol: 'Gestión convenios' },
    ],
    evidencias: [
      { t: 'Convenios vigentes', d: 'UNAM, UPV, UNIMAGDALENA, U. del Norte', f: 'Act. Mar 2026' },
      { t: 'Informe ORI 2025', d: 'Movilidad entrante y saliente', f: 'Feb 2026' },
    ],
    anexos: [
      { cat: 'Convenios', items: ['Textos originales de convenios firmados'] },
      { cat: 'Movilidad', items: ['Listado de movilidades 2021–2025'] },
    ],
  },
  {
    n: 6, t: 'Investigación, Innovación y Creación Artística y Cultural', score: 4.4,
    summary: 'Tres grupos categorizados, catorce semilleros, producción indexada y transferencia a comunidades.',
    fortalezas: ['Grupos GITUG (A1), WayuuLab (B) y Caribe.AI (B) activos.', '14 semilleros con resultados verificables.', 'Publicaciones en revistas indexadas Q1–Q3.'],
    oportunidades: ['Fortalecer transferencia a empresas y emprendimientos.', 'Aumentar patentes y registros de software.'],
    caracteristicas: [
      { n: 29, name: 'Formación para la investigación, la creación artística y cultural', score: 4.5, desc: 'Ruta de formación investigativa desde semilleros.' },
      { n: 30, name: 'Compromiso con la investigación y la creación artística y cultural', score: 4.4, desc: 'Política institucional de investigación y asignación presupuestal.' },
    ],
    equipo: [
      { n: 'Dr. Héctor Brito Mendoza', cargo: 'Director GITUG', rol: 'Líder del factor' },
      { n: 'Dr. Samuel Cotes Ramírez', cargo: 'Líder Caribe.AI', rol: 'Análisis producción' },
    ],
    evidencias: [
      { t: 'GrupLac MinCiencias', d: 'Categorización y producción de grupos', f: 'Act. Ene 2026' },
      { t: 'Scopus 2021–2025', d: 'Listado de publicaciones indexadas', f: 'Abr 2026' },
      { t: 'Memorias de semilleros 2024–2025', d: 'Resultados de los 14 semilleros', f: 'Dic 2025' },
    ],
    anexos: [
      { cat: 'Proyectos', items: ['Listado proyectos activos', 'Presupuestos asignados'] },
      { cat: 'Publicaciones', items: ['Artículos Q1–Q3', 'Capítulos de libro'] },
    ],
  },
  {
    n: 7, t: 'Pertinencia e Impacto Social', score: 4.2,
    summary: 'Articulación con el sector externo, proyección social y aporte al desarrollo regional.',
    fortalezas: ['Convenios con alcaldías de La Guajira para transformación digital.', 'Prácticas profesionales con empresas del Cluster TIC Caribe.'],
    oportunidades: ['Sistematizar impactos con indicadores cuantitativos.', 'Ampliar oferta de educación continua.'],
    caracteristicas: [
      { n: 31, name: 'Políticas, referentes y lineamientos institucionales de extensión y proyección social', score: 4.2, desc: 'Política institucional y del programa en proyección social.' },
      { n: 32, name: 'Participación en actividades de extensión y proyección social', score: 4.3, desc: 'Proyectos y actividades con comunidades y sector externo.' },
      { n: 33, name: 'Articulación con el sector externo', score: 4.2, desc: 'Convenios, alianzas y proyectos conjuntos con empresas y gobiernos.' },
    ],
    equipo: [
      { n: 'MSc. Andrea Bolaños Curvelo', cargo: 'Coord. extensión programa', rol: 'Líder del factor' },
    ],
    evidencias: [
      { t: 'Convenios sector TIC 2024-2025', d: 'Cluster TIC Caribe y alcaldías', f: 'Abr 2026' },
      { t: 'Informe prácticas 2025', d: '135 estudiantes en práctica', f: 'Dic 2025' },
    ],
    anexos: [
      { cat: 'Convenios', items: ['Alcaldía de Riohacha', 'Cluster TIC Caribe'] },
      { cat: 'Proyectos', items: ['Proyectos de consultoría 2023–2025'] },
    ],
  },
  {
    n: 8, t: 'Procesos de Autoevaluación y Autorregulación', score: 4.3,
    summary: 'Cultura de autoevaluación consolidada con ciclos periódicos, uso de resultados e integración con planes de mejora.',
    fortalezas: ['Ciclos de autoevaluación 2018, 2022 y 2026.', 'Uso efectivo de resultados en la reforma curricular.'],
    oportunidades: ['Mejorar instrumentos de captura con empleadores.', 'Digitalizar la gestión documental de evidencias.'],
    caracteristicas: [
      { n: 34, name: 'Sistemas de autoevaluación y autorregulación del programa', score: 4.3, desc: 'Procedimientos y herramientas para la autoevaluación periódica.' },
    ],
    equipo: [
      { n: 'Adanud Segundo Meza Valle', cargo: 'Director del programa', rol: 'Líder del factor' },
      { n: 'Dra. Luz Marina Ipuana', cargo: 'Coord. autoevaluación', rol: 'Análisis metodológico' },
    ],
    evidencias: [
      { t: 'Informes autoevaluación 2018 y 2022', d: 'Ciclos previos documentados', f: 'Archivo' },
      { t: 'Plan de mejoramiento 2022–2026', d: 'Ejecución y seguimiento', f: 'Mar 2026' },
    ],
    anexos: [
      { cat: 'Instrumentos', items: ['Encuestas a comunidad académica', 'Guías de entrevista'] },
      { cat: 'Actas', items: ['Actas comité autoevaluación'] },
    ],
  },
  {
    n: 9, t: 'Bienestar Institucional', score: 4.0,
    summary: 'Programas de bienestar, salud, apoyo económico, cultura, deporte y convivencia.',
    fortalezas: ['Servicios de bienestar universitario integrados.', 'Programas de apoyo socioeconómico a estudiantes vulnerables.'],
    oportunidades: ['Ampliar cobertura de salud mental.', 'Fortalecer programas culturales propios del programa.'],
    caracteristicas: [
      { n: 35, name: 'Políticas, programas y servicios de bienestar institucional', score: 4.0, desc: 'Oferta institucional de bienestar disponible para la comunidad del programa.' },
      { n: 36, name: 'Permanencia y retención estudiantil', score: 4.0, desc: 'Estrategias de bienestar que apoyan la permanencia.' },
    ],
    equipo: [
      { n: 'Bienestar Universitario UniGuajira', cargo: 'Dirección', rol: 'Colaboración institucional' },
      { n: 'MSc. Catalina Uriana Iguarán', cargo: 'Docente tiempo completo', rol: 'Enlace con el programa' },
    ],
    evidencias: [
      { t: 'Informe Bienestar Universitario 2025', d: 'Cobertura, programas y resultados', f: 'Mar 2026' },
    ],
    anexos: [
      { cat: 'Programas', items: ['Catálogo de servicios', 'Indicadores de uso'] },
    ],
  },
  {
    n: 10, t: 'Organización, Administración y Gestión', score: 4.3,
    summary: 'Estructura administrativa y financiera al servicio del programa con sistemas de información robustos.',
    fortalezas: ['Dirección del programa con claro liderazgo académico.', 'Sistemas de información institucional integrados.'],
    oportunidades: ['Fortalecer dashboards con información del programa en tiempo real.'],
    caracteristicas: [
      { n: 37, name: 'Organización, administración y gestión del programa', score: 4.3, desc: 'Estructura y capacidad de gestión del programa.' },
      { n: 38, name: 'Sistemas de comunicación e información', score: 4.4, desc: 'Plataformas y canales de comunicación efectivos.' },
      { n: 39, name: 'Dirección del programa', score: 4.3, desc: 'Liderazgo académico y administrativo del programa.' },
    ],
    equipo: [
      { n: 'Adanud Segundo Meza Valle', cargo: 'Director del programa', rol: 'Líder del factor' },
      { n: 'Claudia Mendoza', cargo: 'Secretaria académica', rol: 'Apoyo documental' },
    ],
    evidencias: [
      { t: 'Organigrama del programa', d: 'Estructura académica y administrativa', f: 'Ene 2026' },
      { t: 'Manual de funciones', d: 'Roles y responsabilidades', f: '2024' },
    ],
    anexos: [
      { cat: 'Organización', items: ['Organigrama', 'Manual de procedimientos'] },
    ],
  },
  {
    n: 11, t: 'Planta Física y Recursos de Apoyo Académico', score: 3.9,
    summary: 'Infraestructura, laboratorios, conectividad y recursos bibliográficos adecuados al programa.',
    fortalezas: ['Nuevo laboratorio de ciberseguridad inaugurado en 2025.', 'Conectividad WiFi en todo el bloque 1.', 'Acceso a bases de datos especializadas (IEEE, Scopus).'],
    oportunidades: ['Ampliar laboratorios de cómputo de alto rendimiento.', 'Renovar equipos de laboratorio de redes.'],
    caracteristicas: [
      { n: 40, name: 'Recursos físicos', score: 3.9, desc: 'Aulas, laboratorios, salas de cómputo y espacios comunes.' },
      { n: 41, name: 'Recursos bibliográficos e informáticos', score: 4.0, desc: 'Recursos de apoyo académico disponibles y de uso efectivo.' },
    ],
    equipo: [
      { n: 'Planeación UniGuajira', cargo: 'Oficina de planta física', rol: 'Colaboración institucional' },
      { n: 'MSc. Andrea Bolaños Curvelo', cargo: 'Docente tiempo completo', rol: 'Inventario laboratorios' },
    ],
    evidencias: [
      { t: 'Plan maestro de infraestructura', d: 'Proyección 2024–2030', f: 'Mar 2024' },
      { t: 'Inventario laboratorios IS', d: 'Equipos y software disponibles', f: 'Ene 2026' },
    ],
    anexos: [
      { cat: 'Infraestructura', items: ['Planos del bloque 1', 'Inventario de equipos'] },
    ],
  },
  {
    n: 12, t: 'Recursos Financieros', score: 4.0,
    summary: 'Recursos financieros suficientes, estables y aplicados a las funciones misionales del programa.',
    fortalezas: ['Presupuesto estable para el programa.', 'Crecimiento sostenido de inversión en investigación.'],
    oportunidades: ['Diversificar fuentes de ingresos (consultorías, educación continua).'],
    caracteristicas: [
      { n: 42, name: 'Recursos, gestión y presupuesto del programa', score: 4.0, desc: 'Suficiencia y estabilidad financiera del programa.' },
    ],
    equipo: [
      { n: 'Vicerrectoría administrativa UniGuajira', cargo: 'Dirección financiera', rol: 'Colaboración institucional' },
      { n: 'Adanud Segundo Meza Valle', cargo: 'Director del programa', rol: 'Análisis presupuestal' },
    ],
    evidencias: [
      { t: 'Informe financiero 2025', d: 'Ejecución presupuestal del programa', f: 'Feb 2026' },
      { t: 'Plan de inversión 2024–2028', d: 'Proyección de inversión en IS', f: 'Ene 2024' },
    ],
    anexos: [
      { cat: 'Financiero', items: ['Ejecución 2021–2025', 'Proyección presupuestal 2026–2028'] },
    ],
  },
]

FACTORES.forEach(f => { f.status = statusFromScore(f.score); f.color = STATUS_COLOR[f.status] })

export const EQUIPO_GENERAL = [
  { n: 'Adanud Segundo Meza Valle', cargo: 'Director del programa', rol: 'Liderazgo del proceso de autoevaluación', color: 'var(--ug-azul)' },
  { n: 'Dra. Luz Marina Ipuana', cargo: 'Coordinadora de autoevaluación', rol: 'Articulación metodológica', color: 'var(--ug-amarillo)' },
  { n: 'Dr. Héctor Brito Mendoza', cargo: 'Representante docente', rol: 'Líder factor Profesores', color: 'var(--ug-azul)' },
  { n: 'MSc. Jorge Epieyú Palmar', cargo: 'Representante docente', rol: 'Líder factor Visibilidad', color: 'var(--ug-flamingo)' },
  { n: 'Dr. Samuel Cotes Ramírez', cargo: 'Representante docente', rol: 'Análisis producción investigativa', color: 'var(--ug-amarillo)' },
  { n: 'MSc. Andrea Bolaños Curvelo', cargo: 'Coordinadora extensión', rol: 'Líder factor Pertinencia', color: 'var(--ug-flamingo)' },
  { n: 'Daniela Pushaina', cargo: 'Representante estudiantil', rol: 'Voz estudiantil activa', color: 'var(--ug-azul)' },
  { n: 'Luis Enrique Gutiérrez', cargo: 'Representante estudiantil', rol: 'Apoyo documental', color: 'var(--ug-amarillo)' },
  { n: 'Diana Cotes Brito', cargo: 'Representante egresados', rol: 'Seguimiento a egresados', color: 'var(--ug-flamingo)' },
  { n: 'Claudia Mendoza', cargo: 'Secretaria académica', rol: 'Soporte administrativo', color: 'var(--ug-azul)' },
]

export const EVIDENCIAS_GENERALES = [
  { t: 'Informe de autoevaluación 2022', d: 'Proceso anterior con fines de acreditación inicial', f: '28 jul 2022', size: '12.4 MB' },
  { t: 'Resolución de acreditación 014528', d: 'Acto administrativo vigente del Ministerio de Educación', f: '28 jul 2022', size: '0.8 MB' },
  { t: 'Resolución de registro calificado 02872', d: 'Registro calificado vigente del programa', f: '21 feb 2018', size: '0.6 MB' },
  { t: 'Proyecto Educativo del Programa (PEP)', d: 'Documento rector del programa actualizado', f: 'Oct 2024', size: '4.2 MB' },
  { t: 'Plan de mejoramiento 2022–2026', d: 'Compromisos, metas, indicadores y seguimiento', f: 'Mar 2026', size: '3.1 MB' },
  { t: 'Matriz consolidada de evidencias', d: 'Inventario completo por factor y característica', f: 'Act. Abr 2026', size: '1.8 MB' },
  { t: 'Informe preliminar autoevaluación 2026', d: 'Borrador final para socialización interna', f: 'Mar 2026', size: '18.6 MB' },
  { t: 'Documento maestro del programa', d: 'Información oficial del programa en SACES', f: 'Ene 2026', size: '6.9 MB' },
]
