import { useState } from 'react'
import { useData } from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'
import RowActions from '../RowActions'

const AREAS = [
  'Ciencias Básicas',
  'Ciencias Básicas de Ingeniería',
  'Perfil Profesional',
  'Complementaria',
  'Investigativo',
]

const CAMPOS = [
  'Básico General Científico Disciplinar',
  'Básico Específico Profesional',
  'Socio Humanístico',
]

const FORM_EMPTY = { nombre: '', codigo: '', creditos: '', horas_semana: '', campo: CAMPOS[0], area: AREAS[0] }

export default function TabPensum() {
  const { data, update } = useData()
  const pensum = data.pensum ?? []
  const [selSem, setSelSem] = useState(1)
  const [form, setForm] = useState(FORM_EMPTY)
  const [saved, setSaved] = useState(false)

  const sem = pensum.find(s => s.numero === selSem)
  const materias = sem?.materias ?? []

  const saveMateria = e => {
    e.preventDefault()
    const updated = pensum.map(s => {
      if (s.numero !== selSem) return s
      const newM = {
        nombre: form.nombre,
        codigo: form.codigo,
        creditos: Number(form.creditos),
        horas_semana: Number(form.horas_semana),
        campo: form.campo,
        area: form.area,
      }
      const newMaterias = [...s.materias, newM]
      const newTotal = newMaterias.reduce((a, m) => a + m.creditos, 0)
      const newHoras = newMaterias.reduce((a, m) => a + m.horas_semana, 0)
      return { ...s, materias: newMaterias, total_creditos: newTotal, total_horas: newHoras }
    })
    update('pensum', updated)
    setForm(FORM_EMPTY)
    setSaved(true); setTimeout(() => setSaved(false), 1500)
  }

  const removeMateria = idx => {
    const updated = pensum.map(s => {
      if (s.numero !== selSem) return s
      const newMaterias = s.materias.filter((_, i) => i !== idx)
      const newTotal = newMaterias.reduce((a, m) => a + m.creditos, 0)
      const newHoras = newMaterias.reduce((a, m) => a + m.horas_semana, 0)
      return { ...s, materias: newMaterias, total_creditos: newTotal, total_horas: newHoras }
    })
    update('pensum', updated)
  }

  const totalCr = materias.reduce((a, m) => a + Number(m.creditos), 0)
  const totalH  = materias.reduce((a, m) => a + Number(m.horas_semana), 0)

  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>Plan de Estudios</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {pensum.map(s => (
          <button key={s.numero} className="chip" onClick={() => setSelSem(s.numero)}
            style={{ cursor: 'pointer', background: selSem === s.numero ? 'var(--ug-marino)' : undefined, color: selSem === s.numero ? 'var(--paper)' : undefined, borderColor: selSem === s.numero ? 'transparent' : undefined }}>
            Sem {s.numero}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600 }}>Semestre {selSem}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>
            {materias.length} materias · {totalCr} créditos · {totalH} h/sem
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--paper)', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 1fr auto', padding: '12px 20px', background: 'var(--paper-2)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
          <div>Materia</div><div>Cr.</div><div>H/Sem</div><div>Área</div><div></div>
        </div>
        {materias.map((m, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 1fr auto', padding: '14px 20px', alignItems: 'center', borderTop: '1px solid color-mix(in oklab, var(--ink) 7%, transparent)', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{m.nombre}</div>
              {m.codigo && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{m.codigo}</div>}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{m.creditos}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{m.horas_semana}</div>
            <span className="chip" style={{ fontSize: 10 }}>{m.area}</span>
            <button className="icon-btn" style={{ width: 28, height: 28, color: 'var(--ug-flamingo)' }} onClick={() => removeMateria(i)} title="Eliminar"><Icons.trash /></button>
          </div>
        ))}
        {materias.length === 0 && <div style={{ padding: '24px 20px', color: 'var(--ink-3)', fontSize: 14, textAlign: 'center' }}>Sin materias en este semestre.</div>}
      </div>

      <form className="card" style={{ background: 'var(--paper-2)' }} onSubmit={saveMateria}>
        <div style={{ fontWeight: 600, marginBottom: 14 }}>Agregar materia</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 80px', gap: 12 }}>
          <div className="field" style={{ margin: 0 }}><label>Nombre</label><input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required /></div>
          <div className="field" style={{ margin: 0 }}><label>Código</label><input value={form.codigo} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} /></div>
          <div className="field" style={{ margin: 0 }}><label>Créditos</label><input type="number" min="1" max="10" value={form.creditos} onChange={e => setForm(f => ({ ...f, creditos: e.target.value }))} required /></div>
          <div className="field" style={{ margin: 0 }}><label>H/Sem</label><input type="number" min="1" max="12" value={form.horas_semana} onChange={e => setForm(f => ({ ...f, horas_semana: e.target.value }))} required /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <div className="field" style={{ margin: 0 }}>
            <label>Campo</label>
            <select value={form.campo} onChange={e => setForm(f => ({ ...f, campo: e.target.value }))}>
              {CAMPOS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Área</label>
            <select value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))}>
              {AREAS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center' }}>
          <button className="btn accent" type="submit" style={{ padding: '8px 18px' }}>Agregar <Icons.check /></button>
          {saved && <span style={{ fontSize: 13, color: 'var(--ug-azul-deep)' }}>✓ Guardado</span>}
        </div>
      </form>
    </div>
  )
}
