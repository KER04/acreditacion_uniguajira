/* Carrusel del hero de la portada: noticias publicadas y proyectos de
   extensión y proyección social, intercalados, en la misma tarjeta que antes
   ocupaba el «proyecto destacado».

   Todas las diapositivas se apilan en la misma celda de una rejilla, así la
   tarjeta toma la altura de la más larga y no salta al cambiar. Solo la
   activa es visible e interactiva (las demás llevan `inert`).

   Avanza solo cada AUTOPLAY_MS, salvo con «reducir movimiento»; se detiene
   mientras el puntero o el foco están dentro. En pantallas táctiles se puede
   deslizar. */
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { WayuuBackdrop } from './WayuuPatterns'
import { fechaLarga } from '../../shared/validacion'

const AUTOPLAY_MS = 6000
const MAX_POR_TIPO = 5
const UMBRAL_DESLIZ = 45

function diapositivasDe(data) {
  const noticias = (data.noticias ?? [])
    .filter(n => n.publicada !== false && n.titulo)
    .sort((a, b) => String(b.fecha ?? '').localeCompare(String(a.fecha ?? '')))
    .slice(0, MAX_POR_TIPO)
    .map(n => ({
      key: 'n' + n.id,
      tipo: 'Noticia',
      etiqueta: n.categoria,
      titulo: n.titulo,
      resumen: n.resumen,
      imagen: n.imagen_url || '',
      marca: n.categoria || 'Noticias',
      meta: n.fecha ? fechaLarga(n.fecha) : '',
      to: '/noticias',
    }))

  const proyectos = (data.proyectos_extension ?? [])
    .filter(p => p.titulo)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    .slice(0, MAX_POR_TIPO)
    .map(p => ({
      key: 'p' + p.id,
      tipo: 'Extensión y proyección social',
      etiqueta: p.estado,
      titulo: p.titulo,
      resumen: p.descripcion,
      imagen: p.imagen_url || '',
      marca: p.municipio || 'Proyección social',
      meta: [p.comunidad, p.municipio].filter(Boolean).join(' · '),
      to: '/extension',
    }))

  /* Intercaladas: noticia, proyecto, noticia… para que no pasen cinco
     noticias seguidas antes del primer proyecto. */
  const out = []
  for (let i = 0; i < Math.max(noticias.length, proyectos.length); i++) {
    if (noticias[i]) out.push(noticias[i])
    if (proyectos[i]) out.push(proyectos[i])
  }
  return out
}

const sinMovimiento = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export function hayDiapositivas(data) {
  return diapositivasDe(data).length > 0
}

export default function CarruselPortada({ data }) {
  const items = diapositivasDe(data)
  const total = items.length
  const [actual, setActual] = useState(0)
  const [pausa, setPausa] = useState(false)
  const inicioX = useRef(null)
  const deslizo = useRef(false)

  const ir = useCallback(i => setActual(((i % total) + total) % total), [total])

  // Si cambia el número de diapositivas (llegan los datos de la API), no
  // quedarse apuntando a una que ya no existe.
  useEffect(() => { if (actual >= total) setActual(0) }, [total, actual])

  useEffect(() => {
    if (pausa || total < 2 || sinMovimiento()) return
    const t = setTimeout(() => ir(actual + 1), AUTOPLAY_MS)
    return () => clearTimeout(t)
  }, [actual, pausa, total, ir])

  if (!total) return null

  const onKeyDown = e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); ir(actual + 1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); ir(actual - 1) }
  }
  const onPointerDown = e => { if (e.pointerType !== 'mouse') inicioX.current = e.clientX }
  const onPointerUp = e => {
    if (inicioX.current === null) return
    const dx = e.clientX - inicioX.current
    inicioX.current = null
    if (Math.abs(dx) > UMBRAL_DESLIZ) { deslizo.current = true; ir(actual + (dx < 0 ? 1 : -1)) }
  }
  // Un deslizamiento termina en clic: se anula para no abrir el enlace.
  const onClickCapture = e => { if (deslizo.current) { e.preventDefault(); deslizo.current = false } }

  const item = items[actual]

  return (
    <section
      className="inicio-panel carrusel-portada"
      aria-roledescription="carrusel"
      aria-label="Noticias y proyectos de extensión"
      onMouseEnter={() => setPausa(true)}
      onMouseLeave={() => setPausa(false)}
      onFocus={() => setPausa(true)}
      onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setPausa(false) }}
      onKeyDown={onKeyDown}
    >
      <div className="hero-card__patron" aria-hidden="true" />

      <div className="carrusel-portada__pista" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onClickCapture={onClickCapture}
        onPointerCancel={() => { inicioX.current = null }}>
        {items.map((it, i) => (
          <Link
            key={it.key}
            to={it.to}
            className={'inicio-panel__cuerpo carrusel-portada__diapo' + (i === actual ? ' is-activa' : '')}
            aria-roledescription="diapositiva"
            aria-label={`${i + 1} de ${total}: ${it.titulo}`}
            aria-hidden={i !== actual}
            inert={i !== actual ? '' : undefined}
            tabIndex={i === actual ? 0 : -1}
            draggable={false}
          >
            <div className="inicio-eyebrow carrusel-portada__tipo">
              <span>{it.tipo}</span>
              {it.etiqueta && <span className="carrusel-portada__etiqueta">{it.etiqueta}</span>}
            </div>
            <h3 className="inicio-panel__titulo">{it.titulo}</h3>
            {it.resumen && <p className="inicio-panel__resumen carrusel-portada__resumen">{it.resumen}</p>}

            <div className="inicio-panel__lienzo">
              {it.imagen
                ? <img src={it.imagen} alt="" className="carrusel-portada__img" loading="lazy" draggable={false} />
                : <>
                    <WayuuBackdrop variant="a" />
                    <div className="inicio-panel__marca">{it.marca}</div>
                  </>}
            </div>
            {it.meta && <div className="carrusel-portada__meta">{it.meta}</div>}
          </Link>
        ))}
      </div>

      <div className="inicio-panel__pie carrusel-portada__pie">
        <span className="carrusel-portada__contador" aria-live="polite">
          {item.tipo === 'Noticia' ? 'Noticias' : 'Extensión'} · {actual + 1}/{total}
        </span>
        <div className="carrusel-portada__puntos" role="group" aria-label="Elegir diapositiva">
          {items.map((it, i) => (
            <button key={it.key} type="button"
              className={'carrusel-portada__punto' + (i === actual ? ' is-activo' : '')}
              aria-label={`Ir a la diapositiva ${i + 1}`} aria-current={i === actual}
              onClick={() => ir(i)} />
          ))}
        </div>
        <div className="carrusel-portada__flechas">
          <button type="button" aria-label="Anterior" onClick={() => ir(actual - 1)}>‹</button>
          <button type="button" aria-label="Siguiente" onClick={() => ir(actual + 1)}>›</button>
        </div>
      </div>
    </section>
  )
}
