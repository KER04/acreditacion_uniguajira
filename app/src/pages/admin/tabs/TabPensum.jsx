/* Plan de estudios — catálogo de materias, armado de la malla y prerrequisitos.
 *
 * Tres cosas distintas, y la pestaña las separa a propósito:
 *   · el CATÁLOGO dice qué materias existen, con su área y su campo;
 *   · la MALLA dice cuáles componen un plan, en qué semestre y con cuántos
 *     créditos y horas;
 *   · los PRERREQUISITOS son del plan, no de la materia: en una malla Cálculo
 *     II puede exigir Cálculo I y en otra no.
 *
 * La separación no es un capricho: entre la malla vigente y la propuesta, las
 * asignaturas que se llaman igual cambian de semestre y de créditos. Si eso
 * viviera en la materia, "Desarrollo Web" tendría que valer 3 y 4 a la vez.
 *
 * Ningún total se escribe a mano: los calcula el servidor al devolver la malla.
 */
import { useState, useEffect, useCallback } from 'react'
import {
  useData, apiMaterias, apiCrearMateria, apiEditarMateria, apiBorrarMateria,
  apiAgregarAMalla, apiEditarEnMalla, apiQuitarDeMalla,
  apiPlanes, apiPensum, apiAgregarPrerrequisito, apiQuitarPrerrequisito, apiEditarPlan,
} from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'
import RowActions from '../RowActions'
import { AREAS_MATERIA, CAMPOS_MATERIA } from '../../../../shared/validacion'
import { usePestana } from '../../../hooks/useParametroURL'

const MATERIA_VACIA = { nombre: '', codigo: '', area: AREAS_MATERIA[0], campo: CAMPOS_MATERIA[0] }
const EN_MALLA_VACIA = { materia_id: '', creditos: 3, horas_semana: 4 }

export default function TabPensum() {
  const { aplicarPensum, setError } = useData()

  const [planes, setPlanes] = useState([])
  const [planId, setPlanId] = useState(null)
  const [malla, setMalla] = useState(null)
  const [semestre, setSemestre] = useState(1)

  const [vista, setVista] = usePestana(['malla', 'catalogo'], { clave: 'sub' })
  const [catalogo, setCatalogo] = useState([])
  const [libres, setLibres] = useState([])

  const [formMateria, setFormMateria] = useState(MATERIA_VACIA)
  const [editandoMateria, setEditandoMateria] = useState(null)
  const [formMalla, setFormMalla] = useState(EN_MALLA_VACIA)

  /* Qué fila tiene abierto su editor de prerrequisitos. */
  const [abierta, setAbierta] = useState(null)

  /* ─── Carga ─── */

  useEffect(() => {
    apiPlanes()
      .then(ps => {
        setPlanes(ps)
        setPlanId(actual => actual ?? ps.find(x => x.vigente)?.id ?? ps[0]?.id ?? null)
      })
      .catch(e => setError(e.message))
  }, [setError])

  /* Guarda la malla y, si es la vigente, la propaga al resto de la app para
     que el sitio público no se quede con la versión anterior. */
  const aplicar = useCallback(m => {
    setMalla(m)
    if (m?.plan?.vigente) aplicarPensum(m)
  }, [aplicarPensum])

  const recargarTodo = useCallback(async id => {
    if (!id) return
    try {
      const [m, cat, lib, ps] = await Promise.all([
        apiPensum(id), apiMaterias(), apiMaterias({ libres: id }), apiPlanes(),
      ])
      aplicar(m); setCatalogo(cat); setLibres(lib); setPlanes(ps)
    } catch (e) { setError(e.message) }
  }, [aplicar, setError])

  useEffect(() => { recargarTodo(planId) }, [planId, recargarTodo])

  /* Al cambiar de plan el semestre elegido puede no existir en el nuevo. */
  useEffect(() => {
    if (malla && semestre > malla.plan.num_semestres) setSemestre(1)
  }, [malla, semestre])

  const sem = malla?.semestres.find(s => s.numero === semestre)
  const materias = sem?.materias ?? []

  /* Solo pueden ser prerrequisito las materias de semestres anteriores. El
     servidor lo rechaza igualmente, pero no tiene sentido ofrecer lo que va
     a rechazar. */
  const candidatas = deSemestre =>
    (malla?.semestres ?? [])
      .filter(s => s.numero < deSemestre)
      .flatMap(s => s.materias.map(m => ({ ...m, semestre: s.numero })))

  /* ─── Acciones ─── */

  const conError = fn => async (...args) => {
    try { await fn(...args) } catch (e) { setError(e.message) }
  }

  const agregarAMalla = conError(async e => {
    e.preventDefault()
    if (!planId || !formMalla.materia_id) return
    aplicar(await apiAgregarAMalla(planId, {
      materia_id: Number(formMalla.materia_id),
      semestre,
      creditos: Number(formMalla.creditos),
      horas_semana: Number(formMalla.horas_semana),
    }))
    setFormMalla(EN_MALLA_VACIA)
    await recargarTodo(planId)
  })

  const cambiar = conError(async (id, cambios) => aplicar(await apiEditarEnMalla(id, cambios)))
  const quitar = conError(async id => { aplicar(await apiQuitarDeMalla(id)); await recargarTodo(planId) })

  const ponerPrerreq = conError(async (materiaId, requisitoId, tipo) => {
    if (!requisitoId) return
    aplicar(await apiAgregarPrerrequisito(planId, {
      materia_id: materiaId, prerrequisito_id: Number(requisitoId), tipo,
    }))
  })

  const sacarPrerreq = conError(async (materiaId, requisitoId) =>
    aplicar(await apiQuitarPrerrequisito(planId, { materia_id: materiaId, prerrequisito_id: requisitoId })))

  const guardarMateria = conError(async e => {
    e.preventDefault()
    if (editandoMateria) await apiEditarMateria(editandoMateria, formMateria)
    else await apiCrearMateria(formMateria)
    setFormMateria(MATERIA_VACIA); setEditandoMateria(null)
    await recargarTodo(planId)
  })

  const borrarMateria = conError(async id => { await apiBorrarMateria(id); await recargarTodo(planId) })

  const cambiarEtapa = conError(async clave => aplicar(await apiEditarPlan(planId, { etapa_tramite: clave })))

  /* ─── Render ─── */

  if (!malla?.plan) {
    return (
      <div>
        <h3 style={{ marginBottom: 16 }}>Plan de Estudios</h3>
        <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>
          {planes.length === 0
            ? <>No hay ningún plan en la base. Ejecuta <code>npm run db:importar-pensum</code>.</>
            : 'Cargando…'}
        </p>
      </div>
    )
  }

  return (
    <div>
      <h3 style={{ marginBottom: 14 }}>Plan de Estudios</h3>

      {/* Selector de plan: la malla vigente y la propuesta se editan igual. */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {planes.map(x => (
          <button key={x.id} className="chip" onClick={() => { setPlanId(x.id); setAbierta(null) }}
            style={{ cursor: 'pointer', padding: '8px 14px',
              background: planId === x.id ? 'var(--ug-marino)' : undefined,
              color: planId === x.id ? 'var(--paper)' : undefined,
              borderColor: planId === x.id ? 'transparent' : undefined }}>
            {x.nombre}
            {x.vigente && <span style={{ marginLeft: 8, fontSize: 10, opacity: .75 }}>vigente</span>}
          </button>
        ))}
      </div>

      {/* Estado del trámite. Solo aparece si el plan tiene etapas registradas:
          la malla vigente ya está aprobada y no tiene nada que seguir.
          Es lo que pinta la línea de tiempo de la página pública, así que
          moverlo aquí mueve lo que ve el visitante. */}
      {malla.tramite.length > 0 && (() => {
        const actual = malla.tramite.findIndex(t => t.clave === malla.plan.etapa_tramite)
        const i = Math.max(0, actual)
        const etapa = malla.tramite[i]
        return (
          <div className="card" style={{ background: 'var(--paper-2)', marginBottom: 18, padding: '14px 16px' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <label htmlFor="etapa-tramite" style={{ fontWeight: 600, fontSize: 13 }}>
                Estado del trámite
              </label>
              <select id="etapa-tramite" value={malla.plan.etapa_tramite}
                onChange={e => cambiarEtapa(e.target.value)}
                style={{ padding: '6px 10px', fontSize: 13, minWidth: 280 }}>
                {malla.tramite.map((t, n) => (
                  <option key={t.clave} value={t.clave}>{n + 1}. {t.etapa}</option>
                ))}
              </select>
              <span className="chip" style={{ fontSize: 11 }}>
                Etapa {i + 1} de {malla.tramite.length}
              </span>
              {actual < 0 && (
                <span style={{ fontSize: 11, color: 'var(--ug-flamingo)' }}>
                  la etapa guardada no coincide con ninguna: elige una
                </span>
              )}
            </div>
            {etapa?.detalle && (
              <p style={{ margin: '10px 0 0', fontSize: 12.5, color: 'var(--ink-3)', maxWidth: '76ch' }}>
                {etapa.detalle}
              </p>
            )}
            <p style={{ margin: '8px 0 0', fontSize: 11.5, color: 'var(--ink-3)' }}>
              Se guarda al elegir, y cambia de inmediato la línea de tiempo de la página pública.
            </p>
          </div>
        )
      })()}

      <div style={{ display: 'flex', gap: 10, marginBottom: 18, fontSize: 13, color: 'var(--ink-3)', flexWrap: 'wrap' }}>
        <span><b>{malla.total_materias}</b> asignaturas</span><span>·</span>
        <span><b>{malla.total_creditos}</b> créditos</span><span>·</span>
        <span><b>{malla.total_horas}</b> horas/semana</span><span>·</span>
        <span><b>{malla.total_prerrequisitos}</b> prerrequisitos</span>
        <span style={{ opacity: .7 }}>(todo sumado, nada escrito a mano)</span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['malla', 'Armar la malla'], ['catalogo', `Catálogo (${catalogo.length})`]].map(([k, l]) => (
          <button key={k} className="chip" onClick={() => setVista(k)}
            style={{ cursor: 'pointer', background: vista === k ? 'var(--ug-azul)' : undefined,
              borderColor: vista === k ? 'transparent' : undefined }}>{l}</button>
        ))}
      </div>

      {vista === 'malla' ? (
        <>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
            {malla.semestres.map(s => (
              <button key={s.numero} className="chip" onClick={() => { setSemestre(s.numero); setAbierta(null) }}
                style={{ cursor: 'pointer', minWidth: 68,
                  background: semestre === s.numero ? 'var(--ug-azul)' : undefined,
                  borderColor: semestre === s.numero ? 'transparent' : undefined }}>
                {s.numero}º <span style={{ opacity: .6, fontSize: 10 }}>{s.total_creditos}cr</span>
              </button>
            ))}
          </div>

          <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 18 }} onSubmit={agregarAMalla}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Agregar materia al {semestre}.º semestre</div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 90px 90px auto', gap: 12, alignItems: 'end' }}>
              <div className="field" style={{ margin: 0 }}>
                <label>Materia del catálogo</label>
                <select value={formMalla.materia_id} required
                  onChange={e => setFormMalla(f => ({ ...f, materia_id: e.target.value }))}>
                  <option value="">Elegir…</option>
                  {libres.map(m => <option key={m.id} value={m.id}>{m.nombre}{m.codigo ? ` (${m.codigo})` : ''}</option>)}
                </select>
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Créditos</label>
                <input type="number" min="0" max="12" value={formMalla.creditos}
                  onChange={e => setFormMalla(f => ({ ...f, creditos: e.target.value }))} />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Horas</label>
                <input type="number" min="0" max="40" value={formMalla.horas_semana}
                  onChange={e => setFormMalla(f => ({ ...f, horas_semana: e.target.value }))} />
              </div>
              <button className="btn accent" type="submit" style={{ padding: '8px 18px' }}>Agregar <Icons.check /></button>
            </div>
            {libres.length === 0 && (
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--ink-3)' }}>
                Todas las materias del catálogo ya están en esta malla. Crea una nueva en «Catálogo».
              </div>
            )}
          </form>

          {materias.map(m => {
            const expandida = abierta === m.plan_materia_id
            const opciones = candidatas(semestre)
              .filter(c => !m.prerrequisitos.some(pr => pr.materia_id === c.materia_id))
            return (
              <div key={m.plan_materia_id} style={{ borderBottom: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '84px 1fr 160px 62px 62px 58px auto', gap: 12, padding: '11px 0', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{m.codigo || '—'}</span>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{m.nombre}</div>
                  <span className="chip" style={{ fontSize: 10 }}>{m.area}</span>
                  <input type="number" min="0" max="12" defaultValue={m.creditos} title="Créditos"
                    onBlur={e => Number(e.target.value) !== m.creditos && cambiar(m.plan_materia_id, { creditos: Number(e.target.value) })}
                    style={{ width: 56, padding: '4px 6px', fontSize: 13 }} />
                  <input type="number" min="0" max="40" defaultValue={m.horas_semana} title="Horas por semana"
                    onBlur={e => Number(e.target.value) !== m.horas_semana && cambiar(m.plan_materia_id, { horas_semana: Number(e.target.value) })}
                    style={{ width: 56, padding: '4px 6px', fontSize: 13 }} />
                  <select value={semestre} title="Mover de semestre"
                    onChange={e => cambiar(m.plan_materia_id, { semestre: Number(e.target.value) })}
                    style={{ width: 54, padding: '4px 4px', fontSize: 13 }}>
                    {malla.semestres.map(s => <option key={s.numero} value={s.numero}>{s.numero}º</option>)}
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button type="button" className="chip" title="Prerrequisitos"
                      onClick={() => setAbierta(expandida ? null : m.plan_materia_id)}
                      style={{ cursor: 'pointer', fontSize: 10, padding: '4px 9px',
                        background: m.prerrequisitos.length ? 'color-mix(in oklab, var(--ug-azul) 22%, transparent)' : undefined }}>
                      {expandida ? '▾' : '▸'} req{m.prerrequisitos.length > 0 && <b> {m.prerrequisitos.length}</b>}
                    </button>
                    <RowActions onDelete={() => quitar(m.plan_materia_id)} />
                  </div>
                </div>

                {expandida && (
                  <div style={{ padding: '4px 0 16px 84px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      {m.prerrequisitos.length === 0 && (
                        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Sin prerrequisitos.</span>
                      )}
                      {m.prerrequisitos.map(pr => (
                        <span key={pr.materia_id} className="chip"
                          style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                          {pr.nombre}
                          {pr.tipo === 'correquisito' && <em style={{ opacity: .6, fontSize: 10 }}>correq.</em>}
                          <button type="button" aria-label={`Quitar ${pr.nombre}`}
                            onClick={() => sacarPrerreq(m.materia_id, pr.materia_id)}
                            style={{ border: 0, background: 'none', cursor: 'pointer', font: 'inherit', color: 'var(--ink-3)', padding: 0, lineHeight: 1 }}>×</button>
                        </span>
                      ))}
                    </div>

                    {semestre === 1 ? (
                      <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                        Las materias del primer semestre no pueden tener prerrequisitos.
                      </span>
                    ) : opciones.length === 0 ? (
                      <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                        No quedan materias de semestres anteriores por agregar.
                      </span>
                    ) : (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <select defaultValue="" style={{ padding: '5px 8px', fontSize: 13, maxWidth: 360 }}
                          onChange={e => { ponerPrerreq(m.materia_id, e.target.value, 'prerrequisito'); e.target.value = '' }}>
                          <option value="">Agregar prerrequisito…</option>
                          {opciones.map(c => (
                            <option key={c.materia_id} value={c.materia_id}>{c.semestre}º · {c.nombre}</option>
                          ))}
                        </select>
                        <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                          solo materias de semestres anteriores
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {materias.length === 0 && (
            <div style={{ padding: '24px 0', color: 'var(--ink-3)', fontSize: 14 }}>
              Este semestre está vacío. Agrega materias con el formulario de arriba.
            </div>
          )}

          {materias.length > 0 && (
            <div style={{ marginTop: 14, fontSize: 13, color: 'var(--ink-3)' }}>
              Semestre {semestre}: <b>{sem.total_creditos}</b> créditos · <b>{sem.total_horas}</b> horas semanales
            </div>
          )}
        </>
      ) : (
        <>
          <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 18 }} onSubmit={guardarMateria}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>
              {editandoMateria ? 'Editar materia' : 'Nueva materia del catálogo'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <div className="field" style={{ margin: 0 }}>
                <label>Nombre</label>
                <input value={formMateria.nombre} required minLength={3}
                  onChange={e => setFormMateria(f => ({ ...f, nombre: e.target.value }))} />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Código (opcional)</label>
                <input value={formMateria.codigo} placeholder="273111"
                  onChange={e => setFormMateria(f => ({ ...f, codigo: e.target.value }))} />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Área</label>
                <select value={formMateria.area} onChange={e => setFormMateria(f => ({ ...f, area: e.target.value }))}>
                  {AREAS_MATERIA.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Campo de formación</label>
                <select value={formMateria.campo} onChange={e => setFormMateria(f => ({ ...f, campo: e.target.value }))}>
                  {CAMPOS_MATERIA.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button className="btn accent" type="submit" style={{ padding: '8px 18px' }}>
                {editandoMateria ? 'Guardar cambios' : 'Crear materia'} <Icons.check />
              </button>
              {editandoMateria && (
                <button type="button" className="btn ghost" style={{ padding: '8px 16px' }}
                  onClick={() => { setFormMateria(MATERIA_VACIA); setEditandoMateria(null) }}>Cancelar</button>
              )}
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--ink-3)' }}>
              El catálogo lo comparten los dos planes: crear una materia no la pone en ninguna
              malla, eso se hace en «Armar la malla».
            </div>
          </form>

          {catalogo.map(m => (
            <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '84px 1fr 180px 200px auto', gap: 12, padding: '10px 0', borderBottom: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{m.codigo || '—'}</span>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{m.nombre}</div>
              <span className="chip" style={{ fontSize: 10 }}>{m.area || 'sin área'}</span>
              <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{m.campo || '—'}</span>
              <RowActions
                onEdit={() => { setFormMateria({ nombre: m.nombre, codigo: m.codigo, area: m.area || AREAS_MATERIA[0], campo: m.campo || CAMPOS_MATERIA[0] }); setEditandoMateria(m.id) }}
                onDelete={() => borrarMateria(m.id)} />
            </div>
          ))}
        </>
      )}
    </div>
  )
}
