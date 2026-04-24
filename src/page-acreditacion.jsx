/* Acreditación CNA — 12 factores (Acuerdo 02 de 2020, CESU) */

const { useState: useStateA } = React;

// Status helpers
const STATUS_LABELS = { pleno: "Pleno", alto: "Alto", desarrollo: "En Desarrollo" };
const STATUS_COLOR = {
  pleno: "var(--ug-azul)",
  alto: "var(--ug-amarillo)",
  desarrollo: "var(--ug-flamingo)",
};
const CHAR_JUDGMENTS = [
  "Cumple Plenamente",
  "Cumple en Alto Grado",
  "Cumple Aceptablemente",
  "Cumple Insatisfactoriamente",
  "No Cumple",
];
function judgmentFromScore(s) {
  if (s >= 4.5) return "Cumple Plenamente";
  if (s >= 4.0) return "Cumple en Alto Grado";
  if (s >= 3.0) return "Cumple Aceptablemente";
  if (s >= 2.0) return "Cumple Insatisfactoriamente";
  return "No Cumple";
}
function statusFromScore(s) {
  if (s >= 4.5) return "pleno";
  if (s >= 4.0) return "alto";
  return "desarrollo";
}

// ---- 12 factores exactos del Acuerdo 02 de 2020 ----
const FACTORES = [
  {
    n: 1, t: "Misión y Proyecto Institucional",
    score: 4.6,
    summary: "Coherencia entre el Proyecto Educativo del Programa (PEP) y la Misión institucional de la Universidad de La Guajira.",
    fortalezas: [
      "PEP actualizado y articulado con la misión institucional.",
      "Apropiación de la misión por parte de estudiantes y docentes.",
      "Compromiso explícito con la diversidad étnica y territorial.",
    ],
    oportunidades: [
      "Ampliar la difusión del PEP a egresados y sector externo.",
      "Sistematizar la evaluación periódica del PEP.",
    ],
    caracteristicas: [
      { n: 1, name: "Misión, visión y Proyecto Institucional", score: 4.7, desc: "Coherencia y apropiación de la misión institucional por parte de la comunidad académica del programa." },
      { n: 2, name: "Proyecto Educativo del Programa (PEP)", score: 4.5, desc: "Pertinencia del PEP frente a las necesidades del contexto y articulación con el PEI." },
      { n: 3, name: "Relevancia académica y pertinencia social del programa", score: 4.6, desc: "Impacto del programa en la región y coherencia con la demanda del sector TIC del Caribe." },
    ],
    equipo: [
      { n: "Adanud Segundo Meza Valle", cargo: "Director del programa", rol: "Líder del factor" },
      { n: "MSc. Jorge Epieyú Palmar", cargo: "Docente tiempo completo", rol: "Análisis PEP" },
      { n: "Luis Enrique Gutiérrez", cargo: "Representante estudiantil", rol: "Apoyo documental" },
    ],
    evidencias: [
      { t: "PEI 2020–2030 UniGuajira", d: "Proyecto Educativo Institucional vigente", f: "Mar 2025" },
      { t: "PEP Ingeniería de Sistemas 2024", d: "Proyecto Educativo del Programa actualizado", f: "Oct 2024" },
      { t: "Acta Consejo Académico 045", d: "Aprobación de ajustes al PEP", f: "Ago 2024" },
    ],
    anexos: [
      { cat: "Normativa", items: ["Acuerdo de aprobación del PEI", "Resolución rectoral adopción PEP"] },
      { cat: "Encuestas", items: ["Encuesta de apropiación PEP 2025"] },
    ],
  },
  {
    n: 2, t: "Estudiantes",
    score: 4.5,
    summary: "Políticas de admisión, permanencia, participación y reglamento estudiantil pertinentes y conocidas por la comunidad.",
    fortalezas: [
      "Reglamento estudiantil vigente y socializado.",
      "Políticas diferenciales para estudiantes wayuu y afrodescendientes.",
      "Tasa de permanencia superior al promedio nacional.",
    ],
    oportunidades: [
      "Fortalecer tutorías académicas en primer semestre.",
      "Ampliar participación estudiantil en órganos colegiados.",
    ],
    caracteristicas: [
      { n: 4, name: "Mecanismos de selección e ingreso", score: 4.5, desc: "Procesos transparentes, con criterios diferenciales para pueblos indígenas y comunidades vulnerables." },
      { n: 5, name: "Estudiantes admitidos y capacidad institucional", score: 4.4, desc: "Relación entre cupos, demanda y capacidad de atención del programa." },
      { n: 6, name: "Permanencia y graduación estudiantil", score: 4.5, desc: "Estrategias efectivas de acompañamiento y reducción de deserción." },
      { n: 7, name: "Participación en actividades de formación integral", score: 4.3, desc: "Vinculación estudiantil a semilleros, cultura, deporte y bienestar." },
      { n: 8, name: "Reglamentos estudiantil y académico", score: 4.6, desc: "Socialización, aplicación y actualización del reglamento estudiantil." },
    ],
    equipo: [
      { n: "Adanud Segundo Meza Valle", cargo: "Director del programa", rol: "Líder del factor" },
      { n: "MSc. Catalina Uriana Iguarán", cargo: "Docente tiempo completo", rol: "Análisis permanencia" },
      { n: "Daniela Pushaina", cargo: "Representante estudiantil", rol: "Grupos focales" },
    ],
    evidencias: [
      { t: "Acuerdo 018 de 2021 — Reglamento estudiantil", d: "Reglamento vigente", f: "Jun 2021" },
      { t: "Informe SPADIES 2025", d: "Indicadores de deserción y permanencia", f: "Feb 2025" },
      { t: "Encuesta de bienestar estudiantil 2025", d: "Resultados y análisis", f: "Nov 2025" },
    ],
    anexos: [
      { cat: "Estadísticas", items: ["Matriz de admisiones 2018–2025", "Tasas de permanencia por cohorte"] },
      { cat: "Actas", items: ["Actas del comité curricular", "Actas representación estudiantil"] },
    ],
  },
  {
    n: 3, t: "Profesores",
    score: 4.4,
    summary: "Planta docente cualificada con carrera, dedicación y producción académica consistente con las exigencias del programa.",
    fortalezas: [
      "Planta con 9 doctores y 17 magísteres activos.",
      "Plan de desarrollo profesoral 2024–2028 en ejecución.",
      "Vinculación creciente con redes académicas internacionales.",
    ],
    oportunidades: [
      "Incrementar la producción indexada Q1/Q2.",
      "Fortalecer la formación en pedagogía universitaria.",
    ],
    caracteristicas: [
      { n: 9, name: "Selección, vinculación y permanencia de profesores", score: 4.5, desc: "Procesos rigurosos de selección docente y políticas de permanencia." },
      { n: 10, name: "Estatuto profesoral", score: 4.5, desc: "Estatuto vigente, aplicado y socializado entre los docentes del programa." },
      { n: 11, name: "Número, dedicación, nivel de formación y experiencia", score: 4.3, desc: "Planta suficiente en número, nivel formativo y tiempos de dedicación." },
      { n: 12, name: "Desarrollo profesoral", score: 4.2, desc: "Programas institucionales de capacitación, actualización y formación avanzada." },
      { n: 13, name: "Estímulos a la docencia, investigación, creación e innovación", score: 4.4, desc: "Sistema de estímulos académicos y reconocimiento a la producción." },
      { n: 14, name: "Producción de materiales académicos", score: 4.3, desc: "Publicación de libros, artículos, ponencias y material didáctico." },
      { n: 15, name: "Remuneración por méritos", score: 4.5, desc: "Política salarial que reconoce formación, categoría y productividad." },
    ],
    equipo: [
      { n: "Dr. Héctor Brito Mendoza", cargo: "Investigador principal GITUG", rol: "Líder del factor" },
      { n: "MSc. Andrea Bolaños Curvelo", cargo: "Docente tiempo completo", rol: "Análisis de dedicación" },
      { n: "Claudia Mendoza", cargo: "Secretaria académica", rol: "Apoyo documental" },
    ],
    evidencias: [
      { t: "Estatuto profesoral UniGuajira", d: "Normativa de carrera docente", f: "2019" },
      { t: "GrupLac y CvLac de la planta", d: "Hojas de vida registradas en MinCiencias", f: "Act. Abr 2026" },
      { t: "Plan de desarrollo profesoral 2024–2028", d: "Ruta de formación docente", f: "Ene 2024" },
    ],
    anexos: [
      { cat: "Planta", items: ["Listado completo planta docente", "Dedicación y categorías"] },
      { cat: "Producción", items: ["Publicaciones 2021–2025", "Ponencias nacionales e internacionales"] },
    ],
  },
  {
    n: 4, t: "Procesos Académicos",
    score: 4.5,
    summary: "Currículo pertinente, con flexibilidad, interdisciplinariedad y relación con la investigación.",
    fortalezas: [
      "Reforma curricular 2024 aprobada e implementada.",
      "Electivas de profundización alineadas con el ecosistema TIC del Caribe.",
      "Matriz de competencias mapeada a resultados de aprendizaje.",
    ],
    oportunidades: [
      "Ampliar electivas interdisciplinares con otros programas.",
      "Fortalecer evaluación por competencias.",
    ],
    caracteristicas: [
      { n: 16, name: "Integralidad del currículo", score: 4.6, desc: "Formación integral articulando fundamentación, profundización, flexibilidad y contexto." },
      { n: 17, name: "Flexibilidad del currículo", score: 4.4, desc: "Electivas, movilidad, reconocimiento y homologación de créditos." },
      { n: 18, name: "Interdisciplinariedad", score: 4.3, desc: "Articulación entre áreas y con otros programas de la Universidad." },
      { n: 19, name: "Metodologías de enseñanza-aprendizaje", score: 4.5, desc: "Estrategias pedagógicas activas centradas en el estudiante." },
      { n: 20, name: "Sistema de evaluación de estudiantes", score: 4.5, desc: "Evaluación formativa, sumativa y por competencias." },
      { n: 21, name: "Trabajos de los estudiantes", score: 4.6, desc: "Pertinencia y calidad de los trabajos académicos y de grado." },
      { n: 22, name: "Evaluación y autorregulación del programa", score: 4.4, desc: "Procesos permanentes de evaluación curricular y mejora." },
      { n: 23, name: "Extensión o proyección social", score: 4.3, desc: "Articulación del currículo con proyectos de proyección social." },
      { n: 24, name: "Recursos bibliográficos", score: 4.5, desc: "Acceso y uso de recursos bibliográficos especializados." },
      { n: 25, name: "Recursos informáticos y de comunicación", score: 4.6, desc: "Infraestructura TIC, plataformas y laboratorios disponibles." },
      { n: 26, name: "Recursos de apoyo docente", score: 4.5, desc: "Apoyos institucionales para la labor docente y la investigación." },
    ],
    equipo: [
      { n: "Dra. Luz Marina Ipuana", cargo: "Coord. curricular", rol: "Líder del factor" },
      { n: "Dr. Pablo Mengual Solano", cargo: "Docente tiempo completo", rol: "Análisis currículo" },
      { n: "MSc. Nayely Uriana Jayariyú", cargo: "Docente tiempo completo", rol: "Análisis metodologías" },
    ],
    evidencias: [
      { t: "Microcurrículos actualizados 2025", d: "50 cursos con syllabus vigente", f: "Feb 2025" },
      { t: "Matriz de competencias del programa", d: "Competencias y resultados de aprendizaje", f: "Oct 2024" },
      { t: "Informe de reforma curricular", d: "Análisis, propuesta y aprobación", f: "Ago 2024" },
    ],
    anexos: [
      { cat: "Currículo", items: ["Malla curricular 169 cr", "Reglamento de opciones de grado"] },
      { cat: "Evaluaciones", items: ["Encuestas de curso 2023–2025"] },
    ],
  },
  {
    n: 5, t: "Visibilidad Nacional e Internacional",
    score: 4.1,
    summary: "Inserción en redes académicas y científicas, movilidad entrante y saliente, y referentes externos reconocidos.",
    fortalezas: [
      "Convenios activos con UNAM (México) y UPV (España).",
      "Participación en la Red Colombiana de Ingeniería de Sistemas.",
    ],
    oportunidades: [
      "Incrementar movilidad saliente estudiantil.",
      "Atraer profesores visitantes extranjeros.",
    ],
    caracteristicas: [
      { n: 27, name: "Inserción del programa en contextos académicos nacionales e internacionales", score: 4.0, desc: "Presencia del programa en redes, eventos y espacios académicos." },
      { n: 28, name: "Relaciones externas de profesores y estudiantes", score: 4.1, desc: "Movilidad, ponencias, publicaciones en coautoría internacional." },
    ],
    equipo: [
      { n: "Dra. Luz Marina Ipuana", cargo: "Líder ORI programa", rol: "Líder del factor" },
      { n: "MSc. Jorge Epieyú Palmar", cargo: "Docente tiempo completo", rol: "Gestión convenios" },
    ],
    evidencias: [
      { t: "Convenios vigentes", d: "UNAM, UPV, UNIMAGDALENA, U. del Norte", f: "Act. Mar 2026" },
      { t: "Informe ORI 2025", d: "Movilidad entrante y saliente", f: "Feb 2026" },
    ],
    anexos: [
      { cat: "Convenios", items: ["Textos originales de convenios firmados"] },
      { cat: "Movilidad", items: ["Listado de movilidades 2021–2025"] },
    ],
  },
  {
    n: 6, t: "Investigación, Innovación y Creación Artística y Cultural",
    score: 4.4,
    summary: "Tres grupos categorizados, catorce semilleros, producción indexada y transferencia a comunidades.",
    fortalezas: [
      "Grupos GITUG (A1), WayuuLab (B) y Caribe.AI (B) activos.",
      "14 semilleros con resultados verificables.",
      "Publicaciones en revistas indexadas Q1–Q3.",
    ],
    oportunidades: [
      "Fortalecer transferencia a empresas y emprendimientos.",
      "Aumentar patentes y registros de software.",
    ],
    caracteristicas: [
      { n: 29, name: "Formación para la investigación, la creación artística y cultural", score: 4.5, desc: "Ruta de formación investigativa desde semilleros." },
      { n: 30, name: "Compromiso con la investigación y la creación artística y cultural", score: 4.4, desc: "Política institucional de investigación y asignación presupuestal." },
    ],
    equipo: [
      { n: "Dr. Héctor Brito Mendoza", cargo: "Director GITUG", rol: "Líder del factor" },
      { n: "Dr. Samuel Cotes Ramírez", cargo: "Líder Caribe.AI", rol: "Análisis producción" },
    ],
    evidencias: [
      { t: "GrupLac MinCiencias", d: "Categorización y producción de grupos", f: "Act. Ene 2026" },
      { t: "Scopus 2021–2025", d: "Listado de publicaciones indexadas", f: "Abr 2026" },
      { t: "Memorias de semilleros 2024–2025", d: "Resultados de los 14 semilleros", f: "Dic 2025" },
    ],
    anexos: [
      { cat: "Proyectos", items: ["Listado proyectos activos", "Presupuestos asignados"] },
      { cat: "Publicaciones", items: ["Artículos Q1–Q3", "Capítulos de libro"] },
    ],
  },
  {
    n: 7, t: "Pertinencia e Impacto Social",
    score: 4.2,
    summary: "Articulación con el sector externo, proyección social y aporte al desarrollo regional.",
    fortalezas: [
      "Convenios con alcaldías de La Guajira para transformación digital.",
      "Prácticas profesionales con empresas del Cluster TIC Caribe.",
    ],
    oportunidades: [
      "Sistematizar impactos con indicadores cuantitativos.",
      "Ampliar oferta de educación continua.",
    ],
    caracteristicas: [
      { n: 31, name: "Políticas, referentes y lineamientos institucionales de extensión y proyección social", score: 4.2, desc: "Política institucional y del programa en proyección social." },
      { n: 32, name: "Participación en actividades de extensión y proyección social", score: 4.3, desc: "Proyectos y actividades con comunidades y sector externo." },
      { n: 33, name: "Articulación con el sector externo", score: 4.2, desc: "Convenios, alianzas y proyectos conjuntos con empresas y gobiernos." },
    ],
    equipo: [
      { n: "MSc. Andrea Bolaños Curvelo", cargo: "Coord. extensión programa", rol: "Líder del factor" },
    ],
    evidencias: [
      { t: "Convenios sector TIC 2024-2025", d: "Cluster TIC Caribe y alcaldías", f: "Abr 2026" },
      { t: "Informe prácticas 2025", d: "135 estudiantes en práctica", f: "Dic 2025" },
    ],
    anexos: [
      { cat: "Convenios", items: ["Alcaldía de Riohacha", "Cluster TIC Caribe"] },
      { cat: "Proyectos", items: ["Proyectos de consultoría 2023–2025"] },
    ],
  },
  {
    n: 8, t: "Procesos de Autoevaluación y Autorregulación",
    score: 4.3,
    summary: "Cultura de autoevaluación consolidada con ciclos periódicos, uso de resultados e integración con planes de mejora.",
    fortalezas: [
      "Ciclos de autoevaluación 2018, 2022 y 2026.",
      "Uso efectivo de resultados en la reforma curricular.",
    ],
    oportunidades: [
      "Mejorar instrumentos de captura con empleadores.",
      "Digitalizar la gestión documental de evidencias.",
    ],
    caracteristicas: [
      { n: 34, name: "Sistemas de autoevaluación y autorregulación del programa", score: 4.3, desc: "Procedimientos y herramientas para la autoevaluación periódica." },
    ],
    equipo: [
      { n: "Adanud Segundo Meza Valle", cargo: "Director del programa", rol: "Líder del factor" },
      { n: "Dra. Luz Marina Ipuana", cargo: "Coord. autoevaluación", rol: "Análisis metodológico" },
    ],
    evidencias: [
      { t: "Informes autoevaluación 2018 y 2022", d: "Ciclos previos documentados", f: "Archivo" },
      { t: "Plan de mejoramiento 2022–2026", d: "Ejecución y seguimiento", f: "Mar 2026" },
    ],
    anexos: [
      { cat: "Instrumentos", items: ["Encuestas a comunidad académica", "Guías de entrevista"] },
      { cat: "Actas", items: ["Actas comité autoevaluación"] },
    ],
  },
  {
    n: 9, t: "Bienestar Institucional",
    score: 4.0,
    summary: "Programas de bienestar, salud, apoyo económico, cultura, deporte y convivencia.",
    fortalezas: [
      "Servicios de bienestar universitario integrados.",
      "Programas de apoyo socioeconómico a estudiantes vulnerables.",
    ],
    oportunidades: [
      "Ampliar cobertura de salud mental.",
      "Fortalecer programas culturales propios del programa.",
    ],
    caracteristicas: [
      { n: 35, name: "Políticas, programas y servicios de bienestar institucional", score: 4.0, desc: "Oferta institucional de bienestar disponible para la comunidad del programa." },
      { n: 36, name: "Permanencia y retención estudiantil", score: 4.0, desc: "Estrategias de bienestar que apoyan la permanencia." },
    ],
    equipo: [
      { n: "Bienestar Universitario UniGuajira", cargo: "Dirección", rol: "Colaboración institucional" },
      { n: "MSc. Catalina Uriana Iguarán", cargo: "Docente tiempo completo", rol: "Enlace con el programa" },
    ],
    evidencias: [
      { t: "Informe Bienestar Universitario 2025", d: "Cobertura, programas y resultados", f: "Mar 2026" },
    ],
    anexos: [
      { cat: "Programas", items: ["Catálogo de servicios", "Indicadores de uso"] },
    ],
  },
  {
    n: 10, t: "Organización, Administración y Gestión",
    score: 4.3,
    summary: "Estructura administrativa y financiera al servicio del programa con sistemas de información robustos.",
    fortalezas: [
      "Dirección del programa con claro liderazgo académico.",
      "Sistemas de información institucional integrados.",
    ],
    oportunidades: [
      "Fortalecer dashboards con información del programa en tiempo real.",
    ],
    caracteristicas: [
      { n: 37, name: "Organización, administración y gestión del programa", score: 4.3, desc: "Estructura y capacidad de gestión del programa." },
      { n: 38, name: "Sistemas de comunicación e información", score: 4.4, desc: "Plataformas y canales de comunicación efectivos." },
      { n: 39, name: "Dirección del programa", score: 4.3, desc: "Liderazgo académico y administrativo del programa." },
    ],
    equipo: [
      { n: "Adanud Segundo Meza Valle", cargo: "Director del programa", rol: "Líder del factor" },
      { n: "Claudia Mendoza", cargo: "Secretaria académica", rol: "Apoyo documental" },
    ],
    evidencias: [
      { t: "Organigrama del programa", d: "Estructura académica y administrativa", f: "Ene 2026" },
      { t: "Manual de funciones", d: "Roles y responsabilidades", f: "2024" },
    ],
    anexos: [
      { cat: "Organización", items: ["Organigrama", "Manual de procedimientos"] },
    ],
  },
  {
    n: 11, t: "Planta Física y Recursos de Apoyo Académico",
    score: 3.9,
    summary: "Infraestructura, laboratorios, conectividad y recursos bibliográficos adecuados al programa.",
    fortalezas: [
      "Nuevo laboratorio de ciberseguridad inaugurado en 2025.",
      "Conectividad WiFi en todo el bloque 1.",
      "Acceso a bases de datos especializadas (IEEE, Scopus).",
    ],
    oportunidades: [
      "Ampliar laboratorios de cómputo de alto rendimiento.",
      "Renovar equipos de laboratorio de redes.",
    ],
    caracteristicas: [
      { n: 40, name: "Recursos físicos", score: 3.9, desc: "Aulas, laboratorios, salas de cómputo y espacios comunes." },
      { n: 41, name: "Recursos bibliográficos e informáticos", score: 4.0, desc: "Recursos de apoyo académico disponibles y de uso efectivo." },
    ],
    equipo: [
      { n: "Planeación UniGuajira", cargo: "Oficina de planta física", rol: "Colaboración institucional" },
      { n: "MSc. Andrea Bolaños Curvelo", cargo: "Docente tiempo completo", rol: "Inventario laboratorios" },
    ],
    evidencias: [
      { t: "Plan maestro de infraestructura", d: "Proyección 2024–2030", f: "Mar 2024" },
      { t: "Inventario laboratorios IS", d: "Equipos y software disponibles", f: "Ene 2026" },
    ],
    anexos: [
      { cat: "Infraestructura", items: ["Planos del bloque 1", "Inventario de equipos"] },
    ],
  },
  {
    n: 12, t: "Recursos Financieros",
    score: 4.0,
    summary: "Recursos financieros suficientes, estables y aplicados a las funciones misionales del programa.",
    fortalezas: [
      "Presupuesto estable para el programa.",
      "Crecimiento sostenido de inversión en investigación.",
    ],
    oportunidades: [
      "Diversificar fuentes de ingresos (consultorías, educación continua).",
    ],
    caracteristicas: [
      { n: 42, name: "Recursos, gestión y presupuesto del programa", score: 4.0, desc: "Suficiencia y estabilidad financiera del programa." },
    ],
    equipo: [
      { n: "Vicerrectoría administrativa UniGuajira", cargo: "Dirección financiera", rol: "Colaboración institucional" },
      { n: "Adanud Segundo Meza Valle", cargo: "Director del programa", rol: "Análisis presupuestal" },
    ],
    evidencias: [
      { t: "Informe financiero 2025", d: "Ejecución presupuestal del programa", f: "Feb 2026" },
      { t: "Plan de inversión 2024–2028", d: "Proyección de inversión en IS", f: "Ene 2024" },
    ],
    anexos: [
      { cat: "Financiero", items: ["Ejecución 2021–2025", "Proyección presupuestal 2026–2028"] },
    ],
  },
];

// ---- Derived ----
FACTORES.forEach(f => { f.status = statusFromScore(f.score); f.color = STATUS_COLOR[f.status]; });

// ---- CircularProgress ----
function CircularProgress({ value, size = 220, stroke = 14, label = "PROMEDIO · ESCALA 1.0–5.0" }) {
  const r = (size - stroke) / 2;
  const cir = 2 * Math.PI * r;
  const off = cir - (value / 5) * cir;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id={`cna-g-${size}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--ug-amarillo)"/>
          <stop offset="50%" stopColor="var(--ug-flamingo)"/>
          <stop offset="100%" stopColor="var(--ug-azul)"/>
        </linearGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="color-mix(in oklab, var(--ink) 10%, transparent)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`url(#cna-g-${size})`} strokeWidth={stroke} strokeLinecap="round"
              strokeDasharray={cir} strokeDashoffset={off}
              transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x="50%" y="48%" textAnchor="middle" fontFamily="var(--font-display)" fontSize={size * 0.25} fontWeight="500" fill="var(--ink)">
        {value.toFixed(1)}
      </text>
      <text x="50%" y="62%" textAnchor="middle" fontFamily="var(--font-mono)" fontSize={size * 0.05} letterSpacing="0.2em" fill="var(--ink-3)">
        {label}
      </text>
    </svg>
  );
}

// ---- Main Acreditación (tablero) ----
function Acreditacion() {
  const { route, go } = useRoute();

  // If on factor page, render FactorPage
  if (route.startsWith("factor-")) {
    const n = parseInt(route.split("-")[1], 10);
    const f = FACTORES.find(x => x.n === n);
    if (f) return <FactorPage factor={f} />;
  }

  const [filter, setFilter] = useStateA("all");
  const prom = (FACTORES.reduce((a,f)=>a+f.score,0) / FACTORES.length);
  const stats = FACTORES.reduce((a,f)=>{ a[f.status] = (a[f.status]||0)+1; return a; }, {});

  return (
    <div className="page-in">
      <section className="cna-hero">
        <WayuuBackdrop variant="a" />
        <div className="cna-hero-inner" style={{ position: "relative", zIndex: 2 }}>
          <div>
            <div className="hero-eyebrow-row">
              <span className="chip" style={{ background: "var(--ug-flamingo)", color: "var(--paper)", borderColor: "transparent" }}>● Autoevaluación 2026</span>
              <span className="chip">Acuerdo 02 de 2020 CESU</span>
              <span className="chip">CNA · Consejo Nacional de Acreditación</span>
            </div>
            <h1 style={{ marginTop: 24 }}>Acreditación<br/>de alta calidad<br/><em style={{ color: "var(--accent-deep)", fontStyle: "normal" }}>en 12 factores.</em></h1>
            <p className="lede" style={{ marginTop: 24 }}>
              Tablero de autoevaluación del programa frente a los doce factores del Acuerdo 02 de 2020. Cada tarjeta abre una página dedicada con características, evidencias, fortalezas, oportunidades de mejora y equipo responsable.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
              <button className="btn"><I.download /> Informe de autoevaluación</button>
              <button className="btn ghost"><I.external /> Plan de mejoramiento</button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <CircularProgress value={prom} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, width: "100%", maxWidth: 320 }}>
              <div style={{ textAlign: "center", padding: "10px 4px", background: "color-mix(in oklab, var(--ug-azul) 25%, transparent)", borderRadius: 8 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 26 }}>{stats.pleno || 0}</div>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-2)" }}>Pleno</div>
              </div>
              <div style={{ textAlign: "center", padding: "10px 4px", background: "color-mix(in oklab, var(--ug-amarillo) 25%, transparent)", borderRadius: 8 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 26 }}>{stats.alto || 0}</div>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-2)" }}>Alto</div>
              </div>
              <div style={{ textAlign: "center", padding: "10px 4px", background: "color-mix(in oklab, var(--ug-flamingo) 25%, transparent)", borderRadius: 8 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 26 }}>{stats.desarrollo || 0}</div>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-2)" }}>Desarrollo</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 60 }}>
        <div className="inner">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 20, marginBottom: 32, flexWrap: "wrap" }}>
            <div>
              <div className="eyebrow">Los doce factores · Acuerdo 02 de 2020</div>
              <h2 style={{ marginTop: 10 }}>Abrí un factor para ver detalle completo.</h2>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[{k:"all",l:"Todos"},{k:"pleno",l:"Pleno"},{k:"alto",l:"Alto"},{k:"desarrollo",l:"Desarrollo"}].map(f => (
                <button key={f.k} className="chip" onClick={()=>setFilter(f.k)}
                  style={{ cursor: "pointer",
                    background: filter===f.k ? "var(--ink)" : undefined,
                    color: filter===f.k ? "var(--paper)" : undefined,
                    borderColor: filter===f.k ? "var(--ink)" : undefined,
                  }}>{f.l}</button>
              ))}
            </div>
          </div>

          <div className="factor-grid">
            {FACTORES.map((f) => {
              const hidden = filter !== "all" && f.status !== filter;
              return (
                <button key={f.n} className="factor-card" data-status={f.status}
                  style={{ opacity: hidden ? 0.28 : 1 }}
                  onClick={()=>go(`factor-${f.n}`)}>
                  <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between" }}>
                    <div className="n">Factor {String(f.n).padStart(2,'0')}</div>
                  </div>
                  <div className="factor-pill">{STATUS_LABELS[f.status]}</div>
                  <div className="title">{f.t}</div>
                  <div className="score"><span>Calificación</span><b>{f.score.toFixed(1)}</b></div>
                  <div className="meter"><i style={{ width: `${(f.score/5)*100}%` }} /></div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <MetodologiaSection />
      <EquipoTrabajoSection />
      <EvidenciasGeneralesSection />

      <section className="section" style={{ background: "var(--paper-2)" }}>
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Ruta de acreditación</div>
              <h2>Cronograma del proceso.</h2>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            {[
              { d: "Jun 2024", t: "Designación del comité de autoevaluación", s: "done" },
              { d: "Oct 2024", t: "Definición de instrumentos y ponderaciones", s: "done" },
              { d: "Feb – Oct 2025", t: "Recolección y análisis de información", s: "done" },
              { d: "Mar 2026", t: "Redacción informe de autoevaluación", s: "current" },
              { d: "Jul 2026", t: "Radicación ante el CNA (renovación)", s: "next" },
              { d: "2027", t: "Visita de pares académicos", s: "next" },
              { d: "2027", t: "Resolución de renovación de acreditación", s: "next" },
            ].map((step, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "40px 180px 1fr", gap: 20, alignItems: "center", padding: "16px 0", position: "relative" }}>
                <div style={{ width: 34, height: 34, borderRadius: 999,
                  background: step.s === "done" ? "var(--ug-azul)" : step.s === "current" ? "var(--ug-amarillo)" : "var(--paper)",
                  border: "2px solid " + (step.s === "next" ? "color-mix(in oklab, var(--ink) 20%, transparent)" : "transparent"),
                  display: "grid", placeItems: "center", color: "var(--ug-negro)", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700 }}>
                  {step.s === "done" ? "✓" : step.s === "current" ? "●" : i+1}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: ".1em", color: "var(--ink-3)", textTransform: "uppercase" }}>{step.d}</div>
                <div style={{ fontSize: 18, fontWeight: step.s === "current" ? 600 : 500 }}>{step.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ---- Metodología de autoevaluación ----
function MetodologiaSection() {
  return (
    <section className="section" id="metodologia" style={{ background: "var(--paper-2)" }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Metodología de autoevaluación</div>
            <h2>Cómo construimos este tablero.</h2>
          </div>
          <p className="desc">Proceso participativo basado en el Acuerdo 02 de 2020 (CESU) y en los lineamientos del CNA, con instrumentos cuantitativos y cualitativos aplicados a toda la comunidad académica.</p>
        </div>

        <div className="grid-2">
          <div className="card" style={{ background: "var(--paper)" }}>
            <div className="eyebrow" style={{ color: "var(--ug-azul-deep)" }}>● Instrumentos utilizados</div>
            <ul style={{ listStyle: "none", padding: 0, margin: "18px 0 0", display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                ["Encuestas estructuradas", "Aplicadas a estudiantes, docentes, egresados, empleadores y directivos."],
                ["Entrevistas semi-estructuradas", "A directivos académicos, líderes de grupos y coordinadores."],
                ["Grupos focales", "Por estamento y por cohorte (primíparos, intermedios, próximos a graduar)."],
                ["Análisis documental", "Revisión sistemática de normativa, actas, informes y evidencias."],
                ["Análisis estadístico", "Indicadores SPADIES, SACES, OLE y sistemas institucionales."],
              ].map(([k, v], i) => (
                <li key={i} style={{ paddingBottom: 12, borderBottom: "1px solid color-mix(in oklab, var(--ink) 7%, transparent)" }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{k}</div>
                  <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 4 }}>{v}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="card" style={{ background: "var(--paper)" }}>
            <div className="eyebrow" style={{ color: "var(--ug-flamingo-deep)" }}>● Fuentes consultadas</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>
              {[
                { n: "412", l: "estudiantes encuestados" },
                { n: "48", l: "docentes consultados" },
                { n: "186", l: "egresados contactados" },
                { n: "32", l: "empleadores entrevistados" },
                { n: "14", l: "directivos participantes" },
                { n: "9", l: "grupos focales" },
              ].map((s, i) => (
                <div key={i} style={{ padding: 14, background: "var(--paper-2)", borderRadius: 10 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 30, letterSpacing: "-0.02em", color: "var(--accent-deep)" }}>{s.n}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <div className="card" style={{ background: "var(--paper)" }}>
            <div className="eyebrow" style={{ color: "var(--ug-amarillo-deep)" }}>● Escala de valoración y ponderación</div>
            <p style={{ fontSize: 15, color: "var(--ink-2)", marginTop: 14, marginBottom: 20 }}>
              Cada característica se evalúa en escala de <b>1.0 a 5.0</b>. El puntaje global del factor es el promedio ponderado de sus características, y el puntaje del programa es el promedio ponderado de los doce factores.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              {[
                { r: "4.5 – 5.0", j: "Cumple Plenamente", c: "var(--ug-azul)" },
                { r: "4.0 – 4.49", j: "Cumple en Alto Grado", c: "var(--ug-amarillo)" },
                { r: "3.0 – 3.99", j: "Cumple Aceptablemente", c: "var(--ug-amarillo-soft)" },
                { r: "2.0 – 2.99", j: "Cumple Insatisfactoriamente", c: "var(--ug-flamingo-soft)" },
                { r: "1.0 – 1.99", j: "No Cumple", c: "var(--ug-flamingo)" },
              ].map((x, i) => (
                <div key={i} style={{ padding: 14, borderRadius: 10, background: x.c, color: "var(--ug-negro)" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".1em" }}>{x.r}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6 }}>{x.j}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
              {FACTORES.map(f => (
                <div key={f.n} style={{ padding: 10, background: "var(--paper-2)", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-3)" }}>F{String(f.n).padStart(2,'0')}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{(100/FACTORES.length).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- Equipo de trabajo ----
const EQUIPO_GENERAL = [
  { n: "Adanud Segundo Meza Valle", cargo: "Director del programa", rol: "Liderazgo del proceso de autoevaluación", color: "var(--ug-azul)" },
  { n: "Dra. Luz Marina Ipuana", cargo: "Coordinadora de autoevaluación", rol: "Articulación metodológica", color: "var(--ug-amarillo)" },
  { n: "Dr. Héctor Brito Mendoza", cargo: "Representante docente", rol: "Líder factor Profesores", color: "var(--ug-azul)" },
  { n: "MSc. Jorge Epieyú Palmar", cargo: "Representante docente", rol: "Líder factor Visibilidad", color: "var(--ug-flamingo)" },
  { n: "Dr. Samuel Cotes Ramírez", cargo: "Representante docente", rol: "Análisis producción investigativa", color: "var(--ug-amarillo)" },
  { n: "MSc. Andrea Bolaños Curvelo", cargo: "Coordinadora extensión", rol: "Líder factor Pertinencia", color: "var(--ug-flamingo)" },
  { n: "Daniela Pushaina", cargo: "Representante estudiantil", rol: "Voz estudiantil activa", color: "var(--ug-azul)" },
  { n: "Luis Enrique Gutiérrez", cargo: "Representante estudiantil", rol: "Apoyo documental", color: "var(--ug-amarillo)" },
  { n: "Diana Cotes Brito", cargo: "Representante egresados", rol: "Seguimiento a egresados", color: "var(--ug-flamingo)" },
  { n: "Claudia Mendoza", cargo: "Secretaria académica", rol: "Soporte administrativo", color: "var(--ug-azul)" },
];

function EquipoTrabajoSection() {
  return (
    <section className="section" id="equipo">
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Equipo de trabajo</div>
            <h2>Quienes llevan adelante el proceso.</h2>
          </div>
          <p className="desc">Comité de autoevaluación conformado por la dirección, representantes docentes por factor, estudiantes, egresados y personal administrativo de apoyo.</p>
        </div>
        <div className="grid-4">
          {EQUIPO_GENERAL.map((p, i) => (
            <div key={i} className="card" style={{ padding: 0, overflow: "hidden", background: "var(--paper)" }}>
              <div style={{ aspectRatio: "1/1", background: p.color, position: "relative", display: "grid", placeItems: "center" }}>
                <WayuuBackdrop variant="a" />
                <div style={{ position: "relative", fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 600, color: "var(--ug-negro)", letterSpacing: "-0.02em" }}>
                  {p.n.split(" ").map(w => w[0]).filter(c => /[A-ZÁÉÍÓÚ]/.test(c)).slice(0,2).join("")}
                </div>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--ink-3)" }}>{p.cargo}</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, marginTop: 6, letterSpacing: "-0.01em" }}>{p.n}</div>
                <div className="rule" style={{ margin: "12px 0 10px" }} />
                <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>{p.rol}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Evidencias y anexos generales ----
const EVIDENCIAS_GENERALES = [
  { t: "Informe de autoevaluación 2022", d: "Proceso anterior con fines de acreditación inicial", f: "28 jul 2022", size: "12.4 MB" },
  { t: "Resolución de acreditación 014528", d: "Acto administrativo vigente del Ministerio de Educación", f: "28 jul 2022", size: "0.8 MB" },
  { t: "Resolución de registro calificado 02872", d: "Registro calificado vigente del programa", f: "21 feb 2018", size: "0.6 MB" },
  { t: "Proyecto Educativo del Programa (PEP)", d: "Documento rector del programa actualizado", f: "Oct 2024", size: "4.2 MB" },
  { t: "Plan de mejoramiento 2022–2026", d: "Compromisos, metas, indicadores y seguimiento", f: "Mar 2026", size: "3.1 MB" },
  { t: "Matriz consolidada de evidencias", d: "Inventario completo por factor y característica", f: "Act. Abr 2026", size: "1.8 MB" },
  { t: "Informe preliminar autoevaluación 2026", d: "Borrador final para socialización interna", f: "Mar 2026", size: "18.6 MB" },
  { t: "Documento maestro del programa", d: "Información oficial del programa en SACES", f: "Ene 2026", size: "6.9 MB" },
];

function EvidenciasGeneralesSection() {
  return (
    <section className="section" id="evidencias-generales" style={{ background: "var(--paper-2)" }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Evidencias y anexos generales</div>
            <h2>Documentos centrales del proceso.</h2>
          </div>
          <p className="desc">Documentación oficial disponible para pares evaluadores y comunidad académica.</p>
        </div>
        <div style={{ background: "var(--paper)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2.2fr 2fr 1fr 0.8fr auto", padding: "14px 24px", background: "var(--paper-2)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--ink-3)" }}>
            <div>Documento</div><div>Descripción</div><div>Fecha</div><div>Tamaño</div><div></div>
          </div>
          {EVIDENCIAS_GENERALES.map((e, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2.2fr 2fr 1fr 0.8fr auto", padding: "16px 24px", alignItems: "center", borderTop: "1px solid color-mix(in oklab, var(--ink) 7%, transparent)", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 6, background: "var(--paper-2)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: "var(--ink-3)" }}>PDF</div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{e.t}</div>
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{e.d}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)", letterSpacing: ".05em" }}>{e.f}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>{e.size}</div>
              <button className="btn ghost" style={{ padding: "6px 14px", fontSize: 13 }}><I.download /> Descargar</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- FactorPage: página dedicada a UN factor ----
function FactorPage({ factor }) {
  const { go } = useRoute();
  const prev = FACTORES.find(x => x.n === factor.n - 1);
  const next = FACTORES.find(x => x.n === factor.n + 1);

  return (
    <div className="page-in">
      {/* HEADER DEL FACTOR */}
      <section className="cna-hero" style={{ paddingBottom: 40 }}>
        <WayuuBackdrop variant="a" />
        <div className="cna-hero-inner" style={{ position: "relative", zIndex: 2 }}>
          <div>
            <button onClick={()=>go("acreditacion")}
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: "1px solid color-mix(in oklab, var(--ink) 18%, transparent)", padding: "8px 16px", borderRadius: 999, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-mono)", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-2)" }}>
              ← Volver al tablero
            </button>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 28 }}>
              <span className="chip" style={{ background: factor.color, color: "var(--ug-negro)", borderColor: "transparent", fontWeight: 600 }}>
                Factor {String(factor.n).padStart(2,'0')} · {STATUS_LABELS[factor.status]}
              </span>
              <span className="chip">{factor.caracteristicas.length} características</span>
              <span className="chip">Acuerdo 02 / 2020</span>
            </div>
            <h1 style={{ marginTop: 20, fontSize: "clamp(36px, 5vw, 64px)" }}>{factor.t}</h1>
            <p className="lede" style={{ marginTop: 20 }}>{factor.summary}</p>
            <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
              <button className="btn"><I.download /> Ficha del factor</button>
              <button className="btn ghost"><I.play /> Presentación PowerPoint</button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <CircularProgress value={factor.score} size={240} label={`FACTOR ${String(factor.n).padStart(2,'0')} · ESCALA 1–5`} />
            <div style={{ padding: "12px 20px", background: factor.color, color: "var(--ug-negro)", borderRadius: 12, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, textAlign: "center" }}>
              {judgmentFromScore(factor.score)}
            </div>
          </div>
        </div>
      </section>

      {/* CARACTERÍSTICAS */}
      <section className="section" id="caracteristicas">
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Características evaluadas</div>
              <h2>{factor.caracteristicas.length} características según el Acuerdo 02.</h2>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 16 }}>
            {factor.caracteristicas.map(c => {
              const judg = judgmentFromScore(c.score);
              const st = statusFromScore(c.score);
              return (
                <div key={c.n} className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14, background: "var(--paper)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 14 }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".2em", color: "var(--ink-3)", textTransform: "uppercase" }}>Característica {c.n}</div>
                      <h3 style={{ fontSize: 18, marginTop: 8, letterSpacing: "-0.01em" }}>{c.name}</h3>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1 }}>{c.score.toFixed(1)}</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", letterSpacing: ".1em", marginTop: 4 }}>/ 5.0</div>
                    </div>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: "color-mix(in oklab, var(--ink) 8%, transparent)", overflow: "hidden" }}>
                    <div style={{ width: `${(c.score/5)*100}%`, height: "100%", background: STATUS_COLOR[st], borderRadius: 4 }} />
                  </div>
                  <div style={{ display: "inline-flex", alignSelf: "start", padding: "4px 10px", borderRadius: 999, background: "color-mix(in oklab, " + STATUS_COLOR[st] + " 25%, transparent)", fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-2)" }}>
                    {judg}
                  </div>
                  <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.5 }}>{c.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FORTALEZAS / OPORTUNIDADES */}
      <section className="section" id="hallazgos" style={{ background: "var(--paper-2)" }}>
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Hallazgos del factor</div>
              <h2>Fortalezas y oportunidades de mejora.</h2>
            </div>
          </div>
          <div className="grid-2">
            <div className="card" style={{ background: "var(--paper)", borderLeft: "5px solid var(--ug-azul)" }}>
              <div className="eyebrow" style={{ color: "var(--ug-azul-deep)" }}>✓ Fortalezas identificadas</div>
              <ul style={{ listStyle: "none", padding: 0, margin: "18px 0 0", display: "flex", flexDirection: "column", gap: 14 }}>
                {factor.fortalezas.map((f, i) => (
                  <li key={i} style={{ display: "flex", gap: 12, alignItems: "start", fontSize: 15, lineHeight: 1.5 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 999, background: "var(--ug-azul)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2, color: "var(--ug-negro)" }}>
                      <I.check />
                    </div>
                    <span style={{ color: "var(--ink-2)" }}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card" style={{ background: "var(--paper)", borderLeft: "5px solid var(--ug-flamingo)" }}>
              <div className="eyebrow" style={{ color: "var(--ug-flamingo-deep)" }}>↗ Oportunidades de mejora</div>
              <ul style={{ listStyle: "none", padding: 0, margin: "18px 0 0", display: "flex", flexDirection: "column", gap: 14 }}>
                {factor.oportunidades.map((f, i) => (
                  <li key={i} style={{ display: "flex", gap: 12, alignItems: "start", fontSize: 15, lineHeight: 1.5 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 999, background: "var(--ug-flamingo)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2, color: "var(--ug-negro)", fontFamily: "var(--font-display)", fontWeight: 700 }}>
                      ↗
                    </div>
                    <span style={{ color: "var(--ink-2)" }}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* EVIDENCIAS DEL FACTOR */}
      <section className="section" id="evidencias">
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Evidencias documentales</div>
              <h2>Soporte del factor {String(factor.n).padStart(2,'0')}.</h2>
            </div>
          </div>
          <div style={{ background: "var(--paper-2)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr auto", padding: "14px 24px", background: "var(--paper-3)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--ink-3)" }}>
              <div>Documento</div><div>Descripción</div><div>Fecha</div><div></div>
            </div>
            {factor.evidencias.map((e, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr auto", padding: "16px 24px", alignItems: "center", borderTop: "1px solid color-mix(in oklab, var(--ink) 7%, transparent)", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 6, background: "var(--paper)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: "var(--ink-3)" }}>PDF</div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{e.t}</div>
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{e.d}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>{e.f}</div>
                <button className="icon-btn" style={{ width: 32, height: 32 }}><I.download /></button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ANEXOS DEL FACTOR */}
      <section className="section" id="anexos" style={{ background: "var(--paper-2)" }}>
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Anexos del factor</div>
              <h2>Archivos organizados por categoría.</h2>
            </div>
          </div>
          <div className="grid-2">
            {factor.anexos.map((g, i) => (
              <div key={i} className="card" style={{ background: "var(--paper)" }}>
                <div className="eyebrow" style={{ color: "var(--accent-deep)" }}>● {g.cat}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: "18px 0 0", display: "flex", flexDirection: "column", gap: 0 }}>
                  {g.items.map((it, j) => (
                    <li key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid color-mix(in oklab, var(--ink) 7%, transparent)", fontSize: 14 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--paper-2)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: "var(--ink-3)" }}>PDF</div>
                        {it}
                      </span>
                      <button className="icon-btn" style={{ width: 30, height: 30 }}><I.download /></button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRESENTACIÓN POWERPOINT */}
      <section className="section" id="presentacion">
        <div className="inner">
          <div className="card" style={{ background: "var(--ug-negro)", color: "var(--paper)", padding: 40, display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "center" }}>
            <div>
              <div className="eyebrow" style={{ color: "var(--ug-amarillo)" }}>● Presentación del factor</div>
              <h2 style={{ color: "var(--paper)", marginTop: 12, fontSize: 32 }}>Descargá la presentación en PowerPoint.</h2>
              <p style={{ fontSize: 16, color: "rgba(246,239,227,0.7)", marginTop: 14, maxWidth: "56ch" }}>
                Síntesis ejecutiva del Factor {String(factor.n).padStart(2,'0')} preparada para el comité de pares, con hallazgos, evidencias clave y conclusiones.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button className="btn accent"><I.play /> Ver presentación</button>
              <button className="btn" style={{ background: "transparent", borderColor: "rgba(255,255,255,0.2)", color: "var(--paper)" }}><I.download /> Descargar .pptx</button>
            </div>
          </div>
        </div>
      </section>

      {/* EQUIPO RESPONSABLE */}
      <section className="section" id="equipo-factor" style={{ background: "var(--paper-2)" }}>
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Equipo responsable</div>
              <h2>Quienes lideran este factor.</h2>
            </div>
          </div>
          <div className="grid-3">
            {factor.equipo.map((p, i) => (
              <div key={i} className="card" style={{ padding: 0, overflow: "hidden", background: "var(--paper)" }}>
                <div style={{ aspectRatio: "16/10", background: factor.color, position: "relative", display: "grid", placeItems: "center" }}>
                  <WayuuBackdrop variant="a" />
                  <div style={{ position: "relative", fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 600, color: "var(--ug-negro)" }}>
                    {p.n.split(" ").map(w => w[0]).filter(c => /[A-ZÁÉÍÓÚ]/.test(c)).slice(0,2).join("")}
                  </div>
                </div>
                <div style={{ padding: 20 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--ink-3)" }}>{p.cargo}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, marginTop: 6, letterSpacing: "-0.01em" }}>{p.n}</div>
                  <div className="rule" style={{ margin: "12px 0 10px" }} />
                  <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}><b>Rol:</b> {p.rol}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* METODOLOGÍA APLICADA */}
      <section className="section" id="metodologia-factor">
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Metodología aplicada al factor</div>
              <h2>Cómo se recolectó y analizó la información.</h2>
            </div>
          </div>
          <div className="grid-3">
            {[
              { t: "Recolección", d: `Aplicación de encuestas a los estamentos implicados en el Factor ${String(factor.n).padStart(2,'0')}, entrevistas semiestructuradas a líderes y análisis documental de la normativa e indicadores institucionales pertinentes.` },
              { t: "Análisis", d: "Triangulación de fuentes cuantitativas (estadísticas, indicadores) y cualitativas (grupos focales, entrevistas). Validación por el comité de autoevaluación del programa." },
              { t: "Valoración", d: `Ponderación de las ${factor.caracteristicas.length} características del factor en escala 1.0–5.0, con juicio de cumplimiento y consolidación en el puntaje global del factor (${factor.score.toFixed(1)}).` },
            ].map((x, i) => (
              <div key={i} className="card">
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".2em", color: "var(--ink-3)", textTransform: "uppercase" }}>Etapa 0{i+1}</div>
                <h3 style={{ fontSize: 20, marginTop: 10 }}>{x.t}</h3>
                <p style={{ color: "var(--ink-2)", fontSize: 14, marginTop: 12, lineHeight: 1.55 }}>{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NAV PREV / NEXT */}
      <section className="section" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div className="inner">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {prev ? (
              <button onClick={()=>go(`factor-${prev.n}`)}
                      style={{ textAlign: "left", padding: 28, border: "1px solid color-mix(in oklab, var(--ink) 10%, transparent)", background: "var(--paper-2)", borderRadius: 14, cursor: "pointer", transition: "all .18s ease" }}
                      onMouseEnter={(e)=>e.currentTarget.style.borderColor = "color-mix(in oklab, var(--accent) 70%, transparent)"}
                      onMouseLeave={(e)=>e.currentTarget.style.borderColor = "color-mix(in oklab, var(--ink) 10%, transparent)"}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".2em", color: "var(--ink-3)", textTransform: "uppercase" }}>← Factor anterior</div>
                <div style={{ marginTop: 12, fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, letterSpacing: "-0.01em" }}>F{String(prev.n).padStart(2,'0')} · {prev.t}</div>
                <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-3)" }}>Calificación {prev.score.toFixed(1)} · {STATUS_LABELS[prev.status]}</div>
              </button>
            ) : (
              <div style={{ padding: 28, background: "var(--paper-2)", borderRadius: 14, opacity: 0.4 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".2em", color: "var(--ink-3)", textTransform: "uppercase" }}>Primer factor</div>
                <div style={{ marginTop: 12, fontSize: 14, color: "var(--ink-3)" }}>No hay factor anterior.</div>
              </div>
            )}
            {next ? (
              <button onClick={()=>go(`factor-${next.n}`)}
                      style={{ textAlign: "right", padding: 28, border: "1px solid color-mix(in oklab, var(--ink) 10%, transparent)", background: "var(--paper-2)", borderRadius: 14, cursor: "pointer", transition: "all .18s ease" }}
                      onMouseEnter={(e)=>e.currentTarget.style.borderColor = "color-mix(in oklab, var(--accent) 70%, transparent)"}
                      onMouseLeave={(e)=>e.currentTarget.style.borderColor = "color-mix(in oklab, var(--ink) 10%, transparent)"}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".2em", color: "var(--ink-3)", textTransform: "uppercase" }}>Factor siguiente →</div>
                <div style={{ marginTop: 12, fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, letterSpacing: "-0.01em" }}>F{String(next.n).padStart(2,'0')} · {next.t}</div>
                <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-3)" }}>Calificación {next.score.toFixed(1)} · {STATUS_LABELS[next.status]}</div>
              </button>
            ) : (
              <div style={{ padding: 28, background: "var(--paper-2)", borderRadius: 14, opacity: 0.4, textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".2em", color: "var(--ink-3)", textTransform: "uppercase" }}>Último factor</div>
                <div style={{ marginTop: 12, fontSize: 14, color: "var(--ink-3)" }}>No hay factor siguiente.</div>
              </div>
            )}
          </div>
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <button className="btn ghost" onClick={()=>go("acreditacion")}>← Volver al tablero de factores</button>
          </div>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { Acreditacion, FACTORES });
