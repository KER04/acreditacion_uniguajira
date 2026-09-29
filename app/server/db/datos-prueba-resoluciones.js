/* Datos de PRUEBA para /resoluciones: sirven para ver el diseño con la lista
   de «Otros actos» llena, con PDF, con enlace externo y con un acto vencido.

   NO son actos reales. Cada uno lleva MARCA al final de la descripción (se
   ve en la ficha flotante), y así se encuentran para borrarlos:

     node server/db/datos-prueba-resoluciones.js           -> los carga
     node server/db/datos-prueba-resoluciones.js --borrar  -> los quita (y sus PDF)

   No toca los actos reales (02872 y 014528): solo inserta y borra filas con
   la marca. Si ya están cargados, no los duplica. */
import 'dotenv/config'
import { pool, query } from './pool.js'
import { borrarSiHuerfano } from '../utils/archivos.js'

const MARCA = '[DATO DE PRUEBA]'

/* PDF mínimo válido de una página, para que «Descargar PDF» abra algo. */
function pdfDePrueba(titulo) {
  const texto = `(${titulo.replace(/[()\\]/g, '')}) Tj`
  const flujo = `BT /F1 18 Tf 60 740 Td ${texto} 0 -30 Td (Documento de prueba - no es un acto real) Tj ET`
  const objetos = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${flujo.length} >>\nstream\n${flujo}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = []
  objetos.forEach((o, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${o}\nendobj\n` })
  const xref = pdf.length
  pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`
  pdf += offsets.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('')
  pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(pdf, 'latin1')
}

async function guardarPdf(nombre, titulo) {
  const buf = pdfDePrueba(titulo)
  const { rows } = await query(
    `INSERT INTO archivos (nombre_original, extension, mime, bytes, contenido)
     VALUES ($1, 'pdf', 'application/pdf', $2, $3) RETURNING id`,
    [nombre, buf.length, buf.toString('base64')],
  )
  return rows[0].id
}

const ACTOS = [
  { categoria: 'otro', tipo: 'Acuerdo', numero: '045 de 2024', fecha: '2024-08-14', expedido_por: 'Consejo Académico',
    asunto: 'Aprobación de la actualización curricular del programa', pdf: true,
    resumen: 'Aprueba la actualización del plan de estudios de Ingeniería de Sistemas, que pasa de diez a ocho semestres y reorganiza los créditos en núcleos de formación básica, profesional y de profundización.\n\nFija un periodo de transición: los estudiantes que ya cursan el plan anterior pueden terminarlo o acogerse al nuevo con un estudio de homologación, y el plan anterior deja de ofrecer cupos nuevos desde su entrada en vigor.' },
  { categoria: 'otro', tipo: 'Resolución', numero: '0238 de 2024', fecha: '2024-10-02', expedido_por: 'Rectoría',
    asunto: 'Adopción del Proyecto Educativo del Programa (PEP) actualizado', pdf: true,
    resumen: 'Adopta la versión actualizada del Proyecto Educativo del Programa: la misión, la visión, el perfil de egreso y los lineamientos pedagógicos con los que se orienta la formación de los ingenieros de sistemas.\n\nOrdena revisarlo cada cinco años o antes si cambia el plan de estudios, y deroga la versión anterior.' },
  { categoria: 'otro', tipo: 'Acuerdo', numero: '018 de 2021', fecha: '2021-06-10', expedido_por: 'Consejo Superior',
    asunto: 'Reglamento estudiantil', url: 'https://uniguajira.edu.co/',
    resumen: 'Establece los derechos y deberes de los estudiantes de pregrado: admisión, matrícula, evaluación, calificaciones, cancelación de asignaturas, régimen disciplinario y requisitos de grado.\n\nEs de alcance institucional: aplica a todos los programas de la universidad, no solo a Ingeniería de Sistemas.' },
  { categoria: 'otro', tipo: 'Acuerdo', numero: '012 de 2023', fecha: '2023-03-22', expedido_por: 'Consejo Académico',
    asunto: 'Política de opciones de grado', pdf: true,
    resumen: 'Define las modalidades con las que un estudiante puede optar al título: trabajo de investigación, proyecto aplicado, práctica profesional extendida, cursar créditos de posgrado, emprendimiento y participación en semillero.\n\nPara cada una fija los requisitos mínimos, la duración y quién evalúa el resultado.' },
  { categoria: 'otro', tipo: 'Resolución', numero: '0412 de 2023', fecha: '2023-11-15', expedido_por: 'Rectoría',
    asunto: 'Designación del director del programa',
    resumen: 'Designa al director del programa de Ingeniería de Sistemas y le asigna las funciones de coordinación académica, seguimiento del plan de mejoramiento y representación del programa ante el Consejo de Facultad.' },
  /* Un registro calificado ANTERIOR, ya vencido: como es más viejo que el
     02872, no desplaza la tarjeta grande y baja a la lista marcado «vencido». */
  { categoria: 'registro', tipo: 'Resolución', numero: '1102 de 2011', fecha: '2011-02-18', expedido_por: 'Ministerio de Educación Nacional',
    asunto: 'Registro calificado anterior del programa', vigencia: '7 años', fecha_fin: '2018-02-17', pdf: true,
    resumen: 'Otorgó el registro calificado del programa por siete años. Fue sustituido por la renovación de 2018 (Resolución 02872), que es la vigente.' },
]

async function cargar() {
  const { rows } = await query('SELECT count(*)::int n FROM acto_programa WHERE descripcion LIKE $1', ['%' + MARCA + '%'])
  if (rows[0].n) { console.log(`Ya hay ${rows[0].n} actos de prueba cargados; no se duplican.`); return }
  for (const [i, a] of ACTOS.entries()) {
    const archivo = a.pdf ? await guardarPdf(`prueba-${i + 1}.pdf`, `${a.tipo} ${a.numero}`) : null
    await query(
      `INSERT INTO acto_programa
         (categoria, tipo, numero, fecha, expedido_por, asunto, descripcion, vigencia, fecha_fin, archivo_id, url, orden)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [a.categoria, a.tipo, a.numero, a.fecha, a.expedido_por, a.asunto,
       `${a.resumen}\n\n${MARCA} Acto ficticio para probar el diseño; no existe.`, a.vigencia ?? '', a.fecha_fin ?? null,
       archivo, a.url ?? '', 10 + i],
    )
  }
  console.log(`Cargados ${ACTOS.length} actos de prueba (${ACTOS.filter(a => a.pdf).length} con PDF).`)
}

async function borrar() {
  const { rows } = await query('DELETE FROM acto_programa WHERE descripcion LIKE $1 RETURNING archivo_id', ['%' + MARCA + '%'])
  for (const r of rows) await borrarSiHuerfano(r.archivo_id)
  console.log(`Borrados ${rows.length} actos de prueba y sus PDF.`)
}

;(process.argv.includes('--borrar') ? borrar() : cargar())
  .catch(e => { console.error('Error:', e.message); process.exitCode = 1 })
  .finally(() => pool.end())
