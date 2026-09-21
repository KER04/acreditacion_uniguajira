/* Dirección y contacto del programa.

   Misma cabecera que /pensum, /pensum-propuesto y /resoluciones: migas y
   hero-card con la franja tejida. Debajo, dos columnas —qué hace la dirección
   y cómo se la contacta— y las fichas del equipo.

   Las fichas conservan su banda de color con las iniciales: hace de retrato
   mientras no haya fotos cargadas y es lo que las distingue de una lista de
   correos. El contenido es el mismo de siempre y sigue escrito aquí. */
import { WayuuBackdrop } from '../../components/WayuuPatterns'
import { Icons } from '../../components/Icons'

const CONTACTO = [
  ['Correo', 'ingsistemas@uniguajira.edu.co'],
  ['Dirección', 'direccion.is@uniguajira.edu.co'],
  ['Teléfono', '+57 (605) 7282729'],
  ['Extensiones', '240, 241'],
  ['Sede', 'Bloque 1 — segundo piso'],
  ['Dirección física', 'Km 3+354 Vía Maicao'],
  ['Ciudad', 'Riohacha, La Guajira'],
  ['Código postal', '440003'],
]

const EQUIPO = [
  { n: 'Adanud S. Meza Valle',       r: 'Director del programa',           e: 'direccion.is@uniguajira.edu.co',       ext: '240', color: 'var(--ug-azul)' },
  { n: 'Claudia Mendoza',            r: 'Secretaria académica',            e: 'secretariais@uniguajira.edu.co',       ext: '241', color: 'var(--ug-amarillo)' },
  { n: 'Dra. Luz Marina Ipuana',     r: 'Coord. autoevaluación CNA',       e: 'autoevaluacion.is@uniguajira.edu.co',  ext: '245', color: 'var(--ug-flamingo)' },
  { n: 'Dr. Héctor Brito Mendoza',   r: 'Coord. investigación · GITUG',    e: 'hbrito@uniguajira.edu.co',             ext: '248', color: 'var(--ug-marino)' },
  { n: 'MSc. Andrea Bolaños Curvelo', r: 'Coord. extensión y semilleros',  e: 'abolanos@uniguajira.edu.co',           ext: '249', color: 'var(--ug-azul)' },
  { n: 'MSc. Jorge Epieyú Palmar',   r: 'Coord. currículo',                e: 'curriculo.is@uniguajira.edu.co',       ext: '246', color: 'var(--ug-amarillo)' },
]

/* Las dos primeras iniciales en mayúscula del nombre, como antes: de "MSc.
   Jorge Epieyú Palmar" salen MJ. El filtro descarta las partículas en
   minúscula ("de", "la"), no los tratamientos. */
const iniciales = nombre =>
  nombre.split(' ').map(p => p[0]).filter(c => /[A-ZÁÉÍÓÚÑ]/.test(c)).slice(0, 2).join('')

export default function Contacto() {
  return (
    <div className="page-in" style={{ padding: 'clamp(28px,4vw,44px) var(--gutter) 0' }}>
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>

        <nav className="miga" aria-label="Ruta de navegación">
          <span>Programa</span>
          <span aria-hidden="true">/</span>
          <span className="miga__actual">Dirección y contacto</span>
        </nav>

        <header className="hero-card">
          <div className="hero-card__patron" aria-hidden="true" />
          <div className="hero-card__contenido">
            <p className="hero-card__insignia">
              <span className="hero-card__punto" aria-hidden="true" />
              Director · Ingeniería de Sistemas
            </p>

            <h1 className="hero-card__titulo">
              Adanud Segundo <span>Meza Valle</span>
            </h1>
          </div>
        </header>

        {/* ── Qué hace la dirección · cómo contactarla ── */}
        <div className="contacto-grid">
          <div>
            <p className="contacto-texto">
              Lidera la gestión académica, la autoevaluación con fines de acreditación, la
              coordinación de los comités curricular y de autoevaluación, y la articulación del
              programa con las funciones misionales de la Universidad de La Guajira.
            </p>
            <p className="contacto-texto">
              Desde la dirección se impulsa el plan de mejoramiento 2022–2026, la ejecución de la
              reforma curricular y la consolidación de alianzas con el sector externo para
              prácticas, proyectos y transferencia tecnológica.
            </p>

            <div className="contacto-horario">
              <div className="doc-seccion__titulo" style={{ margin: 0 }}>Horario de atención a estudiantes</div>
              <div className="contacto-horario__cuerpo">
                <b>Lunes a viernes</b> · 8:00 a. m. – 12:00 m. y 2:00 p. m. – 5:30 p. m.<br />
                <b>Cita previa:</b> Sec. Académica · <span className="contacto-horario__ext">ext. 241</span>
              </div>
            </div>
          </div>

          <div className="doc-ficha">
            <div className="hero-card__patron" aria-hidden="true" />
            <div className="doc-ficha__cuerpo">
              <div className="doc-seccion__titulo" style={{ margin: 0 }}>Contacto institucional</div>
              <dl className="doc-datos">
                {CONTACTO.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* ── Equipo directivo ── */}
        <section className="doc-seccion">
          <h2 className="doc-seccion__titulo">Estructura del programa</h2>
          <p className="doc-seccion__desc">Equipo directivo y de coordinación.</p>

          <div className="equipo-grid">
            {EQUIPO.map(p => (
              <article key={p.e} className="equipo-card">
                <div className="equipo-card__banda" style={{ background: p.color }}>
                  <WayuuBackdrop variant="a" />
                  <div className="equipo-card__iniciales">{iniciales(p.n)}</div>
                </div>

                <div className="equipo-card__cuerpo">
                  <div className="equipo-card__rol">{p.r}</div>
                  <h3 className="equipo-card__nombre">{p.n}</h3>

                  <div className="equipo-card__contacto">
                    {/* El correo era texto plano con un ✉ delante; como enlace
                        se puede escribir desde aquí, que es a lo que viene
                        quien abre esta página. */}
                    <a className="equipo-card__dato" href={'mailto:' + p.e}>
                      <Icons.mail /> {p.e}
                    </a>
                    <span className="equipo-card__ext">ext. {p.ext}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div style={{ height: 70 }} />
      </div>
    </div>
  )
}
