import { useState } from 'react'
import { useData } from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'
import RowActions from '../RowActions'
import FileUpload from '../FileUpload'

const CATS = ['académico', 'cultural', 'investigación', 'extensión', 'institucional', 'deportivo']
const SEDES = [['ambas','Ambas sedes'],['riohacha','Riohacha'],['maicao','Maicao']]

const empty = {
  titulo: '',
  fecha: '',
  hora: '',
  lugar: '',
  cat: 'académico',
  sede: 'ambas',
  desc: '',
  imagen_url: '',
  url_registro: '',
  ponente: '',
  estado: 'próximo',
}

export default function TabEventos() {
  const { data, addItem, removeItem, updateItem } = useData()
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('all')

  const save = e => {
    e.preventDefault()
    if (editing !== null) { updateItem('eventos', editing, { ...form }); setEditing(null) }
    else addItem('eventos', { ...form })
    setForm(empty)
  }
  const startEdit = ev => {
    setForm({ titulo: ev.titulo, fecha: ev.fecha ?? '', hora: ev.hora ?? '', lugar: ev.lugar ?? '', cat: ev.cat ?? 'académico', sede: ev.sede ?? 'ambas', desc: ev.desc ?? '', imagen_url: ev.imagen_url ?? '', url_registro: ev.url_registro ?? '', ponente: ev.ponente ?? '', estado: ev.estado ?? 'próximo' })
    setEditing(ev.id)
  }
  const cancel = () => { setForm(empty); setEditing(null) }
  const f = (k, v) => setForm(x => ({ ...x, [k]: v }))

  const list = (data.eventos ?? []).filter(ev => filter === 'all' || ev.estado === filter)

  const estadoColor = { próximo: 'color-mix(in oklab, var(--ug-amarillo) 30%, transparent)', 'en curso': 'color-mix(in oklab, var(--ug-azul) 25%, transparent)', pasado: 'var(--paper-3)' }

  return (
    <div>
      <h3 style={{ marginBottom: 20 }}>Eventos</h3>
      <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 24 }} onSubmit={save}>
        <div style={{ fontWeight: 600, marginBottom: 16 }}>{editing !== null ? 'Editar evento' : 'Nuevo evento'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="field" style={{ gridColumn: '1 / -1' }}><label>Título del evento</label><input value={form.titulo} onChange={e => f('titulo', e.target.value)} required /></div>
          <div className="field"><label>Fecha</label><input value={form.fecha} onChange={e => f('fecha', e.target.value)} placeholder="ej. 15 may 2026" /></div>
          <div className="field"><label>Hora</label><input value={form.hora} onChange={e => f('hora', e.target.value)} placeholder="ej. 9:00 am" /></div>
          <div className="field"><label>Lugar</label><input value={form.lugar} onChange={e => f('lugar', e.target.value)} placeholder="Auditorio principal" /></div>
          <div className="field"><label>Ponente / Responsable</label><input value={form.ponente} onChange={e => f('ponente', e.target.value)} /></div>
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
            <select value={form.estado} onChange={e => f('estado', e.target.value)}>
              <option value="próximo">Próximo</option>
              <option value="en curso">En curso</option>
              <option value="pasado">Pasado</option>
            </select>
          </div>
          <div className="field"><label>Link de registro (opcional)</label><input value={form.url_registro} onChange={e => f('url_registro', e.target.value)} placeholder="https://..." /></div>
          <div className="field" style={{ gridColumn: '1 / -1' }}><label>Descripción</label><textarea rows="3" value={form.desc} onChange={e => f('desc', e.target.value)} /></div>
          <div style={{ gridColumn: '1 / -1' }}>
            <FileUpload
              tipo="noticia-imagen"
              accept="image/*"
              previewType="image"
              label="Imagen del evento"
              currentUrl={form.imagen_url}
              onUploaded={url => f('imagen_url', url)}
            />
          </div>
          {form.imagen_url && (
            <div className="field" style={{ gridColumn: '1 / -1', margin: 0 }}>
              <label>URL imagen (editar manualmente si es necesario)</label>
              <input value={form.imagen_url} onChange={e => f('imagen_url', e.target.value)} placeholder="https://..." />
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn accent" type="submit" style={{ padding: '8px 20px' }}>{editing !== null ? 'Guardar cambios' : 'Agregar evento'} <Icons.check /></button>
          {editing !== null && <button type="button" className="btn ghost" style={{ padding: '8px 16px' }} onClick={cancel}>Cancelar</button>}
        </div>
      </form>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[['all','Todos'],['próximo','Próximos'],['en curso','En curso'],['pasado','Pasados']].map(([k,l]) => (
          <button key={k} className="chip" onClick={() => setFilter(k)}
            style={{ cursor: 'pointer', background: filter===k ? 'var(--ug-marino)' : undefined, color: filter===k ? 'var(--paper)' : undefined, borderColor: filter===k ? 'transparent' : undefined }}>{l}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {list.map(ev => (
          <div key={ev.id} style={{ display: 'grid', gridTemplateColumns: '44px 1fr 100px 80px 120px 120px auto', gap: 16, padding: '12px 0', borderBottom: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)', alignItems: 'center' }}>
            {ev.imagen_url
              ? <img src={ev.imagen_url} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
              : <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--paper-3)', flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 16 }}>📅</div>
            }
            <div style={{ fontWeight: 500, fontSize: 14 }}>{ev.titulo}</div>
            <span className="chip" style={{ fontSize: 10 }}>{ev.cat}</span>
            <span className="chip" style={{ fontSize: 10, background: 'color-mix(in oklab, var(--ug-marino) 15%, transparent)' }}>{ev.sede ?? 'ambas'}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{ev.fecha}</span>
            <span className="chip" style={{ fontSize: 10, background: estadoColor[ev.estado] ?? 'var(--paper-3)' }}>{ev.estado}</span>
            <RowActions onEdit={() => startEdit(ev)} onDelete={() => removeItem('eventos', ev.id)} />
          </div>
        ))}
        {list.length === 0 && <div style={{ padding: '24px 0', color: 'var(--ink-3)', fontSize: 14 }}>No hay eventos en este filtro.</div>}
      </div>
    </div>
  )
}
