import { useState } from 'react'
import { Icons } from '../../components/Icons'
import { WayuuBackdrop } from '../../components/WayuuPatterns'
import { useData } from '../../context/DataContext'

function Destacados() {
  const { data } = useData()
  return (
    <section className="section" style={{ paddingTop: 40 }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Egresados destacados</div>
            <h2 style={{ marginTop: 10 }}>Historias entre cientos.</h2>
          </div>
        </div>
        <div className="grid-3">
          {data.destacados.map((e,i) => (
            <div key={e.id} className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--paper-2)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ aspectRatio: '4/3', background: e.color, position: 'relative', overflow: 'hidden' }}>
                <WayuuBackdrop variant="b" />
                <div style={{ position: 'absolute', inset: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ background: 'var(--ug-negro)', color: 'var(--paper)', padding: '4px 10px', borderRadius: 999, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '.12em', textTransform: 'uppercase', alignSelf: 'start' }}>
                    Promoción {e.y}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--ug-negro)', lineHeight: 1.1 }}>{e.n}</div>
                </div>
              </div>
              <div style={{ padding: 22, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{e.r}</div>
                <div style={{ fontWeight: 500, marginTop: 4 }}>{e.c} · {e.ciudad}</div>
                <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 14, flex: 1, fontStyle: 'italic', borderLeft: `2px solid ${e.color}`, paddingLeft: 12 }}>"{e.q}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Bolsa() {
  const { data } = useData()
  return (
    <section className="section" style={{ background: 'var(--paper-2)' }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Bolsa de empleo</div>
            <h2 style={{ marginTop: 10 }}>Ofertas exclusivas para la red.</h2>
          </div>
          <p className="desc">Empresas aliadas que priorizan a egresados del programa. Actualizada semanalmente.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {data.ofertas.map((o,i) => (
            <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr auto', gap: 24, padding: '24px 0', borderBottom: '1px solid color-mix(in oklab, var(--ink) 10%, transparent)', borderTop: i===0 ? '1px solid color-mix(in oklab, var(--ink) 10%, transparent)' : 'none', alignItems: 'center' }} className="job-row">
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>{o.emp}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>{o.loc}</div>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>{o.p}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  {o.t.map((tg,j) => <span key={j} className="chip" style={{ fontSize: 10, padding: '3px 8px' }}>{tg}</span>)}
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{o.tipo}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>{o.s}</div>
              <button className="btn ghost" style={{ padding: '8px 16px', fontSize: 13 }}>Aplicar <Icons.arrow /></button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Actualizar() {
  const [sent, setSent] = useState(false)
  return (
    <section className="section">
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Actualiza tus datos</div>
            <h2 style={{ marginTop: 10 }}>Cuéntanos dónde estás hoy.</h2>
          </div>
          <p className="desc">Actualizar tus datos nos permite mejorar la pertinencia del programa, certificar tu experiencia, y conectarte con ofertas relevantes para tu perfil actual.</p>
        </div>

        {sent ? (
          <div className="card" style={{ background: 'var(--ug-azul)', color: 'var(--ug-negro)', textAlign: 'center', padding: '60px 20px', border: 'none' }}>
            <div style={{ width: 72, height: 72, borderRadius: 999, background: 'var(--ug-negro)', color: 'var(--paper)', margin: '0 auto 24px', display: 'grid', placeItems: 'center' }}><Icons.check /></div>
            <h3 style={{ fontSize: 28, color: 'var(--ug-negro)' }}>¡Gracias por actualizarte!</h3>
            <p style={{ marginTop: 14, fontSize: 16, maxWidth: '42ch', margin: '14px auto 0' }}>
              Recibirás una confirmación por correo y entrarás en la lista del boletín bimestral de egresados.
            </p>
          </div>
        ) : (
          <form className="card" style={{ background: 'var(--paper-2)', padding: 32 }} onSubmit={e => { e.preventDefault(); setSent(true) }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="eg-form">
              <div className="field"><label>Nombres y apellidos</label><input required /></div>
              <div className="field"><label>Documento de identidad</label><input required /></div>
              <div className="field"><label>Año de grado</label><input placeholder="AAAA" required /></div>
              <div className="field"><label>Correo personal</label><input type="email" required /></div>
              <div className="field"><label>Celular / WhatsApp</label><input /></div>
              <div className="field"><label>Ciudad actual</label><input /></div>
              <div className="field"><label>Empresa u organización</label><input /></div>
              <div className="field"><label>Cargo actual</label><input /></div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label>Formación posterior</label>
                <select>
                  <option>Ninguna</option><option>Especialización</option><option>Maestría en curso</option><option>Maestría terminada</option><option>Doctorado en curso</option><option>Doctorado terminado</option>
                </select>
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label>Cuéntanos en una línea qué estás haciendo hoy</label>
                <textarea rows="3" placeholder="Opcional — puede ser destacado en la web"></textarea>
              </div>
            </div>
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <label style={{ display: 'flex', gap: 10, alignItems: 'start', fontSize: 13, color: 'var(--ink-2)', maxWidth: '55ch' }}>
                <input type="checkbox" style={{ marginTop: 4 }} defaultChecked />
                Autorizo el tratamiento de mis datos conforme a la política de la Universidad de La Guajira.
              </label>
              <button className="btn accent" type="submit">Enviar actualización <Icons.arrow /></button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

export default function Egresados() {
  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: 'clamp(60px,8vw,110px)' }}>
        <div className="inner">
          <div className="eyebrow">Comunidad · Egresados</div>
          <h1 style={{ marginTop: 14, maxWidth: '22ch' }}>Lo que construyen nuestros egresados nos representa.</h1>
          <p style={{ fontSize: 18, color: 'var(--ink-2)', marginTop: 24, maxWidth: '58ch' }}>
            Más de 860 egresados forman una red activa que hoy lidera equipos, funda empresas y continúa estudiando — dentro y fuera del Caribe.
          </p>
        </div>
      </section>
      <Destacados />
      <Bolsa />
      <Actualizar />
    </div>
  )
}
