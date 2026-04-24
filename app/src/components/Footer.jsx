import { Link } from 'react-router-dom'
import { WayuuGlyph } from './WayuuPatterns'
import { useData } from '../context/DataContext'

export default function Footer() {
  const { data } = useData()
  const sr = data.info_sedes?.riohacha ?? {}
  const sm = data.info_sedes?.maicao ?? {}

  return (
    <footer className="app-footer">
      <div className="inner">
        <div className="top" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <WayuuGlyph size={32} color="var(--ug-amarillo)" />
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
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.08em', color: 'rgba(255,255,255,.85)' }}>
              <div>SNIES <b style={{ color: '#fff' }}>17579</b></div>
              <div>Reg. calificado Res. <b style={{ color: '#fff' }}>02872 / 21 feb 2018</b></div>
              <div>Acreditación Res. <b style={{ color: '#fff' }}>014528 / 28 jul 2022</b></div>
            </div>
          </div>

          <div>
            <h4>Programa</h4>
            <ul>
              <li><Link to="/programa">Presentación</Link></li>
              <li><Link to="/pensum">Plan de estudios</Link></li>
              <li><Link to="/acreditacion">Acreditación CNA</Link></li>
              <li><Link to="/resoluciones">Resoluciones</Link></li>
            </ul>
          </div>

          <div>
            <h4>Comunidad</h4>
            <ul>
              <li><Link to="/estudiantes">Estudiantes</Link></li>
              <li><Link to="/docentes">Docentes</Link></li>
              <li><Link to="/egresados">Egresados</Link></li>
              <li><Link to="/investigacion">Investigación</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ marginBottom: 10 }}>Sede Riohacha</h4>
            <ul>
              <li>{sr.direccion ?? 'Bloque 1 — 2.° piso, Km 3+354 Vía Maicao'}</li>
              <li>{sr.tel ?? '+57 (605) 7282729 Ext. 240, 241'}</li>
              <li>{sr.email ?? 'ingsistemas@uniguajira.edu.co'}</li>
              {sr.director && <li style={{ marginTop: 8 }}><b>Dir.:</b> {sr.director}</li>}
            </ul>
          </div>

          <div>
            <h4 style={{ marginBottom: 10 }}>Sede Maicao</h4>
            <ul>
              <li>{sm.direccion ?? 'Calle 15 No. 14-37, Centro'}</li>
              <li>{sm.tel ?? '+57 (605) 7271500 Ext. 110'}</li>
              <li>{sm.email ?? 'sistemas.maicao@uniguajira.edu.co'}</li>
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
