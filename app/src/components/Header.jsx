import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Icons } from './Icons'
import { WayuuGlyph } from './WayuuPatterns'

const NAV = [
  { path: '/', label: 'Inicio' },
  { label: 'Programa', children: [
    { path: '/programa', label: 'Presentación', desc: 'Misión, visión, objetivos, perfiles' },
    { path: '/pensum', label: 'Plan de estudios', desc: '169 créditos · 10 semestres' },
    { path: '/resoluciones', label: 'Resoluciones', desc: 'Registro calificado y acreditación' },
    { path: '/contacto', label: 'Dirección y contacto', desc: 'Adanud Segundo Meza Valle' },
  ]},
  { path: '/acreditacion', label: 'Acreditación', badge: true },
  { label: 'Comunidad', children: [
    { path: '/estudiantes', label: 'Estudiantes', desc: 'Calendario, cuadro de honor, reglamento, grados' },
    { path: '/docentes', label: 'Docentes', desc: 'Directorio, horarios de atención, documentos' },
    { path: '/egresados', label: 'Egresados', desc: 'Bolsa de empleo, asociación, actualización' },
  ]},
  { label: 'Funciones Misionales', children: [
    { path: '/investigacion', label: 'Investigación', desc: 'Grupos, semilleros y producción' },
    { path: '/extension', label: 'Extensión y Proyección Social', desc: 'Convenios y proyectos con la región' },
    { path: '/internacionalizacion', label: 'Internacionalización', desc: 'Movilidad y cooperación' },
    { path: '/convocatorias', label: 'Convocatorias', desc: 'Oportunidades abiertas' },
  ]},
  { path: '/noticias', label: 'Noticias' },
]

/* Bridge height between trigger and panel (px). Must match paddingBottom on nav-drop. */
const BRIDGE = 8

function NavDrop({ item, isOpen, onOpen, onClose }) {
  const location = useLocation()
  const closeTimer = useRef(null)

  const handleMouseEnter = () => {
    clearTimeout(closeTimer.current)
    onOpen()
  }

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(onClose, 150)
  }

  const active = item.children.some(c => location.pathname === c.path)

  return (
    <div
      style={{ position: 'relative', paddingBottom: BRIDGE }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className={active ? 'active' : ''} onClick={() => isOpen ? onClose() : onOpen()}>
        {item.label} <span style={{ fontSize: 9, marginLeft: 4, opacity: .6 }}>▼</span>
      </button>

      {/* Always rendered — visibility controlled via CSS transitions so mouse events keep working */}
      <div
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: 0,
          background: 'var(--paper)',
          border: '1px solid color-mix(in oklab, var(--ink) 10%, transparent)',
          borderRadius: 14,
          padding: 8,
          minWidth: 320,
          boxShadow: 'var(--shadow-lg)',
          zIndex: 50,
          /* show / hide with transition */
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          pointerEvents: isOpen ? 'all' : 'none',
          transform: isOpen ? 'translateY(0)' : 'translateY(-6px)',
          transition: 'opacity .15s ease, transform .15s ease, visibility .15s',
          transitionDelay: isOpen ? '0s' : '.15s',
        }}
      >
        {item.children.map(c => (
          <Link
            key={c.path}
            to={c.path}
            style={{
              display: 'block',
              padding: '12px 14px',
              borderRadius: 10,
              textDecoration: 'none',
              color: 'var(--ink)',
              background: location.pathname === c.path
                ? 'color-mix(in oklab, var(--accent) 22%, transparent)'
                : 'transparent',
            }}
          >
            <div style={{ fontWeight: 500, fontSize: 14 }}>{c.label}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{c.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function Header({ theme, setTheme }) {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(null)

  useEffect(() => { setOpen(false); setDropOpen(null) }, [location])

  const isActive = (path) => location.pathname === path

  return (
    <header className="app-header">
      <div className="bar">
        <Link className="brand" to="/">
          <div className="brand-mark" aria-hidden><WayuuGlyph size={22} color="var(--ug-amarillo)" /></div>
          <div className="brand-text">
            <div className="t1">Ingeniería de Sistemas</div>
            <div className="t2">Universidad de La Guajira</div>
          </div>
        </Link>

        <nav className="nav-links" aria-label="Principal">
          {NAV.map((n, i) => {
            if (n.children) {
              return (
                <NavDrop
                  key={i}
                  item={n}
                  isOpen={dropOpen === i}
                  onOpen={() => setDropOpen(i)}
                  onClose={() => setDropOpen(null)}
                />
              )
            }
            return (
              <Link key={n.path} className={isActive(n.path) ? 'active' : ''} to={n.path}>
                {n.label}
                {n.badge && <span style={{ marginLeft: 6, color: 'var(--ug-flamingo)' }}>●</span>}
              </Link>
            )
          })}
        </nav>

        <div className="nav-cta">
          <button className="icon-btn" aria-label="Tema" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Icons.sun /> : <Icons.moon />}
          </button>
          <Link to="/admin" className="btn ghost" style={{ padding: '8px 16px', fontSize: 13 }}>Admin</Link>
          <button className="icon-btn mobile-toggle" onClick={() => setOpen(!open)} aria-label="Menú">
            {open ? <Icons.close /> : <Icons.menu />}
          </button>
        </div>
      </div>

      <div className={'mobile-menu ' + (open ? 'open' : '')}>
        {NAV.map((n, i) => {
          if (n.children) {
            return (
              <div key={i}>
                <div style={{ padding: '16px 0 4px', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)' }}>{n.label}</div>
                {n.children.map(c => (
                  <Link key={c.path} to={c.path} style={{ paddingLeft: 12 }}>{c.label}</Link>
                ))}
              </div>
            )
          }
          return <Link key={n.path} to={n.path}>{n.label}</Link>
        })}
        <Link to="/admin" style={{ marginTop: 8 }}>Panel Admin</Link>
      </div>
    </header>
  )
}
