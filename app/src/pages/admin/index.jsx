import { useState, useEffect, useRef } from 'react'
import { usePestana } from '../../hooks/useParametroURL'
import Login from './Login'
import { useData } from '../../context/DataContext'
import { fetchApi, EVENTO_CADUCADA } from '../../context/sesion'
import Dashboard from './Dashboard'
import TabInicio from './tabs/TabInicio'
import TabPrograma from './tabs/TabPrograma'
import TabPensum from './tabs/TabPensum'
import TabPropuesta from './tabs/TabPropuesta'
import TabNoticias from './tabs/TabNoticias'
import TabConvocatorias from './tabs/TabConvocatorias'
import TabDocentes from './tabs/TabDocentes'
import TabEstudiantes from './tabs/TabEstudiantes'
import TabEgresados from './tabs/TabEgresados'
import TabSaberPro from './tabs/TabSaberPro'
import TabInfraestructura from './tabs/TabInfraestructura'
import TabFunciones from './tabs/TabFunciones'
import TabExtension from './tabs/TabExtension'
import TabResoluciones from './tabs/TabResoluciones'
import TabContacto from './tabs/TabContacto'
import TabInternacionalizacion from './tabs/TabInternacionalizacion'
import TabCNA from './tabs/TabCNA'
import TabEventos from './tabs/TabEventos'
import TabGrado from './tabs/TabGrado'

/* Las secciones, agrupadas por la parte del sitio que tocan.
 *
 * El agrupamiento no es cosmético: son diecisiete entradas, y en una lista
 * plana encontrar «Saber Pro» exige leerlas todas. Repartidas en cuatro
 * bloques —lo que se publica, el programa, la gente y la calidad— se llega por
 * descarte antes de leer.
 *
 * La tercera columna es la ruta pública que edita cada sección, para poder ir
 * a ver el resultado sin buscarla en el menú del sitio. Vacía cuando la
 * sección no tiene una página propia.
 */
const GRUPOS = [
  ['General', [
    ['dashboard', 'Resumen', ''],
    ['inicio', 'Portada', '#/'],
  ]],
  ['Programa', [
    ['programa', 'Ficha del programa', '#/programa'],
    ['pensum', 'Plan de estudios', '#/pensum'],
    ['propuesta', 'Propuesta curricular', '#/pensum-propuesto'],
    ['infraestructura', 'Infraestructura', '#/infraestructura'],
    ['resoluciones', 'Resoluciones', '#/resoluciones'],
    ['contacto', 'Contacto', '#/contacto'],
  ]],
  ['Publicaciones', [
    ['noticias', 'Noticias', '#/noticias'],
    ['eventos', 'Eventos', '#/noticias'],
    ['convocatorias', 'Convocatorias', '#/convocatorias'],
  ]],
  ['Comunidad', [
    ['docentes', 'Docentes', '#/docentes'],
    ['estudiantes', 'Estudiantes', '#/estudiantes'],
    /* La clave sigue siendo 'egresados' para no romper los enlaces guardados,
       pero esta pestaña es la de los graduados: bolsa de empleo y testimonios.
       El trámite de grado vive en 'grado'. */
    ['egresados', 'Graduados', '#/graduados'],
    ['grado', 'Egresados · grado', '#/egresados'],
    ['saberpro', 'Saber Pro', '#/saber-pro'],
  ]],
  ['Calidad', [
    /* La clave sigue siendo 'funciones' para no romper enlaces guardados; la
       etiqueta dice lo que edita, porque «Funciones misionales» no se
       reconocía como la página de Investigación. */
    ['funciones', 'Investigación', '#/investigacion'],
    ['extension', 'Extensión', '#/extension'],
    ['internacionalizacion', 'Internacionalización', '#/internacionalizacion'],
    ['cna', 'Acreditación CNA', '#/acreditacion'],
  ]],
]

const TABS = GRUPOS.flatMap(([, items]) => items)
const POR_CLAVE = Object.fromEntries(TABS.map(([k, etiqueta, ruta]) => [k, { etiqueta, ruta }]))

const PANELES = {
  dashboard: Dashboard,
  inicio: TabInicio,
  programa: TabPrograma,
  pensum: TabPensum,
  propuesta: TabPropuesta,
  infraestructura: TabInfraestructura,
  noticias: TabNoticias,
  eventos: TabEventos,
  convocatorias: TabConvocatorias,
  docentes: TabDocentes,
  estudiantes: TabEstudiantes,
  egresados: TabEgresados,
  grado: TabGrado,
  saberpro: TabSaberPro,
  funciones: TabFunciones,
  extension: TabExtension,
  resoluciones: TabResoluciones,
  contacto: TabContacto,
  internacionalizacion: TabInternacionalizacion,
  cna: TabCNA,
}

/* Los fallos de guardado (sesión caducada, validación rechazada, backend caído)
   se muestran aquí en vez de morir en un catch vacío. */
function AvisoError() {
  const { error, limpiarError } = useData()
  if (!error) return null
  return (
    <div role="alert" className="adm-aviso adm-aviso--error">
      <span style={{ flex: 1 }}>No se pudo guardar: {error}</span>
      <button className="adm-aviso__cerrar" onClick={limpiarError} aria-label="Cerrar aviso">×</button>
    </div>
  )
}

/* Aviso de LECTURA: el servidor no respondió, o respondió a medias. Lo que se
   ve en pantalla es el caché del navegador, que puede tener días. Sin esto el
   panel mostraba datos viejos con el mismo aspecto que los recién cargados. */
function AvisoCarga() {
  const { avisoCarga } = useData()
  if (!avisoCarga) return null
  return (
    <div role="status" className="adm-aviso adm-aviso--carga">
      <span style={{ flex: 1 }}>{avisoCarga}</span>
    </div>
  )
}

function Verificando() {
  return <div className="adm-espera">Verificando sesión…</div>
}

const CLAVE_GRUPOS = 'ug_admin_grupos_abiertos'

/* Qué categorías dejó abiertas quien edita. Si no hay nada guardado, se abre
   solo la que contiene la sección en pantalla: con las cinco desplegadas la
   columna no cabe y aparece una barra de desplazamiento que obliga a buscar
   dentro del propio menú. */
function leerGrupos(activa) {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_GRUPOS) ?? 'null')
    if (guardado && typeof guardado === 'object') return guardado
  } catch { /* almacenamiento bloqueado: se usa el criterio de partida */ }
  return Object.fromEntries(GRUPOS.map(([g, items]) => [g, items.some(([k]) => k === activa)]))
}

/* Iniciales para el avatar: «Jesús Monsalvo» -> «JM». */
const iniciales = nombre => String(nombre ?? '')
  .trim().split(/\s+/).slice(0, 2).map(p => p[0] ?? '').join('').toUpperCase() || '·'

export default function Admin() {
  const [usuario, setUsuario] = useState(null)
  const [verificando, setVerificando] = useState(true)
  /* Por qué se volvió al login sin pedirlo: la sesión caducó o se revocó. */
  const [avisoSesion, setAvisoSesion] = useState(null)
  const usuarioRef = useRef(null)
  useEffect(() => { usuarioRef.current = usuario }, [usuario])
  /* En la URL: recargar el panel ya no devuelve al dashboard, y una
     sección concreta se puede dejar en un marcador. */
  const [activeTab, setActiveTab] = usePestana(TABS, { clave: 'seccion' })

  /* La sesión vive en una cookie httpOnly, invisible para JavaScript: la única
     forma de saber si sigue abierta es preguntárselo al servidor al montar. */
  useEffect(() => {
    /* fetchApi y no fetch: /me es la primera petición al volver al panel, y si
       el acceso caducó mientras estaba cerrado tiene que renovarse aquí. Sin
       sesión que renovar es lo normal —se muestra el login—, no un aviso. */
    fetchApi('/api/auth/me')
      .then(r => (r.ok ? r.json() : null))
      .then(d => setUsuario(d?.usuario ?? null))
      .catch(() => setUsuario(null))
      .finally(() => setVerificando(false))
  }, [])

  /* La renovación falló a mitad de trabajo: de vuelta al login diciendo por
     qué, en vez de dejar formularios que ya no pueden guardar. */
  useEffect(() => {
    const alCaducar = e => {
      // Solo si había alguien dentro: llegar sin sesión al panel no es un aviso.
      if (!usuarioRef.current) return
      setAvisoSesion(e.detail ?? 'Tu sesión caducó. Vuelve a iniciar sesión.')
      setUsuario(null)
    }
    window.addEventListener(EVENTO_CADUCADA, alCaducar)
    return () => window.removeEventListener(EVENTO_CADUCADA, alCaducar)
  }, [])

  /* La categoría de la sección activa se abre sola al navegar: llegar a una
     sección por un enlace guardado y no ver dónde está en el menú desorienta
     más de lo que ahorra el pliegue. Las demás se quedan como estuvieran. */
  const [grupos, setGrupos] = useState(() => leerGrupos(activeTab))
  useEffect(() => {
    setGrupos(previos => {
      const suyo = GRUPOS.find(([, items]) => items.some(([k]) => k === activeTab))?.[0]
      if (!suyo || previos[suyo]) return previos
      return { ...previos, [suyo]: true }
    })
  }, [activeTab])

  const alternarGrupo = grupo => setGrupos(previos => {
    const siguiente = { ...previos, [grupo]: !previos[grupo] }
    try { localStorage.setItem(CLAVE_GRUPOS, JSON.stringify(siguiente)) } catch { /* da igual */ }
    return siguiente
  })

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {})
    setUsuario(null)
  }

  if (verificando) return <Verificando />
  if (!usuario) return <Login aviso={avisoSesion} onLogin={u => { setAvisoSesion(null); setUsuario(u) }} />

  const actual = POR_CLAVE[activeTab] ?? POR_CLAVE.dashboard
  const Panel = PANELES[activeTab] ?? Dashboard

  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="adm-marca">
          <span className="adm-marca__sello" aria-hidden="true">IS</span>
          <span className="adm-marca__texto">
            <span className="adm-marca__titulo">Panel del programa</span>
            <span className="adm-marca__sub">Ingeniería de Sistemas</span>
          </span>
        </div>

        <nav className="adm-nav" aria-label="Secciones del panel">
          {GRUPOS.map(([grupo, items]) => {
            const abierto = Boolean(grupos[grupo])
            const contieneActiva = items.some(([k]) => k === activeTab)
            return (
              <div className={'adm-grupo' + (abierto ? '' : ' is-cerrado')} key={grupo}>
                <button
                  type="button"
                  className="adm-grupo__titulo"
                  aria-expanded={abierto}
                  onClick={() => alternarGrupo(grupo)}
                >
                  <span className="adm-grupo__flecha" aria-hidden="true">▸</span>
                  {grupo}
                  {/* Con la categoría plegada, este punto dice que la sección
                      en pantalla está ahí dentro. */}
                  {!abierto && contieneActiva && <span className="adm-grupo__marca" aria-hidden="true" />}
                </button>
                <div className="adm-grupo__items">
                  {items.map(([k, etiqueta]) => (
                    <button
                      key={k}
                      className={'adm-item' + (activeTab === k ? ' is-activo' : '')}
                      aria-current={activeTab === k ? 'page' : undefined}
                      onClick={() => setActiveTab(k)}
                    >
                      <span className="adm-item__punto" aria-hidden="true" />
                      {etiqueta}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </nav>

        <div className="adm-side__pie">
          <div className="adm-usuario">
            <span className="adm-usuario__avatar" aria-hidden="true">{iniciales(usuario.nombre)}</span>
            <span className="adm-usuario__datos">
              <span className="adm-usuario__nombre">{usuario.nombre}</span>
              <span className="adm-usuario__rol" title={usuario.email}>{usuario.email} · {usuario.rol}</span>
            </span>
          </div>
          <button className="adm-salir" onClick={logout}>Cerrar sesión</button>
        </div>
      </aside>

      <main className="adm-main">
        <header className="adm-head">
          <div>
            <div className="adm-head__ruta">Panel · {GRUPOS.find(([, i]) => i.some(([k]) => k === activeTab))?.[0]}</div>
            <h1>{actual.etiqueta}</h1>
          </div>
          <div className="adm-head__acciones">
            {actual.ruta && (
              <a className="adm-ver-sitio" href={actual.ruta} target="_blank" rel="noreferrer">
                Ver en el sitio <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </header>

        <div className="adm-cuerpo">
          <AvisoCarga />
          <AvisoError />
          <Panel onIr={setActiveTab} />
        </div>
      </main>
    </div>
  )
}
