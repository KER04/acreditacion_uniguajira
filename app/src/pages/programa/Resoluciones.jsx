/* Marco legal del programa: registro calificado, acreditación y los actos
   administrativos que los rodean.

   Misma cabecera que /pensum y /pensum-propuesto —migas, hero-card con la
   franja tejida y cuatro cifras— y la .doc-lista que Egresados usa para su
   normativa: un acto administrativo se lee en un renglón y son muchos.

   Las dos resoluciones que enmarcan el programa no van en esa lista. Van en
   tarjeta grande con banda de color porque no son dos filas más: son la razón
   de ser de la página.

   OJO: el contenido de esta página está escrito aquí, no en la base. Es la
   única que queda así entre las de consulta. La tabla `normativa_grado` de la
   migración 013 tiene exactamente esta forma —tipo, número, año, quién lo
   expidió, vigencia y adjunto—, así que migrarla es sobre todo mover datos.
*/
import { Icons } from '../../components/Icons'
import { Link } from 'react-router-dom'
import { WayuuBackdrop } from '../../components/WayuuPatterns'

/* ─── Vigencia ─────────────────────────────────────────────────── */

/* La vigencia se calcula; no se escribe "Registro vigente" en un chip fijo.
   Un acto con años de vigencia vence solo, y un rótulo escrito a mano sigue
   diciendo que todo está en regla mucho después de que dejó de estarlo. */
function vigenciaDe(desdeISO, anios) {
  const [a, m, d] = desdeISO.split('-').map(Number)
  const vence = new Date(a + anios, m - 1, d)
  const hoy = new Date()
  const meses = Math.round((vence - hoy) / (1000 * 60 * 60 * 24 * 30.44))
  return { vence, vencida: vence < hoy, meses }
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
               'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

const enLetra = f => `${f.getDate()} de ${MESES[f.getMonth()]} de ${f.getFullYear()}`

/* "Vigente · quedan 22 meses" / "Venció el 21 de febrero de 2025" */
function rotuloVigencia(v) {
  if (v.vencida) return { texto: 'Venció el ' + enLetra(v.vence), tono: 'terracota' }
  if (v.meses <= 12) return { texto: `Vence en ${v.meses} meses · ${enLetra(v.vence)}`, tono: 'ambar' }
  return { texto: `Vigente hasta el ${enLetra(v.vence)}`, tono: 'azul' }
}

/* ─── Los dos actos que enmarcan el programa ───────────────────── */

const ACTOS = [
  {
    tipo: 'Registro calificado',
    numero: 'Resolución N.º 02872',
    desde: '2018-02-21',
    anios: 7,
    color: 'var(--ug-azul)',
    autoridad: 'Ministerio de Educación Nacional',
    texto: 'Otorgamiento del registro calificado al programa de Ingeniería de Sistemas de la Universidad de La Guajira. Es la autorización para ofrecer y desarrollar el programa; sin ella no se pueden admitir cohortes nuevas.',
  },
  {
    tipo: 'Acreditación de alta calidad',
    numero: 'Resolución N.º 014528',
    desde: '2022-07-28',
    anios: 6,
    color: 'var(--ug-amarillo)',
    autoridad: 'Consejo Nacional de Acreditación (CNA)',
    texto: 'Otorgamiento de la acreditación de alta calidad. Es voluntaria y va más allá del registro: reconoce la calidad académica, investigativa y de extensión del programa.',
  },
]

/* Actos administrativos internos, en orden cronológico inverso. */
const OTROS = [
  { tipo: 'Acuerdo',    numero: '045 de 2024', anio: 2024, fuente: 'Consejo Académico',  titulo: 'Aprobación de la reforma curricular de Ingeniería de Sistemas' },
  { tipo: 'Resolución', numero: '0238 de 2024', anio: 2024, fuente: 'Rectoría',          titulo: 'Adopción del PEP actualizado' },
  { tipo: 'Resolución', numero: '0412 de 2023', anio: 2023, fuente: 'Rectoría',          titulo: 'Designación del director del programa' },
  { tipo: 'Acuerdo',    numero: '012 de 2023', anio: 2023, fuente: 'Consejo Académico',  titulo: 'Política de opciones de grado' },
  { tipo: 'Acuerdo',    numero: '018 de 2021', anio: 2021, fuente: 'Consejo Superior',   titulo: 'Reglamento estudiantil vigente' },
]

/* ─── Página ───────────────────────────────────────────────────── */

export default function Resoluciones() {
  const vigencias = ACTOS.map(a => vigenciaDe(a.desde, a.anios))

  /* Las cifras de cabecera se derivan de los mismos actos que pinta la
     página: no hay un número escrito por separado que pueda desfasarse. */
  const CIFRAS = [
    { k: 'snies', tono: 'acento', valor: '17579', etiqueta: 'Código SNIES del programa' },
    { k: 'registro', valor: ACTOS[0].desde.slice(0, 4), etiqueta: 'Registro calificado · MEN' },
    { k: 'acreditacion', tono: 'acento', valor: ACTOS[1].desde.slice(0, 4), etiqueta: `Acreditación CNA · ${ACTOS[1].anios} años` },
    { k: 'actos', tono: 'ambar', valor: ACTOS.length + OTROS.length, etiqueta: 'Actos administrativos publicados' },
  ]

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

            {/* La insignia toma el tono del registro calificado: si venció,
                la página no puede abrir en azul diciendo que todo va bien. */}
            <p className={'hero-card__insignia' + (vigencias[0].vencida ? ' hero-card__insignia--aviso' : '')}>
              <span className="hero-card__punto" aria-hidden="true" />
              {vigencias[0].vencida
                ? 'Registro calificado · pendiente de renovación'
                : 'Registro calificado vigente · Acreditado en alta calidad'}
            </p>

            <h1 className="hero-card__titulo">
              Marco legal <span>del programa.</span>
            </h1>

            <p className="hero-card__texto">
              Los actos que autorizan el programa y los que lo gobiernan por dentro: el registro
              calificado del Ministerio, la acreditación de alta calidad del CNA y los acuerdos y
              resoluciones de los consejos y la rectoría. Todos con su número, su fecha y quién
              los expidió, para poder citarlos tal cual.
            </p>

            <dl className="hero-card__cifras">
              {CIFRAS.map(c => (
                <div key={c.k} className={'hero-card__cifra' + (c.tono ? ` hero-card__cifra--${c.tono}` : '')}>
                  <dt>{c.valor}</dt>
                  <dd>{c.etiqueta}</dd>
                </div>
              ))}
            </dl>

            <Link className="hero-card__cta" to="/acreditacion">
              Ver el proceso de acreditación
              <span aria-hidden="true">→</span>
            </Link>

          </div>
        </header>

        {/* ── Los dos actos principales ── */}
        <section className="doc-seccion" style={{ marginBottom: 44 }}>
          <div className="resolucion-grid">
            {ACTOS.map((a, i) => {
              const r = rotuloVigencia(vigencias[i])
              return (
                <article key={a.numero} className="resolucion">
                  <div className="resolucion__banda" style={{ background: a.color }}>
                    <WayuuBackdrop variant="a" />
                    <div className="resolucion__tipo">{a.tipo}</div>
                    <div className="resolucion__numero">{a.numero}</div>
                  </div>

                  <div className="resolucion__cuerpo">
                    <div className="doc-card__etiquetas">
                      <span className={'doc-pin doc-pin--' + r.tono}>{r.texto}</span>
                    </div>

                    <dl className="resolucion__datos">
                      <div>
                        <dt>Expedida</dt>
                        <dd>{enLetra(new Date(a.desde + 'T00:00:00'))}</dd>
                      </div>
                      <div>
                        <dt>Vigencia</dt>
                        <dd>{a.anios} años</dd>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <dt>Autoridad</dt>
                        <dd>{a.autoridad}</dd>
                      </div>
                    </dl>

                    <p className="resolucion__texto">{a.texto}</p>

                    {/* Todavía no hay PDF cargado de ninguna de las dos: el
                        botón se deja visible y deshabilitado, que es honesto,
                        en vez de un enlace que no lleva a ninguna parte. */}
                    <div className="resolucion__acciones">
                      <button className="doc-boton" disabled title="Sin documento cargado">
                        <Icons.download /> Descargar PDF
                      </button>
                      <a className="doc-boton" href="https://saces.mineducacion.gov.co/consultaspublicas/"
                         target="_blank" rel="noopener noreferrer">
                        Consultar en SACES <Icons.external />
                      </a>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        {/* ── Otros actos administrativos ── */}
        <section className="doc-seccion">
          <h2 className="doc-seccion__titulo">Otros actos administrativos</h2>
          <p className="doc-seccion__desc">
            Acuerdos de los consejos Superior y Académico y resoluciones rectorales que rigen el
            programa por dentro: reforma curricular, PEP, reglamento estudiantil y opciones de grado.
          </p>

          <div className="doc-lista">
            {OTROS.map(o => (
              <div key={o.numero + o.titulo} className="doc-norma">
                <div className="doc-norma__ref">
                  <b>{o.tipo}</b>
                  <span>{o.numero}</span>
                </div>

                <div className="doc-norma__cuerpo">
                  <div className="doc-norma__titulo">{o.titulo}</div>
                  <div className="doc-norma__fuente">{o.fuente} · {o.anio}</div>
                </div>

                <button className="doc-boton" disabled title="Sin documento cargado">
                  <Icons.download /> Sin documento
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
