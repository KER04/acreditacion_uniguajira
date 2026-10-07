import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import { readData, PUBLIC_DIR, PUBLIC_REPO_DIR } from './utils/data.js'
import { checkConnection } from './db/pool.js'
import { limpiarExpiradas } from './utils/sesiones.js'
import { borrarHuerfanosAntiguos } from './utils/archivos.js'
import auth from './routes/auth.js'
import archivos from './routes/archivos.js'

import acreditacion from './routes/acreditacion.js'
import docentes, { leerDocentes } from './routes/docentes.js'
import estudiantes, { bloquesEstudiantes } from './routes/estudiantes.js'
import egresados, { bloquesEgresados } from './routes/egresados.js'
import grado, { bloquesGrado } from './routes/grado.js'
import saberpro from './routes/saberpro.js'
import infraestructura from './routes/infraestructura.js'
import investigacion, { bloquesInvestigacion } from './routes/investigacion.js'
import extension, { bloquesExtension } from './routes/extension.js'
import internacionalizacion, { bloquesInternacionalizacion } from './routes/internacionalizacion.js'
import convocatorias, { leerConvocatorias } from './routes/convocatorias.js'
import eventos, { leerEventos } from './routes/eventos.js'
import noticias, { leerNoticias } from './routes/noticias.js'
import programa from './routes/programa.js'
import pensum, { leerPensum, leerPropuesta } from './routes/pensum.js'
import tarjetas, { leerTodasLasTarjetas } from './routes/tarjetas.js'
import contacto, { bloquesContacto, infoSedes } from './routes/contacto.js'
import resoluciones, { leerActos } from './routes/resoluciones.js'
import reglamento, { leerReglamento } from './routes/reglamento.js'
import { upload } from './middleware/upload.js'
import { requireAdmin, cargarUsuario } from './middleware/auth.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
/* Railway (y casi cualquier hosting) asigna el puerto con la variable PORT. */
const PORT = Number(process.env.PORT ?? 3001)
const PRODUCCION = process.env.NODE_ENV === 'production'
const DIST = join(__dirname, '../dist')

const app = express()

/* Detrás del proxy de Railway, req.ip sería siempre la IP del proxy y el
   límite de intentos de login (routes/auth.js) castigaría a todos a la vez. */
if (PRODUCCION) app.set('trust proxy', 1)

/* credentials: true es lo que permite que el navegador mande la cookie de
   sesión cuando el front se sirve directamente desde :5173. Con el proxy de
   Vite (ver vite.config.js) todo va al mismo origen y CORS ni interviene. */
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'], credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

/* Resuelve req.usuario a partir de la cookie antes de cualquier ruta. */
app.use(cargarUsuario)

/* Serve public folder as static files. Con STORAGE_DIR (volumen de Railway)
   lo subido desde el panel vive fuera del repo; se mira primero ahí y luego
   en public/ del repo, que trae logos, videos y lo que sí va en git. */
if (PUBLIC_DIR !== PUBLIC_REPO_DIR) app.use(express.static(PUBLIC_DIR))
app.use(express.static(PUBLIC_REPO_DIR))

/* API routes */
app.use('/api/auth', auth)
/* Publico: son los documentos y fotos que el sitio muestra. */
app.use('/api/archivos', archivos)
app.use('/api/acreditacion', acreditacion)
app.use('/api/docentes', docentes)
app.use('/api/estudiantes', estudiantes)
app.use('/api/egresados', egresados)
app.use('/api/grado', grado)
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
app.use('/api/tarjetas', tarjetas)
app.use('/api/contacto', contacto)
app.use('/api/resoluciones', resoluciones)
app.use('/api/reglamento', reglamento)

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
    grado:         () => bloquesGrado(),        // PostgreSQL
    investigacion: () => bloquesInvestigacion(), // PostgreSQL
    extension:     () => bloquesExtension(),     // PostgreSQL
    internacional: () => bloquesInternacionalizacion(), // PostgreSQL
    actos:         () => leerActos(),            // PostgreSQL
    reglamento:    () => leerReglamento(),       // PostgreSQL
    acreditacion:  () => readData('acreditacion.json'),
    programa:      () => readData('programa.json'),
    pensum:        () => leerPensum(),          // PostgreSQL
    propuesta:     () => leerPropuesta(),       // PostgreSQL
    tarjetas:      () => leerTodasLasTarjetas(),// PostgreSQL
    contacto:      () => bloquesContacto(),      // PostgreSQL
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
    estudiantes: estudiantesD, egresados: egresadosD, grado: gradoD, investigacion: investigacionD, extension: extensionD, internacional: internacionalD, actos: actosD, reglamento: reglamentoD,
    acreditacion: acreditacionD, programa: programaD, pensum: pensumD, propuesta: propuestaD, contacto: contactoD, eventos: eventosD,
    tarjetas: tarjetasD,
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
    modalidades_grado:   gradoD?.modalidades ?? [],
    documentos_estudiantes: estudiantesD?.documentos ?? [],
    destacados:          egresadosD?.destacados ?? [],
    ofertas:             egresadosD?.ofertas ?? [],
    normativas:          gradoD?.normativas ?? [],
    ideas_investigacion: gradoD?.ideas ?? [],
    practicas:           gradoD?.practicas ?? [],
    grupos:              investigacionD?.grupos ?? [],
    semilleros:          investigacionD?.semilleros ?? [],
    produccion:          investigacionD?.produccion ?? [],
    convenios:           extensionD?.convenios ?? [],
    proyectos_extension: extensionD?.proyectos ?? [],
    cursos_extension:    extensionD?.cursos ?? [],
    convenios_int:       internacionalD?.convenios ?? [],
    convocatorias_mov:   internacionalD?.convocatorias ?? [],
    redes:               internacionalD?.redes ?? [],
    ori:                 internacionalD?.ori ?? null,
    actos:               actosD ?? [],
    reglamento:          reglamentoD ?? [],
    factores:            acreditacionD?.factores ?? [],
    cronograma_cna:      acreditacionD?.cronograma ?? [],
    equipo_cna:          acreditacionD?.equipo ?? [],
    evidencias_cna:      acreditacionD?.evidencias ?? [],
    inicio:              programaD?.inicio ?? {},
    programa:            { mision: programaD?.mision, vision: programaD?.vision, objetivos: programaD?.objetivos, perfilEgresado: programaD?.perfil_egresado, ficha: programaD?.ficha_tecnica ?? {} },
    pensum:              pensumD?.semestres ?? [],
    pensum_info:         pensumD ? { plan: pensumD.plan, total_creditos: pensumD.total_creditos, total_horas: pensumD.total_horas, total_materias: pensumD.total_materias } : null,
    pensum_propuesto:    propuestaD ?? null,
    /* Las tarjetas del carrusel, agrupadas por la página que las muestra.
       Solo las visibles: el panel pide las suyas aparte. */
    tarjetas:            tarjetasD ?? {},
    /* El pie de página sigue leyendo `info_sedes` con la forma de siempre. */
    info_sedes:          contactoD ? infoSedes(contactoD) : {},
    contacto:            contactoD ?? null,
    cargos:              contactoD?.cargos ?? [],
    eventos:             eventosD ?? [],
  })
})

/* En producción Express sirve también el front compilado (npm run build).
   Cualquier ruta que no sea /api devuelve index.html y React Router decide;
   así /admin o /acreditacion funcionan al recargar o al entrar por enlace. */
if (PRODUCCION && existsSync(DIST)) {
  app.use(express.static(DIST))
  app.get(/^(?!\/api(\/|$)).*/, (_req, res) => res.sendFile(join(DIST, 'index.html')))
}

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
  console.log(`✓ Backend corriendo en el puerto ${PORT}`)
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
