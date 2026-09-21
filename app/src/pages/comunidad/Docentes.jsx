import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Icons } from '../../components/Icons'
import Portal from '../../components/Portal'
import { sedeMatch } from '../../components/SedeFilter'
import { useData } from '../../context/DataContext'


/* Buscador de grupos de MinCiencias. Si el programa ya tiene la URL directa de
   su GrupLAC, se reemplaza aquí. */
const GRUPLAC_URL = 'https://scienti.minciencias.gov.co/gruplac/'

/* Tipo de vinculación. Es lo que trae la planilla de la facultad; sustituye al
   escalafón (titular/asociado/asistente), que son cosas distintas y que esa
   fuente no registra.

   El color va por nombre de color y no por vinculación a propósito: si mañana
   aparece otra figura contractual, basta con añadirla aquí. */
const VINCULACIONES = [
  { k: 'planta',      l: 'Planta',      clase: 'planta' },
  { k: 'catedratico', l: 'Catedrático', clase: 'catedratico' },
  { k: 'ocasional',   l: 'Ocasional',   clase: 'ocasional' },
]

/* Respaldo para un valor desconocido o vacío: se pinta en gris en vez de
   romper la tarjeta. */
const VINCULACION_OTRA = { k: 'otra', l: 'Sin registrar', clase: 'otra' }

function vinculacionDe(d) {
  return VINCULACIONES.find(v => v.k === d.vinculacion) ?? VINCULACION_OTRA
}

/* Cómo se AGRUPA, que no es lo mismo que cómo se ETIQUETA en detalle.
 *
 * En el listado al visitante le sirve saber quién está de tiempo completo y
 * quién va por horas; que sea planta u ocasional es una figura contractual que
 * ahí no le dice nada. Al abrir la ficha sí aparece la figura exacta, porque
 * para el docente y para la facultad no son lo mismo.
 *
 * Así que la tarjeta y los filtros usan el GRUPO, y la ficha abierta usa
 * VINCULACIONES. El color va por grupo en ambos: si dos tarjetas dicen
 * "Tiempo completo", pintarlas de colores distintos solo confundiría, y que
 * la ficha herede el color de la tarjeta mantiene la animación continua. */
const GRUPOS_VINCULACION = [
  { k: 'tiempo_completo', l: 'Tiempo completo', clase: 'planta',      incluye: ['planta', 'ocasional'] },
  { k: 'catedratico',     l: 'Catedrático',     clase: 'catedratico', incluye: ['catedratico'] },
]

const GRUPO_OTRO = { k: 'otra', l: 'Sin registrar', clase: 'otra', incluye: [] }

function grupoDe(d) {
  return GRUPOS_VINCULACION.find(g => g.incluye.includes(d.vinculacion)) ?? GRUPO_OTRO
}

function enGrupo(docente, claveGrupo) {
  const grupo = GRUPOS_VINCULACION.find(g => g.k === claveGrupo)
  return grupo ? grupo.incluye.includes(docente.vinculacion) : false
}

const SEDES = [
  { k: 'ambas',    l: 'Ambas sedes' },
  { k: 'riohacha', l: 'Riohacha' },
  { k: 'maicao',   l: 'Maicao' },
]

const NOMBRE_SEDE = { riohacha: 'Sede Riohacha', maicao: 'Sede Maicao' }

/* Contadores del directorio. Como todo lo demás, salen de los datos: cuando
   entre o salga un docente el número se corrige solo.

   Un docente con doctorado y maestría cuenta en ambos: son títulos que tiene,
   no un nivel máximo. */
function contadoresDe(docentes) {
  const conNivel = nivel => docentes.filter(d => (d.formacion ?? []).some(f => f.nivel === nivel)).length
  const sedes = new Set(docentes.map(d => d.sede)).size

  return [
    { k: 'docentes',   valor: docentes.length,          etiqueta: docentes.length === 1 ? 'docente del programa' : 'docentes del programa' },
    { k: 'doctorados', valor: conNivel('doctorado'),    etiqueta: 'con doctorado' },
    { k: 'maestrias',  valor: conNivel('maestria'),     etiqueta: 'con maestría' },
    { k: 'sedes',      valor: sedes,                    etiqueta: sedes === 1 ? 'sede universitaria' : 'sedes universitarias' },
  ]
}

/* Las cifras del hero se calculan del listado: así no hay un número escrito a
   mano que quede mintiendo cuando entren o salgan docentes. */
function resumenDe(docentes) {
  const total = docentes.length
  const conPosgrado = docentes.filter(d => d.formacion?.length > 0).length
  const sedes = [...new Set(docentes.map(d => d.sede))]
  const nombresSede = sedes
    .map(s => (NOMBRE_SEDE[s] ?? s).replace('Sede ', ''))
    .join(' & ')

  return [
    {
      k: 'posgrado',
      tono: 'acento',
      valor: total ? `${Math.round((conPosgrado / total) * 100)}%` : '—',
      etiqueta: 'Docentes con posgrado activo',
    },
    { k: 'scienti', valor: 'ScienTI / MinCiencias', etiqueta: 'Vinculación institucional' },
    {
      k: 'sedes',
      tono: 'ambar',
      valor: `${sedes.length} ${sedes.length === 1 ? 'Sede' : 'Sedes'}`,
      etiqueta: nombresSede || 'Sin sedes registradas',
    },
  ]
}

/* Iniciales para el rombo: nombre de pila + primer apellido.
   Con cuatro palabras el apellido es la tercera (dos nombres de pila);
   con tres, la segunda. */
function iniciales(nombre) {
  /* Un registro sin nombre no debe tumbar la página entera. */
  if (!nombre) return '—'
  const p = String(nombre).trim().split(/\s+/)
  const apellido = p.length >= 4 ? p[2] : p[1]
  return ((p[0]?.[0] ?? '') + (apellido?.[0] ?? '')).toUpperCase()
}

/* ────────────────────────────────────────────────────────────────
   FICHA AMPLIADA

   Se abre creciendo desde la tarjeta que se tocó: se mide su posición y se
   anima el panel desde ese rectángulo hasta su tamaño final (técnica FLIP),
   de modo que la tarjeta parece adelantarse y abrirse. Al cerrar, vuelve.
   ──────────────────────────────────────────────────────────────── */
const ANIM = { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' }

function sinMovimiento() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/* Fotogramas que llevan el panel desde el rectángulo de la tarjeta al suyo. */
function fotogramas(desde, hasta) {
  return [
    {
      transform: `translate(${desde.left - hasta.left}px, ${desde.top - hasta.top}px)`
        + ` scale(${desde.width / hasta.width}, ${desde.height / hasta.height})`,
      opacity: 0.5,
    },
    { transform: 'none', opacity: 1 },
  ]
}

function FichaDocente({ d, rect, onCerrar }) {
  /* Aquí sí se nombra la figura exacta —planta u ocasional—; el color viene
     del grupo para que coincida con la tarjeta de la que se abre. */
  const v = vinculacionDe(d)
  const g = grupoDe(d)
  const panelRef = useRef(null)
  const fondoRef = useRef(null)
  const cerrandoRef = useRef(false)

  /* Apertura: el panel arranca donde estaba la tarjeta. */
  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!panel || !rect || sinMovimiento()) return
    panel.animate(fotogramas(rect, panel.getBoundingClientRect()), ANIM)
    fondoRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], ANIM)
  }, [rect])

  const cerrar = useCallback(() => {
    if (cerrandoRef.current) return
    cerrandoRef.current = true
    const panel = panelRef.current
    if (!panel || !rect || sinMovimiento()) { onCerrar(); return }
    const anim = panel.animate(fotogramas(rect, panel.getBoundingClientRect()).reverse(), ANIM)
    fondoRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], ANIM)
    anim.onfinish = onCerrar
    anim.oncancel = onCerrar
  }, [rect, onCerrar])

  /* Escape para salir y bloqueo del scroll del fondo mientras está abierta. */
  useEffect(() => {
    const alTeclear = e => { if (e.key === 'Escape') cerrar() }
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', alTeclear)
    return () => {
      document.body.style.overflow = previo
      document.removeEventListener('keydown', alTeclear)
    }
  }, [cerrar])

  const contacto = [
    ['Correo', <a key="e" href={`mailto:${d.email}`}>{d.email}</a>],
    d.oficina   && ['Oficina', d.oficina],
    d.extension && ['Extensión', d.extension],
    d.horario   && ['Atención a estudiantes', d.horario],
  ].filter(Boolean)

  const enlaces = [
    ['CvLAC', d.cvlac_url],
    ['ORCID', d.orcid_url],
    ['Google Scholar', d.scholar_url],
  ].filter(([, url]) => url)

  return (
    <Portal>
      <div ref={fondoRef} className="ficha-fondo" onClick={cerrar} />
      <div className="ficha-capa" role="presentation">
        <article
          ref={panelRef}
          className="ficha"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`ficha-nombre-${d.id}`}
        >
          <div className="ficha__patron" aria-hidden="true" />

          <button type="button" className="ficha__cerrar" onClick={cerrar} autoFocus aria-label="Cerrar ficha">
            <Icons.close />
          </button>

          <header className="ficha__encabezado">
            <div className={`ficha__foto ficha__foto--${g.clase}`}>
              {d.foto_url
                ? <img src={d.foto_url} alt={`Fotografía de ${d.nombre}`} />
                : (
                  <span className={`docente-rombo docente-rombo--${g.clase} ficha__rombo`} aria-hidden="true">
                    <span className="docente-rombo__texto">{iniciales(d.nombre)}</span>
                  </span>
                )}
            </div>

            <div className="ficha__identidad">
              <span className={`docente-pastilla docente-pastilla--${g.clase}`}>{v.l}</span>
              <h2 className="ficha__nombre" id={`ficha-nombre-${d.id}`}>{d.nombre}</h2>
              <p className="ficha__sede">
                <span className={`docente-punto docente-punto--${d.sede}`} aria-hidden="true" />
                {NOMBRE_SEDE[d.sede]}
                {d.dedicacion && <span className="ficha__dedicacion">{d.dedicacion}</span>}
              </p>
              <p className="ficha__posgrado">{d.posgrado}</p>
            </div>
          </header>

          <div className="ficha__cuerpo">
            {d.formacion?.length > 0 && (
              <section className="docente-detalle__bloque">
                <h3>Formación académica</h3>
                <ul className="docente-detalle__formacion">
                  {d.formacion.map((f, i) => (
                    <li key={i}>
                      <span className="docente-detalle__grado">
                        {f.titulo}
                        {f.en_curso && <em className="docente-detalle__curso">en curso</em>}
                      </span>
                      {(f.institucion || f.anio) && (
                        <span className="docente-detalle__meta">
                          {[f.institucion, f.anio].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {(d.grupo || d.semillero) && (
              <section className="docente-detalle__bloque">
                <h3>Investigación</h3>
                <ul className="docente-detalle__formacion">
                  {d.grupo && (
                    <li>
                      <span className="docente-detalle__grado">
                        {d.grupo}
                        {d.grupo_categoria && (
                          <em className="docente-detalle__minciencias">Categoría {d.grupo_categoria}</em>
                        )}
                      </span>
                      <span className="docente-detalle__meta">Grupo de investigación</span>
                    </li>
                  )}
                  {d.semillero && (
                    <li>
                      <span className="docente-detalle__grado">{d.semillero}</span>
                      <span className="docente-detalle__meta">Semillero</span>
                    </li>
                  )}
                </ul>
              </section>
            )}

            <section className="docente-detalle__bloque">
              <h3>Contacto</h3>
              <dl className="docente-detalle__contacto">
                {contacto.map(([rotulo, valor]) => (
                  <div key={rotulo}>
                    <dt>{rotulo}</dt>
                    <dd>{valor}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="docente-detalle__bloque">
              <h3>Perfiles académicos</h3>
              <div className="docente-detalle__enlaces">
                {enlaces.map(([rotulo, url]) => (
                  <a
                    key={rotulo}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${rotulo} de ${d.nombre} (abre en una pestaña nueva)`}
                  >
                    {rotulo}
                    <Icons.external />
                  </a>
                ))}
              </div>
            </section>
          </div>
        </article>
      </div>
    </Portal>
  )
}

export default function Docentes() {
  const { data } = useData()
  const docentes = data.docentes ?? []

  const [q, setQ] = useState('')
  const [vinculacion, setVinculacion] = useState('todas')
  const [sede, setSede] = useState('ambas')
  /* { d, rect }: el docente abierto y el rectángulo de su tarjeta, que es de
     donde crece la ficha. */
  const [ficha, setFicha] = useState(null)

  const abrir = useCallback((d, evento) => {
    const tarjeta = evento.currentTarget.closest('.docente-card')
    setFicha({ d, rect: tarjeta.getBoundingClientRect() })
  }, [])

  /* Al cerrar, el foco vuelve a la tarjeta desde donde se abrió. */
  const cerrar = useCallback(() => {
    const id = ficha?.d.id
    setFicha(null)
    if (id != null) {
      requestAnimationFrame(() => document.getElementById(`docente-abrir-${id}`)?.focus())
    }
  }, [ficha])

  const filtrados = useMemo(() => {
    const texto = q.trim().toLowerCase()
    return docentes.filter(d => {
      const coincideTexto = !texto
        || d.nombre.toLowerCase().includes(texto)
        || (d.posgrado ?? '').toLowerCase().includes(texto)
      const coincideVinculacion = vinculacion === 'todas' || enGrupo(d, vinculacion)
      return coincideTexto && coincideVinculacion && sedeMatch(d.sede, sede)
    })
  }, [docentes, q, vinculacion, sede])

  const resumen = useMemo(() => resumenDe(docentes), [docentes])
  const contadores = useMemo(() => contadoresDe(docentes), [docentes])

  return (
    <div className="page-in docentes-page">
      <nav className="miga" aria-label="Ruta de navegación">
        <span>Comunidad</span>
        <span aria-hidden="true">/</span>
        <span className="miga__actual">Cuerpo Docente</span>
      </nav>

      <header className="hero-card">
        <div className="hero-card__patron" aria-hidden="true" />
        <div className="hero-card__contenido">
          <p className="hero-card__insignia">
            <span className="hero-card__punto" aria-hidden="true" />
            Cuerpo profesoral e investigador · Ingeniería de Sistemas
          </p>

          <h1 className="hero-card__titulo">
            Quienes enseñan aquí, <span>transforman la región.</span>
          </h1>

          <p className="hero-card__texto">
            Ingeniería contextualizada con el territorio: desde inteligencia artificial y
            telemática hasta gobernanza tecnológica en el Caribe colombiano. Conoce las líneas
            de investigación, formación doctoral y producción científica de nuestro equipo
            docente en Riohacha y Maicao.
          </p>

          <dl className="hero-card__cifras">
            {resumen.map(c => (
              <div key={c.k} className={'hero-card__cifra' + (c.tono ? ` hero-card__cifra--${c.tono}` : '')}>
                <dt>{c.valor}</dt>
                <dd>{c.etiqueta}</dd>
              </div>
            ))}
          </dl>

          <a
            className="hero-card__cta"
            href={GRUPLAC_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Explorar grupos de investigación (GrupLAC)
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </header>

      <section className="docentes-panel" aria-label="Resumen y filtros del directorio">
        <div className="docentes-cifras">
          {contadores.map(c => (
            <span key={c.k} className={`docentes-cifra docentes-cifra--${c.k}`}>
              <strong>{c.valor}</strong> {c.etiqueta}
            </span>
          ))}
        </div>

        <div className="docentes-filtros">
          <div className="docentes-chips" role="group" aria-label="Filtrar por tipo de vinculación">
            {/* "Todo el cuerpo docente" y no "toda la planta docente": ahora que
                el filtro de al lado dice "Tiempo completo", la palabra planta
                se leería como la figura contractual y no como el conjunto. */}
            {[{ k: 'todas', l: 'Todo el cuerpo docente' }, ...GRUPOS_VINCULACION].map(c => (
              <button
                key={c.k}
                type="button"
                className={`docentes-chip${vinculacion === c.k ? ' is-activo' : ''}`}
                aria-pressed={vinculacion === c.k}
                onClick={() => setVinculacion(c.k)}
              >
                {c.l}
              </button>
            ))}
          </div>

          <div className="docentes-herramientas">
            <div className="docentes-buscador">
              <span className="docentes-buscador__icono" aria-hidden="true"><Icons.search /></span>
              <input
                type="search"
                className="docentes-buscador__campo"
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Buscar por nombre o área"
                aria-label="Buscar docente por nombre o área"
              />
            </div>

            <div className="docentes-sedes" role="group" aria-label="Filtrar por sede">
              {SEDES.map(s => (
                <button
                  key={s.k}
                  type="button"
                  className={`docentes-sede${sede === s.k ? ' is-activo' : ''}`}
                  aria-pressed={sede === s.k}
                  onClick={() => setSede(s.k)}
                >
                  {s.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {filtrados.length === 0 ? (
        <p className="docentes-vacio">
          {docentes.length === 0
            ? 'El directorio docente se está cargando. Vuelve pronto.'
            : 'No se encontraron docentes con ese criterio.'}
        </p>
      ) : (
        <section className="docentes-grid">
          {filtrados.map(d => {
            const abierta = ficha?.d.id === d.id
            const g = grupoDe(d)   /* la tarjeta agrupa; la figura exacta se ve al abrirla */
            return (
              <article key={d.id} className={`docente-card${abierta ? ' is-abierta' : ''}`}>
                <div className="docente-card__patron" aria-hidden="true" />
                <div className="docente-card__cuerpo">
                  <div className={`docente-card__acento docente-card__acento--${g.clase}`} aria-hidden="true" />
                  <div className="docente-card__contenido">
                    <h2 className="docente-card__encabezado">
                    <button
                      type="button"
                      id={`docente-abrir-${d.id}`}
                      className="docente-card__toggle"
                      aria-haspopup="dialog"
                      onClick={e => abrir(d, e)}
                    >
                      <span className="docente-card__cabecera">
                        {/* Con fotografía manda la foto; sin ella, el rombo con
                            las iniciales. El borde conserva el color de la
                            vinculación en ambos casos. */}
                        {d.foto_url ? (
                          <span className={`docente-card__foto docente-card__foto--${g.clase}`}>
                            <img src={d.foto_url} alt="" loading="lazy" />
                          </span>
                        ) : (
                          <span className={`docente-rombo docente-rombo--${g.clase}`} aria-hidden="true">
                            <span className="docente-rombo__texto">{iniciales(d.nombre)}</span>
                          </span>
                        )}
                        <span className="docente-card__identidad">
                          <span className="docente-card__nombre">{d.nombre}</span>
                          <span className={`docente-pastilla docente-pastilla--${g.clase}`}>{g.l}</span>
                        </span>
                        <span className="docente-card__chevron" aria-hidden="true"><Icons.arrow /></span>
                      </span>

                      <span className="docente-card__datos">
                        <span className="docente-card__sede">
                          <span className={`docente-punto docente-punto--${d.sede}`} aria-hidden="true" />
                          {NOMBRE_SEDE[d.sede]}
                        </span>
                        <span className="docente-card__posgrado">{d.posgrado}</span>
                      </span>
                    </button>
                    </h2>

                    <div className="docente-card__pie">
                      <a
                        className="docente-card__cvlac"
                        href={d.cvlac_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Ver CVLAC de ${d.nombre} (abre en una pestaña nueva)`}
                      >
                        Ver CVLAC
                        <Icons.external />
                      </a>
                      <p className="docente-card__correo">
                        <Icons.mail />
                        <a href={`mailto:${d.email}`}>{d.email}</a>
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      )}

      {ficha && <FichaDocente d={ficha.d} rect={ficha.rect} onCerrar={cerrar} />}
    </div>
  )
}
