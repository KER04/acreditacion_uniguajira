/* Carrusel informativo: la tira de tarjetas que acompaña al encabezado de una
 * página.
 *
 * Vivía dentro de la propuesta curricular. Cuando Saber Pro quiso el mismo
 * costado, copiarlo habría dejado dos carruseles que se irían separando en
 * cuanto alguien arreglara un detalle en uno solo. El contenido viene de la
 * base (tabla `tarjeta_carrusel`) y se edita en el panel; esto solo lo pinta.
 *
 * Una tarjeta es de una de dos clases:
 *   · con TEXTO, donde la imagen ilustra y el texto cuenta;
 *   · solo IMAGEN, para una infografía ya compuesta, que se muestra entera y
 *     sin recortar. Ahí el título no se pinta: es su descripción para lectores
 *     de pantalla.
 */
import { useState } from 'react'
import { Icons } from './Icons'

export default function CarruselTarjetas({ tarjetas, etiqueta = 'Tarjetas informativas' }) {
  const [posicion, setPosicion] = useState(0)
  const total = tarjetas.length

  /* El índice se recorta contra el número de tarjetas en vez de guardarse tal
     cual: si alguien oculta una desde el panel mientras la página está
     abierta, la pista no se queda desplazada hacia un hueco que ya no existe. */
  const i = total ? Math.min(posicion, total - 1) : 0
  if (!total) return null

  /* El índice da la vuelta en los dos sentidos: el carrusel no tiene extremos
     muertos, así que nunca hace falta deshabilitar un botón. */
  const ir = n => setPosicion((n + total) % total)

  return (
    <div
      className="infocar"
      role="group"
      aria-roledescription="carrusel"
      aria-label={etiqueta}
      onKeyDown={e => {
        if (e.key === 'ArrowRight') { e.preventDefault(); ir(i + 1) }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); ir(i - 1) }
      }}
    >
      {/* Una sola pista que se desplaza: las tarjetas fuera de cuadro siguen en
          el DOM, ocultas al lector de pantalla, para que la transición no tenga
          que montar y desmontar imágenes en cada paso. */}
      <div className="infocar__ventana">
        <div className="infocar__pista" style={{ transform: `translateX(-${i * 100}%)` }}>
          {tarjetas.map((c, n) => (
            <article
              key={c.id}
              className={'infocar__tarjeta'
                + (c.solo_imagen ? ' infocar__tarjeta--imagen' : '')
                + (n === i ? ' is-activa' : '')}
              aria-hidden={n !== i}
              {...(n !== i ? { inert: '' } : {})}
            >
              {c.imagen_url && (
                <div className="infocar__figura">
                  <img src={c.imagen_url} alt={c.solo_imagen ? (c.titulo || '') : ''}
                    loading={n === 0 ? 'eager' : 'lazy'} />
                </div>
              )}
              {!c.solo_imagen && (
                <div className="infocar__cuerpo">
                  <h3 className="infocar__titulo">{c.titulo}</h3>
                  <p className="infocar__texto">{c.texto}</p>
                  {c.pie && <p className="infocar__pie">{c.pie}</p>}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>

      <div className="infocar__controles">
        <div className="infocar__puntos" role="tablist" aria-label="Ir a una tarjeta">
          {tarjetas.map((c, n) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={n === i}
              aria-label={`Tarjeta ${n + 1} de ${total}${c.titulo ? ': ' + c.titulo : ''}`}
              className={'infocar__punto' + (n === i ? ' is-activo' : '')}
              onClick={() => ir(n)}
            />
          ))}
        </div>

        {/* Con una sola tarjeta las flechas no llevan a ninguna parte. */}
        {total > 1 && (
          <div className="infocar__flechas">
            <button className="infocar__flecha infocar__flecha--atras"
              onClick={() => ir(i - 1)} aria-label="Tarjeta anterior">
              <Icons.arrow />
            </button>
            <button className="infocar__flecha"
              onClick={() => ir(i + 1)} aria-label="Tarjeta siguiente">
              <Icons.arrow />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
