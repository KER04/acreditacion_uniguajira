import { useState } from 'react'
import { Icons } from '../../components/Icons'
import { WayuuBackdrop } from '../../components/WayuuPatterns'
import { STATUS_LABELS, STATUS_COLOR, statusFromScore } from '../../data/acreditacion'
import { useData } from '../../context/DataContext'
import CircularProgress from './CircularProgress'
import MetodologiaSection from './MetodologiaSection'
import EquipoSection from './EquipoSection'
import EvidenciasSection from './EvidenciasSection'
import FactorPage from './FactorPage'

export default function Acreditacion() {
  const { data } = useData()
  const [factorN, setFactorN] = useState(null)
  const [filter, setFilter] = useState('all')

  const factores = (data.factores ?? []).map(f => ({
    ...f,
    status: statusFromScore(f.score),
    color: STATUS_COLOR[statusFromScore(f.score)],
  }))

  const cronograma = data.cronograma_cna ?? []

  if (factorN !== null) {
    const f = factores.find(x => x.n === factorN)
    if (f) return (
      <FactorPage
        factor={f}
        allFactores={factores}
        onBack={() => { setFactorN(null); window.scrollTo(0, 0) }}
        onNavigate={n => { setFactorN(n); window.scrollTo(0, 0) }}
      />
    )
  }

  const prom = factores.length ? factores.reduce((a, f) => a + f.score, 0) / factores.length : 0
  const stats = factores.reduce((a, f) => { a[f.status] = (a[f.status] || 0) + 1; return a }, {})

  return (
    <div className="page-in">
      {/* Hero */}
      <section className="cna-hero">
        <WayuuBackdrop variant="a" />
        <div className="cna-hero-inner" style={{ position: 'relative', zIndex: 2 }}>
          <div>
            <div className="hero-eyebrow-row">
              <span className="chip" style={{ background: 'var(--ug-flamingo)', color: 'var(--paper)', borderColor: 'transparent' }}>● Autoevaluación 2026</span>
              <span className="chip">Acuerdo 02 de 2020 CESU</span>
              <span className="chip">CNA · Consejo Nacional de Acreditación</span>
            </div>
            <h1 style={{ marginTop: 24 }}>Acreditación<br />de alta calidad<br /><em style={{ color: 'var(--accent-deep)', fontStyle: 'normal' }}>en 12 factores.</em></h1>
            <p className="lede" style={{ marginTop: 24 }}>
              Tablero de autoevaluación del programa frente a los doce factores del Acuerdo 02 de 2020. Cada tarjeta abre una página dedicada con características, evidencias, fortalezas, oportunidades de mejora y equipo responsable.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
              <button className="btn"><Icons.download /> Informe de autoevaluación</button>
              <button className="btn ghost"><Icons.external /> Plan de mejoramiento</button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <CircularProgress value={prom} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, width: '100%', maxWidth: 320 }}>
              {[
                { k: 'pleno', l: 'Pleno', c: 'var(--ug-azul)' },
                { k: 'alto', l: 'Alto', c: 'var(--ug-amarillo)' },
                { k: 'desarrollo', l: 'Desarrollo', c: 'var(--ug-flamingo)' },
              ].map(({ k, l, c }) => (
                <div key={k} style={{ textAlign: 'center', padding: '10px 4px', background: `color-mix(in oklab, ${c} 25%, transparent)`, borderRadius: 8 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 26 }}>{stats[k] || 0}</div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tablero de factores */}
      <section className="section" style={{ paddingTop: 60 }}>
        <div className="inner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 20, marginBottom: 32, flexWrap: 'wrap' }}>
            <div>
              <div className="eyebrow">Los doce factores · Acuerdo 02 de 2020</div>
              <h2 style={{ marginTop: 10 }}>Abre un factor para ver el detalle completo.</h2>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[{ k: 'all', l: 'Todos' }, { k: 'pleno', l: 'Pleno' }, { k: 'alto', l: 'Alto' }, { k: 'desarrollo', l: 'Desarrollo' }].map(f => (
                <button key={f.k} className="chip" onClick={() => setFilter(f.k)}
                  style={{ cursor: 'pointer', background: filter === f.k ? 'var(--ink)' : undefined, color: filter === f.k ? 'var(--paper)' : undefined, borderColor: filter === f.k ? 'var(--ink)' : undefined }}>{f.l}</button>
              ))}
            </div>
          </div>
          <div className="factor-grid">
            {factores.map(f => (
              <button key={f.n} className="factor-card" data-status={f.status}
                style={{ opacity: filter !== 'all' && f.status !== filter ? 0.28 : 1 }}
                onClick={() => { setFactorN(f.n); window.scrollTo(0, 0) }}>
                <div className="n">Factor {String(f.n).padStart(2,'0')}</div>
                <div className="factor-pill">{STATUS_LABELS[f.status]}</div>
                <div className="title">{f.t}</div>
                <div className="score"><span>Calificación</span><b>{f.score.toFixed(1)}</b></div>
                <div className="meter"><i style={{ width: `${f.score}%` }} /></div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <MetodologiaSection />
      <EquipoSection />
      <EvidenciasSection />

      {/* Cronograma */}
      <section className="section" style={{ background: 'var(--paper-2)' }}>
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Ruta de acreditación</div>
              <h2>Cronograma del proceso.</h2>
            </div>
          </div>
          <div>
            {cronograma.map((step, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 180px 1fr', gap: 20, alignItems: 'center', padding: '16px 0', borderBottom: '1px solid color-mix(in oklab, var(--ink) 7%, transparent)' }}>
                <div style={{ width: 34, height: 34, borderRadius: 999, background: step.s === 'done' ? 'var(--ug-azul)' : step.s === 'current' ? 'var(--ug-amarillo)' : 'var(--paper)', border: '2px solid ' + (step.s === 'next' ? 'color-mix(in oklab, var(--ink) 20%, transparent)' : 'transparent'), display: 'grid', placeItems: 'center', color: 'var(--ug-negro)', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700 }}>
                  {step.s === 'done' ? '✓' : step.s === 'current' ? '●' : i + 1}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.1em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>{step.d}</div>
                <div style={{ fontSize: 18, fontWeight: step.s === 'current' ? 600 : 500 }}>{step.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
