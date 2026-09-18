import { Icons } from './Icons'

/* Retrato circular de una persona del sitio: foto si la hay, silueta genérica
   si no. Lo usan el cuadro de honor y la red de egresados.
 *
 * Antes cada página resolvía el hueco sin foto con las iniciales del nombre, y
 * cada quien ocupaba un ancho distinto según tuviera una o dos: el listado se
 * veía desparejo. La silueta es siempre la misma y ocupa exactamente lo que
 * ocuparía una fotografía.
 *
 * `persona` solo necesita `nombre` y `foto_url`, así que sirve igual para una
 * fila de cuadro_honor que para una de egresado. */
export default function Retrato({ persona, size, borde, grosorBorde = 2, className = '', style }) {
  const base = {
    width: size, height: size, borderRadius: 999, flex: 'none',
    objectFit: 'cover',
    border: borde ? grosorBorde + 'px solid ' + borde : undefined,
    ...style,
  }

  if (persona.foto_url) {
    return (
      <img className={className} src={persona.foto_url} alt={'Foto de ' + persona.nombre}
           loading="lazy" style={base} />
    )
  }

  return (
    <div className={className} role="img" aria-label={'Sin fotografía de ' + persona.nombre} style={{
      ...base, display: 'grid', placeItems: 'center',
      background: 'var(--ug-azul-soft)', color: 'var(--ug-azul-deep)',
    }}>
      <Icons.usuario size={Math.round(size * 0.56)} />
    </div>
  )
}
