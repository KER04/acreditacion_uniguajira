/* Lista + formulario de un recurso REST del panel, descrito como datos.
 *
 * Nació en la pestaña de Extensión; Internacionalización necesitaba lo mismo
 * con otros campos, así que vive aquí y las dos lo importan.
 *
 * Campos: { k, l, tipo, ancho, requerido, placeholder, opciones, etiquetas }
 *   tipo: texto | area | numero | fecha | url | select | lista | check | archivo
 *   archivo: sube un PDF/DOC a la base y guarda su id (el valor es archivo_id).
 *   lista: un renglón por elemento en el formulario, arreglo en la base.
 */
import { useState } from 'react'
import { useData, apiSubirDocumento } from '../../context/DataContext'
import { Icons } from '../../components/Icons'
import RowActions from './RowActions'
import Plegable from './Plegable'

const filaEstilo = {
  display: 'grid', gap: 14, padding: '14px 0', alignItems: 'center',
  borderBottom: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)',
}

export const aLista = s => String(s ?? '').split('\n').map(x => x.trim()).filter(Boolean)

/* Adjunto: se sube al elegirlo y el formulario solo guarda el id. Si luego no
   se guarda el registro, el barrido de huérfanos lo retira en 24 h. */
function CampoArchivo({ c, valor, cambiar }) {
  const { setError } = useData()
  const [estado, setEstado] = useState('')
  const subir = async e => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setEstado('Subiendo…')
    try {
      const ficha = await apiSubirDocumento(file)
      cambiar(ficha.archivo_id)
      setEstado(`${ficha.nombre ?? file.name} · ${ficha.peso ?? ''} — se guardará con el registro`)
    } catch (err) { setError(err.message); setEstado('') }
  }
  return (
    <div className="field" style={c.ancho ? { gridColumn: '1 / -1' } : undefined}>
      <label>{c.l}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <label className="btn ghost" style={{ padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>
          {valor ? 'Cambiar archivo' : 'Subir archivo'}
          <input type="file" accept=".pdf,.doc,.docx" onChange={subir} style={{ display: 'none' }} />
        </label>
        {valor && (
          <>
            <a href={'/api/archivos/' + valor} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13 }}>Ver actual</a>
            <button type="button" className="btn ghost" style={{ padding: '6px 12px', fontSize: 12 }}
                    onClick={() => { cambiar(''); setEstado('Se quitará el archivo al guardar.') }}>Quitar</button>
          </>
        )}
        {estado && <small style={{ color: 'var(--ink-3)' }}>{estado}</small>}
      </div>
    </div>
  )
}

export function Campo({ c, valor, cambiar }) {
  if (c.tipo === 'archivo') return <CampoArchivo c={c} valor={valor} cambiar={cambiar} />
  const props = { value: valor ?? '', onChange: e => cambiar(e.target.value), required: c.requerido, placeholder: c.placeholder }
  let control
  if (c.tipo === 'area' || c.tipo === 'lista') control = <textarea rows={c.tipo === 'lista' ? 3 : 3} {...props} />
  else if (c.tipo === 'select') {
    control = (
      <select {...props}>
        {c.opciones.map(o => <option key={o} value={o}>{c.etiquetas?.[o] ?? o}</option>)}
      </select>
    )
  } else if (c.tipo === 'check') {
    return (
      <label className="field" style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: 'row' }}>
        <input type="checkbox" checked={Boolean(valor)} onChange={e => cambiar(e.target.checked)} /> {c.l}
      </label>
    )
  } else {
    const tipo = { numero: 'number', fecha: 'date', url: 'url' }[c.tipo] ?? 'text'
    control = <input type={tipo} min={tipo === 'number' ? 0 : undefined} {...props} />
  }
  return (
    <div className="field" style={c.ancho ? { gridColumn: '1 / -1' } : undefined}>
      <label>{c.l}</label>{control}
    </div>
  )
}

/* Lista + formulario de un recurso. `resumen` pinta las columnas de la fila. */
export default function PanelLista({ clave, id, titulos, campos, vacio, columnas, resumen, vacioTexto }) {
  const { data, addItem, removeItem, updateItem } = useData()
  const [form, setForm] = useState(vacio)
  const [editando, setEditando] = useState(null)
  const listas = campos.filter(c => c.tipo === 'lista').map(c => c.k)

  const guardar = e => {
    e.preventDefault()
    const item = { ...form }
    for (const k of listas) item[k] = aLista(item[k])
    if (editando !== null) { updateItem(clave, editando, item); setEditando(null) }
    else addItem(clave, item)
    setForm(vacio)
  }
  const editar = el => {
    const f = {}
    for (const k of Object.keys(vacio)) {
      f[k] = listas.includes(k) ? (el[k] ?? []).join('\n') : (el[k] ?? vacio[k])
    }
    setForm(f); setEditando(el.id)
  }
  const cancelar = () => { setForm(vacio); setEditando(null) }
  const lista = data[clave] ?? []

  return (
    <>
      <Plegable id={id} titulo={editando !== null ? titulos[1] : titulos[0]}>
        <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 24 }} onSubmit={guardar}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {campos.map(c => <Campo key={c.k} c={c} valor={form[c.k]} cambiar={v => setForm(x => ({ ...x, [c.k]: v }))} />)}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn accent" type="submit" style={{ padding: '8px 20px' }}>{editando !== null ? 'Guardar' : 'Agregar'} <Icons.check /></button>
            {editando !== null && <button type="button" className="btn ghost" style={{ padding: '8px 16px' }} onClick={cancelar}>Cancelar</button>}
          </div>
        </form>
      </Plegable>

      {lista.length === 0 && <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>{vacioTexto}</p>}
      {lista.map(el => (
        <div key={el.id} style={{ ...filaEstilo, gridTemplateColumns: columnas }}>
          {resumen(el)}
          <RowActions onEdit={() => editar(el)} onDelete={() => removeItem(clave, el.id)} />
        </div>
      ))}
    </>
  )
}

