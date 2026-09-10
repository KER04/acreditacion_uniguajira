import { useState } from 'react'
import { useData } from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'
import RowActions from '../RowActions'
import FileUpload from '../FileUpload'

const SEDES = [['ambas','Ambas sedes'],['riohacha','Riohacha'],['maicao','Maicao']]
const emptyD = { n: '', y: '', r: '', c: '', ciudad: '', q: '', color: 'var(--ug-azul)', foto_url: '', sede: 'ambas' }
const emptyO = { p: '', emp: '', loc: '', tipo: 'Tiempo completo', s: '', t: '', url: '', fecha: '' }

export default function TabEgresados() {
  const { data, addItem, removeItem, updateItem } = useData()
  const [tab, setTab] = useState('destacados')
  const [formD, setFormD] = useState(emptyD)
  const [formO, setFormO] = useState(emptyO)
  const [editingD, setEditingD] = useState(null)
  const [editingO, setEditingO] = useState(null)

  const saveD = e => {
    e.preventDefault()
    if (editingD !== null) { updateItem('destacados', editingD, { ...formD }); setEditingD(null) }
    else addItem('destacados', { ...formD })
    setFormD(emptyD)
  }
  const saveO = e => {
    e.preventDefault()
    const item = { ...formO, t: formO.t.split(',').map(x => x.trim()).filter(Boolean) }
    if (editingO !== null) { updateItem('ofertas', editingO, item); setEditingO(null) }
    else addItem('ofertas', { ...item })
    setFormO(emptyO)
  }

  const fd = (k, v) => setFormD(x => ({ ...x, [k]: v }))
  const fo = (k, v) => setFormO(x => ({ ...x, [k]: v }))

  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>Egresados</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[['destacados','Egresados destacados'],['bolsa','Bolsa de empleo']].map(([k,l]) => (
          <button key={k} className="chip" onClick={() => setTab(k)}
            style={{ cursor: 'pointer', background: tab===k ? 'var(--ink)' : undefined, color: tab===k ? 'var(--paper)' : undefined }}>{l}</button>
        ))}
      </div>

      {tab === 'destacados' && (
        <>
          <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 24 }} onSubmit={saveD}>
            <div style={{ fontWeight: 600, marginBottom: 16 }}>{editingD !== null ? 'Editar egresado' : 'Agregar egresado destacado'}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="field"><label>Nombre completo</label><input value={formD.n} onChange={e => fd('n', e.target.value)} required /></div>
              <div className="field"><label>Año de grado</label><input value={formD.y} onChange={e => fd('y', e.target.value)} placeholder="ej. 2019" /></div>
              <div className="field"><label>Título / Cargo</label><input value={formD.r} onChange={e => fd('r', e.target.value)} /></div>
              <div className="field"><label>Empresa</label><input value={formD.c} onChange={e => fd('c', e.target.value)} /></div>
              <div className="field"><label>Ciudad</label><input value={formD.ciudad} onChange={e => fd('ciudad', e.target.value)} /></div>
              <div className="field">
                <label>Sede</label>
                <select value={formD.sede} onChange={e => fd('sede', e.target.value)}>
                  {SEDES.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Color de tarjeta</label>
                <select value={formD.color} onChange={e => fd('color', e.target.value)}>
                  {[['var(--ug-azul)','Azul'],['var(--ug-amarillo)','Amarillo'],['var(--ug-flamingo)','Flamingo'],['var(--ug-marino)','Marino']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}><label>Cita / Testimonio</label><textarea rows="2" value={formD.q} onChange={e => fd('q', e.target.value)} /></div>
              <div style={{ gridColumn: '1 / -1' }}>
                <FileUpload
                  tipo="egresado-foto"
                  accept="image/*"
                  previewType="image"
                  label="Foto del egresado"
                  currentUrl={formD.foto_url}
                  onUploaded={url => fd('foto_url', url)}
                />
              </div>
              {formD.foto_url && (
                <div className="field" style={{ gridColumn: '1 / -1', margin: 0 }}>
                  <label>URL foto (editar manualmente si es necesario)</label>
                  <input value={formD.foto_url} onChange={e => fd('foto_url', e.target.value)} placeholder="https://..." />
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn accent" type="submit" style={{ padding: '8px 20px' }}>{editingD !== null ? 'Guardar' : 'Agregar'} <Icons.check /></button>
              {editingD !== null && <button type="button" className="btn ghost" style={{ padding: '8px 16px' }} onClick={() => { setFormD(emptyD); setEditingD(null) }}>Cancelar</button>}
            </div>
          </form>
          {(data.destacados ?? []).map(d => (
            <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '44px 1fr 80px 80px 140px auto', gap: 16, padding: '12px 0', borderBottom: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)', alignItems: 'center' }}>
              {d.foto_url
                ? <img src={d.foto_url} alt="" style={{ width: 36, height: 36, borderRadius: 999, objectFit: 'cover', flexShrink: 0 }} />
                : <div style={{ width: 36, height: 36, borderRadius: 999, background: d.color ?? 'var(--ug-azul)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--ug-negro)', flexShrink: 0 }}>
                    {d.n?.split(' ').map(w => w[0]).filter(c => /[A-ZÁÉÍÓÚ]/i.test(c)).slice(0,2).join('').toUpperCase()}
                  </div>
              }
              <div style={{ fontWeight: 500, fontSize: 14 }}>{d.n}</div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{d.y}</span>
              <span className="chip" style={{ fontSize: 10, background: 'color-mix(in oklab, var(--ug-marino) 15%, transparent)' }}>{d.sede ?? 'ambas'}</span>
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{d.c}</span>
              <RowActions onEdit={() => { setFormD({ n: d.n, y: d.y, r: d.r, c: d.c, ciudad: d.ciudad ?? '', q: d.q ?? '', color: d.color ?? 'var(--ug-azul)', foto_url: d.foto_url ?? '', sede: d.sede ?? 'ambas' }); setEditingD(d.id) }} onDelete={() => removeItem('destacados', d.id)} />
            </div>
          ))}
        </>
      )}

      {tab === 'bolsa' && (
        <>
          <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 24 }} onSubmit={saveO}>
            <div style={{ fontWeight: 600, marginBottom: 16 }}>{editingO !== null ? 'Editar oferta' : 'Nueva oferta laboral'}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="field" style={{ gridColumn: '1 / -1' }}><label>Posición / Cargo</label><input value={formO.p} onChange={e => fo('p', e.target.value)} required /></div>
              <div className="field"><label>Empresa</label><input value={formO.emp} onChange={e => fo('emp', e.target.value)} /></div>
              <div className="field"><label>Ciudad / Modalidad lugar</label><input value={formO.loc} onChange={e => fo('loc', e.target.value)} /></div>
              <div className="field">
                <label>Modalidad</label>
                <select value={formO.tipo} onChange={e => fo('tipo', e.target.value)}>
                  {['Tiempo completo','Medio tiempo','Remoto','Híbrido','Práctica','Contrato'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="field"><label>Salario</label><input value={formO.s} onChange={e => fo('s', e.target.value)} placeholder="ej. $2.5M – $3M" /></div>
              <div className="field"><label>Fecha de cierre</label><input value={formO.fecha} onChange={e => fo('fecha', e.target.value)} placeholder="ej. 30 may 2026" /></div>
              <div className="field"><label>Enlace de postulación</label><input value={formO.url} onChange={e => fo('url', e.target.value)} placeholder="https://..." /></div>
              <div className="field" style={{ gridColumn: '1 / -1' }}><label>Tags (separados por coma)</label><input value={formO.t} onChange={e => fo('t', e.target.value)} placeholder="React, Node.js, AWS" /></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn accent" type="submit" style={{ padding: '8px 20px' }}>{editingO !== null ? 'Guardar' : 'Publicar'} <Icons.check /></button>
              {editingO !== null && <button type="button" className="btn ghost" style={{ padding: '8px 16px' }} onClick={() => { setFormO(emptyO); setEditingO(null) }}>Cancelar</button>}
            </div>
          </form>
          {(data.ofertas ?? []).map(o => (
            <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 120px 120px auto', gap: 16, padding: '14px 0', borderBottom: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)', alignItems: 'center' }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{o.p}</div>
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{o.emp}</span>
              <span className="chip" style={{ fontSize: 10 }}>{o.tipo}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{o.fecha}</span>
              <RowActions onEdit={() => { setFormO({ p: o.p, emp: o.emp, loc: o.loc ?? '', tipo: o.tipo, s: o.s ?? '', t: (o.t ?? []).join(', '), url: o.url ?? '', fecha: o.fecha ?? '' }); setEditingO(o.id) }} onDelete={() => removeItem('ofertas', o.id)} />
            </div>
          ))}
        </>
      )}
    </div>
  )
}
