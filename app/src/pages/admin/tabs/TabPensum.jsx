/* Plan de estudios — catálogo de materias y armado de la malla.
 *
 * Son dos cosas distintas y la pestaña las separa a propósito:
 *   · el CATÁLOGO dice qué materias existen, con su área y su campo;
 *   · la MALLA dice cuáles de ellas componen el plan, en qué semestre y con
 *     cuántos créditos.
 *
 * La separación no es un capricho: al comparar la malla vigente con la
 * propuesta, 10 de las 13 materias que se llaman igual cambian de semestre o
 * de créditos. Si eso viviera en la materia, "Desarrollo Web" tendría que
 * valer 3 y 4 créditos a la vez.
 *
 * Los totales no se escriben en ningún sitio: los calcula el servidor al
 * devolver la malla.
 */
import { useState, useEffect, useCallback } from 'react'
import {
  useData, apiMaterias, apiCrearMateria, apiEditarMateria, apiBorrarMateria,
  apiAgregarAMalla, apiEditarEnMalla, apiQuitarDeMalla,
} from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'
import RowActions from '../RowActions'
import { AREAS_MATERIA, CAMPOS_MATERIA } from '../../../../shared/validacion'
import { usePestana } from '../../../hooks/useParametroURL'

const MATERIA_VACIA = { nombre: '', codigo: '', area: AREAS_MATERIA[0], campo: CAMPOS_MATERIA[0] }
const EN_MALLA_VACIA = { materia_id: '', creditos: 3, horas_semana: 4 }

export default function TabPensum() {
  const { data, aplicarPensum, setError } = useData()
  const pensum = data.pensum ?? []
  const info = data.pensum_info
  const planId = info?.plan?.id

  const [vista, setVista] = usePestana(['malla', 'catalogo'], { clave: 'sub' })
  const [semestre, setSemestre] = useState(1)
  const [catalogo, setCatalogo] = useState([])
  const [libres, setLibres] = useState([])

  const [formMateria, setFormMateria] = useState(MATERIA_VACIA)
  const [editandoMateria, setEditandoMateria] = useState(null)
  const [formMalla, setFormMalla] = useState(EN_MALLA_VACIA)

  const cargarCatalogo = useCallback(async () => {
    try {
      setCatalogo(await apiMaterias())
      if (planId) setLibres(await apiMaterias({ libres: planId }))
    } catch (e) { setError(e.message) }
  }, [planId, setError])

  useEffect(() => { cargarCatalogo() }, [cargarCatalogo])

  const sem = pensum.find(s => s.numero === semestre)
  const materias = sem?.materias ?? []

  /* ─── Catálogo ─── */

  const guardarMateria = async e => {
    e.preventDefault()
    try {
      if (editandoMateria) await apiEditarMateria(editandoMateria, formMateria)
      else await apiCrearMateria(formMateria)
      setFormMateria(MATERIA_VACIA); setEditandoMateria(null)
      await cargarCatalogo()
    } catch (err) { setError(err.message) }
  }

  const borrarMateria = async id => {
    try { await apiBorrarMateria(id); await cargarCatalogo() }
    catch (err) { setError(err.message) }
  }

  /* ─── Malla ─── */

  const agregarAMalla = async e => {
    e.preventDefault()
    if (!planId || !formMalla.materia_id) return
    try {
      const malla = await apiAgregarAMalla(planId, {
        materia_id: Number(formMalla.materia_id),
        semestre,
        creditos: Number(formMalla.creditos),
        horas_semana: Number(formMalla.horas_semana),
      })
      aplicarPensum(malla)
      setFormMalla(EN_MALLA_VACIA)
      await cargarCatalogo()
    } catch (err) { setError(err.message) }
  }

  const cambiarEnMalla = async (planMateriaId, cambios) => {
    try { aplicarPensum(await apiEditarEnMalla(planMateriaId, cambios)) }
    catch (err) { setError(err.message) }
  }

  const quitarDeMalla = async planMateriaId => {
    try { aplicarPensum(await apiQuitarDeMalla(planMateriaId)); await cargarCatalogo() }
    catch (err) { setError(err.message) }
  }

  if (!planId) {
    return (
      <div>
        <h3 style={{ marginBottom: 16 }}>Plan de Estudios</h3>
        <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>
          No hay ningún plan vigente en la base. Ejecuta <code>npm run db:importar-pensum</code> para cargar la malla.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 6 }}>
        <h3 style={{ margin: 0 }}>Plan de Estudios</h3>
        <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{info.plan.nombre}</span>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, fontSize: 13, color: 'var(--ink-3)' }}>
        <span><b>{info.total_materias}</b> asignaturas</span>
        <span>·</span>
        <span><b>{info.total_creditos}</b> créditos</span>
        <span style={{ opacity: .7 }}>(sumados, no escritos a mano)</span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['malla', 'Armar la malla'], ['catalogo', `Catálogo de materias (${catalogo.length})`]].map(([k, l]) => (
          <button key={k} className="chip" onClick={() => setVista(k)}
            style={{ cursor: 'pointer', background: vista === k ? 'var(--ug-marino)' : undefined, color: vista === k ? 'var(--paper)' : undefined, borderColor: vista === k ? 'transparent' : undefined }}>{l}</button>
        ))}
      </div>

      {vista === 'malla' ? (
        <>
          {/* Semestres */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
            {pensum.map(s => (
              <button key={s.numero} className="chip" onClick={() => setSemestre(s.numero)}
                style={{ cursor: 'pointer', minWidth: 62, background: semestre === s.numero ? 'var(--ug-azul)' : undefined, borderColor: semestre === s.numero ? 'transparent' : undefined }}>
                {s.numero}º <span style={{ opacity: .6, fontSize: 10 }}>{s.total_creditos}cr</span>
              </button>
            ))}
          </div>

          <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 20 }} onSubmit={agregarAMalla}>
            <div style={{ fontWeight: 600, marginBottom: 14 }}>Agregar materia al {semestre}.º semestre</div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
              <div className="field" style={{ margin: 0 }}>
                <label>Materia del catálogo</label>
                <select value={formMalla.materia_id} onChange={e => setFormMalla(f => ({ ...f, materia_id: e.target.value }))} required>
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
                <label>Horas / semana</label>
                <input type="number" min="0" max="40" value={formMalla.horas_semana}
                  onChange={e => setFormMalla(f => ({ ...f, horas_semana: e.target.value }))} />
              </div>
              <button className="btn accent" type="submit" style={{ padding: '8px 18px' }}>Agregar <Icons.check /></button>
            </div>
            {libres.length === 0 && (
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--ink-3)' }}>
                Todas las materias del catálogo ya están en la malla. Crea una nueva en la pestaña «Catálogo».
              </div>
            )}
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {materias.map(m => (
              <div key={m.plan_materia_id} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 180px 80px 80px auto', gap: 14, padding: '12px 0', borderBottom: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{m.codigo || '—'}</span>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{m.nombre}</div>
                <span className="chip" style={{ fontSize: 10 }}>{m.area}</span>
                <input type="number" min="0" max="12" defaultValue={m.creditos} title="Créditos"
                  onBlur={e => Number(e.target.value) !== m.creditos && cambiarEnMalla(m.plan_materia_id, { creditos: Number(e.target.value) })}
                  style={{ width: 64, padding: '4px 8px', fontSize: 13 }} />
                <select defaultValue={m.plan_materia_id && semestre} title="Mover de semestre"
                  onChange={e => cambiarEnMalla(m.plan_materia_id, { semestre: Number(e.target.value) })}
                  style={{ width: 70, padding: '4px 6px', fontSize: 13 }}>
                  {pensum.map(s => <option key={s.numero} value={s.numero}>{s.numero}º</option>)}
                </select>
                <RowActions onDelete={() => quitarDeMalla(m.plan_materia_id)} />
              </div>
            ))}
            {materias.length === 0 && (
              <div style={{ padding: '24px 0', color: 'var(--ink-3)', fontSize: 14 }}>
                Este semestre está vacío. Agrega materias con el formulario de arriba.
              </div>
            )}
          </div>

          {materias.length > 0 && (
            <div style={{ marginTop: 14, fontSize: 13, color: 'var(--ink-3)' }}>
              Semestre {semestre}: <b>{sem.total_creditos}</b> créditos · <b>{sem.total_horas}</b> horas semanales
            </div>
          )}
        </>
      ) : (
        <>
          <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 20 }} onSubmit={guardarMateria}>
            <div style={{ fontWeight: 600, marginBottom: 14 }}>
              {editandoMateria ? 'Editar materia' : 'Nueva materia del catálogo'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <div className="field" style={{ margin: 0 }}>
                <label>Nombre</label>
                <input value={formMateria.nombre} onChange={e => setFormMateria(f => ({ ...f, nombre: e.target.value }))} required minLength={3} />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Código (opcional)</label>
                <input value={formMateria.codigo} onChange={e => setFormMateria(f => ({ ...f, codigo: e.target.value }))} placeholder="273111" />
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
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button className="btn accent" type="submit" style={{ padding: '8px 18px' }}>
                {editandoMateria ? 'Guardar cambios' : 'Crear materia'} <Icons.check />
              </button>
              {editandoMateria && (
                <button type="button" className="btn ghost" style={{ padding: '8px 16px' }}
                  onClick={() => { setFormMateria(MATERIA_VACIA); setEditandoMateria(null) }}>Cancelar</button>
              )}
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--ink-3)' }}>
              Crear una materia no la pone en la malla: eso se hace en «Armar la malla», donde se le asigna semestre y créditos.
            </div>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {catalogo.map(m => (
              <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 190px 210px auto', gap: 14, padding: '11px 0', borderBottom: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{m.codigo || '—'}</span>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{m.nombre}</div>
                <span className="chip" style={{ fontSize: 10 }}>{m.area || 'sin área'}</span>
                <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{m.campo || '—'}</span>
                <RowActions
                  onEdit={() => { setFormMateria({ nombre: m.nombre, codigo: m.codigo, area: m.area || AREAS_MATERIA[0], campo: m.campo || CAMPOS_MATERIA[0] }); setEditandoMateria(m.id) }}
                  onDelete={() => borrarMateria(m.id)} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
