import { useState } from 'react'
import { useData } from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'
import RowActions from '../RowActions'
import {
  CATEGORIAS_CONVOCATORIA, ESTADOS_CONVOCATORIA, SEDES_CON_AMBAS, fechaLarga,
} from '../../../../shared/validacion'

const ETIQUETA_SEDE = { ambas: 'Ambas sedes', riohacha: 'Riohacha', maicao: 'Maicao' }

const vacia = {
  titulo: '', descripcion: '', categoria: 'Investigación',
  fecha_apertura: '', fecha_cierre: '', estado: 'Abierta',
  dirigida_a: 'Estudiantes', sede: 'ambas', requisitos: '',
  url_postulacion: '', documento_url: '',
}

export default function TabConvocatorias() {
  const { data, addItem, removeItem, updateItem } = useData()
  const [form, setForm] = useState(vacia)
  const [editando, setEditando] = useState(null)

  const guardar = e => {
    e.preventDefault()
    /* El textarea edita los requisitos como líneas; la base los guarda como
       arreglo. La conversión ocurre aquí, en el borde. */
    const item = { ...form, requisitos: form.requisitos.split('\n').map(r => r.trim()).filter(Boolean) }
    if (editando !== null) { updateItem('convocatorias', editando, item); setEditando(null) }
    else addItem('convocatorias', item)
    setForm(vacia)
  }
  const editar = c => {
    setForm({
      titulo: c.titulo, descripcion: c.descripcion ?? '', categoria: c.categoria,
      fecha_apertura: c.fecha_apertura ?? '', fecha_cierre: c.fecha_cierre ?? '',
      estado: c.estado ?? 'Abierta', dirigida_a: c.dirigida_a ?? 'Estudiantes',
      sede: c.sede ?? 'ambas', requisitos: (c.requisitos ?? []).join('\n'),
      url_postulacion: c.url_postulacion ?? '', documento_url: c.documento_url ?? '',
    })
    setEditando(c.id)
  }
  const cancelar = () => { setForm(vacia); setEditando(null) }
  const f = (k, v) => setForm(x => ({ ...x, [k]: v }))

  return (
    <div>
      <h3 style={{ marginBottom: 20 }}>Convocatorias</h3>
      <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 24 }} onSubmit={guardar}>
        <div style={{ fontWeight: 600, marginBottom: 16 }}>{editando !== null ? 'Editar convocatoria' : 'Nueva convocatoria'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Título</label>
            <input value={form.titulo} onChange={e => f('titulo', e.target.value)} required minLength={3} />
          </div>
          <div className="field">
            <label>Categoría</label>
            <select value={form.categoria} onChange={e => f('categoria', e.target.value)}>
              {CATEGORIAS_CONVOCATORIA.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Estado</label>
            <select value={form.estado} onChange={e => f('estado', e.target.value)}>
              {ESTADOS_CONVOCATORIA.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Apertura</label>
            <input type="date" value={form.fecha_apertura} onChange={e => f('fecha_apertura', e.target.value)} />
          </div>
          <div className="field">
            <label>Cierre</label>
            <input type="date" value={form.fecha_cierre} onChange={e => f('fecha_cierre', e.target.value)} />
          </div>
          <div className="field">
            <label>Sede</label>
            <select value={form.sede} onChange={e => f('sede', e.target.value)}>
              {SEDES_CON_AMBAS.map(v => <option key={v} value={v}>{ETIQUETA_SEDE[v]}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Dirigida a</label>
            <input value={form.dirigida_a} onChange={e => f('dirigida_a', e.target.value)} placeholder="Estudiantes" />
          </div>
          <div className="field">
            <label>Enlace de postulación (opcional)</label>
            <input value={form.url_postulacion} onChange={e => f('url_postulacion', e.target.value)} placeholder="https://..." />
          </div>
          <div className="field">
            <label>Documento (opcional)</label>
            <input value={form.documento_url} onChange={e => f('documento_url', e.target.value)} placeholder="https://... o /docs/..." />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Descripción</label>
            <textarea rows="3" value={form.descripcion} onChange={e => f('descripcion', e.target.value)} />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Requisitos (uno por línea)</label>
            <textarea rows="3" value={form.requisitos} onChange={e => f('requisitos', e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn accent" type="submit" style={{ padding: '8px 20px' }}>
            {editando !== null ? 'Guardar cambios' : 'Publicar'} <Icons.check />
          </button>
          {editando !== null && <button type="button" className="btn ghost" style={{ padding: '8px 16px' }} onClick={cancelar}>Cancelar</button>}
        </div>
      </form>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {(data.convocatorias ?? []).map(c => (
          <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 80px 90px 130px auto', gap: 16, padding: '14px 0', borderBottom: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)', alignItems: 'center' }}>
            <div style={{ fontWeight: 500, fontSize: 14 }}>
              {c.titulo}
              {/* La base no sabe si alguien actualizó el estado; la fecha sí. */}
              {c.vencida && <span className="chip" style={{ fontSize: 9, marginLeft: 8, background: 'color-mix(in oklab, var(--ug-flamingo) 22%, transparent)' }}>cierre vencido</span>}
            </div>
            <span className="chip" style={{ fontSize: 10 }}>{c.categoria}</span>
            <span className="chip" style={{ fontSize: 10, background: 'color-mix(in oklab, var(--ug-marino) 15%, transparent)' }}>{c.sede ?? 'ambas'}</span>
            <span className="chip" style={{ fontSize: 10 }}>{c.estado ?? 'Abierta'}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{fechaLarga(c.fecha_cierre)}</span>
            <RowActions onEdit={() => editar(c)} onDelete={() => removeItem('convocatorias', c.id)} />
          </div>
        ))}
      </div>
    </div>
  )
}
