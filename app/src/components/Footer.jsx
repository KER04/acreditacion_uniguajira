import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { WayuuGlyph } from './WayuuPatterns'
import { useData } from '../context/DataContext'

/* Cuánto hay que mantener pulsado el logo del pie para entrar al panel. */
const PULSACION_ADMIN_MS = 1000

/* Pulsación larga sobre un enlace: si se sostiene el tiempo indicado navega a
   `destino` y anula el clic que llega al soltar; si se suelta antes, el
   enlace se comporta normal. Usa eventos de puntero, así vale para ratón y
   para pantallas táctiles. Esconder el acceso NO es seguridad: /admin sigue
   protegido por el inicio de sesión. */
function usePulsacionLarga(destino, ms) {
  const navigate = useNavigate()
  const timer = useRef(null)
  const disparada = useRef(false)
  const cancelar = () => { clearTimeout(timer.current); timer.current = null }
  return {
    onPointerDown: e => {
      if (e.button !== 0) return
      disparada.current = false
      cancelar()
      timer.current = setTimeout(() => { disparada.current = true; navigate(destino) }, ms)
    },
    onPointerUp: cancelar,
    onPointerLeave: cancelar,
    onPointerCancel: cancelar,
    onClick: e => { if (disparada.current) { e.preventDefault(); disparada.current = false } },
    // En móvil, sostener una imagen abre el menú de «guardar imagen».
    onContextMenu: e => e.preventDefault(),
  }
}

export default function Footer() {
  const { data } = useData()
  const accesoAdmin = usePulsacionLarga('/admin', PULSACION_ADMIN_MS)
  const sr = data.info_sedes?.riohacha ?? {}
  const sm = data.info_sedes?.maicao ?? {}

  return (
    <footer className="app-footer">
      <div className="inner">

        <div className="top">
          <div className="pie-marca">
            {/* Logo institucional, misma versión blanca que la cabecera: está
                pensada para fondo teal y el pie es marino. */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
              {/* Acceso escondido al panel: un clic lleva al inicio como
                  siempre; mantenerlo pulsado ~1 s abre /admin. */}
              <Link className="footer-marca" to="/" {...accesoAdmin}>
                <img className="footer-marca__logo" src="/images/marca/logo-vertical.webp"
                  alt="Marca institucional de la Universidad de La Guajira" draggable={false} />
              </Link>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Ingeniería de Sistemas</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '.18em', color: 'rgba(255,255,255,.8)', textTransform: 'uppercase', marginTop: 4 }}>
                  Universidad de La Guajira
                </div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.85)', maxWidth: '34ch', lineHeight: 1.55 }}>
              Formamos ingenieros de sistemas con raíces en el territorio y visión global.
            </p>
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 7, fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '.04em', color: 'rgba(255,255,255,.85)' }}>
              <div>SNIES <b style={{ color: '#fff' }}>17579</b></div>
              <div>Reg. calificado Res. <b style={{ color: '#fff' }}>02872 / 21 feb 2018</b></div>
              <div>Acreditación Res. <b style={{ color: '#fff' }}>014528 / 28 jul 2022</b></div>
            </div>
          </div>

          <div className="pie-enlaces">
            <h4>Programa</h4>
            <ul>
              <li><Link to="/programa">Presentación</Link></li>
              <li><Link to="/pensum">Plan de estudios</Link></li>
              <li><Link to="/acreditacion">Acreditación CNA</Link></li>
              <li><Link to="/resoluciones">Resoluciones</Link></li>
            </ul>
          </div>

          <div className="pie-enlaces">
            <h4>Comunidad</h4>
            <ul>
              <li><Link to="/estudiantes">Estudiantes</Link></li>
              <li><Link to="/docentes">Docentes</Link></li>
              <li><Link to="/graduados">Graduados</Link></li>
              <li><Link to="/egresados">Egresados</Link></li>
              <li><Link to="/investigacion">Investigación</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ marginBottom: 10 }}>Sede Riohacha</h4>
            <ul>
              {/* Sin respaldo escrito aquí: los que había eran datos viejos. */}
              {sr.direccion && <li>{sr.direccion}</li>}
              {sr.tel && <li>{sr.tel}</li>}
              {sr.email && <li>{sr.email}</li>}
              {sr.director && <li style={{ marginTop: 8 }}><b>Dir.:</b> {sr.director}</li>}
            </ul>
          </div>

          <div>
            <h4 style={{ marginBottom: 10 }}>Sede Maicao</h4>
            <ul>
              {sm.direccion && <li>{sm.direccion}</li>}
              {sm.tel && <li>{sm.tel}</li>}
              {sm.email && <li>{sm.email}</li>}
              {sm.director && <li style={{ marginTop: 8 }}><b>Coord.:</b> {sm.director}</li>}
            </ul>
          </div>
        </div>
        <div className="bottom">
          <div>© 2026 Universidad de La Guajira · Ingeniería de Sistemas</div>
          <div>SNIES 17579 · Res. MEN 02872 de 2018 · Acreditación Res. 014528 de 2022</div>
        </div>
      </div>
    </footer>
  )
}
