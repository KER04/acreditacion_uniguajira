import { useState } from 'react'
import { useData } from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'
import RowActions from '../RowActions'

const SEDES = [['ambas','Ambas sedes'],['riohacha','Riohacha'],['maicao','Maicao']]
const TIPOS_CAL = ['académico','administrativo','evaluacion','otro']

export default function TabEstudiantes() {
  const { data, addItem, removeItem, updateItem, update } = useData()
  const [tab, setTab] = useState('honor')

  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>Estudiantes</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[['honor','Cuadro de honor'],['calendario','Calendario'],['modalidades','Modalidades de grado'],['documentos','Documentos']].map(([k,l]) => (
          <button key={k} className="chip" onClick={() => setTab(k)}
            style={{ cursor: 'pointer', background: tab===k ? 'var(--ink)' : undefined, color: tab===k ? 'var(--paper)' : undefined }}>{l}</button>
        ))}
      </div>

      {tab === 'honor' && <TabHonorInner data={data} addItem={addItem} removeItem={removeItem} updateItem={updateItem} />}
      {tab === 'calendario' && <TabCalendarioInner data={data} addItem={addItem} removeItem={removeItem} updateItem={updateItem} />}
      {tab === 'modalidades' && <TabModalidadesInner data={data} addItem={addItem} removeItem={removeItem} updateItem={updateItem} />}
      {tab === 'documentos' && <TabDocumentosInner data={data} addItem={addItem} removeItem={removeItem} updateItem={updateItem} />}
    </div>
  )
}

function TabHonorInner({ data, addItem, removeItem, updateItem }) {
  const empty = { nombre: '', promedio: '', semestre: '', periodo: '', sede: 'riohacha' }
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)

  const save = e => {
    e.preventDefault()
    if (editing !== null) { updateItem('honor', editing, { ...form }); setEditing(null) }
    else addItem('honor', { ...form })
    setForm(empty)
  }
  const startEdit = h => { setForm({ nombre: h.nombre, promedio: String(h.promedio), semestre: h.semestre, periodo: h.periodo, sede: h.sede ?? 'riohacha' }); setEditing(h.id) }
  const f = (k, v) => setForm(x => ({ ...x, [k]: v }))

  return (
    <>
      <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 24 }} onSubmit={save}>
        <div style={{ fontWeight: 600, marginBottom: 14 }}>{editing !== null ? 'Editar entrada' : 'Nueva entrada'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="field"><label>Nombre</label><input value={form.nombre} onChange={e => f('nombre', e.target.value)} required /></div>
          <div className="field"><label>Promedio</label><input value={form.promedio} onChange={e => f('promedio', e.target.value)} placeholder="ej. 4.73" required /></div>
          <div className="field"><label>Semestre</label><input value={form.semestre} onChange={e => f('semestre', e.target.value)} placeholder="ej. Séptimo" /></div>
          <div className="field"><label>Período</label><input value={form.periodo} onChange={e => f('periodo', e.target.value)} placeholder="ej. 2026-I" /></div>
          <div className="field">
            <label>Sede</label>
            <select value={form.sede} onChange={e => f('sede', e.target.value)}>
              {SEDES.filter(([k]) => k !== 'ambas').map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button className="btn accent" type="submit" style={{ padding: '8px 20px' }}>{editing !== null ? 'Guardar' : 'Agregar'} <Icons.check /></button>
          {editing !== null && <button type="button" className="btn ghost" style={{ padding: '8px 16px' }} onClick={() => { setForm(empty); setEditing(null) }}>Cancelar</button>}
        </div>
      </form>
      {(data.honor ?? []).map(h => (
        <div key={h.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 100px 80px auto', gap: 12, padding: '12px 0', borderBottom: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)', alignItems: 'center' }}>
          <div style={{ fontWeight: 500, fontSize: 14 }}>{h.nombre}</div>
          <span className="chip" style={{ fontSize: 10 }}>{h.promedio}</span>
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{h.semestre}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{h.periodo}</span>
          <span className="chip" style={{ fontSize: 10, background: 'color-mix(in oklab, var(--ug-marino) 15%, transparent)' }}>{h.sede ?? 'riohacha'}</span>
          <RowActions onEdit={() => startEdit(h)} onDelete={() => removeItem('honor', h.id)} />
        </div>
      ))}
    </>
  )
}

function TabCalendarioInner({ data, addItem, removeItem, updateItem }) {
  const empty = { fecha: '', evento: '', tipo: 'académico' }
  const [form, setForm] = useState(empty)

  const save = e => {
    e.preventDefault()
    addItem('calendario', { ...form })
    setForm(empty)
  }

  return (
    <>
      <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 20 }} onSubmit={save}>
        <div style={{ fontWeight: 600, marginBottom: 14 }}>Agregar evento</div>
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 140px', gap: 12 }}>
          <div className="field" style={{ margin: 0 }}><label>Fecha</label><input value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} placeholder="ej. 26 may 2026" required /></div>
          <div className="field" style={{ margin: 0 }}><label>Evento</label><input value={form.evento} onChange={e => setForm(f => ({ ...f, evento: e.target.value }))} required /></div>
          <div className="field" style={{ margin: 0 }}>
            <label>Tipo</label>
            <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
              {TIPOS_CAL.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <button className="btn accent" type="submit" style={{ padding: '8px 18px', marginTop: 12 }}>Agregar <Icons.check /></button>
      </form>
      {(data.calendario ?? []).map(ev => (
        <div key={ev.id} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 120px auto', gap: 12, padding: '12px 0', borderBottom: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>{ev.fecha}</span>
          <span style={{ fontSize: 14 }}>{ev.evento}</span>
          <span className="chip" style={{ fontSize: 10 }}>{ev.tipo}</span>
          <button className="icon-btn" style={{ width: 28, height: 28, color: 'var(--ug-flamingo)' }} onClick={() => removeItem('calendario', ev.id)}><Icons.trash /></button>
        </div>
      ))}
    </>
  )
}

function TabModalidadesInner({ data, addItem, removeItem }) {
  const [form, setForm] = useState({ nombre: '', desc: '' })

  const save = e => {
    e.preventDefault()
    addItem('modalidades_grado', { ...form })
    setForm({ nombre: '', desc: '' })
  }

  return (
    <>
      <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 20 }} onSubmit={save}>
        <div style={{ fontWeight: 600, marginBottom: 14 }}>Agregar modalidad de grado</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="field"><label>Nombre</label><input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required /></div>
          <div className="field"><label>Descripción</label><textarea rows="2" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} /></div>
        </div>
        <button className="btn accent" type="submit" style={{ padding: '8px 18px', marginTop: 12 }}>Agregar <Icons.check /></button>
      </form>
      {(data.modalidades_grado ?? []).map(m => (
        <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, padding: '12px 0', borderBottom: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{m.nombre}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>{m.desc}</div>
          </div>
          <button className="icon-btn" style={{ width: 28, height: 28, color: 'var(--ug-flamingo)' }} onClick={() => removeItem('modalidades_grado', m.id)}><Icons.trash /></button>
        </div>
      ))}
    </>
  )
}

function TabDocumentosInner({ data, addItem, removeItem }) {
  const [form, setForm] = useState({ nombre: '', url: '#', tipo: 'PDF' })

  const save = e => {
    e.preventDefault()
    addItem('documentos_estudiantes', { ...form })
    setForm({ nombre: '', url: '#', tipo: 'PDF' })
  }

  return (
    <>
      <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 20 }} onSubmit={save}>
        <div style={{ fontWeight: 600, marginBottom: 14 }}>Agregar documento</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 80px', gap: 12 }}>
          <div className="field" style={{ margin: 0 }}><label>Nombre</label><input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required /></div>
          <div className="field" style={{ margin: 0 }}><label>URL o enlace</label><input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} /></div>
          <div className="field" style={{ margin: 0 }}>
            <label>Tipo</label>
            <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
              {['PDF','DOCX','XLSX','Enlace'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <button className="btn accent" type="submit" style={{ padding: '8px 18px', marginTop: 12 }}>Agregar <Icons.check /></button>
      </form>
      {(data.documentos_estudiantes ?? []).map(d => (
        <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '1fr 60px auto', gap: 12, padding: '12px 0', borderBottom: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)', alignItems: 'center' }}>
          <span style={{ fontSize: 14 }}>{d.nombre}</span>
          <span className="chip" style={{ fontSize: 10 }}>{d.tipo}</span>
          <button className="icon-btn" style={{ width: 28, height: 28, color: 'var(--ug-flamingo)' }} onClick={() => removeItem('documentos_estudiantes', d.id)}><Icons.trash /></button>
        </div>
      ))}
    </>
  )
}
