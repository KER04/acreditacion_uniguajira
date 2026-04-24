import { useState } from 'react'
import { Icons } from '../../components/Icons'
import { WayuuBackdrop } from '../../components/WayuuPatterns'
import { useData } from '../../context/DataContext'
import SedeFilter, { sedeMatch } from '../../components/SedeFilter'

export default function Docentes() {
  const { data } = useData()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const [sede, setSede] = useState('ambas')

  const filtered = (data.docentes ?? []).filter(d => {
    const matchQ = !q || d.n.toLowerCase().includes(q.toLowerCase()) || d.a.toLowerCase().includes(q.toLowerCase())
    const matchC = cat === 'all' || d.cat.toLowerCase() === cat
    const matchSede = sedeMatch(d.sede, sede)
    return matchQ && matchC && matchSede
  })

  const bgColors = ['var(--ug-amarillo-soft)','var(--ug-azul-soft)','var(--ug-flamingo-soft)','var(--paper-3)']

  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: 'clamp(60px,8vw,110px)' }}>
        <div className="inner">
          <div className="eyebrow">Comunidad · Docentes</div>
          <h1 style={{ marginTop: 14, maxWidth: '18ch' }}>Quienes enseñan aquí, hacen también.</h1>
          <p style={{ fontSize: 18, color: 'var(--ink-2)', marginTop: 24, maxWidth: '58ch' }}>
            Directorio completo con áreas de trabajo, correos institucionales y horarios de atención a estudiantes.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 36, alignItems: 'center' }}>
            <div className="chip"><b style={{ marginRight: 6 }}>28</b> docentes</div>
            <div className="chip"><b style={{ marginRight: 6 }}>9</b> doctorados</div>
            <div className="chip"><b style={{ marginRight: 6 }}>17</b> maestrías</div>
            <div style={{ flex: 1 }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre o área..."
              style={{ padding: '10px 14px', borderRadius: 999, border: '1px solid color-mix(in oklab, var(--ink) 15%, transparent)', background: 'var(--paper-2)', minWidth: 260, font: 'inherit', color: 'inherit' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            {[['all','Todas las categorías'],['titular','Titular'],['asociado','Asociado'],['asistente','Asistente']].map(([k,l]) => (
              <button key={k} className="chip" onClick={() => setCat(k)}
                style={{ cursor: 'pointer', background: cat===k ? 'var(--ink)' : undefined, color: cat===k ? 'var(--paper)' : undefined, borderColor: cat===k ? 'var(--ink)' : undefined }}>{l}</button>
            ))}
            <div style={{ flex: 1 }} />
            <SedeFilter value={sede} onChange={setSede} />
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="inner">
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-3)' }}>No se encontraron docentes con ese criterio.</div>
          )}
          <div className="grid-2">
            {filtered.map((d,i) => (
              <div key={d.id} className="card" style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 20, background: 'var(--paper-2)' }}>
                <div style={{ width: 100, height: 100, borderRadius: 14, background: bgColors[i%4], position: 'relative', overflow: 'hidden' }}>
                  <WayuuBackdrop variant="a" />
                  <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--ug-negro)', opacity: .6 }}>
                    {d.n.split(' ').filter(w => /^[A-ZÁÉÍÓÚ]/.test(w)).slice(0,2).map(w => w[0]).join('')}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{d.r}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, marginTop: 4, letterSpacing: '-0.01em' }}>{d.n}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 6 }}>{d.a}</div>
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--ink-2)' }}>✉ {d.e}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>🕑 {d.h}</div>
                  <div style={{ marginTop: 10 }}><span className="chip" style={{ fontSize: 10 }}>{d.cat}</span></div>
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
              <div className="eyebrow">Documentos institucionales</div>
              <h2 style={{ marginTop: 10 }}>Recursos para el cuerpo docente.</h2>
            </div>
          </div>
          <div className="grid-3">
            {[
              ['Estatuto profesoral','Acuerdo 045 de 2020','PDF · 1.2 MB'],
              ['Plan de desarrollo profesoral','2024 – 2028','PDF · 780 KB'],
              ['Formato de autoevaluación docente','Vigencia 2026','DOC · 64 KB'],
              ['Guía para puntos salariales','Sistema interno UniGuajira','PDF · 420 KB'],
              ['Reglamento de propiedad intelectual','Acuerdo 022 de 2019','PDF · 640 KB'],
              ['Políticas de investigación','VCTI UniGuajira','PDF · 580 KB'],
              ['Manual de identidad visual','Versión 2023','PDF · 3.4 MB'],
              ['Formato de registro de producción','CvLac interno','DOC · 58 KB'],
              ['Política de bienestar docente','Vigente 2026','PDF · 390 KB'],
            ].map(([t,s,sz],i) => (
              <div key={i} style={{ padding: '20px 22px', background: 'var(--paper)', borderRadius: 12, display: 'flex', alignItems: 'start', gap: 14, border: '1px solid color-mix(in oklab, var(--ink) 7%, transparent)' }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: 'var(--paper-2)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--ink-3)', flexShrink: 0 }}>{sz.split('·')[0].trim()}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 15 }}>{t}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{s}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.08em', color: 'var(--ink-3)', marginTop: 4 }}>{sz}</div>
                </div>
                <button className="icon-btn" style={{ width: 32, height: 32 }}><Icons.download /></button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
