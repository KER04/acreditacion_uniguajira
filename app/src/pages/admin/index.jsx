import { useState } from 'react'
import Login from './Login'
import Dashboard from './Dashboard'
import TabInicio from './tabs/TabInicio'
import TabPrograma from './tabs/TabPrograma'
import TabPensum from './tabs/TabPensum'
import TabNoticias from './tabs/TabNoticias'
import TabConvocatorias from './tabs/TabConvocatorias'
import TabDocentes from './tabs/TabDocentes'
import TabEstudiantes from './tabs/TabEstudiantes'
import TabEgresados from './tabs/TabEgresados'
import TabFunciones from './tabs/TabFunciones'
import TabCNA from './tabs/TabCNA'

const TABS = [
  ['dashboard', 'Dashboard', '■'],
  ['inicio', 'Inicio', '◈'],
  ['programa', 'Programa', '◉'],
  ['pensum', 'Plan de estudios', '◧'],
  ['noticias', 'Noticias', '◎'],
  ['convocatorias', 'Convocatorias', '◷'],
  ['docentes', 'Docentes', '◈'],
  ['estudiantes', 'Estudiantes', '◉'],
  ['egresados', 'Egresados', '◎'],
  ['funciones', 'Funciones misionales', '◧'],
  ['cna', 'Acreditación CNA', '◈'],
]

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem('ug_admin') === '1')
  const [activeTab, setActiveTab] = useState('dashboard')

  const login = () => { sessionStorage.setItem('ug_admin', '1'); setLoggedIn(true) }
  const logout = () => { sessionStorage.removeItem('ug_admin'); setLoggedIn(false) }

  if (!loggedIn) return <Login onLogin={login} />

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
        <button onClick={logout} style={{ margin: '0 16px', padding: '10px 16px', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.7)', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
          Cerrar sesión
        </button>
      </aside>

      {/* Content */}
      <main style={{ padding: 'clamp(24px,4vw,48px)', overflowY: 'auto', maxHeight: '100vh' }}>
        {activeTab === 'dashboard'      && <Dashboard />}
        {activeTab === 'inicio'         && <TabInicio />}
        {activeTab === 'programa'       && <TabPrograma />}
        {activeTab === 'pensum'         && <TabPensum />}
        {activeTab === 'noticias'       && <TabNoticias />}
        {activeTab === 'convocatorias'  && <TabConvocatorias />}
        {activeTab === 'docentes'       && <TabDocentes />}
        {activeTab === 'estudiantes'    && <TabEstudiantes />}
        {activeTab === 'egresados'      && <TabEgresados />}
        {activeTab === 'funciones'      && <TabFunciones />}
        {activeTab === 'cna'            && <TabCNA />}
      </main>
    </div>
  )
}
