/* Plan de mejoramiento del programa.

   Misma cabecera que el resto del sitio (migas y hero-card con la franja
   tejida). Debajo va una tarjeta por acción con lo básico: factor,
   oportunidad, estado, avance y plazo. Cada tarjeta lleva a la ficha
   completa de la acción (PlanAccion.jsx). Los datos están en
   data/planMejoramiento.js, transcritos del formato oficial. */
import { Link } from 'react-router-dom'
import { Icons } from '../../components/Icons'
import { PLAN_META, ACCIONES, ESTADOS, avancePonderado, pesoDeclarado } from '../../data/planMejoramiento'

const fmt = n => n.toFixed(1).replace('.', ',')

export default function PlanMejoramiento() {
  const avance = avancePonderado()
  const enEjecucion = ACCIONES.filter(a => a.estado === 'ejecucion').length

  return (
    <div className="page-in pagina-con-margen" style={{ padding: 'clamp(28px,4vw,44px) var(--gutter) 0' }}>
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>

        <nav className="miga" aria-label="Ruta de navegación">
          <Link to="/acreditacion">Acreditación</Link>
          <span aria-hidden="true">/</span>
          <span className="miga__actual">Plan de mejoramiento</span>
        </nav>

        <header className="hero-card">
          <div className="hero-card__patron" aria-hidden="true" />
          <div className="hero-card__contenido">
            <p className="hero-card__insignia">
              <span className="hero-card__punto" aria-hidden="true" />
              Acreditación · {PLAN_META.titulo}
            </p>
            <h1 className="hero-card__titulo">Plan de mejoramiento</h1>
            <p className="hero-card__texto">
              Las acciones con las que el programa responde a los resultados de su autoevaluación.
              Cada tarjeta corresponde a una oportunidad de mejora; ábrela para ver la acción
              completa, sus metas, responsables y los datos que la justifican.
            </p>
            <dl className="hero-card__cifras">
              <div className="hero-card__cifra hero-card__cifra--acento"><dt>{ACCIONES.length} acciones</dt><dd>en {ACCIONES.length} factores</dd></div>
              <div className="hero-card__cifra"><dt>{enEjecucion} en ejecución</dt><dd>{ACCIONES.length - enEjecucion} en planeación</dd></div>
              <div className="hero-card__cifra hero-card__cifra--ambar"><dt>{fmt(avance)} %</dt><dd>avance ponderado</dd></div>
            </dl>
            <a className="pm-formato" href={PLAN_META.formato.url} download={PLAN_META.formato.nombre}>
              <Icons.download /> {PLAN_META.formato.t}
            </a>
          </div>
        </header>

        {/* Resumen en tabla: las cuatro columnas que se consultan de un vistazo.
            La actividad enlaza a la ficha, igual que la tarjeta. */}
        <section className="pm-bloque pm-resumen" aria-labelledby="pm-resumen">
          <h2 id="pm-resumen" className="pm-bloque__titulo">Resumen del plan</h2>
          <div className="pm-tabla__marco">
            <table className="pm-tabla">
              <thead>
                <tr>
                  <th scope="col">Actividad</th>
                  <th scope="col">Indicador de cumplimiento</th>
                  <th scope="col">Responsables</th>
                  <th scope="col" className="pm-tabla__num">Cumplimiento</th>
                </tr>
              </thead>
              <tbody>
                {ACCIONES.map(a => (
                  <tr key={a.slug} data-estado={a.estado}>
                    <td>
                      <span className="pm-tabla__factor">Factor {a.factor}</span>
                      <Link to={`/acreditacion/plan-de-mejoramiento/${a.slug}`} className="pm-tabla__accion">{a.accion}</Link>
                    </td>
                    <td>{a.indicador}</td>
                    <td>{a.responsables}</td>
                    <td className="pm-tabla__num">
                      <b>{a.cumplimiento} %</b>
                      <div className="pm-avance__barra"><i style={{ width: a.cumplimiento + '%' }} /></div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row" colSpan={3}>Avance ponderado del plan</th>
                  <td className="pm-tabla__num"><b>{fmt(avance)} %</b></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <div className="pm-grid">
          {ACCIONES.map(a => (
            <Link key={a.slug} className="pm-card" to={`/acreditacion/plan-de-mejoramiento/${a.slug}`} data-estado={a.estado}>
              <div className="pm-card__cab">
                <span className="pm-card__factor">Factor {String(a.factor).padStart(2, '0')}</span>
                <span className="pm-estado" data-tono={ESTADOS[a.estado].tono}>{ESTADOS[a.estado].label}</span>
              </div>
              <div className="pm-card__tema">{a.factorNombre}</div>
              <h2 className="pm-card__titulo">{a.oportunidad}</h2>
              <dl className="pm-card__datos">
                <div><dt>Indicador</dt><dd>{a.indicador}</dd></div>
                <div><dt>Plazo</dt><dd>{a.inicio} → {a.fin}</dd></div>
              </dl>
              <div className="pm-card__pie">
                <div className="pm-avance">
                  <div className="pm-avance__txt"><span>Cumplimiento</span><b>{a.cumplimiento} %</b></div>
                  <div className="pm-avance__barra"><i style={{ width: a.cumplimiento + '%' }} /></div>
                </div>
                <span className="pm-card__peso">Peso {a.peso} %</span>
              </div>
              <span className="pm-card__ver">Ver la acción completa <Icons.arrow /></span>
            </Link>
          ))}
        </div>


        <p className="pm-nota">
          El avance ponderado usa el peso que el formato asigna a cada acción. Los pesos declarados
          suman {pesoDeclarado()} %, así que el promedio se calcula sobre ese total.
          Fuente: formato oficial del {PLAN_META.titulo.replace(/^P/, 'p')} · {PLAN_META.registro}.
        </p>

        <div style={{ height: 60 }} />
      </div>
    </div>
  )
}
