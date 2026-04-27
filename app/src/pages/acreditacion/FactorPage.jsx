import { Icons } from '../../components/Icons'
import { WayuuBackdrop } from '../../components/WayuuPatterns'
import { STATUS_LABELS, STATUS_COLOR, statusFromScore, judgmentFromScore } from '../../data/acreditacion'
import CircularProgress from './CircularProgress'

const CAT_COLOR = {
  Evidencia: 'var(--ug-azul)', Anexo: 'var(--ug-marino)', Normativa: 'var(--ug-amarillo)',
  Informe: 'var(--ug-flamingo)', Otro: 'var(--ink-3)',
}

function DocRow({ doc }) {
  const ext = doc.url ? doc.url.split('.').pop().toUpperCase().slice(0, 4) : 'DOC'
  const catColor = CAT_COLOR[doc.cat] ?? 'var(--ug-azul)'
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', padding: '16px 24px', alignItems: 'center', borderTop: '1px solid color-mix(in oklab, var(--ink) 7%, transparent)', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 30, height: 30, borderRadius: 6, background: `color-mix(in oklab, ${catColor} 18%, var(--paper))`, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'var(--ink-3)' }}>{ext}</div>
        <div>
          <div style={{ fontWeight: 500, fontSize: 14 }}>{doc.nombre}</div>
          {doc.cat && <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', letterSpacing: '.1em', textTransform: 'uppercase' }}>{doc.cat}</span>}
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{doc.desc}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>{doc.fecha}</div>
      {doc.url ? (
        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="icon-btn" style={{ width: 32, height: 32 }}><Icons.download /></a>
      ) : (
        <button className="icon-btn" style={{ width: 32, height: 32, opacity: 0.35, cursor: 'default' }}><Icons.download /></button>
      )}
    </div>
  )
}

export default function FactorPage({ factor, allFactores, onBack, onNavigate }) {
  const prev = allFactores.find(x => x.n === factor.n - 1)
  const next = allFactores.find(x => x.n === factor.n + 1)
  const status = statusFromScore(factor.score)
  const color = STATUS_COLOR[status]

  // Unified documents: prefer factor.documentos[], fall back to legacy evidencias/anexos
  const hasDocs = factor.documentos && factor.documentos.length > 0
  const legacyEvidencias = factor.evidencias ?? []
  const legacyAnexos = factor.anexos ?? []

  // Group new documentos by category for the annexes view
  const cats = hasDocs
    ? [...new Set(factor.documentos.map(d => d.cat ?? 'Otro'))]
    : []

  return (
    <div className="page-in">
      {/* Hero */}
      <section className="cna-hero" style={{ paddingBottom: 40 }}>
        <WayuuBackdrop variant="a" />
        <div className="cna-hero-inner" style={{ position: 'relative', zIndex: 2 }}>
          <div>
            <button onClick={onBack}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', border: '1px solid color-mix(in oklab, var(--ink) 18%, transparent)', padding: '8px 16px', borderRadius: 999, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-mono)', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>
              ← Volver al tablero
            </button>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 28 }}>
              <span className="chip" style={{ background: color, color: 'var(--ug-negro)', borderColor: 'transparent', fontWeight: 600 }}>
                Factor {String(factor.n).padStart(2,'0')} · {STATUS_LABELS[status]}
              </span>
              <span className="chip">{factor.caracteristicas.length} características</span>
              <span className="chip">Acuerdo 02 / 2020</span>
            </div>
            <h1 style={{ marginTop: 20, fontSize: 'clamp(36px,5vw,64px)' }}>{factor.t}</h1>
            <p className="lede" style={{ marginTop: 20 }}>{factor.summary}</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
              <button className="btn"><Icons.download /> Ficha del factor</button>
              {factor.presentacionUrl ? (
                <a href={factor.presentacionUrl} target="_blank" rel="noopener noreferrer" className="btn ghost">Presentación PowerPoint</a>
              ) : (
                <button className="btn ghost" style={{ opacity: 0.5, cursor: 'default' }}>Presentación PowerPoint</button>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <CircularProgress value={factor.score} size={240} label={`FACTOR ${String(factor.n).padStart(2,'0')} · ESCALA 0–100`} />
            <div style={{ padding: '12px 20px', background: color, color: 'var(--ug-negro)', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, textAlign: 'center' }}>
              {judgmentFromScore(factor.score)}
            </div>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="section">
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Características evaluadas</div>
              <h2>{factor.caracteristicas.length} características según el Acuerdo 02.</h2>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px,1fr))', gap: 16 }}>
            {factor.caracteristicas.map(c => {
              const st = c.status || statusFromScore(c.score)
              const juicio = c.juicio || judgmentFromScore(c.score)
              return (
                <div key={c.n} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14, background: 'var(--paper)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 14 }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.2em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>Característica {c.n}</div>
                      <h3 style={{ fontSize: 18, marginTop: 8, letterSpacing: '-0.01em' }}>{c.name}</h3>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }}>{c.score.toFixed(1)}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '.1em', marginTop: 4 }}>/ 100</div>
                    </div>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: 'color-mix(in oklab, var(--ink) 8%, transparent)', overflow: 'hidden' }}>
                    <div style={{ width: `${c.score}%`, height: '100%', background: STATUS_COLOR[st], borderRadius: 4 }} />
                  </div>
                  <div style={{ display: 'inline-flex', alignSelf: 'start', padding: '4px 10px', borderRadius: 999, background: `color-mix(in oklab, ${STATUS_COLOR[st]} 25%, transparent)`, fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>
                    {juicio}
                  </div>
                  {c.desc && <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5 }}>{c.desc}</p>}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Fortalezas / Oportunidades */}
      {(factor.fortalezas?.length > 0 || factor.oportunidades?.length > 0) && (
        <section className="section" style={{ background: 'var(--paper-2)' }}>
          <div className="inner">
            <div className="section-head">
              <div className="title">
                <div className="eyebrow">Hallazgos del factor</div>
                <h2>Fortalezas y oportunidades de mejora.</h2>
              </div>
            </div>
            <div className="grid-2">
              {factor.fortalezas?.length > 0 && (
                <div className="card" style={{ background: 'var(--paper)', borderLeft: '5px solid var(--ug-azul)' }}>
                  <div className="eyebrow" style={{ color: 'var(--ug-azul-deep)' }}>✓ Fortalezas identificadas</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '18px 0 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {factor.fortalezas.map((f, i) => (
                      <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'start', fontSize: 15, lineHeight: 1.5 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 999, background: 'var(--ug-azul)', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 2, color: 'var(--ug-negro)' }}>
                          <Icons.check />
                        </div>
                        <span style={{ color: 'var(--ink-2)' }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {factor.oportunidades?.length > 0 && (
                <div className="card" style={{ background: 'var(--paper)', borderLeft: '5px solid var(--ug-flamingo)' }}>
                  <div className="eyebrow" style={{ color: 'var(--ug-flamingo-deep)' }}>↗ Oportunidades de mejora</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '18px 0 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {factor.oportunidades.map((o, i) => (
                      <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'start', fontSize: 15, lineHeight: 1.5 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 999, background: 'var(--ug-flamingo)', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 2, color: 'var(--ug-negro)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>↗</div>
                        <span style={{ color: 'var(--ink-2)' }}>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Metodología del factor */}
      {factor.metodologiaFactor && (
        <section className="section">
          <div className="inner">
            <div className="section-head">
              <div className="title">
                <div className="eyebrow">Metodología del factor</div>
                <h2>Enfoque de evaluación aplicado.</h2>
              </div>
            </div>
            <div className="card" style={{ background: 'var(--paper-2)', padding: 32 }}>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--ink-2)', whiteSpace: 'pre-line', margin: 0 }}>{factor.metodologiaFactor}</p>
            </div>
          </div>
        </section>
      )}

      {/* Evidencias documentales — nuevo formato unificado */}
      {hasDocs && (
        <section className="section" style={{ background: 'var(--paper-2)' }}>
          <div className="inner">
            <div className="section-head">
              <div className="title">
                <div className="eyebrow">Evidencias y anexos</div>
                <h2>Documentación de soporte del factor {String(factor.n).padStart(2,'0')}.</h2>
              </div>
            </div>
            {cats.map(cat => {
              const docs = factor.documentos.filter(d => (d.cat ?? 'Otro') === cat)
              const catColor = CAT_COLOR[cat] ?? 'var(--ug-azul)'
              return (
                <div key={cat} style={{ marginBottom: 24 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: catColor, display: 'inline-block' }} />
                    {cat} ({docs.length})
                  </div>
                  <div style={{ background: 'var(--paper)', borderRadius: 14, overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', padding: '14px 24px', background: 'var(--paper-3)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
                      <div>Documento</div><div>Descripción</div><div>Fecha</div><div></div>
                    </div>
                    {docs.map(doc => <DocRow key={doc.id ?? doc.nombre} doc={doc} />)}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Evidencias legacy — solo si no hay formato nuevo */}
      {!hasDocs && legacyEvidencias.length > 0 && (
        <section className="section">
          <div className="inner">
            <div className="section-head">
              <div className="title">
                <div className="eyebrow">Evidencias documentales</div>
                <h2>Soporte del factor {String(factor.n).padStart(2,'0')}.</h2>
              </div>
            </div>
            <div style={{ background: 'var(--paper-2)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', padding: '14px 24px', background: 'var(--paper-3)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
                <div>Documento</div><div>Descripción</div><div>Fecha</div><div></div>
              </div>
              {legacyEvidencias.map((e, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', padding: '16px 24px', alignItems: 'center', borderTop: '1px solid color-mix(in oklab, var(--ink) 7%, transparent)', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 6, background: 'var(--paper)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'var(--ink-3)' }}>PDF</div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{e.t}</div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{e.d}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>{e.f}</div>
                  <button className="icon-btn" style={{ width: 32, height: 32 }}><Icons.download /></button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Anexos legacy */}
      {!hasDocs && legacyAnexos.length > 0 && (
        <section className="section" style={{ background: 'var(--paper-2)' }}>
          <div className="inner">
            <div className="section-head">
              <div className="title">
                <div className="eyebrow">Anexos del factor</div>
                <h2>Archivos organizados por categoría.</h2>
              </div>
            </div>
            <div className="grid-2">
              {legacyAnexos.map((g, i) => (
                <div key={i} className="card" style={{ background: 'var(--paper)' }}>
                  <div className="eyebrow" style={{ color: 'var(--accent-deep)' }}>● {g.cat}</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '18px 0 0', display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {g.items.map((it, j) => (
                      <li key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid color-mix(in oklab, var(--ink) 7%, transparent)', fontSize: 14 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--paper-2)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'var(--ink-3)' }}>PDF</div>
                          {it}
                        </span>
                        <button className="icon-btn" style={{ width: 30, height: 30 }}><Icons.download /></button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA presentación */}
      <section className="section">
        <div className="inner">
          <div className="card" style={{ background: 'var(--ug-negro)', color: 'var(--paper)', padding: 40, display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'center' }}>
            <div>
              <div className="eyebrow" style={{ color: 'var(--ug-amarillo)' }}>● Presentación del factor</div>
              <h2 style={{ color: 'var(--paper)', marginTop: 12, fontSize: 32 }}>Descarga la presentación en PowerPoint.</h2>
              <p style={{ fontSize: 16, color: 'rgba(246,239,227,0.7)', marginTop: 14, maxWidth: '56ch' }}>
                Síntesis ejecutiva del Factor {String(factor.n).padStart(2,'0')} preparada para el comité de pares.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {factor.presentacionUrl ? (
                <>
                  <a href={factor.presentacionUrl} target="_blank" rel="noopener noreferrer" className="btn accent">Ver presentación</a>
                  <a href={factor.presentacionUrl} download className="btn" style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.2)', color: 'var(--paper)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Icons.download /> Descargar .pptx</a>
                </>
              ) : (
                <>
                  <button className="btn accent" style={{ opacity: 0.45, cursor: 'default' }}>Ver presentación</button>
                  <button className="btn" style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.2)', color: 'var(--paper)', opacity: 0.45, cursor: 'default' }}><Icons.download /> Descargar .pptx</button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Equipo responsable */}
      {factor.equipo?.length > 0 && (
        <section className="section" style={{ background: 'var(--paper-2)' }}>
          <div className="inner">
            <div className="section-head">
              <div className="title">
                <div className="eyebrow">Equipo responsable</div>
                <h2>Quienes lideran este factor.</h2>
              </div>
            </div>
            <div className="grid-3">
              {factor.equipo.map((p, i) => {
                const initials = p.n.split(' ').map(w => w[0]).filter(c => /[A-ZÁÉÍÓÚ]/i.test(c)).slice(0,2).join('')
                return (
                  <div key={i} className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--paper)' }}>
                    <div style={{ aspectRatio: '16/10', background: color, position: 'relative', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                      {p.foto ? (
                        <img src={p.foto} alt={p.n} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                      ) : (
                        <>
                          <WayuuBackdrop variant="a" />
                          <div style={{ position: 'relative', fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 600, color: 'var(--ug-negro)' }}>{initials}</div>
                        </>
                      )}
                    </div>
                    <div style={{ padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{p.cargo}</div>
                        {p.sede && p.sede !== 'ambas' && (
                          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 999, background: p.sede === 'riohacha' ? 'color-mix(in oklab, var(--ug-azul) 18%, transparent)' : 'color-mix(in oklab, var(--ug-marino) 18%, transparent)', color: 'var(--ink-2)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                            {p.sede === 'riohacha' ? 'Riohacha' : 'Maicao'}
                          </span>
                        )}
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, letterSpacing: '-0.01em' }}>{p.n}</div>
                      <hr className="rule" style={{ margin: '12px 0 10px' }} />
                      <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5 }}><b>Rol:</b> {p.rol}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Navegación prev/next */}
      <section className="section" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div className="inner">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {prev ? (
              <button onClick={() => onNavigate(prev.n)}
                style={{ textAlign: 'left', padding: 28, border: '1px solid color-mix(in oklab, var(--ink) 10%, transparent)', background: 'var(--paper-2)', borderRadius: 14, cursor: 'pointer', transition: 'border-color .18s ease' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'color-mix(in oklab, var(--accent) 70%, transparent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'color-mix(in oklab, var(--ink) 10%, transparent)'}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.2em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>← Factor anterior</div>
                <div style={{ marginTop: 12, fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, letterSpacing: '-0.01em' }}>F{String(prev.n).padStart(2,'0')} · {prev.t}</div>
                <div style={{ marginTop: 6, fontSize: 13, color: 'var(--ink-3)' }}>{STATUS_LABELS[statusFromScore(prev.score)]} · {prev.score.toFixed(1)}</div>
              </button>
            ) : (
              <div style={{ padding: 28, background: 'var(--paper-2)', borderRadius: 14, opacity: 0.4 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase' }}>Primer factor</div>
              </div>
            )}
            {next ? (
              <button onClick={() => onNavigate(next.n)}
                style={{ textAlign: 'right', padding: 28, border: '1px solid color-mix(in oklab, var(--ink) 10%, transparent)', background: 'var(--paper-2)', borderRadius: 14, cursor: 'pointer', transition: 'border-color .18s ease' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'color-mix(in oklab, var(--accent) 70%, transparent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'color-mix(in oklab, var(--ink) 10%, transparent)'}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.2em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>Factor siguiente →</div>
                <div style={{ marginTop: 12, fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, letterSpacing: '-0.01em' }}>F{String(next.n).padStart(2,'0')} · {next.t}</div>
                <div style={{ marginTop: 6, fontSize: 13, color: 'var(--ink-3)' }}>{STATUS_LABELS[statusFromScore(next.score)]} · {next.score.toFixed(1)}</div>
              </button>
            ) : (
              <div style={{ padding: 28, background: 'var(--paper-2)', borderRadius: 14, opacity: 0.4, textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase' }}>Último factor</div>
              </div>
            )}
          </div>
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <button className="btn ghost" onClick={onBack}>← Volver al tablero de factores</button>
          </div>
        </div>
      </section>
    </div>
  )
}
