import { Icons } from '../../components/Icons'
import { WayuuBackdrop } from '../../components/WayuuPatterns'

export default function Extension() {
  const convenios = [
    {emp:'Cluster TIC Caribe',tipo:'Empresarial',desde:'2022',focus:'Prácticas profesionales, proyectos de innovación abierta, bolsa de empleo.',color:'var(--ug-azul)'},
    {emp:'Alcaldía de Riohacha',tipo:'Público',desde:'2023',focus:'Consultoría en transformación digital municipal y ciberseguridad.',color:'var(--ug-amarillo)'},
    {emp:'Alcaldía de Manaure',tipo:'Público',desde:'2024',focus:'Monitoreo IoT de salinas y datos territoriales.',color:'var(--ug-flamingo)'},
    {emp:'Ecopetrol Digital',tipo:'Empresarial',desde:'2023',focus:'Prácticas de datos, ciberseguridad industrial, cátedras.',color:'var(--ug-marino)'},
    {emp:'Fundación Activos Colombia',tipo:'Tercer sector',desde:'2022',focus:'Proyectos sociales con ingeniería de datos para organizaciones sin ánimo de lucro.',color:'var(--ug-azul)'},
    {emp:'Cámara de Comercio de La Guajira',tipo:'Empresarial',desde:'2021',focus:'Digitalización de microempresas y acompañamiento en modelos de negocio TIC.',color:'var(--ug-amarillo)'},
  ]
  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: 'clamp(60px,8vw,110px)' }}>
        <div className="inner">
          <div className="eyebrow">Funciones misionales · Extensión</div>
          <h1 style={{ marginTop: 14, maxWidth: '22ch' }}>Ingeniería que sale del aula y aterriza en el territorio.</h1>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 32 }}>
            <div className="chip"><b style={{ marginRight: 6 }}>18</b> convenios vigentes</div>
            <div className="chip"><b style={{ marginRight: 6 }}>135</b> practicantes 2025</div>
            <div className="chip"><b style={{ marginRight: 6 }}>12</b> proyectos activos</div>
            <div className="chip"><b style={{ marginRight: 6 }}>4</b> municipios intervenidos</div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Convenios activos</div>
              <h2>Empresas, gobiernos y organizaciones aliadas.</h2>
            </div>
          </div>
          <div className="grid-3">
            {convenios.map((c,i) => (
              <div key={i} className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--paper-2)' }}>
                <div style={{ height: 100, background: c.color, padding: 20, color: 'var(--ug-negro)', display: 'flex', alignItems: 'end', position: 'relative', overflow: 'hidden' }}>
                  <WayuuBackdrop variant="a" />
                  <div style={{ position: 'relative', fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>{c.emp}</div>
                </div>
                <div style={{ padding: 22 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <span className="chip" style={{ fontSize: 10 }}>{c.tipo}</span>
                    <span className="chip" style={{ fontSize: 10 }}>Desde {c.desde}</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>{c.focus}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Educación continua</div>
              <h2>Diplomados y cursos abiertos.</h2>
            </div>
          </div>
          <div style={{ background: 'var(--paper)', borderRadius: 14, overflow: 'hidden' }}>
            {[
              {t:'Diplomado en Ciberseguridad Ofensiva',h:'120 horas',m:'Híbrido',f:'Ago – Nov 2026'},
              {t:'Diplomado en Ciencia de Datos con Python',h:'100 horas',m:'Presencial',f:'Sep – Dic 2026'},
              {t:'Curso de DevOps y AWS',h:'48 horas',m:'Virtual',f:'Jul 2026'},
              {t:'Curso de Inteligencia Artificial Generativa',h:'40 horas',m:'Virtual',f:'Ago 2026'},
              {t:'Diplomado en Transformación Digital del Sector Público',h:'80 horas',m:'Híbrido',f:'Oct – Dic 2026'},
            ].map((c,i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr 1fr 1fr auto', padding: '20px 28px', alignItems: 'center', borderTop: i>0 ? '1px solid color-mix(in oklab, var(--ink) 7%, transparent)' : 'none', gap: 16 }}>
                <div style={{ fontWeight: 500, fontSize: 16 }}>{c.t}</div>
                <span className="chip" style={{ fontSize: 11 }}>{c.h}</span>
                <span className="chip" style={{ fontSize: 11 }}>{c.m}</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>{c.f}</div>
                <button className="btn ghost" style={{ padding: '6px 14px', fontSize: 13 }}>Inscribirme <Icons.arrow /></button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
