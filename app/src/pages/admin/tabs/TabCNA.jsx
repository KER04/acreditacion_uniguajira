import { useState } from 'react'
import { useData } from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'
import { statusFromScore, STATUS_LABELS, STATUS_COLOR, judgmentFromScore } from '../../../data/acreditacion'
import FileUpload from '../FileUpload'
import { usePestana } from '../../../hooks/useParametroURL'
import Plegable from '../Plegable'

/* ─── helpers ─────────────────────────────────────────────────── */
const SEDES_OPT = [['riohacha','Riohacha'],['maicao','Maicao'],['ambas','Ambas']]
const DOC_CATS = ['Evidencia','Anexo','Normativa','Acta','Informe','Encuesta','Estadísticas']

function SavedBadge({ show }) {
  return show ? (
    <span style={{ fontSize: 13, color: 'var(--ug-azul-deep)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 18, height: 18, borderRadius: 999, background: 'var(--ug-azul)', display: 'inline-grid', placeItems: 'center', color: 'var(--paper)', fontSize: 11 }}>✓</span>
      Guardado
    </span>
  ) : null
}

function useSave(ms = 2000) {
  const [saved, setSaved] = useState(false)
  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), ms) }
  return [saved, flash]
}

/* ─── Inline list editor (fortalezas / oportunidades) ─────────── */
function ListEditor({ label, items, onChange, placeholder }) {
  const [draft, setDraft] = useState('')

  const add = () => {
    if (!draft.trim()) return
    onChange([...items, draft.trim()])
    setDraft('')
  }
  const remove = i => onChange(items.filter((_, j) => j !== i))
  const edit = (i, v) => onChange(items.map((x, j) => j === i ? v : x))

  return (
    <div>
      <label style={{ fontSize: 12, color: 'var(--ink-3)', letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>{label}</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input value={item} onChange={e => edit(i, e.target.value)}
              style={{ flex: 1, padding: '8px 12px', border: '1px solid color-mix(in oklab, var(--ink) 15%, transparent)', borderRadius: 8, font: 'inherit', fontSize: 14, background: 'var(--paper)', color: 'var(--ink)' }} />
            <button type="button" className="icon-btn" style={{ width: 28, height: 28, color: 'var(--ug-flamingo)', flexShrink: 0 }} onClick={() => remove(i)}><Icons.trash /></button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={draft} onChange={e => setDraft(e.target.value)} placeholder={placeholder}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          style={{ flex: 1, padding: '8px 12px', border: '1px solid color-mix(in oklab, var(--ink) 15%, transparent)', borderRadius: 8, font: 'inherit', fontSize: 14, background: 'var(--paper)', color: 'var(--ink)' }} />
        <button type="button" className="btn ghost" style={{ padding: '6px 14px', fontSize: 13 }} onClick={add}>+ Agregar</button>
      </div>
    </div>
  )
}

/* ─── Tab bar ─────────────────────────────────────────────────── */
function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid color-mix(in oklab, var(--ink) 10%, transparent)', marginBottom: 24 }}>
      {tabs.map(([k, l]) => (
        <button key={k} onClick={() => onChange(k)}
          style={{ padding: '10px 18px', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', color: active === k ? 'var(--ink)' : 'var(--ink-3)', fontWeight: active === k ? 600 : 400, borderBottom: active === k ? '2px solid var(--ug-azul)' : '2px solid transparent', marginBottom: -2, transition: 'color .15s, border-color .15s' }}>
          {l}
        </button>
      ))}
    </div>
  )
}

/* ─── Info general del factor ─────────────────────────────────── */
function InfoTab({ factor, onSave }) {
  const [score, setScore] = useState(String(factor.score))
  const [summary, setSummary] = useState(factor.summary ?? '')
  const [fortalezas, setFortalezas] = useState(factor.fortalezas ?? [])
  const [oportunidades, setOportunidades] = useState(factor.oportunidades ?? [])
  const [presentacionUrl, setPresentacionUrl] = useState(factor.presentacionUrl ?? '')
  const [saved, flash] = useSave()

  const save = e => {
    e.preventDefault()
    const s = Math.min(5, Math.max(1, parseFloat(score) || factor.score))
    onSave({ score: s, summary, fortalezas, oportunidades, presentacionUrl })
    flash()
  }

  const st = statusFromScore(parseFloat(score) || factor.score)

  return (
    <form onSubmit={save}>
      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, marginBottom: 20 }}>
        <div>
          <label style={{ fontSize: 12, color: 'var(--ink-3)', letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Calificación (1.0 – 5.0)</label>
          <input type="number" min="1" max="5" step="0.1" value={score} onChange={e => setScore(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid color-mix(in oklab, var(--ink) 15%, transparent)', borderRadius: 10, font: 'inherit', fontSize: 22, fontWeight: 700, background: 'var(--paper)', color: 'var(--ink)', textAlign: 'center' }} />
        </div>
        <div style={{ padding: 16, borderRadius: 10, background: STATUS_COLOR[st], color: 'var(--ug-negro)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', opacity: .7 }}>Estado</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, marginTop: 4 }}>{STATUS_LABELS[st]}</div>
          <div style={{ fontSize: 13, marginTop: 2 }}>{judgmentFromScore(parseFloat(score) || factor.score)}</div>
        </div>
      </div>

      <div className="field" style={{ marginBottom: 16 }}>
        <label>Descripción general del factor</label>
        <textarea rows="4" value={summary} onChange={e => setSummary(e.target.value)} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <ListEditor label="Fortalezas identificadas" items={fortalezas} onChange={setFortalezas} placeholder="Nueva fortaleza…" />
      </div>

      <div style={{ marginBottom: 20 }}>
        <ListEditor label="Oportunidades de mejora" items={oportunidades} onChange={setOportunidades} placeholder="Nueva oportunidad…" />
      </div>

      <div style={{ marginBottom: 20 }}>
        <FileUpload
          tipo="presentacion"
          extra={{ factor: String(factor.n).padStart(2, '0') }}
          accept=".ppt,.pptx,.pdf"
          previewType="file"
          label="Subir presentación PowerPoint / PDF"
          currentUrl={presentacionUrl}
          onUploaded={url => setPresentacionUrl(url)}
        />
        <div className="field" style={{ marginTop: 10 }}>
          <label>URL de la presentación (editar manualmente si es necesario)</label>
          <input value={presentacionUrl} onChange={e => setPresentacionUrl(e.target.value)} placeholder="https://... o ruta relativa al archivo .pptx" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button className="btn accent" type="submit" style={{ padding: '10px 28px' }}>Guardar cambios <Icons.check /></button>
        <SavedBadge show={saved} />
      </div>
    </form>
  )
}

/* ─── Características del factor ──────────────────────────────── */
function CaracteristicasTab({ factor, onSave }) {
  const [items, setItems] = useState(factor.caracteristicas ?? [])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', score: '', desc: '', juicio: '' })
  const [saved, flash] = useSave()
  const f = (k, v) => setForm(x => ({ ...x, [k]: v }))

  const save = e => {
    e.preventDefault()
    const sc = Math.min(5, Math.max(1, parseFloat(form.score) || 3.0))
    const item = { name: form.name, score: sc, desc: form.desc, juicio: form.juicio || judgmentFromScore(sc) }
    let updated
    if (editing !== null) {
      updated = items.map((x, i) => i === editing ? { ...x, ...item } : x)
    } else {
      const maxN = items.reduce((a, x) => Math.max(a, x.n ?? 0), 0)
      updated = [...items, { ...item, n: maxN + 1 }]
    }
    setItems(updated)
    onSave({ caracteristicas: updated })
    flash()
    setEditing(null)
    setForm({ name: '', score: '', desc: '', juicio: '' })
  }

  const startEdit = (item, i) => {
    setEditing(i)
    setForm({ name: item.name, score: String(item.score), desc: item.desc ?? '', juicio: item.juicio ?? '' })
  }
  const remove = i => {
    const updated = items.filter((_, j) => j !== i)
    setItems(updated)
    onSave({ caracteristicas: updated })
  }

  return (
    <div>
      <div style={{ background: 'var(--paper)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 80px 140px auto', padding: '12px 20px', background: 'var(--paper-2)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
          <div>#</div><div>Característica</div><div>Punt.</div><div>Juicio</div><div></div>
        </div>
        {items.map((c, i) => {
          const st = statusFromScore(c.score)
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 80px 140px auto', padding: '14px 20px', alignItems: 'center', borderTop: '1px solid color-mix(in oklab, var(--ink) 7%, transparent)', gap: 14 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{String(c.n ?? i+1).padStart(2,'0')}</div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{c.name}</div>
                {c.desc && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.desc}</div>}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: STATUS_COLOR[st] }}>{c.score.toFixed(1)}</div>
              <span className="chip" style={{ fontSize: 10, background: `color-mix(in oklab, ${STATUS_COLOR[st]} 20%, transparent)` }}>{c.juicio || judgmentFromScore(c.score)}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => startEdit(c, i)}><Icons.edit /></button>
                <button className="icon-btn" style={{ width: 28, height: 28, color: 'var(--ug-flamingo)' }} onClick={() => remove(i)}><Icons.trash /></button>
              </div>
            </div>
          )
        })}
        {items.length === 0 && <div style={{ padding: '24px 20px', color: 'var(--ink-3)', fontSize: 14, textAlign: 'center' }}>Sin características. Agrega una abajo.</div>}
      </div>

      <Plegable id="tabcna-0" titulo={editing !== null ? `Editando característica ${editing + 1}` : 'Agregar característica'}>
        <form className="card" style={{ background: 'var(--paper-2)' }} onSubmit={save}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 12, marginBottom: 12 }}>
            <div className="field" style={{ margin: 0 }}><label>Nombre de la característica</label><input value={form.name} onChange={e => f('name', e.target.value)} required /></div>
            <div className="field" style={{ margin: 0 }}><label>Puntaje</label><input type="number" min="1" max="5" step="0.1" value={form.score} onChange={e => f('score', e.target.value)} required /></div>
          </div>
          <div className="field" style={{ marginBottom: 12 }}>
            <label>Juicio de cumplimiento (opcional — se calcula del puntaje si se deja vacío)</label>
            <select value={form.juicio} onChange={e => f('juicio', e.target.value)}>
              <option value="">— Automático según puntaje —</option>
              <option>Cumple Plenamente</option>
              <option>Cumple en Alto Grado</option>
              <option>Cumple Aceptablemente</option>
              <option>Cumple Insatisfactoriamente</option>
              <option>No Cumple</option>
            </select>
          </div>
          <div className="field" style={{ marginBottom: 14 }}><label>Descripción de hallazgos</label><textarea rows="3" value={form.desc} onChange={e => f('desc', e.target.value)} /></div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn accent" type="submit" style={{ padding: '8px 20px' }}>{editing !== null ? 'Guardar cambios' : 'Agregar'} <Icons.check /></button>
            {editing !== null && <button type="button" className="btn ghost" style={{ padding: '8px 16px' }} onClick={() => { setEditing(null); setForm({ name: '', score: '', desc: '', juicio: '' }) }}>Cancelar</button>}
            <SavedBadge show={saved} />
          </div>
        </form>
      </Plegable>
    </div>
  )
}

/* ─── Equipo del factor ───────────────────────────────────────── */
function EquipoTab({ factor, onSave }) {
  const empty = { n: '', cargo: '', rol: '', sede: 'riohacha', foto: '' }
  const [items, setItems] = useState(factor.equipo ?? [])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [saved, flash] = useSave()
  const f = (k, v) => setForm(x => ({ ...x, [k]: v }))

  const save = e => {
    e.preventDefault()
    let updated
    if (editing !== null) {
      updated = items.map((x, i) => i === editing ? { ...x, ...form } : x)
    } else {
      updated = [...items, { ...form }]
    }
    setItems(updated)
    onSave({ equipo: updated })
    flash()
    setEditing(null)
    setForm(empty)
  }

  const startEdit = (item, i) => { setEditing(i); setForm({ n: item.n, cargo: item.cargo ?? '', rol: item.rol ?? '', sede: item.sede ?? 'riohacha', foto: item.foto ?? '' }) }
  const remove = i => { const updated = items.filter((_, j) => j !== i); setItems(updated); onSave({ equipo: updated }) }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 20, background: 'var(--paper)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 80px 160px auto', padding: '12px 20px', background: 'var(--paper-2)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
          <div>Nombre</div><div>Cargo</div><div>Sede</div><div>Rol en el factor</div><div></div>
        </div>
        {items.map((p, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 80px 160px auto', padding: '14px 20px', alignItems: 'center', borderTop: '1px solid color-mix(in oklab, var(--ink) 7%, transparent)', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {p.foto
                ? <img src={p.foto} alt="" style={{ width: 36, height: 36, borderRadius: 999, objectFit: 'cover', background: 'var(--paper-3)', flexShrink: 0 }} />
                : <div style={{ width: 36, height: 36, borderRadius: 999, background: `color-mix(in oklab, ${factor.color ?? 'var(--ug-azul)'} 40%, var(--paper-2))`, flexShrink: 0, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ug-negro)' }}>
                    {p.n.split(' ').map(w => w[0]).filter(c => /[A-ZÁÉÍÓÚ]/.test(c)).slice(0,2).join('')}
                  </div>
              }
              <div style={{ fontWeight: 500, fontSize: 14 }}>{p.n}</div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>{p.cargo}</div>
            <span className="chip" style={{ fontSize: 10, background: 'color-mix(in oklab, var(--ug-marino) 15%, transparent)' }}>{p.sede ?? 'riohacha'}</span>
            <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>{p.rol}</div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => startEdit(p, i)}><Icons.edit /></button>
              <button className="icon-btn" style={{ width: 28, height: 28, color: 'var(--ug-flamingo)' }} onClick={() => remove(i)}><Icons.trash /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div style={{ padding: '24px 20px', color: 'var(--ink-3)', fontSize: 14, textAlign: 'center' }}>Sin integrantes. Agrega uno abajo.</div>}
      </div>

      <Plegable id="tabcna-1" titulo={editing !== null ? 'Editar integrante' : 'Agregar integrante'}>
        <form className="card" style={{ background: 'var(--paper-2)' }} onSubmit={save}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field" style={{ margin: 0 }}><label>Nombre completo</label><input value={form.n} onChange={e => f('n', e.target.value)} required /></div>
            <div className="field" style={{ margin: 0 }}><label>Cargo</label><input value={form.cargo} onChange={e => f('cargo', e.target.value)} /></div>
            <div className="field" style={{ margin: 0 }}><label>Rol en este factor</label><input value={form.rol} onChange={e => f('rol', e.target.value)} /></div>
            <div className="field" style={{ margin: 0 }}>
              <label>Sede</label>
              <select value={form.sede} onChange={e => f('sede', e.target.value)}>
                {SEDES_OPT.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <FileUpload
                tipo="docente-foto"
                accept="image/*"
                previewType="image"
                label="Foto (opcional)"
                currentUrl={form.foto}
                onUploaded={url => f('foto', url)}
              />
            </div>
            {form.foto && (
              <div className="field" style={{ margin: 0, gridColumn: '1 / -1' }}>
                <label>URL foto (editar manualmente si es necesario)</label>
                <input value={form.foto} onChange={e => f('foto', e.target.value)} placeholder="https://..." />
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center' }}>
            <button className="btn accent" type="submit" style={{ padding: '8px 20px' }}>{editing !== null ? 'Guardar' : 'Agregar'} <Icons.check /></button>
            {editing !== null && <button type="button" className="btn ghost" style={{ padding: '8px 16px' }} onClick={() => { setEditing(null); setForm(empty) }}>Cancelar</button>}
            <SavedBadge show={saved} />
          </div>
        </form>
      </Plegable>
    </div>
  )
}

/* ─── Evidencias y Anexos del factor ──────────────────────────── */
function DocumentosTab({ factor, onSave }) {
  const empty = { nombre: '', desc: '', fecha: '', url: '', cat: 'Evidencia' }
  const [items, setItems] = useState(factor.documentos ?? [])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [saved, flash] = useSave()
  const f = (k, v) => setForm(x => ({ ...x, [k]: v }))

  const save = e => {
    e.preventDefault()
    let updated
    if (editing !== null) {
      updated = items.map((x, i) => i === editing ? { ...form, id: x.id } : x)
    } else {
      updated = [...items, { ...form, id: Date.now() }]
    }
    setItems(updated)
    onSave({ documentos: updated })
    flash()
    setEditing(null)
    setForm(empty)
  }

  const startEdit = (item, i) => { setEditing(i); setForm({ nombre: item.nombre ?? item.t ?? '', desc: item.desc ?? item.d ?? '', fecha: item.fecha ?? item.f ?? '', url: item.url ?? '', cat: item.cat ?? 'Evidencia' }) }
  const remove = i => { const updated = items.filter((_, j) => j !== i); setItems(updated); onSave({ documentos: updated }) }

  const allItems = [...items]
  if (!factor.documentos?.length && factor.evidencias?.length) {
    factor.evidencias.forEach(ev => { if (!allItems.find(x => x.nombre === ev.t)) allItems.push({ ...ev, nombre: ev.t, desc: ev.d, fecha: ev.f, cat: 'Evidencia', id: ev.t }) })
  }

  const catColor = { Evidencia: 'var(--ug-azul)', Anexo: 'var(--ug-amarillo)', Normativa: 'var(--ug-flamingo)', Acta: 'var(--paper-3)', Informe: 'var(--ug-azul-soft)', Encuesta: 'var(--ug-amarillo-soft)', Estadísticas: 'var(--ug-flamingo-soft)' }

  return (
    <div>
      <div style={{ background: 'var(--paper)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 100px 80px auto', padding: '12px 20px', background: 'var(--paper-2)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
          <div>Categoría</div><div>Nombre</div><div>Descripción</div><div>Fecha</div><div>URL</div><div></div>
        </div>
        {allItems.map((doc, i) => (
          <div key={doc.id ?? i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 100px 80px auto', padding: '14px 20px', alignItems: 'center', borderTop: '1px solid color-mix(in oklab, var(--ink) 7%, transparent)', gap: 14 }}>
            <span className="chip" style={{ fontSize: 10, background: catColor[doc.cat] ?? 'var(--paper-2)', color: 'var(--ug-negro)', borderColor: 'transparent' }}>{doc.cat}</span>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{doc.nombre ?? doc.t}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{doc.desc ?? doc.d}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{doc.fecha ?? doc.f}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{doc.url ? '✓ URL' : '—'}</div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => startEdit(doc, i)}><Icons.edit /></button>
              <button className="icon-btn" style={{ width: 28, height: 28, color: 'var(--ug-flamingo)' }} onClick={() => remove(i)}><Icons.trash /></button>
            </div>
          </div>
        ))}
        {allItems.length === 0 && <div style={{ padding: '24px 20px', color: 'var(--ink-3)', fontSize: 14, textAlign: 'center' }}>Sin documentos. Agrega uno abajo.</div>}
      </div>

      <Plegable id="tabcna-2" titulo={editing !== null ? 'Editar documento' : 'Agregar documento'}>
        <form className="card" style={{ background: 'var(--paper-2)' }} onSubmit={save}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field" style={{ margin: 0 }}><label>Nombre del documento</label><input value={form.nombre} onChange={e => f('nombre', e.target.value)} required /></div>
            <div className="field" style={{ margin: 0 }}>
              <label>Categoría</label>
              <select value={form.cat} onChange={e => f('cat', e.target.value)}>
                {DOC_CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field" style={{ margin: 0 }}><label>Descripción</label><input value={form.desc} onChange={e => f('desc', e.target.value)} /></div>
            <div className="field" style={{ margin: 0 }}><label>Fecha</label><input value={form.fecha} onChange={e => f('fecha', e.target.value)} placeholder="ej. Abr 2026" /></div>
            <div style={{ gridColumn: '1 / -1' }}>
              <FileUpload
                tipo="factor-doc"
                extra={{ factor: String(factor.n).padStart(2, '0') }}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
                previewType="file"
                label="Subir archivo"
                currentUrl={form.url}
                onUploaded={url => f('url', url)}
              />
            </div>
            <div className="field" style={{ margin: 0, gridColumn: '1 / -1' }}>
              <label>URL de descarga (editar manualmente si es necesario)</label>
              <input value={form.url} onChange={e => f('url', e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center' }}>
            <button className="btn accent" type="submit" style={{ padding: '8px 20px' }}>{editing !== null ? 'Guardar' : 'Agregar'} <Icons.check /></button>
            {editing !== null && <button type="button" className="btn ghost" style={{ padding: '8px 16px' }} onClick={() => { setEditing(null); setForm(empty) }}>Cancelar</button>}
            <SavedBadge show={saved} />
          </div>
        </form>
      </Plegable>
    </div>
  )
}

/* ─── Metodología del factor ──────────────────────────────────── */
function MetodologiaTab({ factor, onSave }) {
  const [texto, setTexto] = useState(factor.metodologiaFactor ?? '')
  const [saved, flash] = useSave()

  const save = e => {
    e.preventDefault()
    onSave({ metodologiaFactor: texto })
    flash()
  }

  return (
    <form onSubmit={save}>
      <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 16 }}>
        Describe cómo se recopiló y analizó la información para este factor específico. Este texto aparecerá en la página pública del factor.
      </p>
      <div className="field" style={{ marginBottom: 20 }}>
        <label>Metodología aplicada al factor</label>
        <textarea rows="10" value={texto} onChange={e => setTexto(e.target.value)} placeholder="Describe las etapas de recolección de datos, los instrumentos utilizados, la triangulación de fuentes y el proceso de valoración para este factor…" />
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button className="btn accent" type="submit" style={{ padding: '10px 28px' }}>Guardar <Icons.check /></button>
        <SavedBadge show={saved} />
      </div>
    </form>
  )
}

/* ─── Editor completo de un factor ───────────────────────────── */
function FactorEditor({ factor, factores, update, onBack }) {
  const [innerTab, setInnerTab] = useState('info')

  const saveField = fields => {
    const updated = factores.map(f => f.n === factor.n ? { ...f, ...fields } : f)
    update('factores', updated)
  }

  const INNER_TABS = [
    ['info', 'Info general'],
    ['caracteristicas', 'Características'],
    ['equipo', 'Equipo'],
    ['documentos', 'Evidencias y Anexos'],
    ['metodologia', 'Metodología'],
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <button className="btn ghost" style={{ padding: '7px 16px', fontSize: 13 }} onClick={onBack}>← Factores</button>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.15em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>Factor {String(factor.n).padStart(2,'0')}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, letterSpacing: '-0.01em', marginTop: 2 }}>{factor.t}</div>
        </div>
        <div style={{ marginLeft: 'auto', padding: '8px 16px', background: factor.color ?? STATUS_COLOR[factor.status], borderRadius: 8, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: 'var(--ug-negro)' }}>
          {factor.score.toFixed(1)} · {STATUS_LABELS[factor.status]}
        </div>
      </div>

      <TabBar tabs={INNER_TABS} active={innerTab} onChange={setInnerTab} />

      {innerTab === 'info'           && <InfoTab           factor={factor} onSave={saveField} />}
      {innerTab === 'caracteristicas' && <CaracteristicasTab factor={factor} onSave={saveField} />}
      {innerTab === 'equipo'          && <EquipoTab          factor={factor} onSave={saveField} />}
      {innerTab === 'documentos'      && <DocumentosTab      factor={factor} onSave={saveField} />}
      {innerTab === 'metodologia'     && <MetodologiaTab     factor={factor} onSave={saveField} />}
    </div>
  )
}

/* ─── Vista de lista de factores ──────────────────────────────── */
function FactoresView({ factores, update }) {
  const [sel, setSel] = useState(null)

  if (sel !== null) {
    const factor = factores.find(f => f.n === sel)
    if (factor) return <FactorEditor factor={factor} factores={factores} update={update} onBack={() => setSel(null)} />
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 120px 120px auto', padding: '12px 20px', background: 'var(--paper-2)', borderRadius: '12px 12px 0 0', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
        <div>#</div><div>Factor</div><div>Calific.</div><div>Estado</div><div>Características</div><div></div>
      </div>
      <div style={{ background: 'var(--paper)', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
        {factores.map(f => {
          const st = statusFromScore(f.score)
          const color = STATUS_COLOR[st]
          return (
            <div key={f.n} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 120px 120px auto', padding: '16px 20px', alignItems: 'center', borderTop: '1px solid color-mix(in oklab, var(--ink) 7%, transparent)', gap: 14, transition: 'background .12s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-2)'}
              onMouseLeave={e => e.currentTarget.style.background = ''}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>{String(f.n).padStart(2,'0')}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{f.t}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{f.summary}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color }}>{f.score.toFixed(1)}</div>
              <span className="chip" style={{ fontSize: 10, background: color, color: 'var(--ug-negro)', borderColor: 'transparent' }}>{STATUS_LABELS[st]}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>{f.caracteristicas?.length ?? 0} caract.</span>
              <button className="btn ghost" style={{ padding: '6px 16px', fontSize: 13, whiteSpace: 'nowrap' }} onClick={() => setSel(f.n)}>
                <Icons.edit /> Editar
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Cronograma ──────────────────────────────────────────────── */
function CronogramaView({ cronograma, update }) {
  const [form, setForm] = useState({ d: '', t: '', s: 'next' })
  const [editing, setEditing] = useState(null)
  const [saved, flash] = useSave()

  const save = e => {
    e.preventDefault()
    let updated
    if (editing !== null) {
      updated = cronograma.map((x, i) => i === editing ? { ...form } : x)
      setEditing(null)
    } else {
      updated = [...cronograma, { ...form }]
    }
    update('cronograma_cna', updated)
    setForm({ d: '', t: '', s: 'next' })
    flash()
  }
  const remove = i => update('cronograma_cna', cronograma.filter((_, j) => j !== i))
  const startEdit = (step, i) => { setEditing(i); setForm({ d: step.d, t: step.t, s: step.s }) }
  const changeStatus = (i, s) => update('cronograma_cna', cronograma.map((x, j) => j === i ? { ...x, s } : x))

  const statusColor = { done: 'var(--ug-azul)', current: 'var(--ug-amarillo)', next: 'var(--paper-3)' }
  const statusLabel = { done: 'Completado', current: 'En curso', next: 'Pendiente' }

  return (
    <div>
      <div style={{ background: 'var(--paper)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
        {cronograma.map((step, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '36px 180px 1fr 160px auto', gap: 16, padding: '16px 20px', alignItems: 'center', borderBottom: '1px solid color-mix(in oklab, var(--ink) 7%, transparent)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 999, background: statusColor[step.s], border: step.s === 'next' ? '2px solid color-mix(in oklab, var(--ink) 20%, transparent)' : 'none', display: 'grid', placeItems: 'center', color: 'var(--ug-negro)', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700 }}>
              {step.s === 'done' ? '✓' : step.s === 'current' ? '●' : i + 1}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase' }}>{step.d}</div>
            <div style={{ fontSize: 15, fontWeight: step.s === 'current' ? 600 : 400 }}>{step.t}</div>
            <select value={step.s} onChange={e => changeStatus(i, e.target.value)}
              style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid color-mix(in oklab, var(--ink) 15%, transparent)', font: 'inherit', fontSize: 12, background: statusColor[step.s], color: 'var(--ug-negro)', cursor: 'pointer' }}>
              <option value="done">Completado</option>
              <option value="current">En curso</option>
              <option value="next">Pendiente</option>
            </select>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => startEdit(step, i)}><Icons.edit /></button>
              <button className="icon-btn" style={{ width: 28, height: 28, color: 'var(--ug-flamingo)' }} onClick={() => remove(i)}><Icons.trash /></button>
            </div>
          </div>
        ))}
        {cronograma.length === 0 && <div style={{ padding: '24px 20px', color: 'var(--ink-3)', fontSize: 14, textAlign: 'center' }}>Sin hitos. Agrega uno abajo.</div>}
      </div>

      <Plegable id="tabcna-3" titulo={editing !== null ? 'Editar hito' : 'Agregar hito al cronograma'}>
        <form className="card" style={{ background: 'var(--paper-2)' }} onSubmit={save}>
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 160px', gap: 12 }}>
            <div className="field" style={{ margin: 0 }}><label>Fecha</label><input value={form.d} onChange={e => setForm(f => ({ ...f, d: e.target.value }))} placeholder="ej. Jul 2026" required /></div>
            <div className="field" style={{ margin: 0 }}><label>Descripción</label><input value={form.t} onChange={e => setForm(f => ({ ...f, t: e.target.value }))} required /></div>
            <div className="field" style={{ margin: 0 }}>
              <label>Estado</label>
              <select value={form.s} onChange={e => setForm(f => ({ ...f, s: e.target.value }))}>
                <option value="done">Completado</option>
                <option value="current">En curso</option>
                <option value="next">Pendiente</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center' }}>
            <button className="btn accent" type="submit" style={{ padding: '8px 20px' }}>{editing !== null ? 'Guardar' : 'Agregar'} <Icons.check /></button>
            {editing !== null && <button type="button" className="btn ghost" style={{ padding: '8px 16px' }} onClick={() => { setEditing(null); setForm({ d: '', t: '', s: 'next' }) }}>Cancelar</button>}
            <SavedBadge show={saved} />
          </div>
        </form>
      </Plegable>
    </div>
  )
}

/* ─── Equipo general CNA ──────────────────────────────────────── */
function EquipoGeneralView({ equipo, update }) {
  const empty = { n: '', cargo: '', rol: '', color: 'var(--ug-azul)' }
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [saved, flash] = useSave()
  const f = (k, v) => setForm(x => ({ ...x, [k]: v }))

  const save = e => {
    e.preventDefault()
    let updated
    if (editing !== null) { updated = equipo.map((x, i) => i === editing ? { ...form } : x); setEditing(null) }
    else updated = [...equipo, { ...form }]
    update('equipo_cna', updated)
    setForm(empty)
    flash()
  }
  const remove = i => update('equipo_cna', equipo.filter((_, j) => j !== i))
  const startEdit = (p, i) => { setEditing(i); setForm({ n: p.n, cargo: p.cargo, rol: p.rol, color: p.color ?? 'var(--ug-azul)' }) }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: 'var(--paper)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
        {equipo.map((p, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 200px 1fr auto', padding: '14px 20px', alignItems: 'center', borderBottom: '1px solid color-mix(in oklab, var(--ink) 7%, transparent)', gap: 14 }}>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{p.n}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>{p.cargo}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>{p.rol}</div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => startEdit(p, i)}><Icons.edit /></button>
              <button className="icon-btn" style={{ width: 28, height: 28, color: 'var(--ug-flamingo)' }} onClick={() => remove(i)}><Icons.trash /></button>
            </div>
          </div>
        ))}
        {equipo.length === 0 && <div style={{ padding: '24px 20px', color: 'var(--ink-3)', textAlign: 'center' }}>Sin integrantes.</div>}
      </div>
      <Plegable id="tabcna-4" titulo={editing !== null ? 'Editar' : 'Agregar miembro al comité general'}>
        <form className="card" style={{ background: 'var(--paper-2)' }} onSubmit={save}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field" style={{ margin: 0 }}><label>Nombre</label><input value={form.n} onChange={e => f('n', e.target.value)} required /></div>
            <div className="field" style={{ margin: 0 }}><label>Cargo</label><input value={form.cargo} onChange={e => f('cargo', e.target.value)} /></div>
            <div className="field" style={{ margin: 0 }}><label>Rol en el proceso</label><input value={form.rol} onChange={e => f('rol', e.target.value)} /></div>
            <div className="field" style={{ margin: 0 }}>
              <label>Color</label>
              <select value={form.color} onChange={e => f('color', e.target.value)}>
                {[['var(--ug-azul)','Azul'],['var(--ug-amarillo)','Amarillo'],['var(--ug-flamingo)','Flamingo']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center' }}>
            <button className="btn accent" type="submit" style={{ padding: '8px 20px' }}>{editing !== null ? 'Guardar' : 'Agregar'} <Icons.check /></button>
            {editing !== null && <button type="button" className="btn ghost" style={{ padding: '8px 16px' }} onClick={() => { setEditing(null); setForm(empty) }}>Cancelar</button>}
            <SavedBadge show={saved} />
          </div>
        </form>
      </Plegable>
    </div>
  )
}

/* ─── Evidencias generales ────────────────────────────────────── */
function EvidenciasGeneralView({ evidencias, update }) {
  const empty = { t: '', d: '', f: '', size: '', url: '' }
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [saved, flash] = useSave()
  const ff = (k, v) => setForm(x => ({ ...x, [k]: v }))

  const save = e => {
    e.preventDefault()
    let updated
    if (editing !== null) { updated = evidencias.map((x, i) => i === editing ? { ...form } : x); setEditing(null) }
    else updated = [...evidencias, { ...form }]
    update('evidencias_cna', updated)
    setForm(empty)
    flash()
  }
  const remove = i => update('evidencias_cna', evidencias.filter((_, j) => j !== i))
  const startEdit = (ev, i) => { setEditing(i); setForm({ t: ev.t, d: ev.d, f: ev.f, size: ev.size ?? '', url: ev.url ?? '' }) }

  return (
    <div>
      <div style={{ background: 'var(--paper)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
        {evidencias.map((ev, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 80px auto', padding: '14px 20px', alignItems: 'center', borderBottom: '1px solid color-mix(in oklab, var(--ink) 7%, transparent)', gap: 14 }}>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{ev.t}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>{ev.d}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{ev.f}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{ev.size}</div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => startEdit(ev, i)}><Icons.edit /></button>
              <button className="icon-btn" style={{ width: 28, height: 28, color: 'var(--ug-flamingo)' }} onClick={() => remove(i)}><Icons.trash /></button>
            </div>
          </div>
        ))}
        {evidencias.length === 0 && <div style={{ padding: '24px 20px', color: 'var(--ink-3)', textAlign: 'center' }}>Sin evidencias generales.</div>}
      </div>
      <Plegable id="tabcna-5" titulo={editing !== null ? 'Editar' : 'Agregar evidencia general'}>
        <form className="card" style={{ background: 'var(--paper-2)' }} onSubmit={save}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field" style={{ margin: 0 }}><label>Título</label><input value={form.t} onChange={e => ff('t', e.target.value)} required /></div>
            <div className="field" style={{ margin: 0 }}><label>Descripción</label><input value={form.d} onChange={e => ff('d', e.target.value)} /></div>
            <div className="field" style={{ margin: 0 }}><label>Fecha</label><input value={form.f} onChange={e => ff('f', e.target.value)} /></div>
            <div className="field" style={{ margin: 0 }}><label>Tamaño</label><input value={form.size} onChange={e => ff('size', e.target.value)} placeholder="ej. 4.2 MB" /></div>
            <div className="field" style={{ margin: 0, gridColumn: '1 / -1' }}><label>URL de descarga</label><input value={form.url} onChange={e => ff('url', e.target.value)} placeholder="https://..." /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center' }}>
            <button className="btn accent" type="submit" style={{ padding: '8px 20px' }}>{editing !== null ? 'Guardar' : 'Agregar'} <Icons.check /></button>
            {editing !== null && <button type="button" className="btn ghost" style={{ padding: '8px 16px' }} onClick={() => { setEditing(null); setForm(empty) }}>Cancelar</button>}
            <SavedBadge show={saved} />
          </div>
        </form>
      </Plegable>
    </div>
  )
}

/* ─── Info sedes ──────────────────────────────────────────────── */
function SedesView({ data, update }) {
  const sr = data.info_sedes?.riohacha ?? {}
  const sm = data.info_sedes?.maicao ?? {}
  const [rh, setRh] = useState({ ...sr })
  const [mc, setMc] = useState({ ...sm })
  const [saved, flash] = useSave()

  const save = e => {
    e.preventDefault()
    update('info_sedes', { riohacha: rh, maicao: mc })
    flash()
  }

  return (
    <form onSubmit={save}>
      <div className="grid-2" style={{ marginBottom: 20 }}>
        {[[rh, setRh, 'Sede Riohacha'],[mc, setMc, 'Sede Maicao']].map(([val, setVal, title]) => (
          <div key={title} className="card" style={{ background: 'var(--paper-2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 14 }}>{title}</div>
            {[['nombre','Nombre oficial'],['direccion','Dirección'],['tel','Teléfono / Extensión'],['email','Correo electrónico'],['director','Director / Coordinador']].map(([k,l]) => (
              <div key={k} className="field" style={{ marginBottom: 12 }}>
                <label>{l}</label>
                <input value={val[k] ?? ''} onChange={e => setVal(v => ({ ...v, [k]: e.target.value }))} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button className="btn accent" type="submit" style={{ padding: '10px 28px' }}>Guardar sedes <Icons.check /></button>
        <SavedBadge show={saved} />
      </div>
    </form>
  )
}

/* ─── Main TabCNA ─────────────────────────────────────────────── */
const VIEWS = [
  ['factores',   'Los 12 factores'],
  ['cronograma', 'Cronograma'],
  ['equipo',     'Equipo CNA general'],
  ['evidencias', 'Evidencias generales'],
  ['sedes',      'Info de sedes'],
]

export default function TabCNA() {
  const { data, update } = useData()
  const [view, setView] = usePestana(VIEWS, { clave: 'sub' })

  const factores = (data.factores ?? []).map(f => ({
    ...f,
    status: statusFromScore(f.score),
    color: STATUS_COLOR[statusFromScore(f.score)],
  }))

  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>Acreditación CNA</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {VIEWS.map(([k, l]) => (
          <button key={k} className="chip" onClick={() => setView(k)}
            style={{ cursor: 'pointer', background: view === k ? 'var(--ug-marino)' : undefined, color: view === k ? 'var(--paper)' : undefined, borderColor: view === k ? 'transparent' : undefined }}>
            {l}
          </button>
        ))}
      </div>

      {view === 'factores'   && <FactoresView factores={factores} update={update} />}
      {view === 'cronograma' && <CronogramaView cronograma={data.cronograma_cna ?? []} update={update} />}
      {view === 'equipo'     && <EquipoGeneralView equipo={data.equipo_cna ?? []} update={update} />}
      {view === 'evidencias' && <EvidenciasGeneralView evidencias={data.evidencias_cna ?? []} update={update} />}
      {view === 'sedes'      && <SedesView data={data} update={update} />}
    </div>
  )
}
