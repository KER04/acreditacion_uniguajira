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

async function main() {
  console.log('Sembrando datos iniciales...')
  await sembrarAdmin()
  await sembrarEstudiantes()
  console.log('Listo.')
}

main()
  .catch(e => { console.error('Error sembrando:', e.message); process.exitCode = 1 })
  .finally(() => pool.end())
