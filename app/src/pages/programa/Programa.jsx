/* Presentación del programa.

   Misma cabecera que el resto de las páginas de consulta: migas y hero-card
   con la franja tejida. Debajo van la ficha técnica, misión y visión, los
   objetivos, el plan de estudios embebido y los dos perfiles.

   El plan embebido (PensumEmbed) se queda como estaba: usa la rejilla .pensum
   y el cajón de materia de /pensum, que ya son del sitio. El contenido de la
   página es el mismo de siempre y sigue escrito aquí. */
import { useState } from 'react'
import { Icons } from '../../components/Icons'
import Portal from '../../components/Portal'
import { useData } from '../../context/DataContext'

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

const FICHA = [
  ['Título', 'Ingeniero(a) de Sistemas'],
  ['Nivel', 'Pregrado profesional'],
  ['Duración', '10 semestres'],
  ['Créditos', '169 créditos'],
  ['Modalidad', 'Presencial — Diurno'],
  ['Registro calificado', 'Res. 02872 del 21 feb 2018'],
  ['Acreditación', 'Res. 014528 del 28 jul 2022'],
  ['SNIES', '17579'],
  ['Ciudad', 'Riohacha, La Guajira'],
]

const OBJETIVOS = [
  { t: 'Pensar computacionalmente',   d: 'Modelar problemas con abstracción, algoritmos y estructuras de datos apropiadas.' },
  { t: 'Construir software con oficio', d: 'Ingeniería de software, arquitectura limpia, pruebas y despliegue continuo.' },
  { t: 'Leer los datos del territorio', d: 'Ciencia de datos aplicada a salud pública, turismo, agro y conservación del Caribe.' },
  { t: 'Diseñar redes y sistemas',    d: 'Infraestructura, ciberseguridad y soluciones IoT para contextos con recursos limitados.' },
  { t: 'Actuar con ética y territorio', d: 'Compromiso con la diversidad cultural, la sostenibilidad y los derechos de los pueblos.' },
  { t: 'Emprender con criterio',      d: 'Modelos de negocio, propiedad intelectual y ecosistema TIC del Caribe colombiano.' },
]

const RASGOS = [
  'Curiosidad por cómo funcionan las tecnologías digitales.',
  'Habilidades para el razonamiento lógico, matemático y abstracto.',
  'Interés por resolver problemas del entorno con herramientas computacionales.',
  'Disposición al trabajo en equipo y la comunicación efectiva.',
  'Compromiso con la diversidad cultural del territorio guajiro y caribeño.',
]

const ROLES = [
  'Desarrollador(a) full-stack',
  'Ingeniero(a) de datos',
  'Analista de ciberseguridad',
  'Arquitecto(a) de software',
  'Líder técnico de proyectos TIC',
  'Consultor(a) de transformación digital',
  'Investigador(a) en IA aplicada',
  'Emprendedor(a) tecnológico(a)',
]

const dosDigitos = n => String(n).padStart(2, '0')

/* ─── Plan de estudios embebido ────────────────────────────────── */

function PensumEmbed() {
  /* Desde la migración 008 la malla llega por API, no del JSON compilado. */
  const { data } = useData()
  const semestres = data.pensum ?? []
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

  return (
    <>
      <div className="doc-filtros">
        {EMBED_FILTERS.map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)}
                  className={'doc-chip' + (filter === f.k ? ' is-activo' : '')}
                  aria-pressed={filter === f.k}>
            {f.l}
          </button>
        ))}
      </div>

      <p className="malla-desliza" aria-hidden="true">Desliza para ver los {semestres.length} semestres →</p>
      <div className="pensum" style={{ '--semestres': semestres.length || 10 }}>
        {semestres.map(sem => (
          <div key={sem.numero} className="sem-col">
            <div className="sem-head">Sem · {dosDigitos(sem.numero)} · {sem.total_creditos} cr</div>
            {sem.materias.map((m, ci) => {
              const filterKey = AREA_FILTER[m.area] ?? 'all'
              const color     = AREA_COLOR[m.area]  ?? '#d4cfc6'
              const dimmed    = filter !== 'all' && filterKey !== filter
              const isActive  = selected?.semNum === sem.numero && selected?.ci === ci
              return (
                <button key={ci} className={'course' + (isActive ? ' active' : '')}
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

      {selected && (
        <Portal>
          <div className="drawer-backdrop" onClick={() => setSelected(null)} />
          <aside className="drawer">
            <div className="drawer-head">
              <div>
                <div className="eyebrow">Sem {dosDigitos(selected.semNum)} · {selected.m.area}</div>
                <h2 style={{ marginTop: 8, fontSize: 30 }}>{selected.m.nombre}</h2>
              </div>
              <button className="icon-btn" onClick={() => setSelected(null)}><Icons.close /></button>
            </div>
            <div className="drawer-body">
              <div className="doc-card__etiquetas" style={{ marginBottom: 24 }}>
                <span className="doc-pin doc-pin--azul">{selected.m.creditos} créditos</span>
                <span className="doc-pin doc-pin--neutro">{selected.m.horas_semana} h/sem</span>
                <span className="doc-pin doc-pin--neutro">{selected.m.campo}</span>
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

/* ─── Página ───────────────────────────────────────────────────── */

export default function Programa() {
  return (
    <div className="page-in pagina-con-margen" style={{ padding: 'clamp(28px,4vw,44px) var(--gutter) 0' }}>
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>

        <nav className="miga" aria-label="Ruta de navegación">
          <span>Programa</span>
          <span aria-hidden="true">/</span>
          <span className="miga__actual">Presentación</span>
        </nav>

        <header className="hero-card">
          <div className="hero-card__patron" aria-hidden="true" />
          <div className="hero-card__contenido">
            <p className="hero-card__insignia">
              <span className="hero-card__punto" aria-hidden="true" />
              Presentación del programa
            </p>

            <h1 className="hero-card__titulo">
              Ingeniería de Sistemas <span>que se teje con el territorio.</span>
            </h1>

            <p className="hero-card__texto">
              Nuestro programa forma ingenieros capaces de diseñar, implementar y evaluar sistemas
              computacionales desde una mirada integral: técnica rigurosa, sensibilidad territorial
              y ética profesional.
            </p>
            <p className="hero-card__texto" style={{ marginTop: 14 }}>
              La Guajira necesita ingenieros que sepan de IoT para monitorear salinas, de datos
              para evaluar programas sociales, de software para digitalizar microempresas
              caribeñas — y que dominen también lo global.
            </p>
          </div>
        </header>

        {/* ── Ficha técnica ── */}
        <div className="doc-ficha" style={{ marginBottom: 52 }}>
          <div className="hero-card__patron" aria-hidden="true" />
          <div className="doc-ficha__cuerpo">
            <div className="doc-seccion__titulo" style={{ margin: 0 }}>Ficha técnica</div>
            {/* Nueve pares: en dos columnas se leen de un vistazo, en una sola
                quedaban en una tira larga y estrecha. */}
            <dl className="doc-datos doc-datos--dos">
              {FICHA.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* ── Misión y visión ── */}
        <div className="programa-declaraciones">
          <article className="doc-card">
            <div className="doc-card__acento doc-card__acento--azul" />
            <div className="doc-card__cuerpo">
              <div className="doc-seccion__titulo" style={{ margin: 0 }}>Misión</div>
              <h2 className="programa-declaracion__titulo">
                Formar ingenieros con criterio técnico y arraigo territorial.
              </h2>
              <p className="doc-card__texto">
                Formar ingenieros de sistemas competentes, éticos y socialmente responsables,
                capaces de diseñar, implementar y administrar soluciones informáticas pertinentes
                al desarrollo de La Guajira, la región Caribe y el país.
              </p>
            </div>
          </article>

          <article className="doc-card">
            <div className="doc-card__acento doc-card__acento--terracota" />
            <div className="doc-card__cuerpo">
              <div className="doc-seccion__titulo" style={{ margin: 0 }}>Visión</div>
              <h2 className="programa-declaracion__titulo">
                Referente en ingeniería pertinente al Caribe colombiano.
              </h2>
              <p className="doc-card__texto">
                En 2030 el programa de Ingeniería de Sistemas será reconocido como referente
                académico e investigativo en el Caribe colombiano, con acreditación de alta calidad
                renovada y egresados que lideren la transformación digital del territorio.
              </p>
            </div>
          </article>
        </div>

        {/* ── Objetivos ── */}
        <section className="doc-seccion">
          <h2 className="doc-seccion__titulo">Objetivos del programa</h2>
          <p className="doc-seccion__desc">Lo que promete la carrera.</p>

          <div className="doc-grid">
            {OBJETIVOS.map((it, i) => (
              <article key={it.t} className="doc-card">
                <div className="doc-card__acento doc-card__acento--azul" />
                <div className="doc-card__cuerpo">
                  <div className="programa-objetivo__cabeza">
                    <span className="doc-num">{dosDigitos(i + 1)}</span>
                    <h3>{it.t}</h3>
                  </div>
                  <p className="doc-card__texto">{it.d}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── Plan de estudios interactivo ── */}
        <section className="doc-seccion">
          <h2 className="doc-seccion__titulo">Plan de estudios interactivo</h2>
          <p className="doc-seccion__desc">
            169 créditos · 10 semestres · filtros por área. Toca cualquier curso para ver su
            microcurrículo, créditos y prerrequisitos.
          </p>
          <PensumEmbed />
        </section>

        {/* ── Perfiles ── */}
        <section className="doc-seccion">
          <div className="perfil-grid">
            <div>
              <div className="doc-seccion__titulo" style={{ margin: 0 }}>Perfil del aspirante</div>
              <h2 className="perfil__titulo">¿Para quién es esta carrera?</h2>
              <ul className="perfil-rasgos">
                {RASGOS.map(p => <li key={p}><Icons.check /> {p}</li>)}
              </ul>
            </div>

            <div>
              <div className="doc-seccion__titulo" style={{ margin: 0 }}>Perfil del egresado</div>
              <h2 className="perfil__titulo">¿En qué se desempeñará?</h2>
              <ul className="perfil-roles">
                {ROLES.map((r, i) => (
                  <li key={r}>
                    <span className="doc-num">{dosDigitos(i + 1)}</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <div style={{ height: 70 }} />
      </div>
    </div>
  )
}
