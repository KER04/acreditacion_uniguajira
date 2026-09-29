/* Carrusel de países con convenio internacional.
 *
 * Una diapositiva por país, con una foto representativa a sangre y un velo
 * oscuro para que el texto se lea (el mismo montaje que la portada del sitio).
 * Toda la diapositiva lleva a la página del país. Debajo, una tira de mini
 * tarjetas con cada país que llevan al mismo sitio.
 *
 * Avanza solo cada 6 s, pero se detiene mientras el cursor o el foco están
 * dentro, y no avanza nunca con «reducir movimiento»: un carrusel que se mueve
 * mientras alguien intenta leerlo es peor que uno quieto.
 */
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icons } from './Icons'
import TramaMarca from './TramaMarca'

const INTERVALO_MS = 6000

const reduceMovimiento = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function CarruselPaises({ paises }) {
  const [posicion, setPosicion] = useState(0)
  const [pausado, setPausado] = useState(false)
  const raiz = useRef(null)
  const total = paises.length
  const i = total ? Math.min(posicion, total - 1) : 0
  const ir = n => setPosicion((n + total) % total)

  useEffect(() => {
    if (pausado || total < 2 || reduceMovimiento()) return
    const t = setTimeout(() => setPosicion(p => (p + 1) % total), INTERVALO_MS)
    return () => clearTimeout(t)
  }, [i, pausado, total])

  if (!total) return null

  return (
    <div className="carpais">
      <div
        ref={raiz}
        className="carpais__marco"
        role="group"
        aria-roledescription="carrusel"
        aria-label="Países con convenio"
        onMouseEnter={() => setPausado(true)}
        onMouseLeave={() => setPausado(false)}
        onFocus={() => setPausado(true)}
        onBlur={e => { if (!raiz.current?.contains(e.relatedTarget)) setPausado(false) }}
        onKeyDown={e => {
          if (e.key === 'ArrowRight') { e.preventDefault(); ir(i + 1) }
          if (e.key === 'ArrowLeft') { e.preventDefault(); ir(i - 1) }
        }}
      >
        <div className="carpais__pista" style={{ transform: `translateX(-${i * 100}%)` }}>
          {paises.map((p, n) => (
            <Link
              key={p.pais}
              to={`/internacionalizacion/pais/${p.slug}`}
              className="carpais__diapo"
              aria-hidden={n !== i}
              tabIndex={n === i ? 0 : -1}
            >
              {p.foto
                ? <img src={p.foto.foto} alt="" loading={n === 0 ? 'eager' : 'lazy'} />
                : <div className="carpais__sinfoto"><TramaMarca blanco escala={118} opacidad={0.14} /></div>}
              <div className="carpais__texto">
                <div className="carpais__eyebrow">{p.foto?.lugar ?? 'Convenios internacionales'}</div>
                <h3 className="carpais__pais">{p.pais}</h3>
                <p className="carpais__cifras">
                  {p.convenios.length} {p.convenios.length === 1 ? 'convenio' : 'convenios'}
                  {p.intercambio > 0 && ` · ${p.intercambio} ${p.intercambio === 1 ? 'destino' : 'destinos'} de intercambio`}
                </p>
                <span className="carpais__ir">Ver convenios con {p.pais} <Icons.arrow /></span>
              </div>
              {p.foto && (
                <span className="carpais__credito">Foto: {p.foto.autor} · {p.foto.licencia} · Wikimedia Commons</span>
              )}
            </Link>
          ))}
        </div>

        {total > 1 && (
          <>
            <button type="button" className="carpais__flecha carpais__flecha--atras" onClick={() => ir(i - 1)} aria-label="País anterior">
              <Icons.arrow />
            </button>
            <button type="button" className="carpais__flecha" onClick={() => ir(i + 1)} aria-label="País siguiente">
              <Icons.arrow />
            </button>
            <div className="carpais__puntos">
              {paises.map((p, n) => (
                <button key={p.pais} type="button" className={'carpais__punto' + (n === i ? ' is-activo' : '')}
                        onClick={() => ir(n)} aria-label={`Ver ${p.pais}`} aria-current={n === i} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Mini tarjetas: el mismo destino que la diapositiva, sin esperar a
          que el carrusel llegue al país que uno busca. */}
      <nav className="carpais__minis" aria-label="Ir a un país">
        {paises.map((p, n) => (
          <Link key={p.pais} to={`/internacionalizacion/pais/${p.slug}`}
                className={'carpais__mini' + (n === i ? ' is-activa' : '')}
                onMouseEnter={() => ir(n)}>
            <span className="carpais__mini-foto" style={p.foto ? { backgroundImage: `url(${p.foto.foto})` } : undefined} />
            <span className="carpais__mini-texto">
              <b>{p.pais}</b>
              <span>{p.convenios.length} {p.convenios.length === 1 ? 'convenio' : 'convenios'}</span>
            </span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
