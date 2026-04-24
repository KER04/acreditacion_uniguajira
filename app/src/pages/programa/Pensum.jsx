import { useState } from 'react'
import { Icons } from '../../components/Icons'
import { PENSUM, AREA_LABELS } from '../../data/pensum'

export default function Pensum() {
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const total = PENSUM.flat().reduce((a,c) => a + c.c, 0)

  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: 'clamp(60px,8vw,110px)', paddingBottom: 40 }}>
        <div className="inner">
          <div className="eyebrow">Plan de estudios</div>
          <h1 style={{ marginTop: 14, maxWidth: '16ch' }}>Diez semestres. Cada curso, una pieza del tejido.</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 40, alignItems: 'center' }}>
            <div className="chip"><b style={{ marginRight: 6 }}>{total}</b> créditos totales</div>
            <div className="chip"><b style={{ marginRight: 6 }}>{PENSUM.flat().length}</b> asignaturas</div>
            <div className="chip">10 semestres · 5 años</div>
            <div style={{ flex: 1 }} />
            <button className="btn ghost" style={{ padding: '8px 16px', fontSize: 13 }}><Icons.download /> Descargar PDF</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 24 }}>
            {[{k:'all',l:'Todas'},{k:'basicas',l:'Ciencias básicas'},{k:'ingenieria',l:'Ingeniería'},{k:'socio',l:'Socio-humanística'},{k:'profundizacion',l:'Profundización'}].map(f => (
              <button key={f.k} onClick={() => setFilter(f.k)} className="chip"
                style={{ cursor: 'pointer', background: filter===f.k ? 'var(--ink)' : undefined, color: filter===f.k ? 'var(--paper)' : undefined, borderColor: filter===f.k ? 'var(--ink)' : undefined }}>
                {f.l}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '0 var(--gutter) 60px' }}>
        <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>
          <div className="pensum">
            {PENSUM.map((sem, si) => {
              const semTotal = sem.reduce((a,c) => a+c.c, 0)
              return (
                <div key={si} className="sem-col">
                  <div className="sem-head">Sem · {String(si+1).padStart(2,'0')} · {semTotal} cr</div>
                  {sem.map((course, ci) => {
                    const dimmed = filter !== 'all' && course.a !== filter
                    const isActive = selected && selected.si === si && selected.ci === ci
                    return (
                      <button key={ci} className={'course' + (isActive ? ' active' : '')}
                        data-area={course.a}
                        style={{ opacity: dimmed ? 0.3 : 1, textAlign: 'left' }}
                        onClick={() => setSelected(isActive ? null : { si, ci, course })}>
                        {course.n}
                        <span className="cr">{course.c} cr · {AREA_LABELS[course.a]}</span>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {selected && (
        <>
          <div className="drawer-backdrop" onClick={() => setSelected(null)} />
          <aside className="drawer">
            <div className="drawer-head">
              <div>
                <div className="eyebrow">Sem {String(selected.si+1).padStart(2,'0')} · {AREA_LABELS[selected.course.a]}</div>
                <h2 style={{ marginTop: 8, fontSize: 30 }}>{selected.course.n}</h2>
              </div>
              <button className="icon-btn" onClick={() => setSelected(null)}><Icons.close /></button>
            </div>
            <div className="drawer-body">
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
                <span className="chip">{selected.course.c} créditos</span>
                <span className="chip">{selected.course.c * 48} horas trabajo independiente</span>
                <span className="chip">Obligatoria</span>
              </div>
              <h3 style={{ fontSize: 16, marginBottom: 10 }}>Descripción</h3>
              <p style={{ color: 'var(--ink-2)', marginBottom: 24 }}>
                Curso del área {AREA_LABELS[selected.course.a].toLowerCase()} que integra fundamentos teóricos con ejercicios aplicados al contexto caribeño y las necesidades del programa.
              </p>
              <h3 style={{ fontSize: 16, marginBottom: 10 }}>Resultados de aprendizaje</h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--ink-2)', marginBottom: 24 }}>
                <li>Aplicar conceptos clave del área a problemas reales.</li>
                <li>Diseñar soluciones respaldadas por buenas prácticas.</li>
                <li>Evaluar críticamente alternativas técnicas y metodológicas.</li>
                <li>Comunicar resultados con rigor a audiencias diversas.</li>
              </ul>
              <h3 style={{ fontSize: 16, marginBottom: 10 }}>Prerrequisitos</h3>
              <p style={{ color: 'var(--ink-2)' }}>
                {selected.si === 0 ? 'Ninguno — asignatura de primer semestre.' : `Asignaturas aprobadas hasta el semestre ${selected.si}.`}
              </p>
              <div style={{ marginTop: 32, display: 'flex', gap: 10 }}>
                <button className="btn"><Icons.download /> Microcurrículo PDF</button>
                <button className="btn ghost" onClick={() => setSelected(null)}>Cerrar</button>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
