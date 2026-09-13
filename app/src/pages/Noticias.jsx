import { useState } from 'react'
import { Icons } from '../components/Icons'
import { WayuuBackdrop } from '../components/WayuuPatterns'
import { useData } from '../context/DataContext'
import SedeFilter, { sedeMatch } from '../components/SedeFilter'
import { fechaLarga, CATEGORIAS_NOTICIA } from '../../shared/validacion'

/* Una sola lista canónica, la misma que validan la API y la base. Antes aquí
   había 'investigación' en minúscula mientras el contenido guardaba
   'Investigación', y como el filtro compara con === la noticia desaparecía
   al filtrar por su propia categoría. */
const CATS = [['all', 'Todas'], ...CATEGORIAS_NOTICIA.map(c => [c, c])]

const colorCat = {
  'Académico': 'var(--ug-azul)', 'Investigación': 'var(--ug-amarillo)',
  'Extensión': 'var(--ug-flamingo)', 'Institucional': 'var(--ug-marino)',
  'Acreditación': 'var(--ug-azul)', 'Egresados': 'var(--ug-amarillo)',
  'Docencia': 'var(--ug-flamingo)',
}

export default function Noticias() {
  const { data } = useData()
  const [cat, setCat] = useState('all')
  const [sede, setSede] = useState('ambas')
  const [q, setQ] = useState('')
  const [active, setActive] = useState(null)

  const items = (data.noticias ?? []).filter(n => {
    const matchCat = cat === 'all' || n.categoria === cat
    const matchQ = !q || n.titulo.toLowerCase().includes(q.toLowerCase())
    const matchSede = sedeMatch(n.sede, sede)
    return matchCat && matchQ && matchSede
  })

  const featured = items[0]
  const rest = items.slice(1)

  if (active) {
    const n = data.noticias.find(x => x.id === active)
    if (n) return (
      <div className="page-in">
        <section className="section" style={{ paddingTop: 'clamp(60px,8vw,110px)' }}>
          <div className="inner" style={{ maxWidth: 780 }}>
            <button className="btn ghost" style={{ marginBottom: 28, padding: '8px 16px', fontSize: 13 }} onClick={() => setActive(null)}>
              ← Volver a noticias
            </button>
            <span className="chip" style={{ fontSize: 11, background: colorCat[n.categoria], color: 'var(--ug-negro)', border: 'none' }}>{n.categoria}</span>
            <h1 style={{ marginTop: 16, maxWidth: '32ch' }}>{n.titulo}</h1>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)', marginTop: 12, letterSpacing: '.1em' }}>{fechaLarga(n.fecha)}</div>
            <div style={{ height: 320, background: colorCat[n.categoria] ?? 'var(--ug-azul)', borderRadius: 14, marginTop: 32, position: 'relative', overflow: 'hidden' }}>
              <WayuuBackdrop variant="b" />
            </div>
            <div style={{ marginTop: 32, fontSize: 17, lineHeight: 1.75, color: 'var(--ink-2)', whiteSpace: 'pre-line' }}>
              {n.cuerpo ?? n.resumen}
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: 'clamp(60px,8vw,110px)' }}>
        <div className="inner">
          <div className="eyebrow">Noticias</div>
          <h1 style={{ marginTop: 14, maxWidth: '22ch' }}>Lo que pasa en Ingeniería de Sistemas.</h1>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginTop: 32 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CATS.map(([k, l]) => (
                <button key={k} className="chip" onClick={() => setCat(k)}
                  style={{ cursor: 'pointer', background: cat === k ? 'var(--ink)' : undefined, color: cat === k ? 'var(--paper)' : undefined, borderColor: cat === k ? 'var(--ink)' : undefined }}>{l}</button>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            <SedeFilter value={sede} onChange={setSede} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar noticias..."
              style={{ padding: '10px 14px', borderRadius: 999, border: '1px solid color-mix(in oklab, var(--ink) 15%, transparent)', background: 'var(--paper-2)', minWidth: 240, font: 'inherit', color: 'inherit' }} />
          </div>
        </div>
      </section>

      {items.length === 0 ? (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="inner">
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-3)' }}>No hay noticias con ese criterio.</div>
          </div>
        </section>
      ) : (
        <>
          {featured && (
            <section className="section" style={{ paddingTop: 0 }}>
              <div className="inner">
                <div className="card featured-news" style={{ padding: 0, overflow: 'hidden', background: 'var(--paper-2)', cursor: 'pointer', display: 'grid', gridTemplateColumns: '1fr 1fr' }}
                  onClick={() => setActive(featured.id)}>
                  <div style={{ aspectRatio: '4/3', background: colorCat[featured.categoria] ?? 'var(--ug-azul)', position: 'relative', overflow: 'hidden' }}>
                    <WayuuBackdrop variant="a" />
                  </div>
                  <div style={{ padding: 36, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span className="chip" style={{ fontSize: 11, background: colorCat[featured.categoria], color: 'var(--ug-negro)', border: 'none', alignSelf: 'start' }}>{featured.categoria}</span>
                    <h2 style={{ marginTop: 16, fontSize: 'clamp(20px,2.2vw,28px)', letterSpacing: '-0.02em' }}>{featured.titulo}</h2>
                    <p style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.6 }}>{featured.resumen}</p>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 24 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{fechaLarga(featured.fecha)}</div>
                      <button className="btn accent" style={{ padding: '8px 20px', fontSize: 13 }}>Leer más <Icons.arrow /></button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {rest.length > 0 && (
            <section className="section" style={{ paddingTop: 0 }}>
              <div className="inner">
                <div className="grid-3">
                  {rest.map((n, i) => (
                    <div key={n.id ?? i} className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--paper-2)', cursor: 'pointer' }}
                      onClick={() => setActive(n.id)}>
                      <div style={{ height: 140, background: colorCat[n.categoria] ?? 'var(--paper-3)', position: 'relative', overflow: 'hidden' }}>
                        <WayuuBackdrop variant="b" />
                      </div>
                      <div style={{ padding: 22 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <span className="chip" style={{ fontSize: 10 }}>{n.categoria}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)' }}>{fechaLarga(n.fecha)}</span>
                        </div>
                        <div style={{ fontWeight: 500, fontSize: 16, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{n.titulo}</div>
                        <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 10 }}>{n.resumen}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
