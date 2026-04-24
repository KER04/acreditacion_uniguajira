import { useState } from 'react'
import { Icons } from '../../components/Icons'
import { useData } from '../../context/DataContext'

function MiniMonth({ month, start, days, marks, legendLabel }) {
  const names = ['L','M','X','J','V','S','D']
  const cells = []
  for (let i = 0; i < start; i++) cells.push(null)
  for (let i = 1; i <= days; i++) cells.push(i)
  return (
    <div style={{ background: 'var(--paper-2)', borderRadius: 14, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18 }}>{month}</div>
        {legendLabel && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em', color: 'var(--ug-flamingo-deep)', textTransform: 'uppercase' }}>● {legendLabel}</div>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
        {names.map(n => <div key={n} style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.1em', color: 'var(--ink-3)', padding: 6 }}>{n}</div>)}
        {cells.map((d,i) => (
          <div key={i} style={{ aspectRatio: '1/1', display: 'grid', placeItems: 'center', fontSize: 13,
            background: d && marks[d] ? 'var(--ug-flamingo)' : 'transparent',
            color: d && marks[d] ? 'var(--paper)' : 'var(--ink-2)',
            borderRadius: 8, fontWeight: d && marks[d] ? 600 : 400 }}>
            {d || ''}
          </div>
        ))}
      </div>
    </div>
  )
}

function Calendario() {
  const semestre = [
    {f:'22 Ago – 02 Sep',t:'Matrícula académica',tipo:'admin'},
    {f:'05 Sep',t:'Inicio de clases 2026-II',tipo:'clases'},
    {f:'19 Sep',t:'Último día cambios de asignatura',tipo:'admin'},
    {f:'17 – 22 Oct',t:'Primer parcial (30%)',tipo:'eval',hl:true},
    {f:'07 Nov',t:'Receso académico',tipo:'clases'},
    {f:'28 Nov – 03 Dic',t:'Segundo parcial (30%)',tipo:'eval',hl:true},
    {f:'12 – 17 Dic',t:'Evaluación final (40%)',tipo:'eval',hl:true},
    {f:'22 Dic',t:'Ingreso de notas finales',tipo:'admin'},
    {f:'14 Feb 2027',t:'Ceremonia de grados',tipo:'grado',hl:true},
  ]
  return (
    <section className="section" style={{ paddingTop: 30 }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Calendario académico 2026-II</div>
            <h2 style={{ marginTop: 10 }}>Las fechas que no puedes perder.</h2>
          </div>
          <p className="desc">Descarga el calendario completo o sincronízalo con Google Calendar.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }} className="cal-grid">
          <div>
            <div className="eyebrow" style={{ marginBottom: 20 }}>Cronograma semestral</div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 10, top: 10, bottom: 10, width: 2, background: 'color-mix(in oklab, var(--ink) 12%, transparent)' }} />
              {semestre.map((e,i) => {
                const color = e.tipo==='eval' ? 'var(--ug-flamingo)' : e.tipo==='grado' ? 'var(--ug-amarillo)' : e.tipo==='clases' ? 'var(--ug-azul)' : 'var(--ink-3)'
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: 16, padding: '10px 0', position: 'relative', alignItems: 'start' }}>
                    <div style={{ width: 22, height: 22, borderRadius: 999, background: color, border: '3px solid var(--paper)', zIndex: 1, marginTop: 2 }} />
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.12em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>{e.f}</div>
                      <div style={{ fontSize: 16, marginTop: 4, fontWeight: e.hl ? 600 : 400 }}>{e.t}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 20 }}>Vista de calendario</div>
            <MiniMonth month="Octubre 2026" start={3} days={31} marks={{17:'p',20:'p',22:'p'}} legendLabel="Primer parcial" />
            <div style={{ marginTop: 24 }}>
              <MiniMonth month="Noviembre 2026" start={6} days={30} marks={{28:'p',30:'p'}} legendLabel="Segundo parcial" />
            </div>
            <div style={{ marginTop: 32, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn"><Icons.download /> Calendario PDF</button>
              <button className="btn ghost">+ Google Calendar</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Honor() {
  const { data } = useData()
  const top = data.honor.sort((a,b) => b.prom - a.prom)
  const podium = top.slice(0,3)
  const rest = top.slice(3)
  const colors = ['var(--ug-amarillo)','var(--ug-azul)','var(--ug-flamingo)']
  return (
    <section className="section" style={{ paddingTop: 30 }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Cuadro de Honor · 2026-I</div>
            <h2 style={{ marginTop: 10 }}>Mejores promedios del semestre.</h2>
          </div>
          <p className="desc">Estudiantes con promedio ponderado superior a 4.60 que aprobaron todas sus asignaturas en primera oportunidad.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 40 }} className="podium">
          {podium.map((e,i) => (
            <div key={i} className="card" style={{ background: 'var(--paper-2)', textAlign: 'center', padding: '32px 20px', border: `2px solid ${colors[i]}` }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 72, fontWeight: 500, lineHeight: 1, color: colors[i], letterSpacing: '-0.04em' }}>
                {i===0?'1°':i===1?'2°':'3°'}
              </div>
              <div style={{ width: 80, height: 80, borderRadius: 999, background: `color-mix(in oklab, ${colors[i]} 25%, var(--paper))`, margin: '20px auto', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600 }}>
                {e.n.split(' ').slice(0,2).map(x => x[0]).join('')}
              </div>
              <div style={{ fontWeight: 600, fontSize: 17 }}>{e.n}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.12em', color: 'var(--ink-3)', textTransform: 'uppercase', marginTop: 6 }}>Semestre {e.s}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginTop: 14, color: colors[i] }}>{Number(e.prom).toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ background: 'var(--paper-2)', padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px 100px', padding: '14px 24px', background: 'var(--paper)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
            <div>Puesto</div><div>Estudiante</div><div>Semestre</div><div style={{ textAlign: 'right' }}>Promedio</div>
          </div>
          {rest.map((e,i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px 100px', padding: '16px 24px', borderTop: '1px solid color-mix(in oklab, var(--ink) 7%, transparent)', alignItems: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink-3)' }}>{e.p}</div>
              <div style={{ fontWeight: 500 }}>{e.n}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-2)' }}>Sem {e.s}</div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontSize: 18 }}>{Number(e.prom).toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40, padding: 28, background: 'var(--paper-2)', borderRadius: 14 }}>
          <div className="eyebrow">Histórico</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginTop: 16 }}>
            {['2024-I','2024-II','2025-I','2025-II'].map((p) => (
              <button key={p} className="btn ghost" style={{ justifyContent: 'space-between' }}>{p} <Icons.arrow /></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const REGLAMENTO = [
  {t:'Capítulo I · Disposiciones generales',s:'Objeto, ámbito de aplicación y principios que orientan el reglamento estudiantil.',art:'Art. 1 – 5'},
  {t:'Capítulo II · Admisiones',s:'Requisitos de inscripción, criterios de selección, traslados y transferencias.',art:'Art. 6 – 18'},
  {t:'Capítulo III · Matrícula',s:'Proceso de matrícula académica, financiera, novedades y devoluciones.',art:'Art. 19 – 32'},
  {t:'Capítulo IV · Régimen académico',s:'Asistencia, evaluaciones, promoción, repitencia y cancelaciones de asignatura.',art:'Art. 33 – 58'},
  {t:'Capítulo V · Derechos y deberes',s:'Derechos fundamentales del estudiante, deberes académicos y convivencia.',art:'Art. 59 – 70'},
  {t:'Capítulo VI · Régimen disciplinario',s:'Faltas, procedimiento disciplinario, sanciones y recursos.',art:'Art. 71 – 94'},
  {t:'Capítulo VII · Distinciones y estímulos',s:'Cuadro de honor, menciones, becas de excelencia y otros reconocimientos.',art:'Art. 95 – 102'},
  {t:'Capítulo VIII · Graduación',s:'Requisitos de grado, modalidades de trabajo de grado y ceremonia.',art:'Art. 103 – 118'},
]

function Reglamento() {
  const [open, setOpen] = useState(0)
  return (
    <section className="section" style={{ paddingTop: 30 }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Reglamento estudiantil</div>
            <h2 style={{ marginTop: 10 }}>Acuerdo 018 de 2021 · Consejo Superior.</h2>
          </div>
          <p className="desc">Navega por capítulo, descarga el texto completo o consulta un artículo específico.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40 }} className="reg-grid">
          <div>
            {REGLAMENTO.map((c,i) => (
              <div key={i} style={{ borderTop: i===0 ? '1px solid color-mix(in oklab, var(--ink) 10%, transparent)' : 'none', borderBottom: '1px solid color-mix(in oklab, var(--ink) 10%, transparent)' }}>
                <button onClick={() => setOpen(open===i ? -1 : i)}
                  style={{ width: '100%', padding: '22px 4px', background: 'transparent', border: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, textAlign: 'left' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.12em', color: 'var(--ink-3)' }}>{c.art}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginTop: 6, fontWeight: 500 }}>{c.t}</div>
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: 999, background: open===i ? 'var(--ink)' : 'transparent', border: open===i ? 'none' : '1px solid color-mix(in oklab, var(--ink) 20%, transparent)', color: open===i ? 'var(--paper)' : 'var(--ink)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    {open===i ? '–' : '+'}
                  </div>
                </button>
                {open===i && (
                  <div style={{ padding: '0 4px 22px', color: 'var(--ink-2)', fontSize: 15, lineHeight: 1.6 }}>
                    {c.s} Este capítulo desarrolla los lineamientos, procedimientos y criterios aplicables, junto con las responsabilidades de las partes involucradas.
                    <div style={{ marginTop: 14 }}>
                      <button className="btn ghost" style={{ padding: '6px 14px', fontSize: 12 }}><Icons.download /> Ver capítulo completo</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <aside>
            <div style={{ background: 'var(--paper-2)', borderRadius: 14, padding: 22, position: 'sticky', top: 100 }}>
              <div className="eyebrow">Documento completo</div>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 10, marginBottom: 16 }}>Acuerdo 018 de 2021 · 42 páginas</p>
              <button className="btn accent" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}><Icons.download /> Descargar PDF</button>
              <button className="btn ghost" style={{ width: '100%', justifyContent: 'center' }}><Icons.search /> Buscar artículo</button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

function Grado() {
  const modalidades = [
    {t:'Trabajo de investigación',d:'Monografía asociada a grupo de investigación del programa, con tutor y sustentación pública.',req:['Haber aprobado 140 créditos','Propuesta avalada por comité','Tutor vinculado a grupo activo','Sustentación pública'],dur:'2 semestres',color:'var(--ug-azul)'},
    {t:'Proyecto aplicado',d:'Desarrollo de un producto de software, prototipo IoT o sistema que resuelva un problema concreto con aliado externo.',req:['Problema validado con organización','Carta de compromiso del aliado','Plan de trabajo aprobado','Entrega funcional + documentación'],dur:'2 semestres',color:'var(--ug-amarillo)'},
    {t:'Práctica profesional extendida',d:'Vinculación laboral de 8 meses con empresa o institución, con informe técnico y evaluación del jefe inmediato.',req:['Convenio vigente con empresa','Mínimo 8 meses · 40 h/sem','Informe técnico final','Evaluación de desempeño'],dur:'8 meses',color:'var(--ug-flamingo)'},
    {t:'Cursar posgrado',d:'Aprobación de tres asignaturas de la Maestría en Ingeniería con promedio igual o superior a 4.0.',req:['Admisión a maestría','Aprobar 3 cursos ≥ 4.0','Certificación académica','Paz y salvo'],dur:'1 – 2 semestres',color:'var(--ug-negro)'},
    {t:'Emprendimiento',d:'Creación y operación de una empresa de base tecnológica por al menos 12 meses con plan de negocio.',req:['Empresa constituida','12 meses de operación','Plan de negocio validado','Indicadores de tracción'],dur:'12 – 18 meses',color:'var(--ug-azul)'},
    {t:'Semillero de investigación',d:'Permanencia activa en semillero por mínimo tres semestres con productos verificables y ponencia.',req:['Mín. 3 semestres en semillero','Ponencia en evento académico','Producto verificable','Aval del director del semillero'],dur:'Mínimo 3 sem.',color:'var(--ug-amarillo)'},
  ]
  return (
    <section className="section" style={{ paddingTop: 30 }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Modalidades de grado</div>
            <h2 style={{ marginTop: 10 }}>Seis caminos válidos hacia tu título.</h2>
          </div>
          <p className="desc">Elige la modalidad que mejor se alinea a tu perfil. Todas exigen paz y salvo financiero y dominio de lengua extranjera (B1).</p>
        </div>
        <div className="grid-3">
          {modalidades.map((m,i) => (
            <div key={i} className="card" style={{ background: 'var(--paper-2)', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 340 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: m.color }} />
              <h3 style={{ fontSize: 20 }}>{m.t}</h3>
              <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>{m.d}</p>
              <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)' }}>
                <div className="eyebrow" style={{ marginBottom: 10 }}>Requisitos</div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {m.req.map((r,j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'start', gap: 8, fontSize: 13, color: 'var(--ink-2)' }}><Icons.check /> {r}</li>
                  ))}
                </ul>
                <div style={{ marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.1em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>Duración · {m.dur}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Docs() {
  const grupos = [
    {g:'Académicos',items:[['Reglamento estudiantil 2021','PDF · 1.8 MB'],['Calendario académico 2026-II','PDF · 420 KB'],['Plan de estudios completo','PDF · 720 KB'],['Microcurrículos por asignatura','ZIP · 8.4 MB'],['Formato cancelación asignatura','DOC · 42 KB']]},
    {g:'Trabajo de grado',items:[['Guía de trabajo de grado','PDF · 960 KB'],['Formato de propuesta','DOC · 110 KB'],['Acta de sustentación','DOC · 48 KB'],['Rúbrica de evaluación','PDF · 380 KB']]},
    {g:'Prácticas y extensión',items:[['Convenio marco tipo','PDF · 1.2 MB'],['Carta de presentación','DOC · 36 KB'],['Bitácora de práctica','PDF · 540 KB'],['Evaluación de desempeño','PDF · 310 KB']]},
    {g:'Bienestar y apoyos',items:[['Subsidios y becas 2026','PDF · 680 KB'],['Servicios de salud mental','PDF · 220 KB'],['Apoyo alimentario','PDF · 180 KB']]},
  ]
  return (
    <section className="section" style={{ paddingTop: 30 }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Documentos descargables</div>
            <h2 style={{ marginTop: 10 }}>Formatos, guías y reglamentos.</h2>
          </div>
        </div>
        <div className="grid-2">
          {grupos.map((g,i) => (
            <div key={i} className="card" style={{ background: 'var(--paper-2)' }}>
              <div className="eyebrow" style={{ color: 'var(--accent-deep)' }}>● {g.g}</div>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 0 }}>
                {g.items.map(([n,s],j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: j < g.items.length-1 ? '1px solid color-mix(in oklab, var(--ink) 7%, transparent)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 6, background: 'var(--paper)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--ink-3)' }}>{s.split('·')[0].trim()}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{n}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', letterSpacing: '.08em', marginTop: 2 }}>{s}</div>
                      </div>
                    </div>
                    <button className="icon-btn" style={{ width: 34, height: 34 }}><Icons.download /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Estudiantes() {
  const [tab, setTab] = useState('calendario')
  const tabs = [{id:'calendario',l:'Calendario'},{id:'honor',l:'Cuadro de Honor'},{id:'reglamento',l:'Reglamento'},{id:'grado',l:'Opciones de grado'},{id:'docs',l:'Documentos'}]

  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: 'clamp(60px,8vw,110px)', paddingBottom: 30 }}>
        <div className="inner">
          <div className="eyebrow">Comunidad · Estudiantes</div>
          <h1 style={{ marginTop: 14, maxWidth: '20ch' }}>Todo lo que necesitas, en un solo lugar.</h1>
          <p style={{ fontSize: 18, color: 'var(--ink-2)', marginTop: 24, maxWidth: '58ch' }}>
            Calendario, fechas clave, cuadro de honor, reglamento y modalidades de grado — organizado para que no pierdas tiempo buscando.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 36 }}>
            {tabs.map(t => (
              <button key={t.id} className="chip" onClick={() => setTab(t.id)}
                style={{ cursor: 'pointer', background: tab===t.id ? 'var(--ink)' : undefined, color: tab===t.id ? 'var(--paper)' : undefined, borderColor: tab===t.id ? 'var(--ink)' : undefined }}>
                {t.l}
              </button>
            ))}
          </div>
        </div>
      </section>

      {tab === 'calendario' && <Calendario />}
      {tab === 'honor' && <Honor />}
      {tab === 'reglamento' && <Reglamento />}
      {tab === 'grado' && <Grado />}
      {tab === 'docs' && <Docs />}
    </div>
  )
}
