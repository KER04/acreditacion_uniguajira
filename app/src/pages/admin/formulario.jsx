/* Motor de formulario del panel.

   Usa exactamente el mismo esquema que valida la API (shared/validacion.js),
   así que el panel nunca deja enviar algo que el servidor vaya a rechazar.

   Vivía dentro de TabEstudiantes; se sacó aquí cuando Docentes necesitó lo
   mismo, para que ambas pestañas se comporten igual y no haya dos copias que
   se vayan separando con el tiempo. */
import { useState } from 'react'
import { Icons } from '../../components/Icons'
import { validar, hayErrores, ESQUEMAS } from '../../../shared/validacion'

export function useFormulario(recurso, vacio, normalizar = x => x) {
  const [valores, setValores] = useState(vacio)
  const [errores, setErrores] = useState({})
  const [tocado, setTocado] = useState({})

  const set = (campo, valor) => {
    const siguiente = { ...valores, [campo]: valor }
    setValores(siguiente)
    // Solo se revalida lo que el usuario ya tocó: no se le grita mientras escribe.
    if (tocado[campo]) setErrores(validar(recurso, normalizar(siguiente)))
  }

  const alSalir = campo => {
    setTocado(t => ({ ...t, [campo]: true }))
    setErrores(validar(recurso, normalizar(valores)))
  }

  const validarTodo = () => {
    const errs = validar(recurso, normalizar(valores))
    setErrores(errs)
    setTocado(Object.fromEntries(Object.keys(ESQUEMAS[recurso]).map(k => [k, true])))
    return !hayErrores(errs)
  }

  const reiniciar = (nuevos = vacio) => { setValores(nuevos); setErrores({}); setTocado({}) }
  const error = campo => (tocado[campo] ? errores[campo] : undefined)
  const invalido = hayErrores(errores)

  return { valores, set, alSalir, validarTodo, reiniciar, error, invalido }
}

/* Campo con etiqueta, control y mensaje de error debajo. */
export function Campo({ etiqueta, error, opcional, children, style }) {
  return (
    <div className={'field' + (error ? ' con-error' : '')} style={{ margin: 0, ...style }}>
      <label>
        {etiqueta}
        {opcional && <span style={{ color: 'var(--ink-muted)', fontWeight: 400 }}> (opcional)</span>}
      </label>
      {children}
      {error && <div role="alert" className="mensaje-error">{error}</div>}
    </div>
  )
}

export function Acciones({ editando, onCancelar, bloqueado }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center' }}>
      <button className="btn accent" type="submit" style={{ padding: '8px 20px' }}>
        {editando ? 'Guardar' : 'Agregar'} <Icons.check />
      </button>
      {editando && (
        <button type="button" className="btn ghost" style={{ padding: '8px 16px' }} onClick={onCancelar}>Cancelar</button>
      )}
      {bloqueado && (
        <span style={{ fontSize: 12, color: 'var(--ug-flamingo-deep)' }}>Corrige los campos marcados</span>
      )}
    </div>
  )
}
