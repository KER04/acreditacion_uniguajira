import { WayuuBackdrop } from '../../components/WayuuPatterns'
import { Icons } from '../../components/Icons'

export default function Contacto() {
  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: 'clamp(60px,8vw,110px)' }}>
        <div className="inner">
          <div className="eyebrow">Programa · Dirección y contacto</div>
          <h1 style={{ marginTop: 14, maxWidth: '18ch' }}>Adanud Segundo Meza Valle</h1>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.15em', color: 'var(--ink-3)', textTransform: 'uppercase', marginTop: 12 }}>Director · Ingeniería de Sistemas</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 60, marginTop: 60, alignItems: 'start' }} className="programa-grid">
            <div>
              <p style={{ fontSize: 17, color: 'var(--ink-2)' }}>
                Lidera la gestión académica, la autoevaluación con fines de acreditación, la coordinación de los comités curricular y de autoevaluación, y la articulación del programa con las funciones misionales de la Universidad de La Guajira.
              </p>
              <p style={{ fontSize: 17, color: 'var(--ink-2)', marginTop: 18 }}>
                Desde la dirección se impulsa el plan de mejoramiento 2022–2026, la ejecución de la reforma curricular y la consolidación de alianzas con el sector externo para prácticas, proyectos y transferencia tecnológica.
              </p>
              <div style={{ marginTop: 36, padding: 28, background: 'var(--paper-2)', borderRadius: 14 }}>
                <div className="eyebrow">Horario de atención a estudiantes</div>
                <div style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.8 }}>
                  <b>Lunes a viernes</b> · 8:00 a. m. – 12:00 m. y 2:00 p. m. – 5:30 p. m.<br/>
                  <b>Cita previa:</b> Sec. Académica · <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>ext. 241</span>
                </div>
              </div>
            </div>
            <div className="card" style={{ background: 'var(--paper-2)', padding: 32 }}>
              <div className="eyebrow">Contacto institucional</div>
              <dl style={{ margin: '22px 0 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  ['Correo','ingsistemas@uniguajira.edu.co'],
                  ['Dirección','direccion.is@uniguajira.edu.co'],
                  ['Teléfono','+57 (605) 7282729'],
                  ['Extensiones','240, 241'],
                  ['Sede','Bloque 1 — segundo piso'],
                  ['Dirección física','Km 3+354 Vía Maicao'],
                  ['Ciudad','Riohacha, La Guajira'],
                  ['Código postal','440003'],
                ].map(([k,v]) => (
                  <div key={k} style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 16, fontSize: 14, paddingBottom: 12, borderBottom: '1px solid color-mix(in oklab, var(--ink) 7%, transparent)' }}>
                    <dt style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase' }}>{k}</dt>
                    <dd style={{ margin: 0, fontWeight: 500, wordBreak: 'break-word' }}>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--paper-2)' }}>
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Estructura del programa</div>
              <h2>Equipo directivo y de coordinación.</h2>
            </div>
          </div>
          <div className="grid-4">
            {[
              {n:'Adanud S. Meza Valle',r:'Director del programa',e:'direccion.is@uniguajira.edu.co',ext:'240',color:'var(--ug-azul)'},
              {n:'Claudia Mendoza',r:'Secretaria académica',e:'secretariais@uniguajira.edu.co',ext:'241',color:'var(--ug-amarillo)'},
              {n:'Dra. Luz Marina Ipuana',r:'Coord. autoevaluación CNA',e:'autoevaluacion.is@uniguajira.edu.co',ext:'245',color:'var(--ug-flamingo)'},
              {n:'Dr. Héctor Brito Mendoza',r:'Coord. investigación · GITUG',e:'hbrito@uniguajira.edu.co',ext:'248',color:'var(--ug-marino)'},
              {n:'MSc. Andrea Bolaños Curvelo',r:'Coord. extensión y semilleros',e:'abolanos@uniguajira.edu.co',ext:'249',color:'var(--ug-azul)'},
              {n:'MSc. Jorge Epieyú Palmar',r:'Coord. currículo',e:'curriculo.is@uniguajira.edu.co',ext:'246',color:'var(--ug-amarillo)'},
            ].map((p,i) => (
              <div key={i} className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--paper)' }}>
                <div style={{ aspectRatio: '4/3', background: p.color, position: 'relative', display: 'grid', placeItems: 'center' }}>
                  <WayuuBackdrop variant="a" />
                  <div style={{ position: 'relative', fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 600, color: 'var(--ug-negro)' }}>
                    {p.n.split(' ').map(w => w[0]).filter(c => /[A-ZÁÉÍÓÚ]/.test(c)).slice(0,2).join('')}
                  </div>
                </div>
                <div style={{ padding: 18 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{p.r}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, marginTop: 6 }}>{p.n}</div>
                  <hr className="rule" style={{ margin: '12px 0 10px' }} />
                  <div style={{ fontSize: 11, color: 'var(--ink-2)', wordBreak: 'break-word' }}>✉ {p.e}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-2)', marginTop: 4 }}>☎ ext. {p.ext}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
