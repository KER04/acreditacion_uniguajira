import { useEffect, useRef, useState } from 'react'
import { usePestana } from '../../../hooks/useParametroURL'
import {
  useData, apiSubirFotoEgresado, apiBorrarFotoEgresado,
  apiPostulaciones, apiEstadoPostulacion, apiBorrarPostulacion,
  apiActualizaciones, apiMarcarActualizacion, apiBorrarActualizacion,
} from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'
import RowActions from '../RowActions'
import SelectorAnio from '../../../components/SelectorAnio'
import VisorDocumento from '../../../components/VisorDocumento'
import { useFormulario, Campo, Acciones } from '../../../components/formulario'
import {
  SEDES_CON_AMBAS, COLORES_TARJETA, MODALIDADES_OFERTA, CONTRATOS_OFERTA,
  ESTADOS_OFERTA, ESTADOS_POSTULACION, ETIQUETA_POSTULACION, FORMACION_POSTERIOR,
  idYouTube, fechaLarga, ANIO_GRADO_MIN,
} from '../../../../shared/validacion'

const PESTANAS = [
  ['destacados', 'Egresados'],
  ['bolsa', 'Bolsa de empleo'],
  ['postulaciones', 'Postulaciones'],
  ['actualizaciones', 'Actualizaciones'],
]

const SEDE_LARGA = { ambas: 'Ambas sedes', riohacha: 'Riohacha', maicao: 'Maicao' }

const VACIO_EGRESADO = {
  nombre: '', anio_grado: '', cargo: '', empresa: '', ciudad: '', pais: '',
  sede: 'riohacha', testimonio: '', linkedin_url: '', color: 'var(--ug-azul)',
  video_youtube: '', video_url: '', destacado: false, activo: true, orden: 0,
}

const VACIO_OFERTA = {
  cargo: '', empresa: '', ubicacion: '', modalidad: 'Presencial',
  tipo_contrato: 'Tiempo completo', salario: '', vacantes: 1,
  descripcion: '', responsabilidades: '', requisitos: '', beneficios: '',
  tags: '', contacto_email: '', url_externa: '',
  fecha_publicacion: new Date().toISOString().slice(0, 10), fecha_cierre: '', estado: 'abierta',
}

/* El formulario trabaja con textos; el esquema y la API esperan los tipos ya
   convertidos. Normalizar aquí es lo que permite validar con las mismas
   reglas que corre el servidor. */
const limpiarEgresado = v => ({
  ...v,
  orden: v.orden === '' ? 0 : Number(v.orden),
  // El panel admite pegar la URL completa de YouTube; se guarda el id.
  video_youtube: idYouTube(v.video_youtube),
})

const limpiarOferta = v => ({
  ...v,
  vacantes: v.vacantes === '' ? 1 : Number(v.vacantes),
  tags: String(v.tags ?? '').split(',').map(t => t.trim()).filter(Boolean),
  // Un campo de fecha vacío es null para la base, no cadena vacía.
  fecha_cierre: v.fecha_cierre || null,
})

/* ─── Imagen de un egresado (foto redonda y fotograma del vídeo) ─── */

/* La imagen se sube contra un egresado que ya existe, así que vive en la fila
   y no en el formulario de alta: antes de guardar todavía no hay id al que
   colgarla. */
function BotonImagen({ egresado, campo, url, onListo, onError, titulo }) {
  const entrada = useRef(null)
  const [subiendo, setSubiendo] = useState(false)

  const subir = async archivo => {
    if (!archivo) return
    setSubiendo(true)
    try {
      await apiSubirFotoEgresado(egresado.id, archivo, campo)
      await onListo()
    } catch (e) { onError(e.message) } finally { setSubiendo(false) }
  }

  const quitar = async () => {
    setSubiendo(true)
    try {
      await apiBorrarFotoEgresado(egresado.id, campo)
      await onListo()
    } catch (e) { onError(e.message) } finally { setSubiendo(false) }
  }

  /* El póster heredado de YouTube no es un archivo nuestro: se puede
     reemplazar, pero no hay nada que borrar. */
  const propia = campo === 'foto' ? Boolean(egresado.foto_id) : Boolean(egresado.poster_id)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button type="button" disabled={subiendo} onClick={() => entrada.current?.click()}
              title={titulo}
              style={{
                width: 42, height: 42, borderRadius: campo === 'foto' ? '50%' : 8,
                overflow: 'hidden', border: '1px solid var(--borde)', background: 'var(--paper-3)',
                display: 'grid', placeItems: 'center', cursor: 'pointer', padding: 0,
                color: 'var(--ink-3)',
              }}>
        {url
          ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <Icons.camara />}
      </button>
      {propia && (
        <button type="button" className="icon-btn" style={{ width: 26, height: 26 }}
                onClick={quitar} disabled={subiendo} aria-label={'Quitar ' + titulo}><Icons.close /></button>
      )}
      <input ref={entrada} type="file" accept=".jpg,.jpeg,.png,.webp" hidden
             onChange={e => { subir(e.target.files?.[0]); e.target.value = '' }} />
    </div>
  )
}

/* ─── Egresados destacados ─────────────────────────────────────── */

function PanelEgresados({ aviso, setAviso }) {
  const { data, addItem, updateItem, removeItem, recargar } = useData()
  const form = useFormulario('egresados', VACIO_EGRESADO, limpiarEgresado)
  const [editando, setEditando] = useState(null)

  const guardar = e => {
    e.preventDefault()
    if (!form.validarTodo()) return
    const datos = limpiarEgresado(form.valores)
    if (editando !== null) updateItem('destacados', editando, datos)
    else addItem('destacados', datos)
    form.reiniciar()
    setEditando(null)
  }

  const editar = d => {
    form.reiniciar({
      ...VACIO_EGRESADO,
      ...Object.fromEntries(Object.keys(VACIO_EGRESADO).map(k => [k, d[k] ?? VACIO_EGRESADO[k]])),
    })
    setEditando(d.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const lista = data.destacados ?? []

  return (
    <>
      <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 24 }} onSubmit={guardar}>
        <div style={{ fontWeight: 600, marginBottom: 16 }}>
          {editando !== null ? 'Editar egresado' : 'Agregar egresado destacado'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          <Campo etiqueta="Nombre completo" error={form.error('nombre')}>
            <input value={form.valores.nombre} onChange={e => form.set('nombre', e.target.value)}
                   onBlur={() => form.alSalir('nombre')} required />
          </Campo>
          <Campo etiqueta="Año de grado" error={form.error('anio_grado')} opcional>
            <SelectorAnio valor={form.valores.anio_grado} desde={ANIO_GRADO_MIN}
                          onChange={v => form.set('anio_grado', v)}
                          onBlur={() => form.alSalir('anio_grado')} />
          </Campo>
          <Campo etiqueta="Cargo" error={form.error('cargo')} opcional>
            <input value={form.valores.cargo} onChange={e => form.set('cargo', e.target.value)}
                   onBlur={() => form.alSalir('cargo')} placeholder="Head of Data" />
          </Campo>
          <Campo etiqueta="Empresa" error={form.error('empresa')} opcional>
            <input value={form.valores.empresa} onChange={e => form.set('empresa', e.target.value)}
                   onBlur={() => form.alSalir('empresa')} />
          </Campo>
          <Campo etiqueta="Ciudad" error={form.error('ciudad')} opcional>
            <input value={form.valores.ciudad} onChange={e => form.set('ciudad', e.target.value)}
                   onBlur={() => form.alSalir('ciudad')} />
          </Campo>
          <Campo etiqueta="País" error={form.error('pais')} opcional>
            <input value={form.valores.pais} onChange={e => form.set('pais', e.target.value)}
                   onBlur={() => form.alSalir('pais')} placeholder="Colombia" />
          </Campo>
          <Campo etiqueta="Sede" error={form.error('sede')}>
            <select value={form.valores.sede} onChange={e => form.set('sede', e.target.value)}>
              {SEDES_CON_AMBAS.map(s => <option key={s} value={s}>{SEDE_LARGA[s]}</option>)}
            </select>
          </Campo>
          <Campo etiqueta="Color de tarjeta" error={form.error('color')}>
            <select value={form.valores.color} onChange={e => form.set('color', e.target.value)}>
              {COLORES_TARJETA.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Campo>
          <Campo etiqueta="LinkedIn" error={form.error('linkedin_url')} opcional>
            <input value={form.valores.linkedin_url} onChange={e => form.set('linkedin_url', e.target.value)}
                   onBlur={() => form.alSalir('linkedin_url')} placeholder="https://linkedin.com/in/…" />
          </Campo>
          <Campo etiqueta="Orden" error={form.error('orden')} opcional>
            <input type="number" min="0" max="999" value={form.valores.orden}
                   onChange={e => form.set('orden', e.target.value)} onBlur={() => form.alSalir('orden')} />
          </Campo>

          <Campo etiqueta="Testimonio" error={form.error('testimonio')} opcional style={{ gridColumn: '1 / -1' }}>
            <textarea rows="2" value={form.valores.testimonio}
                      onChange={e => form.set('testimonio', e.target.value)}
                      onBlur={() => form.alSalir('testimonio')} />
          </Campo>
        </div>

        {/* El vídeo no se sube: se enlaza. La nota lo explica donde se decide. */}
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--borde)' }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Vídeo del testimonio</div>
          <p style={{ fontSize: 12.5, color: 'var(--ink-3)', margin: '0 0 14px', maxWidth: '72ch', lineHeight: 1.5 }}>
            Sube el vídeo a YouTube y pega aquí el enlace: guardamos solo el identificador, la
            miniatura la pone YouTube y el reproductor se carga únicamente cuando la tarjeta
            aparece en pantalla. Guardar el archivo en la base lo haría pesar decenas de MB por
            egresado. El campo MP4 es para un vídeo alojado fuera (un CDN propio).
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <Campo etiqueta="Enlace o ID de YouTube" error={form.error('video_youtube')} opcional>
              <input value={form.valores.video_youtube}
                     onChange={e => form.set('video_youtube', e.target.value)}
                     onBlur={() => form.alSalir('video_youtube')}
                     placeholder="https://youtu.be/…" />
            </Campo>
            <Campo etiqueta="URL de un MP4 externo" error={form.error('video_url')} opcional>
              <input value={form.valores.video_url} onChange={e => form.set('video_url', e.target.value)}
                     onBlur={() => form.alSalir('video_url')} placeholder="https://…/testimonio.mp4" />
            </Campo>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 22, marginTop: 16, flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}
                 title="La portada rota entre todos los que tengan vídeo. Marcar a varios ya no compite: solo adelanta su turno.">
            <input type="checkbox" checked={form.valores.destacado}
                   onChange={e => form.set('destacado', e.target.checked)} />
            Abre la portada (sale primero en la ronda)
          </label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
            <input type="checkbox" checked={form.valores.activo}
                   onChange={e => form.set('activo', e.target.checked)} />
            Visible en el sitio
          </label>
        </div>

        <Acciones editando={editando !== null} bloqueado={form.invalido}
                  onCancelar={() => { form.reiniciar(); setEditando(null) }} />
      </form>

      {lista.length === 0 && <p style={{ color: 'var(--ink-3)' }}>Todavía no hay egresados cargados.</p>}

      {lista.map(d => (
        <div key={d.id} style={{
          display: 'grid', gridTemplateColumns: '90px 90px 1fr 110px 120px auto', gap: 14,
          padding: '12px 0', borderBottom: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)',
          alignItems: 'center',
        }}>
          <BotonImagen egresado={d} campo="foto" url={d.foto_url} titulo="foto del egresado"
                       onListo={() => recargar('destacados')} onError={setAviso} />
          <BotonImagen egresado={d} campo="poster" url={d.poster_url} titulo="fotograma del vídeo"
                       onListo={() => recargar('destacados')} onError={setAviso} />
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>
              {d.nombre}
              {!d.activo && <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--ink-3)' }}>· oculto</span>}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
              {[d.cargo, d.empresa, d.ciudad].filter(Boolean).join(' · ') || '—'}
            </div>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{d.anio_grado || '—'}</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {d.destacado && <span className="chip" style={{ fontSize: 10 }}>Portada</span>}
            {d.tiene_video && <span className="chip" style={{ fontSize: 10 }}>Vídeo</span>}
          </div>
          <RowActions onEdit={() => editar(d)} onDelete={() => removeItem('destacados', d.id)} />
        </div>
      ))}
    </>
  )
}

/* ─── Bolsa de empleo ──────────────────────────────────────────── */

function PanelBolsa() {
  const { data, addItem, updateItem, removeItem } = useData()
  const form = useFormulario('ofertas', VACIO_OFERTA, limpiarOferta)
  const [editando, setEditando] = useState(null)

  const guardar = e => {
    e.preventDefault()
    if (!form.validarTodo()) return
    const datos = limpiarOferta(form.valores)
    if (editando !== null) updateItem('ofertas', editando, datos)
    else addItem('ofertas', datos)
    form.reiniciar()
    setEditando(null)
  }

  const editar = o => {
    form.reiniciar({
      ...VACIO_OFERTA,
      ...Object.fromEntries(Object.keys(VACIO_OFERTA).map(k => [k, o[k] ?? VACIO_OFERTA[k]])),
      tags: (o.tags ?? []).join(', '),
      fecha_cierre: o.fecha_cierre ?? '',
    })
    setEditando(o.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const campoLargo = (clave, etiqueta, ayuda) => (
    <Campo etiqueta={etiqueta} error={form.error(clave)} opcional style={{ gridColumn: '1 / -1' }}>
      <textarea rows="4" value={form.valores[clave]} onChange={e => form.set(clave, e.target.value)}
                onBlur={() => form.alSalir(clave)} placeholder={ayuda} />
    </Campo>
  )

  const lista = data.ofertas ?? []

  return (
    <>
      <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 24 }} onSubmit={guardar}>
        <div style={{ fontWeight: 600, marginBottom: 16 }}>
          {editando !== null ? 'Editar vacante' : 'Publicar una vacante'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          <Campo etiqueta="Cargo" error={form.error('cargo')} style={{ gridColumn: '1 / -1' }}>
            <input value={form.valores.cargo} onChange={e => form.set('cargo', e.target.value)}
                   onBlur={() => form.alSalir('cargo')} required />
          </Campo>
          <Campo etiqueta="Empresa" error={form.error('empresa')}>
            <input value={form.valores.empresa} onChange={e => form.set('empresa', e.target.value)}
                   onBlur={() => form.alSalir('empresa')} required />
          </Campo>
          <Campo etiqueta="Ubicación" error={form.error('ubicacion')} opcional>
            <input value={form.valores.ubicacion} onChange={e => form.set('ubicacion', e.target.value)}
                   onBlur={() => form.alSalir('ubicacion')} placeholder="Riohacha, La Guajira" />
          </Campo>
          <Campo etiqueta="Modalidad" error={form.error('modalidad')}>
            <select value={form.valores.modalidad} onChange={e => form.set('modalidad', e.target.value)}>
              {MODALIDADES_OFERTA.map(m => <option key={m}>{m}</option>)}
            </select>
          </Campo>
          <Campo etiqueta="Tipo de contrato" error={form.error('tipo_contrato')}>
            <select value={form.valores.tipo_contrato} onChange={e => form.set('tipo_contrato', e.target.value)}>
              {CONTRATOS_OFERTA.map(c => <option key={c}>{c}</option>)}
            </select>
          </Campo>
          <Campo etiqueta="Salario" error={form.error('salario')} opcional>
            <input value={form.valores.salario} onChange={e => form.set('salario', e.target.value)}
                   onBlur={() => form.alSalir('salario')} placeholder="$3.2M – $4.5M" />
          </Campo>
          <Campo etiqueta="Vacantes" error={form.error('vacantes')}>
            <input type="number" min="1" max="999" value={form.valores.vacantes}
                   onChange={e => form.set('vacantes', e.target.value)} onBlur={() => form.alSalir('vacantes')} />
          </Campo>
          <Campo etiqueta="Publicación" error={form.error('fecha_publicacion')}>
            <input type="date" value={form.valores.fecha_publicacion}
                   onChange={e => form.set('fecha_publicacion', e.target.value)}
                   onBlur={() => form.alSalir('fecha_publicacion')} />
          </Campo>
          <Campo etiqueta="Cierre" error={form.error('fecha_cierre')} opcional>
            <input type="date" value={form.valores.fecha_cierre}
                   onChange={e => form.set('fecha_cierre', e.target.value)}
                   onBlur={() => form.alSalir('fecha_cierre')} />
          </Campo>
          <Campo etiqueta="Estado" error={form.error('estado')}>
            <select value={form.valores.estado} onChange={e => form.set('estado', e.target.value)}>
              {ESTADOS_OFERTA.map(s => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
            </select>
          </Campo>
          <Campo etiqueta="Correo de contacto" error={form.error('contacto_email')} opcional>
            <input type="email" value={form.valores.contacto_email}
                   onChange={e => form.set('contacto_email', e.target.value)}
                   onBlur={() => form.alSalir('contacto_email')} />
          </Campo>
          <Campo etiqueta="Portal externo" error={form.error('url_externa')} opcional>
            <input value={form.valores.url_externa} onChange={e => form.set('url_externa', e.target.value)}
                   onBlur={() => form.alSalir('url_externa')} placeholder="Si la empresa recibe en su web" />
          </Campo>
          <Campo etiqueta="Tecnologías (separadas por coma)" error={form.error('tags')} opcional
                 style={{ gridColumn: '1 / -1' }}>
            <input value={form.valores.tags} onChange={e => form.set('tags', e.target.value)}
                   onBlur={() => form.alSalir('tags')} placeholder="React, Node, PostgreSQL" />
          </Campo>

          {campoLargo('descripcion', 'Sobre la vacante', 'Qué hace el equipo y qué se espera del cargo.')}
          {campoLargo('responsabilidades', 'Responsabilidades', 'Una línea por punto. Empieza con - para que salga como viñeta.')}
          {campoLargo('requisitos', 'Requisitos', 'Una línea por punto. Empieza con - para que salga como viñeta.')}
          {campoLargo('beneficios', 'Beneficios', 'Una línea por punto. Empieza con - para que salga como viñeta.')}
        </div>

        <Acciones editando={editando !== null} bloqueado={form.invalido}
                  onCancelar={() => { form.reiniciar(); setEditando(null) }} />
      </form>

      {lista.length === 0 && <p style={{ color: 'var(--ink-3)' }}>Todavía no hay vacantes publicadas.</p>}

      {lista.map(o => (
        <div key={o.id} style={{
          display: 'grid', gridTemplateColumns: '1fr 140px 120px 110px auto', gap: 14,
          padding: '14px 0', borderBottom: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{o.cargo}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
              {[o.ubicacion, o.modalidad].filter(Boolean).join(' · ')}
            </div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{o.empresa}</span>
          <span className="chip" style={{
            fontSize: 10,
            background: o.abierta ? 'color-mix(in oklab, var(--ug-amarillo) 20%, transparent)' : undefined,
          }}>
            {o.abierta ? 'Abierta' : (o.vencida ? 'Vencida' : o.estado)}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>
            {fechaLarga(o.fecha_cierre) || 'Sin cierre'}
          </span>
          <RowActions onEdit={() => editar(o)} onDelete={() => removeItem('ofertas', o.id)} />
        </div>
      ))}
    </>
  )
}

/* ─── Postulaciones recibidas ──────────────────────────────────── */

/* El estado de una postulación se ve antes de leerla: cada tarjeta se tiñe con
   un color de la paleta institucional. No son colores decorativos, cada uno
   dice algo distinto (el detalle está en app.css, junto a las reglas):
     recibida        neutro     — acaba de llegar, nadie la ha mirado
     revisada        teal       — ya pasó por manos de la coordinación
     preseleccionada ámbar      — la que destaca, igual que el ámbar destaca
                                  en el resto del sitio
     descartada      terracota  — el color que el sitio usa para lo negativo */

function PanelPostulaciones({ setAviso }) {
  const { data } = useData()
  const [lista, setLista] = useState(null)
  const [filtro, setFiltro] = useState('')
  const [verHoja, setVerHoja] = useState(null)

  const cargar = () => apiPostulaciones(filtro || undefined).then(setLista).catch(e => setAviso(e.message))
  useEffect(() => { cargar() }, [filtro])   // eslint-disable-line react-hooks/exhaustive-deps

  const cambiar = async (id, estado) => {
    try { await apiEstadoPostulacion(id, { estado }); cargar() } catch (e) { setAviso(e.message) }
  }
  const borrar = async id => {
    try { await apiBorrarPostulacion(id); cargar() } catch (e) { setAviso(e.message) }
  }

  const ofertaDe = ofertaId => (data.ofertas ?? []).find(o => o.id === ofertaId)

  if (lista === null) return <p style={{ color: 'var(--ink-3)' }}>Cargando postulaciones…</p>

  /* Cuántas hay en cada estado, para el resumen de arriba. */
  const cuantas = e => lista.filter(p => p.estado === e).length

  return (
    <>
      <div className="post-cabecera">
        <div className="field" style={{ margin: 0, minWidth: 260, flex: 1 }}>
          <label htmlFor="filtro-vacante">Filtrar por vacante</label>
          <select id="filtro-vacante" value={filtro} onChange={e => setFiltro(e.target.value)}>
            <option value="">Todas las vacantes</option>
            {(data.ofertas ?? []).map(o => (
              <option key={o.id} value={o.id}>{o.cargo} · {o.empresa}</option>
            ))}
          </select>
        </div>

        {lista.length > 0 && (
          <div className="post-resumen">
            {ESTADOS_POSTULACION.map(e => (
              <span key={e} className="post-conteo" data-estado={e}>
                <b>{cuantas(e)}</b> {ETIQUETA_POSTULACION[e].toLowerCase()}
              </span>
            ))}
          </div>
        )}
      </div>

      {lista.length === 0 && <p style={{ color: 'var(--ink-3)' }}>No hay postulaciones todavía.</p>}

      {lista.map(p => {
        const oferta = ofertaDe(p.oferta_id)
        return (
          <article key={p.id} className="post-tarjeta" data-estado={p.estado}>
            <div className="post-tarjeta__arriba">
              <div className="post-tarjeta__quien">
                <div className="post-tarjeta__nombre">
                  {p.nombre}
                  <span className="post-pildora" data-estado={p.estado}>{ETIQUETA_POSTULACION[p.estado]}</span>
                </div>
                <div className="post-tarjeta__contacto">
                  <a href={'mailto:' + p.email}>{p.email}</a>
                  {[p.telefono, p.documento && 'CC ' + p.documento, p.anio_grado && 'Grado ' + p.anio_grado]
                    .filter(Boolean).map((x, i) => <span key={i}> · {x}</span>)}
                </div>
                <div className="post-tarjeta__vacante">
                  {oferta ? oferta.cargo + ' · ' + oferta.empresa : 'Vacante #' + p.oferta_id}
                  {' · '}{new Date(p.creado_en).toLocaleDateString('es-CO')}
                </div>
              </div>

              <div className="post-tarjeta__acciones">
                <select className="post-selector" data-estado={p.estado}
                        value={p.estado} onChange={e => cambiar(p.id, e.target.value)}
                        aria-label={'Estado de la postulación de ' + p.nombre}>
                  {ESTADOS_POSTULACION.map(e => <option key={e} value={e}>{ETIQUETA_POSTULACION[e]}</option>)}
                </select>

                {p.hoja_vida_url && (
                  /* Botón y no enlace: abre el visor incrustado en vez de
                     mandar el archivo al disco de quien revisa. */
                  <button className="btn ghost post-btn" onClick={() => setVerHoja(p)}>
                    <Icons.archivo /> Hoja de vida
                  </button>
                )}
                {p.linkedin_url && (
                  <a className="btn ghost post-btn" href={p.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <Icons.linkedin /> LinkedIn
                  </a>
                )}
                <button className="icon-btn" style={{ width: 32, height: 32, color: 'var(--ug-flamingo)' }}
                        onClick={() => borrar(p.id)} aria-label={'Eliminar la postulación de ' + p.nombre}>
                  <Icons.trash />
                </button>
              </div>
            </div>

            {p.mensaje && <p className="post-tarjeta__mensaje">{p.mensaje}</p>}
          </article>
        )
      })}

      {verHoja && (
        <VisorDocumento
          url={verHoja.hoja_vida_url}
          descarga={verHoja.hoja_vida_descarga}
          nombre={verHoja.hoja_vida_nombre || ('Hoja de vida de ' + verHoja.nombre)}
          extension={verHoja.hoja_vida_ext}
          peso={verHoja.hoja_vida_peso}
          onCerrar={() => setVerHoja(null)} />
      )}
    </>
  )
}

/* ─── Actualizaciones de datos ─────────────────────────────────── */

function PanelActualizaciones({ setAviso }) {
  const [lista, setLista] = useState(null)

  const cargar = () => apiActualizaciones().then(setLista).catch(e => setAviso(e.message))
  useEffect(() => { cargar() }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  const marcar = async (id, atendida) => {
    try { await apiMarcarActualizacion(id, atendida); cargar() } catch (e) { setAviso(e.message) }
  }
  const borrar = async id => {
    try { await apiBorrarActualizacion(id); cargar() } catch (e) { setAviso(e.message) }
  }

  if (lista === null) return <p style={{ color: 'var(--ink-3)' }}>Cargando actualizaciones…</p>
  if (lista.length === 0) return <p style={{ color: 'var(--ink-3)' }}>Ningún egresado ha enviado datos todavía.</p>

  return lista.map(a => (
    <div key={a.id} className="card" style={{
      background: 'var(--paper-2)', marginBottom: 12, padding: 18,
      opacity: a.atendida ? .6 : 1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600 }}>{a.nombre}</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 3 }}>
            {[a.email, a.telefono, a.ciudad].filter(Boolean).join(' · ')}
          </div>
          <div style={{ fontSize: 13, marginTop: 8 }}>
            {[a.cargo, a.empresa].filter(Boolean).join(' · ') || 'Sin datos laborales'}
            {a.formacion_posterior !== 'Ninguna' && ' · ' + a.formacion_posterior}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>
            Grado {a.anio_grado || '—'} · enviado el {new Date(a.creado_en).toLocaleDateString('es-CO')}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'start' }}>
          <button className="btn ghost" style={{ padding: '7px 14px', fontSize: 13 }}
                  onClick={() => marcar(a.id, !a.atendida)}>
            {a.atendida ? 'Reabrir' : 'Marcar atendida'} <Icons.check />
          </button>
          <button className="icon-btn" style={{ width: 32, height: 32, color: 'var(--ug-flamingo)' }}
                  onClick={() => borrar(a.id)} aria-label="Eliminar registro"><Icons.trash /></button>
        </div>
      </div>

      {a.resumen && (
        <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--borde)', lineHeight: 1.6 }}>
          {a.resumen}
        </p>
      )}
    </div>
  ))
}

/* ─── Pestaña ──────────────────────────────────────────────────── */

export default function TabEgresados() {
  const [tab, setTab] = usePestana(PESTANAS, { clave: 'sub' })
  const [aviso, setAviso] = useState(null)

  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>Egresados</h3>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {PESTANAS.map(([k, l]) => (
          <button key={k} className="chip" onClick={() => { setTab(k); setAviso(null) }}
                  aria-pressed={tab === k}
                  style={{ cursor: 'pointer', background: tab === k ? 'var(--ink)' : undefined, color: tab === k ? 'var(--paper)' : undefined }}>
            {l}
          </button>
        ))}
      </div>

      {aviso && <div role="alert" className="eg-alerta">{aviso}</div>}

      {tab === 'destacados' && <PanelEgresados aviso={aviso} setAviso={setAviso} />}
      {tab === 'bolsa' && <PanelBolsa />}
      {tab === 'postulaciones' && <PanelPostulaciones setAviso={setAviso} />}
      {tab === 'actualizaciones' && <PanelActualizaciones setAviso={setAviso} />}
    </div>
  )
}
