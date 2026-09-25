/* Propuesta de actualización curricular — todo lo que se ve en /pensum-propuesto.
 *
 * La página pública tiene cuatro piezas y esta pestaña las cubre las cuatro:
 *   · el ENCABEZADO: insignia, titular y entradilla;
 *   · las TARJETAS del carrusel que va al costado del titular;
 *   · el TRÁMITE: las etapas y en cuál va el plan;
 *   · la MALLA: créditos, asignaturas y semestres.
 *
 * La malla no se edita aquí. Armarla es el mismo trabajo para la propuesta y
 * para el plan vigente, y ya vive en «Plan de estudios»; duplicar esa pantalla
 * garantizaría que las dos copias se fueran separando. Lo que sí hay es el
 * resumen y el atajo, porque las cifras del encabezado salen de ahí.
 *
 * Qué plan se edita no se elige: es el plan no vigente, que es lo que la
 * página pública entiende por «la propuesta». Un selector abriría la puerta a
 * editar aquí la malla vigente, que no tiene ni carrusel ni trámite.
 */
import { useState, useEffect, useCallback } from 'react'
import {
  useData, apiPlanes, apiPensum, apiEditarPlan,
  apiCrearEtapa, apiEditarEtapa, apiBorrarEtapa, apiOrdenarEtapas,
} from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'
import RowActions from '../RowActions'
import Plegable from '../Plegable'
import EditorTarjetas from '../EditorTarjetas'
import { usePestana } from '../../../hooks/useParametroURL'

const VISTAS = [
  ['encabezado', 'Encabezado'],
  ['tarjetas', 'Tarjetas del carrusel'],
  ['tramite', 'Estado del trámite'],
  ['malla', 'Malla y cifras'],
]

const ETAPA_VACIA = { clave: '', etapa: '', detalle: '' }

const BORDE = '1px solid color-mix(in oklab, var(--ink) 8%, transparent)'

/* Estilo de la pastilla que hace de sub-pestaña, igual que en «Plan de
   estudios» para que las dos secciones del pensum se manejen igual. */
const pastilla = (activa, color = 'var(--ug-azul)') => ({
  cursor: 'pointer',
  background: activa ? color : undefined,
  borderColor: activa ? 'transparent' : undefined,
  color: activa ? 'var(--paper)' : undefined,
})

/* «Radicación ante el MEN» → «radicacion-ante-el-men». La clave identifica la
   etapa dentro del plan y viaja en el value de un <select>, así que se deriva
   del nombre en vez de pedirla: nadie tiene por qué inventar un identificador
   para escribir un paso del trámite. */
function claveDesde(texto) {
  return String(texto)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

/* ─── Encabezado ───────────────────────────────────────────────── */

/* El formulario no guarda al teclear: un titular a medio escribir estaría
   publicado en la página mientras alguien lo piensa. Se guarda al pulsar, y
   hasta entonces el aviso dice que hay cambios sin publicar. */
function Encabezado({ plan, onGuardar }) {
  const [form, setForm] = useState(() => ({
    hero_insignia: plan.hero_insignia ?? '',
    hero_titulo: plan.hero_titulo ?? '',
    hero_titulo_acento: plan.hero_titulo_acento ?? '',
    hero_texto: plan.hero_texto ?? '',
    titulo: plan.titulo ?? '',
    nombre: plan.nombre ?? '',
  }))
  const [guardando, setGuardando] = useState(false)

  /* Si el plan cambia por fuera —otra pestaña, otra sesión— el formulario se
     resincroniza en vez de seguir mostrando lo que había al montar. */
  useEffect(() => {
    setForm({
      hero_insignia: plan.hero_insignia ?? '',
      hero_titulo: plan.hero_titulo ?? '',
      hero_titulo_acento: plan.hero_titulo_acento ?? '',
      hero_texto: plan.hero_texto ?? '',
      titulo: plan.titulo ?? '',
      nombre: plan.nombre ?? '',
    })
  }, [plan])

  const campo = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const sucio = Object.entries(form).some(([k, v]) => v !== (plan[k] ?? ''))

  const enviar = async e => {
    e.preventDefault()
    setGuardando(true)
    try { await onGuardar(form) } finally { setGuardando(false) }
  }

  return (
    <form onSubmit={enviar}>
      {/* La vista previa es el mismo titular que pinta la página, con el mismo
          corte en dos mitades. Sin esto no hay forma de ver dónde cae el color
          hasta después de guardar. */}
      <div className="card" style={{ background: 'var(--paper-2)', marginBottom: 18 }}>
        <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>
          Así se verá
        </div>
        <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--doc-ambar-texto, var(--ink-3))' }}>
          {form.hero_insignia || '(sin insignia)'}
        </p>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, lineHeight: 1.15 }}>
          {form.hero_titulo || '(sin titular)'}{' '}
          <span style={{ color: 'var(--doc-hero-acento, var(--ug-azul))' }}>{form.hero_titulo_acento}</span>
        </div>
        {form.hero_texto && (
          <p style={{ margin: '10px 0 0', fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-3)', maxWidth: '76ch' }}>
            {form.hero_texto}
          </p>
        )}
      </div>

      <div className="card" style={{ background: 'var(--paper-2)' }}>
        <div className="field">
          <label>Insignia</label>
          <input value={form.hero_insignia} maxLength={160}
            placeholder="Propuesta de actualización curricular · En trámite, no vigente"
            onChange={e => campo('hero_insignia', e.target.value)} />
          <small style={{ color: 'var(--ink-3)', fontSize: 11.5 }}>
            La pastilla ámbar de arriba. Es lo que avisa que el plan todavía no rige.
          </small>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="field" style={{ margin: 0 }}>
            <label>Titular</label>
            <input value={form.hero_titulo} maxLength={160} placeholder="Ocho semestres,"
              onChange={e => campo('hero_titulo', e.target.value)} />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Titular resaltado</label>
            <input value={form.hero_titulo_acento} maxLength={160} placeholder="un plan más corto y más denso."
              onChange={e => campo('hero_titulo_acento', e.target.value)} />
          </div>
        </div>
        <small style={{ color: 'var(--ink-3)', fontSize: 11.5, display: 'block', margin: '6px 0 14px' }}>
          El titular se pinta en dos mitades: la segunda va en color. Déjala vacía si
          prefieres una sola frase.
        </small>

        <div className="field">
          <label>Entradilla</label>
          <textarea rows={5} value={form.hero_texto} maxLength={1200}
            onChange={e => campo('hero_texto', e.target.value)}
            style={{ width: '100%', resize: 'vertical' }} />
          <small style={{ color: 'var(--ink-3)', fontSize: 11.5 }}>
            {form.hero_texto.length}/1200 caracteres.
          </small>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingTop: 14, borderTop: BORDE }}>
          <div className="field" style={{ margin: 0 }}>
            <label>Nombre corto del plan</label>
            <input value={form.nombre} minLength={3} maxLength={120}
              onChange={e => campo('nombre', e.target.value)} />
            <small style={{ color: 'var(--ink-3)', fontSize: 11.5 }}>
              Interno: es como aparece el plan en el selector del panel.
            </small>
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Título largo</label>
            <input value={form.titulo} maxLength={160}
              onChange={e => campo('titulo', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 16 }}>
          <button className="btn accent" type="submit" disabled={!sucio || guardando} style={{ padding: '9px 20px' }}>
            {guardando ? 'Guardando…' : 'Publicar cambios'} <Icons.check />
          </button>
          {sucio && !guardando && (
            <span style={{ fontSize: 12, color: 'var(--doc-ambar-texto, var(--ink-3))' }}>
              Hay cambios sin publicar.
            </span>
          )}
        </div>
      </div>
    </form>
  )
}

/* ─── Etapas del trámite ───────────────────────────────────────── */

function FilaEtapa({ etapa, indice, total, actual, acciones }) {
  const [form, setForm] = useState(etapa)
  useEffect(() => setForm(etapa), [etapa])

  const campo = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const sucio = ['etapa', 'detalle'].some(k => (form[k] ?? '') !== (etapa[k] ?? ''))
  const estado = indice < actual ? 'surtida' : indice === actual ? 'en curso' : 'pendiente'

  return (
    <div style={{ borderBottom: BORDE, padding: '14px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '34px 1fr auto', gap: 14, alignItems: 'start' }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700,
          background: indice <= actual ? 'var(--ug-azul)' : 'var(--paper-3, var(--paper-2))',
          color: indice <= actual ? 'var(--paper)' : 'var(--ink-3)', border: BORDE }}>
          {indice + 1}
        </div>

        <div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
            <input value={form.etapa} minLength={3} maxLength={120}
              onChange={e => campo('etapa', e.target.value)}
              style={{ flex: '1 1 260px', fontWeight: 600 }} />
            <span className="chip" style={{ fontSize: 10 }}>{estado}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-3)' }}>{etapa.clave}</span>
          </div>
          <textarea rows={2} value={form.detalle ?? ''} maxLength={600} placeholder="Qué pasa en esta etapa"
            onChange={e => campo('detalle', e.target.value)} style={{ width: '100%', resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8 }}>
            <button type="button" className="btn accent" disabled={!sucio} style={{ padding: '6px 14px', fontSize: 12.5 }}
              onClick={() => acciones.guardar(etapa.id, { etapa: form.etapa, detalle: form.detalle ?? '' })}>
              Guardar
            </button>
            {indice !== actual && (
              <button type="button" className="chip" style={{ cursor: 'pointer', fontSize: 11 }}
                onClick={() => acciones.marcarActual(etapa.clave)}>
                Marcar como etapa en curso
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <button type="button" className="chip" disabled={indice === 0} aria-label="Subir de posición"
              onClick={() => acciones.mover(etapa.id, -1)}
              style={{ cursor: indice === 0 ? 'default' : 'pointer', opacity: indice === 0 ? .4 : 1, padding: '4px 9px' }}>↑</button>
            <button type="button" className="chip" disabled={indice === total - 1} aria-label="Bajar de posición"
              onClick={() => acciones.mover(etapa.id, 1)}
              style={{ cursor: indice === total - 1 ? 'default' : 'pointer', opacity: indice === total - 1 ? .4 : 1, padding: '4px 9px' }}>↓</button>
          </div>
          <RowActions onDelete={() => acciones.borrar(etapa.id)} />
        </div>
      </div>
    </div>
  )
}

/* ─── Pestaña ──────────────────────────────────────────────────── */

export default function TabPropuesta() {
  const { aplicarPensum, setError } = useData()

  const [planId, setPlanId] = useState(null)
  const [sinPropuesta, setSinPropuesta] = useState(false)
  const [malla, setMalla] = useState(null)
  const [vista, setVista] = usePestana(VISTAS, { clave: 'sub' })

  const [formEtapa, setFormEtapa] = useState(ETAPA_VACIA)

  /* Qué plan es la propuesta: el no vigente. Si hubiera varios se toma el más
     reciente, que es el mismo criterio que usa /api/all para la página. */
  useEffect(() => {
    apiPlanes()
      .then(ps => {
        const propuesta = [...ps].reverse().find(p => !p.vigente)
        setSinPropuesta(!propuesta)
        setPlanId(propuesta?.id ?? null)
      })
      .catch(e => setError(e.message))
  }, [setError])

  /* Toda respuesta del servidor trae la malla recalculada; guardarla aquí y
     propagarla deja el panel y la página pública mirando lo mismo sin una
     segunda petición. */
  const aplicar = useCallback(m => {
    setMalla(m)
    aplicarPensum(m)
  }, [aplicarPensum])

  useEffect(() => {
    if (!planId) return
    apiPensum(planId).then(aplicar).catch(e => setError(e.message))
  }, [planId, aplicar, setError])

  const conError = fn => async (...args) => {
    try { await fn(...args) } catch (e) { setError(e.message) }
  }

  const recargar = async () => aplicar(await apiPensum(planId))

  /* ─── Acciones del encabezado ─── */

  const guardarPlan = conError(async datos => aplicar(await apiEditarPlan(planId, datos)))

  /* ─── Acciones del trámite ─── */

  const etapas = malla?.tramite ?? []
  const actual = Math.max(0, etapas.findIndex(t => t.clave === malla?.plan?.etapa_tramite))

  const accionesEtapa = {
    guardar: conError(async (id, cambios) => aplicar(await apiEditarEtapa(id, cambios))),
    borrar: conError(async id => aplicar(await apiBorrarEtapa(id))),
    marcarActual: conError(async clave => aplicar(await apiEditarPlan(planId, { etapa_tramite: clave }))),
    mover: conError(async (id, paso) => {
      const orden = etapas.map(t => t.id)
      const i = orden.indexOf(id)
      const j = i + paso
      if (i < 0 || j < 0 || j >= orden.length) return
      ;[orden[i], orden[j]] = [orden[j], orden[i]]
      aplicar(await apiOrdenarEtapas(planId, orden))
    }),
  }

  const crearEtapa = conError(async e => {
    e.preventDefault()
    const clave = claveDesde(formEtapa.etapa)
    if (!clave) return setError('El nombre de la etapa no sirve para derivar una clave')
    aplicar(await apiCrearEtapa(planId, { ...formEtapa, clave }))
    setFormEtapa(ETAPA_VACIA)
  })

  /* ─── Render ─── */

  if (sinPropuesta) {
    return (
      <div>
        <h3 style={{ marginBottom: 14 }}>Propuesta curricular</h3>
        <p style={{ color: 'var(--ink-3)', fontSize: 14, maxWidth: '70ch' }}>
          No hay ningún plan en trámite en la base: la propuesta es el plan marcado como
          no vigente. Impórtala con <code>npm run db:importar-propuesta</code> y vuelve
          a esta pestaña.
        </p>
      </div>
    )
  }

  if (!malla?.plan) {
    return (
      <div>
        <h3 style={{ marginBottom: 14 }}>Propuesta curricular</h3>
        <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>Cargando…</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', flexWrap: 'wrap', marginBottom: 6 }}>
        <h3 style={{ margin: 0 }}>Propuesta curricular</h3>
        <a href="#/pensum-propuesto" target="_blank" rel="noreferrer"
          style={{ fontSize: 12.5, color: 'var(--doc-azul-texto, var(--ug-azul))' }}>
          ver la página pública ↗
        </a>
      </div>
      <p style={{ margin: '0 0 18px', fontSize: 12.5, color: 'var(--ink-3)', maxWidth: '78ch' }}>
        Todo lo que se edita aquí es <b>{malla.plan.nombre}</b>, el plan que la página
        publica como propuesta. Los cambios salen al sitio en cuanto se guardan.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
        {VISTAS.map(([k, l]) => (
          <button key={k} className="chip" onClick={() => setVista(k)} style={pastilla(vista === k)}>
            {l}
            {k === 'tramite' && <span style={{ marginLeft: 7, opacity: .7, fontSize: 10 }}>{actual + 1}/{etapas.length}</span>}
          </button>
        ))}
      </div>

      {vista === 'encabezado' && <Encabezado plan={malla.plan} onGuardar={guardarPlan} />}

      {vista === 'tarjetas' && (
        <EditorTarjetas
          seccion="pensum-propuesto"
          setError={setError}
          ejemploPie="Documento maestro · 2025"
          descripcion="Las tarjetas que acompañan al titular de la página. Sirven para contar en qué
            va el trámite, qué cambia frente al plan vigente o cualquier cosa que no quepa en la
            entradilla."
        />
      )}

      {vista === 'tramite' && (
        <>
          <div className="card" style={{ background: 'var(--paper-2)', marginBottom: 18, padding: '14px 16px' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <label htmlFor="etapa-actual" style={{ fontWeight: 600, fontSize: 13 }}>Etapa en curso</label>
              <select id="etapa-actual" value={malla.plan.etapa_tramite}
                onChange={e => accionesEtapa.marcarActual(e.target.value)}
                style={{ padding: '6px 10px', fontSize: 13, minWidth: 300 }}>
                {etapas.map((t, n) => <option key={t.clave} value={t.clave}>{n + 1}. {t.etapa}</option>)}
              </select>
              <span className="chip" style={{ fontSize: 11 }}>Etapa {actual + 1} de {etapas.length}</span>
            </div>
            <p style={{ margin: '8px 0 0', fontSize: 11.5, color: 'var(--ink-3)' }}>
              Es lo que la línea de tiempo pública pinta como «en curso»; lo anterior sale
              como surtido y lo siguiente como pendiente.
            </p>
          </div>

          {etapas.map((t, n) => (
            <FilaEtapa key={t.id} etapa={t} indice={n} total={etapas.length}
              actual={actual} acciones={accionesEtapa} />
          ))}

          {etapas.length === 0 && (
            <div style={{ padding: '18px 0', color: 'var(--ink-3)', fontSize: 14 }}>
              Este plan no tiene etapas registradas, así que la página no muestra línea de
              tiempo. Crea la primera abajo.
            </div>
          )}

          <Plegable id="tabpropuesta-0" titulo="Nueva etapa">
            <form className="card" style={{ background: 'var(--paper-2)', marginTop: 20 }} onSubmit={crearEtapa}>
              <div className="field" style={{ margin: '0 0 10px' }}>
                <label>Nombre de la etapa</label>
                <input value={formEtapa.etapa} required minLength={3} maxLength={120}
                  placeholder="Concepto de pares académicos"
                  onChange={e => setFormEtapa(f => ({ ...f, etapa: e.target.value }))} />
                {formEtapa.etapa && (
                  <small style={{ color: 'var(--ink-3)', fontSize: 11.5 }}>
                    Clave: <code>{claveDesde(formEtapa.etapa) || '—'}</code>
                  </small>
                )}
              </div>
              <div className="field" style={{ margin: '0 0 12px' }}>
                <label>Detalle</label>
                <textarea rows={2} value={formEtapa.detalle} maxLength={600}
                  onChange={e => setFormEtapa(f => ({ ...f, detalle: e.target.value }))}
                  style={{ width: '100%', resize: 'vertical' }} />
              </div>
              <button className="btn accent" type="submit" style={{ padding: '8px 18px' }}>
                Agregar etapa <Icons.check />
              </button>
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--ink-3)' }}>
                Se agrega al final del trámite. Usa las flechas para colocarla en su sitio.
              </div>
            </form>
          </Plegable>
        </>
      )}

      {vista === 'malla' && (
        <>
          <div className="card" style={{ background: 'var(--paper-2)', marginBottom: 18 }}>
            <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', fontSize: 13 }}>
              <span><b style={{ fontSize: 18 }}>{malla.total_creditos}</b> créditos</span>
              <span><b style={{ fontSize: 18 }}>{malla.total_materias}</b> asignaturas</span>
              <span><b style={{ fontSize: 18 }}>{malla.plan.num_semestres}</b> semestres</span>
              <span><b style={{ fontSize: 18 }}>{malla.total_prerrequisitos}</b> prerrequisitos</span>
            </div>
            <p style={{ margin: '12px 0 0', fontSize: 12, color: 'var(--ink-3)', maxWidth: '78ch' }}>
              Son las cifras que la página muestra bajo el titular, junto a la diferencia
              con el plan vigente. Se suman de la malla: no hay ningún número escrito a
              mano que pueda quedar desfasado.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 18 }}>
            {malla.semestres.map(s => (
              <div key={s.numero} style={{ border: BORDE, borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{s.numero}.º semestre</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
                  {s.materias.length} asignaturas · {s.total_creditos} créditos
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 13, color: 'var(--ink-3)', maxWidth: '78ch' }}>
            Las asignaturas, los créditos y los prerrequisitos se editan en{' '}
            <b>Plan de estudios</b>, eligiendo ahí «{malla.plan.nombre}». Es la misma
            pantalla que arma la malla vigente, y tener dos copias solo serviría para que
            se fueran separando.
          </p>

          <div className="card" style={{ background: 'var(--paper-2)', marginTop: 18 }}>
            <div className="field" style={{ margin: 0, maxWidth: 220 }}>
              <label>Número de semestres</label>
              <input type="number" min="1" max="14" defaultValue={malla.plan.num_semestres}
                onBlur={e => {
                  const n = Number(e.target.value)
                  if (n !== malla.plan.num_semestres) guardarPlan({ num_semestres: n })
                }} />
            </div>
            <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--ink-3)', maxWidth: '78ch' }}>
              Reducirlo no borra materias: las que queden en un semestre que ya no existe
              dejan de mostrarse hasta que se muevan. Conviene vaciarlo antes en «Plan de
              estudios».
            </p>
          </div>
        </>
      )}
    </div>
  )
}
