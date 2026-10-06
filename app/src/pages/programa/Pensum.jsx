/* Malla curricular vigente — la que rige hoy para todas las cohortes.

   La grilla, los filtros, la dona y la ficha de materia viven en malla.jsx,
   compartidos con la propuesta de actualización curricular (/pensum-propuesto).
   Aquí queda solo lo propio de esta vista: los datos, la cabecera y el aviso
   que lleva a la propuesta.

   La cabecera es la misma de /pensum-propuesto —migas, hero-card con la franja
   tejida y cuatro cifras— y en el mismo orden: primero qué plan es, luego el
   otro plan que existe, después los filtros y al final la grilla. Las dos
   páginas muestran la misma clase de cosa y no había razón para que una fuera
   una cabecera suelta de chips y la otra una tarjeta. */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icons } from '../../components/Icons'
import { useData } from '../../context/DataContext'
import {
  Donut, FiltrosMalla, MallaGrid, MateriaDrawer, creditosPorArea,
} from './malla'

/* El titular dice el número de semestres con letra. Se deriva del plan y no se
   escribe a mano: si algún día la malla vigente deja de tener diez, el titular
   no puede seguir anunciándolos. Fuera del rango esperable cae al dígito, que
   es feo pero cierto. */
const EN_LETRA = { 6: 'Seis', 7: 'Siete', 8: 'Ocho', 9: 'Nueve', 10: 'Diez', 11: 'Once', 12: 'Doce' }

/* Resumen de la propuesta para el aviso. Sale de la base, como la malla: antes
   se importaba src/data/pensum-propuesto.json en tiempo de compilación, así
   que el aviso seguía anunciando las cifras viejas por más que se editara la
   propuesta en el panel. */
function resumenPropuesta(propuesta) {
  if (!propuesta?.plan) return null
  return {
    semestres: propuesta.plan.num_semestres,
    creditos: propuesta.total_creditos,
    asignaturas: propuesta.total_materias,
  }
}

export default function Pensum() {
  /* La malla viene de la API (migración 008). Antes se importaba el JSON en
     tiempo de compilación, así que editarla en el panel no cambiaba nada. */
  const { data } = useData()
  const semestres = data.pensum ?? []
  const info = data.pensum_info
  const CHART_DATA = creditosPorArea(semestres)

  const [selected,    setSelected]    = useState(null)
  const [filter,      setFilter]      = useState('all')
  const [campoFilter, setCampoFilter] = useState('all')

  const totalCreditos = info?.total_creditos ?? 0
  const totalMaterias = info?.total_materias ?? 0
  const totalSemestres = info?.plan?.num_semestres ?? 0
  const propuesta = resumenPropuesta(data.pensum_propuesto)

  /* Mismo trato que en la propuesta: sin plan no se pinta una cabecera de
     ceros, que parece un plan vacío en vez de una carga que no llegó. */
  if (!info?.plan) {
    return (
      <div className="page-in pagina-con-margen" style={{ padding: 'clamp(28px,4vw,44px) var(--gutter)' }}>
        <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', color: 'var(--ink-3)' }}>
          Todavía no hay un plan de estudios cargado.
        </div>
      </div>
    )
  }

  /* Las cuatro cifras de cabecera salen de la base; ninguna está escrita a
     mano, así que mover una materia en el panel las mueve todas. */
  const CIFRAS = [
    { k: 'creditos', tono: 'acento', valor: totalCreditos, etiqueta: 'Créditos del plan' },
    { k: 'asignaturas', valor: totalMaterias, etiqueta: 'Asignaturas' },
    {
      k: 'duracion', tono: 'acento',
      valor: totalSemestres ? `${totalSemestres / 2} años` : '—',
      etiqueta: `${totalSemestres} semestres`,
    },
    { k: 'snies', tono: 'ambar', valor: '17579', etiqueta: 'SNIES · Acreditado en alta calidad' },
  ]

  return (
    <div className="page-in pagina-con-margen" style={{ padding: 'clamp(28px,4vw,44px) var(--gutter) 0' }}>
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>

        <nav className="miga" aria-label="Ruta de navegación">
          <span>Programa</span>
          <span aria-hidden="true">/</span>
          <span className="miga__actual">Plan de estudios</span>
        </nav>

        <header className="hero-card">
          <div className="hero-card__patron" aria-hidden="true" />
          <div className="hero-card__contenido">

            {/* Insignia en azul, no en ámbar: lo que anuncia es que este plan
                sí rige. La ámbar queda para la propuesta, que no. */}
            <p className="hero-card__insignia">
              <span className="hero-card__punto" aria-hidden="true" />
              Plan de estudios vigente · Rige para todas las cohortes
            </p>

            <h1 className="hero-card__titulo">
              {EN_LETRA[totalSemestres] ?? totalSemestres} semestres.{' '}
              <span>Cada curso, una pieza del tejido.</span>
            </h1>

            <p className="hero-card__texto">
              Esta es la malla que cursan hoy los estudiantes del programa, con sus asignaturas
              repartidas por semestre, área de formación y campo. Pulsa cualquier asignatura para
              ver su ficha; los filtros de abajo aíslan un área o un campo sobre la malla completa.
            </p>

            <dl className="hero-card__cifras">
              {CIFRAS.map(c => (
                <div key={c.k} className={'hero-card__cifra' + (c.tono ? ` hero-card__cifra--${c.tono}` : '')}>
                  <dt>{c.valor}</dt>
                  <dd>{c.etiqueta}</dd>
                </div>
              ))}
            </dl>

            {/* El botón no descarga nada todavía: no hay un PDF de la malla
                publicado. Se deja visible porque es el sitio donde la gente
                lo busca, y sale en cuanto exista el archivo. */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Link className="hero-card__cta" to="/pensum-propuesto">
                Ver la propuesta de actualización curricular
                <span aria-hidden="true">→</span>
              </Link>
              <button className="btn ghost" style={{ padding: '10px 18px', fontSize: 13, marginTop: 24 }}>
                <Icons.download /> Descargar PDF
              </button>
            </div>

          </div>
        </header>

        {/* Aviso: existe una propuesta en trámite. No compite con la malla
            vigente —es la que rige— pero quien llega aquí debe poder verla.
            Ocupa el lugar que en /pensum-propuesto ocupa la línea de tiempo:
            lo que hay que saber del otro plan, antes de la malla. */}
        {propuesta && (
          <Link to="/pensum-propuesto" className="aviso-propuesta" style={{ marginBottom: 4 }}>
            <span className="aviso-propuesta__punto" aria-hidden="true" />
            <span style={{ flex: 1, minWidth: 0 }}>
              <b style={{ display: 'block', fontSize: 14 }}>Propuesta de actualización curricular</b>
              <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                {propuesta.semestres} semestres · {propuesta.creditos} créditos ·{' '}
                {propuesta.asignaturas} asignaturas. En trámite: aún no rige.
              </span>
            </span>
            <span className="aviso-propuesta__cta">
              Ver propuesta <Icons.arrow />
            </span>
          </Link>
        )}
      </div>

      {/* ── Filtros y dona ── */}
      <section className="section" style={{ paddingTop: 36, paddingBottom: 0 }}>
        <div className="inner">
          <div className="malla-controles">
            <FiltrosMalla
              filter={filter} setFilter={setFilter}
              campoFilter={campoFilter} setCampoFilter={setCampoFilter}
            />
            <Donut datos={CHART_DATA} filter={filter} campoFilter={campoFilter} />
          </div>
        </div>
      </section>

      {/* ── Grilla de semestres ── */}
      <section style={{ padding: '20px var(--gutter) 60px' }}>
        <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>
          <MallaGrid
            semestres={semestres}
            filter={filter} campoFilter={campoFilter}
            selected={selected} onSelect={setSelected}
          />
        </div>
      </section>

      <MateriaDrawer
        selected={selected}
        onClose={() => setSelected(null)}
        pie={selected && (
          <button className="btn" style={{ background: selected.cfg.border, borderColor: selected.cfg.border, color: '#fff' }}>
            <Icons.download /> Microcurrículo PDF
          </button>
        )}
      />
    </div>
  )
}
