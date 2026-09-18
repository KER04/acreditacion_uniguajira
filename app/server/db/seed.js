/* Carga inicial: el primer usuario administrador y el contenido del módulo
   Estudiantes.

   Los datos viven aquí como literales, no en un archivo JSON aparte: desde que
   el módulo se migró, la fuente de verdad es PostgreSQL y esto es solo la
   semilla de una instalación nueva.

   Es idempotente: el usuario no se duplica y cada tabla de contenido solo se
   rellena si está vacía, así que se puede volver a correr sin miedo. */
import 'dotenv/config'
import { randomBytes } from 'node:crypto'
import { pool, query } from './pool.js'
import { hashPassword } from '../utils/password.js'

const HONOR = [
  {"nombre":"María José Iguarán Pushaina","promedio":4.92,"semestre":8,"periodo":"2026-I","sede":"riohacha"},
  {"nombre":"Luis Enrique Gutiérrez Epiayú","promedio":4.88,"semestre":6,"periodo":"2026-I","sede":"riohacha"},
  {"nombre":"Carolina Brito Mendoza","promedio":4.85,"semestre":10,"periodo":"2026-I","sede":"riohacha"},
  {"nombre":"Samuel Cotes Jr.","promedio":4.80,"semestre":4,"periodo":"2026-I","sede":"maicao"},
  {"nombre":"Andrea Uriana Jayariyú","promedio":4.78,"semestre":8,"periodo":"2026-I","sede":"maicao"},
  {"nombre":"Jorge David Palmar","promedio":4.76,"semestre":2,"periodo":"2026-I","sede":"riohacha"},
  {"nombre":"Nayely Bolaños Curvelo","promedio":4.75,"semestre":6,"periodo":"2026-I","sede":"maicao"},
  {"nombre":"Héctor Mengual Solano","promedio":4.72,"semestre":10,"periodo":"2026-I","sede":"riohacha"},
  {"nombre":"Catalina Ipuana Pérez","promedio":4.70,"semestre":4,"periodo":"2026-I","sede":"riohacha"},
  {"nombre":"Pablo Ramírez Jusayú","promedio":4.68,"semestre":8,"periodo":"2026-I","sede":"maicao"},
]

const CALENDARIO = [
  {"titulo":"Inicio semestre 2026-II","fecha_inicio":"2026-05-26","tipo":"academico","periodo":"2026-II","sede":"ambas","destacado":false},
  {"titulo":"Plazo matrícula ordinaria","fecha_inicio":"2026-06-05","tipo":"administrativo","periodo":"2026-II","sede":"ambas","destacado":false},
  {"titulo":"Semana de receso universitario","fecha_inicio":"2026-07-25","tipo":"academico","periodo":"2026-II","sede":"ambas","destacado":false},
  {"titulo":"Exámenes parciales","fecha_inicio":"2026-08-15","tipo":"evaluacion","periodo":"2026-II","sede":"ambas","destacado":true},
  {"titulo":"Exámenes finales","fecha_inicio":"2026-09-30","tipo":"evaluacion","periodo":"2026-II","sede":"ambas","destacado":true},
  {"titulo":"Cierre académico 2026-II","fecha_inicio":"2026-10-10","tipo":"academico","periodo":"2026-II","sede":"ambas","destacado":false},
]

/* Estas dos listas estaban escritas a mano dentro de
   src/pages/comunidad/Estudiantes.jsx, donde nadie podía editarlas sin tocar
   código. Se siembran aquí para que a partir de ahora vivan en la base. */
const MODALIDADES = [
  {
    nombre: 'Trabajo de investigación', color: 'var(--ug-azul)', duracion: '2 semestres',
    descripcion: 'Monografía asociada a grupo de investigación del programa, con tutor y sustentación pública.',
    requisitos: ['Haber aprobado 140 créditos', 'Propuesta avalada por comité', 'Tutor vinculado a grupo activo', 'Sustentación pública'],
  },
  {
    nombre: 'Proyecto aplicado', color: 'var(--ug-amarillo)', duracion: '2 semestres',
    descripcion: 'Desarrollo de un producto de software, prototipo IoT o sistema que resuelva un problema concreto con aliado externo.',
    requisitos: ['Problema validado con organización', 'Carta de compromiso del aliado', 'Plan de trabajo aprobado', 'Entrega funcional + documentación'],
  },
  {
    nombre: 'Práctica profesional extendida', color: 'var(--ug-flamingo)', duracion: '8 meses',
    descripcion: 'Vinculación laboral de 8 meses con empresa o institución, con informe técnico y evaluación del jefe inmediato.',
    requisitos: ['Convenio vigente con empresa', 'Mínimo 8 meses · 40 h/sem', 'Informe técnico final', 'Evaluación de desempeño'],
  },
  {
    nombre: 'Cursar posgrado', color: 'var(--ug-negro)', duracion: '1 – 2 semestres',
    descripcion: 'Aprobación de tres asignaturas de la Maestría en Ingeniería con promedio igual o superior a 4.0.',
    requisitos: ['Admisión a maestría', 'Aprobar 3 cursos ≥ 4.0', 'Certificación académica', 'Paz y salvo'],
  },
  {
    nombre: 'Emprendimiento', color: 'var(--ug-azul)', duracion: '12 – 18 meses',
    descripcion: 'Creación y operación de una empresa de base tecnológica por al menos 12 meses con plan de negocio.',
    requisitos: ['Empresa constituida', '12 meses de operación', 'Plan de negocio validado', 'Indicadores de tracción'],
  },
  {
    nombre: 'Semillero de investigación', color: 'var(--ug-amarillo)', duracion: 'Mínimo 3 sem.',
    descripcion: 'Permanencia activa en semillero por mínimo tres semestres con productos verificables y ponencia.',
    requisitos: ['Mín. 3 semestres en semillero', 'Ponencia en evento académico', 'Producto verificable', 'Aval del director del semillero'],
  },
]

/* grupo -> [nombre, tipo, peso] */
const DOCUMENTOS = {
  'Académicos': [
    ['Reglamento estudiantil 2021', 'PDF', '1.8 MB'],
    ['Calendario académico 2026-II', 'PDF', '420 KB'],
    ['Plan de estudios completo', 'PDF', '720 KB'],
    ['Microcurrículos por asignatura', 'ZIP', '8.4 MB'],
    ['Formato cancelación asignatura', 'DOC', '42 KB'],
  ],
  'Trabajo de grado': [
    ['Guía de trabajo de grado', 'PDF', '960 KB'],
    ['Formato de propuesta', 'DOC', '110 KB'],
    ['Acta de sustentación', 'DOC', '48 KB'],
    ['Rúbrica de evaluación', 'PDF', '380 KB'],
  ],
  'Prácticas y extensión': [
    ['Convenio marco tipo', 'PDF', '1.2 MB'],
    ['Carta de presentación', 'DOC', '36 KB'],
    ['Bitácora de práctica', 'PDF', '540 KB'],
    ['Evaluación de desempeño', 'PDF', '310 KB'],
  ],
  'Bienestar y apoyos': [
    ['Subsidios y becas 2026', 'PDF', '680 KB'],
    ['Servicios de salud mental', 'PDF', '220 KB'],
    ['Apoyo alimentario', 'PDF', '180 KB'],
  ],
}

/* Egresados y bolsa de empleo. Vienen del src/data/egresados.json que existía
   antes de la migración 009, con las claves de una letra ya traducidas. El
   testimonio en vídeo se enlaza desde el panel: aquí no se inventa ninguno. */
const EGRESADOS = [
  { nombre: 'Diana Cotes Ramírez', anio_grado: '2018', cargo: 'Head of Data', empresa: 'Grupo Éxito', ciudad: 'Bogotá', pais: 'Colombia', sede: 'riohacha', color: 'var(--ug-azul)', destacado: true, orden: 0, testimonio: 'Estudié aquí, pero el mundo cabe en La Guajira. Solo hay que saber mirarlo.' },
  { nombre: 'Luis Enrique Ariza', anio_grado: '2015', cargo: 'Senior SWE', empresa: 'Globant', ciudad: 'Medellín', pais: 'Colombia', sede: 'riohacha', color: 'var(--ug-amarillo)', destacado: false, orden: 1, testimonio: 'La ingeniería te da el método; La Guajira te da el alma.' },
  { nombre: 'Nayely Epieyú Pushaina', anio_grado: '2020', cargo: 'CTO y cofundadora', empresa: 'TejerData SAS', ciudad: 'Riohacha', pais: 'Colombia', sede: 'riohacha', color: 'var(--ug-flamingo)', destacado: false, orden: 2, testimonio: 'Volví para fundar una empresa donde mis tías wayuu venden por internet.' },
  { nombre: 'Samuel Palmar Iguarán', anio_grado: '2012', cargo: 'Security Architect', empresa: 'BBVA Digital', ciudad: 'Ciudad de México', pais: 'México', sede: 'maicao', color: 'var(--ug-azul)', destacado: false, orden: 3, testimonio: 'Ningún framework me enseñó tanto como sustentar una tesis frente a mis profesores.' },
  { nombre: 'Carolina Brito Solano', anio_grado: '2019', cargo: 'PhD Researcher', empresa: 'MIT Media Lab', ciudad: 'Cambridge', pais: 'Estados Unidos', sede: 'riohacha', color: 'var(--ug-flamingo)', destacado: false, orden: 4, testimonio: 'Hago investigación en interfaces culturalmente situadas. Mi pregrado me dio ese marco.' },
]

/* Las ofertas llevan desplazamientos en días, no fechas fijas: con fechas
   escritas a mano una instalación nueva nacía con todas las vacantes vencidas
   y la bolsa se veía vacía el primer día. La última está caducada a propósito,
   para que se vea también cómo queda una cerrada. */
function enDias(dias) {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  return d.toISOString().slice(0, 10)
}

const OFERTAS = [
  {
    cargo: 'Desarrollador(a) Full-stack Jr.', empresa: 'Cluster TIC Caribe',
    ubicacion: 'Barranquilla, Atlántico', modalidad: 'Híbrido', tipo_contrato: 'Tiempo completo',
    salario: '$3.2M – $4.5M', vacantes: 2, tags: ['React', 'Node', 'PostgreSQL'],
    descripcion: 'Te sumas al equipo de producto que construye las plataformas de las empresas afiliadas al clúster.',
    responsabilidades: '- Desarrollar y mantener funcionalidades de punta a punta\n- Participar en las revisiones de código del equipo\n- Escribir pruebas de lo que entregas',
    requisitos: '- Título de Ingeniería de Sistemas o afines\n- Un año de experiencia con JavaScript moderno\n- Nociones de bases de datos relacionales',
    beneficios: '- Dos días de trabajo remoto a la semana\n- Plan de formación con certificaciones pagadas',
    contacto_email: 'talento@clustertic.co', publicada: -12, cierra: 74,
  },
  {
    cargo: 'Analista de datos', empresa: 'Ecopetrol Digital',
    ubicacion: 'Bogotá, Cundinamarca', modalidad: 'Presencial', tipo_contrato: 'Tiempo completo',
    salario: '$4.0M – $5.5M', vacantes: 1, tags: ['Python', 'SQL', 'Power BI'],
    descripcion: 'Análisis de datos operativos para las áreas de producción y mantenimiento.',
    responsabilidades: '- Construir tableros de seguimiento\n- Automatizar reportes recurrentes\n- Acompañar a las áreas en la lectura de sus indicadores',
    requisitos: '- Manejo sólido de SQL\n- Python para análisis de datos\n- Experiencia con alguna herramienta de visualización',
    contacto_email: 'seleccion@ecopetrol.com.co', publicada: -4, cierra: 21,
  },
  {
    cargo: 'Ingeniero(a) DevOps', empresa: 'TejerData SAS',
    ubicacion: 'Riohacha, La Guajira', modalidad: 'Remoto', tipo_contrato: 'Tiempo completo',
    salario: '$5.0M – $7.0M', vacantes: 1, tags: ['AWS', 'Kubernetes', 'CI/CD'],
    descripcion: 'Empresa fundada por una egresada del programa. Buscan quien monte y sostenga su infraestructura.',
    responsabilidades: '- Diseñar y mantener los despliegues automatizados\n- Vigilar el coste y el rendimiento de la nube\n- Documentar lo que montes',
    requisitos: '- Experiencia con AWS o similar\n- Contenedores y orquestación\n- Autonomía para trabajar en remoto',
    beneficios: '- Totalmente remoto desde cualquier ciudad\n- Participación en la empresa a partir del segundo año',
    contacto_email: 'hola@tejerdata.co', publicada: -28, cierra: 120,
  },
  {
    cargo: 'Coordinador(a) de transformación digital', empresa: 'Alcaldía de Riohacha',
    ubicacion: 'Riohacha, La Guajira', modalidad: 'Presencial', tipo_contrato: 'Prestación de servicios',
    salario: '$6.5M', vacantes: 1, tags: ['Gestión', 'TIC pública'],
    descripcion: 'Liderar la agenda de gobierno digital del municipio durante la vigencia.',
    requisitos: '- Experiencia en proyectos del sector público\n- Conocimiento del marco de gobierno digital\n- Capacidad de interlocución con equipos técnicos y directivos',
    contacto_email: 'contratacion@riohacha.gov.co', publicada: -75, cierra: 9,
  },
  {
    cargo: 'Practicante de ciberseguridad', empresa: 'Sura Tecnología',
    ubicacion: 'Medellín, Antioquia', modalidad: 'Híbrido', tipo_contrato: 'Práctica',
    salario: 'SMLV + auxilio', vacantes: 3, tags: ['SIEM', 'Auditoría'],
    descripcion: 'Práctica de seis meses dentro del centro de operaciones de seguridad.',
    requisitos: '- Estar cursando los dos últimos semestres\n- Fundamentos de redes y sistemas operativos',
    beneficios: '- Acompañamiento de un mentor del equipo\n- Posibilidad de vinculación al terminar',
    contacto_email: 'practicas@sura.com.co', publicada: -160, cierra: -40,
  },
]

/* Recursos de infraestructura tecnológica.
 *
 * A diferencia del resto de semillas, esto NO son ejemplos: son las cifras
 * publicadas por la propia universidad, cada una con el enlace de donde salió.
 * Por eso se puede sembrar sin reparos —no se está inventando nada— y por eso
 * cada fila lleva su fuente: son datos que revisa un par académico del CNA y
 * un número sin procedencia no vale como evidencia.
 *
 * Consultado el 2026-09-18. Si la universidad publica cifras nuevas, se
 * corrigen desde el panel; esto es solo el punto de partida. */
const FUENTE_TEC = 'https://uniguajira.edu.co/universidad-de-la-guajira/direccion-de-sistemas/resena-historica-de-tecnologia/'
const FUENTE_SILAB = 'https://uniguajira.edu.co/universidad-de-la-guajira/silab/presentacion-del-sistema-integral-de-laboratorios/descripcion-del-sistema-integral-de-laboratorios'
const FUENTE_SIF = 'https://uniguajira.edu.co/uniguajira-primera-universidad-de-colombia-en-integrar-el-sistema-sif-400/'

const N_TEC = 'Dirección de Sistemas · Reseña histórica de tecnología'
const N_SILAB = 'SILAB · Descripción del Sistema Integral de Laboratorios'
const N_SIF = 'Uniguajira, primera universidad de Colombia en integrar el SIF-400'

const INFRAESTRUCTURA = [
  {
    nombre: 'Bloque Tecnológico (Bloque 8)', categoria: 'espacio', sede: 'riohacha',
    ubicacion: 'Sede Riohacha, km 3+354 vía Maicao', area_m2: 6859, anio: 2019,
    destacado: true, orden: 0,
    descripcion: 'Edificio dedicado a los servicios tecnológicos de la universidad. Concentra las salas de informática, las salas de audiovisuales, los laboratorios especializados y las oficinas de la Dirección de Sistemas. Sus espacios son accesibles para personas con discapacidad.',
    equipamiento: '- Capacidad para 1.163 estudiantes en simultáneo\n- 6.859 m² construidos\n- 782 puntos de red categoría 7A\n- Cobertura WiFi en todo el bloque\n- Accesible para personas con discapacidad',
    fuente_url: FUENTE_TEC, fuente_nombre: N_TEC,
  },
  {
    nombre: 'Salas de informática', categoria: 'computo', sede: 'riohacha',
    ubicacion: 'Bloque Tecnológico (Bloque 8)', cantidad: 22, capacidad: 30, anio: 2019,
    destacado: true, orden: 1,
    descripcion: 'Veintidós salas de informática con puestos de 20, 30 y 40 equipos. Son el espacio donde se dictan las asignaturas prácticas del programa y donde los estudiantes trabajan fuera de clase.',
    equipamiento: '- 22 salas en servicio\n- Configuraciones de 20, 30 y 40 puestos\n- Ubicadas en el Bloque Tecnológico',
    fuente_url: FUENTE_TEC, fuente_nombre: N_TEC,
  },
  {
    nombre: 'Salas de audiovisuales', categoria: 'audiovisual', sede: 'riohacha',
    ubicacion: 'Bloque Tecnológico (Bloque 8)', cantidad: 8, capacidad: 59, anio: 2019, orden: 2,
    descripcion: 'Ocho salas de audiovisuales de 56 y 62 puestos, para clases magistrales, sustentaciones, seminarios y eventos académicos del programa.',
    equipamiento: '- 8 salas en servicio\n- Configuraciones de 56 y 62 puestos',
    fuente_url: FUENTE_TEC, fuente_nombre: N_TEC,
  },
  {
    nombre: 'Laboratorio de Redes', categoria: 'laboratorio', sede: 'riohacha',
    ubicacion: 'Bloque Tecnológico (Bloque 8)', cantidad: 1, capacidad: 35, anio: 2023,
    destacado: true, orden: 3,
    descripcion: 'Laboratorio dedicado a las asignaturas de redes y comunicaciones. Puesto en servicio en 2023 con 35 puestos de trabajo. El SILAB reporta laboratorios de redes tanto en Riohacha como en Maicao.',
    equipamiento: '- 35 puestos de trabajo\n- En servicio desde 2023\n- También disponible en la sede Maicao',
    fuente_url: FUENTE_TEC, fuente_nombre: N_TEC,
  },
  {
    nombre: 'Laboratorio de Sistemas de Información Geográfica (SIG)', categoria: 'laboratorio', sede: 'riohacha',
    ubicacion: 'Bloque Tecnológico (Bloque 8), piso 2', cantidad: 1, orden: 4,
    descripcion: 'Laboratorio de SIG para el trabajo con información georreferenciada. Según el SILAB, el programa cuenta con este laboratorio en las sedes de Riohacha y Fonseca.',
    equipamiento: '- Ubicado en el piso 2 del Bloque Tecnológico\n- También disponible en la sede Fonseca',
    fuente_url: FUENTE_TEC, fuente_nombre: N_TEC,
  },
  {
    nombre: 'Sala de Dibujo Sistematizada', categoria: 'computo', sede: 'riohacha',
    ubicacion: 'Bloque Tecnológico (Bloque 8)', cantidad: 1, capacidad: 35, anio: 2023, orden: 5,
    descripcion: 'Sala equipada para dibujo técnico y diseño asistido por computador, en servicio desde 2023 con 35 puestos.',
    equipamiento: '- 35 puestos de trabajo\n- En servicio desde 2023',
    fuente_url: FUENTE_TEC, fuente_nombre: N_TEC,
  },
  {
    nombre: 'Laboratorio de Idiomas', categoria: 'laboratorio', sede: 'riohacha',
    ubicacion: 'Bloque Tecnológico (Bloque 8), piso 2', cantidad: 1, orden: 6,
    descripcion: 'Laboratorio de inmersión para el aprendizaje de idiomas. Relevante para el programa porque el módulo de inglés es una de las cinco competencias que evalúan las pruebas Saber Pro.',
    equipamiento: '- Ambiente de aprendizaje inmersivo\n- Ubicado en el piso 2 del Bloque Tecnológico',
    fuente_url: FUENTE_SILAB, fuente_nombre: N_SILAB,
  },
  {
    nombre: 'Sala de Préstamo de Portátiles', categoria: 'espacio', sede: 'riohacha',
    ubicacion: 'Bloque Tecnológico (Bloque 8), piso 2', cantidad: 1, orden: 7,
    descripcion: 'Servicio de préstamo de computadores portátiles para el trabajo académico de los estudiantes dentro del campus.',
    fuente_url: FUENTE_TEC, fuente_nombre: N_TEC,
  },
  {
    nombre: 'Conectividad del campus', categoria: 'conectividad', sede: 'riohacha',
    ubicacion: 'Todo el campus', anio: 2023, destacado: true, orden: 8,
    descripcion: 'La universidad amplió en 2023 el ancho de banda de internet a 3 GB y migró la red inalámbrica a WiFi 6. El cableado estructurado se migró a categoría 7A en 2021, junto con nueva fibra óptica entre bloques.',
    equipamiento: '- 3 GB de ancho de banda de internet (2023)\n- WiFi 6 con Access Point Ruckus (2023)\n- Cableado estructurado UTP categoría 7A (2021)\n- Fibra óptica entre bloques (2021)\n- 782 puntos de red 7A en el Bloque Tecnológico',
    fuente_url: FUENTE_TEC, fuente_nombre: N_TEC,
  },
  {
    nombre: 'SILAB · Sistema Integral de Laboratorios', categoria: 'laboratorio', sede: 'ambas',
    cantidad: 1, orden: 9,
    descripcion: 'El sistema que agrupa y administra todos los laboratorios de la universidad, certificado bajo la norma NTC ISO 9001:2015. De los laboratorios de docencia que reporta, los de Redes y los de Sistemas de Información Geográfica son los que sirven directamente al programa.',
    equipamiento: '- Certificado NTC ISO 9001:2015\n- Laboratorios de docencia, de investigación y de extensión\n- Laboratorio de Redes en Riohacha y Maicao\n- Laboratorio de SIG en Riohacha y Fonseca',
    fuente_url: FUENTE_SILAB, fuente_nombre: N_SILAB,
  },
  {
    nombre: 'SIF-400 · Sistema educativo para la Industria 4.0', categoria: 'laboratorio', sede: 'riohacha',
    ubicacion: 'Laboratorio de Procesos Industriales (SILAB)', cantidad: 1, anio: 2025,
    destacado: true, orden: 10,
    descripcion: 'Plataforma que emula una fábrica inteligente automatizada, instalada en el Laboratorio de Procesos Industriales del SILAB. Uniguajira fue la primera universidad de Colombia en integrarlo completo y la tercera de América Latina. Beneficia a Ingeniería de Sistemas junto con Industrial y Mecánica.',
    equipamiento: '- 13 estaciones interconectadas\n- Cerca de 18 tecnologías integradas\n- Control por visión artificial\n- Robots colaborativos y dispositivos inteligentes\n- Software de gestión industrial\n- Permite acceso remoto e híbrido',
    fuente_url: FUENTE_SIF, fuente_nombre: N_SIF,
  },
]

async function estaVacia(tabla) {
  const { rows } = await query('SELECT COUNT(*)::int AS n FROM ' + tabla)
  return rows[0].n === 0
}

async function sembrarAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? 'admin@uniguajira.edu.co').trim().toLowerCase()
  const nombre = process.env.ADMIN_NOMBRE ?? 'Administrador del programa'

  const { rows } = await query('SELECT id FROM usuarios WHERE lower(email) = $1', [email])
  if (rows[0]) {
    console.log('  usuario   ' + email + ' ya existe, no se toca')
    return
  }

  // Sin ADMIN_PASSWORD generamos una contraseña fuerte y la mostramos una sola vez.
  const generada = !process.env.ADMIN_PASSWORD
  const password = process.env.ADMIN_PASSWORD || randomBytes(12).toString('base64url')

  await query(
    'INSERT INTO usuarios (email, nombre, password_hash, rol) VALUES ($1, $2, $3, $4)',
    [email, nombre, await hashPassword(password), 'admin'],
  )

  console.log('  usuario   ' + email + ' creado (rol admin)')
  if (generada) {
    console.log('')
    console.log('  ATENCION: contraseña generada, no vuelve a mostrarse:')
    console.log('      ' + password)
    console.log('')
  }
}

async function sembrarEstudiantes() {
  if (await estaVacia('cuadro_honor')) {
    for (const h of HONOR) {
      await query(
        'INSERT INTO cuadro_honor (nombre, promedio, semestre, periodo, sede, foto_url) VALUES ($1, $2, $3, $4, $5, $6)',
        [h.nombre, h.promedio, h.semestre, h.periodo, h.sede, ''],
      )
    }
    console.log('  honor      ' + HONOR.length + ' registros')
  } else console.log('  honor      ya tiene datos, se omite')

  if (await estaVacia('calendario_academico')) {
    for (const c of CALENDARIO) {
      await query(
        'INSERT INTO calendario_academico (titulo, fecha_inicio, tipo, periodo, sede, destacado) VALUES ($1, $2, $3, $4, $5, $6)',
        [c.titulo, c.fecha_inicio, c.tipo, c.periodo, c.sede, c.destacado],
      )
    }
    console.log('  calendario ' + CALENDARIO.length + ' registros')
  } else console.log('  calendario ya tiene datos, se omite')

  if (await estaVacia('modalidades_grado')) {
    for (const [i, m] of MODALIDADES.entries()) {
      await query(
        'INSERT INTO modalidades_grado (nombre, descripcion, requisitos, duracion, color, orden) VALUES ($1, $2, $3, $4, $5, $6)',
        [m.nombre, m.descripcion, m.requisitos, m.duracion, m.color, i],
      )
    }
    console.log('  modalidades ' + MODALIDADES.length + ' registros')
  } else console.log('  modalidades ya tiene datos, se omite')

  if (await estaVacia('documentos_estudiantes')) {
    let n = 0
    for (const [grupo, items] of Object.entries(DOCUMENTOS)) {
      for (const [i, [nombre, tipo, peso]] of items.entries()) {
        await query(
          'INSERT INTO documentos_estudiantes (nombre, tipo, peso, grupo, orden) VALUES ($1, $2, $3, $4, $5)',
          [nombre, tipo, peso, grupo, i],
        )
        n++
      }
    }
    console.log('  documentos ' + n + ' registros')
  } else console.log('  documentos ya tiene datos, se omite')
}

async function sembrarEgresados() {
  if (await estaVacia('egresado')) {
    for (const e of EGRESADOS) {
      await query(
        `INSERT INTO egresado (nombre, anio_grado, cargo, empresa, ciudad, pais, sede, color, destacado, orden, testimonio)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [e.nombre, e.anio_grado, e.cargo, e.empresa, e.ciudad, e.pais, e.sede, e.color, e.destacado, e.orden, e.testimonio],
      )
    }
    console.log('  egresados  ' + EGRESADOS.length + ' registros')
  } else console.log('  egresados  ya tiene datos, se omite')

  if (await estaVacia('oferta_empleo')) {
    for (const o of OFERTAS) {
      await query(
        `INSERT INTO oferta_empleo
           (cargo, empresa, ubicacion, modalidad, tipo_contrato, salario, vacantes, tags,
            descripcion, responsabilidades, requisitos, beneficios, contacto_email,
            fecha_publicacion, fecha_cierre)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          o.cargo, o.empresa, o.ubicacion, o.modalidad, o.tipo_contrato, o.salario, o.vacantes,
          o.tags, o.descripcion, o.responsabilidades ?? '', o.requisitos ?? '', o.beneficios ?? '',
          o.contacto_email, enDias(o.publicada), enDias(o.cierra),
        ],
      )
    }
    console.log('  ofertas    ' + OFERTAS.length + ' registros')
  } else console.log('  ofertas    ya tiene datos, se omite')
}

async function sembrarInfraestructura() {
  if (!(await estaVacia('recurso_infraestructura'))) {
    console.log('  infraestructura ya tiene datos, se omite')
    return
  }
  const campos = [
    'nombre', 'categoria', 'descripcion', 'sede', 'ubicacion', 'cantidad', 'capacidad',
    'area_m2', 'anio', 'equipamiento', 'fuente_url', 'fuente_nombre', 'destacado', 'orden',
  ]
  const marcadores = campos.map((_, i) => '$' + (i + 1)).join(', ')
  for (const r of INFRAESTRUCTURA) {
    await query(
      'INSERT INTO recurso_infraestructura (' + campos.join(', ') + ') VALUES (' + marcadores + ')',
      campos.map(c => {
        const v = r[c]
        if (v !== undefined) return v
        // Los textos de la tabla son NOT NULL con defecto ''; los numéricos aceptan NULL.
        return ['cantidad', 'capacidad', 'area_m2', 'anio'].includes(c) ? null
          : (c === 'destacado' ? false : (c === 'orden' ? 0 : ''))
      }),
    )
  }
  console.log('  infraestructura ' + INFRAESTRUCTURA.length + ' registros')
}

async function main() {
  console.log('Sembrando datos iniciales...')
  await sembrarAdmin()
  await sembrarEstudiantes()
  await sembrarEgresados()
  await sembrarInfraestructura()
  console.log('Listo.')
}

main()
  .catch(e => { console.error('Error sembrando:', e.message); process.exitCode = 1 })
  .finally(() => pool.end())
