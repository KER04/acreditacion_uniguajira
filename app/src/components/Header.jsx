import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Icons } from './Icons'

const NAV = [
  { path: '/', label: 'Inicio' },
  { label: 'Programa', children: [
    { path: '/programa', label: 'Presentación', desc: 'Misión, visión, objetivos, perfiles' },
    { path: '/pensum', label: 'Plan de estudios', desc: '169 créditos · 10 semestres' },
    { path: '/pensum-propuesto', label: 'Propuesta de actualización curricular', desc: '134 créditos · 8 semestres · en trámite' },
    { path: '/infraestructura', label: 'Recursos de infraestructura tecnológica', desc: 'Salas, laboratorios, conectividad y plataformas' },
    { path: '/resoluciones', label: 'Resoluciones', desc: 'Registro calificado y acreditación' },
    { path: '/contacto', label: 'Dirección y contacto', desc: 'Adanud Segundo Meza Valle' },
  ]},
  { label: 'Acreditación', badge: true, children: [
    { path: '/acreditacion', label: 'Autoevaluación', desc: 'Los doce factores y su calificación' },
    { path: '/acreditacion/plan-de-mejoramiento', label: 'Plan de mejoramiento', desc: 'Acciones derivadas de la autoevaluación' },
  ]},
  { label: 'Comunidad', children: [
    { path: '/estudiantes', label: 'Estudiantes', desc: 'Calendario, cuadro de honor, reglamento, documentos' },
    { path: '/saber-pro', label: 'Saber Pro', desc: 'Medias por año, destacados y grado por puntaje' },
    { path: '/docentes', label: 'Docentes', desc: 'Directorio, horarios de atención, documentos' },
    /* Dos etapas, dos páginas: el egresado está en trámite de grado, el
       graduado ya tiene el título. Antes ambas cosas colgaban de "Egresados". */
    { path: '/egresados', label: 'Egresados', desc: 'Modalidades de grado, normativas, prácticas e ideas de investigación' },
    { path: '/graduados', label: 'Graduados', desc: 'Bolsa de empleo, asociación, actualización' },
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
  const caja = useRef(null)
  /* Con qué se pulsó el botón por última vez (ratón, toque o lápiz). */
  const tipoPuntero = useRef('')

  /* Solo el ratón abre al pasar por encima. En pantallas táctiles el
     navegador simula un «hover» justo antes del toque y pasaba lo mismo:
     se abría y el toque lo cerraba. Ahí solo cuenta el toque. */
  const handlePointerEnter = e => {
    if (e.pointerType !== 'mouse') return
    clearTimeout(closeTimer.current)
    onOpen()
  }

  const handlePointerLeave = e => {
    if (e.pointerType !== 'mouse') return
    closeTimer.current = setTimeout(onClose, 200)
  }

  /* Con ratón el menú ya lo abrió el hover, así que el clic sobre la
     pestaña nunca lo cierra. Antes alternaba con una gracia de 600 ms: quien
     se quedaba un momento sobre la pestaña y luego hacía clic veía el menú
     abrirse y cerrarse solo. Con ratón se cierra al salir, con Esc o con un
     clic fuera. Con toque o teclado (Enter/Espacio) sigue alternando. */
  const handleClick = () => {
    const conRaton = tipoPuntero.current === 'mouse'
    tipoPuntero.current = ''
    if (!isOpen) { onOpen(); return }
    if (!conRaton) onClose()
  }

  /* Abierto, se cierra con Esc o con un clic fuera de él. */
  useEffect(() => {
    if (!isOpen) return
    const fuera = e => { if (!caja.current?.contains(e.target)) onClose() }
    const esc = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('pointerdown', fuera)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', fuera)
      document.removeEventListener('keydown', esc)
    }
  }, [isOpen, onClose])

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  /* También cuenta una subpágina (la ficha de una acción del plan, por
     ejemplo): sigue estando dentro de esa sección del menú. */
  const active = item.children.some(c => location.pathname === c.path || location.pathname.startsWith(c.path + '/'))

  return (
    <div
      ref={caja}
      style={{ position: 'relative', paddingBottom: BRIDGE }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <button className={active ? 'active' : ''} onClick={handleClick}
              onPointerDown={e => { tipoPuntero.current = e.pointerType }}
              aria-expanded={isOpen} aria-haspopup="true">
        {item.label}
        {item.badge && <span style={{ marginLeft: 6, color: 'var(--ug-flamingo)' }}>●</span>}
        {' '}<span style={{ fontSize: 9, marginLeft: 4, opacity: .6 }}>▼</span>
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

  useEffect(() => {
    if (!open) return
    const cerrar = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', cerrar)
    return () => window.removeEventListener('keydown', cerrar)
  }, [open])

  const isActive = (path) => location.pathname === path

  return (
    <header className="app-header">
      <div className="bar">
        <Link className="brand" to="/">
          {/* Logo institucional en versión blanca, la pensada para fondo teal. */}
          <img className="brand-logo" src="/images/marca/logo-horizontal.webp"
               alt="Universidad de La Guajira" width="230" height="72" />
          <span className="brand-sep" aria-hidden />
          <div className="brand-text">
            <div className="t1">Ingeniería de Sistemas</div>
            <div className="t2">SNIES 17579</div>
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
                  /* Cada menú solo puede cerrarse a SÍ MISMO. Al pasar de
                     «Programa» a «Acreditación», el temporizador de salida de
                     Programa vencía 200 ms después y cerraba el que estuviera
                     abierto, que ya era Acreditación: se abría y se cerraba. */
                  onClose={() => setDropOpen(actual => (actual === i ? null : actual))}
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
          <button className="icon-btn mobile-toggle" onClick={() => setOpen(!open)}
                  aria-label="Menú" aria-expanded={open} aria-controls="menu-movil">
            {open ? <Icons.close /> : <Icons.menu />}
          </button>
        </div>
      </div>

      {/* Primero los enlaces sueltos y después los grupos: así en tableta los
          grupos se reparten en columnas sin que «Inicio» ocupe una sola. */}
      <div id="menu-movil" className={'mobile-menu ' + (open ? 'open' : '')}>
        {NAV.filter(n => !n.children).map(n => (
          <Link key={n.path} to={n.path} className={isActive(n.path) ? 'active' : ''}>{n.label}</Link>
        ))}
        <div className="mobile-menu__lista">
          {NAV.filter(n => n.children).map(n => (
            <div key={n.label}>
              <div className="mobile-menu__grupo">{n.label}</div>
              {n.children.map(c => (
                <Link key={c.path} to={c.path} className={'mobile-menu__hijo' + (isActive(c.path) ? ' active' : '')}>{c.label}</Link>
              ))}
            </div>
          ))}
        </div>
        <div className="mobile-menu__acciones">
          <button className="mobile-menu__tema" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <span className="icon-btn" aria-hidden>{theme === 'dark' ? <Icons.sun /> : <Icons.moon />}</span>
            {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          </button>
          {/* Sin botón de panel: el acceso está escondido en el logo del pie. */}
        </div>
      </div>
    </header>
  )
}
