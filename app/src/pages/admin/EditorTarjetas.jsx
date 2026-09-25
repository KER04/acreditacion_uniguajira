/* Editor del carrusel informativo de una página.
 *
 * Una sola pieza para todas las secciones que tienen carrusel —la propuesta
 * curricular, Saber Pro y las que vengan—, porque el trabajo es idéntico: unas
 * tarjetas con imagen y texto, en un orden, algunas publicadas y otras no.
 * Tenerlo por duplicado en cada pestaña garantizaba que un arreglo hecho en
 * una no llegara a la otra.
 *
 * Una tarjeta es de una de dos clases y el formulario cambia con ella:
 *   · con TEXTO: título, texto y pie, con la imagen como ilustración;
 *   · solo IMAGEN: se publica la imagen sola —una infografía ya compuesta— y
 *     el título pasa a ser su descripción para lectores de pantalla.
 *
 * La imagen se sube como archivo. No hay dónde escribir una ruta: las rutas a
 * mano solo sirven para lo que ya estaba en /public antes de que esto
 * existiera, y esas se ven pero no se editan.
 */
import { useState, useEffect, useCallback } from 'react'
import {
  apiTarjetas, apiCrearTarjeta, apiEditarTarjeta, apiBorrarTarjeta,
  apiOrdenarTarjetas, apiSubirImagenTarjeta, apiBorrarImagenTarjeta,
} from '../../context/DataContext'
import { Icons } from '../../components/Icons'
import RowActions from './RowActions'
import Plegable from './Plegable'

const TARJETA_VACIA = { titulo: '', texto: '', pie: '', solo_imagen: false }
const BORDE = '1px solid color-mix(in oklab, var(--ink) 8%, transparent)'

const pastilla = activa => ({
  cursor: 'pointer',
  background: activa ? 'var(--ug-azul)' : undefined,
  borderColor: activa ? 'transparent' : undefined,
  color: activa ? 'var(--paper)' : undefined,
})

/* ─── Una tarjeta ya creada ────────────────────────────────────── */

function FilaTarjeta({ tarjeta, primera, ultima, acciones }) {
  const [form, setForm] = useState(tarjeta)
  const [subiendo, setSubiendo] = useState(false)

  useEffect(() => setForm(tarjeta), [tarjeta])

  const campo = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const sucio = ['titulo', 'texto', 'pie'].some(k => (form[k] ?? '') !== (tarjeta[k] ?? ''))
  const soloImagen = tarjeta.solo_imagen

  /* Una imagen subida se guarda sola: el archivo ya viajó al servidor, así que
     dejar el cambio pendiente de un botón solo serviría para perderlo. */
  const subir = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    setSubiendo(true)
    try { await acciones.subirImagen(tarjeta.id, file) } finally {
      setSubiendo(false)
      e.target.value = ''
    }
  }

  /* Pasar a «solo imagen» sin imagen dejaría una tarjeta en blanco publicada.
     La base lo rechaza, pero avisar aquí evita el viaje y el mensaje críptico. */
  const cambiarModo = () => {
    if (!soloImagen && !form.imagen_url) {
      return acciones.avisar('Sube primero una imagen: una tarjeta sin texto no puede quedar vacía')
    }
    acciones.guardar(tarjeta.id, { solo_imagen: !soloImagen })
  }

  return (
    <div style={{ borderBottom: BORDE, padding: '16px 0', opacity: tarjeta.visible ? 1 : .55 }}>
      <div style={{ display: 'grid', gridTemplateColumns: soloImagen ? '260px 1fr auto' : '150px 1fr auto', gap: 16, alignItems: 'start' }}>

        {/* La miniatura imita lo que hace el carrusel: recorta la tarjeta con
            texto y muestra entera la que es solo imagen. */}
        <div>
          <div style={{
            aspectRatio: soloImagen ? undefined : '16 / 10',
            minHeight: soloImagen ? 90 : undefined,
            borderRadius: 8, overflow: 'hidden', background: 'var(--paper-3, var(--paper-2))',
            border: BORDE, display: 'grid', placeItems: 'center',
          }}>
            {form.imagen_url
              ? <img src={form.imagen_url} alt=""
                  style={{ width: '100%', height: soloImagen ? 'auto' : '100%', maxHeight: soloImagen ? 220 : undefined, objectFit: soloImagen ? 'contain' : 'cover', display: 'block' }} />
              : <span style={{ fontSize: 11, color: 'var(--ink-3)', padding: 12 }}>sin imagen</span>}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            <label className="chip" style={{ cursor: subiendo ? 'wait' : 'pointer', fontSize: 11 }}>
              {subiendo ? 'Subiendo…' : form.imagen_url ? 'Cambiar imagen' : 'Subir imagen'}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={subir}
                disabled={subiendo} style={{ display: 'none' }} />
            </label>
            {tarjeta.imagen_id && (
              <button type="button" className="chip" style={{ cursor: 'pointer', fontSize: 11 }}
                onClick={() => acciones.quitarImagen(tarjeta.id)}>Quitar</button>
            )}
          </div>
          <small style={{ display: 'block', marginTop: 6, fontSize: 10.5, color: 'var(--ink-3)' }}>
            jpg, png o webp · máx. 3 MB
          </small>
          {/* Las tarjetas que venían del código apuntan a un archivo de /public
              en vez de a uno subido. No hay dónde editarlo porque ya no se
              escriben rutas a mano: se ve, y se reemplaza subiendo. */}
          {!tarjeta.imagen_id && tarjeta.imagen_url && (
            <small style={{ display: 'block', marginTop: 4, fontSize: 10, color: 'var(--ink-3)', wordBreak: 'break-all' }}>
              archivo del sitio: {tarjeta.imagen_url}
            </small>
          )}
        </div>

        <div>
          {soloImagen ? (
            <>
              <div className="field" style={{ margin: '0 0 8px' }}>
                <label style={{ fontSize: 11 }}>Descripción de la imagen</label>
                <input value={form.titulo ?? ''} maxLength={120}
                  placeholder="Qué muestra la imagen, para quien no puede verla"
                  onChange={e => campo('titulo', e.target.value)} />
              </div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-3)', maxWidth: '62ch' }}>
                Esta tarjeta se publica sin texto: en el carrusel se ve solo la imagen.
                La descripción no se muestra, la leen los lectores de pantalla.
              </p>
            </>
          ) : (
            <>
              <div className="field" style={{ margin: '0 0 10px' }}>
                <input value={form.titulo ?? ''} minLength={3} maxLength={120} placeholder="Título de la tarjeta"
                  onChange={e => campo('titulo', e.target.value)} style={{ fontWeight: 600 }} />
              </div>
              <div className="field" style={{ margin: '0 0 10px' }}>
                <textarea rows={3} value={form.texto ?? ''} maxLength={600} placeholder="Texto de la tarjeta"
                  onChange={e => campo('texto', e.target.value)} style={{ width: '100%', resize: 'vertical' }} />
              </div>
              <div className="field" style={{ margin: 0, maxWidth: 320 }}>
                <label style={{ fontSize: 11 }}>Pie</label>
                <input value={form.pie ?? ''} maxLength={80} placeholder="Una nota corta al margen"
                  onChange={e => campo('pie', e.target.value)} />
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 12 }}>
            <button type="button" className="btn accent" disabled={!sucio} style={{ padding: '7px 16px', fontSize: 13 }}
              onClick={() => acciones.guardar(tarjeta.id, {
                titulo: form.titulo ?? '', texto: form.texto ?? '', pie: form.pie ?? '',
              })}>
              Guardar
            </button>
            {sucio && <span style={{ fontSize: 11.5, color: 'var(--doc-ambar-texto, var(--ink-3))' }}>sin guardar</span>}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <button type="button" className="chip" disabled={primera} aria-label="Subir de posición"
              onClick={() => acciones.mover(tarjeta.id, -1)}
              style={{ cursor: primera ? 'default' : 'pointer', opacity: primera ? .4 : 1, padding: '4px 9px' }}>↑</button>
            <button type="button" className="chip" disabled={ultima} aria-label="Bajar de posición"
              onClick={() => acciones.mover(tarjeta.id, 1)}
              style={{ cursor: ultima ? 'default' : 'pointer', opacity: ultima ? .4 : 1, padding: '4px 9px' }}>↓</button>
          </div>
          <button type="button" className="chip" style={pastilla(soloImagen)} onClick={cambiarModo}>
            {soloImagen ? 'Solo imagen' : 'Con texto'}
          </button>
          <button type="button" className="chip" style={{ cursor: 'pointer', fontSize: 11 }}
            onClick={() => acciones.guardar(tarjeta.id, { visible: !tarjeta.visible })}>
            {tarjeta.visible ? 'Ocultar' : 'Publicar'}
          </button>
          <RowActions onDelete={() => acciones.borrar(tarjeta.id)} />
        </div>
      </div>
    </div>
  )
}

/* ─── El editor ────────────────────────────────────────────────── */

export default function EditorTarjetas({ seccion, setError, descripcion, ejemploPie }) {
  const [tarjetas, setTarjetas] = useState(null)
  const [form, setForm] = useState(TARJETA_VACIA)
  /* La imagen de una tarjeta nueva se elige antes de que la fila exista, así
     que se guarda aquí y se sube en cuanto el servidor devuelve el id. */
  const [archivo, setArchivo] = useState(null)
  const [creando, setCreando] = useState(false)

  /* La vista previa del archivo elegido. La URL temporal se revoca al cambiar
     de archivo: sin esto cada imagen probada se queda retenida en memoria
     hasta recargar el panel. */
  const [previa, setPrevia] = useState(null)
  useEffect(() => {
    if (!archivo) return setPrevia(null)
    const url = URL.createObjectURL(archivo)
    setPrevia(url)
    return () => URL.revokeObjectURL(url)
  }, [archivo])

  const recargar = useCallback(async () => {
    setTarjetas(await apiTarjetas(seccion, { todas: true }))
  }, [seccion])

  useEffect(() => { recargar().catch(e => setError(e.message)) }, [recargar, setError])

  const conError = fn => async (...args) => {
    try { await fn(...args) } catch (e) { setError(e.message) }
  }

  const lista = tarjetas ?? []

  const acciones = {
    /* La fila necesita poder quejarse sin conocer el contexto: el aviso sale
       por el mismo sitio que los fallos del servidor. */
    avisar: setError,
    guardar: conError(async (id, cambios) => { await apiEditarTarjeta(id, cambios); await recargar() }),
    borrar: conError(async id => { await apiBorrarTarjeta(id); await recargar() }),
    subirImagen: conError(async (id, file) => { await apiSubirImagenTarjeta(id, file); await recargar() }),
    quitarImagen: conError(async id => { await apiBorrarImagenTarjeta(id); await recargar() }),
    mover: conError(async (id, paso) => {
      const orden = lista.map(t => t.id)
      const i = orden.indexOf(id)
      const j = i + paso
      if (i < 0 || j < 0 || j >= orden.length) return
      ;[orden[i], orden[j]] = [orden[j], orden[i]]
      await apiOrdenarTarjetas(seccion, orden)
      await recargar()
    }),
  }

  /* Crear una tarjeta son varias peticiones y un orden que importa.
   *
   * La imagen necesita el id de la fila, así que no puede viajar en el alta. Y
   * la base no admite una tarjeta marcada como «solo imagen» sin imagen —sería
   * una tarjeta vacía publicada—, de modo que el marcado se deja para el
   * final: se crea, se sube la imagen y solo entonces se marca. Para quien
   * edita sigue siendo un botón.
   *
   * Si algo falla a mitad, la tarjeta queda creada y el aviso dice en qué paso
   * se quedó: se arregla desde su propia fila, que es mejor que descartar todo
   * lo escrito. */
  const crear = conError(async e => {
    e.preventDefault()
    const soloImagen = form.solo_imagen
    if (soloImagen && !archivo) {
      return setError('Una tarjeta de solo imagen necesita la imagen: elígela antes de crearla')
    }
    setCreando(true)
    try {
      const creada = await apiCrearTarjeta(seccion, { ...form, solo_imagen: false })
      if (archivo) {
        try {
          await apiSubirImagenTarjeta(creada.id, archivo)
          if (soloImagen) await apiEditarTarjeta(creada.id, { solo_imagen: true })
        } catch (err) {
          setError('La tarjeta se creó, pero la imagen no: ' + err.message)
        }
      }
      setForm(TARJETA_VACIA)
      setArchivo(null)
      await recargar()
    } finally { setCreando(false) }
  })

  if (!tarjetas) return <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>Cargando tarjetas…</p>

  return (
    <>
      {descripcion && (
        <p style={{ margin: '0 0 18px', fontSize: 12.5, color: 'var(--ink-3)', maxWidth: '78ch' }}>
          {descripcion}
        </p>
      )}

      <Plegable id="editortarjetas-0" titulo="Nueva tarjeta">
        <form className="card" style={{ background: 'var(--paper-2)', marginBottom: 20 }} onSubmit={crear}>

          {/* Qué clase de tarjeta se está creando. Va primero porque cambia lo
              que el formulario pide debajo. */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {[[false, 'Imagen con texto'], [true, 'Solo imagen']].map(([valor, etiqueta]) => (
              <button key={String(valor)} type="button" className="chip"
                style={pastilla(form.solo_imagen === valor)}
                onClick={() => setForm(f => ({ ...f, solo_imagen: valor }))}>
                {etiqueta}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, alignItems: 'start' }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Imagen{!form.solo_imagen && ' (opcional)'}
              </label>
              <div style={{ aspectRatio: '16 / 10', borderRadius: 8, overflow: 'hidden', border: BORDE, background: 'var(--paper-3, var(--paper-2))', display: 'grid', placeItems: 'center' }}>
                {previa
                  ? <img src={previa} alt=""
                      style={{ width: '100%', height: '100%', objectFit: form.solo_imagen ? 'contain' : 'cover' }} />
                  : <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>sin imagen</span>}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                <label className="chip" style={{ cursor: 'pointer', fontSize: 11 }}>
                  {archivo ? 'Cambiar' : 'Elegir imagen'}
                  <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
                    onChange={e => setArchivo(e.target.files?.[0] ?? null)} />
                </label>
                {archivo && (
                  <button type="button" className="chip" style={{ cursor: 'pointer', fontSize: 11 }}
                    onClick={() => setArchivo(null)}>Quitar</button>
                )}
              </div>
              <small style={{ display: 'block', marginTop: 6, fontSize: 10.5, color: 'var(--ink-3)' }}>
                jpg, png o webp · máx. 3 MB
              </small>
            </div>

            <div>
              {form.solo_imagen ? (
                <>
                  <div className="field" style={{ margin: '0 0 8px' }}>
                    <label>Descripción de la imagen</label>
                    <input value={form.titulo} maxLength={120}
                      placeholder="Qué muestra la imagen, para quien no puede verla"
                      onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-3)', maxWidth: '62ch' }}>
                    En el carrusel se publica solo la imagen, sin título ni texto al lado. La
                    descripción no se ve: es lo que leen los lectores de pantalla, y conviene
                    escribirla.
                  </p>
                </>
              ) : (
                <>
                  <div className="field" style={{ margin: '0 0 10px' }}>
                    <label>Título</label>
                    <input value={form.titulo} required minLength={3} maxLength={120}
                      onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
                  </div>
                  <div className="field" style={{ margin: '0 0 10px' }}>
                    <label>Texto</label>
                    <textarea rows={3} value={form.texto} maxLength={600}
                      onChange={e => setForm(f => ({ ...f, texto: e.target.value }))}
                      style={{ width: '100%', resize: 'vertical' }} />
                  </div>
                  <div className="field" style={{ margin: 0, maxWidth: 320 }}>
                    <label>Pie</label>
                    <input value={form.pie} maxLength={80} placeholder={ejemploPie || 'Una nota corta al margen'}
                      onChange={e => setForm(f => ({ ...f, pie: e.target.value }))} />
                  </div>
                </>
              )}
            </div>
          </div>

          <button className="btn accent" type="submit" disabled={creando} style={{ padding: '8px 18px', marginTop: 16 }}>
            {creando ? 'Creando…' : 'Crear tarjeta'} <Icons.check />
          </button>
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--ink-3)' }}>
            Se crea publicada y al final del carrusel.
          </div>
        </form>
      </Plegable>

      {lista.map((t, n) => (
        <FilaTarjeta key={t.id} tarjeta={t} primera={n === 0} ultima={n === lista.length - 1}
          acciones={acciones} />
      ))}

      {lista.length === 0 && (
        <div style={{ padding: '24px 0', color: 'var(--ink-3)', fontSize: 14 }}>
          Sin tarjetas. El costado del encabezado queda vacío y la página pinta el titular a
          todo el ancho.
        </div>
      )}
    </>
  )
}
