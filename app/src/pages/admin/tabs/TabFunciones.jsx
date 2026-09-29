/* Panel — Funciones misionales: investigación.
 *
 * Edita los tres bloques de /investigacion —grupos, semilleros y producción—,
 * que viven en PostgreSQL desde la migración 019. Antes esta pestaña guardaba
 * en un JSON que la página pública ni siquiera leía: lo editado aquí solo se
 * veía en la portada.
 */
import { useState, useRef } from 'react'
import { usePestana } from '../../../hooks/useParametroURL'
import { useData, apiSubirPortadaProduccion, apiBorrarPortadaProduccion } from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'
import RowActions from '../RowActions'
import Plegable from '../Plegable'
import {
  CATEGORIAS_GRUPO, SEDES_CON_AMBAS, COLORES_TARJETA, TIPOS_PRODUCCION,
} from '../../../../shared/validacion'

const ETIQUETA_SEDE = { ambas: 'Ambas sedes', riohacha: 'Riohacha', maicao: 'Maicao' }

const SUBPESTANAS = [
  ['grupos', 'Grupos de investigación'],
  ['semilleros', 'Semilleros'],
  ['produccion', 'Producción'],
]

const fila = {
  display: 'grid', gap: 14, padding: '14px 0', alignItems: 'center',
  borderBottom: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)',
}

/* Las líneas se editan como un textarea y se guardan como TEXT[]. */
const aLista = s => String(s ?? '').split('\n').map(x => x.trim()).filter(Boolean)

/* El grupo es opcional. El vacío viaja como null: la columna es INTEGER y
   PostgreSQL rechaza ''. */
function SelectorGrupo({ valor, onChange, grupos }) {
  return (
    <select value={valor ?? ''} onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}>
      <option value="">— Sin grupo —</option>
      {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
    </select>
  )
}

function SelectorSede({ valor, onChange }) {
  return (
    <select value={valor} onChange={e => onChange(e.target.value)}>
      {SEDES_CON_AMBAS.map(s => <option key={s} value={s}>{ETIQUETA_SEDE[s]}</option>)}
    </select>
  )
}

function Botones({ editando, cancelar }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
      <button className="btn accent" type="submit" style={{ padding: '8px 20px' }}>{editando ? 'Guardar' : 'Agregar'} <Icons.check /></button>
      {editando && <button type="button" className="btn ghost" style={{ padding: '8px 16px' }} onClick={cancelar}>Cancelar</button>}
    </div>
  )
}

export default function TabFunciones() {
  const [tab, setTab] = usePestana(SUBPESTANAS, { clave: 'sub' })

  return (
    <div>
      <h3 style={{ marginBottom: 6 }}>Investigación</h3>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>
        Lo que se publica en <a href="#/investigacion" target="_blank" rel="noopener noreferrer">/investigacion</a> y
        las cifras de grupos y semilleros de la portada.
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {SUBPESTANAS.map(([k, l]) => (
          <button key={k} className="chip" onClick={() => setTab(k)}
            style={{ cursor: 'pointer', background: tab === k ? 'var(--ink)' : undefined, color: tab === k ? 'var(--paper)' : undefined }}>{l}</button>
        ))}
      </div>

      {tab === 'grupos' && <GruposPanel />}
      {tab === 'semilleros' && <SemillerosPanel />}
      {tab === 'produccion' && <ProduccionPanel />}
    </div>
  )
}

/* ─── Grupos ───────────────────────────────────────────────────── */

const GRUPO_VACIO = {
  nombre: '', nombre_completo: '', categoria: '', lineas: '', lider: '',
  sede: 'riohacha', descripcion: '', color: 'var(--ug-azul)', gruplac_url: '', orden: 0,
}

function GruposPanel() {
  const { data, addItem, removeItem, updateItem } = useData()
  const [form, setForm] = useState(GRUPO_VACIO)
  const [editando, setEditando] = useState(null)
  const f = (k, v) => setForm(x => ({ ...x, [k]: v }))

  const guardar = e => {
    e.preventDefault()
    const item = { ...form, lineas: aLista(form.lineas) }
    if (editando !== null) { updateItem('grupos', editando, item); setEditando(null) }
    else addItem('grupos', item)
    setForm(GRUPO_VACIO)
  }
  const editar = g => {
    setForm({
      nombre: g.nombre, nombre_completo: g.nombre_completo ?? '', categoria: g.categoria ?? '',
      lineas: (g.lineas ?? []).join('\n'), lider: g.lider ?? '', sede: g.sede ?? 'riohacha',
      descripcion: g.descripcion ?? '', color: g.color || 'var(--ug-azul)',
      gruplac_url: g.gruplac_url ?? '', orden: g.orden ?? 0,
    })
    setEditando(g.id)
  }
  const cancelar = () => { setForm(GRUPO_VACIO); setEditando(null) }

  const semilleros = data.semilleros ?? []
  const lista = data.grupos ?? []

  return (
    <>
      <Plegable id="tabfunciones-0" titulo={editando !== null ? 'Editar grupo' : 'Nuevo grupo de investigación'}>
        <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 24 }} onSubmit={guardar}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="field"><label>Sigla</label><input value={form.nombre} onChange={e => f('nombre', e.target.value)} required minLength={2} maxLength={60} placeholder="GITUG" /></div>
            <div className="field"><label>Nombre completo</label><input value={form.nombre_completo} onChange={e => f('nombre_completo', e.target.value)} maxLength={200} /></div>
            <div className="field"><label>Líder</label><input value={form.lider} onChange={e => f('lider', e.target.value)} maxLength={120} /></div>
            <div className="field">
              <label>Categoría MinCiencias</label>
              <select value={form.categoria} onChange={e => f('categoria', e.target.value)}>
                {CATEGORIAS_GRUPO.map(c => <option key={c} value={c}>{c === '' ? 'Sin categoría' : c}</option>)}
              </select>
            </div>
            <div className="field"><label>Sede</label><SelectorSede valor={form.sede} onChange={v => f('sede', v)} /></div>
            <div className="field">
              <label>Color de la tarjeta</label>
              <select value={form.color} onChange={e => f('color', e.target.value)}>
                {COLORES_TARJETA.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label>Ficha en GrupLAC</label>
              <input type="url" value={form.gruplac_url} onChange={e => f('gruplac_url', e.target.value)}
                     placeholder="https://scienti.minciencias.gov.co/gruplac/jsp/visualiza/visualizagr.jsp?nro=…" />
            </div>
            <div className="field"><label>Líneas de investigación (una por renglón)</label><textarea rows="3" value={form.lineas} onChange={e => f('lineas', e.target.value)} /></div>
            <div className="field"><label>Descripción</label><textarea rows="3" value={form.descripcion} onChange={e => f('descripcion', e.target.value)} maxLength={2000} /></div>
            <div className="field"><label>Orden</label><input type="number" min="0" max="999" value={form.orden} onChange={e => f('orden', e.target.value)} /></div>
          </div>
          <Botones editando={editando !== null} cancelar={cancelar} />
        </form>
      </Plegable>

      {lista.length === 0 && <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>Todavía no hay grupos publicados.</p>}
      {lista.map(g => {
        const n = semilleros.filter(s => s.grupo_id === g.id).length
        return (
          <div key={g.id} style={{ ...fila, gridTemplateColumns: '1fr 90px 110px 160px auto' }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{g.nombre}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                {n} {n === 1 ? 'semillero' : 'semilleros'}{g.gruplac_url ? '' : ' · sin enlace a GrupLAC'}
              </div>
            </div>
            <span className="chip" style={{ fontSize: 10 }}>{g.categoria || 'Sin cat.'}</span>
            <span className="chip" style={{ fontSize: 10, background: 'color-mix(in oklab, var(--ug-marino) 15%, transparent)' }}>{ETIQUETA_SEDE[g.sede]}</span>
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{g.lider}</span>
            <RowActions onEdit={() => editar(g)} onDelete={() => removeItem('grupos', g.id)} />
          </div>
        )
      })}
    </>
  )
}

/* ─── Semilleros ───────────────────────────────────────────────── */

const SEMILLERO_VACIO = {
  nombre: '', grupo_id: null, lider: '', sede: 'riohacha', descripcion: '', integrantes: '', orden: 0,
}

function SemillerosPanel() {
  const { data, addItem, removeItem, updateItem } = useData()
  const [form, setForm] = useState(SEMILLERO_VACIO)
  const [editando, setEditando] = useState(null)
  const f = (k, v) => setForm(x => ({ ...x, [k]: v }))

  const guardar = e => {
    e.preventDefault()
    if (editando !== null) { updateItem('semilleros', editando, { ...form }); setEditando(null) }
    else addItem('semilleros', { ...form })
    setForm(SEMILLERO_VACIO)
  }
  const editar = s => {
    setForm({
      nombre: s.nombre, grupo_id: s.grupo_id ?? null, lider: s.lider ?? '', sede: s.sede ?? 'riohacha',
      descripcion: s.descripcion ?? '', integrantes: s.integrantes ?? '', orden: s.orden ?? 0,
    })
    setEditando(s.id)
  }
  const cancelar = () => { setForm(SEMILLERO_VACIO); setEditando(null) }

  const grupos = data.grupos ?? []
  const lista = data.semilleros ?? []

  return (
    <>
      <Plegable id="tabfunciones-1" titulo={editando !== null ? 'Editar semillero' : 'Nuevo semillero'}>
        <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 24 }} onSubmit={guardar}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="field"><label>Nombre</label><input value={form.nombre} onChange={e => f('nombre', e.target.value)} required minLength={2} maxLength={120} /></div>
            <div className="field"><label>Líder</label><input value={form.lider} onChange={e => f('lider', e.target.value)} maxLength={120} /></div>
            <div className="field">
              <label>Grupo de investigación</label>
              <SelectorGrupo valor={form.grupo_id} onChange={v => f('grupo_id', v)} grupos={grupos} />
            </div>
            <div className="field"><label>Sede</label><SelectorSede valor={form.sede} onChange={v => f('sede', v)} /></div>
            <div className="field"><label>Integrantes</label><input type="number" min="0" max="500" value={form.integrantes} onChange={e => f('integrantes', e.target.value)} /></div>
            <div className="field"><label>Orden</label><input type="number" min="0" max="999" value={form.orden} onChange={e => f('orden', e.target.value)} /></div>
            <div className="field" style={{ gridColumn: '1 / -1' }}><label>Descripción</label><textarea rows="2" value={form.descripcion} onChange={e => f('descripcion', e.target.value)} maxLength={2000} /></div>
          </div>
          <Botones editando={editando !== null} cancelar={cancelar} />
        </form>
      </Plegable>

      {lista.length === 0 && <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>Todavía no hay semilleros publicados.</p>}
      {lista.map(s => (
        <div key={s.id} style={{ ...fila, gridTemplateColumns: '1fr 140px 110px 140px auto' }}>
          <div style={{ fontWeight: 500, fontSize: 14 }}>{s.nombre}</div>
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{s.grupo || 'Sin grupo'}</span>
          <span className="chip" style={{ fontSize: 10, background: 'color-mix(in oklab, var(--ug-marino) 15%, transparent)' }}>{ETIQUETA_SEDE[s.sede]}</span>
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{s.lider}</span>
          <RowActions onEdit={() => editar(s)} onDelete={() => removeItem('semilleros', s.id)} />
        </div>
      ))}
    </>
  )
}

/* ─── Producción ───────────────────────────────────────────────── */

/* Portada de una publicación. Se sube contra una publicación que ya existe
   (antes de guardarla no hay id al que colgarla), así que el botón vive en la
   fila y en el formulario solo cuando se está editando. `grande` es la
   versión del formulario, con vista previa en el formato de la cabecera. */
function BotonPortada({ pub, grande = false }) {
  const { recargar, setError } = useData()
  const entrada = useRef(null)
  const [subiendo, setSubiendo] = useState(false)

  const hacer = async accion => {
    setSubiendo(true)
    try { await accion(); await recargar('produccion') }
    catch (e) { setError(e.message) }
    finally { setSubiendo(false) }
  }
  const subir = archivo => archivo && hacer(() => apiSubirPortadaProduccion(pub.id, archivo))
  const quitar = () => hacer(() => apiBorrarPortadaProduccion(pub.id))

  const caja = grande
    ? { width: '100%', aspectRatio: '16 / 7', borderRadius: 12 }
    : { width: 64, height: 40, borderRadius: 8 }

  return (
    <div style={{ display: 'flex', alignItems: grande ? 'flex-start' : 'center', gap: 8, flexDirection: grande ? 'column' : 'row' }}>
      <button type="button" disabled={subiendo} onClick={() => entrada.current?.click()}
              title={pub.portada_url ? 'Cambiar portada' : 'Subir portada'}
              style={{
                ...caja, overflow: 'hidden', border: '1px dashed var(--borde)', background: 'var(--paper-3)',
                display: 'grid', placeItems: 'center', cursor: 'pointer', padding: 0, color: 'var(--ink-3)',
                opacity: subiendo ? .5 : 1,
              }}>
        {pub.portada_url
          ? <img src={pub.portada_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ display: 'grid', placeItems: 'center', gap: 4, fontSize: 12 }}>
              <Icons.camara />{grande && 'Subir portada (JPG, PNG o WEBP · máx. 3 MB)'}
            </span>}
      </button>
      {pub.portada_url && (
        grande
          ? <button type="button" className="btn ghost" style={{ padding: '6px 14px', fontSize: 13 }} onClick={quitar} disabled={subiendo}>Quitar portada</button>
          : <button type="button" className="icon-btn" style={{ width: 26, height: 26 }} onClick={quitar} disabled={subiendo} aria-label="Quitar portada"><Icons.close /></button>
      )}
      <input ref={entrada} type="file" accept=".jpg,.jpeg,.png,.webp" hidden
             onChange={e => { subir(e.target.files?.[0]); e.target.value = '' }} />
    </div>
  )
}

const PRODUCCION_VACIA = {
  titulo: '', tipo: 'Artículo', anio: new Date().getFullYear(), medio: '', autores: '',
  resumen: '', grupo_id: null, url: '', orden: 0,
}

function ProduccionPanel() {
  const { data, addItem, removeItem, updateItem } = useData()
  const [form, setForm] = useState(PRODUCCION_VACIA)
  const [editando, setEditando] = useState(null)
  const f = (k, v) => setForm(x => ({ ...x, [k]: v }))

  const guardar = e => {
    e.preventDefault()
    if (editando !== null) { updateItem('produccion', editando, { ...form }); setEditando(null) }
    else addItem('produccion', { ...form })
    setForm(PRODUCCION_VACIA)
  }
  const editar = p => {
    setForm({
      titulo: p.titulo, tipo: p.tipo ?? 'Artículo', anio: p.anio, medio: p.medio ?? '',
      autores: p.autores ?? '', resumen: p.resumen ?? '', grupo_id: p.grupo_id ?? null,
      url: p.url ?? '', orden: p.orden ?? 0,
    })
    setEditando(p.id)
  }
  const cancelar = () => { setForm(PRODUCCION_VACIA); setEditando(null) }

  const grupos = data.grupos ?? []
  const lista = data.produccion ?? []
  const enEdicion = editando !== null ? lista.find(p => p.id === editando) : null

  return (
    <>
      <Plegable id="tabfunciones-2" titulo={editando !== null ? 'Editar producto' : 'Nuevo producto de investigación'}>
        <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 24 }} onSubmit={guardar}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="field" style={{ gridColumn: '1 / -1' }}><label>Título</label><input value={form.titulo} onChange={e => f('titulo', e.target.value)} required minLength={3} maxLength={300} /></div>
            <div className="field">
              <label>Tipo</label>
              <select value={form.tipo} onChange={e => f('tipo', e.target.value)}>
                {TIPOS_PRODUCCION.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field"><label>Año</label><input type="number" min="1976" max="2100" value={form.anio} onChange={e => f('anio', e.target.value)} required /></div>
            <div className="field"><label>Medio (revista o evento)</label><input value={form.medio} onChange={e => f('medio', e.target.value)} maxLength={200} placeholder="Sensors · Q1" /></div>
            <div className="field">
              <label>Grupo</label>
              <SelectorGrupo valor={form.grupo_id} onChange={v => f('grupo_id', v)} grupos={grupos} />
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}><label>Autores</label><input value={form.autores} onChange={e => f('autores', e.target.value)} maxLength={400} /></div>
            <div className="field"><label>DOI o enlace</label><input type="url" value={form.url} onChange={e => f('url', e.target.value)} placeholder="https://doi.org/…" /></div>
            <div className="field"><label>Orden dentro del año</label><input type="number" min="0" max="999" value={form.orden} onChange={e => f('orden', e.target.value)} /></div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label>Resumen</label>
              <textarea rows="6" value={form.resumen} onChange={e => f('resumen', e.target.value)} maxLength={6000}
                        placeholder="De qué trata, qué se hizo y qué se encontró. Deja una línea en blanco para separar párrafos." />
              <small style={{ color: 'var(--ink-3)' }}>Se muestra en la página de la publicación y, recortado, en la lista de /investigacion. {form.resumen.length}/6000</small>
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label>Portada</label>
              {enEdicion
                ? <BotonPortada pub={enEdicion} grande />
                : <small style={{ color: 'var(--ink-3)' }}>Guarda primero la publicación; después podrás subirle la portada desde su fila o al editarla.</small>}
            </div>
          </div>
          <Botones editando={editando !== null} cancelar={cancelar} />
        </form>
      </Plegable>

      {lista.length === 0 && (
        <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>
          Sin producción cargada: la sección «Lo que publicamos» no se muestra en la página hasta que haya al menos una.
        </p>
      )}
      {lista.map(p => (
        <div key={p.id} style={{ ...fila, gridTemplateColumns: 'auto 60px 1fr 120px 100px auto' }}>
          <BotonPortada pub={p} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>{p.anio}</span>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>
              <a href={`#/investigacion/publicacion/${p.id}`} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>{p.titulo}</a>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
              {[p.medio, !p.url && 'sin enlace', !p.resumen && 'sin resumen'].filter(Boolean).join(' · ')}
            </div>
          </div>
          <span className="chip" style={{ fontSize: 10 }}>{p.tipo}</span>
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{p.grupo}</span>
          <RowActions onEdit={() => editar(p)} onDelete={() => removeItem('produccion', p.id)} />
        </div>
      ))}
    </>
  )
}
