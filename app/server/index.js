import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readData } from './utils/data.js'
import { checkConnection } from './db/pool.js'
import { limpiarExpiradas } from './utils/sesiones.js'
import { borrarHuerfanosAntiguos } from './utils/archivos.js'
import auth from './routes/auth.js'
import archivos from './routes/archivos.js'

import acreditacion from './routes/acreditacion.js'
import docentes, { leerDocentes } from './routes/docentes.js'
import estudiantes, { bloquesEstudiantes } from './routes/estudiantes.js'
import egresados, { bloquesEgresados } from './routes/egresados.js'
import saberpro from './routes/saberpro.js'
import infraestructura from './routes/infraestructura.js'
import investigacion from './routes/investigacion.js'
import extension from './routes/extension.js'
import internacionalizacion from './routes/internacionalizacion.js'
import convocatorias, { leerConvocatorias } from './routes/convocatorias.js'
import eventos, { leerEventos } from './routes/eventos.js'
import noticias, { leerNoticias } from './routes/noticias.js'
import programa from './routes/programa.js'
import pensum, { leerPensum } from './routes/pensum.js'
import sedes from './routes/sedes.js'
import { upload } from './middleware/upload.js'
import { requireAdmin, cargarUsuario } from './middleware/auth.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = 3001

const app = express()

/* credentials: true es lo que permite que el navegador mande la cookie de
   sesión cuando el front se sirve directamente desde :5173. Con el proxy de
   Vite (ver vite.config.js) todo va al mismo origen y CORS ni interviene. */
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'], credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

/* Resuelve req.usuario a partir de la cookie antes de cualquier ruta. */
app.use(cargarUsuario)

/* Serve public folder as static files */
app.use(express.static(join(__dirname, '../public')))

/* API routes */
app.use('/api/auth', auth)
/* Publico: son los documentos y fotos que el sitio muestra. */
app.use('/api/archivos', archivos)
app.use('/api/acreditacion', acreditacion)
app.use('/api/docentes', docentes)
app.use('/api/estudiantes', estudiantes)
app.use('/api/egresados', egresados)
/* Saber Pro trae su propia página y pide sus datos aparte: no entra en
   /api/all para no engordar la carga inicial de todo el sitio. */
app.use('/api/saberpro', saberpro)
app.use('/api/infraestructura', infraestructura)
app.use('/api/investigacion', investigacion)
app.use('/api/extension', extension)
app.use('/api/internacionalizacion', internacionalizacion)
app.use('/api/convocatorias', convocatorias)
app.use('/api/eventos', eventos)
app.use('/api/noticias', noticias)
app.use('/api/programa', programa)
app.use('/api/pensum', pensum)
app.use('/api/sedes', sedes)

/* Generic file upload endpoint */
app.post('/api/upload/:tipo', requireAdmin, upload.single('archivo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Sin archivo' })
  const tipo = req.params.tipo
  const ext = req.file.filename
  let url = `/images/general/${ext}`
  if (tipo === 'docente-foto')          url = `/images/docentes/${ext}`
  else if (tipo === 'egresado-foto')    url = `/images/egresados/${ext}`
  else if (tipo === 'noticia-imagen')   url = `/images/noticias/${ext}`
  else if (tipo === 'factor-doc') {
    const n = String(req.query.factor ?? '01').padStart(2, '0')
    url = `/docs/factores/factor-${n}/${ext}`
  } else if (tipo === 'factor-presentacion') {
    const n = String(req.query.factor ?? '01').padStart(2, '0')
    url = `/presentaciones/factor-${n}/${ext}`
  } else if (tipo === 'estudiante-doc') url = `/docs/estudiantes/${ext}`
  res.json({ url, filename: ext })
})

/* Agregado: todos los datos del sitio en una sola llamada.

   Cada origen se resuelve por separado con allSettled. Antes iban en un
   Promise.all dentro de un try/catch único, así que una caída de PostgreSQL
   tumbaba la respuesta entera y se llevaba por delante noticias, eventos y
   convocatorias, que viven en archivos y se habrían leído sin problema. El
   cliente recibía un 500, se quedaba con lo que tuviera en localStorage y no
   avisaba de nada: datos de hace días con aspecto de recién cargados.

   Ahora lo que falla viaja en `fallos` y el resto llega igual. */
app.get('/api/all', async (_req, res) => {
  const origenes = {
    noticias:      () => leerNoticias(),        // PostgreSQL
    convocatorias: () => leerConvocatorias(),   // PostgreSQL
    docentes:      () => leerDocentes(),        // PostgreSQL
    estudiantes:   () => bloquesEstudiantes(),  // PostgreSQL
    egresados:     () => bloquesEgresados(),    // PostgreSQL
    investigacion: () => readData('investigacion.json'),
    acreditacion:  () => readData('acreditacion.json'),
    programa:      () => readData('programa.json'),
    pensum:        () => leerPensum(),          // PostgreSQL
    sedes:         () => readData('sedes.json'),
    eventos:       () => leerEventos(),         // PostgreSQL
  }

  const nombres = Object.keys(origenes)
  const resultados = await Promise.allSettled(nombres.map(n => origenes[n]()))

  const datos = {}
  const fallos = []
  resultados.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      datos[nombres[i]] = r.value
    } else {
      fallos.push(nombres[i])
      console.error(`[/api/all] origen "${nombres[i]}" falló:`, r.reason?.message ?? r.reason)
    }
  })

  const {
    noticias: noticiasD, convocatorias: convocatoriasD, docentes: docentesD,
    estudiantes: estudiantesD, egresados: egresadosD, investigacion: investigacionD,
    acreditacion: acreditacionD, programa: programaD, pensum: pensumD, sedes: sedesD, eventos: eventosD,
  } = datos

  res.json({
    /* Qué no se pudo leer. El cliente lo usa para avisar en pantalla en vez
       de presentar datos incompletos como si estuvieran completos. */
    fallos,
    noticias:            noticiasD ?? [],
    convocatorias:       convocatoriasD ?? [],
    docentes:            docentesD ?? [],
    honor:               estudiantesD?.honor ?? [],
    calendario:          estudiantesD?.calendario ?? [],
    modalidades_grado:   estudiantesD?.modalidades_grado ?? [],
    documentos_estudiantes: estudiantesD?.documentos ?? [],
    destacados:          egresadosD?.destacados ?? [],
    ofertas:             egresadosD?.ofertas ?? [],
    grupos:              investigacionD?.grupos ?? [],
    semilleros:          investigacionD?.semilleros ?? [],
    factores:            acreditacionD?.factores ?? [],
    cronograma_cna:      acreditacionD?.cronograma ?? [],
    equipo_cna:          acreditacionD?.equipo ?? [],
    evidencias_cna:      acreditacionD?.evidencias ?? [],
    inicio:              programaD?.inicio ?? {},
    programa:            { mision: programaD?.mision, vision: programaD?.vision, objetivos: programaD?.objetivos, perfilEgresado: programaD?.perfil_egresado, ficha: programaD?.ficha_tecnica ?? {} },
    pensum:              pensumD?.semestres ?? [],
    pensum_info:         pensumD ? { plan: pensumD.plan, total_creditos: pensumD.total_creditos, total_materias: pensumD.total_materias } : null,
    info_sedes:          sedesD ?? {},
    eventos:             eventosD ?? [],
  })
})

/* Devuelve 500 con JSON en vez de un stack HTML cuando un handler async falla.
   Express 4 no captura rechazos de promesas por su cuenta. */
app.use((err, _req, res, _next) => {
  if (res.headersSent) return
  // body-parser y otros middlewares traen su propio código (400 para un JSON
  // mal formado, por ejemplo); respetarlo evita disfrazar de fallo del
  // servidor lo que en realidad es un error del cliente.
  const codigo = err.status ?? err.statusCode ?? 500
  if (codigo >= 500) console.error('[api]', err)
  res.status(codigo).json({
    error: codigo === 400 ? 'Petición mal formada' : 'Error interno del servidor',
  })
})

const server = app.listen(PORT, async () => {
  console.log(`✓ Backend corriendo en http://localhost:${PORT}`)
  try {
    const info = await checkConnection()
    console.log(`✓ PostgreSQL conectado → base "${info.db}"`)
    const borradas = await limpiarExpiradas()
    if (borradas) console.log(`  ${borradas} sesion(es) caducada(s) eliminada(s)`)
    const huerfanos = await borrarHuerfanosAntiguos()
    if (huerfanos) console.log(`  ${huerfanos} archivo(s) sin dueño eliminado(s)`)
  } catch (e) {
    console.error(`✗ Sin conexión a PostgreSQL: ${e.message}`)
    console.error('  Revisa las credenciales en app/.env y que el servicio esté arriba.')
  }
})

/* Barrido diario de sesiones caducadas. unref() evita que el timer
   mantenga vivo el proceso al apagar el servidor. */
setInterval(() => {
  limpiarExpiradas().catch(() => {})
  borrarHuerfanosAntiguos().catch(() => {})
}, 24 * 60 * 60 * 1000).unref()

export { app, server }
