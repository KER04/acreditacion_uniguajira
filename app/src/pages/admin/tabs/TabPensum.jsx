import { useState } from 'react'
import { useData } from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'
import RowActions from '../RowActions'

const TIPOS = ['Básica', 'Disciplinar', 'Complementaria', 'Electiva', 'Práctica', 'Grado']

export default function TabPensum() {
  const { data, update } = useData()
  const pensum = data.pensum ?? []
  const [selSem, setSelSem] = useState(1)
  const [form, setForm] = useState({ n: '', cr: '', tipo: 'Disciplinar' })
  const [saved, setSaved] = useState(false)

  const sem = pensum.find(s => s.semestre === selSem)
  const materias = sem?.materias ?? []

  const saveMateria = e => {
    e.preventDefault()
    const updated = pensum.map(s => {
      if (s.semestre !== selSem) return s
      return { ...s, materias: [...s.materias, { n: form.n, cr: Number(form.cr), tipo: form.tipo }] }
    })
    update('pensum', updated)
    setForm({ n: '', cr: '', tipo: 'Disciplinar' })
    setSaved(true); setTimeout(() => setSaved(false), 1500)
  }

  const removeMateria = idx => {
    const updated = pensum.map(s => {
      if (s.semestre !== selSem) return s
      return { ...s, materias: s.materias.filter((_, i) => i !== idx) }
    })
    update('pensum', updated)
  }

  const totalCr = materias.reduce((a, m) => a + Number(m.cr), 0)

  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>Plan de Estudios</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {pensum.map(s => (
          <button key={s.semestre} className="chip" onClick={() => setSelSem(s.semestre)}
            style={{ cursor: 'pointer', background: selSem === s.semestre ? 'var(--ug-marino)' : undefined, color: selSem === s.semestre ? 'var(--paper)' : undefined, borderColor: selSem === s.semestre ? 'transparent' : undefined }}>
            Sem {s.semestre}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600 }}>Semestre {selSem}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>{materias.length} materias · {totalCr} créditos</div>
        </div>
      </div>

      <div style={{ background: 'var(--paper)', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 120px auto', padding: '12px 20px', background: 'var(--paper-2)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
          <div>Materia</div><div>Cr.</div><div>Tipo</div><div></div>
        </div>
        {materias.map((m, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 120px auto', padding: '14px 20px', alignItems: 'center', borderTop: '1px solid color-mix(in oklab, var(--ink) 7%, transparent)', gap: 12 }}>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{m.n}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{m.cr}</div>
            <span className="chip" style={{ fontSize: 10 }}>{m.tipo}</span>
            <button className="icon-btn" style={{ width: 28, height: 28, color: 'var(--ug-flamingo)' }} onClick={() => removeMateria(i)} title="Eliminar"><Icons.trash /></button>
          </div>
        ))}
        {materias.length === 0 && <div style={{ padding: '24px 20px', color: 'var(--ink-3)', fontSize: 14, textAlign: 'center' }}>Sin materias en este semestre.</div>}
      </div>

      <form className="card" style={{ background: 'var(--paper-2)' }} onSubmit={saveMateria}>
        <div style={{ fontWeight: 600, marginBottom: 14 }}>Agregar materia</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 140px', gap: 12 }}>
          <div className="field" style={{ margin: 0 }}><label>Nombre</label><input value={form.n} onChange={e => setForm(f => ({ ...f, n: e.target.value }))} required /></div>
          <div className="field" style={{ margin: 0 }}><label>Créditos</label><input type="number" min="1" max="10" value={form.cr} onChange={e => setForm(f => ({ ...f, cr: e.target.value }))} required /></div>
          <div className="field" style={{ margin: 0 }}>
            <label>Tipo</label>
            <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
              {TIPOS.map(t => <option key={t}>{t}</option>)}
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
