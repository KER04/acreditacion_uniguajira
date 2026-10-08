/* Juicio global sobre la calidad del programa.

   Se abre desde la tarjeta grande del tablero de Acreditación. Arriba va la
   hero-card con la portada; debajo, la tabla 108 (peso y calificación de cada
   factor), la síntesis, el juicio de cada factor plegado en su propio bloque
   y los anexos que lo soportan. Los textos están en data/juicioGlobal.js; los
   pesos y calificaciones salen de data.factores, igual que en el tablero. */
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Icons } from '../../components/Icons'
import { STATUS_LABELS, statusFromScore, globalPonderado, imagenFactor } from '../../data/acreditacion'
import { JUICIO_META, JUICIOS, ANEXOS_JUICIO } from '../../data/juicioGlobal'
import { useData } from '../../context/DataContext'

const fmt = (n, d = 2) => Number(n).toFixed(d).replace('.', ',')

/* Al abrir un factor se cierra el anterior; si ese estaba encima, el texto
   que se pliega sube la página y el factor recién abierto queda fuera de la
   vista. Entonces se lleva su encabezado arriba. */
function alAbrir(e) {
  const el = e.currentTarget
  if (!el.open) return
  requestAnimationFrame(() => {
    if (el.getBoundingClientRect().top < 70) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

export default function JuicioGlobal() {
  const { data } = useData()
  useEffect(() => { window.scrollTo(0, 0) }, [])

  const factores = (data.factores ?? []).map(f => ({ ...f, status: statusFromScore(f.score) }))
  const porN = Object.fromEntries(factores.map(f => [f.n, f]))
  const global = factores.length ? globalPonderado(factores) : JUICIO_META.global
  const pesoTotal = factores.reduce((a, f) => a + (Number(f.ponderacion) || 0), 0)
  const plenos = factores.filter(f => f.status === 'pleno').length
  const min = factores.length ? Math.min(...factores.map(f => f.score)) : 0
  const max = factores.length ? Math.max(...factores.map(f => f.score)) : 0

  return (
    <div className="page-in pagina-con-margen" style={{ padding: 'clamp(28px,4vw,44px) var(--gutter) 0' }}>
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>

        <nav className="miga" aria-label="Ruta de navegación">
          <Link to="/acreditacion">Acreditación</Link>
          <span aria-hidden="true">/</span>
          <span className="miga__actual">Juicio global</span>
        </nav>

        <header className="hero-card">
          <img className="fac-hero__img jg-hero__img" src={JUICIO_META.imagen} alt="" decoding="async" />
          <div className="hero-card__contenido">
            <p className="hero-card__insignia">
              <span className="hero-card__punto" aria-hidden="true" />
              Acreditación · Informe de autoevaluación
            </p>
            <h1 className="hero-card__titulo">Juicio global sobre la <span>calidad del programa</span></h1>
            {JUICIO_META.intro.map((p, i) => (
              <p key={i} className="hero-card__texto" style={{ marginTop: i ? 12 : 0 }}>{p}</p>
            ))}
            <dl className="hero-card__cifras">
              <div className="hero-card__cifra hero-card__cifra--acento"><dt>{fmt(global)} / 100</dt><dd>{STATUS_LABELS[statusFromScore(global)]}</dd></div>
              <div className="hero-card__cifra"><dt>{factores.length} de {factores.length}</dt><dd>factores son fortaleza</dd></div>
              <div className="hero-card__cifra hero-card__cifra--ambar"><dt>{plenos} plenos · {factores.length - plenos} en alto grado</dt><dd>entre {fmt(min)} y {fmt(max)}</dd></div>
            </dl>
          </div>
        </header>

        {/* Tabla 108: la calificación global es la suma ponderada de esta tabla. */}
        <section className="pm-bloque" aria-labelledby="jg-tabla">
          <h2 id="jg-tabla" className="pm-bloque__titulo">Calificación global por factor</h2>
          <p className="pm-bloque__sub">
            Cada factor pesa lo que fija la Resolución 007 de 2022 del Consejo de Facultad de Ingeniería.
            La calificación global resulta de ponderar la calificación de cada factor por ese peso.
          </p>
          <div className="pm-tabla__marco">
            <table className="pm-tabla jg-tabla">
              <thead>
                <tr>
                  <th scope="col">Factor</th>
                  <th scope="col" className="pm-tabla__num">Peso</th>
                  <th scope="col" className="pm-tabla__num">Calificación</th>
                  <th scope="col">Juicio cualitativo</th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {factores.map(f => (
                  <tr key={f.n} data-status={f.status}>
                    <td>
                      <span className="pm-tabla__factor">Factor {String(f.n).padStart(2, '0')}</span>
                      <Link to={`/acreditacion?factor=${f.n}`} className="pm-tabla__accion">{f.t}</Link>
                    </td>
                    <td className="pm-tabla__num">{fmt(f.ponderacion)}</td>
                    <td className="pm-tabla__num">
                      <b>{fmt(f.score)}</b>
                      <div className="jg-barra"><i style={{ width: f.score + '%' }} /></div>
                    </td>
                    <td><span className="jg-pill" data-status={f.status}>{STATUS_LABELS[f.status]}</span></td>
                    <td>Fortaleza</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">Calificación global del programa</th>
                  <td className="pm-tabla__num"><b>{fmt(pesoTotal)}</b></td>
                  <td className="pm-tabla__num"><b>{fmt(global)}</b></td>
                  <td><span className="jg-pill" data-status={statusFromScore(global)}>{STATUS_LABELS[statusFromScore(global)]}</span></td>
                  <td>Fortaleza</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="pm-nota">Fuente: {JUICIO_META.fuente}</p>
        </section>

        <section className="pm-bloque jg-sintesis" aria-labelledby="jg-sintesis">
          <h2 id="jg-sintesis" className="pm-bloque__titulo">En síntesis</h2>
          <p className="pm-parrafo">{JUICIO_META.sintesis}</p>
        </section>

        {/* Un bloque plegable por factor: la página entera desplegada son doce
            páginas de texto; así se recorre por titulares y se abre lo que interesa. */}
        <section aria-labelledby="jg-factores" style={{ marginTop: 34 }}>
          <h2 id="jg-factores" className="pm-bloque__titulo">Juicio de calidad por factor</h2>
          <div className="jg-lista">
            {JUICIOS.map(j => {
              const f = porN[j.n]
              return (
                /* El mismo `name` en todos los <details> los vuelve acordeón:
                   el navegador cierra el abierto al desplegar otro. */
                <details key={j.n} name="jg-factor" className="jg-factor" data-status={f?.status} onToggle={alAbrir}>
                  <summary>
                    <img src={imagenFactor(j.n, 'sm')} alt="" loading="lazy" decoding="async" />
                    <span className="jg-factor__textos">
                      <span className="jg-factor__n">Factor {String(j.n).padStart(2, '0')}{f ? ' · peso ' + fmt(f.ponderacion) : ''}</span>
                      <span className="jg-factor__t">{f?.t ?? `Factor ${j.n}`}</span>
                    </span>
                    {f && (
                      <span className="jg-factor__nota">
                        <b>{fmt(f.score)}</b>
                        <span className="jg-pill" data-status={f.status}>{STATUS_LABELS[f.status]}</span>
                      </span>
                    )}
                    <span className="jg-factor__chevron" aria-hidden="true"><Icons.arrow /></span>
                  </summary>
                  <div className="jg-factor__cuerpo">
                    {j.cuerpo.map((p, i) => Array.isArray(p)
                      ? <ul key={i} className="jg-viñetas">{p.map((x, k) => <li key={k}>{x}</li>)}</ul>
                      : <p key={i} className="pm-parrafo">{p}</p>)}
                    <h3 className="jg-factor__sub">Fortalezas identificadas</h3>
                    <ul className="jg-fortalezas">
                      {j.fortalezas.map((x, k) => <li key={k}>{x}</li>)}
                    </ul>
                    <Link className="hero-card__cta" to={`/acreditacion?factor=${j.n}`}>
                      Abrir el factor {j.n} <Icons.arrow />
                    </Link>
                  </div>
                </details>
              )
            })}
          </div>
        </section>

        <section className="pm-bloque" aria-labelledby="jg-anexos" style={{ marginTop: 34 }}>
          <h2 id="jg-anexos" className="pm-bloque__titulo">Anexos</h2>
          <ul className="jg-anexos">
            {ANEXOS_JUICIO.map(a => (
              <li key={a.n}>
                <a href={a.url} download>
                  <span className="jg-anexos__n">Anexo {a.n}</span>
                  <span className="jg-anexos__t">{a.t}</span>
                  <span className="jg-anexos__tipo"><Icons.download /> {a.tipo}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <div style={{ height: 60 }} />
      </div>
    </div>
  )
}
