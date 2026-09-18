import { useEffect, useState } from 'react'
import { usePestana } from '../../../hooks/useParametroURL'
import {
  apiSaberProResultados, apiSaberProCrear, apiSaberProEditar, apiSaberProBorrar,
  apiSaberProParametros, apiSaberProGuardarParametros,
} from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'
import RowActions from '../RowActions'
import SelectorAnio from '../../../components/SelectorAnio'
import { useFormulario, Campo, Acciones } from '../../../components/formulario'
import {
  MODULOS_SABERPRO, CLAVES_MODULOS, NIVELES_INGLES, SEDES,
  PUNTAJE_SABERPRO_MAX, globalSaberPro, fechaLarga,
} from '../../../../shared/validacion'

const SUBPESTANAS = [['resultados', 'Resultados'], ['parametros', 'Opción de grado']]
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

/* ─── Parámetros de la opción de grado ─────────────────────────── */

const VACIO_PARAMETROS = {
  puntaje_minimo: '', percentil_minimo: '', minimo_por_modulo: '', norma: '', vigente_desde: '',
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
    <form className="card" style={{ background: 'var(--paper-2)', maxWidth: 720 }} onSubmit={guardar}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Requisitos para graduarse por puntaje</div>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 20px', lineHeight: 1.55 }}>
        Estos números deciden quién aparece en la lista pública de la opción de grado. No están
        escritos en el código a propósito: los fija un acuerdo del Consejo Académico y cambian sin
        que haya que tocar el sitio. Deja en blanco los que tu acuerdo no exija.
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
  )
}

export default function TabSaberPro() {
  const [tab, setTab] = usePestana(SUBPESTANAS, { clave: 'sub' })
  const [aviso, setAviso] = useState(null)

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

      {tab === 'resultados' && <PanelResultados setAviso={setAviso} />}
      {tab === 'parametros' && <PanelParametros setAviso={setAviso} />}
    </div>
  )
}
