import { useCallback, useEffect, useState } from 'react'
import { Icons } from '../../components/Icons'
import TramaMarca from '../../components/TramaMarca'
import VideoEgresado from '../../components/VideoEgresado'
import Retrato from '../../components/Retrato'
import { useData, apiActualizarDatos } from '../../context/DataContext'
import { useFormulario, Campo } from '../../components/formulario'
import SelectorAnio from '../../components/SelectorAnio'
import { FORMACION_POSTERIOR, ANIO_GRADO_MIN } from '../../../shared/validacion'

/* "Grupo Éxito · Bogotá", saltándose lo que esté vacío. */
const dondeTrabaja = e => [e.empresa, e.ciudad, e.pais].filter(Boolean).join(' · ')

/* ─── Portada rotativa ─────────────────────────────────────────── */

/* Cada cuánto pasa a la siguiente portada. Un testimonio dura minutos, así que
   esto no pretende que se vea entero: la portada es un adelanto y quien quiera
   escucharlo activa el sonido —lo que detiene la rotación— o se va a YouTube. */
const SEGUNDOS_POR_PORTADA = 16

function Protagonista({ egresado, onVisibilidad, onSonido }) {
  return (
    <VideoEgresado
      className="eg-hero"
      videoYoutube={egresado.video_youtube}
      videoUrl={egresado.video_url}
      posterUrl={egresado.poster_url}
      titulo={egresado.nombre}
      onVisibilidad={onVisibilidad}
      onSonido={onSonido}
      style={{ '--tono': egresado.color || 'var(--ug-azul)' }}>

      {/* Sin vídeo ni póster la caja quedaría en negro. La cuadrícula del
          emblema hace de portada por defecto: dice de quién es la página sin
          inventarse una foto que nadie subió. Blanca, porque debajo va el
          degradado oscuro y encima el nombre. */}
      {!egresado.poster_url && !egresado.tiene_video && <TramaMarca blanco escala={132} opacidad={0.18} />}

      <div className="eg-hero__contenido">
        <div className="eg-hero__eyebrow">
          {egresado.tiene_video ? 'Testimonio en vídeo' : 'Egresado destacado'}
          {egresado.anio_grado && ' · Promoción ' + egresado.anio_grado}
        </div>
        <h3 className="eg-hero__nombre">{egresado.nombre}</h3>
        {egresado.cargo && <div className="eg-hero__cargo">{egresado.cargo}</div>}
        {dondeTrabaja(egresado) && <div className="eg-hero__donde">{dondeTrabaja(egresado)}</div>}
        {egresado.testimonio && <p className="eg-hero__cita">«{egresado.testimonio}»</p>}
      </div>

      {/* El círculo con la foto, en la esquina, montado sobre el vídeo. */}
      <div className="eg-hero__retrato">
        <Retrato persona={egresado} size={104} />
      </div>
    </VideoEgresado>
  )
}

/* Decide quién ocupa la portada y la va rotando.
 *
 * Antes la portada era fija: `todos.find(e => e.destacado)`. Con dos egresados
 * marcados ganaba el primero por orden y el segundo caía al grid como uno más,
 * así que la segunda casilla marcada no hacía nada y nadie se enteraba. Ahora
 * rotan TODOS los que tienen vídeo, y la casilla "destacado" pasa a decidir
 * solo quién abre —marcar a varios ya no es ambiguo, es el orden de la ronda.
 *
 * Si nadie tiene vídeo no hay nada que rotar y la portada se queda con el
 * marcado, o con el primero. */
function usarRotacion(todos) {
  const conVideo = todos.filter(e => e.tiene_video)
  const marcados = todos.filter(e => e.destacado)
  const ronda = conVideo.length > 0
    ? conVideo
    : (marcados.length > 0 ? marcados : todos.slice(0, 1))

  const [indice, setIndice] = useState(0)
  const [enPantalla, setEnPantalla] = useState(true)
  const [conRaton, setConRaton] = useState(false)
  const [conSonido, setConSonido] = useState(false)
  const [detenidoAMano, setDetenidoAMano] = useState(false)
  const [menosMovimiento, setMenosMovimiento] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const aplicar = () => setMenosMovimiento(mq.matches)
    aplicar()
    mq.addEventListener('change', aplicar)
    return () => mq.removeEventListener('change', aplicar)
  }, [])

  /* La ronda se arma en cada render y su longitud cambia cuando llegan los
     datos de la API; el índice tiene que seguir cayendo dentro. */
  const total = ronda.length
  const posicion = total > 0 ? indice % total : 0
  const actual = ronda[posicion] ?? null

  /* Se rota sola salvo que haya motivo para no hacerlo: que no se vea, que
     alguien esté escuchándola con sonido, que la hayan parado a mano o que el
     sistema pida menos movimiento. */
  const rotando = total > 1 && enPantalla && !conRaton && !conSonido && !detenidoAMano && !menosMovimiento

  useEffect(() => {
    if (!rotando) return
    const t = setTimeout(() => setIndice(i => i + 1), SEGUNDOS_POR_PORTADA * 1000)
    return () => clearTimeout(t)
  }, [rotando, posicion])

  /* useCallback porque VideoEgresado las tiene como dependencias de un efecto:
     una función nueva en cada render lo haría dispararse sin parar. */
  const alCambiarVisibilidad = useCallback(v => setEnPantalla(v), [])
  const alCambiarSonido = useCallback(v => setConSonido(v), [])

  const ir = i => { setIndice(i); setDetenidoAMano(true) }

  return {
    ronda, actual, posicion, total, rotando, detenidoAMano,
    ir,
    alternarPausa: () => setDetenidoAMano(p => !p),
    alCambiarVisibilidad, alCambiarSonido,
    /* El raton lleva su propio estado y no el de visibilidad: si compartieran
       uno, sacar el puntero de la tarjeta diría "ya se ve" aunque la sección
       estuviera fuera de pantalla. */
    entraRaton: () => setConRaton(true),
    saleRaton: () => setConRaton(false),
  }
}

function Destacados() {
  const { data } = useData()
  const todos = data.destacados ?? []
  const r = usarRotacion(todos)

  if (todos.length === 0) {
    return (
      <section className="section" style={{ paddingTop: 40 }}>
        <div className="inner" style={{ color: 'var(--ink-3)' }}>Todavía no hay egresados publicados.</div>
      </section>
    )
  }

  return (
    <section className="section" style={{ paddingTop: 40 }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Egresados destacados</div>
            <h2 style={{ marginTop: 10 }}>Historias entre cientos.</h2>
          </div>
          <p className="desc">
            Quiénes son, dónde están hoy y qué se llevaron del programa.
            {r.total > 1 && ' La portada va pasando por cada testimonio en vídeo.'}
          </p>
        </div>

        {r.actual && (
          /* El ratón encima detiene la ronda: nadie quiere que le cambien la
             tarjeta justo cuando se paró a leerla. */
          <div className="eg-escenario"
               onMouseEnter={r.entraRaton} onMouseLeave={r.saleRaton}
               onFocusCapture={r.entraRaton} onBlurCapture={r.saleRaton}>
            {/* key: al cambiar de egresado hay que montar otro reproductor,
                no reaprovechar el que está sonando. */}
            <Protagonista key={r.actual.id} egresado={r.actual}
                          onVisibilidad={r.alCambiarVisibilidad}
                          onSonido={r.alCambiarSonido} />

            {r.total > 1 && (
              <div className="eg-ronda" role="group" aria-label="Testimonios en portada">
                <button className="eg-ronda__btn" onClick={() => r.ir(r.posicion - 1 + r.total)}
                        aria-label="Testimonio anterior">‹</button>

                <div className="eg-ronda__puntos">
                  {r.ronda.map((e, i) => (
                    <button key={e.id}
                            className={'eg-punto' + (i === r.posicion ? ' es-activo' : '')}
                            onClick={() => r.ir(i)}
                            aria-current={i === r.posicion ? 'true' : undefined}
                            aria-label={'Ver el testimonio de ' + e.nombre}>
                      <span className="eg-punto__nombre">{e.nombre.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>

                <button className="eg-ronda__btn" onClick={() => r.ir(r.posicion + 1)}
                        aria-label="Testimonio siguiente">›</button>

                <button className="eg-ronda__pausa" onClick={r.alternarPausa}
                        aria-pressed={r.detenidoAMano}
                        aria-label={r.detenidoAMano ? 'Reanudar la rotación' : 'Detener la rotación'}>
                  {r.detenidoAMano ? <Icons.play /> : <span className="eg-punto__pausa" />}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="eg-grid">
          {(r.total > 1 ? todos : todos.filter(e => e.id !== r.actual?.id)).map(e => {
            const enRonda = r.ronda.some(x => x.id === e.id)
            const esActual = r.actual?.id === e.id
            return (
              <article key={e.id}
                       className={'eg-card' + (esActual ? ' es-en-portada' : '')}
                       style={{ '--tono': e.color || 'var(--ug-azul)' }}>
                <div className="eg-card__cabecera">
                  {/* La cabecera de la tarjeta no tiene portada nunca: la
                      cuadrícula es su fondo por defecto, teñida por --tono. */}
                  <TramaMarca escala={72} />
                  <div className="eg-card__promo">Promoción {e.anio_grado || '—'}</div>
                  {e.tiene_video && <div className="eg-card__video"><Icons.play /></div>}
                  <div className="eg-card__retrato">
                    <Retrato persona={e} size={72} />
                  </div>
                </div>
                <div className="eg-card__cuerpo">
                  <h3 className="eg-card__nombre">{e.nombre}</h3>
                  {e.cargo && <div className="eg-card__cargo">{e.cargo}</div>}
                  {dondeTrabaja(e) && <div className="eg-card__donde">{dondeTrabaja(e)}</div>}
                  {e.testimonio && <p className="eg-card__cita">«{e.testimonio}»</p>}

                  <div className="eg-card__pie">
                    {e.linkedin_url && (
                      <a className="eg-card__linkedin" href={e.linkedin_url} target="_blank" rel="noopener noreferrer">
                        <Icons.linkedin /> LinkedIn
                      </a>
                    )}
                    {/* Botón y no tarjeta entera clicable: dentro ya hay un
                        enlace a LinkedIn y anidar interactivos rompe el tabulado. */}
                    {enRonda && r.total > 1 && (
                      <button className="eg-card__portada" onClick={() => r.ir(r.ronda.findIndex(x => x.id === e.id))}
                              disabled={esActual}>
                        {esActual ? 'En portada ahora' : 'Ver en portada'}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ─── Bolsa de empleo ──────────────────────────────────────────── */

function Bolsa() {
  const { data } = useData()
  const ofertas = data.ofertas ?? []
  const [verCerradas, setVerCerradas] = useState(false)

  const abiertas = ofertas.filter(o => o.abierta)
  const cerradas = ofertas.filter(o => !o.abierta)
  const lista = verCerradas ? cerradas : abiertas

  return (
    <section className="section" style={{ background: 'var(--paper-2)' }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Bolsa de empleo</div>
            <h2 style={{ marginTop: 10 }}>Ofertas exclusivas para la red.</h2>
          </div>
          <p className="desc">
            Empresas aliadas que priorizan a egresados del programa. Abre cualquier vacante para ver
            el detalle completo y postularte desde ahí.
          </p>
        </div>

        {cerradas.length > 0 && (
          <div className="eg-filtros" role="tablist" aria-label="Estado de las vacantes">
            <button role="tab" aria-selected={!verCerradas} className={'btn ' + (verCerradas ? 'ghost' : 'accent')}
                    onClick={() => setVerCerradas(false)}>
              Abiertas <span className="eg-filtros__n">{abiertas.length}</span>
            </button>
            <button role="tab" aria-selected={verCerradas} className={'btn ' + (verCerradas ? 'accent' : 'ghost')}
                    onClick={() => setVerCerradas(true)}>
              Cerradas <span className="eg-filtros__n">{cerradas.length}</span>
            </button>
          </div>
        )}

        {lista.length === 0 && (
          <div className="eg-vacio">
            <Icons.maletin />
            <span>{verCerradas ? 'No hay vacantes cerradas.' : 'Ahora mismo no hay vacantes abiertas. Vuelve pronto.'}</span>
          </div>
        )}

        <div className="eg-ofertas">
          {lista.map(o => (
            /* Pestaña nueva a propósito: quien mira la bolsa suele abrir varias
               vacantes antes de decidir a cuál aplicar.
               El '#/' no es decorativo: el sitio monta un HashRouter, así que
               una ruta sin almohadilla la resuelve el servidor, que devuelve
               index.html, y el router acaba en la portada. */
            <a key={o.id} className="oferta-fila" href={'#/egresados/vacante/' + o.id}
               target="_blank" rel="noopener noreferrer">
              <div className="oferta-fila__empresa">
                <div className="oferta-fila__emp">{o.empresa}</div>
                {o.ubicacion && (
                  <div className="oferta-fila__loc"><Icons.ubicacion /> {o.ubicacion}</div>
                )}
              </div>

              <div className="oferta-fila__puesto">
                <div className="oferta-fila__cargo">{o.cargo}</div>
                {o.tags?.length > 0 && (
                  <div className="oferta-fila__tags">
                    {o.tags.slice(0, 5).map((t, j) => <span key={j} className="chip">{t}</span>)}
                  </div>
                )}
              </div>

              <div className="oferta-fila__modo">
                <span className="chip">{o.modalidad}</span>
                <span className="oferta-fila__contrato">{o.tipo_contrato}</span>
              </div>

              <div className="oferta-fila__salario">{o.salario || '—'}</div>

              <div className="oferta-fila__accion">
                {o.abierta
                  ? <span className="btn ghost oferta-fila__btn">Ver y aplicar <Icons.external /></span>
                  : <span className="oferta-fila__cerrada">{o.vencida ? 'Plazo vencido' : 'Cerrada'}</span>}
                {o.abierta && o.dias_restantes !== null && o.dias_restantes <= 14 && (
                  <span className="oferta-fila__urgente">
                    {o.dias_restantes === 0 ? 'Cierra hoy' : 'Cierra en ' + o.dias_restantes + ' días'}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Actualización de datos ───────────────────────────────────── */

const VACIO = {
  nombre: '', documento: '', anio_grado: '', email: '', telefono: '',
  ciudad: '', empresa: '', cargo: '', formacion_posterior: 'Ninguna',
  resumen: '', autoriza_datos: true,
}

function Actualizar() {
  /* Mismo motor y mismo esquema que usa el panel y que corre la API: antes
     esta página solo validaba en el servidor, así que se podían escribir
     números en el nombre o letras en el celular y nadie avisaba hasta enviar. */
  const form = useFormulario('actualizaciones', VACIO)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')
  const [correoEnviado, setCorreoEnviado] = useState('')

  const campo = (clave, etiqueta, extra = {}) => (
    <Campo etiqueta={etiqueta} error={form.error(clave)} opcional={extra.opcional} style={extra.style}>
      <input
        type={extra.type ?? 'text'}
        inputMode={extra.inputMode}
        value={form.valores[clave]}
        onChange={e => form.set(clave, e.target.value)}
        onBlur={() => form.alSalir(clave)}
        placeholder={extra.placeholder}
        required={extra.required} />
    </Campo>
  )

  const enviar = async e => {
    e.preventDefault()
    setError('')
    if (!form.validarTodo()) return
    setEnviando(true)
    try {
      await apiActualizarDatos(form.valores)
      setCorreoEnviado(form.valores.email)
      setEnviado(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="section">
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Actualiza tus datos</div>
            <h2 style={{ marginTop: 10 }}>Cuéntanos dónde estás hoy.</h2>
          </div>
          <p className="desc">
            Actualizar tus datos nos permite mejorar la pertinencia del programa, certificar tu
            experiencia y conectarte con ofertas relevantes para tu perfil actual.
          </p>
        </div>

        {enviado ? (
          <div className="eg-gracias">
            <div className="eg-gracias__marca"><Icons.check /></div>
            <h3>¡Gracias por actualizarte!</h3>
            <p>
              Ya quedó registrado. La coordinación del programa revisa las actualizaciones y te
              escribirá a <strong>{correoEnviado}</strong> si necesita confirmar algo.
            </p>
            <button className="btn ghost" onClick={() => { form.reiniciar(); setEnviado(false) }}>
              Enviar otra actualización
            </button>
          </div>
        ) : (
          <form className="card eg-form" onSubmit={enviar} noValidate>
            {error && <div role="alert" className="eg-alerta">{error}</div>}

            <div className="eg-form__campos">
              {campo('nombre', 'Nombres y apellidos', { required: true })}
              {campo('documento', 'Documento de identidad', { opcional: true, inputMode: 'numeric', placeholder: '1098765432' })}
              <Campo etiqueta="Año de grado" opcional error={form.error('anio_grado')}>
                <SelectorAnio valor={form.valores.anio_grado} desde={ANIO_GRADO_MIN}
                              onChange={v => form.set('anio_grado', v)}
                              onBlur={() => form.alSalir('anio_grado')} />
              </Campo>
              {campo('email', 'Correo personal', { type: 'email', required: true })}
              {campo('telefono', 'Celular / WhatsApp', { opcional: true, inputMode: 'tel', placeholder: '+57 300 1234567' })}
              {campo('ciudad', 'Ciudad actual', { opcional: true })}
              {campo('empresa', 'Empresa u organización', { opcional: true })}
              {campo('cargo', 'Cargo actual', { opcional: true })}

              <Campo etiqueta="Formación posterior" error={form.error('formacion_posterior')}
                     style={{ gridColumn: '1 / -1' }}>
                <select value={form.valores.formacion_posterior}
                        onChange={e => form.set('formacion_posterior', e.target.value)}>
                  {FORMACION_POSTERIOR.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Campo>

              <Campo etiqueta="Cuéntanos en una línea qué estás haciendo hoy" opcional
                     error={form.error('resumen')} style={{ gridColumn: '1 / -1' }}>
                <textarea rows="3" value={form.valores.resumen}
                          onChange={e => form.set('resumen', e.target.value)}
                          onBlur={() => form.alSalir('resumen')}
                          placeholder="Opcional — puede ser destacado en la web" />
              </Campo>
            </div>

            <div className="eg-form__pie">
              <label className="eg-form__habeas">
                <input type="checkbox" checked={form.valores.autoriza_datos}
                       onChange={e => form.set('autoriza_datos', e.target.checked)} />
                Autorizo el tratamiento de mis datos conforme a la política de la Universidad de La Guajira.
              </label>
              <button className="btn accent" type="submit"
                      disabled={enviando || !form.valores.autoriza_datos}>
                {enviando ? 'Enviando…' : 'Enviar actualización'} <Icons.arrow />
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

/* Desplazamiento suave hasta una sección de la misma página, respetando a
   quien pidió menos movimiento en su sistema. */
function irA(id) {
  const destino = document.getElementById(id)
  if (!destino) return
  const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  destino.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: 'start' })
}

export default function Egresados() {
  const { data } = useData()
  const abiertas = (data.ofertas ?? []).filter(o => o.abierta).length
  const irALaBolsa = () => irA('bolsa')

  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: 'clamp(60px,8vw,110px)' }}>
        <div className="inner">
          <div className="eyebrow">Comunidad · Egresados</div>
          <h1 style={{ marginTop: 14, maxWidth: '22ch' }}>Lo que construyen nuestros egresados nos representa.</h1>
          <p style={{ fontSize: 18, color: 'var(--ink-2)', marginTop: 24, maxWidth: '58ch' }}>
            Más de 860 egresados forman una red activa que hoy lidera equipos, funda empresas y
            continúa estudiando — dentro y fuera del Caribe.
          </p>
          {abiertas > 0 && (
            /* Botón y no enlace: con HashRouter un href="#bolsa" se interpreta
               como la ruta /bolsa, que no existe, y caía en el 404. */
            <button className="btn accent" style={{ marginTop: 28 }} onClick={irALaBolsa}>
              {abiertas} {abiertas === 1 ? 'vacante abierta' : 'vacantes abiertas'} <Icons.arrow />
            </button>
          )}
        </div>
      </section>
      <Destacados />
      <div id="bolsa"><Bolsa /></div>
      <Actualizar />
    </div>
  )
}
