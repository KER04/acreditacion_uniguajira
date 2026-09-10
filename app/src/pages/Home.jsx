import { useNavigate } from 'react-router-dom'
import { Icons } from '../components/Icons'
import { WayuuBackdrop, WayuuBand, WayuuGlyph } from '../components/WayuuPatterns'
import { useData } from '../context/DataContext'
import { statusFromScore, STATUS_COLOR } from '../data/acreditacion'

function Ticker() {
  const items = [
    'Acreditación de alta calidad en curso · CNA 2026',
    'Acreditación CNA — 12/12 factores en autoevaluación',
    'Semillero IoT Wayuu presenta en IEEE Colombia',
    'Hackathon Guajira Tech 2026 · 15–17 mayo',
    'Nuevo laboratorio de ciberseguridad inaugurado',
    'Convenio con Cluster TIC Caribe firmado',
  ]
  return (
    <div className="ticker">
      <div className="ticker-track">
        {[...items, ...items].map((t, i) => <span key={i}>{t}</span>)}
      </div>
    </div>
  )
}

function Hero() {
  const nav = useNavigate()
  return (
    <section className="hero v2">
      <div className="inner">
        <div>
          <div className="hero-eyebrow-row">
            <span className="chip"><Icons.sparkle /> Acreditación CNA · 12 factores</span>
          </div>
          <h1>El código también se teje.</h1>
          <p className="lede">
            Ingeniería de Sistemas en UniGuajira: donde el rigor técnico se encuentra con la identidad caribeña.
            Seis semestres de fundamentos, cuatro de profundización, un propósito: resolver lo que importa aquí.
          </p>
          <div className="hero-cta">
            <button className="btn accent" onClick={() => nav('/acreditacion')}>Ver acreditación <Icons.arrow /></button>
            <button className="btn ghost" onClick={() => nav('/pensum')}>Plan de estudios</button>
          </div>
          <div className="hero-stats">
            <div className="stat"><div className="n">169</div><div className="l">Créditos académicos</div></div>
            <div className="stat"><div className="n">10</div><div className="l">Semestres · presencial diurno</div></div>
            <div className="stat"><div className="n">17579</div><div className="l">Código SNIES del programa</div></div>
            <div className="stat"><div className="n">12/12</div><div className="l">Factores CNA en autoevaluación</div></div>
          </div>
        </div>
        <div className="image-panel">
          <div style={{ position: 'absolute', inset: 0 }}><WayuuBackdrop variant="b" /></div>
          <div style={{ position: 'absolute', inset: 24, background: 'var(--paper)', borderRadius: 18, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="eyebrow">Proyecto destacado</div>
              <h3 style={{ marginTop: 10, fontSize: 24 }}>ArenaNet: IoT para monitoreo de salinas en Manaure</h3>
            </div>
            <div>
              <div style={{ aspectRatio: '16/10', background: 'linear-gradient(135deg, var(--ug-amarillo-soft), var(--ug-azul-soft))', borderRadius: 12, position: 'relative', overflow: 'hidden' }}>
                <WayuuBackdrop variant="a" />
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--ug-negro)', opacity: .5 }}>ArenaNet</div>
              </div>
              <div style={{ marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '.1em' }}>SEMILLERO · IOT WAYUU · 2025</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section className="section">
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Qué te llevas de aquí</div>
            <h2>Un ingeniero con criterio técnico <em style={{ color: 'var(--accent-deep)', fontStyle: 'normal' }}>y arraigo territorial.</em></h2>
          </div>
          <p className="desc">No formamos programadores genéricos. Formamos ingenieros que saben leer un problema del Caribe y resolverlo con la mejor herramienta.</p>
        </div>
        <div className="grid-3">
          {[
            { e: '01 · Formación', t: 'Un pensum que respira', b: 'Diez semestres que combinan fundamentos de computación, ingeniería de software, datos, redes e IA — con electivas en IoT aplicado y ciencia de datos territorial.' },
            { e: '02 · Investigación', t: 'Tres grupos, una región', b: 'GITUG, WayuuLab y Caribe.AI articulan 14 semilleros activos y proyectos con comunidades wayuu, pescadores y salineros.' },
            { e: '03 · Territorio', t: 'Problemas reales, soluciones de código', b: 'Cada estudiante participa en al menos un proyecto con aliado externo: alcaldía, gremio, ONG o empresa regional.' },
          ].map((c, i) => (
            <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 280 }}>
              <div className="eyebrow">{c.e}</div>
              <h3>{c.t}</h3>
              <p style={{ color: 'var(--ink-2)', fontSize: 15 }}>{c.b}</p>
              <div style={{ marginTop: 'auto', paddingTop: 16 }}><WayuuGlyph size={36} color="var(--accent)" /></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CNAPreview() {
  const nav = useNavigate()
  const { data } = useData()
  const factores = data.factores ?? []
  const prom = factores.length ? factores.reduce((a, f) => a + f.score, 0) / factores.length : 0
  const pleno = factores.filter(f => statusFromScore(f.score) === 'pleno').length
  const alto  = factores.filter(f => statusFromScore(f.score) === 'alto').length
  const dev   = factores.filter(f => statusFromScore(f.score) === 'desarrollo').length

  return (
    <section className="section" style={{ background: 'var(--paper-2)', borderTop: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)', borderBottom: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)' }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow" style={{ color: 'var(--ug-flamingo-deep)' }}>● Autoevaluación 2025 · Radicado ante el CNA</div>
            <h2>Acreditación CNA — doce factores, una carrera.</h2>
          </div>
          <p className="desc">Tablero interactivo con las 12 dimensiones del CNA, evidencias documentales, plan de mejoramiento y cronograma del proceso.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 40, alignItems: 'center' }} className="cna-preview-grid">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {factores.length > 0 ? factores.map(f => {
              const color = STATUS_COLOR[statusFromScore(f.score)]
              return (
                <div key={f.n} onClick={() => nav('/acreditacion')} style={{ aspectRatio: '1/1', background: color, borderRadius: 10, display: 'grid', placeItems: 'center', color: 'var(--ug-negro)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, cursor: 'pointer' }}>{f.n}</div>
              )
            }) : Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ aspectRatio: '1/1', background: 'color-mix(in oklab, var(--ink) 10%, transparent)', borderRadius: 10 }} />
            ))}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 4 }}>{prom.toFixed(1)}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.15em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 20 }}>Promedio · Escala 0–100</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {pleno > 0 && <span className="chip" style={{ background: 'color-mix(in oklab, #62a9b6 30%, transparent)', borderColor: 'transparent' }}>Se cumple plenamente · {pleno}</span>}
              {alto  > 0 && <span className="chip" style={{ background: 'color-mix(in oklab, #e2a542 30%, transparent)', borderColor: 'transparent' }}>Se cumple en alto grado · {alto}</span>}
              {dev   > 0 && <span className="chip" style={{ background: 'color-mix(in oklab, #cc5e50 30%, transparent)', borderColor: 'transparent' }}>En desarrollo · {dev}</span>}
            </div>
            <button className="btn" onClick={() => nav('/acreditacion')}>Ir al tablero CNA <Icons.arrow /></button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Missions() {
  const nav = useNavigate()
  const items = [
    { c: '#62a9b6', t: 'Investigación', d: 'Tres grupos MinCiencias, catorce semilleros y producción indexada con impacto territorial.', l: '/investigacion', label: 'Azul mar' },
    { c: '#e2a542', t: 'Extensión y Proyección Social', d: 'Convenios con comunidades wayuu, alcaldías y sector TIC del Caribe colombiano.', l: '/extension', label: 'Amarillo desierto' },
    { c: '#cc5e50', t: 'Internacionalización', d: 'Movilidad entrante y saliente, cooperación académica y currículo internacionalizado.', l: '/internacionalizacion', label: 'Rosado flamingo' },
    { c: '#1a2744', t: 'Tablero de Convocatorias', d: 'Oportunidades abiertas de investigación, extensión, movilidad y estudiantes.', l: '/convocatorias', label: 'Azul marino' },
  ]
  return (
    <section className="section">
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Funciones misionales</div>
            <h2>Cuatro columnas que sostienen la carrera.</h2>
          </div>
        </div>
        <div className="grid-4">
          {items.map((it, i) => (
            <button key={i} onClick={() => nav(it.l)}
                    style={{ textAlign: 'left', padding: 28, border: 0, cursor: 'pointer', background: it.c, color: it.c === '#1a2744' ? '#fff' : 'var(--ug-negro)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: 18, minHeight: 280, position: 'relative', overflow: 'hidden', transition: 'transform .2s ease' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', opacity: .7 }}>0{i+1} · {it.label}</div>
              <h3 style={{ fontSize: 26, color: it.c === '#1a2744' ? '#fff' : 'var(--ug-negro)' }}>{it.t}</h3>
              <p style={{ fontSize: 14, opacity: .85, lineHeight: 1.5 }}>{it.d}</p>
              <div style={{ marginTop: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                Ver más <Icons.arrow />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function Convocatorias() {
  const nav = useNavigate()
  const { data } = useData()
  const convos = data.convocatorias.filter(c => c.s === 'Abierta').slice(0, 4)
  return (
    <section className="section" style={{ background: 'var(--paper-2)' }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Tablero de convocatorias</div>
            <h2>Oportunidades abiertas ahora.</h2>
          </div>
          <p className="desc">Movilidad, investigación, extensión y opciones para estudiantes.</p>
        </div>
        <div className="grid-2">
          {convos.map((c, i) => (
            <div key={i} className="card" style={{ background: 'var(--paper)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="chip">{c.cat}</span>
                <span className="chip" style={{ background: 'color-mix(in oklab, var(--ug-azul) 30%, transparent)', borderColor: 'transparent' }}>{c.s}</span>
              </div>
              <h3 style={{ fontSize: 22, marginTop: 4 }}>{c.t}</h3>
              <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>{c.desc}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 14, borderTop: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.1em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>Cierra {c.d}</div>
                <button className="btn ghost" style={{ padding: '6px 14px', fontSize: 13 }} onClick={() => nav('/convocatorias')}>Ver <Icons.arrow /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <div className="page-in">
      <Hero />
      <Ticker />
      <Features />
      <CNAPreview />
      <Missions />
      <Convocatorias />
    </div>
  )
}
