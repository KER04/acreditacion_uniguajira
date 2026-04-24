import { useState } from 'react'
import { useData } from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'

export default function TabInicio() {
  const { data, update } = useData()
  const ini = data.inicio ?? {}
  const [slogan, setSlogan] = useState(ini.slogan ?? '')
  const [cifras, setCifras] = useState(ini.cifras ?? [])
  const [proy, setProy] = useState(ini.proyectoDestacado ?? { titulo: '', resumen: '', grupo: '' })
  const [saved, setSaved] = useState(false)

  const save = e => {
    e.preventDefault()
    update('inicio', { slogan, cifras, proyectoDestacado: proy })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateCifra = (i, field, val) => setCifras(c => c.map((x, j) => j === i ? { ...x, [field]: val } : x))
  const addCifra = () => setCifras(c => [...c, { label: 'Nueva cifra', value: '0' }])
  const removeCifra = i => setCifras(c => c.filter((_, j) => j !== i))

  return (
    <form onSubmit={save}>
      <h3 style={{ marginBottom: 20 }}>Sección de Inicio</h3>

      <div className="card" style={{ background: 'var(--paper-2)', marginBottom: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>Slogan del hero</div>
        <div className="field">
          <label>Texto principal</label>
          <textarea rows="2" value={slogan} onChange={e => setSlogan(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ background: 'var(--paper-2)', marginBottom: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>Cifras institucionales</div>
        {cifras.map((c, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, marginBottom: 10, alignItems: 'end' }}>
            <div className="field" style={{ margin: 0 }}><label>Etiqueta</label><input value={c.label} onChange={e => updateCifra(i, 'label', e.target.value)} /></div>
            <div className="field" style={{ margin: 0 }}><label>Valor</label><input value={c.value} onChange={e => updateCifra(i, 'value', e.target.value)} /></div>
            <button type="button" className="icon-btn" style={{ width: 30, height: 30, color: 'var(--ug-flamingo)', marginBottom: 0 }} onClick={() => removeCifra(i)}><Icons.trash /></button>
          </div>
        ))}
        <button type="button" className="btn ghost" style={{ padding: '6px 14px', fontSize: 13, marginTop: 8 }} onClick={addCifra}>+ Agregar cifra</button>
      </div>

      <div className="card" style={{ background: 'var(--paper-2)', marginBottom: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>Proyecto destacado</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="field"><label>Título</label><input value={proy.titulo} onChange={e => setProy(p => ({ ...p, titulo: e.target.value }))} /></div>
          <div className="field"><label>Resumen</label><textarea rows="2" value={proy.resumen} onChange={e => setProy(p => ({ ...p, resumen: e.target.value }))} /></div>
          <div className="field"><label>Grupo / Semillero</label><input value={proy.grupo} onChange={e => setProy(p => ({ ...p, grupo: e.target.value }))} /></div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button className="btn accent" type="submit" style={{ padding: '10px 24px' }}>Guardar cambios <Icons.check /></button>
        {saved && <span style={{ fontSize: 13, color: 'var(--ug-azul-deep)' }}>✓ Guardado</span>}
      </div>
    </form>
  )
}
