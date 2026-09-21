import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Icons } from '../../components/Icons'
import Portal from '../../components/Portal'
import Retrato from '../../components/Retrato'
import TramaMarca from '../../components/TramaMarca'
import { useData, apiDocumentosHonor } from '../../context/DataContext'
import { ordinalSemestre } from '../../../shared/validacion'
import { usePestana } from '../../hooks/useParametroURL'

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

const COLOR_TIPO = {
  evaluacion: 'var(--ug-flamingo)',
  grado: 'var(--ug-amarillo)',
  academico: 'var(--ug-azul)',
  administrativo: 'var(--ink-3)',
  otro: 'var(--ink-3)',
}

const NOMBRE_MES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

/* Toma los meses con mas eventos y marca los dias ocupados, para que los
   mini-calendarios reflejen lo que hay en la base y no fechas escritas a mano. */
function mesesDestacados(eventos, cuantos = 2) {
  const porMes = new Map()
  for (const ev of eventos) {
    if (!ev.fecha_inicio) continue
    const [a, m, d] = ev.fecha_inicio.split('-').map(Number)
    const hasta = ev.fecha_fin ? Number(ev.fecha_fin.split('-')[2]) : d
    const clave = a + '-' + m
    if (!porMes.has(clave)) porMes.set(clave, { anio: a, mes: m, marks: {}, etiqueta: ev.titulo })
    const reg = porMes.get(clave)
    // Solo marcamos dias dentro del mismo mes; un rango entre meses marca el inicio.
    const fin = ev.fecha_fin && ev.fecha_fin.slice(0, 7) === ev.fecha_inicio.slice(0, 7) ? hasta : d
    for (let dia = d; dia <= fin; dia++) reg.marks[dia] = true
    if (ev.destacado) reg.etiqueta = ev.titulo
  }
  return [...porMes.values()]
    .sort((x, y) => Object.keys(y.marks).length - Object.keys(x.marks).length)
    .slice(0, cuantos)
    .sort((x, y) => (x.anio - y.anio) || (x.mes - y.mes))
    .map(r => ({
      ...r,
      titulo: NOMBRE_MES[r.mes - 1] + ' ' + r.anio,
      dias: new Date(r.anio, r.mes, 0).getDate(),
      // La rejilla empieza en lunes; getDay() cuenta desde domingo.
      inicio: (new Date(r.anio, r.mes - 1, 1).getDay() + 6) % 7,
    }))
}

function Calendario() {
  const { data } = useData()
  const eventos = data.calendario ?? []
  const periodo = eventos.find(e => e.periodo)?.periodo ?? ''
  const meses = mesesDestacados(eventos)

  if (eventos.length === 0) {
    return (
      <section className="section" style={{ paddingTop: 30 }}>
        <div className="inner" style={{ color: 'var(--ink-3)' }}>Todavia no hay fechas publicadas.</div>
      </section>
    )
  }

  return (
    <section className="section" style={{ paddingTop: 30 }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Calendario academico {periodo}</div>
            <h2 style={{ marginTop: 10 }}>Las fechas que no puedes perder.</h2>
          </div>
          <p className="desc">Descarga el calendario completo o sincronizalo con Google Calendar.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }} className="cal-grid">
          <div>
            <div className="eyebrow" style={{ marginBottom: 20 }}>Cronograma semestral</div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 10, top: 10, bottom: 10, width: 2, background: 'color-mix(in oklab, var(--ink) 12%, transparent)' }} />
              {eventos.map(e => {
                const color = COLOR_TIPO[e.tipo] ?? 'var(--ink-3)'
                return (
                  <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: 16, padding: '10px 0', position: 'relative', alignItems: 'start' }}>
                    <div style={{ width: 22, height: 22, borderRadius: 999, background: color, border: '3px solid var(--paper)', zIndex: 1, marginTop: 2 }} />
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.12em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>{e.etiqueta_fecha}</div>
                      <div style={{ fontSize: 16, marginTop: 4, fontWeight: e.destacado ? 600 : 400 }}>{e.titulo}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 20 }}>Vista de calendario</div>
            {meses.map((m, i) => (
              <div key={m.titulo} style={{ marginTop: i === 0 ? 0 : 24 }}>
                <MiniMonth month={m.titulo} start={m.inicio} days={m.dias} marks={m.marks} legendLabel={m.etiqueta} />
              </div>
            ))}
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

/* Ficha que ve el visitante. Antes era una tarjeta blanca con los datos en
   fila; ahora abre con la franja tejida y el teal del encabezado de
   uniguajira.edu.co, y el retrato monta sobre la banda con el color del
   puesto, el mismo que bordea las tarjetas del podio. Los documentos se piden
   al abrirla, no antes, para no cargar de mas. */
function FichaPublica({ estudiante, puesto, color, onCerrar }) {
  const [docs, setDocs] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let vivo = true
    apiDocumentosHonor(estudiante.id)
      .then(l => { if (vivo) setDocs(l) })
      .catch(e => { if (vivo) { setError(e.message); setDocs([]) } })
    return () => { vivo = false }
  }, [estudiante.id])

  useEffect(() => {
    const alPulsar = e => { if (e.key === 'Escape') onCerrar() }
    document.addEventListener('keydown', alPulsar)
    return () => document.removeEventListener('keydown', alPulsar)
  }, [onCerrar])

  const dato = (etiqueta, valor) => (
    <div className="ficha-est__dato">
      <div className="eyebrow" style={{ fontSize: 10 }}>{etiqueta}</div>
      <div className="ficha-est__dato-valor">{valor || '—'}</div>
    </div>
  )

  const medalla = puesto <= 3
    ? ['1.er lugar', '2.º lugar', '3.er lugar'][puesto - 1]
    : 'Puesto ' + puesto

  return (
    <Portal>
    <div role="dialog" aria-modal="true" aria-label={'Ficha de ' + estudiante.nombre} onClick={onCerrar}
         className="ficha-est__fondo">
      <div className="ficha-est" onClick={e => e.stopPropagation()} style={{ '--puesto': color }}>

        <div className="ficha-est__banda">
          {/* La banda hace de portada de la ficha y no lleva imagen propia:
              la cuadrícula del emblema la sostiene en vez del teal a secas. */}
          <TramaMarca blanco escala={104} opacidad={0.08} />
          <button className="ficha-est__cerrar" onClick={onCerrar} aria-label="Cerrar ficha">
            <Icons.close />
          </button>
          <div className="ficha-est__eyebrow">Cuadro de honor · Ingeniería de Sistemas</div>
          <div className="ficha-est__medalla"><Icons.sparkle /> {medalla}</div>
          <div className="ficha-est__retrato">
            <Retrato persona={estudiante} size={112} />
          </div>
        </div>

        <div className="ficha-est__cuerpo">
          <h3 className="ficha-est__nombre">{estudiante.nombre}</h3>
          <div className="ficha-est__promedio">{Number(estudiante.promedio).toFixed(2)}</div>
          <div className="eyebrow" style={{ fontSize: 10 }}>Promedio ponderado</div>

          <div className="ficha-est__datos">
            {dato('Semestre', ordinalSemestre(estudiante.semestre))}
            {dato('Período', estudiante.periodo)}
            {dato('Sede', estudiante.sede === 'maicao' ? 'Maicao' : 'Riohacha')}
          </div>

          <div className="ficha-est__docs">
            <div className="ficha-est__docs-head">
              <div className="eyebrow">Documentos</div>
              {docs?.length > 0 && <span className="ficha-est__conteo">{docs.length}</span>}
            </div>

            {error && <div role="alert" className="mensaje-error">{error}</div>}
            {docs === null && <div className="ficha-est__nota">Cargando documentos…</div>}

            {docs?.length === 0 && !error && (
              <div className="ficha-est__vacio">
                <Icons.archivo />
                <span>Este estudiante todavía no tiene documentos publicados.</span>
              </div>
            )}

            {docs?.map(d => (
              <a key={d.id} className="ficha-est__doc" href={d.descarga || d.url}
                 aria-label={'Descargar ' + d.nombre}>
                <span className="ficha-est__doc-tipo">{d.tipo}</span>
                <span className="ficha-est__doc-texto">
                  <span className="ficha-est__doc-nombre">{d.nombre}</span>
                  <span className="ficha-est__doc-meta">
                    {[d.tipo, d.peso, d.descripcion].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <span className="ficha-est__doc-baja"><Icons.download /></span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
    </Portal>
  )
}

function Honor() {
  const { data } = useData()
  const todos = data.honor ?? []

  /* Periodos que existen de verdad en la base, del mas reciente al mas antiguo.
     Antes el 'Historico' listaba cuatro periodos escritos a mano. */
  const periodos = [...new Set(todos.map(e => e.periodo).filter(Boolean))].sort().reverse()

  const [elegido, setElegido] = useState(null)
  const activo = elegido ?? periodos[0] ?? null
  const [detalle, setDetalle] = useState(null)

  const delPeriodo = activo ? todos.filter(e => e.periodo === activo) : todos
  // Copia antes de ordenar: .sort() mutaria el arreglo del estado.
  const top = [...delPeriodo].sort((a, b) => Number(b.promedio) - Number(a.promedio))
  const podium = top.slice(0, 3)
  const rest = top.slice(3)
  const colors = ['var(--ug-amarillo)', 'var(--ug-azul)', 'var(--ug-flamingo)']

  /* La ficha se abre desde el podio y desde la tabla. Viaja el puesto para que
     la ficha pueda anunciarlo y pintarse con el color que le corresponde. */
  const abrir = (e, puesto) => setDetalle({ estudiante: e, puesto })
  const teclaAbre = (ev, e, puesto) => {
    if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); abrir(e, puesto) }
  }

  return (
    <section className="section" style={{ paddingTop: 30 }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Cuadro de Honor · {activo ?? 'sin período'}</div>
            <h2 style={{ marginTop: 10 }}>Mejores promedios del semestre.</h2>
          </div>
          <p className="desc">
            Estudiantes con promedio ponderado superior a 4.60 que aprobaron todas sus asignaturas
            en primera oportunidad. Pulsa a cualquiera para ver su ficha y sus documentos.
          </p>
        </div>

        {top.length === 0 && (
          <div style={{ color: 'var(--ink-3)' }}>No hay estudiantes publicados en este período.</div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 40 }} className="podium">
          {podium.map((e, i) => (
            /* Las medidas pasan a .honor-podio porque la tarjeta necesita
               position/overflow propios: sin ellos la cuadrícula del emblema se
               saldría por las esquinas redondeadas y taparía el contenido. */
            <div key={e.id ?? i} className="card honor-podio" role="button" tabIndex={0}
                 onClick={() => abrir(e, i + 1)} onKeyDown={ev => teclaAbre(ev, e, i + 1)}
                 style={{ '--puesto': colors[i] }}>
              {/* El podio no tiene portada: la cuadrícula hace de fondo por
                  defecto y toma el color del puesto. */}
              <TramaMarca escala={82} opacidad={0.09} tono={colors[i]} />
              <div className="honor-podio__cuerpo">
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 72, fontWeight: 500, lineHeight: 1, color: colors[i], letterSpacing: '-0.04em' }}>
                  {i === 0 ? '1°' : i === 1 ? '2°' : '3°'}
                </div>
                <div style={{ margin: '20px auto', display: 'grid', placeItems: 'center' }}>
                  <Retrato persona={e} size={80} borde={colors[i]} />
                </div>
                <div style={{ fontWeight: 600, fontSize: 17 }}>{e.nombre}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.12em', color: 'var(--ink-3)', textTransform: 'uppercase', marginTop: 6 }}>
                  Semestre {ordinalSemestre(e.semestre)}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginTop: 14, color: colors[i] }}>
                  {Number(e.promedio).toFixed(2)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--accent-deep)', marginTop: 10 }}>Ver ficha</div>
              </div>
            </div>
          ))}
        </div>

        {rest.length > 0 && (
          <div className="card" style={{ background: 'var(--paper-2)', padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px 100px', padding: '14px 24px', background: 'var(--paper)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
              <div>Puesto</div><div>Estudiante</div><div>Semestre</div><div style={{ textAlign: 'right' }}>Promedio</div>
            </div>
            {rest.map((e, i) => (
              <div key={e.id ?? i} role="button" tabIndex={0}
                   onClick={() => abrir(e, i + 4)} onKeyDown={ev => teclaAbre(ev, e, i + 4)}
                   style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px 100px', padding: '16px 24px',
                            borderTop: '1px solid var(--borde)', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink-3)' }}>{i + 4}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 500 }}>
                  <Retrato persona={e} size={34} />
                  {e.nombre}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-2)' }}>Sem {ordinalSemestre(e.semestre)}</div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontSize: 18 }}>{Number(e.promedio).toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Historico: los periodos salen de los datos y el boton filtra de verdad. */}
        {periodos.length > 0 && (
          <div style={{ marginTop: 40, padding: 28, background: 'var(--paper-2)', borderRadius: 'var(--radius)' }}>
            <div className="eyebrow">Histórico</div>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 8 }}>
              {periodos.length === 1
                ? 'Por ahora solo hay publicado un período.'
                : 'Elige un período para ver su cuadro de honor.'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginTop: 16 }}>
              {periodos.map(per => {
                const cuantos = todos.filter(e => e.periodo === per).length
                const esActivo = per === activo
                return (
                  <button key={per} className={'btn ' + (esActivo ? 'accent' : 'ghost')}
                          aria-pressed={esActivo} onClick={() => setElegido(per)}
                          style={{ justifyContent: 'space-between' }}>
                    {per}
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, opacity: .75 }}>
                      {cuantos} {cuantos === 1 ? 'est.' : 'ests.'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {detalle && (
        <FichaPublica
          estudiante={detalle.estudiante}
          puesto={detalle.puesto}
          color={colors[detalle.puesto - 1] ?? 'var(--accent)'}
          onCerrar={() => setDetalle(null)} />
      )}
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

function Docs() {
  const { data } = useData()

  /* La base entrega los documentos ya ordenados por grupo; aqui solo se
     reagrupan para pintarlos en tarjetas. */
  const grupos = (data.documentos_estudiantes ?? []).reduce((acc, d) => {
    const g = d.grupo || 'General'
    ;(acc[g] ??= []).push(d)
    return acc
  }, {})
  const entradas = Object.entries(grupos)

  return (
    <section className="section" style={{ paddingTop: 30 }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Documentos descargables</div>
            <h2 style={{ marginTop: 10 }}>Formatos, guias y reglamentos.</h2>
          </div>
        </div>
        {entradas.length === 0 ? (
          <div style={{ color: 'var(--ink-3)' }}>Todavia no hay documentos publicados.</div>
        ) : (
          <div className="grid-2">
            {entradas.map(([grupo, items]) => (
              <div key={grupo} className="card" style={{ background: 'var(--paper-2)' }}>
                <div className="eyebrow" style={{ color: 'var(--accent-deep)' }}>. {grupo}</div>
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {items.map((d, j) => (
                    <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: j < items.length - 1 ? '1px solid color-mix(in oklab, var(--ink) 7%, transparent)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 6, background: 'var(--paper)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--ink-3)' }}>{d.tipo}</div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500 }}>{d.nombre}</div>
                          <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', letterSpacing: '.08em', marginTop: 2 }}>
                            {[d.tipo, d.peso, d.descripcion].filter(Boolean).join(' . ')}
                          </div>
                        </div>
                      </div>
                      {/* `descarga` apunta al adjunto de la base con el nombre
                          original; para los de tipo Enlace es la URL externa. */}
                      {(d.descarga || d.url)
                        ? <a className="icon-btn" href={d.descarga || d.url} style={{ width: 34, height: 34, display: 'grid', placeItems: 'center' }} aria-label={'Descargar ' + d.nombre}><Icons.download /></a>
                        : <button className="icon-btn" style={{ width: 34, height: 34, opacity: .4 }} disabled title="Sin archivo cargado"><Icons.download /></button>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* Las modalidades de grado se fueron a la vista Egresados: son del trámite
   de grado y quien las consulta ya terminó materias. */
const tabs = [{id:'calendario',l:'Calendario'},{id:'honor',l:'Cuadro de Honor'},{id:'reglamento',l:'Reglamento'},{id:'docs',l:'Documentos'}]

export default function Estudiantes() {
  /* En la URL: recargar deja de mandar al calendario, y se puede enlazar
     directo a una sección (#/estudiantes?seccion=honor). */
  const [tab, setTab] = usePestana(tabs.map(t => t.id), { clave: 'seccion' })

  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: 'clamp(60px,8vw,110px)', paddingBottom: 30 }}>
        <div className="inner">
          <div className="eyebrow">Comunidad · Estudiantes</div>
          <h1 style={{ marginTop: 14, maxWidth: '20ch' }}>Todo lo que necesitas, en un solo lugar.</h1>
          <p style={{ fontSize: 18, color: 'var(--ink-2)', marginTop: 24, maxWidth: '58ch' }}>
            Calendario, fechas clave, cuadro de honor, reglamento y documentos — organizado para que no pierdas tiempo buscando.
          </p>
          {/* Las modalidades de grado se fueron a Egresados. Este enlace evita
              que quien venga buscándolas aquí crea que desaparecieron. */}
          <p style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 12, maxWidth: '58ch' }}>
            ¿Buscas las modalidades de grado? Están en{' '}
            <Link to="/egresados" style={{ color: 'var(--ug-azul-deep)' }}>Egresados</Link>, junto con
            la normativa del trámite, las convocatorias de prácticas y las ideas de investigación.
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
      {tab === 'docs' && <Docs />}
    </div>
  )
}
