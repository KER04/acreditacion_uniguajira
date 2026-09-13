/* Importa noticias, eventos y convocatorias desde los JSON originales.
 *
 *   node server/db/importar-contenidos.js [--simular]
 *
 * Carga en la base el contenido que vivía en {noticias,eventos,convocatorias}
 * .json antes de la migración 007. Busca primero el archivo vivo en src/data y,
 * si no está, la copia versionada en db/datos (ver más abajo).
 *
 * Es idempotente: identifica cada pieza por (titulo, fecha), así que volver a
 * correrlo actualiza en vez de duplicar. No borra nada que no esté en el JSON,
 * porque a partir de ahora el panel escribe directamente en la base y lo que
 * se cree allí no tiene por qué estar en los archivos.
 *
 * Toda la normalización ocurre aquí: las fechas venían como texto en español
 * ("28 may 2026"), las horas con AM/PM, y las categorías con mayúsculas
 * inconsistentes. La base las quiere ya limpias porque tiene CHECK.
 */
import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool, query } from './pool.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SIMULAR = process.argv.includes('--simular')

/* Copia versionada de los JSON originales, igual que la planilla de docentes.
   Los de src/data/ dejaron de estar en git al migrar —tenerlos versionados
   hacía que un `git pull` revirtiera lo publicado— así que la fuente para
   reconstruir la base tras clonar el repo es ésta. Si existe el archivo vivo
   en src/data se prefiere, para poder reimportar una edición de última hora. */
const COPIA = join(__dirname, 'datos')
const VIVO = join(__dirname, '..', '..', 'src', 'data')

const avisos = []

/* ─── Normalización ────────────────────────────────────────────── */

const MESES = {
  ene: 1, feb: 2, mar: 3, abr: 4, may: 5, jun: 6,
  jul: 7, ago: 8, sep: 9, set: 9, oct: 10, nov: 11, dic: 12,
}

/* "28 may 2026" -> "2026-05-28".  "2026-05-15" pasa tal cual.
   Devuelve null si no hay forma de interpretarlo, para no inventar una fecha. */
export function aFechaISO(valor) {
  const s = String(valor ?? '').trim()
  if (!s) return null

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s

  const m = /^(\d{1,2})\s+([a-záéíóú]+)\.?\s+(\d{4})$/i.exec(s)
  if (m) {
    const mes = MESES[m[2].toLowerCase().slice(0, 3)]
    if (mes) return `${m[3]}-${String(mes).padStart(2, '0')}-${m[1].padStart(2, '0')}`
  }

  /* "May 2026", sin día: se toma el día 1 y se deja constancia en el informe.
     Es la convención que ya usaba el modelo para fechas de precisión mensual. */
  const soloMes = /^([a-záéíóú]+)\.?\s+(\d{4})$/i.exec(s)
  if (soloMes) {
    const mes = MESES[soloMes[1].toLowerCase().slice(0, 3)]
    if (mes) return `${soloMes[2]}-${String(mes).padStart(2, '0')}-01`
  }

  return null
}

/* "8:00 AM" -> "08:00".  "14:30" pasa tal cual. */
export function aHora(valor) {
  const s = String(valor ?? '').trim()
  if (!s) return null

  const ampm = /^(\d{1,2}):(\d{2})\s*([ap])\.?m\.?$/i.exec(s)
  if (ampm) {
    let h = Number(ampm[1]) % 12
    if (ampm[3].toLowerCase() === 'p') h += 12
    return `${String(h).padStart(2, '0')}:${ampm[2]}`
  }

  const iso = /^(\d{1,2}):(\d{2})$/.exec(s)
  if (iso) return `${iso[1].padStart(2, '0')}:${iso[2]}`

  return null
}

/* 'investigación' -> 'Investigación'. La lista del panel mezclaba mayúsculas
   con los valores reales del contenido y el filtro compara con ===, así que
   una noticia se caía al filtrar por su propia categoría. */
export function normalizarCategoria(valor, permitidas, porDefecto) {
  const s = String(valor ?? '').trim()
  if (!s) return porDefecto
  const hallada = permitidas.find(c => c.toLowerCase() === s.toLowerCase())
  return hallada ?? porDefecto
}

const CAT_NOTICIA = ['Académico', 'Investigación', 'Extensión', 'Institucional', 'Acreditación', 'Egresados', 'Docencia']
const CAT_EVENTO = ['Académico', 'Cultural', 'Investigación', 'Extensión', 'Institucional', 'Deportivo', 'Competencia', 'Taller', 'Laboral']
const CAT_CONVOCATORIA = ['Investigación', 'Internacionalización', 'Extensión', 'Prácticas', 'Estímulos', 'Becas', 'Eventos']
const SEDES = ['ambas', 'riohacha', 'maicao']

const sedeValida = v => (SEDES.includes(String(v ?? '').trim()) ? String(v).trim() : 'ambas')
const txt = v => String(v ?? '').trim()

function leer(nombre) {
  for (const ruta of [join(VIVO, `${nombre}.json`), join(COPIA, `${nombre}-original.json`)]) {
    try {
      return JSON.parse(readFileSync(ruta, 'utf-8'))
    } catch { /* probar la siguiente */ }
  }
  avisos.push(`no se encontró el origen de ${nombre}: no se importó nada`)
  return []
}

/* ─── Importación ──────────────────────────────────────────────── */

/* Inserta o actualiza identificando por (titulo, fecha). Devuelve 'nuevo' o
   'actualizado' para poder informar al final. */
async function upsert(tabla, clave, fila) {
  const columnas = Object.keys(fila)
  const valores = columnas.map(c => fila[c])

  const { rows: existe } = await query(
    `SELECT id FROM ${tabla} WHERE titulo = $1 AND ${clave.columna} IS NOT DISTINCT FROM $2`,
    [fila.titulo, fila[clave.columna]],
  )

  if (SIMULAR) return existe.length ? 'actualizado' : 'nuevo'

  if (existe.length) {
    const asignaciones = columnas.map((c, i) => `${c} = $${i + 2}`).join(', ')
    await query(`UPDATE ${tabla} SET ${asignaciones} WHERE id = $1`, [existe[0].id, ...valores])
    return 'actualizado'
  }

  const marcadores = columnas.map((_, i) => `$${i + 1}`).join(', ')
  await query(`INSERT INTO ${tabla} (${columnas.join(', ')}) VALUES (${marcadores})`, valores)
  return 'nuevo'
}

async function importarNoticias() {
  const datos = leer('noticias')
  const cuenta = { nuevo: 0, actualizado: 0, omitido: 0 }

  for (const n of datos) {
    const fecha = aFechaISO(n.fecha)
    if (!fecha) {
      avisos.push(`noticia "${txt(n.titulo).slice(0, 50)}": fecha ilegible (${JSON.stringify(n.fecha)}), se omite`)
      cuenta.omitido++
      continue
    }
    const cat = normalizarCategoria(n.cat, CAT_NOTICIA, 'Institucional')
    if (txt(n.cat) && cat.toLowerCase() !== txt(n.cat).toLowerCase()) {
      avisos.push(`noticia "${txt(n.titulo).slice(0, 40)}": categoría "${n.cat}" no reconocida, queda como "${cat}"`)
    }

    cuenta[await upsert('noticia', { columna: 'fecha' }, {
      titulo: txt(n.titulo),
      resumen: txt(n.resumen),
      cuerpo: txt(n.cuerpo),
      categoria: cat,
      fecha,
      autor: txt(n.autor),
      sede: sedeValida(n.sede),
      imagen_url: txt(n.imagen_url),
    })]++
  }
  return cuenta
}

async function importarEventos() {
  const datos = leer('eventos')
  const cuenta = { nuevo: 0, actualizado: 0, omitido: 0 }

  for (const e of datos) {
    const fecha = aFechaISO(e.fecha)
    if (!fecha) {
      avisos.push(`evento "${txt(e.titulo).slice(0, 50)}": fecha ilegible (${JSON.stringify(e.fecha)}), se omite`)
      cuenta.omitido++
      continue
    }
    const hora = aHora(e.hora)
    if (txt(e.hora) && !hora) {
      avisos.push(`evento "${txt(e.titulo).slice(0, 40)}": hora "${e.hora}" ilegible, queda sin hora`)
    }

    cuenta[await upsert('evento', { columna: 'fecha' }, {
      titulo: txt(e.titulo),
      descripcion: txt(e.descripcion),
      categoria: normalizarCategoria(e.categoria ?? e.cat, CAT_EVENTO, 'Académico'),
      fecha,
      hora,
      lugar: txt(e.lugar),
      ponente: txt(e.ponente),
      sede: sedeValida(e.sede),
      imagen_url: txt(e.imagen_url),
      url_inscripcion: txt(e.url_inscripcion ?? e.url_registro),
    })]++
  }
  return cuenta
}

async function importarConvocatorias() {
  const datos = leer('convocatorias')
  const cuenta = { nuevo: 0, actualizado: 0, omitido: 0 }

  for (const c of datos) {
    const cierre = aFechaISO(c.cierre)
    if (txt(c.cierre) && !cierre) {
      avisos.push(`convocatoria "${txt(c.titulo).slice(0, 40)}": cierre "${c.cierre}" ilegible, queda sin fecha`)
    }
    const apertura = aFechaISO(c.fecha_apertura)

    /* Si el rango quedara invertido la base lo rechazaría; es preferible
       soltar la apertura y dejar constancia que perder la convocatoria. */
    let aperturaFinal = apertura
    if (apertura && cierre && apertura > cierre) {
      avisos.push(`convocatoria "${txt(c.titulo).slice(0, 40)}": apertura posterior al cierre, se descarta la apertura`)
      aperturaFinal = null
    }

    const requisitos = Array.isArray(c.requisitos)
      ? c.requisitos.map(r => txt(r)).filter(Boolean)
      : []

    const estado = ['Abierta', 'Próxima', 'Cerrada'].includes(txt(c.estado)) ? txt(c.estado) : 'Abierta'

    cuenta[await upsert('convocatoria', { columna: 'fecha_cierre' }, {
      titulo: txt(c.titulo),
      descripcion: txt(c.desc ?? c.descripcion),
      categoria: normalizarCategoria(c.cat, CAT_CONVOCATORIA, 'Investigación'),
      estado,
      fecha_apertura: aperturaFinal,
      fecha_cierre: cierre,
      dirigida_a: txt(c.dirigida_a) || 'Estudiantes',
      sede: sedeValida(c.sede),
      requisitos,
      url_postulacion: txt(c.url_postulacion),
      documento_url: txt(c.documento_url),
    })]++
  }
  return cuenta
}

/* ─── Informe ──────────────────────────────────────────────────── */

async function main() {
  const noticias = await importarNoticias()
  const eventos = await importarEventos()
  const convocatorias = await importarConvocatorias()

  if (SIMULAR) console.log('\nSIMULACIÓN — no se escribió nada\n')

  const linea = (nombre, c) =>
    console.log(`  ${nombre.padEnd(16)} ${String(c.nuevo).padStart(3)} nuevas  ${String(c.actualizado).padStart(3)} actualizadas` +
      (c.omitido ? `  ${c.omitido} omitidas` : ''))

  linea('noticias', noticias)
  linea('eventos', eventos)
  linea('convocatorias', convocatorias)

  if (avisos.length) {
    console.log(`\n  REVISAR — ${avisos.length} aviso(s):`)
    for (const a of avisos) console.log(`    · ${a}`)
  }
}

try {
  await main()
} catch (e) {
  console.error('Falló la importación:', e.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
