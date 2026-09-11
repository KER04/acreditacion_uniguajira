/* Malla curricular vigente — la que rige hoy para todas las cohortes.

   La grilla, los filtros, la dona y la ficha de materia viven en malla.jsx,
   compartidos con la propuesta de actualización curricular (/pensum-propuesto).
   Aquí queda solo lo propio de esta vista: los datos, la cabecera y el enlace
   a la propuesta. */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icons } from '../../components/Icons'
import pensumData from '../../data/pensum.json'
import propuesta from '../../data/pensum-propuesto.json'
import {
  Donut, FiltrosMalla, MallaGrid, MateriaDrawer, creditosPorArea,
} from './malla'

const CHART_DATA = creditosPorArea(pensumData.semestres)

export default function Pensum() {
  const [selected,    setSelected]    = useState(null)
  const [filter,      setFilter]      = useState('all')
  const [campoFilter, setCampoFilter] = useState('all')

  const { semestres, total_creditos } = pensumData
  const totalMaterias = semestres.reduce((a, s) => a + s.materias.length, 0)

  return (
    <div className="page-in">

      {/* ── Cabecera ── */}
      <section className="section" style={{ paddingTop: 'clamp(60px,8vw,110px)', paddingBottom: 32 }}>
        <div className="inner">
          <div className="eyebrow">Plan de estudios</div>
          <h1 style={{ marginTop: 14, maxWidth: '16ch' }}>Diez semestres. Cada curso, una pieza del tejido.</h1>

          {/* Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 32, alignItems: 'center' }}>
            <div className="chip"><b style={{ marginRight: 5 }}>{total_creditos}</b>créditos totales</div>
            <div className="chip"><b style={{ marginRight: 5 }}>{totalMaterias}</b>asignaturas</div>
            <div className="chip">10 semestres · 5 años</div>
            <div className="chip"><b style={{ marginRight: 4 }}>SNIES</b>17579</div>
            <div className="chip" style={{ background: '#e2a542', color: '#03090f', borderColor: '#e2a542', fontWeight: 700 }}>
              ★ Acreditado Alta Calidad
            </div>
            <div style={{ flex: 1 }} />
            <button className="btn ghost" style={{ padding: '8px 16px', fontSize: 13 }}>
              <Icons.download /> Descargar PDF
            </button>
          </div>

          {/* Aviso: existe una propuesta en trámite. No compite con la malla
              vigente —es la que rige— pero quien llega aquí debe poder verla. */}
          <Link
            to="/pensum-propuesto"
            className="aviso-propuesta"
            style={{ marginTop: 22 }}
          >
            <span className="aviso-propuesta__punto" aria-hidden="true" />
            <span style={{ flex: 1, minWidth: 0 }}>
              <b style={{ display: 'block', fontSize: 14 }}>Propuesta de actualización curricular</b>
              <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                {propuesta.total_semestres} semestres · {propuesta.total_creditos} créditos ·{' '}
                {propuesta.total_asignaturas} asignaturas. En trámite: aún no rige.
              </span>
            </span>
            <span className="aviso-propuesta__cta">
              Ver propuesta <Icons.arrow />
            </span>
          </Link>

          {/* Filtros + leyenda + gráfico en fila */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginTop: 28 }}>
            <FiltrosMalla
              filter={filter} setFilter={setFilter}
              campoFilter={campoFilter} setCampoFilter={setCampoFilter}
            />
            <Donut datos={CHART_DATA} filter={filter} campoFilter={campoFilter} />
          </div>
        </div>
      </section>

      {/* ── Grilla de semestres ── */}
      <section style={{ padding: '0 var(--gutter) 60px' }}>
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
