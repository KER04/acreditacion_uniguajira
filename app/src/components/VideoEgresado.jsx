import { useEffect, useRef, useState } from 'react'
import { Icons } from './Icons'

/* Vídeo de fondo de la tarjeta destacada, servido como FACHADA.
 *
 * El problema de un vídeo de fondo es el peso. Tres decisiones lo resuelven:
 *
 *  1. El binario no está en nuestra base. Se guarda el identificador de
 *     YouTube (11 caracteres) o la URL de un MP4 externo. Meter un MP4 en la
 *     tabla `archivos`, que codifica en base64, serían decenas de MB por fila
 *     viajando por memoria en cada lectura.
 *  2. Lo primero que se pinta es una imagen, no un reproductor. El iframe de
 *     YouTube arrastra cerca de un megabyte de JavaScript: montarlo en la
 *     carga inicial castigaría a todo el que entra a la página aunque nunca
 *     mire el vídeo. La miniatura de YouTube no nos cuesta almacenamiento.
 *  3. El reproductor se monta solo cuando la tarjeta entra en pantalla, y se
 *     desmonta al salir. Así deja de descargar y de consumir CPU en cuanto
 *     el visitante sigue bajando.
 *
 * SOBRE EL SONIDO: el vídeo arranca en silencio y no es una preferencia
 * nuestra, es la única forma de que arranque. Chrome, Safari y Firefox
 * bloquean toda reproducción automática con audio mientras el visitante no
 * haya interactuado con la página; un vídeo con sonido puesto de salida
 * sencillamente no se reproduciría y la tarjeta se quedaría en el póster. Por
 * eso el botón de sonido es visible desde el primer momento: ese clic es el
 * gesto que el navegador exige. La elección se recuerda mientras dure la
 * visita, así que bajar y volver a subir no vuelve a silenciarlo.
 *
 * Con `prefers-reduced-motion` no arranca nada solo: se queda el póster con su
 * botón de reproducir.
 */

/* maxresdefault no existe para todos los vídeos; hqdefault sí. Se cae de uno
   al otro en lugar de dejar el hueco vacío. */
function respaldoMiniatura(e, videoYoutube) {
  const img = e.currentTarget
  if (img.dataset.respaldo || !videoYoutube) return
  img.dataset.respaldo = '1'
  img.src = 'https://i.ytimg.com/vi/' + videoYoutube + '/hqdefault.jpg'
}

export default function VideoEgresado({
  videoYoutube = '',
  videoUrl = '',
  posterUrl = '',
  titulo = '',
  children,
  className = '',
  style,
  /* Avisos hacia arriba. El carrusel que rota las portadas los necesita para
     no pasar de tarjeta mientras alguien está escuchando el testimonio, ni
     seguir rotando cuando la sección ni siquiera está en pantalla. */
  onVisibilidad,
  onSonido,
}) {
  const marco = useRef(null)
  const iframe = useRef(null)
  const medio = useRef(null)
  const [visible, setVisible] = useState(false)
  const [reproduciendo, setReproduciendo] = useState(false)
  const [silenciado, setSilenciado] = useState(true)
  const hayVideo = Boolean(videoYoutube || videoUrl)

  /* Preferencia del sistema, leída una vez y escuchada por si cambia. */
  const [menosMovimiento, setMenosMovimiento] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const aplicar = () => setMenosMovimiento(mq.matches)
    aplicar()
    mq.addEventListener('change', aplicar)
    return () => mq.removeEventListener('change', aplicar)
  }, [])

  /* Entrar en pantalla monta el reproductor; salir lo desmonta. El umbral de
     0.35 evita que se dispare cuando solo asoma un borde al hacer scroll. */
  useEffect(() => {
    const nodo = marco.current
    if (!nodo || !hayVideo) return
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return }

    const obs = new IntersectionObserver(
      ([entrada]) => setVisible(entrada.isIntersecting),
      { threshold: 0.35 },
    )
    obs.observe(nodo)
    return () => obs.disconnect()
  }, [hayVideo])

  useEffect(() => { onVisibilidad?.(visible) }, [visible, onVisibilidad])

  /* Con movimiento reducido solo se reproduce si lo piden a mano. */
  const activo = hayVideo && visible && (!menosMovimiento || reproduciendo)

  /* Se le habla al reproductor de YouTube por postMessage en vez de recargar
     el iframe con otra URL: recargar reiniciaría el vídeo desde el segundo
     cero cada vez que se toca el botón. El protocolo va en el propio embed
     gracias a enablejsapi=1, sin cargar la librería de la IFrame API. */
  const mandarAYoutube = (orden, ...args) => {
    iframe.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: orden, args }),
      'https://www.youtube-nocookie.com',
    )
  }

  const alternarSonido = () => {
    const siguiente = !silenciado
    setSilenciado(siguiente)
    if (videoYoutube) {
      mandarAYoutube(siguiente ? 'mute' : 'unMute')
      // Volumen explícito: si el vídeo venía de una sesión con el volumen a
      // cero, quitar el silencio por sí solo no se oiría.
      if (!siguiente) mandarAYoutube('setVolume', 60)
    } else if (medio.current) {
      medio.current.muted = siguiente
    }
    if (menosMovimiento && !reproduciendo) setReproduciendo(true)
    onSonido?.(!siguiente)
  }

  /* El iframe se remonta cada vez que la tarjeta vuelve a entrar en pantalla,
     y nace en silencio. Si el visitante ya había pedido sonido, se le devuelve
     en cuanto el reproductor está listo. */
  const alCargarIframe = () => {
    if (silenciado) return
    mandarAYoutube('unMute')
    mandarAYoutube('setVolume', 60)
  }

  /* mute=1 es lo que permite el arranque automático; sin él los navegadores lo
     bloquean. playlist=<id> es el truco documentado para que loop funcione en
     un vídeo suelto. youtube-nocookie evita la cookie de seguimiento. */
  const src = videoYoutube
    ? 'https://www.youtube-nocookie.com/embed/' + videoYoutube +
      '?autoplay=1&mute=1&loop=1&playlist=' + videoYoutube +
      '&controls=0&modestbranding=1&rel=0&playsinline=1&disablekb=1&enablejsapi=1'
    : ''

  return (
    <div ref={marco} className={'video-eg ' + className} style={style}>
      {posterUrl && (
        <img
          className="video-eg__poster"
          src={posterUrl}
          alt={titulo ? 'Fotograma del testimonio de ' + titulo : ''}
          loading="lazy"
          onError={e => respaldoMiniatura(e, videoYoutube)}
          aria-hidden={titulo ? undefined : 'true'}
        />
      )}

      {activo && (videoYoutube ? (
        <iframe
          ref={iframe}
          className="video-eg__medio"
          src={src}
          title={titulo ? 'Testimonio de ' + titulo : 'Testimonio de egresado'}
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          frameBorder="0"
          onLoad={alCargarIframe}
          tabIndex={-1}
        />
      ) : (
        <video
          ref={medio}
          className="video-eg__medio"
          src={videoUrl}
          poster={posterUrl || undefined}
          muted={silenciado}
          loop
          playsInline
          autoPlay
          /* none: el binario no se toca hasta que la tarjeta se ve. */
          preload="none"
        />
      ))}

      {/* Velo permanente: el texto va encima y tiene que leerse sobre
          cualquier fotograma, claro u oscuro. */}
      <div className="video-eg__velo" />

      {children}

      {hayVideo && menosMovimiento && !reproduciendo && (
        <button className="video-eg__play" onClick={() => setReproduciendo(true)}
                aria-label={'Reproducir el testimonio' + (titulo ? ' de ' + titulo : '')}>
          <Icons.play />
        </button>
      )}

      {hayVideo && (
        <div className="video-eg__barra">
          <button className="video-eg__sonido" onClick={alternarSonido}
                  aria-pressed={!silenciado}
                  aria-label={silenciado ? 'Activar el sonido del testimonio' : 'Silenciar el testimonio'}>
            {silenciado ? <Icons.mudo /> : <Icons.altavoz />}
            <span>{silenciado ? 'Activar sonido' : 'Silenciar'}</span>
          </button>

          {videoYoutube && (
            <a className="video-eg__fuente"
               href={'https://www.youtube.com/watch?v=' + videoYoutube}
               target="_blank" rel="noopener noreferrer">
              Ver en YouTube <Icons.external />
            </a>
          )}
        </div>
      )}
    </div>
  )
}
