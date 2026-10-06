/* Plan de mejoramiento del programa.

   Misma cabecera que el resto del sitio —migas y hero-card con la franja
   tejida—. La página existe para que el menú tenga a dónde llevar; el
   contenido del plan todavía no está cargado y se dice así, en vez de
   rellenarla con texto de muestra. */
import { Link } from 'react-router-dom'

export default function PlanMejoramiento() {
  return (
    <div className="page-in" style={{ padding: 'clamp(28px,4vw,44px) var(--gutter) 0' }}>
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
              Acreditación · Autoevaluación del programa
            </p>
            <h1 className="hero-card__titulo">Plan de mejoramiento</h1>
            <p className="hero-card__texto">
              Las acciones con las que el programa responde a los resultados de su autoevaluación.
            </p>
            <Link className="hero-card__cta" to="/acreditacion">
              <span aria-hidden="true">←</span> Ver los doce factores
            </Link>
          </div>
        </header>

        <div className="doc-vacio">El plan de mejoramiento se publicará aquí próximamente.</div>

        <div style={{ height: 60 }} />
      </div>
    </div>
  )
}
