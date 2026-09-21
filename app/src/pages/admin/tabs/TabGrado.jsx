/* Panel — Egresados / trámite de grado.
 *
 * Edita los tres bloques que nacen en este módulo: modalidades de grado,
 * normativas e ideas de investigación. Las modalidades estaban en Estudiantes
 * y se mudaron aquí con la vista pública: pertenecen al trámite de grado, no
 * a la vida del estudiante que todavía cursa.
 *
 * El cuarto bloque —las convocatorias de prácticas— se sigue editando en
 * Convocatorias, marcando la categoría «Prácticas». Aquí solo hay un aviso
 * que dice dónde, en vez de un segundo editor que acabaría dando dos
 * catálogos que se contradicen.
 */
import { useState } from 'react'
import { useData, apiSubirDocumento } from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'
import { usePestana } from '../../../hooks/useParametroURL'
import RowActions from '../RowActions'
import { useFormulario, Campo, Acciones } from '../../../components/formulario'
import {
  TIPOS_NORMATIVA, ESTADOS_IDEA, DIFICULTADES_IDEA,
  ANIO_NORMATIVA_MIN, ANIO_NORMATIVA_MAX, COLORES_TARJETA,
} from '../../../../shared/validacion'

const SUB = [
  ['modalidades', 'Modalidades de grado'],
  ['normativas', 'Normativas'],
  ['ideas', 'Ideas de investigación'],
]

const fila = {
  display: 'grid', gap: 12, padding: '12px 0', alignItems: 'center',
  borderBottom: '1px solid var(--borde)',
}

/* Las listas (palabras clave) se editan como líneas y se guardan como
   arreglo. La conversión ocurre en el borde, igual que en convocatorias. */
const aLista = s => String(s ?? '').split('\n').map(x => x.trim()).filter(Boolean)

/* Un select que admite "sin asignar". El valor vacío tiene que viajar como
   null, no como '': la columna es INTEGER y PostgreSQL rechaza la cadena. */
function SelectorOpcional({ valor, onChange, opciones, vacio }) {
  return (
    <select value={valor ?? ''} onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}>
      <option value="">{vacio}</option>
      {opciones.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
    </select>
  )
}

/* ─── Modalidades de grado ─────────────────────────────────────── */

/* En el formulario los requisitos son un textarea; en la base son TEXT[]. */
const normalizaModalidad = v => ({ ...v, requisitos: aLista(v.requisitos) })

const MODALIDAD_VACIA = {
  nombre: '', descripcion: '', requisitos: '', duracion: '', color: 'var(--ug-azul)',
}

function Modalidades() {
  const { data, addItem, removeItem, updateItem } = useData()
  const form = useFormulario('modalidades', MODALIDAD_VACIA, normalizaModalidad)
  const [editando, setEditando] = useState(null)

  const guardar = e => {
    e.preventDefault()
    if (!form.validarTodo()) return
    const payload = { ...normalizaModalidad(form.valores), nombre: form.valores.nombre.trim() }
    if (editando !== null) updateItem('modalidades_grado', editando, payload)
    else addItem('modalidades_grado', payload)
    form.reiniciar(); setEditando(null)
  }

  const editar = m => {
    form.reiniciar({
      nombre: m.nombre, descripcion: m.descripcion ?? '',
      requisitos: (m.requisitos ?? []).join('\n'),
      duracion: m.duracion ?? '', color: m.color ?? 'var(--ug-azul)',
    })
    setEditando(m.id)
  }

  const v = form.valores

  return (
    <>
      <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 20 }} onSubmit={guardar} noValidate>
        <div style={{ fontWeight: 600, marginBottom: 14 }}>
          {editando !== null ? 'Editar modalidad' : 'Agregar modalidad de grado'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Campo etiqueta="Nombre" error={form.error('nombre')}>
            <input value={v.nombre} onChange={e => form.set('nombre', e.target.value)} onBlur={() => form.alSalir('nombre')} />
          </Campo>
          <Campo etiqueta="Descripción" opcional error={form.error('descripcion')}>
            <textarea rows="2" value={v.descripcion} onChange={e => form.set('descripcion', e.target.value)} onBlur={() => form.alSalir('descripcion')} />
          </Campo>
          <Campo etiqueta="Requisitos (uno por línea)" opcional error={form.error('requisitos')}>
            <textarea rows="4" value={v.requisitos} onChange={e => form.set('requisitos', e.target.value)} onBlur={() => form.alSalir('requisitos')}
                      placeholder={'Haber aprobado 140 créditos\nPropuesta avalada por comité'} />
          </Campo>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Campo etiqueta="Duración" opcional error={form.error('duracion')}>
              <input value={v.duracion} onChange={e => form.set('duracion', e.target.value)} onBlur={() => form.alSalir('duracion')} placeholder="2 semestres" />
            </Campo>
            {/* El color tiñe la franja lateral de la tarjeta en la vista
                pública, así que se escoge de la paleta y no a mano. */}
            <Campo etiqueta="Color de la tarjeta">
              <select value={v.color} onChange={e => form.set('color', e.target.value)}>
                {COLORES_TARJETA.map(([val, l]) => <option key={val} value={val}>{l}</option>)}
              </select>
            </Campo>
          </div>
        </div>
        <Acciones editando={editando !== null} bloqueado={form.invalido}
                  onCancelar={() => { form.reiniciar(); setEditando(null) }} />
      </form>

      {(data.modalidades_grado ?? []).length === 0 ? (
        <div style={{ color: 'var(--ink-3)', fontSize: 14 }}>Todavía no hay modalidades registradas.</div>
      ) : (data.modalidades_grado ?? []).map(m => (
        <div key={m.id} style={{ ...fila, gridTemplateColumns: '14px 1fr 130px auto' }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: m.color || 'var(--ug-azul)' }} />
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{m.nombre}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>{m.descripcion}</div>
            {(m.requisitos ?? []).length > 0 && (
              <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                {m.requisitos.length} requisito(s)
              </div>
            )}
          </div>
          <span className="chip" style={{ fontSize: 10 }}>{m.duracion}</span>
          <RowActions onEdit={() => editar(m)} onDelete={() => removeItem('modalidades_grado', m.id)} />
        </div>
      ))}
    </>
  )
}

/* ─── Normativas ───────────────────────────────────────────────── */

const NORMATIVA_VACIA = {
  titulo: '', descripcion: '', tipo: 'Acuerdo', numero: '', anio: '',
  expedida_por: '', url: '', archivo_id: null, vigente: true, orden: 0,
}

function Normativas() {
  const { data, addItem, updateItem, removeItem } = useData()
  const [form, setForm] = useState(NORMATIVA_VACIA)
  const [editando, setEditando] = useState(null)
  const [subiendo, setSubiendo] = useState(false)
  const [avisoArchivo, setAvisoArchivo] = useState('')

  const f = (k, v) => setForm(x => ({ ...x, [k]: v }))

  const guardar = e => {
    e.preventDefault()
    /* El año viaja como número o como null; '' no es un INTEGER válido. */
    const item = { ...form, anio: form.anio === '' ? null : Number(form.anio) }
    if (editando !== null) { updateItem('normativas', editando, item); setEditando(null) }
    else addItem('normativas', item)
    setForm(NORMATIVA_VACIA)
    setAvisoArchivo('')
  }

  const editar = n => {
    setForm({
      titulo: n.titulo, descripcion: n.descripcion ?? '', tipo: n.tipo ?? 'Acuerdo',
      numero: n.numero ?? '', anio: n.anio ?? '', expedida_por: n.expedida_por ?? '',
      url: n.url ?? '', archivo_id: n.archivo_id ?? null,
      vigente: n.vigente !== false, orden: n.orden ?? 0,
    })
    setEditando(n.id)
    setAvisoArchivo(n.archivo_id ? 'Ya tiene un PDF cargado.' : '')
  }

  const cancelar = () => { setForm(NORMATIVA_VACIA); setEditando(null); setAvisoArchivo('') }

  /* El archivo se sube aparte y deja un `archivo_id`; la norma se guarda
     después con esa referencia. Así el PDF puede cambiarse sin reescribir
     el resto de la ficha. */
  const subir = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    setSubiendo(true)
    setAvisoArchivo('')
    try {
      const ficha = await apiSubirDocumento(file)
      f('archivo_id', ficha.archivo_id)
      setAvisoArchivo(`Cargado: ${ficha.nombre} (${ficha.peso}). Guarda para aplicarlo.`)
    } catch (err) {
      setAvisoArchivo('No se pudo subir: ' + err.message)
    } finally {
      setSubiendo(false)
      e.target.value = ''
    }
  }

  const lista = data.normativas ?? []

  return (
    <div>
      <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 24 }} onSubmit={guardar}>
        <div style={{ fontWeight: 600, marginBottom: 16 }}>
          {editando !== null ? 'Editar norma' : 'Nueva norma'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Título</label>
            <input value={form.titulo} onChange={e => f('titulo', e.target.value)} required minLength={3}
                   placeholder="Reglamento de trabajos de grado" />
          </div>

          <div className="field">
            <label>Tipo</label>
            <select value={form.tipo} onChange={e => f('tipo', e.target.value)}>
              {TIPOS_NORMATIVA.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Número</label>
            <input value={form.numero} onChange={e => f('numero', e.target.value)} placeholder="015 de 2019" />
          </div>

          <div className="field">
            <label>Año</label>
            <input type="number" value={form.anio} onChange={e => f('anio', e.target.value)}
                   min={ANIO_NORMATIVA_MIN} max={ANIO_NORMATIVA_MAX} placeholder="2019" />
          </div>
          <div className="field">
            <label>Expedida por</label>
            <input value={form.expedida_por} onChange={e => f('expedida_por', e.target.value)}
                   placeholder="Consejo Académico" />
          </div>

          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Descripción</label>
            <textarea rows="2" value={form.descripcion} onChange={e => f('descripcion', e.target.value)}
                      placeholder="En una línea: qué regula y a quién aplica" />
          </div>

          <div className="field">
            <label>Enlace externo (opcional)</label>
            <input value={form.url} onChange={e => f('url', e.target.value)} placeholder="https://..." />
          </div>

          <div className="field">
            <label>Documento PDF (opcional)</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ cursor: subiendo ? 'wait' : 'pointer', padding: '7px 14px', background: 'var(--paper)', border: '1px solid color-mix(in oklab, var(--ink) 15%, transparent)', borderRadius: 8, fontSize: 13 }}>
                {subiendo ? 'Subiendo…' : '📎 Subir PDF'}
                <input type="file" accept=".pdf,.doc,.docx" onChange={subir} disabled={subiendo} style={{ display: 'none' }} />
              </label>
              {form.archivo_id && (
                <button type="button" className="btn ghost" style={{ padding: '6px 12px', fontSize: 12 }}
                        onClick={() => { f('archivo_id', null); setAvisoArchivo('Se quitará el PDF al guardar.') }}>
                  Quitar
                </button>
              )}
            </div>
            {avisoArchivo && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>{avisoArchivo}</div>}
          </div>

          <div className="field">
            <label>Orden</label>
            <input type="number" value={form.orden} onChange={e => f('orden', Number(e.target.value))} min={0} max={999} />
          </div>
          <div className="field" style={{ display: 'flex', alignItems: 'end' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, textTransform: 'none', letterSpacing: 0 }}>
              <input type="checkbox" checked={form.vigente} onChange={e => f('vigente', e.target.checked)} />
              Vigente
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn accent" type="submit" style={{ padding: '8px 20px' }}>
            {editando !== null ? 'Guardar cambios' : 'Publicar'} <Icons.check />
          </button>
          {editando !== null && (
            <button type="button" className="btn ghost" style={{ padding: '8px 16px' }} onClick={cancelar}>Cancelar</button>
          )}
        </div>
      </form>

      {lista.length === 0 ? (
        <div style={{ color: 'var(--ink-3)', fontSize: 14 }}>Todavía no hay normativa registrada.</div>
      ) : lista.map(n => (
        <div key={n.id} style={{ display: 'grid', gridTemplateColumns: '1fr 130px 90px 60px auto', gap: 16, padding: '14px 0', borderBottom: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)', alignItems: 'center', opacity: n.vigente ? 1 : .55 }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{n.titulo}</div>
            {n.expedida_por && <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{n.expedida_por}</div>}
          </div>
          <span className="chip" style={{ fontSize: 10 }}>{n.referencia || n.tipo}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{n.anio ?? '—'}</span>
          <span style={{ fontSize: 11, color: n.archivo_id || n.url ? 'var(--ink-3)' : 'var(--ug-flamingo)' }}>
            {n.archivo_id ? 'PDF' : n.url ? 'enlace' : 'sin doc.'}
          </span>
          <RowActions onEdit={() => editar(n)} onDelete={() => removeItem('normativas', n.id)} />
        </div>
      ))}
    </div>
  )
}

/* ─── Ideas de investigación ───────────────────────────────────── */

const IDEA_VACIA = {
  titulo: '', descripcion: '', linea: '', docente_id: null, modalidad_id: null,
  estado: 'Disponible', dificultad: 'Intermedia', palabras: '', contacto: '', orden: 0,
}

function Ideas() {
  const { data, addItem, updateItem, removeItem } = useData()
  const [form, setForm] = useState(IDEA_VACIA)
  const [editando, setEditando] = useState(null)

  const f = (k, v) => setForm(x => ({ ...x, [k]: v }))

  const guardar = e => {
    e.preventDefault()
    const item = { ...form, palabras: aLista(form.palabras) }
    if (editando !== null) { updateItem('ideas_investigacion', editando, item); setEditando(null) }
    else addItem('ideas_investigacion', item)
    setForm(IDEA_VACIA)
  }

  const editar = i => {
    setForm({
      titulo: i.titulo, descripcion: i.descripcion ?? '', linea: i.linea ?? '',
      docente_id: i.docente_id ?? null, modalidad_id: i.modalidad_id ?? null,
      estado: i.estado ?? 'Disponible', dificultad: i.dificultad ?? 'Intermedia',
      palabras: (i.palabras ?? []).join('\n'), contacto: i.contacto ?? '', orden: i.orden ?? 0,
    })
    setEditando(i.id)
  }

  const cancelar = () => { setForm(IDEA_VACIA); setEditando(null) }

  const lista = data.ideas_investigacion ?? []
  const docentes = data.docentes ?? []
  const modalidades = data.modalidades_grado ?? []

  /* Las líneas ya usadas se ofrecen como sugerencia para que no acaben
     escritas de tres formas distintas, pero el campo sigue siendo libre:
     no hay catálogo de líneas y cada actualización curricular las cambia. */
  const lineasUsadas = [...new Set(lista.map(i => i.linea).filter(Boolean))].sort()

  return (
    <div>
      <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 24 }} onSubmit={guardar}>
        <div style={{ fontWeight: 600, marginBottom: 16 }}>
          {editando !== null ? 'Editar idea' : 'Nueva idea de investigación'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Título</label>
            <input value={form.titulo} onChange={e => f('titulo', e.target.value)} required minLength={3}
                   placeholder="Detección temprana de deserción con aprendizaje automático" />
          </div>

          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Descripción</label>
            <textarea rows="3" value={form.descripcion} onChange={e => f('descripcion', e.target.value)}
                      placeholder="Qué problema resuelve, con qué datos y qué se esperaría entregar" />
          </div>

          <div className="field">
            <label>Línea de investigación</label>
            <input list="lineas-idea" value={form.linea} onChange={e => f('linea', e.target.value)}
                   placeholder="Ingeniería de software" />
            <datalist id="lineas-idea">
              {lineasUsadas.map(l => <option key={l} value={l} />)}
            </datalist>
          </div>

          <div className="field">
            <label>Docente que la propone</label>
            <SelectorOpcional valor={form.docente_id} onChange={v => f('docente_id', v)}
                              opciones={docentes} vacio="Tutor por asignar" />
          </div>

          <div className="field">
            <label>Modalidad a la que apunta</label>
            <SelectorOpcional valor={form.modalidad_id} onChange={v => f('modalidad_id', v)}
                              opciones={modalidades} vacio="Cualquiera" />
          </div>

          <div className="field">
            <label>Contacto (opcional)</label>
            <input value={form.contacto} onChange={e => f('contacto', e.target.value)}
                   placeholder="correo@uniguajira.edu.co" />
          </div>

          <div className="field">
            <label>Estado</label>
            <select value={form.estado} onChange={e => f('estado', e.target.value)}>
              {ESTADOS_IDEA.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Dificultad</label>
            <select value={form.dificultad} onChange={e => f('dificultad', e.target.value)}>
              {DIFICULTADES_IDEA.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Palabras clave (una por línea)</label>
            <textarea rows="3" value={form.palabras} onChange={e => f('palabras', e.target.value)}
                      placeholder={'machine learning\ndeserción\nanalítica'} />
          </div>
          <div className="field">
            <label>Orden</label>
            <input type="number" value={form.orden} onChange={e => f('orden', Number(e.target.value))} min={0} max={999} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn accent" type="submit" style={{ padding: '8px 20px' }}>
            {editando !== null ? 'Guardar cambios' : 'Publicar'} <Icons.check />
          </button>
          {editando !== null && (
            <button type="button" className="btn ghost" style={{ padding: '8px 16px' }} onClick={cancelar}>Cancelar</button>
          )}
        </div>
      </form>

      {lista.length === 0 ? (
        <div style={{ color: 'var(--ink-3)', fontSize: 14 }}>Todavía no hay ideas publicadas.</div>
      ) : lista.map(i => (
        <div key={i.id} style={{ display: 'grid', gridTemplateColumns: '1fr 150px 110px 100px auto', gap: 16, padding: '14px 0', borderBottom: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{i.titulo}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
              {i.docente || 'Tutor por asignar'}
            </div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{i.linea || '—'}</span>
          <span className="chip" style={{ fontSize: 10 }}>{i.estado}</span>
          <span className="chip" style={{ fontSize: 10 }}>{i.dificultad}</span>
          <RowActions onEdit={() => editar(i)} onDelete={() => removeItem('ideas_investigacion', i.id)} />
        </div>
      ))}
    </div>
  )
}

/* ─── Pestaña ──────────────────────────────────────────────────── */

export default function TabGrado() {
  const { data } = useData()
  const [sub, setSub] = usePestana(SUB, { clave: 'sub' })

  const practicas = (data.convocatorias ?? []).filter(c => c.categoria === 'Prácticas').length

  return (
    <div>
      <h3 style={{ marginBottom: 6 }}>Egresados · trámite de grado</h3>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20, maxWidth: '70ch' }}>
        Alimenta la vista pública <strong>Egresados</strong>. Las modalidades de grado se editan
        aquí desde ahora —antes estaban en Estudiantes—. El cuarto bloque de esa página, las{' '}
        <strong>{practicas} convocatorias de prácticas</strong>, se sigue publicando en
        Convocatorias marcando la categoría «Prácticas».
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {SUB.map(([k, l]) => (
          <button key={k} className="chip" onClick={() => setSub(k)}
            style={{ cursor: 'pointer', background: sub === k ? 'var(--ink)' : undefined, color: sub === k ? 'var(--paper)' : undefined, borderColor: sub === k ? 'var(--ink)' : undefined }}>
            {l}
          </button>
        ))}
      </div>

      {sub === 'modalidades' && <Modalidades />}
      {sub === 'normativas' && <Normativas />}
      {sub === 'ideas' && <Ideas />}
    </div>
  )
}
