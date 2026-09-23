/* Dirección y contacto del programa.

   Misma cabecera que /pensum, /pensum-propuesto y /resoluciones: migas y
   hero-card con la franja tejida. Debajo, dos tarjetas —qué hace la dirección
   y cómo se la contacta— y las fichas del equipo.

   La franja tejida se repite solo en la tarjeta de contacto: si la llevaran
   las dos, el ojo no sabría cuál abre la página.

   Al final, el organigrama. La rejilla de seis fichas iguales no decía quién
   depende de quién: ahora el despacho ocupa dos tarjetas anchas y las cuatro
   coordinaciones van debajo en tarjetas compactas, así que la jerarquía se lee
   en el tamaño sin necesidad de flechas. El hexágono con las iniciales hace de
   retrato mientras no haya fotos cargadas. */
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

/* Los cuatro frentes que nombran los párrafos de arriba, sacados aparte para
   poder verlos sin leerse el texto entero. */
const EJES = [
  { l: 'Plan de Mejoramiento 2022–2026', tono: '' },
  { l: 'Reforma Curricular',             tono: '' },
  { l: 'Alianzas TI y Transferencia',    tono: 'ambar' },
  { l: 'Prácticas Profesionales',        tono: 'terracota' },
]

/* El despacho: dirección y secretaría académica. Van en tarjeta ancha porque
   son la puerta de entrada al programa y quien llega busca una de las dos. */
const DESPACHO = [
  {
    n: 'Adanud S. Meza Valle', e: 'direccion.is@uniguajira.edu.co', ext: '240',
    area: 'Despacho de Dirección', tono: 'azul', color: 'var(--ug-azul)',
    detalle: 'Ingeniero de Sistemas · Magíster',
    lugar: 'Bloque 1 · Segundo Piso, Of. 204',
  },
  {
    n: 'Claudia Mendoza', e: 'secretariais@uniguajira.edu.co', ext: '241',
    area: 'Atención al público y actas', tono: 'ambar', color: 'var(--ug-amarillo)',
    detalle: 'Gestión Administrativa y Estudiantil',
    lugar: 'Ventanilla de Correspondencia IS',
  },
]

/* Las cuatro coordinaciones misionales. El cargo va encima del nombre: quien
   busca aquí busca "quién lleva currículo", no a una persona concreta. */
const COORDINACIONES = [
  {
    n: 'Dra. Luz Marina Ipuana', e: 'autoevaluacion.is@uniguajira.edu.co', ext: '245',
    cargo: 'Coord. Autoevaluación CNA', area: 'Acreditación MEN', tono: 'terracota',
    color: 'var(--ug-flamingo)', detalle: 'Aseguramiento y Calidad Académica',
    lugar: 'Sede Central',
  },
  {
    n: 'Dr. Héctor Brito Mendoza', e: 'hbrito@uniguajira.edu.co', ext: '248',
    cargo: 'Coord. Investigación · GITUG', area: 'MinCiencias Cat. A', tono: 'azul',
    color: 'var(--ug-marino)', detalle: 'Grupo de Investigación TI Uniguajira',
    lugar: 'Lab. TI',
  },
  {
    n: 'MSc. Andrea Bolaños Curvelo', e: 'abolanos@uniguajira.edu.co', ext: '249',
    cargo: 'Coord. Extensión y Semilleros', area: 'Proyección', tono: 'azul',
    color: 'var(--ug-azul)', detalle: 'Semilleros y Proyección Social',
    lugar: 'Semilleros IS',
  },
  {
    n: 'MSc. Jorge Epieyú Palmar', e: 'curriculo.is@uniguajira.edu.co', ext: '246',
    cargo: 'Coord. Currículo', area: 'Asuntos Curriculares', tono: 'ambar',
    color: 'var(--ug-amarillo)', detalle: 'Comité Curricular y Planes de Estudio',
    lugar: 'Plan de Estudios',
  },
]

/* Las dos primeras iniciales en mayúscula del nombre: de "MSc. Jorge Epieyú
   Palmar" salen MJ. El filtro descarta las partículas en minúscula ("de",
   "la"), no los tratamientos. */
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

            <p className="hero-card__subtitulo">
              Facultad de Ingeniería · Universidad de La Guajira · Sede Principal Riohacha
            </p>
          </div>
        </header>

        {/* ── Qué hace la dirección · cómo contactarla ── */}
        <div className="contacto-cuerpo">

          <section className="contacto-panel">
            <div className="contacto-panel__cuerpo">
              <div className="contacto-encabezado">
                <div className="contacto-encabezado__titulo">
                  <Icons.archivo /> Gestión y liderazgo académico
                </div>
                <span className="contacto-vigencia">Vigencia 2022–2026</span>
              </div>

              <p className="contacto-entrada">
                Lidera la <b>gestión académica</b>, la <b>autoevaluación con fines de
                acreditación</b>, la coordinación de los comités curricular y de autoevaluación,
                y la articulación del programa con las funciones misionales de la{' '}
                <em>Universidad de La Guajira</em>.
              </p>

              <p className="contacto-parrafo">
                Desde la dirección se impulsa el cumplimiento del <b>plan de mejoramiento
                2022–2026</b>, la ejecución continua de la <b>reforma curricular</b> y la
                consolidación de <b>alianzas estratégicas</b> con el sector externo para potenciar
                prácticas, proyectos de investigación y transferencia tecnológica de impacto
                regional.
              </p>

              <div className="contacto-ejes">
                <div className="contacto-ejes__label">Ejes estratégicos de gestión</div>
                <div className="contacto-ejes__lista">
                  {EJES.map(e => (
                    <span key={e.l} className={'eje' + (e.tono ? ` eje--${e.tono}` : '')}>{e.l}</span>
                  ))}
                </div>
              </div>

              <div className="contacto-horario">
                <div className="contacto-encabezado">
                  <div className="contacto-encabezado__titulo">
                    <Icons.reloj /> Horario de atención a estudiantes
                  </div>
                  <span className="doc-pin doc-pin--azul">Atención presencial</span>
                </div>

                <div className="contacto-horario__fila">
                  <div>
                    <div className="contacto-horario__dias">Lunes a viernes</div>
                    <div className="contacto-horario__tramos">
                      8:00 a. m. – 12:00 m. y 2:00 p. m. – 5:30 p. m.
                    </div>
                  </div>

                  <div className="contacto-cita">
                    Cita previa: Sec. Académica
                    <span className="contacto-cita__ext">ext. 241</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="contacto-panel">
            <div className="hero-card__patron" aria-hidden="true" />
            <div className="contacto-panel__cuerpo">
              <div className="contacto-encabezado__titulo" style={{ marginBottom: 6 }}>
                Contacto institucional
              </div>

              <dl className="contacto-datos">
                {CONTACTO.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="contacto-pie">
                <span className="contacto-pie__texto">Atención PQRSD y solicitudes</span>
                {/* Al correo institucional, que es el de la primera fila: el
                    enlace no manda a ningún sitio nuevo, solo ahorra copiarlo. */}
                <a className="contacto-pie__enlace" href={'mailto:' + CONTACTO[0][1]}>
                  Redactar mensaje <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </section>
        </div>

        {/* ── Organigrama ── */}
        <section className="doc-seccion">
          <div className="organigrama__cabecera">
            <div className="organigrama__eyebrow">Estructura académico-administrativa</div>
            <h2 className="organigrama__titulo">Organigrama Operativo del Programa</h2>
            <p className="organigrama__desc">
              Estructura jerárquica de liderazgo, coordinaciones misionales y atención académica
              permanente.
            </p>
          </div>

          <div className="organigrama__nivel">
            <span className="organigrama__rotulo">Despacho y conducción académica</span>
          </div>

          <div className="org-grid org-grid--despacho">
            {DESPACHO.map(p => (
              <article key={p.e} className="org-card org-card--ancha" style={{ '--tono': p.color }}>
                <div className="org-card__cabeza">
                  <div className="org-card__hex">{iniciales(p.n)}</div>
                  <div className="org-card__textos">
                    <span className={'org-card__area org-card__area--' + p.tono}>{p.area}</span>
                    <h3 className="org-card__nombre">{p.n}</h3>
                    <div className="org-card__detalle">{p.detalle}</div>
                  </div>
                  <span className="org-card__ext">Ext. {p.ext}</span>
                </div>

                <div className="org-card__pie">
                  <a className="org-dato" href={'mailto:' + p.e}><Icons.mail /> {p.e}</a>
                  <span className="org-card__lugar"><Icons.ubicacion /> {p.lugar}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="organigrama__nivel">
            <span className="organigrama__rotulo">Coordinaciones misionales y áreas estratégicas</span>
            <span className="organigrama__nota">
              Aseguramiento, Investigación, Extensión y Asuntos Curriculares
            </span>
          </div>

          <div className="org-grid org-grid--coordinacion">
            {COORDINACIONES.map(p => (
              <article key={p.e} className="org-card" style={{ '--tono': p.color }}>
                <div className="org-card__cabeza">
                  <div className="org-card__hex">{iniciales(p.n)}</div>
                  <span className={'org-card__area org-card__area--' + p.tono}>{p.area}</span>
                </div>

                <div className="org-card__textos">
                  <div className="org-card__cargo">{p.cargo}</div>
                  <h3 className="org-card__nombre">{p.n}</h3>
                  <div className="org-card__detalle">{p.detalle}</div>
                </div>

                <a className="org-dato org-card__correo" href={'mailto:' + p.e}>
                  <Icons.mail /> {p.e}
                </a>

                <div className="org-card__pie">
                  <span className="org-card__lugar"><Icons.ubicacion /> {p.lugar}</span>
                  <span className="org-card__ext">Ext. {p.ext}</span>
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
