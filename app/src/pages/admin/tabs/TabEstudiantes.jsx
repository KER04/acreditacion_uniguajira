import { useState, useRef, useEffect } from 'react'
import { usePestana } from '../../../hooks/useParametroURL'
import {
  useData, apiSubirDocumento,
  apiSubirFotoHonor, apiBorrarFotoHonor,
  apiDocumentosHonor, apiSubirDocumentoHonor, apiBorrarDocumentoHonor,
} from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'
import RowActions from '../RowActions'
import Plegable from '../Plegable'
import PanelLista from '../PanelLista'
import { useFormulario, Campo, Acciones } from '../../../components/formulario'
import {
  validar, hayErrores, ESQUEMAS, ordinalSemestre,
  SEDES, SEDES_CON_AMBAS, TIPOS_CALENDARIO, TIPOS_DOCUMENTO, GRUPOS_DOCUMENTO,
  SEMESTRE_MIN, SEMESTRE_MAX, PROMEDIO_MIN, PROMEDIO_MAX,
  EXTENSIONES_ACEPTADAS,
} from '../../../../shared/validacion'

const ETIQUETA_SEDE = { ambas: 'Ambas sedes', riohacha: 'Riohacha', maicao: 'Maicao' }
const ETIQUETA_TIPO_CAL = {
  academico: 'Académico', administrativo: 'Administrativo',
  evaluacion: 'Evaluación', grado: 'Grado', otro: 'Otro',
}
const fila = {
  display: 'grid', gap: 12, padding: '12px 0', alignItems: 'center',
  borderBottom: '1px solid var(--borde)',
}

/* Fuera del componente: la lista es la misma que valida el parámetro de la
   URL, así que no puede vivir dentro del JSX. */
const SUBPESTANAS = [
  ['honor', 'Cuadro de honor'],
  ['calendario', 'Calendario'],
  ['documentos', 'Documentos'],
  ['reglamento', 'Reglamento'],
]

export default function TabEstudiantes() {
  const { data, addItem, removeItem, updateItem, recargar } = useData()
  const [tab, setTab] = usePestana(SUBPESTANAS, { clave: 'sub' })
  const props = { data, addItem, removeItem, updateItem, recargar }

  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>Estudiantes</h3>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20, maxWidth: '76ch' }}>
        Guarda en PostgreSQL, archivos incluidos. Cada campo se valida con las mismas reglas
        en el navegador y en el servidor, y la base tiene restricciones equivalentes como
        última red. En el cuadro de honor, <b>pulsa el círculo de cada estudiante para subir
        su foto de perfil</b>; con «Ver documentos» se adjuntan sus archivos propios.
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {SUBPESTANAS.map(([k, l]) => (
          <button key={k} className="chip" onClick={() => setTab(k)}
            style={{ cursor: 'pointer', background: tab === k ? 'var(--ink)' : undefined, color: tab === k ? 'var(--paper)' : undefined }}>{l}</button>
        ))}
      </div>

      {tab === 'honor' && <Honor {...props} />}
      {tab === 'calendario' && <Calendario {...props} />}
      {tab === 'documentos' && <Documentos {...props} />}
      {tab === 'reglamento' && <ReglamentoPanel />}
    </div>
  )
}

/* ─── Reglamento (migración 028) ───────────────────────────────── */

/* Documentos de /estudiantes?seccion=reglamento. La página abre en el visor
   el marcado como principal (o el primero) y lista el resto al lado. */
const CAMPOS_REGLAMENTO = [
  { k: 'titulo', l: 'Título', tipo: 'texto', requerido: true, placeholder: 'Reglamento estudiantil' },
  { k: 'referencia', l: 'Referencia (como se cita)', tipo: 'texto', placeholder: 'Acuerdo 026 de 2018' },
  { k: 'expedido_por', l: 'Expedido por', tipo: 'texto', placeholder: 'Consejo Superior' },
  { k: 'fecha', l: 'Fecha', tipo: 'fecha' },
  { k: 'descripcion', l: 'Descripción breve (se ve en la barra lateral)', tipo: 'area', ancho: true },
  { k: 'archivo_id', l: 'Documento (PDF)', tipo: 'archivo', ancho: true },
  { k: 'url', l: 'O enlace externo, si no se sube el PDF', tipo: 'url', ancho: true },
  { k: 'principal', l: 'Abrir este documento por defecto', tipo: 'check' },
  { k: 'orden', l: 'Orden', tipo: 'numero' },
]
const VACIO_REGLAMENTO = {
  titulo: '', referencia: '', expedido_por: '', fecha: '', descripcion: '',
  archivo_id: '', url: '', principal: false, orden: 0,
}

function ReglamentoPanel() {
  const tenue = { fontSize: 12, color: 'var(--ink-3)' }
  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16, maxWidth: '76ch' }}>
        Se publica en <a href="#/estudiantes?seccion=reglamento" target="_blank" rel="noopener noreferrer">Estudiantes → Reglamento</a>:
        el documento principal se muestra en un visor de PDF y los demás quedan en la barra lateral.
      </p>
      <PanelLista clave="reglamento" id="tabestudiantes-reglamento" titulos={['Nuevo documento', 'Editar documento']}
        campos={CAMPOS_REGLAMENTO} vacio={VACIO_REGLAMENTO} columnas="1fr 160px 110px auto"
        vacioTexto="Todavía no hay documentos cargados."
        resumen={d => (<>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{d.titulo}{d.principal ? ' · principal' : ''}</div>
            <div style={tenue}>{d.referencia}</div>
          </div>
          <span style={tenue}>{d.expedido_por || '—'}</span>
          <span style={{ ...tenue, color: d.enlace ? undefined : 'var(--ug-flamingo)' }}>
            {d.archivo_id ? 'PDF' : d.url ? 'Enlace' : 'Sin documento'}
          </span>
        </>)} />
    </div>
  )
}

/* ─── Cuadro de honor ──────────────────────────────────────────── */

function Honor({ data, addItem, removeItem, updateItem, recargar }) {
  const vacio = { nombre: '', promedio: '', semestre: '', periodo: '', sede: 'riohacha' }
  const form = useFormulario('honor', vacio)
  const [editando, setEditando] = useState(null)
  const [fichaAbierta, setFichaAbierta] = useState(null)

  const guardar = e => {
    e.preventDefault()
    if (!form.validarTodo()) return
    const v = form.valores
    const payload = {
      nombre: v.nombre.trim(),
      // Numeros de verdad: la columna es NUMERIC y SMALLINT, no texto.
      promedio: Number(String(v.promedio).replace(',', '.')),
      semestre: v.semestre === '' ? null : Number(v.semestre),
      periodo: v.periodo.trim(),
      sede: v.sede,
    }
    if (editando !== null) updateItem('honor', editando, payload)
    else addItem('honor', payload)
    form.reiniciar(); setEditando(null)
  }

  const editar = h => {
    form.reiniciar({
      nombre: h.nombre, promedio: String(h.promedio),
      semestre: h.semestre === null || h.semestre === undefined ? '' : String(h.semestre),
      periodo: h.periodo ?? '', sede: h.sede ?? 'riohacha',
    })
    setEditando(h.id)
  }

  const v = form.valores

  return (
    <>
      <Plegable id="tabestudiantes-0" titulo={editando !== null ? 'Editar entrada' : 'Nueva entrada'}>
        <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 24 }} onSubmit={guardar} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Campo etiqueta="Nombre" error={form.error('nombre')}>
              <input value={v.nombre} onChange={e => form.set('nombre', e.target.value)} onBlur={() => form.alSalir('nombre')}
                     placeholder="Solo letras" autoComplete="off" />
            </Campo>
            <Campo etiqueta="Promedio" error={form.error('promedio')}>
              <input type="number" inputMode="decimal" step="0.01" min={PROMEDIO_MIN} max={PROMEDIO_MAX}
                     value={v.promedio} onChange={e => form.set('promedio', e.target.value)} onBlur={() => form.alSalir('promedio')}
                     placeholder={`${PROMEDIO_MIN.toFixed(1)} – ${PROMEDIO_MAX.toFixed(1)}`} />
            </Campo>
            <Campo etiqueta="Semestre" opcional error={form.error('semestre')}>
              <select value={v.semestre} onChange={e => form.set('semestre', e.target.value)} onBlur={() => form.alSalir('semestre')}>
                <option value="">— sin definir —</option>
                {Array.from({ length: SEMESTRE_MAX - SEMESTRE_MIN + 1 }, (_, i) => i + SEMESTRE_MIN).map(n => (
                  <option key={n} value={n}>{ordinalSemestre(n)}</option>
                ))}
              </select>
            </Campo>
            <Campo etiqueta="Período" opcional error={form.error('periodo')}>
              <input value={v.periodo} onChange={e => form.set('periodo', e.target.value)} onBlur={() => form.alSalir('periodo')}
                     placeholder="2026-I" />
            </Campo>
            <Campo etiqueta="Sede" error={form.error('sede')}>
              <select value={v.sede} onChange={e => form.set('sede', e.target.value)}>
                {SEDES.map(s => <option key={s} value={s}>{ETIQUETA_SEDE[s]}</option>)}
              </select>
            </Campo>
          </div>
          <Acciones editando={editando !== null} bloqueado={form.invalido}
                    onCancelar={() => { form.reiniciar(); setEditando(null) }} />
        </form>
      </Plegable>

      {(data.honor ?? []).map(h => (
        <div key={h.id}>
          <div style={{ ...fila, gridTemplateColumns: '44px 1fr 80px 60px 90px 90px 120px auto' }}>
            {/* Pulsar el avatar sube o cambia la foto de perfil. */}
            <AvatarSubible estudiante={h} onCambiada={() => recargar('honor')} />
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{h.nombre}</div>
              {!h.foto_url && (
                <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2 }}>
                  Sin foto · pulsa el círculo para subirla
                </div>
              )}
            </div>
            <span className="chip" style={{ fontSize: 10 }}>{h.promedio}</span>
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{ordinalSemestre(h.semestre)}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{h.periodo}</span>
            <span className="chip" style={{ fontSize: 10 }}>{ETIQUETA_SEDE[h.sede] ?? h.sede}</span>
            <button type="button" className="chip" style={{ cursor: 'pointer', fontSize: 11 }}
                    onClick={() => setFichaAbierta(fichaAbierta === h.id ? null : h.id)}>
              {fichaAbierta === h.id ? 'Cerrar' : 'Ver documentos'}
            </button>
            <RowActions onEdit={() => editar(h)} onDelete={() => removeItem('honor', h.id)} />
          </div>
          {fichaAbierta === h.id && (
            <FichaDestacado estudiante={h} onFotoCambiada={() => recargar('honor')} />
          )}
        </div>
      ))}
    </>
  )
}

/* ─── Ficha de un destacado: foto y documentos propios ─────────── */

export function iniciales(nombre) {
  return String(nombre ?? '').split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

function Avatar({ estudiante, size = 40 }) {
  const comun = {
    width: size, height: size, borderRadius: 999, flex: 'none',
    display: 'grid', placeItems: 'center', overflow: 'hidden',
  }
  if (estudiante.foto_url) {
    return <img src={estudiante.foto_url} alt={estudiante.nombre} style={{ ...comun, objectFit: 'cover' }} />
  }
  return (
    <div style={{ ...comun, background: 'var(--ug-azul-soft)', color: 'var(--ug-marino)', fontWeight: 700, fontSize: size * 0.34 }}>
      {iniciales(estudiante.nombre)}
    </div>
  )
}

/* El avatar de la lista ES el control de subida: pulsarlo abre el selector de
   archivos. Antes la foto vivía escondida detrás de un chip y no se encontraba. */
function AvatarSubible({ estudiante, size = 44, onCambiada }) {
  const input = useRef(null)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')

  const elegir = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(''); setSubiendo(true)
    try {
      onCambiada(await apiSubirFotoHonor(estudiante.id, file))
    } catch (err) {
      setError(err.message)
    } finally {
      setSubiendo(false)
      if (input.current) input.current.value = ''
    }
  }

  const sinFoto = !estudiante.foto_url

  return (
    <div style={{ position: 'relative' }}>
      <button type="button" className="avatar-subir" data-sin-foto={sinFoto} disabled={subiendo}
              onClick={() => input.current?.click()}
              title={(sinFoto ? 'Subir foto de ' : 'Cambiar foto de ') + estudiante.nombre}
              aria-label={(sinFoto ? 'Subir foto de ' : 'Cambiar foto de ') + estudiante.nombre}>
        <Avatar estudiante={estudiante} size={size} />
        <span className="marca" aria-hidden>
          {subiendo ? <span style={{ fontSize: 10, fontWeight: 600 }}>…</span> : <Icons.camara size={size * 0.42} />}
        </span>
      </button>
      <input ref={input} type="file" accept=".jpg,.jpeg,.png,.webp" style={{ display: 'none' }} onChange={elegir} />
      {error && (
        <div role="alert" className="mensaje-error" style={{ position: 'absolute', top: '100%', left: 0, width: 220, zIndex: 5 }}>
          {error}
        </div>
      )}
    </div>
  )
}

function FichaDestacado({ estudiante, onFotoCambiada }) {
  const [docs, setDocs] = useState(null)
  const [ocupado, setOcupado] = useState('')
  const [error, setError] = useState('')
  const inputFoto = useRef(null)
  const inputDoc = useRef(null)

  useEffect(() => {
    let vivo = true
    apiDocumentosHonor(estudiante.id)
      .then(l => { if (vivo) setDocs(l) })
      .catch(e => { if (vivo) { setError(e.message); setDocs([]) } })
    return () => { vivo = false }
  }, [estudiante.id])

  const conAccion = async (etiqueta, fn) => {
    setError(''); setOcupado(etiqueta)
    try { await fn() } catch (e) { setError(e.message) } finally { setOcupado('') }
  }

  const subirFoto = e => {
    const file = e.target.files?.[0]
    if (!file) return
    conAccion('foto', async () => {
      const actualizado = await apiSubirFotoHonor(estudiante.id, file)
      onFotoCambiada(actualizado)
    }).finally(() => { if (inputFoto.current) inputFoto.current.value = '' })
  }

  const quitarFoto = () => conAccion('foto', async () => {
    onFotoCambiada(await apiBorrarFotoHonor(estudiante.id))
  })

  const subirDoc = e => {
    const file = e.target.files?.[0]
    if (!file) return
    conAccion('doc', async () => {
      const creado = await apiSubirDocumentoHonor(estudiante.id, file)
      setDocs(d => [...(d ?? []), creado])
    }).finally(() => { if (inputDoc.current) inputDoc.current.value = '' })
  }

  const borrarDoc = id => conAccion('doc', async () => {
    await apiBorrarDocumentoHonor(id)
    setDocs(d => (d ?? []).filter(x => x.id !== id))
  })

  return (
    <div style={{
      gridColumn: '1 / -1', background: 'var(--paper)', border: '1px solid var(--borde)',
      borderRadius: 'var(--radius)', padding: 20, marginTop: 4, marginBottom: 12,
      display: 'grid', gridTemplateColumns: '180px 1fr', gap: 24, alignItems: 'start',
    }}>
      {/* Foto */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'grid', placeItems: 'center' }}>
          <Avatar estudiante={estudiante} size={120} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          <button type="button" className="btn ghost" style={{ padding: '8px 14px', fontSize: 13, justifyContent: 'center' }}
                  disabled={ocupado === 'foto'} onClick={() => inputFoto.current?.click()}>
            <Icons.upload /> {ocupado === 'foto' ? 'Subiendo…' : estudiante.foto_url ? 'Cambiar foto' : 'Subir foto'}
          </button>
          {estudiante.foto_url && (
            <button type="button" className="btn ghost" style={{ padding: '6px 12px', fontSize: 12, justifyContent: 'center', color: 'var(--ug-flamingo-deep)', borderColor: 'var(--ug-flamingo)' }}
                    disabled={ocupado === 'foto'} onClick={quitarFoto}>
              Quitar foto
            </button>
          )}
          <input ref={inputFoto} type="file" accept=".jpg,.jpeg,.png,.webp" style={{ display: 'none' }} onChange={subirFoto} />
          <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>JPG, PNG o WEBP · máx. 3 MB</div>
        </div>
      </div>

      {/* Documentos del estudiante */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <div className="eyebrow">Documentos de {estudiante.nombre.split(' ')[0]}</div>
          <button type="button" className="btn accent" style={{ padding: '7px 14px', fontSize: 13 }}
                  disabled={ocupado === 'doc'} onClick={() => inputDoc.current?.click()}>
            <Icons.upload /> {ocupado === 'doc' ? 'Subiendo…' : 'Añadir documento'}
          </button>
          <input ref={inputDoc} type="file" style={{ display: 'none' }} onChange={subirDoc}
                 accept={EXTENSIONES_ACEPTADAS.map(x => '.' + x).join(',')} />
        </div>

        {error && <div role="alert" className="mensaje-error" style={{ marginBottom: 10 }}>{error}</div>}

        {docs === null && <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Cargando documentos…</div>}
        {docs?.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
            Sin documentos todavía. El nombre y el peso se toman del archivo que subas.
          </div>
        )}
        {docs?.map(d => (
          <div key={d.id} style={{ ...fila, gridTemplateColumns: '1fr 60px 80px auto', padding: '10px 0' }}>
            <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: 'var(--accent-deep)' }}>
              {d.nombre}
            </a>
            <span className="chip" style={{ fontSize: 10 }}>{d.tipo}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{d.peso}</span>
            <button type="button" className="icon-btn" style={{ width: 28, height: 28, color: 'var(--ug-flamingo)' }}
                    title="Eliminar" disabled={ocupado === 'doc'} onClick={() => borrarDoc(d.id)}>
              <Icons.trash />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Calendario académico ─────────────────────────────────────── */

/* El formulario guarda '' cuando no hay fecha final; el esquema y la columna
   esperan null. */
const normalizaCalendario = v => ({ ...v, fecha_fin: v.fecha_fin === '' ? null : v.fecha_fin })

function Calendario({ data, addItem, removeItem, updateItem }) {
  const vacio = { titulo: '', fecha_inicio: '', fecha_fin: '', tipo: 'academico', periodo: '', sede: 'ambas', destacado: false }
  const form = useFormulario('calendario', vacio, normalizaCalendario)
  const [editando, setEditando] = useState(null)

  const guardar = e => {
    e.preventDefault()
    if (!form.validarTodo()) return
    const v = form.valores
    const payload = { ...normalizaCalendario(v), titulo: v.titulo.trim(), periodo: v.periodo.trim() }
    if (editando !== null) updateItem('calendario', editando, payload)
    else addItem('calendario', payload)
    form.reiniciar(); setEditando(null)
  }

  const editar = ev => {
    form.reiniciar({
      titulo: ev.titulo, fecha_inicio: ev.fecha_inicio, fecha_fin: ev.fecha_fin ?? '',
      tipo: ev.tipo, periodo: ev.periodo ?? '', sede: ev.sede ?? 'ambas', destacado: !!ev.destacado,
    })
    setEditando(ev.id)
  }

  const v = form.valores

  return (
    <>
      <Plegable id="tabestudiantes-1" titulo={editando !== null ? 'Editar evento' : 'Agregar evento'}>
        <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 20 }} onSubmit={guardar} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 160px', gap: 12 }}>
            <Campo etiqueta="Evento" error={form.error('titulo')}>
              <input value={v.titulo} onChange={e => form.set('titulo', e.target.value)} onBlur={() => form.alSalir('titulo')} />
            </Campo>
            <Campo etiqueta="Desde" error={form.error('fecha_inicio')}>
              <input type="date" value={v.fecha_inicio} onChange={e => form.set('fecha_inicio', e.target.value)} onBlur={() => form.alSalir('fecha_inicio')} />
            </Campo>
            <Campo etiqueta="Hasta" opcional error={form.error('fecha_fin')}>
              <input type="date" value={v.fecha_fin ?? ''} min={v.fecha_inicio || undefined}
                     onChange={e => form.set('fecha_fin', e.target.value)} onBlur={() => form.alSalir('fecha_fin')} />
            </Campo>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '170px 170px 130px 1fr', gap: 12, marginTop: 12, alignItems: 'start' }}>
            <Campo etiqueta="Tipo" error={form.error('tipo')}>
              <select value={v.tipo} onChange={e => form.set('tipo', e.target.value)}>
                {TIPOS_CALENDARIO.map(t => <option key={t} value={t}>{ETIQUETA_TIPO_CAL[t]}</option>)}
              </select>
            </Campo>
            <Campo etiqueta="Sede" error={form.error('sede')}>
              <select value={v.sede} onChange={e => form.set('sede', e.target.value)}>
                {SEDES_CON_AMBAS.map(s => <option key={s} value={s}>{ETIQUETA_SEDE[s]}</option>)}
              </select>
            </Campo>
            <Campo etiqueta="Período" opcional error={form.error('periodo')}>
              <input value={v.periodo} onChange={e => form.set('periodo', e.target.value)} onBlur={() => form.alSalir('periodo')} placeholder="2026-II" />
            </Campo>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, paddingTop: 28 }}>
              <input type="checkbox" checked={v.destacado} onChange={e => form.set('destacado', e.target.checked)} style={{ width: 'auto' }} />
              Destacar en la línea de tiempo
            </label>
          </div>
          <Acciones editando={editando !== null} bloqueado={form.invalido}
                    onCancelar={() => { form.reiniciar(); setEditando(null) }} />
        </form>
      </Plegable>

      {(data.calendario ?? []).map(ev => (
        <div key={ev.id} style={{ ...fila, gridTemplateColumns: '150px 1fr 120px 90px auto' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>{ev.etiqueta_fecha ?? ev.fecha_inicio}</span>
          <span style={{ fontSize: 14, fontWeight: ev.destacado ? 600 : 400 }}>{ev.titulo}</span>
          <span className="chip" style={{ fontSize: 10 }}>{ETIQUETA_TIPO_CAL[ev.tipo] ?? ev.tipo}</span>
          <span className="chip" style={{ fontSize: 10 }}>{ETIQUETA_SEDE[ev.sede] ?? ev.sede}</span>
          <RowActions onEdit={() => editar(ev)} onDelete={() => removeItem('calendario', ev.id)} />
        </div>
      ))}
    </>
  )
}

/* ─── Documentos ───────────────────────────────────────────────── */

function Documentos({ data, addItem, removeItem, updateItem }) {
  // archivo_id apunta al adjunto guardado en la base; url queda para enlaces externos.
  const vacio = { nombre: '', descripcion: '', url: '', tipo: 'PDF', grupo: GRUPOS_DOCUMENTO[0], peso: '', archivo_id: null }
  const form = useFormulario('documentos', vacio)
  const [editando, setEditando] = useState(null)
  const [subiendo, setSubiendo] = useState(false)
  const [errorSubida, setErrorSubida] = useState('')
  const [archivo, setArchivo] = useState(null)
  const inputArchivo = useRef(null)

  /* El servidor guarda el archivo y devuelve nombre, tipo y peso ya deducidos;
     se vuelcan en el formulario para que solo haya que confirmarlos. */
  const alElegirArchivo = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    setErrorSubida(''); setSubiendo(true)
    try {
      const meta = await apiSubirDocumento(file)
      form.reiniciar({
        ...form.valores,
        // Un nombre ya escrito a mano tiene prioridad sobre el del archivo.
        nombre: form.valores.nombre.trim() || meta.nombre,
        url: meta.url,
        tipo: meta.tipo,
        peso: meta.peso,
        archivo_id: meta.archivo_id,
      })
      setArchivo({ original: meta.archivo_original, url: meta.url, peso: meta.peso })
    } catch (err) {
      setErrorSubida(err.message)
      setArchivo(null)
    } finally {
      setSubiendo(false)
      // Deja volver a elegir el mismo archivo si hubo que reintentar.
      if (inputArchivo.current) inputArchivo.current.value = ''
    }
  }

  const limpiar = () => { form.reiniciar(); setEditando(null); setArchivo(null); setErrorSubida('') }

  const guardar = e => {
    e.preventDefault()
    if (!form.validarTodo()) return
    const payload = { ...form.valores, nombre: form.valores.nombre.trim(), url: form.valores.url.trim() }
    if (editando !== null) updateItem('documentos_estudiantes', editando, payload)
    else addItem('documentos_estudiantes', payload)
    limpiar()
  }

  const editar = d => {
    form.reiniciar({
      nombre: d.nombre, descripcion: d.descripcion ?? '', url: d.url ?? '',
      tipo: d.tipo ?? 'PDF', grupo: d.grupo ?? GRUPOS_DOCUMENTO[0], peso: d.peso ?? '',
      archivo_id: d.archivo_id ?? null,
    })
    setEditando(d.id); setArchivo(null); setErrorSubida('')
  }

  const porGrupo = (data.documentos_estudiantes ?? []).reduce((acc, d) => {
    const g = d.grupo || 'Sin grupo'
    ;(acc[g] ??= []).push(d)
    return acc
  }, {})

  const v = form.valores

  return (
    <>
      <Plegable id="tabestudiantes-2" titulo={editando !== null ? 'Editar documento' : 'Agregar documento'}>
        <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 20 }} onSubmit={guardar} noValidate>

          {/* Cargar el archivo desde el equipo rellena nombre, tipo, peso y URL. */}
          <div style={{
            border: '1px dashed ' + (errorSubida ? 'var(--ug-flamingo)' : 'var(--borde)'),
            borderRadius: 'var(--radius)', padding: 18, marginBottom: 18, background: 'var(--paper)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <button type="button" className="btn ghost" style={{ padding: '10px 18px', fontSize: 14 }}
                      disabled={subiendo} onClick={() => inputArchivo.current?.click()}>
                <Icons.upload /> {subiendo ? 'Subiendo…' : 'Elegir archivo del equipo'}
              </button>
              <input ref={inputArchivo} type="file" style={{ display: 'none' }} onChange={alElegirArchivo}
                     accept={EXTENSIONES_ACEPTADAS.map(x => '.' + x).join(',')} />
              <div style={{ fontSize: 12, color: 'var(--ink-3)', flex: 1, minWidth: 240 }}>
                {archivo
                  ? <>Se cargó <b>{archivo.original}</b> ({archivo.peso}). Los campos de abajo se completaron solos.</>
                  : <>Al elegir un archivo se completan el nombre, el tipo y el peso automáticamente. Admitidos: {EXTENSIONES_ACEPTADAS.join(', ').toUpperCase()} · máx. 50 MB.</>}
              </div>
            </div>
            {errorSubida && <div role="alert" className="mensaje-error" style={{ marginTop: 10 }}>{errorSubida}</div>}
            {archivo && (
              <a href={archivo.url} target="_blank" rel="noopener noreferrer"
                 style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--accent-deep)', marginTop: 10 }}>
                <Icons.archivo /> {archivo.url}
              </a>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: 12 }}>
            <Campo etiqueta="Nombre" error={form.error('nombre')}>
              <input value={v.nombre} onChange={e => form.set('nombre', e.target.value)} onBlur={() => form.alSalir('nombre')} />
            </Campo>
            <Campo etiqueta="URL o enlace" opcional error={form.error('url')}>
              <input value={v.url} onChange={e => form.set('url', e.target.value)} onBlur={() => form.alSalir('url')}
                     placeholder="/docs/estudiantes/guia.pdf" />
            </Campo>
            <Campo etiqueta="Tipo" error={form.error('tipo')}>
              <select value={v.tipo} onChange={e => form.set('tipo', e.target.value)}>
                {TIPOS_DOCUMENTO.map(t => <option key={t}>{t}</option>)}
              </select>
            </Campo>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px 130px', gap: 12, marginTop: 12 }}>
            <Campo etiqueta="Descripción" opcional error={form.error('descripcion')}>
              <input value={v.descripcion} onChange={e => form.set('descripcion', e.target.value)} onBlur={() => form.alSalir('descripcion')} />
            </Campo>
            <Campo etiqueta="Grupo" error={form.error('grupo')}>
              <select value={v.grupo} onChange={e => form.set('grupo', e.target.value)}>
                {GRUPOS_DOCUMENTO.map(g => <option key={g}>{g}</option>)}
              </select>
            </Campo>
            <Campo etiqueta="Peso" opcional error={form.error('peso')}>
              <input value={v.peso} onChange={e => form.set('peso', e.target.value)} onBlur={() => form.alSalir('peso')} placeholder="1.8 MB" />
            </Campo>
          </div>
          <Acciones editando={editando !== null} bloqueado={form.invalido} onCancelar={limpiar} />
        </form>
      </Plegable>

      {Object.entries(porGrupo).map(([grupo, docs]) => (
        <div key={grupo} style={{ marginBottom: 20 }}>
          <div className="eyebrow" style={{ color: 'var(--accent-deep)', marginBottom: 6 }}>● {grupo}</div>
          {docs.map(d => (
            <div key={d.id} style={{ ...fila, gridTemplateColumns: '1fr 60px 80px auto' }}>
              <div>
                <div style={{ fontSize: 14 }}>{d.nombre}</div>
                {d.descripcion && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{d.descripcion}</div>}
                {d.url && <div style={{ fontSize: 11, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{d.url}</div>}
              </div>
              <span className="chip" style={{ fontSize: 10 }}>{d.tipo}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{d.peso}</span>
              <RowActions onEdit={() => editar(d)} onDelete={() => removeItem('documentos_estudiantes', d.id)} />
            </div>
          ))}
        </div>
      ))}
    </>
  )
}
