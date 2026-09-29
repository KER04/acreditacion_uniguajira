import { Icons } from '../../components/Icons'
import { useData } from '../../context/DataContext'

export default function EvidenciasSection() {
  const { data } = useData()
  const evidencias = data.evidencias_cna ?? []

  return (
    <section className="section section--papel">
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Evidencias y anexos generales</div>
            <h2>Documentos centrales del proceso.</h2>
          </div>
          <p className="desc">Documentación oficial disponible para pares evaluadores y comunidad académica.</p>
        </div>
        <div className="superficie">
          <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 2fr 1fr 0.8fr auto', padding: '14px 24px', background: 'var(--paper)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
            <div>Documento</div><div>Descripción</div><div>Fecha</div><div>Tamaño</div><div></div>
          </div>
          {evidencias.map((e, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2.2fr 2fr 1fr 0.8fr auto', padding: '16px 24px', alignItems: 'center', borderTop: '1px solid color-mix(in oklab, var(--ink) 7%, transparent)', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 6, background: 'var(--paper-2)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'var(--ink-3)' }}>PDF</div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{e.t}</div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{e.d}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)', letterSpacing: '.05em' }}>{e.f}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>{e.size}</div>
              <button className="btn ghost" style={{ padding: '6px 14px', fontSize: 13 }}><Icons.download /> Descargar</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
