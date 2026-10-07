import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Icons } from '../../components/Icons'
import { WayuuBackdrop } from '../../components/WayuuPatterns'
import { ESCALA, STATUS_LABELS, STATUS_COLOR, statusFromScore, judgmentFromScore, globalPonderado, imagenFactor } from '../../data/acreditacion'
import { useData } from '../../context/DataContext'
import CircularProgress from './CircularProgress'
import MetodologiaSection from './MetodologiaSection'
import EquipoSection from './EquipoSection'
import EvidenciasSection from './EvidenciasSection'
import FactorPage from './FactorPage'

/* Dónde estaba el tablero cuando se abrió un factor, para devolver al
   visitante a la misma tarjeta y no al principio de la página. */
let scrollTablero = 0

/* Informe de autoevaluación con fines de acreditación: solo descarga. */
const INFORME_PDF = {
  url: '/descargas/informe-autoevaluacion-2025.pdf',
  nombre: 'INFORME DE AUTOEVALUACIÓN CON FINES DE ACREDITACIÓN ING DE SISTEMAS.pdf',
}

function InformeCuerpo({ informe, accion }) {
  return (
    <>
      <span className="cna-informe__icono" aria-hidden="true"><Icons.archivo /></span>
      <span className="cna-informe__textos">
        <span className="cna-informe__sobre">Documento oficial</span>
        <span className="cna-informe__titulo">Informe de autoevaluación</span>
        {informe?.d && <span className="cna-informe__desc">{informe.d}</span>}
      </span>
      <span className="cna-informe__accion"><Icons.download /> {accion}</span>
    </>
  )
}

export default function Acreditacion() {
  const { data } = useData()
  /* El factor abierto vive en la URL (?factor=4), no en memoria: así el botón
     de atrás del navegador vuelve al tablero en vez de sacar al visitante de
     Acreditación, y la dirección de un factor se puede compartir. */
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const crudo = Number(params.get('factor'))
  const factorN = Number.isInteger(crudo) && crudo > 0 ? crudo : null

  const conFactor = n => previos => {
    const p = new URLSearchParams(previos)
    if (n === null) p.delete('factor'); else p.set('factor', n)
    return p
  }
  /* Abrir desde el tablero apila una entrada: atrás regresa al tablero. */
  const abrir = n => {
    scrollTablero = window.scrollY
    setParams(conFactor(n), { state: { desdeTablero: true } })
  }
  /* Pasar al factor anterior o siguiente reemplaza la entrada, para que atrás
     siga llevando al tablero de un solo paso. */
  const irA = n => setParams(conFactor(n), { replace: true, state: location.state })
  /* Si se llegó desde el tablero, volver es deshacer ese paso; si se entró
     directo por un enlace, no hay a dónde retroceder y se limpia la URL. */
  const volver = () => {
    if (location.state?.desdeTablero) navigate(-1)
    else setParams(conFactor(null), { replace: true })
  }

  useEffect(() => {
    window.scrollTo(0, factorN === null ? scrollTablero : 0)
  }, [factorN])

  const [filter, setFilter] = useState('all')

  const factores = (data.factores ?? []).map(f => ({
    ...f,
    status: statusFromScore(f.score),
    color: STATUS_COLOR[statusFromScore(f.score)],
  }))

  const cronograma = data.cronograma_cna ?? []
  /* El informe vigente es la última evidencia general que se llame así; su
     archivo se carga en el panel, en «Evidencias generales». */
  const hallado = [...(data.evidencias_cna ?? [])].reverse()
    .find(e => /informe de autoevaluaci[oó]n/i.test(e.t ?? ''))
  /* Si la evidencia aún no tiene archivo (o la API no respondió), se usa el
     PDF publicado en public/descargas/. */
  const informe = { ...hallado, url: hallado?.url || INFORME_PDF.url }

  if (factorN !== null) {
    const f = factores.find(x => x.n === factorN)
    if (f) return (
      <FactorPage
        factor={f}
        allFactores={factores}
        onBack={volver}
        onNavigate={irA}
      />
    )
  }

  /* El juicio global es la media PONDERADA por el peso de cada factor
     (Resolución 007 de 2022). Con media simple salía 93,46 y el informe
     dice 93,26. */
  const prom = globalPonderado(factores)
  const stats = factores.reduce((a, f) => { a[f.status] = (a[f.status] || 0) + 1; return a }, {})
  /* Solo los grados que de verdad aparecen: anunciar "No se cumple: 0" no
     informa de nada y mete ruido. */
  const grados = ESCALA.filter(e => stats[e.k])

  return (
    <div className="page-in">
      {/* Hero */}
      <section className="cna-hero">
        <WayuuBackdrop variant="a" />
        <div className="cna-hero-inner" style={{ position: 'relative', zIndex: 2 }}>
          <div>
            <div className="hero-eyebrow-row">
              <span className="chip" style={{ background: 'var(--ug-flamingo)', color: 'var(--paper)', borderColor: 'transparent' }}>● Autoevaluación 2026</span>
              <span className="chip">Acuerdo 02 de 2020 CESU</span>
              <span className="chip">CNA · Consejo Nacional de Acreditación</span>
            </div>
            <h1 style={{ marginTop: 24 }}>Acreditación<br />de alta calidad<br /><em style={{ color: 'var(--accent-deep)', fontStyle: 'normal' }}>en 12 factores.</em></h1>
            <p className="lede" style={{ marginTop: 24 }}>
              Tablero de autoevaluación del programa frente a los doce factores del Acuerdo 02 de 2020. Cada tarjeta abre una página dedicada con características, evidencias, fortalezas y equipo responsable.
            </p>
            {/* El informe es el documento del que sale todo el tablero: va en
                una franja propia, no en un botón que se pierde bajo el texto.
                Solo es enlace cuando hay archivo cargado. */}
            {informe?.url ? (
              <a className="cna-informe" href={informe.url} download={INFORME_PDF.nombre}>
                <InformeCuerpo informe={informe} accion="Descargar" />
              </a>
            ) : (
              <div className="cna-informe is-pendiente">
                <InformeCuerpo informe={informe} accion="Disponible próximamente" />
              </div>
            )}
          </div>
          {/* Tarjeta de la calificación consolidada: el anillo con el promedio
              ponderado y, debajo, cuántos factores caen en cada grado. */}
          <aside className="cna-resumen" aria-label="Calificación consolidada del programa">
            <div className="cna-resumen__cab">
              <span className="cna-resumen__titulo"><i aria-hidden="true" /> Calificación consolidada</span>
              <span className="cna-resumen__chip">{factores.length} factores evaluados</span>
            </div>

            <div className="cna-resumen__anillo">
              <CircularProgress value={prom} size={210} texto={prom.toFixed(1).replace('.', ',')} />
              <span className="cna-resumen__juicio"><span aria-hidden="true">★</span> {judgmentFromScore(prom)}</span>
            </div>

            <div className="cna-resumen__niveles">
              {grados.map(e => (
                <div key={e.k} className="cna-nivel" style={{ '--tono': e.color }}>
                  <div className="cna-nivel__cab">
                    <span className="cna-nivel__letra">Nivel {e.letra}</span>
                    <span className="cna-nivel__rango">{e.desde}–{e.hasta}</span>
                  </div>
                  <div className="cna-nivel__n"><b>{stats[e.k]}</b> {stats[e.k] === 1 ? 'factor' : 'factores'}</div>
                  <div className="cna-nivel__barra"><i style={{ width: (stats[e.k] / factores.length) * 100 + '%' }} /></div>
                  <div className="cna-nivel__juicio">{e.label}</div>
                </div>
              ))}
            </div>

            <div className="cna-resumen__pie">
              <span><span aria-hidden="true">✓</span> {stats.pleno ?? 0} de {factores.length} factores en cumplimiento pleno</span>
              <button type="button" onClick={() => document.getElementById('tablero-factores')?.scrollIntoView({ behavior: 'smooth' })}>
                Ver detalle <span aria-hidden="true">→</span>
              </button>
            </div>
          </aside>
        </div>
      </section>

      {/* Tablero de factores */}
      <section className="section" id="tablero-factores" style={{ paddingTop: 60, scrollMarginTop: 90 }}>
        <div className="inner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 20, marginBottom: 32, flexWrap: 'wrap' }}>
            <div>
              <div className="eyebrow">Los doce factores · Acuerdo 02 de 2020</div>
              <h2 style={{ marginTop: 10 }}>Abre un factor para ver el detalle completo.</h2>
            </div>
            <div className="filtros-barra__chips">
              {[{ k: 'all', l: 'Todos' }, ...grados.map(e => ({ k: e.k, l: e.label }))].map(f => (
                <button key={f.k} className="chip" onClick={() => setFilter(f.k)}
                  style={{ cursor: 'pointer', background: filter === f.k ? 'var(--ink)' : undefined, color: filter === f.k ? 'var(--paper)' : undefined, borderColor: filter === f.k ? 'var(--ink)' : undefined }}>{f.l}</button>
              ))}
            </div>
          </div>
          <div className="factor-grid">
            {factores.map(f => (
              <button key={f.n} className="factor-card" data-status={f.status}
                style={{ opacity: filter !== 'all' && f.status !== filter ? 0.28 : 1 }}
                onClick={() => abrir(f.n)}>
                <img className="factor-card__img" src={imagenFactor(f.n, 'sm')} alt="" loading="lazy" decoding="async" />
                <div className="factor-card__cab">
                  <div className="n">Factor {String(f.n).padStart(2,'0')}{f.ponderacion ? ' · ' + f.ponderacion.toFixed(2).replace('.', ',') + ' %' : ''}</div>
                  <div className="factor-pill">{STATUS_LABELS[f.status]}</div>
                </div>
                <div className="title">{f.t}</div>
                <div className="score"><span>Calificación</span><b>{f.score.toFixed(1)}</b></div>
                <div className="meter"><i style={{ width: `${f.score}%` }} /></div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <MetodologiaSection />
      <EquipoSection />
      <EvidenciasSection />

      {/* Cronograma */}
      <section className="section section--papel">
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Ruta de acreditación</div>
              <h2>Cronograma del proceso.</h2>
            </div>
          </div>
          <div>
            {cronograma.map((step, i) => (
              <div key={i} className="cna-crono__paso">
                <div className="cna-crono__marca" style={{ background: step.s === 'done' ? 'var(--ug-azul)' : step.s === 'current' ? 'var(--ug-amarillo)' : 'var(--paper)', border: '2px solid ' + (step.s === 'next' ? 'color-mix(in oklab, var(--ink) 20%, transparent)' : 'transparent') }}>
                  {step.s === 'done' ? '✓' : step.s === 'current' ? '●' : i + 1}
                </div>
                <div className="cna-crono__fecha">{step.d}</div>
                <div className="cna-crono__titulo" style={{ fontWeight: step.s === 'current' ? 600 : 500 }}>{step.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
