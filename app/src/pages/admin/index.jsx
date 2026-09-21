import { useState, useEffect } from 'react'
import { usePestana } from '../../hooks/useParametroURL'
import Login from './Login'
import { useData } from '../../context/DataContext'
import Dashboard from './Dashboard'
import TabInicio from './tabs/TabInicio'
import TabPrograma from './tabs/TabPrograma'
import TabPensum from './tabs/TabPensum'
import TabNoticias from './tabs/TabNoticias'
import TabConvocatorias from './tabs/TabConvocatorias'
import TabDocentes from './tabs/TabDocentes'
import TabEstudiantes from './tabs/TabEstudiantes'
import TabEgresados from './tabs/TabEgresados'
import TabSaberPro from './tabs/TabSaberPro'
import TabInfraestructura from './tabs/TabInfraestructura'
import TabFunciones from './tabs/TabFunciones'
import TabCNA from './tabs/TabCNA'
import TabEventos from './tabs/TabEventos'
import TabGrado from './tabs/TabGrado'

const TABS = [
  ['dashboard', 'Dashboard', '■'],
  ['inicio', 'Inicio', '◈'],
  ['programa', 'Programa', '◉'],
  ['pensum', 'Plan de estudios', '◧'],
  ['infraestructura', 'Infraestructura', '◨'],
  ['noticias', 'Noticias', '◎'],
  ['eventos', 'Eventos', '◷'],
  ['convocatorias', 'Convocatorias', '◷'],
  ['docentes', 'Docentes', '◈'],
  ['estudiantes', 'Estudiantes', '◉'],
  /* La clave sigue siendo 'egresados' para no romper los enlaces guardados,
     pero esta pestaña es la de los graduados: bolsa de empleo y testimonios.
     El trámite de grado vive en 'grado'. */
  ['egresados', 'Graduados', '◎'],
  ['grado', 'Egresados · grado', '◷'],
  ['saberpro', 'Saber Pro', '◷'],
  ['funciones', 'Funciones misionales', '◧'],
  ['cna', 'Acreditación CNA', '◈'],
]

/* Los fallos de guardado (sesión caducada, validación rechazada, backend caído)
   se muestran aquí en vez de morir en un catch vacío. */
function AvisoError() {
  const { error, limpiarError } = useData()
  if (!error) return null
  return (
    <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '12px 16px', borderRadius: 10, background: 'color-mix(in oklab, var(--ug-flamingo) 16%, transparent)', border: '1px solid var(--ug-flamingo)', fontSize: 13 }}>
      <span style={{ flex: 1 }}>No se pudo guardar: {error}</span>
      <button className="icon-btn" style={{ width: 26, height: 26 }} onClick={limpiarError} aria-label="Cerrar aviso">×</button>
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
    <div role="status" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '12px 16px', borderRadius: 10, background: 'color-mix(in oklab, var(--ug-amarillo) 18%, transparent)', border: '1px solid var(--ug-amarillo)', fontSize: 13 }}>
      <span style={{ flex: 1 }}>{avisoCarga}</span>
    </div>
  )
}

function Verificando() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--paper-2)', color: 'var(--ink-3)', fontSize: 14 }}>
      Verificando sesión…
    </div>
  )
}

export default function Admin() {
  const [usuario, setUsuario] = useState(null)
  const [verificando, setVerificando] = useState(true)
  /* En la URL: recargar el panel ya no devuelve al dashboard, y una
     sección concreta se puede dejar en un marcador. */
  const [activeTab, setActiveTab] = usePestana(TABS, { clave: 'seccion' })

  /* La sesión vive en una cookie httpOnly, invisible para JavaScript: la única
     forma de saber si sigue abierta es preguntárselo al servidor al montar. */
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => (r.ok ? r.json() : null))
      .then(d => setUsuario(d?.usuario ?? null))
      .catch(() => setUsuario(null))
      .finally(() => setVerificando(false))
  }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {})
    setUsuario(null)
  }

  if (verificando) return <Verificando />
  if (!usuario) return <Login onLogin={setUsuario} />

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '240px 1fr', background: 'var(--paper-2)' }}>
      {/* Sidebar */}
      <aside style={{ background: 'var(--ug-marino)', color: 'var(--paper)', display: 'flex', flexDirection: 'column', padding: '0 0 24px', overflowY: 'auto', maxHeight: '100vh', position: 'sticky', top: 0 }}>
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(255,255,255,.12)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>Admin Panel</div>
          <div style={{ fontSize: 11, opacity: .6, marginTop: 4 }}>Ingeniería de Sistemas · UniGuajira</div>
        </div>
        <nav style={{ flex: 1, padding: '8px 0' }}>
          {TABS.map(([k, l]) => (
            <button key={k} onClick={() => setActiveTab(k)}
              style={{ width: '100%', textAlign: 'left', padding: '10px 24px', background: activeTab === k ? 'rgba(255,255,255,.12)' : 'none', border: 'none', color: activeTab === k ? 'var(--paper)' : 'rgba(255,255,255,.65)', fontSize: 13.5, cursor: 'pointer', borderLeft: activeTab === k ? '3px solid var(--ug-azul-soft)' : '3px solid transparent', transition: 'all .15s' }}>
              {l}
            </button>
          ))}
        </nav>
        <div style={{ padding: '12px 24px', borderTop: '1px solid rgba(255,255,255,.12)', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{usuario.nombre}</div>
          <div style={{ fontSize: 11, opacity: .55, marginTop: 2 }}>{usuario.email} · {usuario.rol}</div>
        </div>
        <button onClick={logout} style={{ margin: '0 16px', padding: '10px 16px', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.7)', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
          Cerrar sesión
        </button>
      </aside>

      {/* Content */}
      <main style={{ padding: 'clamp(24px,4vw,48px)', overflowY: 'auto', maxHeight: '100vh' }}>
        <AvisoCarga />
        <AvisoError />
        {activeTab === 'dashboard'      && <Dashboard />}
        {activeTab === 'inicio'         && <TabInicio />}
        {activeTab === 'programa'       && <TabPrograma />}
        {activeTab === 'pensum'         && <TabPensum />}
        {activeTab === 'noticias'       && <TabNoticias />}
        {activeTab === 'convocatorias'  && <TabConvocatorias />}
        {activeTab === 'docentes'       && <TabDocentes />}
        {activeTab === 'estudiantes'    && <TabEstudiantes />}
        {activeTab === 'egresados'      && <TabEgresados />}
        {activeTab === 'grado'          && <TabGrado />}
        {activeTab === 'saberpro'       && <TabSaberPro />}
        {activeTab === 'infraestructura' && <TabInfraestructura />}
        {activeTab === 'funciones'      && <TabFunciones />}
        {activeTab === 'eventos'        && <TabEventos />}
        {activeTab === 'cna'            && <TabCNA />}
      </main>
    </div>
  )
}
