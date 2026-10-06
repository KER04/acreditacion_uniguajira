/* Ficha completa de una acción del plan de mejoramiento.

   Arriba va lo que dice el formato oficial: oportunidad, acción, metas,
   responsables y verificación. Debajo, separado y con su fuente, el
   contexto que trae la presentación del factor: por qué existe la acción.
   Así no se mezcla lo que el programa se compromete a hacer con los datos
   que lo justifican. */
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Icons } from '../../components/Icons'
import { ACCIONES, ESTADOS, PLAN_META } from '../../data/planMejoramiento'

const PLAZOS = [
  { k: 'corto', l: 'Corto plazo' },
  { k: 'mediano', l: 'Mediano plazo' },
  { k: 'largo', l: 'Largo plazo' },
]

/* Barras simples para una serie anual. Las alturas parten de un piso
   (el mínimo menos un margen) para que las diferencias se vean; por eso cada
   barra lleva su valor escrito y no hay que leerlo de un eje. */
function Serie({ serie }) {
  const vals = serie.datos.map(d => d.v)
  const max = Math.max(...vals)
  const piso = Math.max(0, Math.min(...vals) - (max - Math.min(...vals)) * 0.6 - 1)
  const ultimo = serie.datos.length - 1
  return (
    <figure className="pm-serie">
      <figcaption className="pm-serie__titulo">{serie.titulo}</figcaption>
      <div className="pm-serie__barras" role="list">
        {serie.datos.map((d, i) => (
          <div key={d.a} className="pm-serie__col" role="listitem" aria-label={`${d.a}: ${d.v}`}>
            <span className="pm-serie__v">{d.v}</span>
            <span className={'pm-serie__barra' + (i === ultimo ? ' is-ultimo' : '')}
              style={{ height: ((d.v - piso) / (max - piso)) * 100 + '%' }} />
            <span className="pm-serie__a">{d.a}</span>
          </div>
        ))}
      </div>
      {serie.nota && <p className="pm-serie__nota">{serie.nota}</p>}
    </figure>
  )
}

export default function PlanAccion() {
  const { slug } = useParams()
  const i = ACCIONES.findIndex(a => a.slug === slug)
  const a = ACCIONES[i]

  useEffect(() => { window.scrollTo(0, 0) }, [slug])

  if (!a) {
    return (
      <div className="page-in pagina-con-margen" style={{ padding: 'clamp(28px,4vw,44px) var(--gutter) 60px' }}>
        <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>
          <div className="doc-vacio">
            Esta acción no existe en el plan. <Link to="/acreditacion/plan-de-mejoramiento">Volver al plan de mejoramiento</Link>
          </div>
        </div>
      </div>
    )
  }

  const anterior = ACCIONES[i - 1]
  const siguiente = ACCIONES[i + 1]
  const est = ESTADOS[a.estado]
  const c = a.contexto

  return (
    <div className="page-in pagina-con-margen" style={{ padding: 'clamp(28px,4vw,44px) var(--gutter) 0' }}>
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>

        <nav className="miga" aria-label="Ruta de navegación">
          <Link to="/acreditacion">Acreditación</Link>
          <span aria-hidden="true">/</span>
          <Link to="/acreditacion/plan-de-mejoramiento">Plan de mejoramiento</Link>
          <span aria-hidden="true">/</span>
          <span className="miga__actual">Factor {a.factor}</span>
        </nav>

        <header className="hero-card">
          <div className="hero-card__patron" aria-hidden="true" />
          <div className="hero-card__contenido">
            <p className={'hero-card__insignia' + (a.estado === 'planeacion' ? ' hero-card__insignia--aviso' : '')}>
              <span className="hero-card__punto" aria-hidden="true" />
              Factor {a.factor} · {a.factorNombre}
            </p>
            <h1 className="hero-card__titulo pm-ficha__titulo">{a.oportunidad}</h1>
            <p className="hero-card__texto">{a.accion}</p>
            <dl className="hero-card__cifras">
              <div className="hero-card__cifra hero-card__cifra--acento"><dt>{a.cumplimiento} %</dt><dd>de cumplimiento</dd></div>
              <div className="hero-card__cifra"><dt>{est.label}</dt><dd>estado</dd></div>
              <div className="hero-card__cifra hero-card__cifra--ambar"><dt>{a.peso} %</dt><dd>peso en el plan</dd></div>
            </dl>
            <div className="pm-avance pm-avance--grande" aria-hidden="true">
              <div className="pm-avance__barra"><i style={{ width: a.cumplimiento + '%' }} /></div>
            </div>
            <Link className="hero-card__cta" to="/acreditacion/plan-de-mejoramiento">
              <span aria-hidden="true">←</span> Todas las acciones del plan
            </Link>
          </div>
        </header>

        {/* ── Lo que dice el formato ── */}
        <section className="pm-bloque" aria-labelledby="pm-metas">
          <h2 id="pm-metas" className="pm-bloque__titulo">Metas</h2>
          <p className="pm-bloque__sub"><b>Indicador:</b> {a.indicador}</p>
          <ol className="pm-metas">
            {PLAZOS.map((p, n) => (
              <li key={p.k} className="pm-meta">
                <span className="pm-meta__n">{n + 1}</span>
                <span className="pm-meta__plazo">{p.l}</span>
                <span className="pm-meta__txt">{a.metas[p.k]}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="pm-dos">
          <section className="pm-bloque" aria-labelledby="pm-como">
            <h2 id="pm-como" className="pm-bloque__titulo">Cómo se hará</h2>
            <p className="pm-parrafo">{a.descripcion}</p>
            <dl className="pm-lista">
              <div><dt>Recursos</dt><dd>{a.recursos}</dd></div>
              <div><dt>Vinculación con el plan de acción institucional</dt><dd>{a.vinculacion}</dd></div>
            </dl>
          </section>

          <section className="pm-bloque" aria-labelledby="pm-quien">
            <h2 id="pm-quien" className="pm-bloque__titulo">Responsables y seguimiento</h2>
            <dl className="pm-lista">
              <div><dt>Inicio programado</dt><dd>{a.inicio}</dd></div>
              <div><dt>Fin programado</dt><dd>{a.fin}</dd></div>
              <div><dt>Responsables</dt><dd>{a.responsables}</dd></div>
              <div><dt>Involucrados</dt><dd>{a.involucrados}</dd></div>
              <div><dt>Medios de verificación</dt><dd>{a.verificacion}</dd></div>
            </dl>
          </section>
        </div>

        {/* ── Por qué existe la acción: datos de la presentación del factor ── */}
        {c && (
          <section className="pm-bloque pm-contexto" aria-labelledby="pm-contexto">
            <div className="pm-contexto__cab">
              <div>
                <p className="pm-contexto__eyebrow">Contexto · datos de la autoevaluación</p>
                <h2 id="pm-contexto" className="pm-bloque__titulo">Por qué esta acción</h2>
              </div>
              <a className="pm-fuente" href={c.fuente.url} download>
                <Icons.archivo /> <span>{c.fuente.t}</span> <Icons.download />
              </a>
            </div>
            <p className="pm-parrafo">{c.intro}</p>

            {c.riesgos && (
              <div className="pm-riesgos">
                <span className="pm-riesgos__l">Riesgos que detecta el SIAT</span>
                {c.riesgos.map(r => <span key={r} className="pm-riesgo">{r}</span>)}
              </div>
            )}

            <div className={'pm-contexto__cuerpo' + (c.serie ? ' con-serie' : '')}>
              {c.serie && <Serie serie={c.serie} />}
              <div className="pm-cifras">
                {c.cifras.map(x => (
                  <div key={x.l} className="pm-cifra">
                    <b>{x.v}</b>
                    <span>{x.l}</span>
                  </div>
                ))}
              </div>
            </div>

            {c.puntos?.length > 0 && (
              <ul className="pm-puntos">
                {c.puntos.map(p => <li key={p}>{p}</li>)}
              </ul>
            )}

            {c.enlace && (
              <Link className="pm-enlace" to={c.enlace.to}>{c.enlace.t} <Icons.arrow /></Link>
            )}
          </section>
        )}

        <nav className="pm-nav" aria-label="Otras acciones del plan">
          {anterior ? (
            <Link to={`/acreditacion/plan-de-mejoramiento/${anterior.slug}`} className="pm-nav__item">
              <span className="pm-nav__dir">← Anterior · Factor {anterior.factor}</span>
              <span className="pm-nav__t">{anterior.oportunidad}</span>
            </Link>
          ) : <span />}
          {siguiente ? (
            <Link to={`/acreditacion/plan-de-mejoramiento/${siguiente.slug}`} className="pm-nav__item pm-nav__item--sig">
              <span className="pm-nav__dir">Siguiente · Factor {siguiente.factor} →</span>
              <span className="pm-nav__t">{siguiente.oportunidad}</span>
            </Link>
          ) : <span />}
        </nav>

        <p className="pm-nota">
          Datos de la acción: formato oficial del {PLAN_META.titulo.replace(/^P/, 'p')}.{' '}
          <a href={PLAN_META.formato.url} download={PLAN_META.formato.nombre}>Descargar el Excel</a>.
        </p>

        <div style={{ height: 60 }} />
      </div>
    </div>
  )
}
