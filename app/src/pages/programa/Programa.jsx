import { useNavigate } from 'react-router-dom'
import { Icons } from '../../components/Icons'
import Portal from '../../components/Portal'
import { WayuuBackdrop } from '../../components/WayuuPatterns'
import pensumData from '../../data/pensum.json'
import { useState } from 'react'

const AREA_FILTER = {
  'Ciencias Básicas':               'basicas',
  'Ciencias Básicas de Ingeniería': 'ingenieria',
  'Perfil Profesional':             'profesional',
  'Complementaria':                 'socio',
  'Investigativo':                  'investigativo',
}

const AREA_COLOR = {
  'Ciencias Básicas':               '#62a9b6',
  'Ciencias Básicas de Ingeniería': '#01616c',
  'Perfil Profesional':             '#cc5e50',
  'Complementaria':                 '#e2a542',
  'Investigativo':                  '#b5832e',
}

const EMBED_FILTERS = [
  { k: 'all',         l: 'Todas' },
  { k: 'basicas',     l: 'Ciencias Básicas' },
  { k: 'ingenieria',  l: 'Cs. Básicas Ing.' },
  { k: 'profesional', l: 'Perfil Profesional' },
  { k: 'socio',       l: 'Socio Humanístico' },
]

function PensumEmbed() {
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  return (
    <>
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '0 var(--gutter)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {EMBED_FILTERS.map(f => (
            <button key={f.k} onClick={() => setFilter(f.k)} className="chip"
              style={{ cursor: 'pointer', background: filter===f.k ? 'var(--ink)' : undefined, color: filter===f.k ? 'var(--paper)' : undefined, borderColor: filter===f.k ? 'var(--ink)' : undefined }}>
              {f.l}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: '0 var(--gutter) 40px' }}>
        <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>
          <div className="pensum">
            {pensumData.semestres.map(sem => (
              <div key={sem.numero} className="sem-col">
                <div className="sem-head">Sem · {String(sem.numero).padStart(2,'0')} · {sem.total_creditos} cr</div>
                {sem.materias.map((m, ci) => {
                  const filterKey = AREA_FILTER[m.area] ?? 'all'
                  const color     = AREA_COLOR[m.area]  ?? '#d4cfc6'
                  const dimmed    = filter !== 'all' && filterKey !== filter
                  const isActive  = selected?.semNum === sem.numero && selected?.ci === ci
                  return (
                    <button key={ci} className={'course'+(isActive?' active':'')}
                      style={{ opacity: dimmed ? 0.3 : 1, textAlign: 'left', '--c-border': color }}
                      onClick={() => setSelected(isActive ? null : { semNum: sem.numero, ci, m })}>
                      {m.nombre}
                      <span className="cr">{m.creditos} cr · {m.area}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      {selected && (
        <Portal>
          <div className="drawer-backdrop" onClick={() => setSelected(null)} />
          <aside className="drawer">
            <div className="drawer-head">
              <div>
                <div className="eyebrow">Sem {String(selected.semNum).padStart(2,'0')} · {selected.m.area}</div>
                <h2 style={{ marginTop: 8, fontSize: 30 }}>{selected.m.nombre}</h2>
              </div>
              <button className="icon-btn" onClick={() => setSelected(null)}><Icons.close /></button>
            </div>
            <div className="drawer-body">
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
                <span className="chip">{selected.m.creditos} créditos</span>
                <span className="chip">{selected.m.horas_semana} h/sem</span>
                <span className="chip">{selected.m.campo}</span>
              </div>
              <h3 style={{ fontSize: 16, marginBottom: 10 }}>Código</h3>
              <p style={{ color: 'var(--ink-2)', marginBottom: 24 }}>{selected.m.codigo}</p>
              <div style={{ marginTop: 32, display: 'flex', gap: 10 }}>
                <button className="btn"><Icons.download /> Microcurrículo PDF</button>
                <button className="btn ghost" onClick={() => setSelected(null)}>Cerrar</button>
              </div>
            </div>
          </aside>
        </Portal>
      )}
    </>
  )
}

export default function Programa() {
  const nav = useNavigate()
  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: 'clamp(60px,8vw,110px)' }}>
        <div className="inner">
          <div className="eyebrow">Presentación del programa</div>
          <h1 style={{ marginTop: 14, maxWidth: '18ch' }}>Ingeniería de Sistemas que se teje con el territorio.</h1>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 60, marginTop: 60, alignItems: 'start' }} className="programa-grid">
            <div>
              <p style={{ fontSize: 18, color: 'var(--ink-2)', marginBottom: 20 }}>
                Nuestro programa forma ingenieros capaces de diseñar, implementar y evaluar sistemas computacionales desde una mirada integral: técnica rigurosa, sensibilidad territorial y ética profesional.
              </p>
              <p style={{ fontSize: 18, color: 'var(--ink-2)' }}>
                La Guajira necesita ingenieros que sepan de IoT para monitorear salinas, de datos para evaluar programas sociales, de software para digitalizar microempresas caribeñas — y que dominen también lo global.
              </p>
            </div>
            <aside style={{ background: 'var(--paper-2)', borderRadius: 'var(--radius-lg)', padding: 28, border: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)' }}>
              <div className="eyebrow">Ficha técnica</div>
              <dl style={{ marginTop: 16, display: 'grid', gap: 14 }}>
                {[
                  ['Título','Ingeniero(a) de Sistemas'],
                  ['Nivel','Pregrado profesional'],
                  ['Duración','10 semestres'],
                  ['Créditos','169 créditos'],
                  ['Modalidad','Presencial — Diurno'],
                  ['Registro calificado','Res. 02872 del 21 feb 2018'],
                  ['Acreditación','Res. 014528 del 28 jul 2022'],
                  ['SNIES','17579'],
                  ['Ciudad','Riohacha, La Guajira'],
                ].map(([k,v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, fontSize: 14, paddingBottom: 12, borderBottom: '1px solid color-mix(in oklab, var(--ink) 7%, transparent)' }}>
                    <dt style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase' }}>{k}</dt>
                    <dd style={{ margin: 0, fontWeight: 500, textAlign: 'right' }}>{v}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--paper-2)' }}>
        <div className="inner">
          <div className="grid-2">
            <div className="card" style={{ background: 'var(--paper)', padding: 36 }}>
              <div className="eyebrow" style={{ color: 'var(--ug-azul-deep)' }}>● Misión</div>
              <h2 style={{ marginTop: 14, fontSize: 28 }}>Formar ingenieros con criterio técnico y arraigo territorial.</h2>
              <p style={{ fontSize: 16, color: 'var(--ink-2)', marginTop: 18 }}>
                Formar ingenieros de sistemas competentes, éticos y socialmente responsables, capaces de diseñar, implementar y administrar soluciones informáticas pertinentes al desarrollo de La Guajira, la región Caribe y el país.
              </p>
            </div>
            <div className="card" style={{ background: 'var(--paper)', padding: 36 }}>
              <div className="eyebrow" style={{ color: 'var(--ug-flamingo-deep)' }}>● Visión</div>
              <h2 style={{ marginTop: 14, fontSize: 28 }}>Referente en ingeniería pertinente al Caribe colombiano.</h2>
              <p style={{ fontSize: 16, color: 'var(--ink-2)', marginTop: 18 }}>
                En 2030 el programa de Ingeniería de Sistemas será reconocido como referente académico e investigativo en el Caribe colombiano, con acreditación de alta calidad renovada y egresados que lideren la transformación digital del territorio.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Objetivos del programa</div>
              <h2>Lo que promete la carrera.</h2>
            </div>
          </div>
          <div className="grid-3">
            {[
              {t:'Pensar computacionalmente',d:'Modelar problemas con abstracción, algoritmos y estructuras de datos apropiadas.'},
              {t:'Construir software con oficio',d:'Ingeniería de software, arquitectura limpia, pruebas y despliegue continuo.'},
              {t:'Leer los datos del territorio',d:'Ciencia de datos aplicada a salud pública, turismo, agro y conservación del Caribe.'},
              {t:'Diseñar redes y sistemas',d:'Infraestructura, ciberseguridad y soluciones IoT para contextos con recursos limitados.'},
              {t:'Actuar con ética y territorio',d:'Compromiso con la diversidad cultural, la sostenibilidad y los derechos de los pueblos.'},
              {t:'Emprender con criterio',d:'Modelos de negocio, propiedad intelectual y ecosistema TIC del Caribe colombiano.'},
            ].map((it, i) => (
              <div key={i} className="card">
                <div style={{ display: 'flex', gap: 12, alignItems: 'start', marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent)', display: 'grid', placeItems: 'center', color: 'var(--ug-negro)', flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700 }}>{String(i+1).padStart(2,'0')}</div>
                  <h3 style={{ fontSize: 19 }}>{it.t}</h3>
                </div>
                <p style={{ color: 'var(--ink-2)', fontSize: 14 }}>{it.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Plan de estudios interactivo</div>
              <h2>169 créditos · 10 semestres · filtros por área.</h2>
            </div>
            <p className="desc">Toca cualquier curso para ver su microcurrículo, créditos y prerrequisitos.</p>
          </div>
        </div>
        <PensumEmbed />
      </section>

      <section className="section" style={{ background: 'var(--paper-2)' }}>
        <div className="inner">
          <div className="grid-2">
            <div>
              <div className="eyebrow">Perfil del aspirante</div>
              <h2 style={{ marginTop: 12, fontSize: 32 }}>¿Para quién es esta carrera?</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {['Curiosidad por cómo funcionan las tecnologías digitales.','Habilidades para el razonamiento lógico, matemático y abstracto.','Interés por resolver problemas del entorno con herramientas computacionales.','Disposición al trabajo en equipo y la comunicación efectiva.','Compromiso con la diversidad cultural del territorio guajiro y caribeño.'].map((p,i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'start', fontSize: 15, color: 'var(--ink-2)' }}><Icons.check /> {p}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="eyebrow">Perfil del egresado</div>
              <h2 style={{ marginTop: 12, fontSize: 32 }}>¿En qué se desempeñará?</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Desarrollador(a) full-stack','Ingeniero(a) de datos','Analista de ciberseguridad','Arquitecto(a) de software','Líder técnico de proyectos TIC','Consultor(a) de transformación digital','Investigador(a) en IA aplicada','Emprendedor(a) tecnológico(a)'].map((r,i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, padding: '10px 14px', background: 'var(--paper)', borderRadius: 10, border: '1px solid color-mix(in oklab, var(--ink) 7%, transparent)' }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--accent)', display: 'grid', placeItems: 'center', color: 'var(--ug-negro)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{String(i+1).padStart(2,'0')}</div>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
