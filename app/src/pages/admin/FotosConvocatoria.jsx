/* Afiche y fotos de una convocatoria, en el panel.
 *
 * Dos modos con la misma cara:
 *  - Con `convocatoria` (ya existe en la base): cada cambio va directo a la
 *    API —subir, reordenar, pie, quitar— y se recarga la lista.
 *  - Sin ella (formulario de una convocatoria nueva): las fotos se quedan en
 *    cola con su vista previa y `onCola` se las pasa al formulario, que las
 *    sube en cuanto la base le da un id.
 *
 * La primera foto es el afiche: es la que sale grande en la página pública.
 * Cambiar el afiche es solo mover otra foto al primer lugar. */
import { useEffect, useRef, useState } from 'react'
import { Icons } from '../../components/Icons'
import {
  apiSubirFotosConvocatoria, apiOrdenarFotosConvocatoria,
  apiPieFotoConvocatoria, apiBorrarFotoConvocatoria,
} from '../../context/DataContext'

const LIMITE_MB = 6
const TIPOS = ['image/jpeg', 'image/png', 'image/webp']

/* Revisa en el navegador lo mismo que revisará el servidor, para avisar antes
   de mandar 30 MB que van a volver rechazados. */
export function filtrarImagenes(files) {
  const buenas = [], malas = []
  for (const f of files) {
    if (!TIPOS.includes(f.type)) malas.push(`«${f.name}» no es jpg, png o webp`)
    else if (f.size > LIMITE_MB * 1024 * 1024) malas.push(`«${f.name}» pasa de ${LIMITE_MB} MB`)
    else buenas.push(f)
  }
  return { buenas, malas }
}

function Zona({ onArchivos, subiendo, hayFotos }) {
  const input = useRef(null)
  const [encima, setEncima] = useState(false)
  return (
    <div className={'conv-fotos-zona' + (encima ? ' is-encima' : '')}
         onDragOver={e => { e.preventDefault(); setEncima(true) }}
         onDragLeave={() => setEncima(false)}
         onDrop={e => { e.preventDefault(); setEncima(false); onArchivos([...e.dataTransfer.files]) }}>
      <Icons.camara size={22} />
      <div>
        <b>{subiendo ? 'Subiendo…' : hayFotos ? 'Añadir más fotos' : 'Sube el afiche y las fotos'}</b>
        <span>Arrastra aquí o elige archivos · jpg, png o webp · hasta {LIMITE_MB} MB cada una</span>
      </div>
      <button type="button" className="btn ghost" disabled={subiendo} onClick={() => input.current?.click()}>
        <Icons.upload /> Elegir
      </button>
      <input ref={input} type="file" accept={TIPOS.join(',')} multiple hidden
             onChange={e => { onArchivos([...e.target.files]); e.target.value = '' }} />
    </div>
  )
}

function Miniatura({ foto, i, total, onMover, onAfiche, onPie, onQuitar, ocupado }) {
  const [pie, setPie] = useState(foto.pie ?? '')
  const [confirmar, setConfirmar] = useState(false)
  useEffect(() => setPie(foto.pie ?? ''), [foto.pie])

  return (
    <figure className={'conv-foto-admin' + (i === 0 ? ' is-afiche' : '')}>
      <div className="conv-foto-admin__img">
        <img src={foto.url} alt={pie || 'Foto ' + (i + 1)} />
        {i === 0 && <span className="conv-foto-admin__marca">Afiche</span>}
      </div>
      {onPie && (
        <input className="conv-foto-admin__pie" value={pie} placeholder="Pie de foto (opcional)"
               maxLength={300} disabled={ocupado}
               onChange={e => setPie(e.target.value)}
               onBlur={() => pie !== (foto.pie ?? '') && onPie(pie)} />
      )}
      <div className="conv-foto-admin__acciones">
        <button type="button" className="chip" disabled={ocupado || i === 0} aria-label="Mover a la izquierda"
                onClick={() => onMover(i, i - 1)}>←</button>
        <button type="button" className="chip" disabled={ocupado || i === total - 1} aria-label="Mover a la derecha"
                onClick={() => onMover(i, i + 1)}>→</button>
        {i > 0 && (
          <button type="button" className="chip" disabled={ocupado} onClick={onAfiche}>Usar como afiche</button>
        )}
        {confirmar ? (
          <>
            <button type="button" className="chip conv-foto-admin__quitar" disabled={ocupado}
                    onClick={() => { setConfirmar(false); onQuitar() }}>Sí, quitar</button>
            <button type="button" className="chip" onClick={() => setConfirmar(false)}>No</button>
          </>
        ) : (
          <button type="button" className="chip conv-foto-admin__quitar" disabled={ocupado}
                  aria-label="Quitar foto" onClick={() => setConfirmar(true)}><Icons.trash /></button>
        )}
      </div>
    </figure>
  )
}

export default function FotosConvocatoria({ convocatoria = null, cola = [], onCola, onCambio, setError }) {
  const [ocupado, setOcupado] = useState(false)
  const [avisos, setAvisos] = useState([])

  /* Vistas previas de la cola: se crean y se sueltan con los archivos. */
  const [previas, setPrevias] = useState([])
  useEffect(() => {
    if (convocatoria) return
    const urls = cola.map(f => URL.createObjectURL(f))
    setPrevias(urls)
    return () => urls.forEach(u => URL.revokeObjectURL(u))
  }, [cola, convocatoria])

  const fotos = convocatoria
    ? (convocatoria.fotos ?? [])
    : cola.map((f, i) => ({ id: 'cola-' + i, url: previas[i] ?? '', pie: '' }))

  const correr = async tarea => {
    setOcupado(true)
    try { await tarea(); await onCambio?.() }
    catch (e) { setError?.(e.message) }
    finally { setOcupado(false) }
  }

  const agregar = files => {
    const { buenas, malas } = filtrarImagenes(files)
    setAvisos(malas)
    if (!buenas.length) return
    if (!convocatoria) { onCola([...cola, ...buenas]); return }
    correr(() => apiSubirFotosConvocatoria(convocatoria.id, buenas))
  }

  const mover = (de, a) => {
    if (!convocatoria) {
      const n = [...cola]; const [f] = n.splice(de, 1); n.splice(a, 0, f); onCola(n); return
    }
    const ids = fotos.map(f => f.id)
    const [id] = ids.splice(de, 1); ids.splice(a, 0, id)
    correr(() => apiOrdenarFotosConvocatoria(convocatoria.id, ids))
  }

  const quitar = i => {
    if (!convocatoria) { onCola(cola.filter((_, j) => j !== i)); return }
    correr(() => apiBorrarFotoConvocatoria(fotos[i].id))
  }

  return (
    <div className="conv-fotos-admin">
      {fotos.length > 0 && (
        <div className="conv-fotos-admin__grid">
          {fotos.map((f, i) => (
            <Miniatura key={f.id} foto={f} i={i} total={fotos.length} ocupado={ocupado}
                       onMover={mover} onAfiche={() => mover(i, 0)} onQuitar={() => quitar(i)}
                       onPie={convocatoria ? pie => correr(() => apiPieFotoConvocatoria(f.id, pie)) : null} />
          ))}
        </div>
      )}
      <Zona onArchivos={agregar} subiendo={ocupado} hayFotos={fotos.length > 0} />
      {!convocatoria && cola.length > 0 && (
        <p className="conv-fotos-admin__nota">Se subirán al publicar la convocatoria. Los pies de foto se escriben después, al editarla.</p>
      )}
      {avisos.length > 0 && (
        <ul className="conv-fotos-admin__avisos">{avisos.map((a, i) => <li key={i}>{a}</li>)}</ul>
      )}
    </div>
  )
}
