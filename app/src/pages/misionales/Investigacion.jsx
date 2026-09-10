import { Icons } from '../../components/Icons'

export default function Investigacion() {
  const grupos = [
    {n:'GITUG',t:'Grupo de Investigación en Tecnologías UniGuajira',cat:'A1 · MinCiencias',lines:['Ciberseguridad','Redes y sistemas','Infraestructura TIC'],lead:'Dr. Héctor Brito Mendoza',color:'var(--ug-azul)'},
    {n:'WayuuLab',t:'Computación, cultura y territorio',cat:'B · MinCiencias',lines:['IoT aplicado','Etnoinformática','Conservación y datos'],lead:'Dra. Luz Marina Ipuana',color:'var(--ug-amarillo)'},
    {n:'Caribe.AI',t:'Inteligencia artificial para el Caribe',cat:'B · MinCiencias',lines:['Machine learning','Visión computacional','IA ética'],lead:'Dr. Samuel Cotes Ramírez',color:'var(--ug-flamingo)'},
  ]
  const semilleros = ['IoT Wayuu','Seguridad Mar','DataTerritorio','IA para la Salud','Robótica Educativa','DevUG','Bioinformática marina','Accesibilidad y HCI','Visualización','Blockchain Social','Fintech Guajira','EduTech','GreenCode','Mujeres en TI']
  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: 'clamp(60px,8vw,110px)' }}>
        <div className="inner">
          <div className="eyebrow">Investigación e innovación</div>
          <h1 style={{ marginTop: 14, maxWidth: '20ch' }}>Tres grupos, catorce semilleros, una región que se investiga a sí misma.</h1>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="inner">
          <div className="grid-3">
            {grupos.map((g,i) => (
              <div key={i} className="card" style={{ background: 'var(--paper-2)', padding: 0, overflow: 'hidden' }}>
                <div style={{ height: 120, background: g.color, padding: 20, color: 'var(--ug-negro)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase' }}>{g.cat}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em' }}>{g.n}</div>
                </div>
                <div style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 18 }}>{g.t}</h3>
                  <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {g.lines.map((l,j) => <span key={j} className="chip" style={{ fontSize: 11 }}>{l}</span>)}
                  </div>
                  <hr className="rule" style={{ margin: '18px 0 14px' }} />
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Director · {g.lead}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--paper-2)' }}>
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Semilleros activos</div>
              <h2>Catorce formas de aprender investigando.</h2>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 12 }}>
            {semilleros.map((s,i) => (
              <div key={i} style={{ padding: '16px 18px', background: 'var(--paper)', borderRadius: 10, border: '1px solid color-mix(in oklab, var(--ink) 7%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', color: 'var(--ink-3)' }}>{String(i+1).padStart(2,'0')}</div>
                  <div style={{ fontWeight: 500, marginTop: 4 }}>{s}</div>
                </div>
                <Icons.arrow />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Producción destacada 2024–2025</div>
              <h2>Lo que publicamos.</h2>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              {y:'2025',t:'Anomaly detection in salinas: a case study in Manaure',v:'IEEE Latin America · Q2'},
              {y:'2025',t:'Ethno-informatics: designing with Wayuu communities',v:'CHI 2025 · Yokohama'},
              {y:'2024',t:'Low-power IoT for artisanal fishermen in La Guajira',v:'Sensors · Q1'},
              {y:'2024',t:'Un modelo de madurez en ciberseguridad para universidades del Caribe',v:'Computación y Sistemas · Q3'},
              {y:'2024',t:'Redes neuronales gráficas para rutas turísticas en el cabo',v:'Journal of Tourism Futures · Q2'},
            ].map((p,i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 24, padding: '22px 0', borderBottom: '1px solid color-mix(in oklab, var(--ink) 10%, transparent)', alignItems: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)', letterSpacing: '.1em' }}>{p.y}</div>
                <div style={{ fontSize: 17, letterSpacing: '-0.01em' }}>{p.t}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '.1em' }}>{p.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
