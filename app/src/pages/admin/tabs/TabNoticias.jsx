import { useState } from 'react'
import { useData } from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'
import RowActions from '../RowActions'
import Plegable from '../Plegable'
import FileUpload from '../FileUpload'
import { CATEGORIAS_NOTICIA, SEDES_CON_AMBAS, fechaLarga } from '../../../../shared/validacion'

const ETIQUETA_SEDE = { ambas: 'Ambas sedes', riohacha: 'Riohacha', maicao: 'Maicao' }

/* La fecha es <input type="date">: la base la guarda como DATE y el texto
   libre de antes ("ej. 20 abr 2026") no se podía ordenar ni comparar. */
const vacia = {
  titulo: '', resumen: '', cuerpo: '', categoria: 'Institucional',
  fecha: '', sede: 'ambas', imagen_url: '', autor: '', publicada: true,
}

export default function TabNoticias() {
  const { data, addItem, removeItem, updateItem } = useData()
  const [form, setForm] = useState(vacia)
  const [editando, setEditando] = useState(null)

  const guardar = e => {
    e.preventDefault()
    if (editando !== null) { updateItem('noticias', editando, { ...form }); setEditando(null) }
    else addItem('noticias', { ...form })
    setForm(vacia)
  }
  const editar = n => {
    setForm({
      titulo: n.titulo, resumen: n.resumen ?? '', cuerpo: n.cuerpo ?? '',
      categoria: n.categoria, fecha: n.fecha ?? '', sede: n.sede ?? 'ambas',
      imagen_url: n.imagen_url ?? '', autor: n.autor ?? '', publicada: n.publicada !== false,
    })
    setEditando(n.id)
  }
  const cancelar = () => { setForm(vacia); setEditando(null) }
  const f = (k, v) => setForm(x => ({ ...x, [k]: v }))

  return (
    <div>
      <h3 style={{ marginBottom: 20 }}>Noticias</h3>
      <Plegable id="tabnoticias-0" titulo={editando !== null ? 'Editar noticia' : 'Nueva noticia'}>
        <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 24 }} onSubmit={guardar}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label>Título</label>
              <input value={form.titulo} onChange={e => f('titulo', e.target.value)} required minLength={3} />
            </div>
            <div className="field">
              <label>Categoría</label>
              <select value={form.categoria} onChange={e => f('categoria', e.target.value)}>
                {CATEGORIAS_NOTICIA.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Sede</label>
              <select value={form.sede} onChange={e => f('sede', e.target.value)}>
                {SEDES_CON_AMBAS.map(v => <option key={v} value={v}>{ETIQUETA_SEDE[v]}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Fecha</label>
              <input type="date" value={form.fecha} onChange={e => f('fecha', e.target.value)} required />
            </div>
            <div className="field">
              <label>Autor</label>
              <input value={form.autor} onChange={e => f('autor', e.target.value)} placeholder="Comunicaciones IS" />
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label>Resumen (tarjeta)</label>
              <textarea rows="2" value={form.resumen} onChange={e => f('resumen', e.target.value)} />
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label>Cuerpo completo (opcional)</label>
              <textarea rows="5" value={form.cuerpo} onChange={e => f('cuerpo', e.target.value)} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <FileUpload
                tipo="noticia-imagen"
                accept="image/*"
                previewType="image"
                label="Imagen de portada"
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
            <label style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <input type="checkbox" checked={form.publicada} onChange={e => f('publicada', e.target.checked)} />
              Publicada (si se desmarca, queda como borrador y no sale en el portal)
            </label>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="btn accent" type="submit" style={{ padding: '8px 20px' }}>
              {editando !== null ? 'Guardar cambios' : 'Publicar'} <Icons.check />
            </button>
            {editando !== null && <button type="button" className="btn ghost" style={{ padding: '8px 16px' }} onClick={cancelar}>Cancelar</button>}
          </div>
        </form>
      </Plegable>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {(data.noticias ?? []).map(n => (
          <div key={n.id} style={{ display: 'grid', gridTemplateColumns: '44px 1fr 120px 80px 110px auto', gap: 16, padding: '12px 0', borderBottom: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)', alignItems: 'center', opacity: n.publicada === false ? 0.55 : 1 }}>
            {n.imagen_url
              ? <img src={n.imagen_url} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
              : <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--paper-3)', flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 16 }}>📰</div>
            }
            <div style={{ fontWeight: 500, fontSize: 14 }}>
              {n.titulo}
              {n.publicada === false && <span className="chip" style={{ fontSize: 9, marginLeft: 8 }}>borrador</span>}
            </div>
            <span className="chip" style={{ fontSize: 10 }}>{n.categoria}</span>
            <span className="chip" style={{ fontSize: 10, background: 'color-mix(in oklab, var(--ug-marino) 15%, transparent)' }}>{n.sede ?? 'ambas'}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{fechaLarga(n.fecha)}</span>
            <RowActions onEdit={() => editar(n)} onDelete={() => removeItem('noticias', n.id)} />
          </div>
        ))}
      </div>
    </div>
  )
}
