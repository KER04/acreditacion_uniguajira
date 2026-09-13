import { useState } from 'react'
import { useData } from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'
import RowActions from '../RowActions'
import FileUpload from '../FileUpload'
import {
  CATEGORIAS_EVENTO, SEDES_CON_AMBAS, ESTADOS_EVENTO,
  fechaLarga, horaLarga, faseEvento,
} from '../../../../shared/validacion'

const ETIQUETA_SEDE = { ambas: 'Ambas sedes', riohacha: 'Riohacha', maicao: 'Maicao' }
const ETIQUETA_ESTADO = { programado: 'Programado', cancelado: 'Cancelado', aplazado: 'Aplazado' }
const ETIQUETA_FASE = { proximo: 'Próximo', en_curso: 'En curso', pasado: 'Pasado', cancelado: 'Cancelado', aplazado: 'Aplazado' }

const COLOR_FASE = {
  proximo: 'color-mix(in oklab, var(--ug-amarillo) 30%, transparent)',
  en_curso: 'color-mix(in oklab, var(--ug-azul) 25%, transparent)',
  pasado: 'var(--paper-3)',
  cancelado: 'color-mix(in oklab, var(--ug-flamingo) 25%, transparent)',
  aplazado: 'color-mix(in oklab, var(--ug-amarillo) 18%, transparent)',
}

const vacio = {
  titulo: '', descripcion: '', categoria: 'Académico',
  fecha: '', fecha_fin: '', hora: '', hora_fin: '',
  lugar: '', ponente: '', sede: 'ambas',
  imagen_url: '', url_inscripcion: '', estado: 'programado',
}

export default function TabEventos() {
  const { data, addItem, removeItem, updateItem } = useData()
  const [form, setForm] = useState(vacio)
  const [editando, setEditando] = useState(null)
  const [filtro, setFiltro] = useState('all')

  const guardar = e => {
    e.preventDefault()
    if (editando !== null) { updateItem('eventos', editando, { ...form }); setEditando(null) }
    else addItem('eventos', { ...form })
    setForm(vacio)
  }
  const editar = ev => {
    setForm({
      titulo: ev.titulo, descripcion: ev.descripcion ?? '', categoria: ev.categoria ?? 'Académico',
      fecha: ev.fecha ?? '', fecha_fin: ev.fecha_fin ?? '', hora: ev.hora ?? '', hora_fin: ev.hora_fin ?? '',
      lugar: ev.lugar ?? '', ponente: ev.ponente ?? '', sede: ev.sede ?? 'ambas',
      imagen_url: ev.imagen_url ?? '', url_inscripcion: ev.url_inscripcion ?? '', estado: ev.estado ?? 'programado',
    })
    setEditando(ev.id)
  }
  const cancelar = () => { setForm(vacio); setEditando(null) }
  const f = (k, v) => setForm(x => ({ ...x, [k]: v }))

  /* La fase sale del calendario, no de un campo: un evento pasado se ve como
     pasado sin que nadie tenga que acordarse de cambiarlo. */
  const lista = (data.eventos ?? []).filter(ev => filtro === 'all' || faseEvento(ev) === filtro)

  return (
    <div>
      <h3 style={{ marginBottom: 20 }}>Eventos</h3>
      <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 24 }} onSubmit={guardar}>
        <div style={{ fontWeight: 600, marginBottom: 16 }}>{editando !== null ? 'Editar evento' : 'Nuevo evento'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Título del evento</label>
            <input value={form.titulo} onChange={e => f('titulo', e.target.value)} required minLength={3} />
          </div>
          <div className="field">
            <label>Fecha</label>
            <input type="date" value={form.fecha} onChange={e => f('fecha', e.target.value)} required />
          </div>
          <div className="field">
            <label>Fecha final (si dura varios días)</label>
            <input type="date" value={form.fecha_fin} onChange={e => f('fecha_fin', e.target.value)} />
          </div>
          <div className="field">
            <label>Hora</label>
            <input type="time" value={form.hora} onChange={e => f('hora', e.target.value)} />
          </div>
          <div className="field">
            <label>Hora final</label>
            <input type="time" value={form.hora_fin} onChange={e => f('hora_fin', e.target.value)} />
          </div>
          <div className="field">
            <label>Lugar</label>
            <input value={form.lugar} onChange={e => f('lugar', e.target.value)} placeholder="Auditorio principal" />
          </div>
          <div className="field">
            <label>Ponente / Responsable</label>
            <input value={form.ponente} onChange={e => f('ponente', e.target.value)} />
          </div>
          <div className="field">
            <label>Categoría</label>
            <select value={form.categoria} onChange={e => f('categoria', e.target.value)}>
              {CATEGORIAS_EVENTO.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Sede</label>
            <select value={form.sede} onChange={e => f('sede', e.target.value)}>
              {SEDES_CON_AMBAS.map(v => <option key={v} value={v}>{ETIQUETA_SEDE[v]}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Estado</label>
            <select value={form.estado} onChange={e => f('estado', e.target.value)}>
              {ESTADOS_EVENTO.map(v => <option key={v} value={v}>{ETIQUETA_ESTADO[v]}</option>)}
            </select>
            <small style={{ color: 'var(--ink-3)', fontSize: 11 }}>
              Si está próximo, en curso o ya pasó se calcula con la fecha; aquí solo se marca una cancelación o un aplazamiento.
            </small>
          </div>
          <div className="field">
            <label>Enlace de inscripción (opcional)</label>
            <input value={form.url_inscripcion} onChange={e => f('url_inscripcion', e.target.value)} placeholder="https://..." />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Descripción</label>
            <textarea rows="3" value={form.descripcion} onChange={e => f('descripcion', e.target.value)} />
          </div>
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
          <button className="btn accent" type="submit" style={{ padding: '8px 20px' }}>
            {editando !== null ? 'Guardar cambios' : 'Agregar evento'} <Icons.check />
          </button>
          {editando !== null && <button type="button" className="btn ghost" style={{ padding: '8px 16px' }} onClick={cancelar}>Cancelar</button>}
        </div>
      </form>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[['all', 'Todos'], ['proximo', 'Próximos'], ['en_curso', 'En curso'], ['pasado', 'Pasados']].map(([k, l]) => (
          <button key={k} className="chip" onClick={() => setFiltro(k)}
            style={{ cursor: 'pointer', background: filtro === k ? 'var(--ug-marino)' : undefined, color: filtro === k ? 'var(--paper)' : undefined, borderColor: filtro === k ? 'transparent' : undefined }}>{l}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {lista.map(ev => {
          const fase = faseEvento(ev)
          return (
            <div key={ev.id} style={{ display: 'grid', gridTemplateColumns: '44px 1fr 110px 80px 140px 110px auto', gap: 16, padding: '12px 0', borderBottom: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)', alignItems: 'center' }}>
              {ev.imagen_url
                ? <img src={ev.imagen_url} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                : <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--paper-3)', flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 16 }}>📅</div>
              }
              <div style={{ fontWeight: 500, fontSize: 14 }}>{ev.titulo}</div>
              <span className="chip" style={{ fontSize: 10 }}>{ev.categoria}</span>
              <span className="chip" style={{ fontSize: 10, background: 'color-mix(in oklab, var(--ug-marino) 15%, transparent)' }}>{ev.sede ?? 'ambas'}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>
                {fechaLarga(ev.fecha)}{ev.hora ? ` · ${horaLarga(ev.hora)}` : ''}
              </span>
              <span className="chip" style={{ fontSize: 10, background: COLOR_FASE[fase] ?? 'var(--paper-3)' }}>{ETIQUETA_FASE[fase] ?? fase}</span>
              <RowActions onEdit={() => editar(ev)} onDelete={() => removeItem('eventos', ev.id)} />
            </div>
          )
        })}
        {lista.length === 0 && <div style={{ padding: '24px 0', color: 'var(--ink-3)', fontSize: 14 }}>No hay eventos en este filtro.</div>}
      </div>
    </div>
  )
}
