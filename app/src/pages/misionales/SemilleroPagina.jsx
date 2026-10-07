/* Página propia de un semillero: /investigacion/semillero/:slug.
 *
 * Nace para Alfacode, que llegó con una relación de competencias ganadas, pero
 * sirve para cualquier semillero que tenga slug (migración 033). Pide su ficha
 * por su cuenta, como la página de una publicación: el enlace se comparte
 * suelto y tiene que funcionar sin haber pasado por /investigacion.
 *
 * Todo lo que muestra se cuenta de los logros cargados: si mañana se añade
 * otro primer lugar, la cifra del encabezado cambia sola.
 */
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Icons } from '../../components/Icons'
import Portal from '../../components/Portal'
import TramaMarca from '../../components/TramaMarca'
import { useData, apiSemilleroPagina } from '../../context/DataContext'

const ETIQUETA_SEDE = { riohacha: 'Riohacha', maicao: 'Maicao', ambas: 'Riohacha y Maicao' }

/* Medalla según el puesto: oro, plata y bronce; del cuarto en adelante, una
   mención con el número del puesto. */
function medallaDe(puesto) {
  if (puesto === 1) return { clase: 'oro', texto: '1.º' }
  if (puesto === 2) return { clase: 'plata', texto: '2.º' }
  if (puesto === 3) return { clase: 'bronce', texto: '3.º' }
  if (puesto) return { clase: 'mencion', texto: puesto + '.º' }
  return { clase: 'mencion', texto: '★' }
}

/* Nombre y primer apellido: "Darwin David Pérez Muñoz" -> "DP". Con dos
   palabras, las dos; con cuatro o más se asume nombre compuesto. */
const iniciales = nombre => {
  const p = String(nombre ?? '').split(/\s+/).filter(Boolean)
  return ((p[0]?.[0] ?? '') + (p[p.length >= 4 ? 2 : 1]?.[0] ?? '')).toUpperCase()
}

const clave = s => String(s ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()

function Trofeo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M17 6h2.5a1.5 1.5 0 0 1 1.5 1.5v.5a4 4 0 0 1-4 4M7 6H4.5A1.5 1.5 0 0 0 3 7.5V8a4 4 0 0 0 4 4" />
    </svg>
  )
}

/* Visor a pantalla completa, compartido por la galería y por las miniaturas
   de cada logro: recorre todas las fotos del semillero. */
function Visor({ fotos, logros, indice, setIndice }) {
  const nombreLogro = id => logros.find(l => l.id === id)?.nombre
  useEffect(() => {
    if (indice === null) return
    const tecla = e => {
      if (e.key === 'Escape') setIndice(null)
      if (e.key === 'ArrowRight') setIndice(i => (i + 1) % fotos.length)
      if (e.key === 'ArrowLeft') setIndice(i => (i - 1 + fotos.length) % fotos.length)
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [indice, fotos.length, setIndice])

  const foto = indice !== null ? fotos[indice] : null
  if (!foto) return null
  const pie = foto.pie || nombreLogro(foto.logro_id)
  return (
    <Portal>
      <div className="semp-visor" role="dialog" aria-modal="true" onClick={() => setIndice(null)}>
        <figure className="semp-visor__marco" onClick={e => e.stopPropagation()}>
          <img src={foto.url} alt={foto.pie || ''} />
          <figcaption>
            {pie}
            {fotos.length > 1 && <span className="semp-visor__cuenta">{indice + 1} / {fotos.length}</span>}
          </figcaption>
        </figure>
        <button type="button" className="semp-visor__cerrar" onClick={() => setIndice(null)} aria-label="Cerrar"><Icons.close /></button>
        {fotos.length > 1 && (
          <>
            <button type="button" className="semp-visor__flecha semp-visor__flecha--atras" aria-label="Anterior"
                    onClick={e => { e.stopPropagation(); setIndice(i => (i - 1 + fotos.length) % fotos.length) }}><Icons.arrow /></button>
            <button type="button" className="semp-visor__flecha" aria-label="Siguiente"
                    onClick={e => { e.stopPropagation(); setIndice(i => (i + 1) % fotos.length) }}><Icons.arrow /></button>
          </>
        )}
      </div>
    </Portal>
  )
}

/* Mosaico: la primera foto grande y el resto alrededor, para que la galería
   no sea una rejilla de cuadros iguales. */
function Galeria({ fotos, logros, abrir }) {
  const nombreLogro = id => logros.find(l => l.id === id)?.nombre
  return (
    <div className="semp-galeria">
      {fotos.map((f, i) => (
        <button key={f.id} type="button" className="semp-galeria__item" onClick={() => abrir(i)}
                aria-label={'Ampliar foto' + (f.pie ? ': ' + f.pie : '')}>
          <img src={f.url} alt={f.pie || ''} loading="lazy" />
          {(f.pie || nombreLogro(f.logro_id)) && (
            <span className="semp-galeria__pie">{f.pie || nombreLogro(f.logro_id)}</span>
          )}
        </button>
      ))}
    </div>
  )
}

export default function SemilleroPagina() {
  const { slug } = useParams()
  const { data } = useData()
  const [s, setS] = useState(null)
  const [error, setError] = useState('')
  const [visor, setVisor] = useState(null)

  useEffect(() => {
    let vivo = true
    setS(null); setError('')
    apiSemilleroPagina(slug)
      .then(x => { if (vivo) setS(x) })
      .catch(e => { if (vivo) setError(e.message) })
    return () => { vivo = false }
  }, [slug])

  if (error) {
    return (
      <section className="section">
        <div className="inner">
          <p style={{ color: 'var(--ink-3)' }}>{error}</p>
          <Link className="btn ghost" to="/investigacion" style={{ marginTop: 16 }}>Volver a Investigación</Link>
        </div>
      </section>
    )
  }
  if (!s) return <section className="section"><div className="inner" style={{ color: 'var(--ink-3)' }}>Cargando…</div></section>

  const logros = s.logros ?? []
  const fotos = s.fotos ?? []
  const fotosDe = id => fotos.filter(f => f.logro_id === id)

  /* Cifras del encabezado, contadas de los logros. */
  const primeros = logros.filter(l => l.puesto === 1).length
  const podios = logros.filter(l => l.puesto && l.puesto <= 3).length
  const estudiantes = new Map()
  for (const l of logros) for (const p of l.participantes) {
    const k = clave(p)
    if (!estudiantes.has(k)) estudiantes.set(k, { nombre: p, veces: 0 })
    estudiantes.get(k).veces++
  }
  const equipo = [...estudiantes.values()].sort((a, b) => b.veces - a.veces || a.nombre.localeCompare(b.nombre))
  const internacionales = logros.filter(l => /internacional/i.test(l.alcance)).length

  const cifras = [
    { n: logros.length, l: logros.length === 1 ? 'competencia' : 'competencias' },
    { n: primeros, l: primeros === 1 ? 'primer lugar' : 'primeros lugares', oro: true },
    { n: podios, l: 'veces en el podio' },
    { n: equipo.length, l: 'estudiantes en competencia' },
  ].filter(c => c.n > 0)

  /* El correo del coordinador sale del directorio de docentes, si está. */
  const coordinador = (data.docentes ?? []).find(d => clave(d.nombre) === clave(s.lider))

  return (
    <div className="page-in">
      <header className="semp-hero">
        <TramaMarca blanco escala={118} opacidad={0.1} />
        <div className="semp-hero__brillo" aria-hidden="true" />
        <div className="inner">
          <nav className="semp-miga" aria-label="Ruta de navegación">
            <Link to="/investigacion">Investigación</Link>
            <span aria-hidden="true">/</span>
            <Link to="/investigacion?seccion=semilleros">Semilleros</Link>
            <span aria-hidden="true">/</span>
            <span>{s.nombre}</span>
          </nav>

          <div className="semp-hero__eyebrow">
            Semillero de investigación{s.grupo ? ` · Grupo ${s.grupo}` : ''}
          </div>
          <h1 className="semp-hero__titulo">{s.nombre}</h1>
          {logros.length > 0 && (
            <p className="semp-hero__lema">
              Hackatones, retos y competencias de desarrollo de software: lo que el semillero ha
              ganado fuera del aula.
            </p>
          )}
          <div className="semp-hero__chips">
            <span><Icons.ubicacion /> Sede {ETIQUETA_SEDE[s.sede] ?? s.sede}</span>
            {s.lider && <span><Icons.usuario /> Coordinador: {s.lider}</span>}
          </div>

          {cifras.length > 0 && (
            <dl className="semp-cifras">
              {cifras.map(c => (
                <div key={c.l} className={c.oro ? 'is-oro' : undefined}>
                  <dt>{c.n}</dt><dd>{c.l}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </header>

      {logros.length > 0 && (
        <section className="section">
          <div className="inner">
            <div className="section-head">
              <div className="title">
                <div className="eyebrow">Palmarés</div>
                <h2>{internacionales > 0 ? 'De La Guajira a competir con Latinoamérica.' : 'Lo que el semillero ha ganado.'}</h2>
              </div>
              <p className="desc">
                Cada competencia, con el puesto obtenido, dónde fue y quiénes representaron al
                semillero.
              </p>
            </div>

            <ol className="semp-palmares">
              {logros.map(l => {
                const m = medallaDe(l.puesto)
                return (
                  <li key={l.id} className={'semp-logro semp-logro--' + m.clase}>
                    <div className="semp-logro__medalla" aria-hidden="true">
                      <span>{m.texto}</span>
                    </div>
                    <div className="semp-logro__cuerpo">
                      {fotosDe(l.id).length > 0 && (
                        <div className="semp-logro__fotos">
                          {fotosDe(l.id).map(f => (
                            <button key={f.id} type="button" onClick={() => setVisor(fotos.indexOf(f))}
                                    aria-label={'Ver foto: ' + (f.pie || l.nombre)}>
                              <img src={f.url} alt="" loading="lazy" />
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="semp-logro__resultado"><Trofeo size={16} /> {l.resultado}</div>
                      <h3 className="semp-logro__nombre">{l.nombre}</h3>
                      <div className="semp-logro__chips">
                        {l.tipo && <span>{l.tipo}</span>}
                        {l.alcance && <span>{l.alcance}</span>}
                        {l.lugar && <span><Icons.ubicacion /> {l.lugar}</span>}
                      </div>
                      {l.descripcion && <p className="semp-logro__texto">{l.descripcion}</p>}
                      {l.participantes.length > 0 && (
                        <div className="semp-logro__equipo">
                          <span className="semp-logro__rotulo">{l.participantes.length === 1 ? 'Participante' : 'Equipo'}</span>
                          <ul>
                            {l.participantes.map(p => (
                              <li key={p}><span className="semp-avatar" aria-hidden="true">{iniciales(p)}</span>{p}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        </section>
      )}

      {fotos.length > 0 && (
        <section className="section section--papel">
          <div className="inner">
            <div className="section-head">
              <div className="title">
                <div className="eyebrow">Galería</div>
                <h2>En competencia.</h2>
              </div>
            </div>
            <Galeria fotos={fotos} logros={logros} abrir={setVisor} />
          </div>
        </section>
      )}

      {equipo.length > 0 && (
        <section className={'section' + (fotos.length > 0 ? '' : ' section--papel')}>
          <div className="inner">
            <div className="section-head">
              <div className="title">
                <div className="eyebrow">Quiénes han competido</div>
                <h2>El equipo detrás de los resultados.</h2>
              </div>
            </div>
            <ul className="semp-equipo">
              {equipo.map(p => (
                <li key={p.nombre}>
                  <span className="semp-avatar semp-avatar--grande" aria-hidden="true">{iniciales(p.nombre)}</span>
                  <span className="semp-equipo__nombre">{p.nombre}</span>
                  <span className="semp-equipo__veces">{p.veces} {p.veces === 1 ? 'competencia' : 'competencias'}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <Visor fotos={fotos} logros={logros} indice={visor} setIndice={setVisor} />

      <section className="section">
        <div className="inner">
          <div className="semp-unete">
            <div>
              <div className="semp-unete__eyebrow">¿Te interesa?</div>
              <h2 className="semp-unete__titulo">Únete a {s.nombre}.</h2>
              <p className="semp-unete__texto">
                El semillero está abierto a estudiantes del programa. Escríbele al coordinador
                para conocer cómo vincularte.
              </p>
            </div>
            <div className="semp-unete__acciones">
              {coordinador?.email && (
                <a className="btn accent" href={'mailto:' + coordinador.email}>
                  <Icons.mail /> Escribir a {s.lider.split(' ')[0]}
                </a>
              )}
              <Link className="btn ghost" to="/investigacion?seccion=semilleros">Ver todos los semilleros</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
