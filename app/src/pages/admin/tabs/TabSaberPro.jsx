import { useEffect, useState } from 'react'
import { usePestana } from '../../../hooks/useParametroURL'
import {
  apiSaberProResultados, apiSaberProCrear, apiSaberProEditar, apiSaberProBorrar,
  apiSaberProParametros, apiSaberProGuardarParametros, apiSaberProImportar,
} from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'
import RowActions from '../RowActions'
import Plegable from '../Plegable'
import EditorTarjetas from '../EditorTarjetas'
import SelectorAnio from '../../../components/SelectorAnio'
import { useFormulario, Campo, Acciones } from '../../../components/formulario'
import {
  MODULOS_SABERPRO, CLAVES_MODULOS, NIVELES_INGLES, SEDES,
  PUNTAJE_SABERPRO_MAX, globalSaberPro, fechaLarga,
} from '../../../../shared/validacion'

const SUBPESTANAS = [
  ['resultados', 'Resultados'],
  ['cargar', 'Cargar reporte'],
  ['parametros', 'Opción de grado'],
  ['carrusel', 'Carrusel del encabezado'],
]
const SEDE_LARGA = { riohacha: 'Riohacha', maicao: 'Maicao' }
const ANIO_SABERPRO_MIN = 2010

const VACIO = {
  estudiante: '', documento: '', registro: '',
  anio: String(new Date().getFullYear()), periodo: '', sede: 'riohacha',
  lectura_critica: '', razonamiento_cuantitativo: '', competencias_ciudadanas: '',
  comunicacion_escrita: '', ingles: '',
  percentil_nacional: '', percentil_nbc: '', nivel_ingles: '', observaciones: '',
}

/* El formulario trabaja con textos y la base con números. Los vacíos de los
   campos opcionales viajan como null, no como cadena vacía, porque son
   columnas numéricas que aceptan NULL pero no ''. */
const limpiar = v => {
  const salida = { ...v, anio: Number(v.anio) }
  for (const k of CLAVES_MODULOS) salida[k] = v[k] === '' ? '' : Number(v[k])
  for (const k of ['percentil_nacional', 'percentil_nbc']) salida[k] = v[k] === '' ? null : Number(v[k])
  return salida
}

/* ─── Resultados ───────────────────────────────────────────────── */

function PanelResultados({ setAviso }) {
  const [lista, setLista] = useState(null)
  const [editando, setEditando] = useState(null)
  const form = useFormulario('saberpro', VACIO, limpiar)

  const cargar = () => apiSaberProResultados().then(setLista).catch(e => setAviso(e.message))
  useEffect(() => { cargar() }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  /* El global se enseña mientras se teclea, con el mismo cálculo que hace la
     columna generada de la base: quien carga el reporte ve al momento si el
     número le cuadra con el PDF del ICFES que tiene delante. */
  const global = globalSaberPro(limpiar(form.valores))

  const guardar = async e => {
    e.preventDefault()
    if (!form.validarTodo()) return
    try {
      const datos = limpiar(form.valores)
      if (editando !== null) await apiSaberProEditar(editando, datos)
      else await apiSaberProCrear(datos)
      form.reiniciar()
      setEditando(null)
      setAviso(null)
      cargar()
    } catch (err) { setAviso(err.message) }
  }

  const editar = r => {
    form.reiniciar(Object.fromEntries(
      Object.keys(VACIO).map(k => [k, r[k] === null || r[k] === undefined ? '' : String(r[k])]),
    ))
    setEditando(r.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const borrar = async id => {
    try { await apiSaberProBorrar(id); cargar() } catch (e) { setAviso(e.message) }
  }

  const campoPuntaje = (clave, etiqueta) => (
    <Campo etiqueta={etiqueta} error={form.error(clave)}>
      <input type="number" min="0" max={PUNTAJE_SABERPRO_MAX} inputMode="numeric"
             value={form.valores[clave]}
             onChange={e => form.set(clave, e.target.value)}
             onBlur={() => form.alSalir(clave)} required />
    </Campo>
  )

  return (
    <>
      <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 24 }} onSubmit={guardar}>
        <div style={{ fontWeight: 600, marginBottom: 16 }}>
          {editando !== null ? 'Editar resultado' : 'Cargar un resultado Saber Pro'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
          <Campo etiqueta="Estudiante" error={form.error('estudiante')} style={{ gridColumn: '1 / -1' }}>
            <input value={form.valores.estudiante} onChange={e => form.set('estudiante', e.target.value)}
                   onBlur={() => form.alSalir('estudiante')} required />
          </Campo>
          <Campo etiqueta="Documento" error={form.error('documento')} opcional>
            <input inputMode="numeric" value={form.valores.documento}
                   onChange={e => form.set('documento', e.target.value)}
                   onBlur={() => form.alSalir('documento')} />
          </Campo>
          <Campo etiqueta="N.º de registro ICFES" error={form.error('registro')} opcional>
            <input value={form.valores.registro} onChange={e => form.set('registro', e.target.value)}
                   onBlur={() => form.alSalir('registro')} placeholder="EK202612197754" />
          </Campo>
          <Campo etiqueta="Año de presentación" error={form.error('anio')}>
            <SelectorAnio valor={form.valores.anio} desde={ANIO_SABERPRO_MIN} opcional={false}
                          onChange={v => form.set('anio', v)} onBlur={() => form.alSalir('anio')} />
          </Campo>
          <Campo etiqueta="Período" error={form.error('periodo')} opcional>
            <input value={form.valores.periodo} onChange={e => form.set('periodo', e.target.value)}
                   onBlur={() => form.alSalir('periodo')} placeholder="2026-I" />
          </Campo>
          <Campo etiqueta="Sede" error={form.error('sede')}>
            <select value={form.valores.sede} onChange={e => form.set('sede', e.target.value)}>
              {SEDES.map(s => <option key={s} value={s}>{SEDE_LARGA[s]}</option>)}
            </select>
          </Campo>
        </div>

        <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--borde)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 14 }}>
            <div>
              <div className="eyebrow">Módulos genéricos · escala 0 a {PUNTAJE_SABERPRO_MAX}</div>
              <p style={{ fontSize: 12.5, color: 'var(--ink-3)', margin: '6px 0 0' }}>
                Los cinco del reporte del ICFES. El global no se teclea: lo calcula la base como
                promedio simple de estos cinco.
              </p>
            </div>
            <div className="sp-admin-global" data-listo={global !== null}>
              <b>{global ?? '—'}</b>
              <span>Global calculado</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
            {MODULOS_SABERPRO.map(([k, etiqueta]) => campoPuntaje(k, etiqueta))}
          </div>
        </div>

        <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--borde)',
                      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
          <Campo etiqueta="Percentil nacional" error={form.error('percentil_nacional')} opcional>
            <input type="number" min="0" max="100" value={form.valores.percentil_nacional}
                   onChange={e => form.set('percentil_nacional', e.target.value)}
                   onBlur={() => form.alSalir('percentil_nacional')} />
          </Campo>
          <Campo etiqueta="Percentil NBC" error={form.error('percentil_nbc')} opcional>
            <input type="number" min="0" max="100" value={form.valores.percentil_nbc}
                   onChange={e => form.set('percentil_nbc', e.target.value)}
                   onBlur={() => form.alSalir('percentil_nbc')} />
          </Campo>
          <Campo etiqueta="Nivel de inglés" error={form.error('nivel_ingles')} opcional>
            <select value={form.valores.nivel_ingles} onChange={e => form.set('nivel_ingles', e.target.value)}>
              {NIVELES_INGLES.map(n => <option key={n} value={n}>{n || 'Sin registrar'}</option>)}
            </select>
          </Campo>
          <Campo etiqueta="Observaciones" error={form.error('observaciones')} opcional style={{ gridColumn: '1 / -1' }}>
            <textarea rows="2" value={form.valores.observaciones}
                      onChange={e => form.set('observaciones', e.target.value)}
                      onBlur={() => form.alSalir('observaciones')} />
          </Campo>
        </div>

        <Acciones editando={editando !== null} bloqueado={form.invalido}
                  onCancelar={() => { form.reiniciar(); setEditando(null) }} />
      </form>

      {lista === null && <p style={{ color: 'var(--ink-3)' }}>Cargando resultados…</p>}
      {lista?.length === 0 && (
        <p style={{ color: 'var(--ink-3)' }}>
          Todavía no hay resultados cargados. La página pública muestra un aviso hasta que haya al menos uno.
        </p>
      )}

      {lista?.length > 0 && (
        <div className="sp-tabla-marco">
          <table className="sp-tabla">
            <thead>
              <tr>
                <th scope="col">Estudiante</th>
                <th scope="col" className="sp-num">Año</th>
                <th scope="col" className="sp-num">Global</th>
                {MODULOS_SABERPRO.map(([k, etiqueta, sigla]) => (
                  <th key={k} scope="col" className="sp-num" title={etiqueta}>{sigla}</th>
                ))}
                <th scope="col" className="sp-num">Percentil</th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              {lista.map(r => (
                <tr key={r.id}>
                  <th scope="row" className="sp-nombre">
                    {r.estudiante}
                    <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 400 }}>
                      {[r.documento, r.registro].filter(Boolean).join(' · ') || 'sin documento'}
                    </span>
                  </th>
                  <td className="sp-num">{r.anio}</td>
                  <td className="sp-num"><span className="sp-pildora">{r.puntaje_global}</span></td>
                  {CLAVES_MODULOS.map(k => <td key={k} className="sp-num">{r[k]}</td>)}
                  <td className="sp-num">{r.percentil_nacional !== null ? r.percentil_nacional + '%' : '—'}</td>
                  <td><RowActions onEdit={() => editar(r)} onDelete={() => borrar(r.id)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

/* ─── Carga del reporte del ICFES ──────────────────────────────── */

/* Sube la hoja que entrega la facultad y la vuelca a la base.
 *
 * Dos pasos y no uno: primero se revisa —el servidor lee el archivo y cuenta
 * lo que traería, sin escribir— y solo después se carga. Reemplazar borra los
 * resultados que ya están publicados, y eso no debería pasar por accidente al
 * pulsar un botón que dice "subir".
 *
 * Las bases de cada competencia salen de la fórmula de la última columna de la
 * hoja, así que llegan solas con el archivo: nadie tiene que teclearlas ni
 * saber que están ahí. */
function PanelCargar({ setAviso, alCargar }) {
  const [archivo, setArchivo] = useState(null)
  const [reemplazar, setReemplazar] = useState(false)
  const [trabajando, setTrabajando] = useState(false)
  const [revision, setRevision] = useState(null)
  const [parte, setParte] = useState(null)

  const elegir = e => {
    setArchivo(e.target.files?.[0] ?? null)
    setRevision(null)
    setParte(null)
    setAviso(null)
  }

  const enviar = async simular => {
    if (!archivo) return
    setTrabajando(true)
    setAviso(null)
    try {
      const r = await apiSaberProImportar(archivo, { simular, reemplazar })
      if (simular) { setRevision(r); setParte(null) } else { setParte(r); setRevision(null); alCargar?.() }
    } catch (err) { setAviso(err.message) } finally { setTrabajando(false) }
  }

  const bases = revision?.bases ?? parte?.bases ?? null
  const completas = bases && CLAVES_MODULOS.every(k => Number.isInteger(bases[k]))
  const promedio = completas
    ? (CLAVES_MODULOS.reduce((a, k) => a + bases[k], 0) / CLAVES_MODULOS.length).toFixed(1)
    : null

  return (
    <div style={{ maxWidth: 820 }}>
      <div className="card" style={{ background: 'var(--paper-2)', marginBottom: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Cargar el reporte de la facultad</div>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 18px', lineHeight: 1.55 }}>
          La hoja de cálculo (.xlsx) tal como llega, sin prepararla. Se leen los resultados de
          cada estudiante y, de la fórmula de la última columna, el puntaje aprobatorio de cada
          competencia. Cada examen se reconoce por su número de registro del ICFES: volver a
          subir el mismo archivo actualiza, no duplica.
        </p>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label className="chip" style={{ cursor: 'pointer', padding: '8px 16px' }}>
            {archivo ? 'Cambiar archivo' : 'Elegir archivo'}
            <input type="file" accept=".xlsx,.xlsm" onChange={elegir} style={{ display: 'none' }} />
          </label>
          <span style={{ fontSize: 13, color: archivo ? 'var(--ink)' : 'var(--ink-3)' }}>
            {archivo ? archivo.name : 'ningún archivo elegido'}
          </span>
        </div>

        <label style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginTop: 16, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={reemplazar} onChange={e => setReemplazar(e.target.checked)}
                 style={{ marginTop: 3 }} />
          <span>
            <b>Reemplazar todo lo que hay</b>
            <span style={{ display: 'block', color: 'var(--ink-3)', fontSize: 12.5, marginTop: 2 }}>
              Borra los resultados cargados antes de escribir los del archivo. Úsalo cuando la
              hoja es el listado completo; si es un añadido, déjalo sin marcar.
            </span>
          </span>
        </label>

        <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
          <button type="button" className="btn ghost" disabled={!archivo || trabajando}
                  style={{ padding: '8px 18px' }} onClick={() => enviar(true)}>
            {trabajando ? 'Leyendo…' : 'Revisar sin cargar'}
          </button>
          <button type="button" className="btn accent" disabled={!archivo || trabajando}
                  style={{ padding: '8px 18px' }} onClick={() => enviar(false)}>
            {trabajando ? 'Cargando…' : reemplazar ? 'Reemplazar y cargar' : 'Cargar'} <Icons.check />
          </button>
        </div>
      </div>

      {bases && (
        <div className="card" style={{ background: 'var(--paper-2)', marginBottom: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Puntaje aprobatorio que trae el archivo</div>
          <p style={{ fontSize: 12.5, color: 'var(--ink-3)', margin: '0 0 14px' }}>
            Leído de la fórmula de la columna del veredicto. Se aprueba igualando o superando
            la base de cada competencia.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            {MODULOS_SABERPRO.map(([k, etiqueta]) => (
              <div key={k} style={{ border: '1px solid color-mix(in oklab, var(--ink) 10%, transparent)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{etiqueta}</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{bases[k] ?? '—'}</div>
              </div>
            ))}
            {promedio && (
              <div style={{ border: '1px solid var(--ug-azul)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>General (promedio)</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ug-azul-deep, var(--ug-azul))' }}>{promedio}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {revision && (
        <div className="card" style={{ background: 'var(--paper-2)', marginBottom: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 10 }}>
            Revisión · no se ha escrito nada
          </div>
          <p style={{ fontSize: 13, margin: '0 0 12px' }}>
            El archivo <b>{revision.archivo}</b> (hoja «{revision.hoja}») trae{' '}
            <b>{revision.leidas}</b> resultados.
            {reemplazar && ' Al cargar se borrarán antes los que ya están publicados.'}
          </p>
          <table className="sp-tabla" style={{ fontSize: 12.5 }}>
            <thead>
              <tr>
                <th>Estudiante</th><th>Período</th><th>Sede</th>
                {MODULOS_SABERPRO.map(([k, l]) => <th key={k} className="sp-num">{l}</th>)}
              </tr>
            </thead>
            <tbody>
              {revision.muestra.map((m, i) => (
                <tr key={i}>
                  <td>{m.estudiante}</td><td>{m.periodo}</td><td>{SEDE_LARGA[m.sede] ?? m.sede}</td>
                  {CLAVES_MODULOS.map(k => <td key={k} className="sp-num">{m[k]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 10 }}>
            Se muestran las primeras {revision.muestra.length} filas.
          </p>
          <Avisos lista={revision.avisos} />
        </div>
      )}

      {parte && (
        <div className="card" style={{ background: 'var(--paper-2)' }}>
          <div style={{ fontWeight: 600, marginBottom: 10 }}>Carga terminada</div>
          <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', fontSize: 13, marginBottom: 12 }}>
            {parte.borrados > 0 && <span><b style={{ fontSize: 18 }}>{parte.borrados}</b> borrados</span>}
            <span><b style={{ fontSize: 18 }}>{parte.nuevos}</b> nuevos</span>
            <span><b style={{ fontSize: 18 }}>{parte.actualizados}</b> actualizados</span>
            {parte.rechazados > 0 && <span style={{ color: 'var(--ug-flamingo-deep, var(--ug-flamingo))' }}>
              <b style={{ fontSize: 18 }}>{parte.rechazados}</b> rechazados
            </span>}
            <span style={{ color: 'var(--ink-3)' }}>
              en la base: <b>{parte.total}</b> resultados · media {parte.media}
            </span>
          </div>
          {parte.basesGuardadas && (
            <p style={{ fontSize: 12.5, color: 'var(--ink-3)', margin: '0 0 10px' }}>
              Las bases del archivo quedaron guardadas como puntaje aprobatorio; se ven y se
              corrigen en «Opción de grado».
            </p>
          )}
          {parte.rechazos?.length > 0 && (
            <ul style={{ margin: '0 0 10px', paddingLeft: 18, fontSize: 12.5, color: 'var(--ink-3)' }}>
              {parte.rechazos.map((r, i) => <li key={i}>{r.estudiante}: {r.motivo}</li>)}
            </ul>
          )}
          <Avisos lista={parte.avisos} />
        </div>
      )}
    </div>
  )
}

/* Lo que conviene mirar aunque no impida cargar: un global que no cuadra con
   sus módulos, un registro repetido. Callarlos dejaría pasar un dato torcido
   con el mismo aspecto que uno bueno. */
function Avisos({ lista }) {
  if (!lista?.length) return null
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--doc-ambar-texto, var(--ink-3))' }}>
        Para revisar ({lista.length})
      </div>
      <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 12.5, color: 'var(--ink-3)' }}>
        {lista.map((a, i) => <li key={i}>{a}</li>)}
      </ul>
    </div>
  )
}

/* ─── Parámetros de la opción de grado ─────────────────────────── */

const VACIO_PARAMETROS = {
  puntaje_minimo: '', percentil_minimo: '', minimo_por_modulo: '', norma: '', vigente_desde: '',
  ...Object.fromEntries(CLAVES_MODULOS.map(k => ['base_' + k, ''])),
}

function PanelParametros({ setAviso }) {
  const form = useFormulario('saberpro_parametros', VACIO_PARAMETROS)
  const [cargado, setCargado] = useState(false)
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    apiSaberProParametros()
      .then(p => {
        form.reiniciar(Object.fromEntries(
          Object.keys(VACIO_PARAMETROS).map(k => [k, p[k] === null || p[k] === undefined ? '' : String(p[k])]),
        ))
        setCargado(true)
      })
      .catch(e => setAviso(e.message))
  }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  /* El aprobatorio general no se teclea: es el promedio de las bases, y se
     recalcula mientras se escriben para que quien las corrija vea al momento
     adónde mueve el umbral general. */
  const bases = CLAVES_MODULOS.map(k => {
    const crudo = form.valores['base_' + k]
    return crudo === '' || crudo === null || crudo === undefined ? null : Number(crudo)
  })
  const completas = bases.every(n => Number.isFinite(n))
  const general = completas ? (bases.reduce((a, b) => a + b, 0) / bases.length).toFixed(1) : null

  const guardar = async e => {
    e.preventDefault()
    if (!form.validarTodo()) return
    try {
      await apiSaberProGuardarParametros(form.valores)
      setGuardado(true)
      setAviso(null)
      setTimeout(() => setGuardado(false), 2500)
    } catch (err) { setAviso(err.message) }
  }

  if (!cargado) return <p style={{ color: 'var(--ink-3)' }}>Cargando parámetros…</p>

  return (
    <Plegable id="tabsaberpro-0" titulo="Puntaje aprobatorio por competencia">
      <form className="card" style={{ background: 'var(--paper-2)', maxWidth: 720 }} onSubmit={guardar}>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 16px', lineHeight: 1.55 }}>
          Se gradúa por Saber Pro quien iguala o supera la base de <b>cada</b> competencia. Estas
          cifras llegan solas al cargar el reporte —están en la fórmula de su última columna— y se
          pueden corregir aquí si el Consejo fija otras.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
          {MODULOS_SABERPRO.map(([k, etiqueta]) => (
            <Campo key={k} etiqueta={etiqueta} error={form.error('base_' + k)} opcional>
              <input type="number" min="0" max={PUNTAJE_SABERPRO_MAX} value={form.valores['base_' + k]}
                     onChange={e => form.set('base_' + k, e.target.value)}
                     onBlur={() => form.alSalir('base_' + k)} placeholder="sin base" />
            </Campo>
          ))}
        </div>

        <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 8, background: 'var(--paper)', border: '1px solid color-mix(in oklab, var(--ink) 10%, transparent)' }}>
          {general ? (
            <>
              <span style={{ fontSize: 13 }}>Puntaje general aprobatorio</span>{' '}
              <b style={{ fontSize: 20, marginLeft: 6 }}>{general}</b>
              <span style={{ fontSize: 12, color: 'var(--ink-3)', marginLeft: 8 }}>
                promedio de las cinco bases · se calcula, no se escribe
              </span>
            </>
          ) : (
            <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>
              Faltan bases por completar: sin las cinco no hay promedio, y la página usa entonces
              los requisitos de abajo.
            </span>
          )}
        </div>

        <div style={{ fontWeight: 600, margin: '24px 0 8px', paddingTop: 20, borderTop: '1px solid color-mix(in oklab, var(--ink) 10%, transparent)' }}>
          Requisitos alternativos
        </div>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 20px', lineHeight: 1.55 }}>
          Solo se aplican <b>cuando no hay bases por competencia</b>: son el criterio anterior, un
          global mínimo con dos exigencias opcionales. Deja en blanco lo que tu acuerdo no pida.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          <Campo etiqueta="Puntaje global mínimo" error={form.error('puntaje_minimo')}>
            <input type="number" min="0" max={PUNTAJE_SABERPRO_MAX} value={form.valores.puntaje_minimo}
                   onChange={e => form.set('puntaje_minimo', e.target.value)}
                   onBlur={() => form.alSalir('puntaje_minimo')} required />
          </Campo>
          <Campo etiqueta="Percentil nacional mínimo" error={form.error('percentil_minimo')} opcional>
            <input type="number" min="0" max="100" value={form.valores.percentil_minimo}
                   onChange={e => form.set('percentil_minimo', e.target.value)}
                   onBlur={() => form.alSalir('percentil_minimo')} placeholder="no aplica" />
          </Campo>
          <Campo etiqueta="Mínimo en cada competencia" error={form.error('minimo_por_modulo')} opcional>
            <input type="number" min="0" max={PUNTAJE_SABERPRO_MAX} value={form.valores.minimo_por_modulo}
                   onChange={e => form.set('minimo_por_modulo', e.target.value)}
                   onBlur={() => form.alSalir('minimo_por_modulo')} placeholder="no aplica" />
          </Campo>
          <Campo etiqueta="Vigente desde" error={form.error('vigente_desde')} opcional>
            <input type="date" value={form.valores.vigente_desde}
                   onChange={e => form.set('vigente_desde', e.target.value)}
                   onBlur={() => form.alSalir('vigente_desde')} />
          </Campo>
          <Campo etiqueta="Norma que lo respalda" error={form.error('norma')} opcional style={{ gridColumn: '1 / -1' }}>
            <input value={form.valores.norma} onChange={e => form.set('norma', e.target.value)}
                   onBlur={() => form.alSalir('norma')}
                   placeholder="Acuerdo 000 de 2026 · Consejo Académico" />
          </Campo>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 18 }}>
          <button className="btn accent" type="submit" style={{ padding: '8px 20px' }}>
            Guardar requisitos <Icons.check />
          </button>
          {guardado && <span style={{ fontSize: 13, color: 'var(--ug-azul-deep)' }}>Guardado.</span>}
          {form.invalido && <span style={{ fontSize: 12, color: 'var(--ug-flamingo-deep)' }}>Corrige los campos marcados</span>}
        </div>

        {form.valores.vigente_desde && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', marginTop: 14 }}>
            La página citará: {form.valores.norma || 'norma sin registrar'} · vigente desde {fechaLarga(form.valores.vigente_desde)}
          </p>
        )}
      </form>
    </Plegable>
  )
}

export default function TabSaberPro() {
  const [tab, setTab] = usePestana(SUBPESTANAS, { clave: 'sub' })
  const [aviso, setAviso] = useState(null)
  /* Tras una carga, la lista y los parámetros que ya estaban montados muestran
     lo de antes. Cambiar esta cuenta los vuelve a montar con lo que hay. */
  const [recarga, setRecarga] = useState(0)

  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>Saber Pro</h3>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {SUBPESTANAS.map(([k, l]) => (
          <button key={k} className="chip" onClick={() => { setTab(k); setAviso(null) }}
                  aria-pressed={tab === k}
                  style={{ cursor: 'pointer', background: tab === k ? 'var(--ink)' : undefined, color: tab === k ? 'var(--paper)' : undefined }}>
            {l}
          </button>
        ))}
      </div>

      {aviso && <div role="alert" className="eg-alerta">{aviso}</div>}

      {tab === 'resultados' && <PanelResultados key={recarga} setAviso={setAviso} />}
      {tab === 'cargar' && (
        <PanelCargar setAviso={setAviso} alCargar={() => setRecarga(n => n + 1)} />
      )}
      {tab === 'parametros' && <PanelParametros key={recarga} setAviso={setAviso} />}
      {tab === 'carrusel' && (
        <EditorTarjetas
          seccion="saber-pro"
          setError={setAviso}
          ejemploPie="Reporte ICFES · 2025"
          descripcion="Las tarjetas que acompañan al titular de la página pública. Sirven para
            explicar el puntaje aprobatorio, cómo se lee el examen o publicar una infografía del
            período: se pueden cargar como imagen sola o como imagen con texto."
        />
      )}
    </div>
  )
}
