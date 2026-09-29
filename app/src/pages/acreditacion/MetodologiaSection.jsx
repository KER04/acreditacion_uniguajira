export default function MetodologiaSection() {
  return (
    <section className="section section--papel">
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Metodología de autoevaluación</div>
            <h2>Cómo construimos este tablero.</h2>
          </div>
          <p className="desc">Proceso participativo basado en el Acuerdo 02 de 2020 (CESU) y en los lineamientos del CNA, con instrumentos cuantitativos y cualitativos aplicados a toda la comunidad académica.</p>
        </div>
        <div className="grid-2">
          <div className="card" style={{ background: 'var(--paper)' }}>
            <div className="eyebrow" style={{ color: 'var(--ug-azul-deep)' }}>● Instrumentos utilizados</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '18px 0 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['Encuestas estructuradas', 'Aplicadas a estudiantes, docentes, egresados, empleadores y directivos.'],
                ['Entrevistas semi-estructuradas', 'A directivos académicos, líderes de grupos y coordinadores.'],
                ['Grupos focales', 'Por estamento y por cohorte (primíparos, intermedios, próximos a graduar).'],
                ['Análisis documental', 'Revisión sistemática de normativa, actas, informes y evidencias.'],
                ['Análisis estadístico', 'Indicadores SPADIES, SACES, OLE y sistemas institucionales.'],
              ].map(([k, v], i) => (
                <li key={i} style={{ paddingBottom: 12, borderBottom: '1px solid color-mix(in oklab, var(--ink) 7%, transparent)' }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{k}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>{v}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="card" style={{ background: 'var(--paper)' }}>
            <div className="eyebrow" style={{ color: 'var(--ug-flamingo-deep)' }}>● Fuentes consultadas</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 18 }}>
              {[
                { n: '412', l: 'estudiantes encuestados' },
                { n: '48', l: 'docentes consultados' },
                { n: '186', l: 'egresados contactados' },
                { n: '32', l: 'empleadores entrevistados' },
                { n: '14', l: 'directivos participantes' },
                { n: '9', l: 'grupos focales' },
              ].map((s, i) => (
                <div key={i} style={{ padding: 14, background: 'var(--paper-2)', borderRadius: 10 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, letterSpacing: '-0.02em', color: 'var(--accent-deep)' }}>{s.n}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 32 }}>
          <div className="card" style={{ background: 'var(--paper)' }}>
            <div className="eyebrow" style={{ color: 'var(--ug-amarillo-deep)' }}>● Escala de valoración y ponderación</div>
            <p style={{ fontSize: 15, color: 'var(--ink-2)', marginTop: 14, marginBottom: 20 }}>
              Cada característica se evalúa en escala de <b>1.0 a 5.0</b>. El puntaje global del factor es el promedio ponderado de sus características.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
              {[
                { r: '4.5 – 5.0', j: 'Cumple Plenamente', c: 'var(--ug-azul)' },
                { r: '4.0 – 4.49', j: 'Cumple en Alto Grado', c: 'var(--ug-amarillo)' },
                { r: '3.0 – 3.99', j: 'Cumple Aceptablemente', c: 'var(--ug-amarillo-soft)' },
                { r: '2.0 – 2.99', j: 'Cumple Insatisfactoriamente', c: 'var(--ug-flamingo-soft)' },
                { r: '1.0 – 1.99', j: 'No Cumple', c: 'var(--ug-flamingo)' },
              ].map((x, i) => (
                <div key={i} style={{ padding: 14, borderRadius: 10, background: x.c, color: 'var(--ug-negro)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.1em' }}>{x.r}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6 }}>{x.j}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
