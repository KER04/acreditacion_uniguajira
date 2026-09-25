import { useState, useRef } from 'react'
import {
  useData, apiSubirFotoDocente, apiBorrarFotoDocente, apiGuardarFormacion,
} from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'
import RowActions from '../RowActions'
import Plegable from '../Plegable'
import SelectorAnio from '../../../components/SelectorAnio'
import { useFormulario, Campo, Acciones } from '../../../components/formulario'
import {
  validar, hayErrores,
  SEDES, VINCULACIONES, ETIQUETA_VINCULACION,
  NIVELES_FORMACION, ETIQUETA_NIVEL, CATEGORIAS_GRUPO,
  ANIO_FORMACION_MIN, ANIO_FORMACION_MAX,
} from '../../../../shared/validacion'

const ETIQUETA_SEDE = { riohacha: 'Riohacha', maicao: 'Maicao' }

const VACIO = {
  nombre: '', vinculacion: '', sede: 'riohacha', email: '',
  cvlac_url: '', orcid_url: '', scholar_url: '', posgrado: '',
  dedicacion: '', oficina: '', extension: '', horario: '',
  grupo: '', grupo_categoria: '', semillero: '',
}

const TITULO_VACIO = { titulo: '', nivel: '', institucion: '', anio: '', en_curso: false }

const fila = {
  display: 'grid', gap: 12, padding: '12px 0', alignItems: 'center',
  borderBottom: '1px solid var(--borde)',
}

/* Recorta y normaliza antes de validar y de enviar: el usuario escribe con
   espacios de sobra y la base guarda '' en vez de nulos. */
const limpiar = v => Object.fromEntries(
  Object.entries(v).map(([k, valor]) => [k, typeof valor === 'string' ? valor.trim() : valor]),
)

/* ─── Editor de la formación académica ─────────────────────────── */

/* Los títulos se editan como una lista dentro del mismo formulario y se
   guardan de una sola vez (PUT), que es como los espera la API. */
function EditorFormacion({ titulos, onCambiar }) {
  const cambiar = (i, campo, valor) => {
    onCambiar(titulos.map((t, j) => (j === i ? { ...t, [campo]: valor } : t)))
  }
  const quitar = i => onCambiar(titulos.filter((_, j) => j !== i))
  const mover = (i, salto) => {
    const destino = i + salto
    if (destino < 0 || destino >= titulos.length) return
    const copia = [...titulos]
    ;[copia[i], copia[destino]] = [copia[destino], copia[i]]
    onCambiar(copia)
  }

  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Formación académica</span>
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
          Del más alto al más bajo: es el orden en que se muestra.
        </span>
      </div>

      {titulos.length === 0 && (
        <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 10px' }}>
          Sin títulos registrados. La ficha oculta el bloque si se deja vacío.
        </p>
      )}

      {titulos.map((t, i) => {
        const errores = validar('formacion', { ...t, anio: t.anio === '' ? undefined : Number(t.anio) })
        return (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1.4fr 80px auto', gap: 10,
            alignItems: 'end', padding: '10px 0', borderBottom: '1px solid var(--borde)',
          }}>
            <Campo etiqueta={i === 0 ? 'Título' : ''} error={t.titulo ? errores.titulo : undefined}>
              <input value={t.titulo} onChange={e => cambiar(i, 'titulo', e.target.value)}
                     placeholder="Magíster en telemática" autoComplete="off" />
            </Campo>
            <Campo etiqueta={i === 0 ? 'Nivel' : ''}>
              <select value={t.nivel} onChange={e => cambiar(i, 'nivel', e.target.value)}>
                {NIVELES_FORMACION.map(n => <option key={n} value={n}>{ETIQUETA_NIVEL[n]}</option>)}
              </select>
            </Campo>
            <Campo etiqueta={i === 0 ? 'Institución' : ''}>
              <input value={t.institucion} onChange={e => cambiar(i, 'institucion', e.target.value)}
                     placeholder="Universidad del Norte" autoComplete="off" />
            </Campo>
            <Campo etiqueta={i === 0 ? 'Año' : ''} error={t.anio ? errores.anio : undefined}>
              <SelectorAnio valor={t.anio} desde={ANIO_FORMACION_MIN} hasta={ANIO_FORMACION_MAX}
                            onChange={v => cambiar(i, 'anio', v)} />
            </Campo>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', paddingBottom: 4 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, whiteSpace: 'nowrap' }}>
                <input type="checkbox" checked={t.en_curso}
                       onChange={e => cambiar(i, 'en_curso', e.target.checked)} />
                En curso
              </label>
              <button type="button" className="icon-btn" style={{ width: 30, height: 30 }}
                      onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir">↑</button>
              <button type="button" className="icon-btn" style={{ width: 30, height: 30 }}
                      onClick={() => mover(i, 1)} disabled={i === titulos.length - 1} aria-label="Bajar">↓</button>
              <button type="button" className="icon-btn" style={{ width: 30, height: 30 }}
                      onClick={() => quitar(i)} aria-label="Quitar título"><Icons.trash /></button>
            </div>
          </div>
        )
      })}

      <button type="button" className="btn ghost" style={{ marginTop: 12, padding: '7px 14px' }}
              onClick={() => onCambiar([...titulos, { ...TITULO_VACIO }])}>
        <Icons.plus /> Añadir título
      </button>
    </div>
  )
}

/* ─── Foto ─────────────────────────────────────────────────────── */

function BotonFoto({ docente, onListo, onError }) {
  const entrada = useRef(null)
  const [subiendo, setSubiendo] = useState(false)

  const subir = async archivo => {
    if (!archivo) return
    setSubiendo(true)
    try {
      await apiSubirFotoDocente(docente.id, archivo)
      await onListo()
    } catch (e) { onError(e.message) } finally { setSubiendo(false) }
  }

  const quitar = async () => {
    setSubiendo(true)
    try {
      await apiBorrarFotoDocente(docente.id)
      await onListo()
    } catch (e) { onError(e.message) } finally { setSubiendo(false) }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button type="button" className="avatar-subir" disabled={subiendo}
              data-sin-foto={!docente.foto_url}
              onClick={() => entrada.current?.click()}
              title={docente.foto_url ? 'Cambiar la foto' : 'Subir una foto'}
              style={{
                width: 42, height: 42, borderRadius: '50%', overflow: 'hidden',
                border: '1px solid var(--borde)', background: 'var(--paper-3)',
                display: 'grid', placeItems: 'center', cursor: 'pointer', padding: 0,
              }}>
        {docente.foto_url
          ? <img src={docente.foto_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span className="marca"><Icons.camara /></span>}
      </button>
      {docente.foto_url && (
        <button type="button" className="icon-btn" style={{ width: 28, height: 28 }}
                onClick={quitar} disabled={subiendo} aria-label="Quitar foto"><Icons.close /></button>
      )}
      <input ref={entrada} type="file" accept=".jpg,.jpeg,.png,.webp" hidden
             onChange={e => { subir(e.target.files?.[0]); e.target.value = '' }} />
    </div>
  )
}

/* ─── Pestaña ──────────────────────────────────────────────────── */

export default function TabDocentes() {
  const { data, addItem, removeItem, updateItem, recargar } = useData()
  const form = useFormulario('docentes', VACIO, limpiar)
  const [editando, setEditando] = useState(null)
  const [titulos, setTitulos] = useState([])
  const [aviso, setAviso] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroSede, setFiltroSede] = useState('todas')

  const docentes = data.docentes ?? []
  const texto = busqueda.trim().toLowerCase()
  const listado = docentes.filter(d =>
    (filtroSede === 'todas' || d.sede === filtroSede)
    && (!texto || d.nombre.toLowerCase().includes(texto) || (d.email ?? '').toLowerCase().includes(texto)),
  )

  const titulosValidos = () => titulos.every(t => {
    const errs = validar('formacion', { ...t, anio: t.anio === '' ? undefined : Number(t.anio) })
    return !hayErrores(errs)
  })

  const guardar = async e => {
    e.preventDefault()
    setAviso(null)
    if (!form.validarTodo()) return
    if (!titulosValidos()) { setAviso('Revisa los títulos de formación'); return }

    const payload = limpiar(form.valores)
    try {
      if (editando !== null) {
        await updateItem('docentes', editando, payload)
        await guardarTitulos(editando)
      } else {
        /* addItem recarga la colección; para adjuntar los títulos hace falta el
           id nuevo, así que se busca por el correo o el nombre recién guardados. */
        await addItem('docentes', payload)
        const lista = await recargarYDevolver()
        const creado = lista.find(d =>
          (payload.email && d.email?.toLowerCase() === payload.email.toLowerCase())
          || d.nombre === payload.nombre)
        if (creado) await guardarTitulos(creado.id)
      }
      form.reiniciar(); setTitulos([]); setEditando(null)
    } catch (err) {
      setAviso(err.message)
    }
  }

  const recargarYDevolver = async () => {
    await recargar('docentes')
    const res = await fetch('/api/docentes?todos=1', { credentials: 'include' })
    return res.ok ? res.json() : []
  }

  const guardarTitulos = async id => {
    const limpios = titulos
      .filter(t => t.titulo.trim())
      .map((t, i) => ({
        titulo: t.titulo.trim(),
        nivel: t.nivel,
        institucion: t.institucion.trim(),
        anio: t.anio === '' ? undefined : Number(t.anio),
        en_curso: !!t.en_curso,
        orden: i,
      }))
    await apiGuardarFormacion(id, limpios)
    await recargar('docentes')
  }

  const editar = d => {
    form.reiniciar({
      nombre: d.nombre ?? '', vinculacion: d.vinculacion ?? '', sede: d.sede ?? 'riohacha',
      email: d.email ?? '', cvlac_url: d.cvlac_url ?? '', orcid_url: d.orcid_url ?? '',
      scholar_url: d.scholar_url ?? '', posgrado: d.posgrado ?? '',
      dedicacion: d.dedicacion ?? '', oficina: d.oficina ?? '', extension: d.extension ?? '',
      horario: d.horario ?? '', grupo: d.grupo ?? '', grupo_categoria: d.grupo_categoria ?? '',
      semillero: d.semillero ?? '',
    })
    setTitulos((d.formacion ?? []).map(f => ({
      titulo: f.titulo ?? '', nivel: f.nivel ?? '', institucion: f.institucion ?? '',
      anio: f.anio == null ? '' : String(f.anio), en_curso: !!f.en_curso,
    })))
    setEditando(d.id)
    setAviso(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelar = () => { form.reiniciar(); setTitulos([]); setEditando(null); setAviso(null) }

  const v = form.valores

  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>Docentes</h3>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20, maxWidth: '78ch' }}>
        Guarda en PostgreSQL, foto incluida. Solo el nombre es obligatorio: se puede cargar al
        docente con lo que se tenga y completar después. Los campos vacíos <b>no se muestran</b> en
        el sitio, así que una ficha incompleta no se ve rota. Pulsa el círculo de cada fila para
        subir su fotografía.
      </p>

      {aviso && (
        <div role="alert" style={{
          marginBottom: 16, padding: '10px 14px', borderRadius: 8,
          background: 'var(--ug-flamingo-soft)', color: 'var(--ug-flamingo-deep)', fontSize: 13,
        }}>{aviso}</div>
      )}

      <Plegable id="tabdocentes-0" titulo={editando !== null ? 'Editar docente' : 'Nuevo docente'}>
        <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 24 }} onSubmit={guardar} noValidate>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14 }}>
            <Campo etiqueta="Nombre" error={form.error('nombre')}>
              <input value={v.nombre} onChange={e => form.set('nombre', e.target.value)}
                     onBlur={() => form.alSalir('nombre')} placeholder="Nombres y apellidos" autoComplete="off" />
            </Campo>
            <Campo etiqueta="Vinculación" error={form.error('vinculacion')}>
              <select value={v.vinculacion} onChange={e => form.set('vinculacion', e.target.value)}>
                {VINCULACIONES.map(k => <option key={k} value={k}>{ETIQUETA_VINCULACION[k]}</option>)}
              </select>
            </Campo>
            <Campo etiqueta="Sede" error={form.error('sede')}>
              <select value={v.sede} onChange={e => form.set('sede', e.target.value)}>
                {SEDES.map(s => <option key={s} value={s}>{ETIQUETA_SEDE[s]}</option>)}
              </select>
            </Campo>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
            <Campo etiqueta="Correo institucional" error={form.error('email')} opcional>
              <input type="email" value={v.email} onChange={e => form.set('email', e.target.value)}
                     onBlur={() => form.alSalir('email')} placeholder="nombre@uniguajira.edu.co" autoComplete="off" />
            </Campo>
            <Campo etiqueta="CvLAC" error={form.error('cvlac_url')} opcional>
              <input value={v.cvlac_url} onChange={e => form.set('cvlac_url', e.target.value)}
                     onBlur={() => form.alSalir('cvlac_url')} placeholder="https://scienti.minciencias.gov.co/cvlac/..." autoComplete="off" />
            </Campo>
          </div>

          <Campo etiqueta="Posgrado (texto de la planilla)" error={form.error('posgrado')} opcional style={{ marginTop: 14 }}>
            <textarea rows={2} value={v.posgrado} onChange={e => form.set('posgrado', e.target.value)}
                      onBlur={() => form.alSalir('posgrado')}
                      placeholder="Se muestra como resumen en la tarjeta. El desglose va abajo, en formación." />
          </Campo>

          <EditorFormacion titulos={titulos} onCambiar={setTitulos} />

          <details style={{ marginTop: 20 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
              Contacto, investigación y perfiles
            </summary>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginTop: 14 }}>
              <Campo etiqueta="Dedicación" error={form.error('dedicacion')} opcional>
                <input value={v.dedicacion} onChange={e => form.set('dedicacion', e.target.value)}
                       onBlur={() => form.alSalir('dedicacion')} placeholder="Tiempo completo" autoComplete="off" />
              </Campo>
              <Campo etiqueta="Oficina" error={form.error('oficina')} opcional>
                <input value={v.oficina} onChange={e => form.set('oficina', e.target.value)}
                       onBlur={() => form.alSalir('oficina')} placeholder="Bloque 4 — Oficina 302" autoComplete="off" />
              </Campo>
              <Campo etiqueta="Extensión" error={form.error('extension')} opcional>
                <input value={v.extension} onChange={e => form.set('extension', e.target.value)}
                       onBlur={() => form.alSalir('extension')} placeholder="Ext. 240" autoComplete="off" />
              </Campo>
            </div>

            <Campo etiqueta="Horario de atención a estudiantes" error={form.error('horario')} opcional style={{ marginTop: 14 }}>
              <input value={v.horario} onChange={e => form.set('horario', e.target.value)}
                     onBlur={() => form.alSalir('horario')} placeholder="Lun y Mié · 2:00–4:00 pm" autoComplete="off" />
            </Campo>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: 14, marginTop: 14 }}>
              <Campo etiqueta="Grupo de investigación" error={form.error('grupo')} opcional>
                <input value={v.grupo} onChange={e => form.set('grupo', e.target.value)}
                       onBlur={() => form.alSalir('grupo')} placeholder="GITUG" autoComplete="off" />
              </Campo>
              <Campo etiqueta="Categoría MinCiencias" error={form.error('grupo_categoria')} opcional>
                <select value={v.grupo_categoria} onChange={e => form.set('grupo_categoria', e.target.value)}>
                  {CATEGORIAS_GRUPO.map(c => <option key={c} value={c}>{c === '' ? 'Sin categoría' : c}</option>)}
                </select>
              </Campo>
              <Campo etiqueta="Semillero" error={form.error('semillero')} opcional>
                <input value={v.semillero} onChange={e => form.set('semillero', e.target.value)}
                       onBlur={() => form.alSalir('semillero')} placeholder="Semillero IoT Wayuu" autoComplete="off" />
              </Campo>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
              <Campo etiqueta="ORCID" error={form.error('orcid_url')} opcional>
                <input value={v.orcid_url} onChange={e => form.set('orcid_url', e.target.value)}
                       onBlur={() => form.alSalir('orcid_url')} placeholder="https://orcid.org/0000-..." autoComplete="off" />
              </Campo>
              <Campo etiqueta="Google Scholar" error={form.error('scholar_url')} opcional>
                <input value={v.scholar_url} onChange={e => form.set('scholar_url', e.target.value)}
                       onBlur={() => form.alSalir('scholar_url')} placeholder="https://scholar.google.com/citations?user=..." autoComplete="off" />
              </Campo>
            </div>
          </details>

          <Acciones editando={editando !== null} onCancelar={cancelar} bloqueado={form.invalido} />
          {editando === null && (
            <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 10 }}>
              La fotografía se sube desde la lista, una vez creado el docente.
            </p>
          )}
        </form>
      </Plegable>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
               placeholder="Buscar por nombre o correo" style={{ minWidth: 240 }} autoComplete="off" />
        <select value={filtroSede} onChange={e => setFiltroSede(e.target.value)} style={{ width: 'auto' }}>
          <option value="todas">Todas las sedes</option>
          {SEDES.map(s => <option key={s} value={s}>{ETIQUETA_SEDE[s]}</option>)}
        </select>
        <span style={{ fontSize: 13, color: 'var(--ink-3)', marginLeft: 'auto' }}>
          {listado.length} de {docentes.length}
        </span>
      </div>

      {docentes.length === 0 && (
        <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>
          Todavía no hay docentes cargados. El primero que agregues aparece de inmediato en el sitio.
        </p>
      )}

      {listado.map(d => (
        <div key={d.id} style={{ ...fila, gridTemplateColumns: '48px 2fr 1fr 1fr 1.4fr auto' }}>
          <BotonFoto docente={d} onListo={() => recargar('docentes')} onError={setAviso} />
          <div>
            <div style={{ fontWeight: 500 }}>{d.nombre}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{d.email || 'Sin correo'}</div>
          </div>
          <div style={{ fontSize: 13 }}>{ETIQUETA_VINCULACION[d.vinculacion] ?? 'Sin registrar'}</div>
          <div style={{ fontSize: 13 }}>{ETIQUETA_SEDE[d.sede] ?? d.sede}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
            {(d.formacion ?? []).length} título{(d.formacion ?? []).length === 1 ? '' : 's'}
            {d.grupo && ' · ' + d.grupo}
          </div>
          <RowActions onEdit={() => editar(d)} onDelete={() => removeItem('docentes', d.id)} />
        </div>
      ))}
    </div>
  )
}
