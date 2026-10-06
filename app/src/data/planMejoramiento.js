/* Plan de mejoramiento 2025-I del programa.

   Cada acción se transcribe tal cual del formato oficial
   (public/docs/estudiantes/PLAN DE MEJORAMIENTO 2025 I ING DE SISTEMAS.xlsx):
   oportunidad, acción, indicador, metas, fechas, responsables, estado y
   % de cumplimiento. No se corrige ni se interpreta lo que dice el formato;
   solo se normaliza la escritura de las fechas.

   El bloque `contexto` NO sale del Excel: son cifras de la presentación del
   factor ante los pares evaluadores (los .pptx de la misma carpeta) que
   explican por qué existe la acción. Cada bloque dice de qué presentación
   viene. El Factor 7 no tiene presentación propia; sus cifras salen de la del
   Factor 5, que las trae en «Flexibilidad de los aspectos curriculares». */

const DOCS = '/docs/estudiantes/'
const doc = nombre => DOCS + encodeURIComponent(nombre)

export const PLAN_META = {
  titulo: 'Plan de mejoramiento 2025-I',
  programa: 'Ingeniería de Sistemas',
  facultad: 'Ingeniería',
  registro: 'Registro calificado y acreditación: Resolución 014528 del 28/07/2022',
  /* El Excel vive en public/descargas/ (sí va en git y en el despliegue;
     public/docs/ está ignorado). `nombre` es como se guarda al descargarlo. */
  formato: {
    t: 'Descargar el formato oficial del plan (Excel)',
    url: '/descargas/plan-de-mejoramiento-2025-I.xlsx',
    nombre: 'PLAN DE MEJORAMIENTO 2025 I ING DE SISTEMAS.xlsx',
  },
}

/* Estados tal como aparecen en el formato; la clave decide el color. */
export const ESTADOS = {
  planeacion: { label: 'En planeación', tono: 'ambar' },
  ejecucion:  { label: 'En ejecución',  tono: 'azul' },
}

export const ACCIONES = [
  {
    slug: 'factor-3',
    factor: 3,
    factorNombre: 'Profesores',
    oportunidad: 'Fortalecer la participación de docentes de la sede Maicao en capacitaciones pedagógicas en educación superior.',
    accion: 'Diseñar e implementar un ciclo de formación pedagógica en educación superior para docentes de la sede Maicao.',
    vinculacion: 'Fortalecimiento de la formación en docencia universitaria con miras a mejorar el desarrollo pedagógico.',
    peso: 10,
    indicador: 'Número de docentes de la sede Maicao que participan en al menos una capacitación pedagógica.',
    metas: { corto: '5 docentes', mediano: '10 docentes', largo: '15 docentes' },
    descripcion: 'Se desarrollarán jornadas formativas semestrales, presenciales y virtuales, sobre pedagogía universitaria, evaluación por competencias, educación inclusiva y tecnologías aplicadas.',
    recursos: 'Recursos humanos, recursos físicos y recursos tecnológicos.',
    inicio: '25 de junio de 2025',
    fin: '25 de noviembre de 2025',
    responsables: 'Dirección académica del programa · Vicerrectoría Académica',
    involucrados: 'Docentes de la sede Maicao',
    verificacion: 'Listados de asistencia y evidencias fotográficas.',
    estado: 'planeacion',
    cumplimiento: 35,
    contexto: {
      fuente: { t: 'Presentación del Factor 3 · Comunidad de profesores', url: doc('factor 3.pptx') },
      intro: 'El Factor 3 se cumple plenamente en siete de sus ocho características (la remuneración por méritos se cumple en alto grado). La acción apunta a Maicao porque allí la planta es más pequeña y la mayor parte del cuerpo docente es de cátedra.',
      cifras: [
        { v: '51', l: 'docentes en Maicao (2024-2): 5 de planta, 7 ocasionales y 39 de cátedra' },
        { v: '70', l: 'docentes en Riohacha (2024-2): 15 de planta, 7 ocasionales y 48 de cátedra' },
        { v: '30,67', l: 'estudiantes por docente en Maicao en 2024-2 (Riohacha: 30,13)' },
        { v: '8', l: 'profesores nuevos de planta en 2024-2: 5 en Riohacha y 3 en Maicao' },
      ],
      puntos: [
        'La evaluación docente es semestral: autoevaluación 20 %, coevaluación 20 %, estudiantes 30 % y administrativa 30 %.',
        'En 2024-2 los 5 docentes de planta y los 7 ocasionales de Maicao obtuvieron «Excelente»; de los 39 de cátedra, 29 «Excelente», 9 «Sobresaliente» y 1 «Aceptable».',
        'El plan institucional de capacitación ya incluye la línea «Pedagogía, currículo, didáctica y evaluación».',
        'Se otorgaron 8 comisiones de estudio al programa: 7 de doctorado y 1 de maestría.',
      ],
    },
  },
  {
    slug: 'factor-5',
    factor: 5,
    factorNombre: 'Aspectos académicos y resultados de aprendizaje',
    oportunidad: 'Mejorar el desempeño general de los estudiantes en las pruebas Saber Pro.',
    accion: 'Diseñar e implementar un plan integral de preparación para las pruebas Saber Pro, con componentes específicos por competencias genéricas y específicas.',
    vinculacion: 'Plan de Acción Institucional 2025 · Proyecto: Fortalecimiento académico de los estudiantes. Acción: implementar estrategias académicas que mejoren el rendimiento en pruebas externas.',
    peso: 15,
    indicador: 'Variación positiva en el puntaje promedio global y por competencias en Saber Pro.',
    metas: {
      corto: 'Mejorar 5 % en lectura crítica y razonamiento cuantitativo',
      mediano: 'Implementar 2 asignaturas extracurriculares (Saber Pro I y II)',
      largo: 'Alcanzar un promedio superior al nacional en al menos 3 competencias',
    },
    descripcion: 'El plan incluirá simulacros regulares, tutorías focalizadas, talleres con egresados destacados, acompañamiento académico personalizado y dos asignaturas extracurriculares orientadas al fortalecimiento de competencias genéricas.',
    recursos: 'Plataforma de evaluación, recursos docentes, materiales impresos y digitales.',
    inicio: 'Segundo semestre de 2025',
    fin: 'Segundo semestre de 2026',
    responsables: 'Coordinación del programa · Comité Curricular · Dirección de Docencia',
    involucrados: 'Docentes, estudiantes, egresados y tutores',
    verificacion: 'Reportes de simulacros, actas, resultados de Saber Pro y planillas de seguimiento.',
    estado: 'ejecucion',
    cumplimiento: 25,
    contexto: {
      fuente: { t: 'Presentación del Factor 5 · Aspectos académicos y resultados de aprendizaje', url: doc('Factor 5.pptx') },
      intro: 'El Factor 5 obtuvo 92,98 y se cumple plenamente, pero la propia autoevaluación deja abierta una brecha: el programa sigue por debajo del grupo de referencia nacional en Saber Pro.',
      serie: {
        titulo: 'Puntaje global del programa en Saber Pro',
        datos: [
          { a: 2020, v: 144 }, { a: 2021, v: 137 }, { a: 2022, v: 144 },
          { a: 2023, v: 135 }, { a: 2024, v: 140 }, { a: 2025, v: 143 },
        ],
        nota: 'Escala de 0 a 300. En 2025 la institución promedió 135 y el grupo de referencia NBC (Ingeniería de Sistemas, Telemática y afines), 153.',
      },
      cifras: [
        { v: '143', l: 'puntaje global en 2025: el mejor registro del programa desde 2022' },
        { v: '+8', l: 'puntos sobre el promedio institucional en 2025' },
        { v: '−10', l: 'puntos frente al grupo de referencia nacional: la brecha vigente' },
        { v: '19', l: 'puntos de brecha en Inglés en 2025: el módulo con mayor distancia' },
      ],
      puntos: [
        'Comunicación escrita pasó de 118 a 145 entre 2024 y 2025.',
        'Saber Pro I y II funcionan como asignaturas transversales, y desde 2024-II todas las asignaturas aplican evaluaciones tipo Saber Pro.',
        'Ante los empleadores que pidieron más inglés técnico, el programa respondió con talleres de inglés técnico.',
      ],
      enlace: { t: 'Ver resultados Saber Pro', to: '/saber-pro' },
    },
  },
  {
    slug: 'factor-6',
    factor: 6,
    factorNombre: 'Permanencia y graduación',
    oportunidad: 'Fortalecer el seguimiento de los estudiantes identificados por el sistema de alertas tempranas.',
    accion: 'Diseñar e implementar un protocolo para el seguimiento académico y psicosocial de los estudiantes identificados por el sistema de alertas tempranas, que contemple responsables, tiempos de intervención, rutas de remisión y mecanismos de evaluación del impacto.',
    vinculacion: 'Plan de Acción Institucional 2025 · Proyecto: Fortalecimiento académico de los estudiantes. Acción: implementar estrategias académicas que mejoren el rendimiento en pruebas externas.',
    peso: 15,
    indicador: 'Porcentaje de estudiantes identificados por alertas tempranas que fueron atendidos bajo el protocolo institucional.',
    metas: { corto: '20 % de estudiantes atendidos', mediano: '70 % de estudiantes atendidos', largo: '100 % de estudiantes atendidos' },
    descripcion: 'Diseñar e implementar un protocolo de seguimiento académico y psicosocial para los estudiantes identificados por el sistema de alertas tempranas, con el fin de garantizar una intervención oportuna y sistemática que contribuya a la permanencia estudiantil y al éxito académico.',
    recursos: 'Recursos humanos.',
    inicio: 'Segundo semestre de 2025',
    fin: 'Permanente',
    responsables: 'Coordinación del programa · Comité Curricular · Bienestar Universitario',
    involucrados: 'Estudiantes',
    verificacion: 'Un informe anual.',
    estado: 'ejecucion',
    cumplimiento: 25,
    contexto: {
      fuente: { t: 'Presentación de Bienestar Social Universitario · Factores 6 y 9', url: doc('factor 6.pptx') },
      intro: 'El Sistema de Alertas Tempranas (SIAT) es el diagnóstico que se hace a los estudiantes que entran a primer semestre para anticipar los riesgos que pueden hacerles abandonar. La acción convierte esa detección en un seguimiento con responsables y tiempos definidos.',
      riesgos: ['Socioeconómico', 'Familiar', 'Académico', 'Individual'],
      cifras: [
        { v: '1.515', l: 'atenciones de permanencia y graduación en Riohacha en 2024 (187 en 2020)' },
        { v: '493', l: 'atenciones de permanencia y graduación en Maicao en 2024' },
        { v: '90 %', l: 'calificación de la característica 27 (cumplimiento pleno)' },
        { v: '95 %', l: 'calificación de la característica 28 (cumplimiento pleno)' },
      ],
      puntos: [
        'Servicios de permanencia: tutorías, acompañamiento al aprendizaje, atención a repitentes, promoción a la graduación exitosa y mentoría.',
        'Marco: política de acceso, admisión, permanencia y graduación exitosa (Acuerdo 016 de 2023).',
        'Entre 2020 y 2024, Bienestar vinculó a 1.116 estudiantes del programa de grupos priorizados: afrocolombianos, personas con discapacidad, víctimas del conflicto, indígenas, desplazados, Rom y comunidad LGBTIQ+.',
        'La plataforma Adviser pasó de la versión 7.0 a la 10.0, con seguimiento personalizado y remisión entre servicios.',
      ],
    },
  },
  {
    slug: 'factor-7',
    factor: 7,
    factorNombre: 'Interacción con el entorno nacional e internacional',
    oportunidad: 'Ausencia de convenios de doble titulación formalizados con instituciones extranjeras.',
    accion: 'Formalizar al menos un convenio de doble titulación con una universidad extranjera.',
    vinculacion: 'Plan de Acción Institucional 2025 · Proyecto: Internacionalización del currículo. Acción: promover convenios internacionales que favorezcan la doble titulación y el reconocimiento mutuo de programas académicos.',
    peso: 25,
    indicador: 'Número de convenios de doble titulación formalizados.',
    metas: {
      corto: 'Diseño de la propuesta con requisitos académicos compatibles',
      mediano: 'Formalización de 1 convenio',
      largo: 'Implementación y movilidad de al menos 3 estudiantes',
    },
    descripcion: 'Se desarrollará un estudio de equivalencias curriculares por resultados de aprendizaje con universidades aliadas, se establecerán mesas de trabajo con contrapartes académicas y se gestionará la firma del convenio. Posteriormente se iniciará la fase de implementación.',
    recursos: 'Comisión de internacionalización, traducción de documentos, asesoría jurídica y reuniones internacionales (virtuales y presenciales).',
    inicio: '15 de agosto de 2025',
    fin: '30 de junio de 2026',
    responsables: 'Coordinación del programa · Oficina de Relaciones Internacionales',
    involucrados: 'Universidades extranjeras',
    verificacion: 'Acta del convenio firmado, plan de homologación aprobado y evidencia de movilidad estudiantil.',
    estado: 'ejecucion',
    cumplimiento: 25,
    contexto: {
      fuente: { t: 'Presentación del Factor 5 · Flexibilidad de los aspectos curriculares', url: doc('Factor 5.pptx') },
      intro: 'Es la acción de mayor peso del plan. El programa ya tiene movilidad e internacionalización activas, pero ninguna termina en un doble título: esa es la pieza que falta.',
      cifras: [
        { v: '+250', l: 'estudiantes en actividades de internacionalización del currículo entre 2022 y 2024' },
        { v: '+60', l: 'actividades internacionales en el mismo periodo' },
        { v: '6', l: 'intercambios y 10 pasantías virtuales' },
        { v: '44 %', l: 'de los estudiantes adopta la movilidad académica como ruta de formación' },
      ],
      puntos: [
        'La formalización exige equivalencias por resultados de aprendizaje, la misma base con la que el programa evalúa sus seis resultados en los semestres V, VIII y X.',
      ],
      enlace: { t: 'Ver convenios internacionales vigentes', to: '/internacionalizacion' },
    },
  },
  {
    slug: 'factor-8',
    factor: 8,
    factorNombre: 'Aportes de la investigación, la innovación, el desarrollo tecnológico y la creación',
    oportunidad: 'Fortalecer la participación estudiantil en semilleros de investigación.',
    accion: 'Implementar un plan de orientación para la vinculación de estudiantes a semilleros.',
    vinculacion: 'Fortalecimiento académico e investigativo.',
    peso: 15,
    indicador: 'Número de estudiantes vinculados a semilleros.',
    metas: { corto: '8', mediano: '15', largo: '25' },
    descripcion: 'Promoción de semilleros en clases, ferias y charlas.',
    recursos: 'Apoyo logístico.',
    inicio: '1 de agosto de 2025',
    fin: '30 de noviembre de 2025',
    responsables: 'Coordinación del programa · Dirección de Investigación',
    involucrados: 'Docentes y estudiantes',
    verificacion: 'Listado de inscritos, actas de semillero e informes de avance.',
    estado: 'ejecucion',
    cumplimiento: 50,
    contexto: {
      fuente: { t: 'Presentación del Factor 8 · Dirección de Investigación', url: doc('factor 8.pptx') },
      intro: 'El Factor 8 es el único del programa que se cumple en alto grado y no plenamente. La vinculación de estudiantes a semilleros subió con fuerza en 2025, sobre todo en Maicao.',
      serie: {
        titulo: 'Estudiantes vinculados a semilleros',
        datos: [
          { a: 2020, v: 60 }, { a: 2021, v: 37 }, { a: 2022, v: 32 },
          { a: 2023, v: 45 }, { a: 2024, v: 52 }, { a: 2025, v: 89 },
        ],
        nota: 'En 2025: 55 en Riohacha y 34 en Maicao (en 2023 Maicao tenía 2).',
      },
      cifras: [
        { v: '10', l: 'líneas de investigación del programa (Acuerdo 006 de 2025)' },
        { v: '8', l: 'grupos de investigación asociados al programa (Convocatoria 957 de 2024)' },
        { v: '43', l: 'estudiantes en 18 proyectos de investigación entre 2020 y 2025' },
        { v: '14', l: 'productos de estudiantes en CTI: 9 ponencias, 3 software y 2 artículos' },
      ],
      puntos: [
        'Semilleros con participación destacada: SISS y SecTec (Riohacha) y D’proit (Maicao), presentes en EDESI 2023 y ENISI–RedColsi 2024.',
        'La participación en grupos de investigación sirve como opción de grado (trabajo, artículo o pasantía de investigación).',
      ],
      enlace: { t: 'Ver grupos y semilleros', to: '/investigacion' },
    },
  },
]

/* Avance del plan ponderado por el peso que el formato asigna a cada acción.
   Ojo: los pesos declarados suman 80 %, no 100 %; por eso se divide entre la
   suma real y no entre 100. */
export function avancePonderado(acciones = ACCIONES) {
  const peso = acciones.reduce((a, x) => a + x.peso, 0)
  if (!peso) return 0
  return acciones.reduce((a, x) => a + x.cumplimiento * x.peso, 0) / peso
}

export const pesoDeclarado = (acciones = ACCIONES) => acciones.reduce((a, x) => a + x.peso, 0)
