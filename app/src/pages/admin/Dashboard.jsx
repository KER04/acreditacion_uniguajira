import { useState } from 'react'
import { useData } from '../../context/DataContext'

export default function Dashboard() {
  const { data, reset } = useData()
  const [confirmReset, setConfirmReset] = useState(false)

  const kpis = [
    { l: 'Noticias', v: (data.noticias ?? []).length },
    { l: 'Convocatorias', v: (data.convocatorias ?? []).length },
    { l: 'Docentes', v: (data.docentes ?? []).length },
    { l: 'Cuadro de honor', v: (data.honor ?? []).length },
    { l: 'Egresados destacados', v: (data.destacados ?? []).length },
    { l: 'Ofertas laborales', v: (data.ofertas ?? []).length },
    { l: 'Grupos investigación', v: (data.grupos ?? []).length },
    { l: 'Semilleros', v: (data.semilleros ?? []).length },
  ]

  return (
    <div>
      <h3 style={{ marginBottom: 20 }}>Resumen de contenido</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 12, marginBottom: 32 }}>
        {kpis.map(k => (
          <div key={k.l} style={{ background: 'var(--paper-2)', borderRadius: 12, padding: '20px 22px', border: '1px solid color-mix(in oklab, var(--ink) 7%, transparent)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700 }}>{k.v}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>{k.l}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--paper-2)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Accesos rápidos</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[['inicio','Inicio'],['programa','Programa'],['noticias','Noticias'],['convocatorias','Convocatorias'],['docentes','Docentes'],['honor','Cuadro de honor'],['egresados','Egresados'],['funciones','Funciones misionales'],['cna','Acreditación CNA']].map(([k,l]) => (
            <span key={k} style={{ padding: '6px 14px', borderRadius: 999, background: 'var(--paper)', border: '1px solid color-mix(in oklab, var(--ink) 12%, transparent)', fontSize: 13, cursor: 'default' }}>{l}</span>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid color-mix(in oklab, var(--ink) 10%, transparent)', paddingTop: 24 }}>
        <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--ug-flamingo)' }}>Zona de riesgo</div>
        <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 14 }}>Restablecer todo el contenido a los valores predeterminados. Esta acción no se puede deshacer.</p>
        {!confirmReset ? (
          <button className="btn ghost" style={{ padding: '8px 18px', fontSize: 13, color: 'var(--ug-flamingo)', borderColor: 'var(--ug-flamingo)' }} onClick={() => setConfirmReset(true)}>
            Restablecer datos
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>¿Confirmas?</span>
            <button className="btn ghost" style={{ padding: '8px 18px', fontSize: 13, color: 'var(--ug-flamingo)', borderColor: 'var(--ug-flamingo)' }} onClick={() => { reset(); setConfirmReset(false) }}>
              Sí, restablecer
            </button>
            <button className="btn ghost" style={{ padding: '8px 18px', fontSize: 13 }} onClick={() => setConfirmReset(false)}>Cancelar</button>
          </div>
        )}
      </div>
    </div>
  )
}
