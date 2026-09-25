import { useState } from 'react'
import { usePestana } from '../../../hooks/useParametroURL'
import { useData } from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'
import RowActions from '../RowActions'
import Plegable from '../Plegable'

const SEDES = [['riohacha','Riohacha'],['maicao','Maicao']]
const CATS_GRUPO = ['A1','A','B','C','Reconocido']

const SUBPESTANAS = [['grupos', 'Grupos de investigación'], ['semilleros', 'Semilleros']]

export default function TabFunciones() {
  const { data, addItem, removeItem, updateItem } = useData()
  const [tab, setTab] = usePestana(SUBPESTANAS, { clave: 'sub' })

  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>Funciones Misionales</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {SUBPESTANAS.map(([k,l]) => (
          <button key={k} className="chip" onClick={() => setTab(k)}
            style={{ cursor: 'pointer', background: tab===k ? 'var(--ink)' : undefined, color: tab===k ? 'var(--paper)' : undefined }}>{l}</button>
        ))}
      </div>

      {tab === 'grupos' && <GruposPanel data={data} addItem={addItem} removeItem={removeItem} updateItem={updateItem} />}
      {tab === 'semilleros' && <SemillerosPanel data={data} addItem={addItem} removeItem={removeItem} updateItem={updateItem} />}
    </div>
  )
}

function GruposPanel({ data, addItem, removeItem, updateItem }) {
  const empty = { nombre: '', cat: 'B', lider: '', sede: 'riohacha', desc: '' }
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const f = (k, v) => setForm(x => ({ ...x, [k]: v }))

  const save = e => {
    e.preventDefault()
    if (editing !== null) { updateItem('grupos', editing, { ...form }); setEditing(null) }
    else addItem('grupos', { ...form })
    setForm(empty)
  }
  const startEdit = g => { setForm({ nombre: g.nombre, cat: g.cat, lider: g.lider, sede: g.sede, desc: g.desc }); setEditing(g.id) }

  return (
    <>
      <Plegable id="tabfunciones-0" titulo={editing !== null ? 'Editar grupo' : 'Nuevo grupo de investigación'}>
        <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 24 }} onSubmit={save}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="field"><label>Nombre</label><input value={form.nombre} onChange={e => f('nombre', e.target.value)} required /></div>
            <div className="field"><label>Líder</label><input value={form.lider} onChange={e => f('lider', e.target.value)} /></div>
            <div className="field">
              <label>Categoría MinCiencias</label>
              <select value={form.cat} onChange={e => f('cat', e.target.value)}>
                {CATS_GRUPO.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Sede</label>
              <select value={form.sede} onChange={e => f('sede', e.target.value)}>
                {SEDES.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}><label>Descripción</label><textarea rows="2" value={form.desc} onChange={e => f('desc', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn accent" type="submit" style={{ padding: '8px 20px' }}>{editing !== null ? 'Guardar' : 'Agregar'} <Icons.check /></button>
            {editing !== null && <button type="button" className="btn ghost" style={{ padding: '8px 16px' }} onClick={() => { setForm(empty); setEditing(null) }}>Cancelar</button>}
          </div>
        </form>
      </Plegable>
      {(data.grupos ?? []).map(g => (
        <div key={g.id} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 80px 160px auto', gap: 14, padding: '14px 0', borderBottom: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)', alignItems: 'center' }}>
          <div style={{ fontWeight: 500, fontSize: 14 }}>{g.nombre}</div>
          <span className="chip" style={{ fontSize: 10 }}>{g.cat}</span>
          <span className="chip" style={{ fontSize: 10, background: 'color-mix(in oklab, var(--ug-marino) 15%, transparent)' }}>{g.sede}</span>
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{g.lider}</span>
          <RowActions onEdit={() => startEdit(g)} onDelete={() => removeItem('grupos', g.id)} />
        </div>
      ))}
    </>
  )
}

function SemillerosPanel({ data, addItem, removeItem, updateItem }) {
  const empty = { nombre: '', grupo: '', lider: '', sede: 'riohacha', desc: '' }
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const f = (k, v) => setForm(x => ({ ...x, [k]: v }))

  const save = e => {
    e.preventDefault()
    if (editing !== null) { updateItem('semilleros', editing, { ...form }); setEditing(null) }
    else addItem('semilleros', { ...form })
    setForm(empty)
  }
  const startEdit = s => { setForm({ nombre: s.nombre, grupo: s.grupo, lider: s.lider, sede: s.sede, desc: s.desc }); setEditing(s.id) }
  const grupos = (data.grupos ?? []).map(g => g.nombre)

  return (
    <>
      <Plegable id="tabfunciones-1" titulo={editing !== null ? 'Editar semillero' : 'Nuevo semillero'}>
        <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 24 }} onSubmit={save}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="field"><label>Nombre</label><input value={form.nombre} onChange={e => f('nombre', e.target.value)} required /></div>
            <div className="field"><label>Líder</label><input value={form.lider} onChange={e => f('lider', e.target.value)} /></div>
            <div className="field">
              <label>Grupo de investigación</label>
              {grupos.length > 0
                ? <select value={form.grupo} onChange={e => f('grupo', e.target.value)}>
                    <option value="">— Sin grupo —</option>
                    {grupos.map(g => <option key={g}>{g}</option>)}
                  </select>
                : <input value={form.grupo} onChange={e => f('grupo', e.target.value)} placeholder="Nombre del grupo" />
              }
            </div>
            <div className="field">
              <label>Sede</label>
              <select value={form.sede} onChange={e => f('sede', e.target.value)}>
                {SEDES.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}><label>Descripción</label><textarea rows="2" value={form.desc} onChange={e => f('desc', e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn accent" type="submit" style={{ padding: '8px 20px' }}>{editing !== null ? 'Guardar' : 'Agregar'} <Icons.check /></button>
            {editing !== null && <button type="button" className="btn ghost" style={{ padding: '8px 16px' }} onClick={() => { setForm(empty); setEditing(null) }}>Cancelar</button>}
          </div>
        </form>
      </Plegable>
      {(data.semilleros ?? []).map(s => (
        <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 80px 140px auto', gap: 14, padding: '14px 0', borderBottom: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)', alignItems: 'center' }}>
          <div style={{ fontWeight: 500, fontSize: 14 }}>{s.nombre}</div>
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{s.grupo}</span>
          <span className="chip" style={{ fontSize: 10, background: 'color-mix(in oklab, var(--ug-marino) 15%, transparent)' }}>{s.sede}</span>
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{s.lider}</span>
          <RowActions onEdit={() => startEdit(s)} onDelete={() => removeItem('semilleros', s.id)} />
        </div>
      ))}
    </>
  )
}
