import { Icons } from '../../components/Icons'
import { WayuuBackdrop } from '../../components/WayuuPatterns'

export default function Resoluciones() {
  const docs = [
    { eyebrow: 'Registro calificado', t: 'Resolución N.º 02872', d: '21 de febrero de 2018', vig: '7 años', body: 'Otorgamiento del registro calificado al programa de Ingeniería de Sistemas de la Universidad de La Guajira por parte del Ministerio de Educación Nacional (MEN).', color: 'var(--ug-azul)', autoridad: 'Ministerio de Educación Nacional' },
    { eyebrow: 'Acreditación de alta calidad', t: 'Resolución N.º 014528', d: '28 de julio de 2022', vig: '6 años', body: 'Otorgamiento de la acreditación de alta calidad por el CNA. Reconocimiento a la calidad académica, investigativa y de extensión del programa.', color: 'var(--ug-amarillo)', autoridad: 'Consejo Nacional de Acreditación (CNA)' },
  ]
  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: 'clamp(60px,8vw,110px)' }}>
        <div className="inner">
          <div className="eyebrow">Programa · Resoluciones</div>
          <h1 style={{ marginTop: 14, maxWidth: '20ch' }}>Marco legal del programa.</h1>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 32 }}>
            <div className="chip"><b style={{ marginRight: 6 }}>SNIES</b> 17579</div>
            <div className="chip">Registro vigente</div>
            <div className="chip">Acreditado en alta calidad</div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="inner">
          <div className="grid-2">
            {docs.map((d, i) => (
              <div key={i} className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--paper-2)' }}>
                <div style={{ height: 140, background: d.color, padding: 24, color: 'var(--ug-negro)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                  <WayuuBackdrop variant="a" />
                  <div style={{ position: 'relative', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase' }}>{d.eyebrow}</div>
                  <div style={{ position: 'relative', fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 600, letterSpacing: '-0.02em' }}>{d.t}</div>
                </div>
                <div style={{ padding: 28 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.1em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>Fecha · {d.d}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.1em', color: 'var(--ink-3)', textTransform: 'uppercase', marginTop: 6 }}>Vigencia · {d.vig}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 10 }}>{d.autoridad}</div>
                  <p style={{ fontSize: 15, color: 'var(--ink-2)', marginTop: 18, marginBottom: 22 }}>{d.body}</p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button className="btn" style={{ padding: '8px 16px', fontSize: 13 }}><Icons.download /> Descargar PDF</button>
                    <button className="btn ghost" style={{ padding: '8px 16px', fontSize: 13 }}><Icons.external /> Ver en SACES</button>
                  </div>
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
              <div className="eyebrow">Otros actos administrativos</div>
              <h2>Resoluciones rectorales y del consejo académico.</h2>
            </div>
          </div>
          <div style={{ background: 'var(--paper)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1.8fr 1fr auto', padding: '14px 24px', background: 'var(--paper-2)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ink-3)', gap: 14 }}>
              <div>Documento</div><div>Asunto</div><div>Fecha</div><div></div>
            </div>
            {[
              {t:'Acuerdo Consejo Académico 045/2024',a:'Aprobación reforma curricular Ingeniería de Sistemas',f:'Ago 2024'},
              {t:'Resolución Rectoral 0238/2024',a:'Adopción del PEP actualizado',f:'Oct 2024'},
              {t:'Acuerdo Consejo Superior 018/2021',a:'Reglamento estudiantil vigente',f:'Jun 2021'},
              {t:'Resolución Rectoral 0412/2023',a:'Designación del director del programa',f:'Nov 2023'},
              {t:'Acuerdo Consejo Académico 012/2023',a:'Política de opciones de grado',f:'Mar 2023'},
              {t:'Resolución MEN 014528/2022',a:'Acreditación de alta calidad',f:'Jul 2022'},
              {t:'Resolución MEN 02872/2018',a:'Registro calificado del programa',f:'Feb 2018'},
            ].map((r,i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2.2fr 1.8fr 1fr auto', padding: '16px 24px', alignItems: 'center', borderTop: '1px solid color-mix(in oklab, var(--ink) 7%, transparent)', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 6, background: 'var(--paper-2)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'var(--ink-3)' }}>PDF</div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{r.t}</div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{r.a}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>{r.f}</div>
                <button className="btn ghost" style={{ padding: '6px 14px', fontSize: 13 }}><Icons.download /></button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
