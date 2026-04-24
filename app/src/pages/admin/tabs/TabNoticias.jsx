import { useState } from 'react'
import { useData } from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'
import RowActions from '../RowActions'

const CATS = ['académico', 'investigación', 'extensión', 'institucional', 'Acreditación', 'Egresados', 'Docencia']
const SEDES = [['ambas', 'Ambas sedes'], ['riohacha', 'Riohacha'], ['maicao', 'Maicao']]

const empty = { titulo: '', resumen: '', cuerpo: '', cat: 'académico', fecha: '', sede: 'ambas' }

export default function TabNoticias() {
  const { data, addItem, removeItem, updateItem } = useData()
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)

  const save = e => {
    e.preventDefault()
    if (editing !== null) { updateItem('noticias', editing, { ...form }); setEditing(null) }
    else addItem('noticias', { ...form })
    setForm(empty)
  }
  const startEdit = n => { setForm({ titulo: n.titulo, resumen: n.resumen, cuerpo: n.cuerpo ?? '', cat: n.cat, fecha: n.fecha, sede: n.sede ?? 'ambas' }); setEditing(n.id) }
  const cancel = () => { setForm(empty); setEditing(null) }
  const f = (k, v) => setForm(x => ({ ...x, [k]: v }))

  return (
    <div>
      <h3 style={{ marginBottom: 20 }}>Noticias</h3>
      <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 24 }} onSubmit={save}>
        <div style={{ fontWeight: 600, marginBottom: 16 }}>{editing !== null ? 'Editar noticia' : 'Nueva noticia'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="field" style={{ gridColumn: '1 / -1' }}><label>Título</label><input value={form.titulo} onChange={e => f('titulo', e.target.value)} required /></div>
          <div className="field">
            <label>Categoría</label>
            <select value={form.cat} onChange={e => f('cat', e.target.value)}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Sede</label>
            <select value={form.sede} onChange={e => f('sede', e.target.value)}>
              {SEDES.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="field"><label>Fecha</label><input value={form.fecha} onChange={e => f('fecha', e.target.value)} placeholder="ej. 20 abr 2026" /></div>
          <div className="field" style={{ gridColumn: '1 / -1' }}><label>Resumen (tarjeta)</label><textarea rows="2" value={form.resumen} onChange={e => f('resumen', e.target.value)} /></div>
          <div className="field" style={{ gridColumn: '1 / -1' }}><label>Cuerpo completo (opcional)</label><textarea rows="5" value={form.cuerpo} onChange={e => f('cuerpo', e.target.value)} /></div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn accent" type="submit" style={{ padding: '8px 20px' }}>{editing !== null ? 'Guardar cambios' : 'Publicar'} <Icons.check /></button>
          {editing !== null && <button type="button" className="btn ghost" style={{ padding: '8px 16px' }} onClick={cancel}>Cancelar</button>}
        </div>
      </form>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {(data.noticias ?? []).map(n => (
          <div key={n.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px 120px auto', gap: 16, padding: '14px 0', borderBottom: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)', alignItems: 'center' }}>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{n.titulo}</div>
            <span className="chip" style={{ fontSize: 10 }}>{n.cat}</span>
            <span className="chip" style={{ fontSize: 10, background: 'color-mix(in oklab, var(--ug-marino) 15%, transparent)' }}>{n.sede ?? 'ambas'}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{n.fecha}</span>
            <RowActions onEdit={() => startEdit(n)} onDelete={() => removeItem('noticias', n.id)} />
          </div>
        ))}
      </div>
    </div>
  )
}
