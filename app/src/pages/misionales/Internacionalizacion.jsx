import { Icons } from '../../components/Icons'
import { WayuuBackdrop } from '../../components/WayuuPatterns'

export default function Internacionalizacion() {
  const alianzas = [
    { pais: 'Colombia → España', u: 'Universidad Politécnica de Madrid', tipo: 'Movilidad + doble titulación', desde: '2021', color: 'var(--ug-azul)' },
    { pais: 'Colombia → México', u: 'UNAM – Facultad de Ingeniería', tipo: 'Pasantías de investigación', desde: '2022', color: 'var(--ug-amarillo)' },
    { pais: 'Colombia → Brasil', u: 'UNICAMP – Instituto de Computação', tipo: 'Intercambio estudiantil', desde: '2023', color: 'var(--ug-flamingo)' },
    { pais: 'Colombia → Chile', u: 'UTFSM – Departamento de Informática', tipo: 'Co-tutela doctoral', desde: '2022', color: 'var(--ug-marino)' },
    { pais: 'Colombia → EE.UU.', u: 'Florida International University', tipo: 'Investigación conjunta', desde: '2024', color: 'var(--ug-azul)' },
    { pais: 'Colombia → Alemania', u: 'DAAD – Red de Universidades', tipo: 'Becas y movilidad saliente', desde: '2021', color: 'var(--ug-amarillo)' },
  ]

  const convocatorias = [
    { prog: 'Beca DAAD EPOS', destino: 'Alemania', nivel: 'Maestría / Doctorado', cierre: 'Ago 2026', fondo: 'DAAD' },
    { prog: 'Pasantía UNAM – IngSis', destino: 'Ciudad de México', nivel: 'Pregrado 6°–9°', cierre: 'May 2026', fondo: 'ORI UniGuajira' },
    { prog: 'Intercambio UTFSM', destino: 'Valparaíso, Chile', nivel: 'Pregrado 5°–8°', cierre: 'Jun 2026', fondo: 'Mixto' },
    { prog: 'Summer Research FIU', destino: 'Miami, EE.UU.', nivel: 'Posgrado', cierre: 'Mar 2027', fondo: 'FIU – NSF' },
  ]

  const stats = [
    { v: '6', l: 'convenios internacionales' },
    { v: '23', l: 'movilidades 2024–2025' },
    { v: '5', l: 'países destino' },
    { v: '4', l: 'becas activas' },
  ]

  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: 'clamp(60px,8vw,110px)' }}>
        <div className="inner">
          <div className="eyebrow">Funciones misionales · Internacionalización</div>
          <h1 style={{ marginTop: 14, maxWidth: '22ch' }}>La ingeniería de La Guajira conectada con el mundo.</h1>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 32 }}>
            {stats.map((s, i) => (
              <div key={i} className="chip"><b style={{ marginRight: 6 }}>{s.v}</b>{s.l}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Alianzas universitarias</div>
              <h2>Seis universidades en cuatro continentes.</h2>
            </div>
          </div>
          <div className="grid-3">
            {alianzas.map((a, i) => (
              <div key={i} className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--paper-2)' }}>
                <div style={{ height: 90, background: a.color, padding: 20, color: 'var(--ug-negro)', display: 'flex', alignItems: 'end', position: 'relative', overflow: 'hidden' }}>
                  <WayuuBackdrop variant="a" />
                  <div style={{ position: 'relative', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase' }}>{a.pais}</div>
                </div>
                <div style={{ padding: 22 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, letterSpacing: '-0.01em', marginBottom: 10 }}>{a.u}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span className="chip" style={{ fontSize: 10 }}>{a.tipo}</span>
                    <span className="chip" style={{ fontSize: 10 }}>Desde {a.desde}</span>
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
              <div className="eyebrow">Convocatorias abiertas</div>
              <h2>Oportunidades para movilidad y becas.</h2>
            </div>
          </div>
          <div style={{ background: 'var(--paper)', borderRadius: 14, overflow: 'hidden' }}>
            {convocatorias.map((c, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', padding: '20px 28px', alignItems: 'center', borderTop: i > 0 ? '1px solid color-mix(in oklab, var(--ink) 7%, transparent)' : 'none', gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 16 }}>{c.prog}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{c.destino}</div>
                </div>
                <span className="chip" style={{ fontSize: 11 }}>{c.nivel}</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>Cierre: {c.cierre}</div>
                <span className="chip" style={{ fontSize: 11 }}>{c.fondo}</span>
                <button className="btn ghost" style={{ padding: '6px 14px', fontSize: 13 }}>Postular <Icons.arrow /></button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Oficina de relaciones internacionales</div>
              <h2>Contacto y asesoría de movilidad.</h2>
            </div>
          </div>
          <div className="grid-2" style={{ alignItems: 'start' }}>
            <div className="card" style={{ background: 'var(--ug-azul)', color: 'var(--ug-negro)', border: 'none' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, marginBottom: 20 }}>ORI – UniGuajira</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 15 }}>
                <div>✉ <a href="mailto:ori@uniguajira.edu.co" style={{ color: 'inherit' }}>ori@uniguajira.edu.co</a></div>
                <div>📞 +57 (5) 727 2626 ext. 209</div>
                <div>📍 Edificio administrativo, piso 2 · Riohacha</div>
                <div>🕑 Lun–Vie 8:00–12:00 / 14:00–17:00</div>
              </div>
            </div>
            <div className="card" style={{ background: 'var(--paper-2)' }}>
              <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 16 }}>Proceso de postulación</div>
              <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: 'var(--ink-2)' }}>
                <li>Consultar requisitos con la ORI antes de postular.</li>
                <li>Obtener carta de apoyo del director de programa.</li>
                <li>Traducir documentos académicos (si aplica).</li>
                <li>Entregar dossier completo a la ORI (física o digital).</li>
                <li>La ORI gestiona el convenio con la institución receptora.</li>
                <li>Matricular equivalencias al regresar.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
