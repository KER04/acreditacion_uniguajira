/* Propuesta de actualización curricular.

   Misma malla que /pensum —mismos colores, mismos filtros, misma ficha— pero
   con otros datos y una advertencia que no se puede perder de vista: este plan
   todavía no rige. De ahí la cinta de estado y que la línea de tiempo vaya
   arriba, antes de la grilla: lo primero que alguien necesita saber al llegar
   no es qué asignaturas trae, sino si ya puede contar con ellas. */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icons } from '../../components/Icons'
import propuesta from '../../data/pensum-propuesto.json'
import vigente from '../../data/pensum.json'
import {
  Donut, FiltrosMalla, MallaGrid, MateriaDrawer, creditosPorArea,
} from './malla'

const CHART_DATA = creditosPorArea(propuesta.semestres)

/* Índice de la etapa en curso. Si `etapa_actual` no coincide con ninguna clave
   —un dato mal escrito— se asume que no ha empezado nada, en vez de dar por
   aprobado algo que no lo está. */
const ETAPA_ACTUAL = Math.max(0, propuesta.tramite.findIndex(t => t.clave === propuesta.etapa_actual))

/* ─── Línea de tiempo del trámite ──────────────────────────────── */

function LineaTiempo() {
  const [abierta, setAbierta] = useState(ETAPA_ACTUAL)
  const total = propuesta.tramite.length
  const aprobado = ETAPA_ACTUAL === total - 1

  return (
    <div className="tramite">
      <ol className="tramite__pasos">
        {propuesta.tramite.map((t, i) => {
          const estado = i < ETAPA_ACTUAL ? 'hecho' : i === ETAPA_ACTUAL ? 'curso' : 'pendiente'
          const activa = abierta === i

          return (
            <li key={t.clave} className={`tramite__paso is-${estado}` + (activa ? ' is-abierta' : '')}>
              {/* La línea que une los pasos se pinta hasta donde llegó el
                  trámite: el tramo pendiente queda en gris. */}
              {i > 0 && <span className="tramite__linea" aria-hidden="true" />}

              <button
                className="tramite__btn"
                onClick={() => setAbierta(activa ? -1 : i)}
                aria-expanded={activa}
              >
                <span className="tramite__marca" aria-hidden="true">
                  {estado === 'hecho' ? <Icons.check /> : <span className="tramite__num">{i + 1}</span>}
                </span>
                <span className="tramite__texto">
                  <span className="tramite__etapa">{t.etapa}</span>
                  <span className="tramite__estado">
                    {estado === 'hecho'    && 'Surtida'}
                    {estado === 'curso'    && (aprobado ? 'Vigente' : 'En curso')}
                    {estado === 'pendiente' && 'Pendiente'}
                  </span>
                </span>
              </button>

              {activa && <p className="tramite__detalle">{t.detalle}</p>}
            </li>
          )
        })}
      </ol>

      <div className="tramite__pie">
        Etapa {ETAPA_ACTUAL + 1} de {total}. Mientras el Ministerio no expida la resolución,
        el plan que rige es el{' '}
        <Link to="/pensum" style={{ color: 'inherit', textDecoration: 'underline' }}>
          vigente de {vigente.total_creditos} créditos
        </Link>.
      </div>
    </div>
  )
}

/* ─── Página ───────────────────────────────────────────────────── */

export default function PensumPropuesto() {
  const [selected,    setSelected]    = useState(null)
  const [filter,      setFilter]      = useState('all')
  const [campoFilter, setCampoFilter] = useState('all')

  const { semestres, total_creditos, total_asignaturas, total_semestres, comparado_con } = propuesta

  /* Diferencias contra el plan vigente, con signo. Se calculan y no se escriben
     a mano para que no queden desfasadas si cambia cualquiera de los dos JSON. */
  const delta = n => (n > 0 ? `+${n}` : `${n}`)
  const dCreditos  = total_creditos    - comparado_con.creditos
  const dMaterias  = total_asignaturas - comparado_con.asignaturas
  const dSemestres = total_semestres   - comparado_con.semestres

  const etapa = propuesta.tramite[ETAPA_ACTUAL]

  /* Las cuatro cifras de cabecera. Todas se derivan de los dos JSON: ninguna
     está escrita a mano, así que mover un dato del plan las mueve todas. */
  const CIFRAS = [
    {
      k: 'creditos', tono: 'acento',
      valor: total_creditos,
      etiqueta: `Créditos · ${delta(dCreditos)} frente al vigente`,
    },
    {
      k: 'asignaturas',
      valor: total_asignaturas,
      etiqueta: `Asignaturas · ${delta(dMaterias)} frente al vigente`,
    },
    {
      k: 'duracion', tono: 'acento',
      valor: `${total_semestres / 2} años`,
      etiqueta: `${total_semestres} semestres · ${Math.abs(dSemestres)} menos que el vigente`,
    },
    {
      k: 'tramite', tono: 'ambar',
      valor: `${ETAPA_ACTUAL + 1} de ${propuesta.tramite.length}`,
      etiqueta: etapa.etapa,
    },
  ]

  return (
    <div className="page-in" style={{ padding: 'clamp(28px,4vw,44px) var(--gutter) 0' }}>
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>

        <nav className="miga" aria-label="Ruta de navegación">
          <span>Programa</span>
          <span aria-hidden="true">/</span>
          <Link to="/pensum">Plan de estudios</Link>
          <span aria-hidden="true">/</span>
          <span className="miga__actual">Propuesta de actualización curricular</span>
        </nav>

        <header className="hero-card">
          <div className="hero-card__patron" aria-hidden="true" />
          <div className="hero-card__contenido">

            {/* La insignia va en ámbar y no en el azul de las demás páginas:
                lo que anuncia es que este plan todavía no rige. */}
            <p className="hero-card__insignia hero-card__insignia--aviso">
              <span className="hero-card__punto" aria-hidden="true" />
              Propuesta de actualización curricular · En trámite, no vigente
            </p>

            <h1 className="hero-card__titulo">
              Ocho semestres, <span>un plan más corto y más denso.</span>
            </h1>

            <p className="hero-card__texto">
              Esta es la malla que el programa propone para reemplazar la actual. Todavía
              está en trámite: <b>no rige y ninguna cohorte cursa por ella</b>. Se publica
              de manera abierta para que estudiantes, docentes, egresados y aspirantes
              puedan leerla y compararla con el plan vigente mientras avanza su aprobación.
            </p>

            <dl className="hero-card__cifras">
              {CIFRAS.map(c => (
                <div key={c.k} className={'hero-card__cifra' + (c.tono ? ` hero-card__cifra--${c.tono}` : '')}>
                  <dt>{c.valor}</dt>
                  <dd>{c.etiqueta}</dd>
                </div>
              ))}
            </dl>

            <Link className="hero-card__cta" to="/pensum">
              Ver el plan de estudios vigente
              <span aria-hidden="true">→</span>
            </Link>

          </div>
        </header>
      </div>

      {/* ── Estado del trámite ── */}
      <section style={{ padding: '0 var(--gutter) 8px' }}>
        <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>
          <h2 className="tramite__titulo">Estado del trámite</h2>
          <LineaTiempo />
        </div>
      </section>

      {/* ── Filtros y dona ── */}
      <section className="section" style={{ paddingTop: 36, paddingBottom: 0 }}>
        <div className="inner">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
            <FiltrosMalla
              filter={filter} setFilter={setFilter}
              campoFilter={campoFilter} setCampoFilter={setCampoFilter}
            />
            <Donut datos={CHART_DATA} filter={filter} campoFilter={campoFilter} />
          </div>
        </div>
      </section>

      {/* ── Grilla de semestres ── */}
      <section style={{ padding: '20px var(--gutter) 40px' }}>
        <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>
          <MallaGrid
            semestres={semestres}
            filter={filter} campoFilter={campoFilter}
            selected={selected} onSelect={setSelected}
          />
        </div>
      </section>

      {/* ── Extracurriculares ── */}
      <section style={{ padding: '0 var(--gutter) 72px' }}>
        <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>
          <div className="extracurriculares">
            <div className="extracurriculares__label">Extracurriculares</div>
            <div className="extracurriculares__lista">
              {propuesta.extracurriculares.map(e => (
                <span key={e} className="chip">{e}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* La propuesta no tiene microcurrículos publicados todavía: la ficha
          se queda solo con el botón de cerrar. */}
      <MateriaDrawer selected={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
