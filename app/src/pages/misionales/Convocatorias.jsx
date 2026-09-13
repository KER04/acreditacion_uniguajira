import { useState } from 'react'
import { Icons } from '../../components/Icons'
import { useData } from '../../context/DataContext'
import SedeFilter, { sedeMatch } from '../../components/SedeFilter'
import { fechaLarga } from '../../../shared/validacion'

const CATS = [
  ['all', 'Todas'],
  ['Investigación', 'Investigación'],
  ['Internacionalización', 'Internacional'],
  ['Extensión', 'Extensión'],
  ['Prácticas', 'Prácticas'],
  ['Estímulos', 'Estímulos / Becas'],
  ['Eventos', 'Eventos'],
]

const colorMap = {
  Investigación: 'var(--ug-azul)',
  Internacionalización: 'var(--ug-amarillo)',
  Extensión: 'var(--ug-flamingo)',
  Prácticas: 'var(--ug-marino)',
  Estímulos: 'var(--ug-amarillo)',
  Eventos: 'var(--ug-azul)',
}

export default function Convocatorias() {
  const { data } = useData()
  const [cat, setCat] = useState('all')
  const [sede, setSede] = useState('ambas')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)

  const items = (data.convocatorias ?? []).filter(c => {
    const matchCat = cat === 'all' || c.categoria === cat
    const matchQ = !q || c.titulo.toLowerCase().includes(q.toLowerCase()) || (c.descripcion ?? '').toLowerCase().includes(q.toLowerCase())
    const matchSede = sedeMatch(c.sede, sede)
    return matchCat && matchQ && matchSede
  })

  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: 'clamp(60px,8vw,110px)' }}>
        <div className="inner">
          <div className="eyebrow">Convocatorias y Eventos</div>
          <h1 style={{ marginTop: 14, maxWidth: '22ch' }}>Oportunidades abiertas para la comunidad del programa.</h1>
          <p style={{ fontSize: 18, color: 'var(--ink-2)', marginTop: 24, maxWidth: '58ch' }}>
            Prácticas, becas, semilleros, eventos y más. Actualizadas permanentemente por el equipo administrativo.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 16 }}>
        <div className="inner">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CATS.map(([k, l]) => (
                <button key={k} className="chip" onClick={() => setCat(k)}
                  style={{ cursor: 'pointer', background: cat === k ? 'var(--ink)' : undefined, color: cat === k ? 'var(--paper)' : undefined, borderColor: cat === k ? 'var(--ink)' : undefined }}>{l}</button>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar convocatorias..."
              style={{ padding: '10px 14px', borderRadius: 999, border: '1px solid color-mix(in oklab, var(--ink) 15%, transparent)', background: 'var(--paper-2)', minWidth: 240, font: 'inherit', color: 'inherit' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.1em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>Sede:</span>
            <SedeFilter value={sede} onChange={setSede} />
          </div>

          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-3)' }}>No hay convocatorias con ese criterio.</div>
          ) : (
            <div className="grid-3">
              {items.map((c, i) => (
                <div key={c.id ?? i} className="card" style={{ background: 'var(--paper-2)', display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer' }}
                  onClick={() => setOpen(open === (c.id ?? i) ? null : (c.id ?? i))}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}>
                    <span className="chip" style={{ fontSize: 10, background: colorMap[c.categoria] ?? 'var(--paper-3)', color: 'var(--ug-negro)', border: 'none' }}>{c.categoria}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: 4 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>Cierre: {fechaLarga(c.fecha_cierre)}</span>
                      {c.sede && c.sede !== 'ambas' && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.08em', color: 'var(--ug-marino)', textTransform: 'uppercase' }}>● {c.sede}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, letterSpacing: '-0.01em', lineHeight: 1.2 }}>{c.titulo}</div>
                  <p style={{ fontSize: 14, color: 'var(--ink-2)', flex: 1 }}>{c.descripcion}</p>
                  {open === (c.id ?? i) && c.requisitos && (
                    <div style={{ background: 'var(--paper)', borderRadius: 8, padding: 14, fontSize: 13 }}>
                      <div style={{ fontWeight: 600, marginBottom: 8 }}>Requisitos</div>
                      <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4, color: 'var(--ink-2)' }}>
                        {(Array.isArray(c.requisitos) ? c.requisitos : [c.requisitos]).map((r, j) => <li key={j}>{r}</li>)}
                      </ul>
                    </div>
                  )}
                  <button className="btn ghost" style={{ padding: '8px 16px', fontSize: 13, marginTop: 'auto', alignSelf: 'start' }} onClick={e => e.stopPropagation()}>
                    Ver más <Icons.arrow />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
