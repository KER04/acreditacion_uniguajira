import { useState } from 'react'
import { useData } from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'
import RowActions from '../RowActions'

const CATS = ['Investigación', 'Internacionalización', 'Extensión', 'Prácticas', 'Estímulos', 'Becas', 'Eventos']
const ESTADOS = ['Abierta', 'Próxima', 'Cerrada']
const SEDES = [['ambas', 'Ambas sedes'], ['riohacha', 'Riohacha'], ['maicao', 'Maicao']]

const empty = { titulo: '', desc: '', cat: 'Investigación', cierre: '', estado: 'Abierta', sede: 'ambas', requisitos: '' }

export default function TabConvocatorias() {
  const { data, addItem, removeItem, updateItem } = useData()
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)

  const save = e => {
    e.preventDefault()
    const item = { ...form, requisitos: form.requisitos.split('\n').filter(Boolean) }
    if (editing !== null) { updateItem('convocatorias', editing, item); setEditing(null) }
    else addItem('convocatorias', { ...item })
    setForm(empty)
  }
  const startEdit = c => { setForm({ titulo: c.titulo, desc: c.desc ?? '', cat: c.cat, cierre: c.cierre, estado: c.estado ?? 'Abierta', sede: c.sede ?? 'ambas', requisitos: (c.requisitos ?? []).join('\n') }); setEditing(c.id) }
  const cancel = () => { setForm(empty); setEditing(null) }
  const f = (k, v) => setForm(x => ({ ...x, [k]: v }))

  return (
    <div>
      <h3 style={{ marginBottom: 20 }}>Convocatorias y Eventos</h3>
      <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 24 }} onSubmit={save}>
        <div style={{ fontWeight: 600, marginBottom: 16 }}>{editing !== null ? 'Editar' : 'Nueva convocatoria'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="field" style={{ gridColumn: '1 / -1' }}><label>Título</label><input value={form.titulo} onChange={e => f('titulo', e.target.value)} required /></div>
          <div className="field">
            <label>Categoría</label>
            <select value={form.cat} onChange={e => f('cat', e.target.value)}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Estado</label>
            <select value={form.estado} onChange={e => f('estado', e.target.value)}>
              {ESTADOS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="field"><label>Fecha de cierre</label><input value={form.cierre} onChange={e => f('cierre', e.target.value)} placeholder="ej. May 2026" /></div>
          <div className="field">
            <label>Sede destinataria</label>
            <select value={form.sede} onChange={e => f('sede', e.target.value)}>
              {SEDES.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}><label>Descripción</label><textarea rows="2" value={form.desc} onChange={e => f('desc', e.target.value)} /></div>
          <div className="field" style={{ gridColumn: '1 / -1' }}><label>Requisitos (uno por línea)</label><textarea rows="3" value={form.requisitos} onChange={e => f('requisitos', e.target.value)} /></div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn accent" type="submit" style={{ padding: '8px 20px' }}>{editing !== null ? 'Guardar' : 'Publicar'} <Icons.check /></button>
          {editing !== null && <button type="button" className="btn ghost" style={{ padding: '8px 16px' }} onClick={cancel}>Cancelar</button>}
        </div>
      </form>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {(data.convocatorias ?? []).map(c => (
          <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 80px 80px 120px auto', gap: 16, padding: '14px 0', borderBottom: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)', alignItems: 'center' }}>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{c.titulo}</div>
            <span className="chip" style={{ fontSize: 10 }}>{c.cat}</span>
            <span className="chip" style={{ fontSize: 10, background: 'color-mix(in oklab, var(--ug-marino) 15%, transparent)' }}>{c.sede ?? 'ambas'}</span>
            <span className="chip" style={{ fontSize: 10 }}>{c.estado ?? 'Abierta'}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{c.cierre}</span>
            <RowActions onEdit={() => startEdit(c)} onDelete={() => removeItem('convocatorias', c.id)} />
          </div>
        ))}
      </div>
    </div>
  )
}
