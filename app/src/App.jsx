import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'

import Home from './pages/Home'
import Programa from './pages/programa/Programa'
import Pensum from './pages/programa/Pensum'
import PensumPropuesto from './pages/programa/PensumPropuesto'
import Resoluciones from './pages/programa/Resoluciones'
import Contacto from './pages/programa/Contacto'
import Acreditacion from './pages/acreditacion'
import Noticias from './pages/Noticias'

import Estudiantes from './pages/comunidad/Estudiantes'
import Docentes from './pages/comunidad/Docentes'
import Egresados from './pages/comunidad/Egresados'
import Vacante from './pages/comunidad/Vacante'
import SaberPro from './pages/comunidad/SaberPro'
import Infraestructura from './pages/programa/Infraestructura'

import Investigacion from './pages/misionales/Investigacion'
import Extension from './pages/misionales/Extension'
import Internacionalizacion from './pages/misionales/Internacionalizacion'
import Convocatorias from './pages/misionales/Convocatorias'

import Admin from './pages/admin'

const ACCENT_KEYS = ['azul', 'amarillo', 'flamingo', 'marino']

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function Shell({ children, accent, theme, setTheme, setAccent }) {
  return (
    <>
      <Header theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent} />
      <main>{children}</main>
      <Footer />
    </>
  )
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('ug_theme') ?? 'light')
  const [accent, setAccent] = useState(() => {
    const saved = localStorage.getItem('ug_accent')
    return ACCENT_KEYS.includes(saved) ? saved : 'azul'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('ug_theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent)
    localStorage.setItem('ug_accent', accent)
  }, [accent])

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Admin — no shell */}
        <Route path="/admin" element={<Admin />} />

        {/* Public pages — with shell */}
        <Route path="/" element={<Shell theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent}><Home /></Shell>} />
        <Route path="/programa" element={<Shell theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent}><Programa /></Shell>} />
        <Route path="/pensum" element={<Shell theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent}><Pensum /></Shell>} />
        <Route path="/pensum-propuesto" element={<Shell theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent}><PensumPropuesto /></Shell>} />
        <Route path="/resoluciones" element={<Shell theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent}><Resoluciones /></Shell>} />
        <Route path="/infraestructura" element={<Shell theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent}><Infraestructura /></Shell>} />
        <Route path="/contacto" element={<Shell theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent}><Contacto /></Shell>} />
        <Route path="/acreditacion" element={<Shell theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent}><Acreditacion /></Shell>} />
        <Route path="/noticias" element={<Shell theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent}><Noticias /></Shell>} />

        <Route path="/estudiantes" element={<Shell theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent}><Estudiantes /></Shell>} />
        <Route path="/saber-pro" element={<Shell theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent}><SaberPro /></Shell>} />
        <Route path="/docentes" element={<Shell theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent}><Docentes /></Shell>} />
        <Route path="/egresados" element={<Shell theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent}><Egresados /></Shell>} />
        <Route path="/egresados/vacante/:id" element={<Shell theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent}><Vacante /></Shell>} />

        <Route path="/investigacion" element={<Shell theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent}><Investigacion /></Shell>} />
        <Route path="/extension" element={<Shell theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent}><Extension /></Shell>} />
        <Route path="/internacionalizacion" element={<Shell theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent}><Internacionalizacion /></Shell>} />
        <Route path="/convocatorias" element={<Shell theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent}><Convocatorias /></Shell>} />

        {/* 404 fallback */}
        <Route path="*" element={<Shell theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent}><div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 40 }}><div><div style={{ fontFamily: 'var(--font-display)', fontSize: 80, fontWeight: 700, opacity: .12 }}>404</div><h2 style={{ marginTop: -16 }}>Página no encontrada</h2></div></div></Shell>} />
      </Routes>
    </>
  )
}
