/* Marco legal del programa: registro calificado, acreditación y los actos
   administrativos que los rodean.

   Misma cabecera que /pensum y /pensum-propuesto —migas y hero-card con la
   franja tejida— y la .doc-lista que Egresados usa para su normativa: un acto
   administrativo se lee en un renglón y son varios.

   Las dos resoluciones que enmarcan el programa no van en esa lista. Van en
   tarjeta con banda de color porque no son dos filas más: son la razón de ser
   de la página.

   El contenido es el mismo de siempre y sigue escrito aquí: esta página no
   está en la base. */
import { Icons } from '../../components/Icons'
import { WayuuBackdrop } from '../../components/WayuuPatterns'

const DOCS = [
  {
    eyebrow: 'Registro calificado',
    t: 'Resolución N.º 02872',
    d: '21 de febrero de 2018',
    vig: '7 años',
    body: 'Otorgamiento del registro calificado al programa de Ingeniería de Sistemas de la Universidad de La Guajira por parte del Ministerio de Educación Nacional (MEN).',
    color: 'var(--ug-azul)',
    autoridad: 'Ministerio de Educación Nacional',
  },
  {
    eyebrow: 'Acreditación de alta calidad',
    t: 'Resolución N.º 014528',
    d: '28 de julio de 2022',
    vig: '6 años',
    body: 'Otorgamiento de la acreditación de alta calidad por el CNA. Reconocimiento a la calidad académica, investigativa y de extensión del programa.',
    color: 'var(--ug-amarillo)',
    autoridad: 'Consejo Nacional de Acreditación (CNA)',
  },
]

const OTROS = [
  { t: 'Acuerdo Consejo Académico 045/2024', a: 'Aprobación reforma curricular Ingeniería de Sistemas', f: 'Ago 2024' },
  { t: 'Resolución Rectoral 0238/2024',      a: 'Adopción del PEP actualizado',                          f: 'Oct 2024' },
  { t: 'Acuerdo Consejo Superior 018/2021',  a: 'Reglamento estudiantil vigente',                        f: 'Jun 2021' },
  { t: 'Resolución Rectoral 0412/2023',      a: 'Designación del director del programa',                 f: 'Nov 2023' },
  { t: 'Acuerdo Consejo Académico 012/2023', a: 'Política de opciones de grado',                         f: 'Mar 2023' },
  { t: 'Resolución MEN 014528/2022',         a: 'Acreditación de alta calidad',                          f: 'Jul 2022' },
  { t: 'Resolución MEN 02872/2018',          a: 'Registro calificado del programa',                      f: 'Feb 2018' },
]

export default function Resoluciones() {
  return (
    <div className="page-in" style={{ padding: 'clamp(28px,4vw,44px) var(--gutter) 0' }}>
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>

        <nav className="miga" aria-label="Ruta de navegación">
          <span>Programa</span>
          <span aria-hidden="true">/</span>
          <span className="miga__actual">Resoluciones</span>
        </nav>

        <header className="hero-card">
          <div className="hero-card__patron" aria-hidden="true" />
          <div className="hero-card__contenido">
            <h1 className="hero-card__titulo">
              Marco legal <span>del programa.</span>
            </h1>

            {/* Los tres rótulos de siempre, ahora como pastillas del sistema
                en vez de chips sueltos. */}
            <div className="doc-card__etiquetas" style={{ marginTop: 20 }}>
              <span className="doc-pin doc-pin--azul">SNIES 17579</span>
              <span className="doc-pin doc-pin--azul">Registro vigente</span>
              <span className="doc-pin doc-pin--ambar">Acreditado en alta calidad</span>
            </div>
          </div>
        </header>

        {/* ── Los dos actos principales ── */}
        <section className="doc-seccion">
          <div className="resolucion-grid">
            {DOCS.map(d => (
              <article key={d.t} className="resolucion">
                <div className="resolucion__banda" style={{ background: d.color }}>
                  <WayuuBackdrop variant="a" />
                  <div className="resolucion__tipo">{d.eyebrow}</div>
                  <div className="resolucion__numero">{d.t}</div>
                </div>

                <div className="resolucion__cuerpo">
                  {/* Fecha, vigencia y autoridad eran tres renglones mono
                      seguidos; como lista de definición se ve de un vistazo
                      qué es cada dato. */}
                  <dl className="resolucion__datos">
                    <div>
                      <dt>Fecha</dt>
                      <dd>{d.d}</dd>
                    </div>
                    <div>
                      <dt>Vigencia</dt>
                      <dd>{d.vig}</dd>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <dt>Autoridad</dt>
                      <dd>{d.autoridad}</dd>
                    </div>
                  </dl>

                  <p className="resolucion__texto">{d.body}</p>

                  <div className="resolucion__acciones">
                    <button className="doc-boton doc-boton--fuerte">
                      <Icons.download /> Descargar PDF
                    </button>
                    <button className="doc-boton">
                      <Icons.external /> Ver en SACES
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── Otros actos administrativos ── */}
        <section className="doc-seccion">
          <h2 className="doc-seccion__titulo">Otros actos administrativos</h2>
          <p className="doc-seccion__desc">Resoluciones rectorales y del consejo académico.</p>

          <div className="doc-lista">
            {OTROS.map(o => (
              <div key={o.t} className="doc-norma">
                <span className="resolucion__sello" aria-hidden="true">PDF</span>

                <div className="doc-norma__cuerpo">
                  <div className="doc-norma__titulo">{o.t}</div>
                  <p className="doc-norma__desc">{o.a}</p>
                </div>

                <span className="doc-card__dato">{o.f}</span>

                <button className="doc-boton" aria-label={'Descargar ' + o.t}>
                  <Icons.download />
                </button>
              </div>
            ))}
          </div>
        </section>

        <div style={{ height: 70 }} />
      </div>
    </div>
  )
}
