import { WayuuBackdrop } from '../../components/WayuuPatterns'
import { useData } from '../../context/DataContext'

export default function EquipoSection() {
  const { data } = useData()
  const equipo = data.equipo_cna ?? []

  return (
    <section className="section">
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Equipo de trabajo</div>
            <h2>Quienes llevan adelante el proceso.</h2>
          </div>
          <p className="desc">Comité de autoevaluación conformado por la dirección, representantes docentes por factor, estudiantes, egresados y personal administrativo de apoyo.</p>
        </div>
        <div className="grid-4">
          {equipo.map((p, i) => (
            <div key={i} className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--paper)' }}>
              <div style={{ aspectRatio: '1/1', background: p.color ?? 'var(--ug-azul)', position: 'relative', display: 'grid', placeItems: 'center' }}>
                <WayuuBackdrop variant="a" />
                <div style={{ position: 'relative', fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 600, color: 'var(--ug-negro)', letterSpacing: '-0.02em' }}>
                  {p.n.split(' ').map(w => w[0]).filter(c => /[A-ZÁÉÍÓÚ]/.test(c)).slice(0,2).join('')}
                </div>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{p.cargo}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, marginTop: 6, letterSpacing: '-0.01em' }}>{p.n}</div>
                <hr className="rule" style={{ margin: '12px 0 10px' }} />
                <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5 }}>{p.rol}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
