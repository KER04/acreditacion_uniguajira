/* Fotos representativas de los países con convenio internacional.
 *
 * Son fotos de Wikimedia Commons con licencia libre, recortadas a 16:9 y
 * guardadas en public/images/paises (1600 px, WebP). Las licencias CC BY y
 * CC BY-SA OBLIGAN a nombrar al autor y la licencia junto a la imagen: por eso
 * cada entrada guarda autor, licencia y enlace, y las vistas los muestran.
 * Consultadas el 2026-09-28.
 *
 * Un país que se agregue después desde el panel y no esté aquí no se queda
 * sin cabecera: `fotoPais` devuelve null y la vista usa el tejido de la marca.
 * Para darle foto basta con añadir su entrada y el archivo.
 */
export const FOTOS_PAISES = {
  'México': { foto: '/images/paises/mexico.webp', lugar: 'Chichén Itzá', autor: 'Daniel Schwen', licencia: 'CC BY-SA 4.0', fuente: 'https://commons.wikimedia.org/wiki/File:Chichen_Itza_3.jpg' },
  'España': { foto: '/images/paises/espana.webp', lugar: 'Alhambra, Granada', autor: 'Jebulon', licencia: 'CC0', fuente: 'https://commons.wikimedia.org/wiki/File:Dawn_Charles_V_Palace_Alhambra_Granada_Andalusia_Spain.jpg' },
  'Brasil': { foto: '/images/paises/brasil.webp', lugar: 'Cristo Redentor, Río de Janeiro', autor: 'Arne Müseler', licencia: 'CC BY-SA 3.0 de', fuente: 'https://commons.wikimedia.org/wiki/File:Christ_the_Redeemer_-_Cristo_Redentor.jpg' },
  'Estados Unidos': { foto: '/images/paises/estados-unidos.webp', lugar: 'Puente Golden Gate, San Francisco', autor: 'Frank Schulenburg', licencia: 'CC BY-SA 4.0', fuente: 'https://commons.wikimedia.org/wiki/File:Golden_Gate_Bridge_as_seen_from_Battery_East.jpg' },
  'Perú': { foto: '/images/paises/peru.webp', lugar: 'Machu Picchu', autor: 'Draceane', licencia: 'CC BY-SA 4.0', fuente: 'https://commons.wikimedia.org/wiki/File:Machu_Picchu,_2023_(012).jpg' },
  'Venezuela': { foto: '/images/paises/venezuela.webp', lugar: 'Salto Ángel, Canaima', autor: 'Diego Delso', licencia: 'CC BY 3.0', fuente: 'https://commons.wikimedia.org/wiki/File:Salto_del_Angel-Canaima-Venezuela18.JPG' },
  'Bolivia': { foto: '/images/paises/bolivia.webp', lugar: 'Salar de Uyuni', autor: 'Christopher Crouzet', licencia: 'CC BY-SA 4.0', fuente: 'https://commons.wikimedia.org/wiki/File:Reflection_on_the_Salar_de_Uyuni,_bolivia.jpg' },
  'Chile': { foto: '/images/paises/chile.webp', lugar: 'Torres del Paine', autor: 'Pedro Szekely', licencia: 'CC BY-SA 2.0', fuente: 'https://commons.wikimedia.org/wiki/File:Cuernos_del_Paine_in_Torres_del_Paine_National_Park.jpg' },
}

/* Normaliza para comparar: el panel puede guardar «Mexico» o «méxico». */
export const normalizarTexto = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()

export function fotoPais(pais) {
  const k = normalizarTexto(pais)
  const hit = Object.entries(FOTOS_PAISES).find(([p]) => normalizarTexto(p) === k)
  return hit ? hit[1] : null
}

/* 'Estados Unidos' -> 'estados-unidos'. Es la ruta de la página del país. */
export const slugPais = pais => normalizarTexto(pais).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/* Agrupa los convenios vigentes por país, del que más tiene al que menos. */
export function agruparPorPais(convenios) {
  const grupos = convenios.reduce((acc, c) => { (acc[c.pais] ??= []).push(c); return acc }, {})
  return Object.entries(grupos)
    .map(([pais, lista]) => ({
      pais, slug: slugPais(pais), convenios: lista,
      intercambio: lista.filter(c => c.intercambio).length,
      foto: fotoPais(pais),
    }))
    .sort((a, b) => b.convenios.length - a.convenios.length || a.pais.localeCompare(b.pais))
}
