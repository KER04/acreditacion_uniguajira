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
import docentes from './routes/docentes.js'
import estudiantes, { bloquesEstudiantes } from './routes/estudiantes.js'
import egresados from './routes/egresados.js'
import investigacion from './routes/investigacion.js'
import extension from './routes/extension.js'
import internacionalizacion from './routes/internacionalizacion.js'
import convocatorias from './routes/convocatorias.js'
import eventos from './routes/eventos.js'
import noticias from './routes/noticias.js'
import programa from './routes/programa.js'
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
app.use('/api/investigacion', investigacion)
app.use('/api/extension', extension)
app.use('/api/internacionalizacion', internacionalizacion)
app.use('/api/convocatorias', convocatorias)
app.use('/api/eventos', eventos)
app.use('/api/noticias', noticias)
app.use('/api/programa', programa)
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

/* Aggregate endpoint: all data in one call */
app.get('/api/all', async (_req, res) => {
  try {
    const [
      noticiasD, convocatoriasD, docentesD, estudiantesD,
      egresadosD, investigacionD, acreditacionD, programaD, sedesD, eventosD,
    ] = await Promise.all([
      readData('noticias.json'),
      readData('convocatorias.json'),
      readData('docentes.json'),
      bloquesEstudiantes(),   // ya viene de PostgreSQL, no del JSON
      readData('egresados.json'),
      readData('investigacion.json'),
      readData('acreditacion.json'),
      readData('programa.json'),
      readData('sedes.json'),
      readData('eventos.json'),
    ])

    res.json({
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
      pensum:              programaD?.pensum ?? [],
      info_sedes:          sedesD ?? {},
      eventos:             eventosD ?? [],
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error leyendo datos' })
  }
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
