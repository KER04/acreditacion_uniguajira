/* Escala de gradación institucional, tal como la fija el informe de
   autoevaluación: cinco grados con su rango. Antes había tres y el más bajo
   se llamaba "En desarrollo", que no es ninguno de los juicios oficiales. */
export const ESCALA = [
  { k: 'pleno',           letra: 'A', label: 'Se cumple plenamente',        desde: 90, hasta: 100, color: '#62a9b6' },
  { k: 'alto',            letra: 'B', label: 'Se cumple en alto grado',     desde: 80, hasta: 89,  color: '#e2a542' },
  { k: 'aceptable',       letra: 'C', label: 'Se cumple aceptablemente',    desde: 60, hasta: 79,  color: '#cc5e50' },
  { k: 'insatisfactorio', letra: 'D', label: 'Se cumple insatisfactoriamente', desde: 31, hasta: 59, color: '#8a3d33' },
  { k: 'nocumple',        letra: 'E', label: 'No se cumple',                desde: 0,  hasta: 30,  color: '#5a5f63' },
]

export const STATUS_LABELS = Object.fromEntries(ESCALA.map(e => [e.k, e.label]))
export const STATUS_COLOR  = Object.fromEntries(ESCALA.map(e => [e.k, e.color]))
export const STATUS_LETRA  = Object.fromEntries(ESCALA.map(e => [e.k, e.letra]))

export function statusFromScore(s) {
  return (ESCALA.find(e => s >= e.desde) ?? ESCALA[ESCALA.length - 1]).k
}
export function judgmentFromScore(s) {
  return STATUS_LABELS[statusFromScore(s)]
}

/* Juicio global: media PONDERADA por el peso de cada factor, no media simple.
   Con pesos iguales daba 93,46 y el informe dice 93,26. */
export function globalPonderado(factores) {
  const peso = factores.reduce((a, f) => a + (Number(f.ponderacion) || 0), 0)
  if (!peso) return factores.length ? factores.reduce((a, f) => a + f.score, 0) / factores.length : 0
  return factores.reduce((a, f) => a + f.score * (Number(f.ponderacion) || 0), 0) / peso
}

export const FACTORES = [
  {
    n: 1, t: 'Proyecto Educativo del Programa e Identidad Institucional', score: 96.65,
    summary: 'Coherencia del PEP con el Plan Prospectivo 2030, pertinencia regional e identidad institucional, con alta apropiación por parte de la comunidad académica.',
    fortalezas: [
      'Alineación estratégica: PEP actualizado, coherente con el Plan Prospectivo 2030 y las tendencias de la Industria 4.0.',
      'Impacto comunitario: proyectos en transformación digital orientados a las necesidades del contexto guajiro.',
      'Alta apropiación: percepción altamente satisfactoria sobre calidad, impacto y relevancia del programa.',
      '+120 actividades de extensión registradas en el período 2019–2024.',
      '91.5% de tasa de empleabilidad e inserción laboral regional.',
    ],
    oportunidades: [],
    caracteristicas: [
      { n: 'C1', name: 'Proyecto Educativo del Programa', peso: 55, calificacion: 98, score: 98, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Coherencia, vigencia y apropiación del PEP por la comunidad académica.' },
      { n: 'C2', name: 'Relevancia y pertinencia del programa', peso: 45, calificacion: 95, score: 95, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Pertinencia social, laboral y académica del programa en el contexto regional.' },
    ],
    equipo: [
      { n: 'Adanud Segundo Meza Valle', cargo: 'Director del programa', rol: 'Líder del factor', sede: 'riohacha', foto: '' },
      { n: 'MSc. Jorge Epieyú Palmar', cargo: 'Docente tiempo completo', rol: 'Análisis PEP', sede: 'riohacha', foto: '' },
    ],
    evidencias: [
      { t: 'PEI 2020–2030 UniGuajira', d: 'Proyecto Educativo Institucional vigente', f: 'Mar 2025', url: '' },
      { t: 'PEP Ingeniería de Sistemas 2024', d: 'Proyecto Educativo del Programa actualizado', f: 'Oct 2024', url: '' },
    ],
    anexos: [{ cat: 'Normativa', items: ['Acuerdo de aprobación del PEI', 'Resolución rectoral adopción PEP'] }],
    presentacionUrl: '', metodologiaFactor: '', documentos: [],
  },
  {
    n: 2, t: 'Estudiantes', score: 91.35,
    summary: 'Políticas integrales de acompañamiento, estímulos y formación que garantizan permanencia, participación y bienestar estudiantil en ambos campus.',
    fortalezas: [
      '3.860 atenciones en estrategias de permanencia 2019–2024.',
      '+70% de casos de alerta temprana en primeros semestres donde se evitó la deserción.',
      '100% de conocimiento del Reglamento Estudiantil reportado por el cuerpo docente.',
      '2023 y 2024: al menos ocho ponencias estudiantiles en eventos académicos.',
      '69.16% de estudiantes calificó como excelente la experiencia en actividades extracurriculares.',
      'Más del 84% calificó como excelentes y muy buenos los estímulos institucionales.',
    ],
    oportunidades: [
      'Continuar optimizando la difusión de convocatorias de estímulos, garantizando accesibilidad y equidad en ambos campus.',
      'Incrementar la participación estudiantil en actividades extracurriculares en sede Maicao, especialmente en proyectos sociales e internacionales.',
    ],
    caracteristicas: [
      { n: 'C3', name: 'Participación en actividades de formación integral', peso: 22, calificacion: 88.75, score: 88.75, status: 'alto', juicio: 'Se cumple en alto grado', desc: 'Vinculación estudiantil a semilleros, cultura, deporte y proyectos sociales.' },
      { n: 'C4', name: 'Orientación y seguimiento a estudiantes', peso: 21, calificacion: 92, score: 92, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Estrategias de tutorías, SIAT y acompañamiento académico integral.' },
      { n: 'C5', name: 'Capacidad de trabajo autónomo', peso: 19, calificacion: 93, score: 93, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Desarrollo de competencias para el aprendizaje independiente y autogestionado.' },
      { n: 'C6', name: 'Reglamento estudiantil y política académica', peso: 19, calificacion: 94.5, score: 94.5, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Socialización, aplicación y actualización del reglamento estudiantil vigente.' },
      { n: 'C7', name: 'Estímulo y apoyo a estudiantes', peso: 20, calificacion: 89, score: 89, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Becas, subsidios, reconocimientos y programas de apoyo al rendimiento académico.' },
    ],
    equipo: [
      { n: 'Adanud Segundo Meza Valle', cargo: 'Director del programa', rol: 'Líder del factor', sede: 'riohacha', foto: '' },
      { n: 'MSc. Catalina Uriana Iguarán', cargo: 'Docente tiempo completo', rol: 'Análisis de permanencia', sede: 'riohacha', foto: '' },
    ],
    evidencias: [
      { t: 'Acuerdo 018 de 2021 — Reglamento estudiantil', d: 'Reglamento vigente', f: 'Jun 2021', url: '' },
      { t: 'Informe SPADIES 2025', d: 'Indicadores de deserción y permanencia', f: 'Feb 2025', url: '' },
    ],
    anexos: [{ cat: 'Estadísticas', items: ['Matriz de admisiones 2019–2025', 'Tasas de permanencia por cohorte'] }],
    presentacionUrl: '', metodologiaFactor: '', documentos: [],
  },
  {
    n: 3, t: 'Profesores', score: 94.19,
    summary: 'Planta docente altamente cualificada (95.2% con posgrado), con sólida producción académica, desarrollo profesoral sostenido y evaluación transparente.',
    fortalezas: [
      '95.2% de docentes con posgrado: 68.2% maestría y 27% doctorado.',
      '160+ productos académicos generados en los últimos 5 años.',
      '$127M de inversión en estímulos a la trayectoria profesoral en sede Riohacha.',
      '15 ascensos en el escalafón docente desde 2020.',
      'Estabilidad con núcleo básico de docentes de tiempo completo con contratación indefinida.',
      'Evaluación docente valorada como transparente, justa y eficaz por la comunidad académica.',
    ],
    oportunidades: [
      'Fortalecer la visibilidad de los criterios de evaluación para la asignación de estímulos, para incrementar la participación docente.',
    ],
    caracteristicas: [
      { n: '3.1', name: 'Selección, vinculación y permanencia de profesores', peso: 14.04, calificacion: 95, score: 95, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Procesos rigurosos de selección y políticas claras de permanencia docente.' },
      { n: '3.2', name: 'Estatuto profesoral', peso: 20.07, calificacion: 95, score: 95, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Estatuto vigente, aplicado y socializado entre los docentes del programa.' },
      { n: '3.3', name: 'Número, dedicación, nivel de formación y experiencia', peso: 14.18, calificacion: 94.75, score: 94.75, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Planta suficiente en número, nivel formativo y dedicación.' },
      { n: '3.4', name: 'Desarrollo profesoral', peso: 14.33, calificacion: 96, score: 96, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Programas institucionales de capacitación, actualización y formación avanzada.' },
      { n: '3.5', name: 'Estímulo a la trayectoria profesoral', peso: 10.07, calificacion: 90.5, score: 90.5, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Sistema de reconocimientos, incentivos y escalafón docente activo.' },
      { n: '3.6', name: 'Producción, permanencia, utilización e impacto del material docente', peso: 11.34, calificacion: 96.6, score: 96.6, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Publicaciones, libros, material didáctico y su uso efectivo en el aula.' },
      { n: '3.7', name: 'Remuneración por mérito', peso: 8.13, calificacion: 87, score: 87, status: 'alto', juicio: 'Se cumple en alto grado', desc: 'Política salarial que reconoce formación, categoría y productividad académica.' },
      { n: '3.8', name: 'Evaluación de profesores', peso: 7.84, calificacion: 95, score: 95, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Proceso de evaluación docente periódico, transparente e integrado a la mejora.' },
    ],
    equipo: [
      { n: 'Dr. Héctor Brito Mendoza', cargo: 'Investigador principal GITUG', rol: 'Líder del factor', sede: 'riohacha', foto: '' },
      { n: 'MSc. Andrea Bolaños Curvelo', cargo: 'Docente tiempo completo', rol: 'Análisis de dedicación', sede: 'riohacha', foto: '' },
    ],
    evidencias: [
      { t: 'Estatuto profesoral UniGuajira', d: 'Normativa de carrera docente', f: '2019', url: '' },
      { t: 'GrupLac y CvLac de la planta docente', d: 'Hojas de vida registradas en MinCiencias', f: 'Act. 2025', url: '' },
    ],
    anexos: [
      { cat: 'Planta', items: ['Listado completo planta docente', 'Dedicación y categorías escalafón'] },
      { cat: 'Producción', items: ['Publicaciones 2020–2025', 'Ponencias nacionales e internacionales'] },
    ],
    presentacionUrl: '', metodologiaFactor: '', documentos: [],
  },
  {
    n: 4, t: 'Egresados', score: 94.58,
    summary: 'Sistema Adviser con 86% de cobertura, 91.5% de inserción laboral y 92.7% de satisfacción de empleadores, con egresados activos en investigación y posgrado.',
    fortalezas: [
      '91.5% de tasa de inserción laboral general.',
      '86% de egresados caracterizados activamente en el sistema Adviser.',
      '92.7% de nivel de satisfacción de empleadores evaluados.',
      '73.3% de egresados desempeñándose en áreas afines al perfil profesional.',
      'Sistema Adviser con 86% de cobertura y 96.7% de nivel de confianza.',
      '12.4% en estudios de posgrado y 18.7% en actividades académicas e investigativas.',
    ],
    oportunidades: [
      'Fortalecer estrategias de difusión y apropiación de beneficios institucionales para graduados.',
      'Incrementar la participación de egresados en redes profesionales e iniciativas de innovación social.',
    ],
    caracteristicas: [
      { n: '4.1', name: 'Seguimiento a egresados', peso: 41.54, calificacion: 97.5, score: 97.5, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Sistema Adviser y mecanismos continuos de contacto, actualización y soporte a graduados.' },
      { n: '4.2', name: 'Impacto de egresados en el medio social y académico', peso: 58.46, calificacion: 92.5, score: 92.5, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Contribución de egresados al desarrollo tecnológico, social e investigativo de la región.' },
    ],
    equipo: [
      { n: 'Adanud Segundo Meza Valle', cargo: 'Director del programa', rol: 'Líder del factor', sede: 'riohacha', foto: '' },
      { n: 'Diana Cotes Brito', cargo: 'Representante egresados', rol: 'Seguimiento y articulación', sede: 'riohacha', foto: '' },
    ],
    evidencias: [
      { t: 'Informe Sistema Adviser 2025', d: 'Cobertura, caracterización y tasas de egresados', f: 'Dic 2025', url: '' },
      { t: 'Encuesta de satisfacción de empleadores', d: 'Resultados consolidados 2024–2025', f: 'Mar 2025', url: '' },
    ],
    anexos: [{ cat: 'Seguimiento', items: ['Base de datos Sistema Adviser', 'Encuesta empleadores 2024–2025'] }],
    presentacionUrl: '', metodologiaFactor: '', documentos: [],
  },
  {
    n: 5, t: 'Aspectos Académicos y Resultados de Aprendizaje', score: 92.98,
    summary: 'Currículo con taxonomía SOLO y Bloom implementados, electivas emergentes en IA y ciberseguridad, y +14.000 personas beneficiadas en proyección social.',
    fortalezas: [
      '14.000+ personas beneficiadas en actividades de proyección social 2020–2024.',
      '35% de estudiantes superando nivel multiestructural en pruebas de aprendizaje.',
      '100% de incorporación de pruebas de Taxonomía SOLO en la evaluación curricular.',
      'Implementación del Acuerdo 013 integrando taxonomía SOLO y Bloom.',
      'Inclusión de electivas emergentes: IA, ciberseguridad y robótica.',
      '+100 actividades de proyección social lideradas por docentes del programa.',
    ],
    oportunidades: [
      'Ampliar la participación estudiantil en actividades de proyección social.',
    ],
    caracteristicas: [
      { n: '5.1', name: 'Integralidad de los aspectos curriculares', peso: 12.47, calificacion: 94.5, score: 94.5, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Formación integral articulando fundamentación, profundización y contexto.' },
      { n: '5.2', name: 'Flexibilidad curricular', peso: 11.43, calificacion: 90, score: 90, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Electivas, movilidad, reconocimiento y homologación de créditos.' },
      { n: '5.3', name: 'Interdisciplinariedad', peso: 8.05, calificacion: 90, score: 90, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Articulación entre áreas del conocimiento y con otros programas.' },
      { n: '5.4', name: 'Estrategias pedagógicas', peso: 13.25, calificacion: 92.5, score: 92.5, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Metodologías activas centradas en el estudiante e integración de IA a la didáctica.' },
      { n: '5.5', name: 'Sistema de evaluación de estudiantes', peso: 8.57, calificacion: 93.3, score: 93.3, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Evaluación formativa, sumativa y por resultados de aprendizaje verificables.' },
      { n: '5.6', name: 'Resultados de aprendizaje', peso: 16.49, calificacion: 95, score: 95, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Logros verificados con taxonomía SOLO y Bloom en cada nivel curricular.' },
      { n: '5.7', name: 'Competencias del programa', peso: 13.12, calificacion: 92, score: 92, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Matriz de competencias mapeada a referencias globales de ingeniería.' },
      { n: '5.8', name: 'Evaluación y autorregulación del programa', peso: 9.74, calificacion: 93.5, score: 93.5, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Procesos permanentes de evaluación curricular y mejora continua.' },
      { n: '5.9', name: 'Vinculación e interacción social', peso: 6.88, calificacion: 95.5, score: 95.5, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Proyección social articulada al currículo con impacto comunitario verificable.' },
    ],
    equipo: [
      { n: 'Dra. Luz Marina Ipuana', cargo: 'Coordinadora curricular', rol: 'Líder del factor', sede: 'riohacha', foto: '' },
      { n: 'Dr. Pablo Mengual Solano', cargo: 'Docente tiempo completo', rol: 'Análisis curricular', sede: 'maicao', foto: '' },
    ],
    evidencias: [
      { t: 'Microcurrículos actualizados 2025', d: 'Syllabus vigente con resultados de aprendizaje', f: 'Feb 2025', url: '' },
      { t: 'Informe de reforma curricular — Acuerdo 013', d: 'Análisis, propuesta y aprobación', f: 'Ago 2024', url: '' },
    ],
    anexos: [{ cat: 'Currículo', items: ['Malla curricular 169 cr', 'Matriz de competencias y resultados de aprendizaje'] }],
    presentacionUrl: '', metodologiaFactor: '', documentos: [],
  },
  {
    n: 6, t: 'Permanencia y Graduación', score: 93.07,
    summary: 'Deserción reducida del 14.95% al 8.67%, tasa de graduación aumentada al 13.25%, con 3.072 estudiantes intervenidos mediante SIAT.',
    fortalezas: [
      'Reducción de la tasa de deserción interanual de 14.95% a 8.67% (2021–2023).',
      'Incremento de la tasa de graduación por período de 7.40% a 13.25%.',
      '3.072 estudiantes intervenidos mediante el Sistema de Alertas Tempranas (SIAT).',
      'Alta absorción en admisiones: superior al 90%.',
      'Tutorías intensivas en asignaturas críticas: Algoritmos, Cálculo Diferencial y Física.',
    ],
    oportunidades: [
      'Mejorar la visibilidad y divulgación de beneficios para estudiantes en condición de vulnerabilidad.',
      'Fortalecer la apropiación del SIAT en sede Maicao.',
    ],
    caracteristicas: [
      { n: '6.1', name: 'Políticas, estrategias y estructura de permanencia', peso: 29.57, calificacion: 90, score: 90, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Marco institucional y programático de permanencia con acciones verificables.' },
      { n: '6.2', name: 'Caracterización de estudiantes y SIAT', peso: 24.57, calificacion: 95, score: 95, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Sistema de alertas tempranas con cobertura activa en ambas sedes.' },
      { n: '6.3', name: 'Ajustes en aspectos curriculares para permanencia', peso: 23.26, calificacion: 95, score: 95, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Tutorías, nivelaciones y ajustes curriculares orientados a reducir deserción.' },
      { n: '6.4', name: 'Mecanismos de selección y admisión', peso: 22.6, calificacion: 93, score: 93, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Procesos transparentes con alta absorción y criterios diferenciados.' },
    ],
    equipo: [
      { n: 'Adanud Segundo Meza Valle', cargo: 'Director del programa', rol: 'Líder del factor', sede: 'riohacha', foto: '' },
      { n: 'MSc. Catalina Uriana Iguarán', cargo: 'Docente tiempo completo', rol: 'Análisis SIAT y permanencia', sede: 'riohacha', foto: '' },
    ],
    evidencias: [
      { t: 'Informe SPADIES — Cohortes 2019–2024', d: 'Tasas de deserción y graduación por período', f: 'Mar 2025', url: '' },
      { t: 'Reporte SIAT 2024', d: 'Intervenciones y resultados del sistema de alertas', f: 'Dic 2024', url: '' },
    ],
    anexos: [{ cat: 'Permanencia', items: ['Tasas de deserción por cohorte', 'Informe de tutorías intensivas'] }],
    presentacionUrl: '', metodologiaFactor: '', documentos: [],
  },
  {
    n: 7, t: 'Interacción con el Entorno Nacional e Internacional', score: 93.30,
    summary: '708 movilidades registradas, 40 convenios internacionales activos —incluidos MIT y U. Arizona— y política de multilingüismo en inglés, francés y wayuunaiki.',
    fortalezas: [
      '708 movilidades estudiantiles registradas nacional e internacionalmente 2020–2024.',
      '40 convenios internacionales activos (MIT, U. Arizona, LUT University, entre otros).',
      '61 actividades de internacionalización en casa realizadas en el período.',
      'Participación activa en REDCOLSI, REDIS, ACOFI y Programa Delfín.',
      'Implementación de la Política de Multilingüismo en inglés, francés y wayuunaiki.',
      'Mapeo del currículo contra referencias globales de ingeniería.',
    ],
    oportunidades: [
      'Gestionar al menos un convenio de doble titulación internacional.',
      'Reforzar la evaluación del impacto de las movilidades en la formación.',
      'Fortalecer el seguimiento a egresados con experiencias internacionales.',
    ],
    caracteristicas: [
      { n: '7.1', name: 'Interacción con contextos nacionales e internacionales', peso: 41.43, calificacion: 96, score: 96, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Presencia del programa en redes, eventos y espacios académicos globales.' },
      { n: '7.2', name: 'Relaciones externas de profesores y estudiantes', peso: 31.43, calificacion: 89, score: 89, status: 'alto', juicio: 'Se cumple en alto grado', desc: 'Movilidades, ponencias y publicaciones en coautoría con instituciones internacionales.' },
      { n: '7.3', name: 'Habilidad comunicativa en segunda lengua', peso: 27.14, calificacion: 94, score: 94, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Política multilingüe con oferta en inglés, francés y wayuunaiki.' },
    ],
    equipo: [
      { n: 'Dra. Luz Marina Ipuana', cargo: 'Líder ORI del programa', rol: 'Líder del factor', sede: 'riohacha', foto: '' },
      { n: 'MSc. Jorge Epieyú Palmar', cargo: 'Docente tiempo completo', rol: 'Gestión de convenios', sede: 'riohacha', foto: '' },
    ],
    evidencias: [
      { t: 'Convenios internacionales vigentes 2025', d: 'MIT, U. Arizona, LUT University y otros', f: 'Act. 2025', url: '' },
      { t: 'Informe ORI 2024', d: 'Movilidades entrantes y salientes', f: 'Feb 2025', url: '' },
    ],
    anexos: [
      { cat: 'Convenios', items: ['Textos originales de convenios firmados'] },
      { cat: 'Movilidad', items: ['Listado de movilidades 2020–2024'] },
    ],
    presentacionUrl: '', metodologiaFactor: '', documentos: [],
  },
  {
    n: 8, t: 'Aportes de la Investigación, la Innovación, el Desarrollo Tecnológico y la Creación', score: 88.70,
    summary: '36 proyectos I+D ejecutados, 6 grupos categorizados por Minciencias, 10 investigadores reconocidos y semilleros activos en Riohacha y Maicao.',
    fortalezas: [
      '36 proyectos I+D ejecutados en el período 2020–2024.',
      '6 grupos de investigación vinculados y categorizados por Minciencias.',
      '10 docentes reconocidos como Investigadores Junior o Asociado.',
      '18 artículos, 9 capítulos de libro, 12 ponencias y 7 registros de software producidos.',
      'Semilleros Innovatech Dev y SecTec activos en ambas sedes.',
      'Estatuto de Propiedad Intelectual — Acuerdo 002 de 2021.',
    ],
    oportunidades: [
      'Aumentar la participación estudiantil activa en investigación, especialmente en sede Maicao.',
      'Fortalecer el seguimiento y la sistematización de productos investigativos.',
      'Incentivar la movilidad investigativa de estudiantes y docentes.',
    ],
    caracteristicas: [
      { n: '8.1', name: 'Formación para la investigación, la innovación y la creación', peso: 53.33, calificacion: 87.5, score: 87.5, status: 'alto', juicio: 'Se cumple en alto grado', desc: 'Ruta de formación investigativa desde semilleros hasta proyectos Minciencias.' },
      { n: '8.2', name: 'Compromiso con la investigación y la creación', peso: 46.67, calificacion: 90, score: 90, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Política institucional, asignación presupuestal y producción verificable.' },
    ],
    equipo: [
      { n: 'Dr. Héctor Brito Mendoza', cargo: 'Director GITUG', rol: 'Líder del factor', sede: 'riohacha', foto: '' },
      { n: 'Dr. Samuel Cotes Ramírez', cargo: 'Líder Caribe.AI', rol: 'Análisis de producción', sede: 'maicao', foto: '' },
    ],
    evidencias: [
      { t: 'GrupLac MinCiencias', d: 'Categorización y producción de grupos', f: 'Act. 2025', url: '' },
      { t: 'Memorias de semilleros 2024', d: 'Resultados de semilleros Innovatech Dev y SecTec', f: 'Dic 2024', url: '' },
    ],
    anexos: [
      { cat: 'Proyectos', items: ['Listado proyectos I+D 2020–2024', 'Presupuestos asignados'] },
      { cat: 'Publicaciones', items: ['Artículos indexados', 'Capítulos de libro y ponencias'] },
    ],
    presentacionUrl: '', metodologiaFactor: '', documentos: [],
  },
  {
    n: 9, t: 'Bienestar de la Comunidad Académica del Programa', score: 93.04,
    summary: '4.156 participaciones en desarrollo humano, 96% de reconocimiento de servicios y subsidios de alimentación y transporte que redujeron la inasistencia rural más del 10%.',
    fortalezas: [
      '4.156 participaciones en programas de desarrollo humano.',
      '2.837 asistencias registradas a servicios de salud estudiantil.',
      '96% de tasa de reconocimiento de servicios de bienestar universitario.',
      'Transición a plataforma integral de desarrollo personal.',
      'Formatos mixtos presencial y virtual consolidados tras la pandemia.',
      'Subsidios de alimentación y transporte que redujeron la inasistencia rural en más del 10%.',
    ],
    oportunidades: [
      'Incrementar la participación de docentes en actividades culturales y deportivas.',
      'Potenciar estrategias mixtas para ampliar la cobertura de bienestar.',
    ],
    caracteristicas: [
      { n: '9.1', name: 'Programas y servicios de bienestar', peso: 52.22, calificacion: 93.5, score: 93.5, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Oferta integral de salud, apoyo socioeconómico, cultura y deporte.' },
      { n: '9.2', name: 'Participación y seguimiento en bienestar', peso: 47.78, calificacion: 92.5, score: 92.5, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Indicadores de uso, satisfacción y cobertura de programas de bienestar.' },
    ],
    equipo: [
      { n: 'MSc. Catalina Uriana Iguarán', cargo: 'Docente tiempo completo', rol: 'Enlace con bienestar', sede: 'riohacha', foto: '' },
    ],
    evidencias: [
      { t: 'Informe Bienestar Universitario 2025', d: 'Cobertura, programas y resultados', f: 'Mar 2025', url: '' },
    ],
    anexos: [{ cat: 'Programas', items: ['Catálogo de servicios de bienestar', 'Indicadores de uso 2024'] }],
    presentacionUrl: '', metodologiaFactor: '', documentos: [],
  },
  {
    n: 10, t: 'Medios Educativos y Ambientes de Aprendizaje', score: 94.50,
    summary: '98% de docentes capacitados en IA y metodologías activas, 100% de disponibilidad de laboratorios especializados e infraestructura virtual de última generación.',
    fortalezas: [
      '97.2% de nivel de utilidad percibida de recursos académicos en sede Riohacha.',
      '98% de docentes capacitados en metodologías activas e IA mediante diplomados UNIR.',
      '100% de disponibilidad de laboratorios especializados e infraestructura virtual.',
      'Inversión en bases de datos, simuladores y recursos bibliográficos especializados.',
      'Integración de IA a la didáctica mediante diplomados y herramientas de vanguardia.',
      '96.9% de estudiantes de sede Maicao valida las estrategias pedagógicas como pertinentes.',
    ],
    oportunidades: [
      'Incrementar la producción de material docente propio del programa.',
    ],
    caracteristicas: [
      { n: '10.1', name: 'Estrategias y recursos de apoyo a profesores', peso: 33.89, calificacion: 94.5, score: 94.5, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Herramientas, plataformas y laboratorios disponibles para la docencia.' },
      { n: '10.2', name: 'Estrategias y recursos de apoyo a estudiantes', peso: 32.22, calificacion: 94.5, score: 94.5, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Acceso a recursos virtuales, bibliográficos y ambientes de aprendizaje activo.' },
      { n: '10.3', name: 'Recursos bibliográficos y de información', peso: 33.89, calificacion: 94.5, score: 94.5, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Bases de datos, revistas indexadas y colecciones especializadas en ingeniería.' },
    ],
    equipo: [
      { n: 'MSc. Andrea Bolaños Curvelo', cargo: 'Coord. laboratorios y semilleros', rol: 'Líder del factor', sede: 'riohacha', foto: '' },
      { n: 'Dr. Pablo Mengual Solano', cargo: 'Docente tiempo completo', rol: 'Análisis de recursos pedagógicos', sede: 'maicao', foto: '' },
    ],
    evidencias: [
      { t: 'Inventario de laboratorios IS 2025', d: 'Equipos, software y cobertura por sede', f: 'Ene 2025', url: '' },
      { t: 'Informe de capacitación docente UNIR', d: 'Diplomados en IA y metodologías activas', f: 'Dic 2024', url: '' },
    ],
    anexos: [{ cat: 'Infraestructura', items: ['Inventario de equipos y software', 'Reportes de uso de laboratorios'] }],
    presentacionUrl: '', metodologiaFactor: '', documentos: [],
  },
  {
    n: 11, t: 'Organización, Administración y Financiación del Programa Académico', score: 94.40,
    summary: 'Tasa de graduación acumulada del 43.40%, gobernanza participativa, sostenibilidad financiera con ejecución presupuestal proyectada hasta 2029.',
    fortalezas: [
      '43.40% de tasa de graduación acumulada, superando el histórico institucional del 10.69%.',
      '100% de alineación del presupuesto a las funciones misionales y proyección hasta 2029.',
      '+90% de satisfacción general con los sistemas de información institucional.',
      'Gobernanza participativa con alta representación en cuerpos colegiados.',
      'Sostenibilidad financiera con ejecución presupuestal para el Plan de Mejoramiento.',
      'SIAC funcionando con evaluación y mejora continua como política institucional diaria.',
    ],
    oportunidades: [],
    caracteristicas: [
      { n: '11.1', name: 'Organización y administración del programa', peso: 16.54, calificacion: 94, score: 94, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Estructura académica y administrativa clara con procesos documentados.' },
      { n: '11.2', name: 'Dirección y gestión del programa', peso: 16.73, calificacion: 93.5, score: 93.5, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Liderazgo académico con visión estratégica y participación colegiada.' },
      { n: '11.3', name: 'Sistema de comunicación e información', peso: 13.85, calificacion: 93.6, score: 93.6, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Plataformas y canales efectivos de comunicación interna y externa.' },
      { n: '11.4', name: 'Estudiante y capacidad institucional', peso: 12.69, calificacion: 95, score: 95, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Relación entre matrícula, infraestructura y capacidad de atención.' },
      { n: '11.5', name: 'Financiación del programa', peso: 21.54, calificacion: 95, score: 95, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Suficiencia, estabilidad y alineación presupuestal a las funciones misionales.' },
      { n: '11.6', name: 'Aseguramiento de la alta calidad y mejora continua', peso: 18.65, calificacion: 95, score: 95, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'SIAC activo con ciclos permanentes de autoevaluación y mejora.' },
    ],
    equipo: [
      { n: 'Adanud Segundo Meza Valle', cargo: 'Director del programa', rol: 'Líder del factor', sede: 'riohacha', foto: '' },
    ],
    evidencias: [
      { t: 'Organigrama y manual de funciones', d: 'Estructura académica y administrativa', f: 'Ene 2025', url: '' },
      { t: 'Informe financiero 2025', d: 'Ejecución presupuestal del programa', f: 'Feb 2025', url: '' },
    ],
    anexos: [{ cat: 'Organización', items: ['Organigrama del programa', 'Manual de procedimientos SIAC'] }],
    presentacionUrl: '', metodologiaFactor: '', documentos: [],
  },
  {
    n: 12, t: 'Recursos Físicos y Tecnológicos', score: 94.81,
    summary: '96% de cobertura WiFi, 1.048 MB de ancho de banda dedicado en Riohacha, 100% de laboratorios operativos y 94% de aval docente a herramientas tecnológicas.',
    fortalezas: [
      '96% de cobertura de red WiFi institucional en el campus.',
      '1.048 MB de ancho de banda dedicado en sede Riohacha.',
      '100% de ejecución de proyectos de dotación de laboratorios de redes.',
      'Racks, switches empresariales y cableado estructurado certificado.',
      'Google Workspace, Moodle y software de última generación disponibles.',
      '94% del profesorado avala las herramientas tecnológicas como idóneas para ingeniería de software moderna.',
    ],
    oportunidades: [
      'Fortalecer la sostenibilidad de los recursos tecnológicos a largo plazo, asegurando reposición oportuna y soporte técnico especializado.',
    ],
    caracteristicas: [
      { n: '12.1', name: 'Recursos de infraestructura física y tecnológica', peso: 53.1, calificacion: 95, score: 95, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Aulas, laboratorios, centros de cómputo y red de comunicaciones.' },
      { n: '12.2', name: 'Recursos informáticos y de comunicación', peso: 46.9, calificacion: 94.5, score: 94.5, status: 'pleno', juicio: 'Se cumple plenamente', desc: 'Plataformas, software especializado y conectividad de alta capacidad.' },
    ],
    equipo: [
      { n: 'MSc. Andrea Bolaños Curvelo', cargo: 'Docente tiempo completo', rol: 'Inventario de laboratorios', sede: 'riohacha', foto: '' },
    ],
    evidencias: [
      { t: 'Inventario tecnológico IS 2025', d: 'Equipos, redes y software por sede', f: 'Ene 2025', url: '' },
      { t: 'Plan maestro de infraestructura 2024–2030', d: 'Proyección de inversión física y tecnológica', f: 'Mar 2024', url: '' },
    ],
    anexos: [{ cat: 'Infraestructura', items: ['Inventario de equipos y redes', 'Proyectos de dotación ejecutados'] }],
    presentacionUrl: '', metodologiaFactor: '', documentos: [],
  },
]

FACTORES.forEach(f => { f.status = statusFromScore(f.score); f.color = STATUS_COLOR[f.status] })

export const EQUIPO_GENERAL = [
  { n: 'Adanud Segundo Meza Valle', cargo: 'Director del programa', rol: 'Liderazgo del proceso de autoevaluación', color: 'var(--ug-azul)' },
  { n: 'Dra. Luz Marina Ipuana', cargo: 'Coordinadora de autoevaluación', rol: 'Articulación metodológica', color: 'var(--ug-amarillo)' },
  { n: 'Dr. Héctor Brito Mendoza', cargo: 'Representante docente', rol: 'Líder factores investigación', color: 'var(--ug-azul)' },
  { n: 'MSc. Jorge Epieyú Palmar', cargo: 'Representante docente', rol: 'Líder factor internacionalización', color: 'var(--ug-flamingo)' },
  { n: 'Dr. Samuel Cotes Ramírez', cargo: 'Representante docente', rol: 'Análisis producción investigativa', color: 'var(--ug-amarillo)' },
  { n: 'MSc. Andrea Bolaños Curvelo', cargo: 'Coordinadora extensión', rol: 'Líder recursos y medios educativos', color: 'var(--ug-flamingo)' },
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
  { t: 'Plan de mejoramiento 2025–2026', d: 'Compromisos, metas, indicadores y seguimiento', f: '2025', size: '3.1 MB' },
  { t: 'Informe de autoevaluación 2025 — Resultados finales', d: 'Informe radicado ante el CNA el 28 jul 2025', f: '28 jul 2025', size: '21.4 MB' },
  { t: 'Documento maestro del programa', d: 'Información oficial del programa en SACES', f: 'Ene 2025', size: '6.9 MB' },
]
