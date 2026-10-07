import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Icons } from '../../components/Icons'
import Portal from '../../components/Portal'
import Retrato from '../../components/Retrato'
import TramaMarca from '../../components/TramaMarca'
import { useData, apiDocumentosHonor } from '../../context/DataContext'
import { ordinalSemestre } from '../../../shared/validacion'
import { usePestana } from '../../hooks/useParametroURL'

const COLOR_TIPO = {
  evaluacion: 'var(--ug-flamingo)',
  grado: 'var(--ug-amarillo)',
  academico: 'var(--ug-azul)',
  administrativo: 'var(--ink-3)',
  otro: 'var(--ink-3)',
}

const ETIQUETA_TIPO = {
  evaluacion: 'Evaluación',
  grado: 'Grado',
  academico: 'Académico',
  administrativo: 'Administrativo',
  otro: 'Otro',
}

const NOMBRE_MES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const ABREV_MES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']

/* "2026-05-26" -> "26 MAY". Se parte la cadena en vez de construir un Date:
   pasar por Date convierte a la zona local y se come un día. */
function fechaCorta(iso) {
  if (!iso) return ''
  const [, m, d] = iso.split('-').map(Number)
  return String(d).padStart(2, '0') + ' ' + ABREV_MES[m - 1]
}

/* Un mes por cada uno que tenga algo en el calendario, con los días marcados y
   el color de lo que cae en cada uno. Antes solo salían los dos meses con más
   actividad y el resto del semestre no se podía mirar. */
function mesesDelCalendario(eventos) {
  const porMes = new Map()

  for (const ev of eventos) {
    if (!ev.fecha_inicio) continue
    const [a, m, d] = ev.fecha_inicio.split('-').map(Number)
    const clave = a + '-' + String(m).padStart(2, '0')
    if (!porMes.has(clave)) porMes.set(clave, { anio: a, mes: m, dias: {}, destacado: null })
    const reg = porMes.get(clave)

    /* Un rango que cruza de mes solo marca su día de inicio en este. */
    const mismoMes = ev.fecha_fin && ev.fecha_fin.slice(0, 7) === ev.fecha_inicio.slice(0, 7)
    const hasta = mismoMes ? Number(ev.fecha_fin.split('-')[2]) : d
    for (let dia = d; dia <= hasta; dia++) reg.dias[dia] = ev.tipo

    if (ev.destacado || !reg.destacado) reg.destacado = ev
  }

  return [...porMes.values()]
    .sort((x, y) => (x.anio - y.anio) || (x.mes - y.mes))
    .map(r => ({
      ...r,
      clave: r.anio + '-' + r.mes,
      titulo: NOMBRE_MES[r.mes - 1] + ' ' + r.anio,
      total: new Date(r.anio, r.mes, 0).getDate(),
      /* La rejilla empieza en lunes; getDay() cuenta desde el domingo. */
      inicio: (new Date(r.anio, r.mes - 1, 1).getDay() + 6) % 7,
    }))
}

const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

/* El cronograma muestra solo los próximos hitos: los que ya vencieron salen
   y el siguiente de la lista entra en su lugar. Un hito vence cuando pasa su
   fecha final (o la de inicio, si es de un solo día); el que está en curso
   sigue visible hasta su último día. */
const HITOS_VISIBLES = 10

function hoyISO() {
  const d = new Date()
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-')
}
const finDe = e => e.fecha_fin || e.fecha_inicio || ''

function RejillaMes({ mes }) {
  const celdas = []
  for (let i = 0; i < mes.inicio; i++) celdas.push(null)
  for (let d = 1; d <= mes.total; d++) celdas.push(d)

  return (
    <>
      <div className="cal-semana">
        {DIAS_SEMANA.map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="cal-dias">
        {celdas.map((d, i) => {
          const tipo = d && mes.dias[d]
          return (
            <div key={i}
                 className={'cal-dia' + (d ? '' : ' is-vacio') + (tipo ? ' is-marcado' : '')}
                 style={tipo ? { '--tono': COLOR_TIPO[tipo] ?? 'var(--ink-3)' } : undefined}>
              {d ?? ''}
            </div>
          )
        })}
      </div>
    </>
  )
}

function Calendario() {
  const { data } = useData()
  const eventos = data.calendario ?? []
  const periodo = eventos.find(e => e.periodo)?.periodo ?? ''
  const meses = mesesDelCalendario(eventos)
  const hoy = hoyISO()
  const vigentes = eventos
    .filter(e => finDe(e) >= hoy)
    .sort((a, b) => String(a.fecha_inicio).localeCompare(String(b.fecha_inicio)))
  const proximos = vigentes.slice(0, HITOS_VISIBLES)
  /* null = «automático»: la rejilla abre en el mes del próximo hito y no en el
     primero del semestre, que ya quedó atrás. */
  const [mesActivo, setMesActivo] = useState(null)

  if (eventos.length === 0) {
    return (
      <section className="section" style={{ paddingTop: 30 }}>
        <div className="inner" style={{ color: 'var(--ink-3)' }}>Todavía no hay fechas publicadas.</div>
      </section>
    )
  }

  /* El índice puede quedar fuera de rango si los datos llegan después. */
  const mesInicial = Math.max(0, meses.findIndex(m => proximos[0]?.fecha_inicio?.startsWith(m.anio + '-' + String(m.mes).padStart(2, '0'))))
  const i = Math.min(mesActivo ?? mesInicial, meses.length - 1)
  const mes = meses[i]

  /* La leyenda sale de lo que hay publicado, no de una lista fija: si no hay
     ninguna evaluación, no se anuncia el color de las evaluaciones. */
  const tipos = [...new Set(eventos.map(e => e.tipo))]

  return (
    <section className="section" style={{ paddingTop: 30 }}>
      <div className="inner">

        <div className="cal-cabecera">
          <div>
            <div className="doc-seccion__titulo" style={{ margin: 0 }}>
              Calendario académico {periodo}
            </div>
            <h2 className="cal-cabecera__titulo">Las fechas que no puedes perder.</h2>
          </div>

          <div className="cal-cabecera__lado">
            <p className="cal-cabecera__desc">
              Descarga el calendario completo o sincronízalo con Google Calendar.
            </p>
            <div className="cal-acciones">
              <button className="btn"><Icons.download /> Calendario PDF</button>
              <button className="btn ghost">+ Google Calendar</button>
            </div>
          </div>
        </div>

        <div className="cal-columnas">

          {/* ── Cronograma ── */}
          <div>
            <div className="cal-rotulo">
              <span className="cal-rotulo__texto">Cronograma semestral</span>
              <span className="doc-pin doc-pin--azul">
                {vigentes.length > proximos.length
                  ? `Próximos ${proximos.length} de ${vigentes.length}`
                  : `${proximos.length} ${proximos.length === 1 ? 'hito' : 'hitos'} por venir`}
              </span>
            </div>

            {proximos.length === 0 && (
              <div className="doc-vacio">No quedan fechas pendientes en este calendario.</div>
            )}
            <div className="cal-hitos">
              {proximos.map(e => (
                <div key={e.id} className="cal-hito" style={{ '--tono': COLOR_TIPO[e.tipo] ?? 'var(--ink-3)' }}>
                  <span className="cal-hito__punto" aria-hidden="true" />
                  <div>
                    <div className="cal-hito__fecha">{e.etiqueta_fecha || fechaCorta(e.fecha_inicio)}</div>
                    <div className="cal-hito__titulo">{e.titulo}</div>
                    {e.descripcion && <div className="cal-hito__desc">{e.descripcion}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Rejilla del mes ── */}
          <div>
            <div className="cal-rotulo">
              <span className="cal-rotulo__texto">Vista de calendario</span>
            </div>

            <div className="cal-mes">
              <div className="cal-mes__cabeza">
                <span className="cal-mes__nombre">{mes.titulo}</span>
                {mes.destacado && (
                  <span className="doc-pin doc-pin--terracota">{mes.destacado.titulo}</span>
                )}
                {/* Las flechas son ahora la unica forma de cambiar de mes. */}
                <div className="cal-mes__flechas">
                  <button className="cal-mes__flecha" onClick={() => setMesActivo(i - 1)}
                          disabled={i === 0} aria-label="Mes anterior">‹</button>
                  <button className="cal-mes__flecha" onClick={() => setMesActivo(i + 1)}
                          disabled={i === meses.length - 1} aria-label="Mes siguiente">›</button>
                </div>
              </div>

              <RejillaMes mes={mes} />

              <div className="cal-pie">
                <div className="cal-leyenda">
                  {tipos.map(t => (
                    <span key={t} className="cal-leyenda__item" style={{ '--tono': COLOR_TIPO[t] ?? 'var(--ink-3)' }}>
                      <span className="cal-leyenda__punto" aria-hidden="true" />
                      {ETIQUETA_TIPO[t] ?? t}
                    </span>
                  ))}
                </div>
                <Link className="cal-pie__enlace" to="/resoluciones">
                  Consultar resoluciones →
                </Link>
              </div>
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
          <div className="eyebrow" style={{ fontSize: 10 }}>Promedio acumulado</div>

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

  /* Cada sede tiene su propio cuadro (los diez mejores de cada una), así que
     se elige la sede en vez de mezclarlas en un solo ranking. El selector
     solo aparece si el periodo tiene estudiantes de las dos. */
  const sedesDelPeriodo = ['riohacha', 'maicao'].filter(s => delPeriodo.some(e => e.sede === s))
  const [sedeElegida, setSedeElegida] = useState('riohacha')
  const sede = sedesDelPeriodo.includes(sedeElegida) ? sedeElegida : (sedesDelPeriodo[0] ?? null)
  const deLaSede = sede ? delPeriodo.filter(e => e.sede === sede) : delPeriodo

  // Copia antes de ordenar: .sort() mutaria el arreglo del estado. El sort es
  // estable: a igual promedio queda el orden de la API (el del reporte).
  const top = [...deLaSede].sort((a, b) => Number(b.promedio) - Number(a.promedio))
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
            <h2 style={{ marginTop: 10 }}>Mejores promedios acumulados.</h2>
          </div>
          <p className="desc">
            Los diez mejores promedios acumulados de cada sede, según el reporte académico del
            período. Pulsa a cualquiera para ver su ficha y sus documentos.
          </p>
        </div>

        {sedesDelPeriodo.length > 1 && (
          <div className="sede-filtro honor-sedes" role="group" aria-label="Sede">
            {sedesDelPeriodo.map(s => (
              <button key={s} type="button" aria-pressed={sede === s}
                      className={'sede-filtro__opcion' + (sede === s ? ' sede-filtro__opcion--activa' : '')}
                      onClick={() => setSedeElegida(s)}>
                Sede {s === 'riohacha' ? 'Riohacha' : 'Maicao'}
              </button>
            ))}
          </div>
        )}

        {top.length === 0 && (
          <div style={{ color: 'var(--ink-3)' }}>No hay estudiantes publicados en este período.</div>
        )}

        <div className="podium">
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
                <div className="honor-podio__puesto">
                  {i === 0 ? '1°' : i === 1 ? '2°' : '3°'}
                </div>
                <div className="honor-podio__foto">
                  <Retrato persona={e} size={80} borde={colors[i]} />
                </div>
                <div className="honor-podio__nombre">{e.nombre}</div>
                <div className="honor-podio__sem">
                  Semestre {ordinalSemestre(e.semestre)}
                </div>
                <div className="honor-podio__promedio">
                  {Number(e.promedio).toFixed(2)}
                </div>
                <div className="honor-podio__ver">Ver ficha</div>
              </div>
            </div>
          ))}
        </div>

        {rest.length > 0 && (
          <div className="card" style={{ background: 'var(--paper-2)', padding: 0, overflow: 'hidden' }}>
            <div className="honor-fila honor-fila--cab">
              <div>Puesto</div><div>Estudiante</div><div>Semestre</div><div style={{ textAlign: 'right' }}>Acumulado</div>
            </div>
            {rest.map((e, i) => (
              <div key={e.id ?? i} role="button" tabIndex={0}
                   onClick={() => abrir(e, i + 4)} onKeyDown={ev => teclaAbre(ev, e, i + 4)}
                   className="honor-fila">
                <div className="honor-fila__puesto">{i + 4}</div>
                <div className="honor-fila__est">
                  <Retrato persona={e} size={34} />
                  <span>{e.nombre}</span>
                </div>
                <div className="honor-fila__sem">Sem {ordinalSemestre(e.semestre)}</div>
                <div className="honor-fila__prom">{Number(e.promedio).toFixed(2)}</div>
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

/* ─── Reglamento ─────────────────────────────────────────────────
   Sale de la base (migración 031; se edita en Admin → Estudiantes →
   Reglamento). A un lado, el visor con el documento elegido; al otro, la
   barra con todos los documentos de la sección. Hoy es uno solo, pero la
   barra ya está para cuando se agreguen más. */

const pesoLegible = b => {
  if (!b) return ''
  return b >= 1048576 ? (b / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'
}
/* Solo los PDF se incrustan: un .doc o un enlace a otra web no se ve en un
   iframe, y para esos se ofrece abrir o descargar. */
const esPdf = d => d.archivo_ext ? d.archivo_ext.toLowerCase() === 'pdf' : /\.pdf($|[?#])/i.test(d.url ?? '')

function Reglamento() {
  const { data } = useData()
  const docs = data.reglamento ?? []
  const [elegidoId, setElegidoId] = useState(null)
  const doc = docs.find(d => d.id === elegidoId) ?? docs.find(d => d.principal) ?? docs[0]

  return (
    <section className="section" style={{ paddingTop: 30 }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Reglamento estudiantil</div>
            <h2 style={{ marginTop: 10 }}>{doc ? [doc.titulo, doc.referencia].filter(Boolean).join(' · ') : 'Reglamento estudiantil'}.</h2>
          </div>
          <p className="desc">Consulta el documento completo aquí mismo o descárgalo para leerlo sin conexión.</p>
        </div>

        {docs.length === 0 ? (
          <div className="doc-vacio">El reglamento se publicará aquí próximamente.</div>
        ) : (
          <div className="reg-visor">
            <div className="reg-visor__marco">
              {doc?.enlace && esPdf(doc) ? (
                <iframe key={doc.id} className="reg-visor__pdf" src={doc.enlace + '#view=FitH'}
                        title={'Documento: ' + doc.titulo} />
              ) : (
                <div className="reg-visor__vacio">
                  <Icons.archivo />
                  <p>{doc?.enlace
                    ? 'Este documento no se puede mostrar aquí. Ábrelo o descárgalo desde la barra lateral.'
                    : 'El PDF de este documento todavía no está cargado.'}</p>
                </div>
              )}
            </div>

            <aside className="reg-barra" aria-label="Documentos del reglamento">
              <div className="reg-barra__titulo">
                Documentos <span>{docs.length}</span>
              </div>
              <ul className="reg-barra__lista">
                {docs.map(d => (
                  <li key={d.id}>
                    <button type="button" className={'reg-doc' + (d.id === doc?.id ? ' is-activo' : '')}
                            aria-current={d.id === doc?.id} onClick={() => setElegidoId(d.id)}>
                      <span className="reg-doc__icono" aria-hidden="true">{(d.archivo_ext || (d.url ? 'web' : '—')).toUpperCase()}</span>
                      <span className="reg-doc__textos">
                        <span className="reg-doc__t">{d.titulo}</span>
                        <span className="reg-doc__s">
                          {[d.referencia, d.expedido_por, pesoLegible(d.archivo_bytes)].filter(Boolean).join(' · ') || 'Sin datos de referencia'}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              {doc && (
                <div className="reg-barra__ficha">
                  {doc.descripcion && <p>{doc.descripcion}</p>}
                  {doc.descarga ? (
                    <>
                      <a className="btn accent reg-barra__btn" href={doc.descarga} download>
                        <Icons.download /> Descargar
                      </a>
                      <a className="btn ghost reg-barra__btn" href={doc.enlace} target="_blank" rel="noopener noreferrer">
                        <Icons.external /> Abrir en otra pestaña
                      </a>
                    </>
                  ) : (
                    <p className="reg-barra__pendiente">Documento pendiente de carga.</p>
                  )}
                </div>
              )}
            </aside>
          </div>
        )}
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

/* Las cuatro secciones. Cada una lleva su propio icono y una línea que dice
   qué hay dentro: cuatro chips con solo el nombre no distinguían "Reglamento"
   de "Documentos" hasta entrar en cada uno. */
const SECCIONES = [
  { id: 'calendario', l: 'Calendario',     sub: 'Fechas del periodo',    icono: 'reloj',    tono: 'var(--ug-azul)',     tinte: 'var(--doc-azul-tint)' },
  { id: 'honor',      l: 'Cuadro de Honor', sub: 'Excelencia académica', icono: 'sparkle',  tono: 'var(--ug-amarillo)', tinte: 'var(--doc-ambar-tint)' },
  { id: 'reglamento', l: 'Reglamento',     sub: 'Normas y deberes',      icono: 'archivo',  tono: 'var(--ug-marino)',   tinte: 'var(--doc-neutro-tint)' },
  { id: 'docs',       l: 'Documentos',     sub: 'Formatos y guías',      icono: 'download', tono: 'var(--ug-flamingo)', tinte: 'var(--doc-terracota-tint)' },
]

export default function Estudiantes() {
  /* En la URL: recargar deja de mandar al calendario, y se puede enlazar
     directo a una sección (#/estudiantes?seccion=honor). */
  const [tab, setTab] = usePestana(SECCIONES.map(s => s.id), { clave: 'seccion' })

  return (
    <div className="page-in pagina-con-margen" style={{ padding: 'clamp(28px,4vw,44px) var(--gutter) 0' }}>
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>

        <nav className="miga" aria-label="Ruta de navegación">
          <span>Comunidad</span>
          <span aria-hidden="true">/</span>
          <span className="miga__actual">Estudiantes</span>
        </nav>

        <header className="hero-card">
          <div className="hero-card__patron" aria-hidden="true" />
          <div className="hero-card__contenido">
            <p className="hero-card__insignia">
              <span className="hero-card__punto" aria-hidden="true" />
              Comunidad · Estudiantes
            </p>

            <h1 className="hero-card__titulo">
              Todo lo que necesitas, <span>en un solo lugar.</span>
            </h1>

            <p className="hero-card__texto">
              Calendario, fechas clave, cuadro de honor, reglamento y documentos — organizado para
              que no pierdas tiempo buscando.
            </p>

            {/* Las modalidades de grado se fueron a Egresados. Este aviso evita
                que quien venga buscándolas aquí crea que desaparecieron. */}
            <div className="est-aviso">
              <Icons.sparkle />
              <span>
                ¿Buscas las modalidades de grado? Están en{' '}
                <Link to="/egresados">Egresados</Link>, junto con la normativa del trámite, las
                convocatorias de prácticas y las ideas de investigación.
              </span>
            </div>

            <div className="est-nav">
              <div className="est-nav__label">Explorar secciones de estudiantes</div>
              <div className="est-nav__grid" role="tablist" aria-label="Secciones de estudiantes">
                {SECCIONES.map(s => {
                  const Icono = Icons[s.icono]
                  const activa = tab === s.id
                  return (
                    <button key={s.id} role="tab" aria-selected={activa}
                            className={'est-nav-card' + (activa ? ' is-activa' : '')}
                            style={{ '--tono': s.tono, '--tinte': s.tinte }}
                            onClick={() => setTab(s.id)}>
                      <span className="est-nav-card__icono"><Icono /></span>
                      <span className="est-nav-card__textos">
                        <span className="est-nav-card__titulo">{s.l}</span>
                        <span className="est-nav-card__sub">{s.sub}</span>
                      </span>
                      <span className="est-nav-card__marca" aria-hidden="true">
                        {activa ? null : <Icons.arrow />}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </header>
      </div>

      {tab === 'calendario' && <Calendario />}
      {tab === 'honor' && <Honor />}
      {tab === 'reglamento' && <Reglamento />}
      {tab === 'docs' && <Docs />}
    </div>
  )
}
