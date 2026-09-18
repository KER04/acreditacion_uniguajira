/* Selector de año.
 *
 * Un año no es texto libre: escrito a mano entraba "lo que quiera", "3050" o
 * "20189". Como <select> el dato sale correcto por construcción y no hay que
 * confiar en que el validador lo atrape después.
 *
 * `desde` marca el año más antiguo razonable de cada caso (1976 para el año de
 * grado, 1950 para un título de posgrado). La lista va del más reciente al más
 * antiguo porque quien rellena el formulario casi siempre busca un año cercano.
 *
 * `valor` que no esté en el rango se conserva como una opción más: en la base
 * hay años de grado con período ("2018-II") y editarlos no puede convertirlos
 * en blanco sin que nadie se dé cuenta.
 */
export default function SelectorAnio({
  valor = '',
  onChange,
  onBlur,
  desde,
  hasta = new Date().getFullYear() + 1,
  opcional = true,
  id,
}) {
  const anios = []
  for (let a = hasta; a >= desde; a--) anios.push(String(a))

  const actual = valor === null || valor === undefined ? '' : String(valor)
  const heredado = actual !== '' && !anios.includes(actual)

  return (
    <select id={id} value={actual} onChange={e => onChange(e.target.value)} onBlur={onBlur}>
      {(opcional || actual === '') && <option value="">{opcional ? 'Sin especificar' : 'Elige un año'}</option>}
      {heredado && <option value={actual}>{actual}</option>}
      {anios.map(a => <option key={a} value={a}>{a}</option>)}
    </select>
  )
}
