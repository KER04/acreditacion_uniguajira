import { useState } from 'react'
import { useData } from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'
import RowActions from '../RowActions'
import FileUpload from '../FileUpload'

const SEDES = [['riohacha', 'Riohacha'], ['maicao', 'Maicao']]
const CATS = ['Titular', 'Asociado', 'Asistente', 'Cátedra']

const empty = { n: '', r: '', a: '', e: '', h: '', cat: 'Asistente', sede: 'riohacha', foto_url: '', telefono: '', hoja_vida_url: '', activo: true }

export default function TabDocentes() {
  const { data, addItem, removeItem, updateItem } = useData()
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [filterSede, setFilterSede] = useState('all')

  const save = ev => {
    ev.preventDefault()
    if (editing !== null) { updateItem('docentes', editing, { ...form }); setEditing(null) }
    else addItem('docentes', { ...form })
    setForm(empty)
  }
  const startEdit = d => {
    setForm({ n: d.n, r: d.r ?? '', a: d.a ?? '', e: d.e ?? '', h: d.h ?? '', cat: d.cat, sede: d.sede ?? 'riohacha', foto_url: d.foto_url ?? '', telefono: d.telefono ?? '', hoja_vida_url: d.hoja_vida_url ?? '', activo: d.activo ?? true })
    setEditing(d.id)
  }
  const cancel = () => { setForm(empty); setEditing(null) }
  const f = (k, v) => setForm(x => ({ ...x, [k]: v }))

  const list = (data.docentes ?? []).filter(d => filterSede === 'all' || d.sede === filterSede)

  return (
    <div>
      <h3 style={{ marginBottom: 20 }}>Docentes</h3>
      <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 24 }} onSubmit={save}>
        <div style={{ fontWeight: 600, marginBottom: 16 }}>{editing !== null ? 'Editar docente' : 'Agregar docente'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="field"><label>Nombre completo</label><input value={form.n} onChange={e => f('n', e.target.value)} required /></div>
          <div className="field"><label>Título (Dr., Mg., etc.)</label><input value={form.r} onChange={e => f('r', e.target.value)} /></div>
          <div className="field" style={{ gridColumn: '1 / -1' }}><label>Área o línea de trabajo</label><input value={form.a} onChange={e => f('a', e.target.value)} /></div>
          <div className="field"><label>Correo institucional</label><input type="email" value={form.e} onChange={e => f('e', e.target.value)} /></div>
          <div className="field"><label>Teléfono / Extensión</label><input value={form.telefono} onChange={e => f('telefono', e.target.value)} placeholder="Ext. 240" /></div>
          <div className="field"><label>Horario de atención</label><input value={form.h} onChange={e => f('h', e.target.value)} placeholder="Lun 10–12, Mié 14–16" /></div>
          <div className="field"><label>Enlace hoja de vida (URL)</label><input value={form.hoja_vida_url} onChange={e => f('hoja_vida_url', e.target.value)} placeholder="https://..." /></div>
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
          <div className="field">
            <label>Estado</label>
            <select value={String(form.activo)} onChange={e => f('activo', e.target.value === 'true')}>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <FileUpload
              tipo="docente-foto"
              accept="image/*"
              previewType="image"
              label="Foto del docente"
              currentUrl={form.foto_url}
              onUploaded={url => f('foto_url', url)}
            />
          </div>
          {form.foto_url && (
            <div className="field" style={{ gridColumn: '1 / -1', margin: 0 }}>
              <label>URL foto (editar manualmente si es necesario)</label>
              <input value={form.foto_url} onChange={e => f('foto_url', e.target.value)} placeholder="https://..." />
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn accent" type="submit" style={{ padding: '8px 20px' }}>{editing !== null ? 'Guardar cambios' : 'Agregar'} <Icons.check /></button>
          {editing !== null && <button type="button" className="btn ghost" style={{ padding: '8px 16px' }} onClick={cancel}>Cancelar</button>}
        </div>
      </form>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[['all','Todos'],['riohacha','Riohacha'],['maicao','Maicao']].map(([k,l]) => (
          <button key={k} className="chip" onClick={() => setFilterSede(k)}
            style={{ cursor: 'pointer', background: filterSede===k ? 'var(--ug-marino)' : undefined, color: filterSede===k ? 'var(--paper)' : undefined, borderColor: filterSede===k ? 'transparent' : undefined }}>{l}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {list.map(d => (
          <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '44px 1fr 100px 80px 160px auto', gap: 16, padding: '12px 0', borderBottom: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)', alignItems: 'center' }}>
            {d.foto_url
              ? <img src={d.foto_url} alt="" style={{ width: 36, height: 36, borderRadius: 999, objectFit: 'cover', flexShrink: 0 }} />
              : <div style={{ width: 36, height: 36, borderRadius: 999, background: 'color-mix(in oklab, var(--ug-azul) 20%, var(--paper-2))', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--ug-negro)', flexShrink: 0 }}>
                  {d.n?.split(' ').map(w => w[0]).filter(c => /[A-ZÁÉÍÓÚ]/i.test(c)).slice(0,2).join('').toUpperCase()}
                </div>
            }
            <div style={{ fontWeight: 500, fontSize: 14 }}>{d.n}</div>
            <span className="chip" style={{ fontSize: 10 }}>{d.cat}</span>
            <span className="chip" style={{ fontSize: 10, background: 'color-mix(in oklab, var(--ug-marino) 15%, transparent)' }}>{d.sede ?? 'riohacha'}</span>
            <span style={{ fontSize: 12, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.e}</span>
            <RowActions onEdit={() => startEdit(d)} onDelete={() => removeItem('docentes', d.id)} />
          </div>
        ))}
      </div>
    </div>
  )
}
