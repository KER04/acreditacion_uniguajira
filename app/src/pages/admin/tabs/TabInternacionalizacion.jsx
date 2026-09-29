/* Panel — Internacionalización.
 *
 * Edita /internacionalizacion (migración 024): convocatorias de movilidad,
 * convenios internacionales, redes académicas y la ficha de la ORI. Las tres
 * listas usan PanelLista; la ORI es una fila única y lleva su propio formulario.
 */
import { useEffect, useState } from 'react'
import { usePestana } from '../../../hooks/useParametroURL'
import { useData, apiGuardarOri } from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'
import PanelLista, { Campo, aLista } from '../PanelLista'
import {
  TIPOS_CONVENIO_INT, DIRIGIDO_CONVOCATORIA, ALCANCES_RED, fechaLarga,
} from '../../../../shared/validacion'

const SUBPESTANAS = [
  ['convocatorias', 'Convocatorias'],
  ['convenios', 'Convenios'],
  ['redes', 'Redes'],
  ['ori', 'Oficina (ORI)'],
]

const CAMPOS_CONVOCATORIA = [
  { k: 'titulo', l: 'Título', tipo: 'texto', ancho: true, requerido: true },
  { k: 'dirigido', l: 'Dirigida a', tipo: 'select', opciones: DIRIGIDO_CONVOCATORIA },
  { k: 'destino', l: 'Destino', tipo: 'texto', placeholder: 'University of Ottawa, Canadá' },
  { k: 'fecha_apertura', l: 'Apertura', tipo: 'fecha' },
  { k: 'fecha_cierre', l: 'Cierre (con ella se decide si está abierta)', tipo: 'fecha' },
  { k: 'descripcion', l: 'Descripción y requisitos', tipo: 'area', ancho: true },
  { k: 'beneficios', l: 'Qué incluye', tipo: 'area', ancho: true },
  { k: 'url', l: 'Enlace a la convocatoria', tipo: 'url', ancho: true },
  { k: 'orden', l: 'Orden', tipo: 'numero' },
]
const CONVOCATORIA_VACIA = {
  titulo: '', dirigido: 'Estudiantes', destino: '', fecha_apertura: '', fecha_cierre: '',
  descripcion: '', beneficios: '', url: '', orden: 0,
}

const CAMPOS_CONVENIO = [
  { k: 'institucion', l: 'Institución', tipo: 'texto', requerido: true },
  { k: 'pais', l: 'País', tipo: 'texto', requerido: true },
  { k: 'tipo', l: 'Tipo', tipo: 'select', opciones: TIPOS_CONVENIO_INT },
  { k: 'tema', l: 'Tema', tipo: 'texto' },
  { k: 'objeto', l: 'Objeto del convenio', tipo: 'area', ancho: true },
  { k: 'fecha_fin', l: 'Vigente hasta (vacío = indefinido)', tipo: 'fecha' },
  { k: 'intercambio', l: 'Es destino de intercambio estudiantil', tipo: 'check' },
  { k: 'url', l: 'Enlace al convenio o la fuente', tipo: 'url', ancho: true },
  { k: 'orden', l: 'Orden', tipo: 'numero' },
]
const CONVENIO_VACIO = {
  institucion: '', pais: '', tipo: 'Marco', tema: '', objeto: '', fecha_fin: '',
  intercambio: false, url: '', orden: 0,
}

const CAMPOS_RED = [
  { k: 'sigla', l: 'Sigla', tipo: 'texto', requerido: true },
  { k: 'alcance', l: 'Alcance', tipo: 'select', opciones: ALCANCES_RED },
  { k: 'nombre', l: 'Nombre completo', tipo: 'texto', ancho: true },
  { k: 'descripcion', l: 'Participación del programa', tipo: 'area', ancho: true },
  { k: 'url', l: 'Página de la red', tipo: 'url' },
  { k: 'orden', l: 'Orden', tipo: 'numero' },
]
const RED_VACIA = { sigla: '', alcance: 'Internacional', nombre: '', descripcion: '', url: '', orden: 0 }

const CAMPOS_ORI = [
  { k: 'ubicacion', l: 'Ubicación', tipo: 'texto', ancho: true },
  { k: 'telefono', l: 'Teléfono', tipo: 'texto' },
  { k: 'url', l: 'Página de la ORI', tipo: 'url' },
  { k: 'correos', l: 'Correos (uno por renglón)', tipo: 'lista', ancho: true },
  { k: 'requisitos', l: 'Requisitos para postular (uno por renglón)', tipo: 'lista', ancho: true },
  { k: 'pasos', l: 'Paso a paso (uno por renglón, en orden)', tipo: 'lista', ancho: true },
]
const LISTAS_ORI = ['correos', 'requisitos', 'pasos']

const tenue = { fontSize: 12, color: 'var(--ink-3)' }

function FormOri() {
  const { data, fijar, setError } = useData()
  const [form, setForm] = useState(null)
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    const o = data.ori ?? {}
    setForm({
      ubicacion: o.ubicacion ?? '', telefono: o.telefono ?? '', url: o.url ?? '',
      correos: (o.correos ?? []).join('\n'), requisitos: (o.requisitos ?? []).join('\n'),
      pasos: (o.pasos ?? []).join('\n'),
    })
  }, [data.ori])

  if (!form) return null

  const guardar = async e => {
    e.preventDefault()
    const cuerpo = { ...form }
    for (const k of LISTAS_ORI) cuerpo[k] = aLista(cuerpo[k])
    try {
      fijar('ori', await apiGuardarOri(cuerpo))
      setGuardado(true); setTimeout(() => setGuardado(false), 2500)
    } catch (err) { setError(err.message) }
  }

  return (
    <form className="card" style={{ background: 'var(--paper-2)' }} onSubmit={guardar}>
      <p style={{ ...tenue, marginBottom: 14 }}>Se muestra al final de /internacionalizacion: contacto, requisitos y el paso a paso para hacer un intercambio.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {CAMPOS_ORI.map(c => <Campo key={c.k} c={c} valor={form[c.k]} cambiar={v => setForm(x => ({ ...x, [c.k]: v }))} />)}
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 14 }}>
        <button className="btn accent" type="submit" style={{ padding: '8px 20px' }}>Guardar <Icons.check /></button>
        {guardado && <span style={{ ...tenue, color: 'var(--ug-marino)' }}>Guardado.</span>}
      </div>
    </form>
  )
}

export default function TabInternacionalizacion() {
  const [tab, setTab] = usePestana(SUBPESTANAS, { clave: 'sub' })

  return (
    <div>
      <h3 style={{ marginBottom: 6 }}>Internacionalización</h3>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>
        Lo que se publica en <a href="#/internacionalizacion" target="_blank" rel="noopener noreferrer">/internacionalizacion</a>.
        Si una convocatoria está abierta se decide por su fecha de cierre, y las cifras de la cabecera se cuentan solas.
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {SUBPESTANAS.map(([k, l]) => (
          <button key={k} className="chip" onClick={() => setTab(k)}
            style={{ cursor: 'pointer', background: tab === k ? 'var(--ink)' : undefined, color: tab === k ? 'var(--paper)' : undefined }}>{l}</button>
        ))}
      </div>

      {tab === 'convocatorias' && (
        <PanelLista clave="convocatorias_mov" id="tabinter-0" titulos={['Nueva convocatoria', 'Editar convocatoria']}
          campos={CAMPOS_CONVOCATORIA} vacio={CONVOCATORIA_VACIA} columnas="1fr 110px 150px auto"
          vacioTexto="Todavía no hay convocatorias."
          resumen={c => (<>
            <div><div style={{ fontWeight: 500, fontSize: 14 }}>{c.titulo}</div><div style={tenue}>{c.destino}</div></div>
            <span className="chip" style={{ fontSize: 10 }}>{c.dirigido}</span>
            <span style={{ ...tenue, color: c.abierta ? 'var(--ug-marino)' : undefined }}>
              {c.abierta ? 'Abierta' : c.proxima ? 'Próxima' : 'Cerrada'}{c.fecha_cierre ? ` · ${fechaLarga(c.fecha_cierre)}` : ''}
            </span>
          </>)} />
      )}

      {tab === 'convenios' && (
        <PanelLista clave="convenios_int" id="tabinter-1" titulos={['Nuevo convenio internacional', 'Editar convenio']}
          campos={CAMPOS_CONVENIO} vacio={CONVENIO_VACIO} columnas="1fr 120px 90px 100px auto"
          vacioTexto="Todavía no hay convenios internacionales."
          resumen={c => (<>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{c.institucion}</div>
            <span style={tenue}>{c.pais}</span>
            <span className="chip" style={{ fontSize: 10 }}>{c.tipo}</span>
            <span style={{ ...tenue, color: c.vigente ? undefined : 'var(--ug-flamingo)' }}>
              {!c.vigente ? 'Vencido' : c.intercambio ? 'Intercambio' : ''}
            </span>
          </>)} />
      )}

      {tab === 'redes' && (
        <PanelLista clave="redes" id="tabinter-2" titulos={['Nueva red', 'Editar red']}
          campos={CAMPOS_RED} vacio={RED_VACIA} columnas="120px 1fr 110px auto"
          vacioTexto="Todavía no hay redes."
          resumen={r => (<>
            <b>{r.sigla}</b>
            <span style={tenue}>{r.nombre}</span>
            <span className="chip" style={{ fontSize: 10 }}>{r.alcance}</span>
          </>)} />
      )}

      {tab === 'ori' && <FormOri />}
    </div>
  )
}
