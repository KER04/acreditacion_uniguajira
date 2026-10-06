/* Portada.
 *
 * Conserva el hero a dos columnas —una landing tiene que entrar fuerte— pero
 * pasa al mismo lenguaje que las páginas de consulta: la franja tejida al
 * filo, la insignia, los tokens --doc-* y la .doc-card compartida con
 * Egresados.
 *
 * El otro cambio es de fondo: la portada estaba escrita a mano de arriba a
 * abajo —el slogan, las cifras, el proyecto destacado, la cinta de titulares,
 * el número de semilleros— mientras el panel tenía desde siempre una pestaña
 * «Inicio» que guardaba justo eso y que nadie leía. Ahora todo lo que el panel
 * puede editar sale del panel, y lo que se puede contar se cuenta.
 */
import { useNavigate } from 'react-router-dom'
import { Icons } from '../components/Icons'
import { WayuuBackdrop, WayuuGlyph } from '../components/WayuuPatterns'
import CarruselPortada, { hayDiapositivas } from '../components/CarruselPortada'
import { useData } from '../context/DataContext'
import { statusFromScore, STATUS_COLOR, imagenFactor } from '../data/acreditacion'
import { fechaLarga } from '../../shared/validacion'

/* ─── Cinta de titulares ───────────────────────────────────────── */

/* Antes era una lista escrita a mano que envejecía sola: anunciaba un
   hackathon de mayo de 2026 y un laboratorio «recién inaugurado» mientras el
   portal ya publicaba noticias de verdad. Ahora sale de lo publicado, y si no
   hay nada publicado la cinta no se dibuja. */
function titularesDe(data) {
  const noticias = (data.noticias ?? [])
    .filter(n => n.publicada !== false)
    .slice(0, 4)
    .map(n => n.titulo)

  const eventos = (data.eventos ?? [])
    .filter(e => e.estado !== 'cancelado')
    .slice(0, 3)
    .map(e => (e.fecha ? `${e.titulo} · ${fechaLarga(e.fecha)}` : e.titulo))

  return [...noticias, ...eventos].filter(Boolean)
}

function Ticker({ items }) {
  if (items.length === 0) return null
  return (
    <div className="ticker">
      {/* La lista va duplicada porque la animación se desplaza media pista:
          sin la copia se vería el hueco al llegar al final. */}
      <div className="ticker-track">
        {[...items, ...items].map((t, i) => <span key={i}>{t}</span>)}
      </div>
    </div>
  )
}

/* ─── Hero ─────────────────────────────────────────────────────── */

/* El vídeo de la cabecera institucional de uniguajira.edu.co (estudiantes en
   el campus), guardado en public/video para no depender de sus rutas. Pesa
   2,8 MB: con «reducir movimiento» o ahorro de datos se queda solo el póster,
   que es un fotograma del mismo vídeo y ya lleva 54 KB. */
const VIDEO_HERO = '/video/estudiantes.mp4'
const POSTER_HERO = '/video/estudiantes-poster.webp'

function videoPermitido() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false
  if (navigator.connection?.saveData) return false
  return true
}

const LEDE_POR_DEFECTO =
  'Ingeniería de Sistemas en UniGuajira: donde el rigor técnico se encuentra con la identidad caribeña.'

function Hero() {
  const nav = useNavigate()
  const { data } = useData()

  const factores = data.factores ?? []
  /* El titular es identidad de marca y no se edita; el párrafo sí, porque es
     lo que la dirección querrá ajustar en cada temporada. */
  const lede = data.inicio?.slogan?.trim() || LEDE_POR_DEFECTO
  const proyecto = data.inicio?.proyectoDestacado
  /* La columna derecha es el carrusel de noticias y extensión; el proyecto
     destacado del panel solo aparece si no hay nada que rotar. */
  const conCarrusel = hayDiapositivas(data)
  const conPanel = conCarrusel || !!proyecto?.titulo
  const conVideo = videoPermitido()

  return (
    <section className="hero v2 hero--video" style={{ '--hero-poster': `url(${POSTER_HERO})` }}>
      {/* Mismo montaje que la cabecera institucional: vídeo a sangre, mudo y
          en bucle, con un degradado oscuro encima para que el texto se lea. */}
      <figure className="hero__video" aria-hidden="true">
        {conVideo && (
          <video autoPlay loop muted playsInline preload="metadata" poster={POSTER_HERO}>
            <source src={VIDEO_HERO} type="video/mp4" />
          </video>
        )}
      </figure>
      {/* Sin proyecto destacado no hay segunda columna, y dejar la rejilla en
          dos dejaría media portada en blanco. */}
      <div className="inner" style={conPanel ? undefined : { gridTemplateColumns: '1fr' }}>
        <div>
          <p className="hero-card__insignia">
            <span className="hero-card__punto" aria-hidden="true" />
            Acreditación CNA · {factores.length || 12} factores en autoevaluación
          </p>

          <h1>El código también se teje.</h1>
          <p className="lede">{lede}</p>

          <div className="hero-cta">
            <button className="btn accent" onClick={() => nav('/acreditacion')}>
              Ver acreditación <Icons.arrow />
            </button>
            <button className="btn ghost" onClick={() => nav('/pensum')}>Plan de estudios</button>
          </div>
          {/* Las cifras (estudiantes, docentes, egresados…) ya no se muestran
              en la portada; el panel (Admin → Inicio) aún las guarda. */}
        </div>

        {/* Proyecto destacado. Sale de Admin → Inicio; sin él, el hueco no
            tendría nada que decir, así que la columna no se dibuja. */}
        {conCarrusel && <CarruselPortada data={data} />}
        {!conCarrusel && proyecto?.titulo && (
          <div className="inicio-panel">
            <div className="hero-card__patron" aria-hidden="true" />
            <div className="inicio-panel__cuerpo">
              <div className="inicio-eyebrow">Proyecto destacado</div>
              <h3 className="inicio-panel__titulo">{proyecto.titulo}</h3>
              {proyecto.resumen && <p className="inicio-panel__resumen">{proyecto.resumen}</p>}

              <div className="inicio-panel__lienzo">
                <WayuuBackdrop variant="a" />
                <div className="inicio-panel__marca">{proyecto.titulo.split(':')[0]}</div>
              </div>
            </div>
            {proyecto.grupo && <div className="inicio-panel__pie">{proyecto.grupo}</div>}
          </div>
        )}
      </div>
    </section>
  )
}

/* ─── Qué te llevas de aquí ────────────────────────────────────── */

/* Las tres tarjetas son prosa, pero las cifras que citaban no lo eran: decían
   «14 semilleros» cuando hay cinco publicados. Las que se pueden contar se
   cuentan; el resto se dejó sin número antes que con uno falso. */
function Features() {
  const { data } = useData()
  const grupos = data.grupos ?? []
  const semilleros = data.semilleros ?? []
  const info = data.pensum_info

  const tarjetas = [
    {
      acento: 'azul',
      e: '01 · Formación',
      t: 'Un pensum que respira',
      b: info?.plan
        ? `${info.plan.num_semestres} semestres y ${info.total_materias} asignaturas que combinan fundamentos de computación, ingeniería de software, datos, redes e IA, con electivas en IoT aplicado y ciencia de datos territorial.`
        : 'Fundamentos de computación, ingeniería de software, datos, redes e IA, con electivas en IoT aplicado y ciencia de datos territorial.',
    },
    {
      acento: 'ambar',
      e: '02 · Investigación',
      t: grupos.length ? `${grupos.length} grupos, una región` : 'Grupos y semilleros',
      b: grupos.length
        ? `${grupos.map(g => g.nombre ?? g.n).filter(Boolean).join(', ')} articulan ${semilleros.length} semilleros activos y proyectos con comunidades wayuu, pescadores y salineros.`
        : 'Los grupos de investigación del programa articulan semilleros y proyectos con comunidades wayuu, pescadores y salineros.',
    },
    {
      acento: 'terracota',
      e: '03 · Territorio',
      t: 'Problemas reales, soluciones de código',
      b: 'Cada estudiante participa en al menos un proyecto con aliado externo: alcaldía, gremio, ONG o empresa regional.',
    },
  ]

  return (
    <section className="section">
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="inicio-eyebrow">Qué te llevas de aquí</div>
            <h2>Un ingeniero con criterio técnico <em style={{ color: 'var(--doc-hero-acento)', fontStyle: 'normal' }}>y arraigo territorial.</em></h2>
          </div>
          <p className="desc">No formamos programadores genéricos. Formamos ingenieros que saben leer un problema del Caribe y resolverlo con la mejor herramienta.</p>
        </div>

        <div className="grid-3">
          {tarjetas.map(c => (
            <article key={c.e} className="doc-card">
              <div className={'doc-card__acento doc-card__acento--' + c.acento} />
              <div className="doc-card__cuerpo">
                <div className="inicio-eyebrow">{c.e}</div>
                <h3 className="doc-card__titulo" style={{ fontSize: 20 }}>{c.t}</h3>
                <p className="doc-card__texto">{c.b}</p>
                <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                  <WayuuGlyph size={36} color="var(--accent)" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Acreditación ─────────────────────────────────────────────── */

function CNAPreview() {
  const nav = useNavigate()
  const { data } = useData()
  const factores = data.factores ?? []
  const prom = factores.length ? factores.reduce((a, f) => a + f.score, 0) / factores.length : 0
  const pleno = factores.filter(f => statusFromScore(f.score) === 'pleno').length
  const alto  = factores.filter(f => statusFromScore(f.score) === 'alto').length
  const dev   = factores.filter(f => statusFromScore(f.score) === 'aceptable').length

  return (
    <section className="section section--papel">
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="inicio-eyebrow" style={{ color: 'var(--doc-terracota-texto)' }}>● Autoevaluación 2025 · Radicado ante el CNA</div>
            <h2>Acreditación CNA — doce factores, una carrera.</h2>
          </div>
          <p className="desc">Tablero interactivo con las 12 dimensiones del CNA, evidencias documentales, plan de mejoramiento y cronograma del proceso.</p>
        </div>

        <div className="inicio-cna-preview">
          <div className="inicio-cna">
            {factores.length > 0
              ? factores.map(f => (
                  <button key={f.n} className="inicio-cna__factor"
                          style={{ '--tono': STATUS_COLOR[statusFromScore(f.score)] }}
                          onClick={() => nav(`/acreditacion?factor=${f.n}`)}
                          aria-label={`Factor ${f.n}: ${f.t}. Ver el detalle`} title={f.t}>
                    <img className="inicio-cna__img" src={imagenFactor(f.n)} alt="" loading="lazy" />
                    <span className="inicio-cna__n">{f.n}</span>
                  </button>
                ))
              : Array.from({ length: 12 }).map((_, i) => <div key={i} className="inicio-cna__hueco" />)}
          </div>

          <div>
            <div className="inicio-cna__promedio">{prom.toFixed(1)}</div>
            <div className="inicio-eyebrow" style={{ fontSize: 11, marginTop: 6, marginBottom: 20 }}>
              Promedio · Escala 0–100
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {pleno > 0 && <span className="doc-pin doc-pin--azul">Se cumple plenamente · {pleno}</span>}
              {alto  > 0 && <span className="doc-pin doc-pin--ambar">Se cumple en alto grado · {alto}</span>}
              {dev   > 0 && <span className="doc-pin doc-pin--terracota">Se cumple aceptablemente · {dev}</span>}
            </div>
            <button className="btn" onClick={() => nav('/acreditacion')}>Ir al tablero CNA <Icons.arrow /></button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Funciones misionales ─────────────────────────────────────── */

/* Estas cuatro conservan su bloque de color entero: son la nota de marca de
   la portada y lo que la distingue de una página de consulta. */
function Missions() {
  const nav = useNavigate()
  const { data } = useData()
  const grupos = (data.grupos ?? []).length
  const semilleros = (data.semilleros ?? []).length
  const abiertas = (data.convocatorias ?? []).filter(c => (c.estado ?? 'Abierta') === 'Abierta' && !c.vencida).length

  const items = [
    { c: '#62a9b6', t: 'Investigación', l: '/investigacion', label: 'Azul mar',
      d: grupos
        ? `${grupos} grupos reconocidos, ${semilleros} semilleros y producción indexada con impacto territorial.`
        : 'Grupos, semilleros y producción indexada con impacto territorial.' },
    { c: '#e2a542', t: 'Extensión y Proyección Social', l: '/extension', label: 'Amarillo desierto',
      d: 'Convenios con comunidades wayuu, alcaldías y sector TIC del Caribe colombiano.' },
    { c: '#cc5e50', t: 'Internacionalización', l: '/internacionalizacion', label: 'Rosado flamingo',
      d: 'Movilidad entrante y saliente, cooperación académica y currículo internacionalizado.' },
    { c: '#1a2744', t: 'Tablero de Convocatorias', l: '/convocatorias', label: 'Azul marino',
      d: abiertas
        ? `${abiertas} ${abiertas === 1 ? 'convocatoria abierta' : 'convocatorias abiertas'} de investigación, extensión, movilidad y estudiantes.`
        : 'Oportunidades de investigación, extensión, movilidad y estudiantes.' },
  ]

  return (
    <section className="section">
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="inicio-eyebrow">Funciones misionales</div>
            <h2>Cuatro columnas que sostienen la carrera.</h2>
          </div>
        </div>
        <div className="grid-4">
          {items.map((it, i) => (
            <button key={it.t} onClick={() => nav(it.l)} className="inicio-mision"
                    style={{ '--mision-fondo': it.c, '--mision-tinta': it.c === '#1a2744' ? '#fff' : 'var(--ug-negro)' }}>
              <div className="inicio-mision__etiqueta">0{i + 1} · {it.label}</div>
              <h3 className="inicio-mision__titulo">{it.t}</h3>
              <p className="inicio-mision__texto">{it.d}</p>
              <div className="inicio-mision__mas">Ver más <Icons.arrow /></div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Convocatorias abiertas ───────────────────────────────────── */

function Convocatorias() {
  const nav = useNavigate()
  const { data } = useData()
  /* Estaba filtrando por `c.s`, `c.t` y `c.d`, campos que no existen en los
     datos: el tablero de la portada salía siempre vacío. Los nombres reales
     son estado, titulo y fecha_cierre. Se descartan además las que ya
     vencieron aunque nadie haya cambiado su estado a mano. */
  const convos = (data.convocatorias ?? [])
    .filter(c => (c.estado ?? 'Abierta') === 'Abierta' && !c.vencida)
    .slice(0, 4)

  if (convos.length === 0) return null

  return (
    <section className="section section--tinte">
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="inicio-eyebrow">Tablero de convocatorias</div>
            <h2>Oportunidades abiertas ahora.</h2>
          </div>
          <p className="desc">Movilidad, investigación, extensión y opciones para estudiantes.</p>
        </div>

        <div className="doc-grid doc-grid--ancha">
          {convos.map(c => (
            <article key={c.id} className="doc-card" style={{ background: 'var(--paper)' }}>
              <div className="doc-card__acento doc-card__acento--azul" />
              <div className="doc-card__cuerpo">
                <div className="doc-card__etiquetas">
                  <span className="doc-pin doc-pin--neutro">{c.categoria}</span>
                  <span className="doc-pin doc-pin--azul">{c.estado}</span>
                </div>
                <h3 className="doc-card__titulo">{c.titulo}</h3>
                {c.descripcion && <p className="doc-card__texto">{c.descripcion}</p>}
                <div className="doc-card__pie">
                  <span className="doc-card__dato">Cierra {fechaLarga(c.fecha_cierre)}</span>
                  <button className="doc-boton" onClick={() => nav('/convocatorias')}>
                    Ver <Icons.arrow />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const { data } = useData()
  const titulares = titularesDe(data)

  return (
    <div className="page-in">
      <div className="inicio-remate" aria-hidden="true" />
      <Hero />
      <Ticker items={titulares} />
      <Features />
      <CNAPreview />
      <Missions />
      <Convocatorias />
    </div>
  )
}
