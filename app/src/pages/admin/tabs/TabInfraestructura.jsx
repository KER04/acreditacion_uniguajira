import { useEffect, useState } from 'react'
import {
  apiInfraRecursos, apiInfraCrear, apiInfraEditar, apiInfraBorrar,
} from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'
import RowActions from '../RowActions'
import Plegable from '../Plegable'
import SelectorAnio from '../../../components/SelectorAnio'
import { useFormulario, Campo, Acciones } from '../../../components/formulario'
import {
  CATEGORIAS_INFRA, ETIQUETA_INFRA, SEDES_INFRA, ETIQUETA_SEDE_INFRA, puestosDe,
} from '../../../../shared/validacion'

const ANIO_INFRA_MIN = 1976

const VACIO = {
  nombre: '', categoria: 'computo', descripcion: '', sede: 'riohacha', ubicacion: '',
  cantidad: '', capacidad: '', area_m2: '', anio: '', equipamiento: '',
  fuente_url: '', fuente_nombre: '', destacado: false, activo: true, orden: '0',
}

/* Los numéricos vacíos van como null —son columnas nulables y ese es su "sin
   dato"—, pero los de texto se quedan en cadena vacía: son NOT NULL con
   defecto '' y mandarles null hace que Postgres rechace la fila entera. */
const NUMERICOS = ['cantidad', 'capacidad', 'area_m2', 'anio']

const limpiar = v => {
  const salida = { ...v, orden: v.orden === '' ? 0 : Number(v.orden) }
  for (const k of NUMERICOS) salida[k] = v[k] === '' ? null : Number(v[k])
  return salida
}

export default function TabInfraestructura() {
  const [lista, setLista] = useState(null)
  const [editando, setEditando] = useState(null)
  const [aviso, setAviso] = useState(null)
  const form = useFormulario('infraestructura', VACIO, limpiar)

  const cargar = () => apiInfraRecursos().then(setLista).catch(e => setAviso(e.message))
  useEffect(() => { cargar() }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  const puestos = puestosDe(limpiar(form.valores))

  const guardar = async e => {
    e.preventDefault()
    if (!form.validarTodo()) return
    try {
      const datos = limpiar(form.valores)
      if (editando !== null) await apiInfraEditar(editando, datos)
      else await apiInfraCrear(datos)
      form.reiniciar()
      setEditando(null)
      setAviso(null)
      cargar()
    } catch (err) { setAviso(err.message) }
  }

  const editar = r => {
    form.reiniciar(Object.fromEntries(
      Object.keys(VACIO).map(k => [
        k,
        typeof VACIO[k] === 'boolean' ? Boolean(r[k])
          : (r[k] === null || r[k] === undefined ? '' : String(r[k])),
      ]),
    ))
    setEditando(r.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const borrar = async id => {
    try { await apiInfraBorrar(id); cargar() } catch (e) { setAviso(e.message) }
  }

  const campoNum = (clave, etiqueta, ayuda) => (
    <Campo etiqueta={etiqueta} error={form.error(clave)} opcional>
      <input type="number" min="1" inputMode="numeric" value={form.valores[clave]}
             onChange={e => form.set(clave, e.target.value)}
             onBlur={() => form.alSalir(clave)} placeholder={ayuda} />
    </Campo>
  )

  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>Infraestructura tecnológica</h3>
      {aviso && <div role="alert" className="eg-alerta">{aviso}</div>}

      <Plegable id="tabinfraestructura-0" titulo={editando !== null ? 'Editar recurso' : 'Agregar un recurso'}>
        <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 24 }} onSubmit={guardar}>
          <p style={{ fontSize: 12.5, color: 'var(--ink-3)', margin: '0 0 18px', maxWidth: '78ch', lineHeight: 1.55 }}>
            Los totales de la página —salas, puestos, metros— se suman solos a partir de estos
            recursos. No hay ningún total que actualizar a mano. Registra la fuente de cada cifra: el
            CNA las revisa y un número sin procedencia no sirve como evidencia.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <Campo etiqueta="Nombre del recurso" error={form.error('nombre')} style={{ gridColumn: '1 / -1' }}>
              <input value={form.valores.nombre} onChange={e => form.set('nombre', e.target.value)}
                     onBlur={() => form.alSalir('nombre')} required
                     placeholder="Laboratorio de Redes" />
            </Campo>
            <Campo etiqueta="Categoría" error={form.error('categoria')}>
              <select value={form.valores.categoria} onChange={e => form.set('categoria', e.target.value)}>
                {CATEGORIAS_INFRA.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Campo>
            <Campo etiqueta="Sede" error={form.error('sede')}>
              <select value={form.valores.sede} onChange={e => form.set('sede', e.target.value)}>
                {SEDES_INFRA.map(v => <option key={v} value={v}>{ETIQUETA_SEDE_INFRA[v]}</option>)}
              </select>
            </Campo>
            <Campo etiqueta="Ubicación" error={form.error('ubicacion')} opcional>
              <input value={form.valores.ubicacion} onChange={e => form.set('ubicacion', e.target.value)}
                     onBlur={() => form.alSalir('ubicacion')} placeholder="Bloque 8, piso 2" />
            </Campo>
            <Campo etiqueta="Año" error={form.error('anio')} opcional>
              <SelectorAnio valor={form.valores.anio} desde={ANIO_INFRA_MIN}
                            onChange={v => form.set('anio', v)} onBlur={() => form.alSalir('anio')} />
            </Campo>
          </div>

          <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--borde)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 14 }}>
              <div className="eyebrow">Cifras</div>
              <div className="sp-admin-global" data-listo={puestos !== null}>
                <b>{puestos !== null ? puestos.toLocaleString('es-CO') : '—'}</b>
                <span>Puestos que aporta</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
              {campoNum('cantidad', 'Cuántos hay', '22 salas')}
              {campoNum('capacidad', 'Puestos de cada uno', '30')}
              {campoNum('area_m2', 'Área en m²', '6859')}
              <Campo etiqueta="Orden" error={form.error('orden')} opcional>
                <input type="number" min="0" max="999" value={form.valores.orden}
                       onChange={e => form.set('orden', e.target.value)}
                       onBlur={() => form.alSalir('orden')} />
              </Campo>
            </div>
          </div>

          <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--borde)',
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <Campo etiqueta="Descripción" error={form.error('descripcion')} opcional style={{ gridColumn: '1 / -1' }}>
              <textarea rows="3" value={form.valores.descripcion}
                        onChange={e => form.set('descripcion', e.target.value)}
                        onBlur={() => form.alSalir('descripcion')} />
            </Campo>
            <Campo etiqueta="Equipamiento" error={form.error('equipamiento')} opcional style={{ gridColumn: '1 / -1' }}>
              <textarea rows="4" value={form.valores.equipamiento}
                        onChange={e => form.set('equipamiento', e.target.value)}
                        onBlur={() => form.alSalir('equipamiento')}
                        placeholder="Una línea por punto. Se pintan como viñetas." />
            </Campo>
            <Campo etiqueta="Enlace de la fuente" error={form.error('fuente_url')} opcional>
              <input value={form.valores.fuente_url} onChange={e => form.set('fuente_url', e.target.value)}
                     onBlur={() => form.alSalir('fuente_url')} placeholder="https://uniguajira.edu.co/…" />
            </Campo>
            <Campo etiqueta="Nombre de la fuente" error={form.error('fuente_nombre')} opcional>
              <input value={form.valores.fuente_nombre} onChange={e => form.set('fuente_nombre', e.target.value)}
                     onBlur={() => form.alSalir('fuente_nombre')}
                     placeholder="Dirección de Sistemas · Reseña histórica" />
            </Campo>
          </div>

          <div style={{ display: 'flex', gap: 22, marginTop: 16, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
              <input type="checkbox" checked={form.valores.destacado}
                     onChange={e => form.set('destacado', e.target.checked)} />
              Destacado (sale primero y marcado en ámbar)
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
      </Plegable>

      {lista === null && <p style={{ color: 'var(--ink-3)' }}>Cargando recursos…</p>}
      {lista?.length === 0 && <p style={{ color: 'var(--ink-3)' }}>Todavía no hay recursos registrados.</p>}

      {lista?.map(r => (
        <div key={r.id} style={{
          display: 'grid', gridTemplateColumns: '1fr 150px 110px 110px auto', gap: 14,
          padding: '14px 0', borderBottom: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)',
          alignItems: 'center', opacity: r.activo ? 1 : .55,
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: 14 }}>
              {r.nombre}
              {r.destacado && <span className="chip" style={{ fontSize: 10, marginLeft: 8 }}>Destacado</span>}
              {!r.activo && <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--ink-3)' }}>· oculto</span>}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
              {[r.ubicacion, ETIQUETA_SEDE_INFRA[r.sede], r.anio].filter(Boolean).join(' · ') || '—'}
            </div>
          </div>
          <span className="chip" style={{ fontSize: 10 }}>{ETIQUETA_INFRA[r.categoria]}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>
            {puestosDe(r) !== null ? puestosDe(r).toLocaleString('es-CO') + ' puestos' : '—'}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: r.fuente_url ? 'var(--ug-azul-deep)' : 'var(--ug-flamingo-deep)' }}>
            {r.fuente_url ? 'con fuente' : 'sin fuente'}
          </span>
          <RowActions onEdit={() => editar(r)} onDelete={() => borrar(r.id)} />
        </div>
      ))}
    </div>
  )
}
