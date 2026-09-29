/* Panel — Contacto (migración 026).
 *
 * Tres partes de /contacto:
 *   · Sedes: oficina, dirección, correo y teléfono de Riohacha y Maicao. Es lo
 *     mismo que muestra el pie de página de todo el sitio (antes se editaba en
 *     la pestaña de Acreditación CNA, donde nadie lo buscaba).
 *   · Organigrama: los cargos del programa. La foto se sube en la fila (027);
 *     sin foto propia, se usa la de su ficha de docente si está vinculada.
 *   · Presentación: el texto de la dirección, los ejes y el horario.
 */
import { useEffect, useRef, useState } from 'react'
import { usePestana } from '../../../hooks/useParametroURL'
import {
  useData, apiContacto, apiGuardarSede, apiGuardarContactoPrograma,
  apiSubirFotoCargo, apiBorrarFotoCargo,
} from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'
import PanelLista, { Campo, aLista } from '../PanelLista'
import { NIVELES_CARGO, SEDES_CON_AMBAS } from '../../../../shared/validacion'

const SUBPESTANAS = [['sedes', 'Sedes'], ['organigrama', 'Organigrama'], ['presentacion', 'Presentación']]
const ETIQUETA_SEDE = { ambas: 'Ambas sedes', riohacha: 'Riohacha', maicao: 'Maicao' }
const tenue = { fontSize: 12, color: 'var(--ink-3)' }

/* Tras guardar, se relee todo el módulo: la página y el pie leen `contacto`
   e `info_sedes`, y así los dos quedan al día sin recargar. */
function useRefrescar() {
  const { fijar } = useData()
  return async () => {
    const c = await apiContacto()
    fijar('contacto', { sedes: c.sedes, cargos: c.cargos, programa: c.programa })
    fijar('info_sedes', c.info_sedes)
  }
}

/* Foto de una persona del organigrama. Se sube contra un cargo que ya existe
   (antes de guardarlo no hay id al que colgarla), por eso vive en la fila.
   Sin foto propia se ve la del docente vinculado, con un aviso de que viene
   de su ficha; la X solo aparece si hay una propia que quitar. */
function FotoCargo({ cargo }) {
  const { recargar, setError } = useData()
  const refrescar = useRefrescar()
  const entrada = useRef(null)
  const [subiendo, setSubiendo] = useState(false)

  const hacer = async accion => {
    setSubiendo(true)
    try { await accion(); await recargar('cargos'); await refrescar() }
    catch (e) { setError(e.message) }
    finally { setSubiendo(false) }
  }
  const iniciales = cargo.nombre.split(' ').map(x => x[0]).filter(c => /[A-ZÁÉÍÓÚÑ]/.test(c ?? '')).slice(0, 2).join('')
  const titulo = cargo.foto_propia ? 'Cambiar foto'
    : cargo.foto_de_docente ? 'Foto tomada de su ficha de docente. Pulsa para subir una propia'
    : 'Subir foto'

  return (
    <div style={{ position: 'relative', width: 44, height: 44 }}>
      <button type="button" onClick={() => entrada.current?.click()} disabled={subiendo} title={titulo}
              style={{
                width: 44, height: 44, borderRadius: '50%', padding: 0, overflow: 'hidden', cursor: 'pointer',
                border: cargo.foto_url ? '2px solid var(--paper)' : '1px dashed var(--borde)',
                boxShadow: cargo.foto_url ? '0 0 0 1px var(--borde)' : 'none',
                background: 'var(--paper-3)', display: 'grid', placeItems: 'center', fontSize: 11,
                color: 'var(--ink-3)', opacity: subiendo ? .5 : 1,
              }}>
        {cargo.foto_url
          ? <img src={cargo.foto_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : (iniciales || <Icons.camara />)}
      </button>
      {cargo.foto_propia && (
        <button type="button" onClick={() => hacer(() => apiBorrarFotoCargo(cargo.id))} disabled={subiendo}
                aria-label="Quitar la foto" title="Quitar la foto"
                style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', border: 0, padding: 0,
                         background: 'var(--ink)', color: 'var(--paper)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      )}
      <input ref={entrada} type="file" accept=".jpg,.jpeg,.png,.webp" hidden
             onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) hacer(() => apiSubirFotoCargo(cargo.id, f)) }} />
    </div>
  )
}

function Guardado({ visible }) {
  return visible ? <span style={{ ...tenue, color: 'var(--ug-marino)' }}>Guardado.</span> : null
}

const CAMPOS_SEDE = [
  { k: 'nombre', l: 'Nombre', tipo: 'texto' },
  { k: 'ubicacion', l: 'Oficina (bloque y piso)', tipo: 'texto' },
  { k: 'direccion', l: 'Dirección', tipo: 'texto' },
  { k: 'ciudad', l: 'Ciudad', tipo: 'texto' },
  { k: 'correo', l: 'Correo del programa', tipo: 'texto' },
  { k: 'telefono', l: 'Teléfono', tipo: 'texto' },
  { k: 'extension', l: 'Extensión', tipo: 'texto' },
  { k: 'horario', l: 'Horario de atención', tipo: 'texto' },
  { k: 'url', l: 'Página oficial del programa en esta sede', tipo: 'url', ancho: true },
]

function FormSede({ sede }) {
  const { setError } = useData()
  const refrescar = useRefrescar()
  const [form, setForm] = useState(sede)
  const [ok, setOk] = useState(false)
  useEffect(() => setForm(sede), [sede])

  const guardar = async e => {
    e.preventDefault()
    const { sede: clave, orden, ...datos } = form
    try {
      await apiGuardarSede(clave, datos)
      await refrescar()
      setOk(true); setTimeout(() => setOk(false), 2500)
    } catch (err) { setError(err.message) }
  }

  return (
    <form className="card" style={{ background: 'var(--paper-2)' }} onSubmit={guardar}>
      <div style={{ fontWeight: 600, marginBottom: 14 }}>{sede.nombre || ETIQUETA_SEDE[sede.sede]}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {CAMPOS_SEDE.map(c => <Campo key={c.k} c={c} valor={form[c.k]} cambiar={v => setForm(x => ({ ...x, [c.k]: v }))} />)}
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 14 }}>
        <button className="btn accent" type="submit" style={{ padding: '8px 20px' }}>Guardar <Icons.check /></button>
        <Guardado visible={ok} />
      </div>
    </form>
  )
}

function FormPresentacion() {
  const { data, setError } = useData()
  const refrescar = useRefrescar()
  const p = data.contacto?.programa ?? {}
  const [form, setForm] = useState(null)
  const [ok, setOk] = useState(false)
  useEffect(() => {
    setForm({ presentacion: p.presentacion ?? '', ejes: (p.ejes ?? []).join('\n'), horario: p.horario ?? '', nota_cita: p.nota_cita ?? '' })
  }, [data.contacto?.programa])
  if (!form) return null

  const campos = [
    { k: 'presentacion', l: 'Qué hace la dirección', tipo: 'area', ancho: true },
    { k: 'ejes', l: 'Ejes de gestión (uno por renglón)', tipo: 'lista', ancho: true },
    { k: 'horario', l: 'Horario de atención a estudiantes (vacío = no se muestra)', tipo: 'texto', ancho: true },
    { k: 'nota_cita', l: 'Nota sobre citas', tipo: 'texto', ancho: true, placeholder: 'Cita previa con la secretaría del programa' },
  ]
  const guardar = async e => {
    e.preventDefault()
    try {
      await apiGuardarContactoPrograma({ ...form, ejes: aLista(form.ejes) })
      await refrescar()
      setOk(true); setTimeout(() => setOk(false), 2500)
    } catch (err) { setError(err.message) }
  }
  return (
    <form className="card" style={{ background: 'var(--paper-2)' }} onSubmit={guardar}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {campos.map(c => <Campo key={c.k} c={c} valor={form[c.k]} cambiar={v => setForm(x => ({ ...x, [c.k]: v }))} />)}
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 14 }}>
        <button className="btn accent" type="submit" style={{ padding: '8px 20px' }}>Guardar <Icons.check /></button>
        <Guardado visible={ok} />
      </div>
    </form>
  )
}

export default function TabContacto() {
  const { data } = useData()
  const [tab, setTab] = usePestana(SUBPESTANAS, { clave: 'sub' })
  const sedes = data.contacto?.sedes ?? []

  /* El vínculo con el directorio: docentes ordenados por nombre. */
  const docentes = [...(data.docentes ?? [])].sort((a, b) => a.nombre.localeCompare(b.nombre))
  const CAMPOS_CARGO = [
    { k: 'nombre', l: 'Nombre', tipo: 'texto', requerido: true },
    { k: 'cargo', l: 'Cargo', tipo: 'texto', requerido: true, placeholder: 'Director del programa' },
    { k: 'nivel', l: 'Fila del organigrama', tipo: 'select', opciones: NIVELES_CARGO.map(n => n[0]), etiquetas: Object.fromEntries(NIVELES_CARGO) },
    { k: 'sede', l: 'Sede', tipo: 'select', opciones: SEDES_CON_AMBAS, etiquetas: ETIQUETA_SEDE },
    { k: 'area', l: 'Área (etiqueta de color)', tipo: 'texto', placeholder: 'Autoevaluación y acreditación' },
    { k: 'docente_id', l: 'Vincular con su ficha de docente (usa su foto si no se sube una propia)', tipo: 'select',
      opciones: ['', ...docentes.map(d => String(d.id))],
      etiquetas: { '': '— Sin vincular —', ...Object.fromEntries(docentes.map(d => [String(d.id), d.nombre])) } },
    { k: 'correo', l: 'Correo', tipo: 'texto' },
    { k: 'extension', l: 'Extensión', tipo: 'texto' },
    { k: 'ubicacion', l: 'Oficina', tipo: 'texto' },
    { k: 'orden', l: 'Orden', tipo: 'numero' },
    { k: 'descripcion', l: 'Qué hace (una o dos líneas)', tipo: 'area', ancho: true },
  ]
  const CARGO_VACIO = {
    nombre: '', cargo: '', nivel: 'coordinacion', sede: 'riohacha', area: '', docente_id: '',
    correo: '', extension: '', ubicacion: '', orden: 0, descripcion: '',
  }

  return (
    <div>
      <h3 style={{ marginBottom: 6 }}>Contacto</h3>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>
        Lo que se publica en <a href="#/contacto" target="_blank" rel="noopener noreferrer">/contacto</a>.
        Los datos de las sedes también son los del pie de página de todo el sitio.
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {SUBPESTANAS.map(([k, l]) => (
          <button key={k} className="chip" onClick={() => setTab(k)}
            style={{ cursor: 'pointer', background: tab === k ? 'var(--ink)' : undefined, color: tab === k ? 'var(--paper)' : undefined }}>{l}</button>
        ))}
      </div>

      {tab === 'sedes' && (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          {sedes.map(s => <FormSede key={s.sede} sede={s} />)}
        </div>
      )}

      {tab === 'organigrama' && (
        <PanelLista clave="cargos" id="tabcontacto-0" titulos={['Nuevo cargo', 'Editar cargo']}
          campos={CAMPOS_CARGO} vacio={CARGO_VACIO} columnas="52px 1fr 150px 90px auto"
          vacioTexto="Todavía no hay cargos en el organigrama."
          resumen={c => (<>
            <FotoCargo cargo={c} />
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{c.nombre}</div>
              <div style={tenue}>{c.cargo}{c.foto_de_docente ? ' · foto de su ficha de docente' : !c.foto_url ? ' · sin foto' : ''}</div>
            </div>
            <span className="chip" style={{ fontSize: 10 }}>{Object.fromEntries(NIVELES_CARGO)[c.nivel]}</span>
            <span style={tenue}>{ETIQUETA_SEDE[c.sede]}</span>
          </>)} />
      )}

      {tab === 'presentacion' && <FormPresentacion />}
    </div>
  )
}
