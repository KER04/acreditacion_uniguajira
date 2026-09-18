import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Icons } from '../../components/Icons'
import { apiOferta, apiPostular } from '../../context/DataContext'
import { useFormulario, Campo } from '../../components/formulario'
import SelectorAnio from '../../components/SelectorAnio'
import { fechaLarga, ANIO_GRADO_MIN } from '../../../shared/validacion'

/* Página propia de una vacante. La bolsa la abre en una pestaña nueva, así que
   no puede depender del estado ya cargado en la otra: pide su ficha por su
   cuenta y sobrevive a que alguien comparta el enlace pelado. */

/* Los bloques largos se escriben como texto libre en el panel. Aquí se parten
   por saltos de línea: una línea que empieza por -, • o * se pinta como
   viñeta, y el resto como párrafo. Así nadie pelea con un editor de listas. */
function Bloque({ titulo, texto, icono }) {
  const lineas = String(texto ?? '').split('\n').map(l => l.trim()).filter(Boolean)
  if (lineas.length === 0) return null

  const esVinieta = l => /^[-•*]\s*/.test(l)
  const todasVinietas = lineas.every(esVinieta)

  return (
    <section className="vac-bloque">
      <h2 className="vac-bloque__titulo">{icono} {titulo}</h2>
      {todasVinietas ? (
        <ul className="vac-lista">
          {lineas.map((l, i) => <li key={i}>{l.replace(/^[-•*]\s*/, '')}</li>)}
        </ul>
      ) : (
        lineas.map((l, i) => (
          esVinieta(l)
            ? <ul className="vac-lista" key={i}><li>{l.replace(/^[-•*]\s*/, '')}</li></ul>
            : <p className="vac-parrafo" key={i}>{l}</p>
        ))
      )}
    </section>
  )
}

const VACIO = {
  nombre: '', email: '', documento: '', telefono: '',
  anio_grado: '', linkedin_url: '', mensaje: '',
}

function Formulario({ oferta }) {
  /* Mismo esquema que valida la API, corriendo también aquí: quien aplica ve
     el error bajo el campo en vez de descubrirlo al enviar. */
  const form = useFormulario('postulaciones', VACIO)
  const [hojaVida, setHojaVida] = useState(null)
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
      await apiPostular(oferta.id, form.valores, hojaVida)
      setCorreoEnviado(form.valores.email)
      setEnviado(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <div className="vac-gracias">
        <div className="vac-gracias__marca"><Icons.check /></div>
        <h3>Postulación enviada</h3>
        <p>
          {oferta.empresa} recibirá tu perfil a través de la coordinación del programa.
          Si avanzas en el proceso te escribirán a <strong>{correoEnviado}</strong>.
        </p>
      </div>
    )
  }

  return (
    <form className="vac-form" onSubmit={enviar} id="aplicar" noValidate>
      <div className="vac-form__cabecera">
        <div className="eyebrow">Postúlate</div>
        <h2 className="vac-form__titulo">Aplicar a esta vacante</h2>
        <p className="vac-form__nota">
          Tus datos van directo a la coordinación del programa, que los remite a la empresa.
          Solo el nombre y el correo son obligatorios.
        </p>
      </div>

      {error && <div role="alert" className="eg-alerta">{error}</div>}

      <div className="vac-form__campos">
        {campo('nombre', 'Nombres y apellidos', { required: true })}
        {campo('email', 'Correo', { type: 'email', required: true })}
        {campo('documento', 'Documento', { opcional: true, inputMode: 'numeric', placeholder: '1098765432' })}
        {campo('telefono', 'Celular / WhatsApp', { opcional: true, inputMode: 'tel', placeholder: '+57 300 1234567' })}
        <Campo etiqueta="Año de grado" opcional error={form.error('anio_grado')}>
          <SelectorAnio valor={form.valores.anio_grado} desde={ANIO_GRADO_MIN}
                        onChange={v => form.set('anio_grado', v)}
                        onBlur={() => form.alSalir('anio_grado')} />
        </Campo>
        {campo('linkedin_url', 'LinkedIn', { opcional: true, placeholder: 'https://linkedin.com/in/…' })}

        <Campo etiqueta="¿Por qué te interesa esta vacante?" opcional
               error={form.error('mensaje')} style={{ gridColumn: '1 / -1' }}>
          <textarea rows="4" value={form.valores.mensaje}
                    onChange={e => form.set('mensaje', e.target.value)}
                    onBlur={() => form.alSalir('mensaje')}
                    placeholder="Opcional — unas líneas sobre tu experiencia con lo que pide el cargo" />
        </Campo>
      </div>

      <label className="vac-cv">
        <span className="vac-cv__icono"><Icons.upload /></span>
        <span className="vac-cv__texto">
          <span className="vac-cv__titulo">{hojaVida ? hojaVida.name : 'Adjunta tu hoja de vida'}</span>
          <span className="vac-cv__meta">
            {hojaVida
              ? Math.round(hojaVida.size / 1024) + ' KB · pulsa para cambiarla'
              : 'PDF, DOC o DOCX · hasta 10 MB · opcional'}
          </span>
        </span>
        <input type="file" accept=".pdf,.doc,.docx" hidden
               onChange={e => setHojaVida(e.target.files?.[0] ?? null)} />
      </label>

      <button className="btn accent vac-form__enviar" type="submit" disabled={enviando}>
        {enviando ? 'Enviando…' : 'Enviar postulación'} <Icons.arrow />
      </button>
    </form>
  )
}

export default function Vacante() {
  const { id } = useParams()
  const [oferta, setOferta] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let vivo = true
    apiOferta(id)
      .then(o => { if (vivo) setOferta(o) })
      .catch(e => { if (vivo) setError(e.message) })
    return () => { vivo = false }
  }, [id])

  /* La pestaña se abre suelta: el título tiene que decir qué es sin contexto. */
  useEffect(() => {
    if (!oferta) return
    const previo = document.title
    document.title = oferta.cargo + ' · ' + oferta.empresa + ' — Bolsa de empleo'
    return () => { document.title = previo }
  }, [oferta])

  if (error) {
    return (
      <div className="page-in section">
        <div className="inner vac-error">
          <h1>Vacante no disponible</h1>
          <p>{error}</p>
          <Link className="btn ghost" to="/egresados">Volver a la bolsa de empleo</Link>
        </div>
      </div>
    )
  }

  const bajarAlFormulario = () => {
    const destino = document.getElementById('aplicar')
    if (!destino) return
    const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    destino.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: 'start' })
  }

  if (!oferta) {
    return (
      <div className="page-in section">
        <div className="inner" style={{ color: 'var(--ink-3)' }}>Cargando la vacante…</div>
      </div>
    )
  }

  const dato = (icono, etiqueta, valor) => valor ? (
    <div className="vac-dato">
      <div className="vac-dato__etiqueta">{icono} {etiqueta}</div>
      <div className="vac-dato__valor">{valor}</div>
    </div>
  ) : null

  return (
    <div className="page-in">
      <header className="vac-cabecera">
        <div className="inner">
          <Link className="vac-volver" to="/egresados">← Bolsa de empleo</Link>

          <div className="vac-cabecera__estado">
            {oferta.abierta
              ? <span className="vac-pildora vac-pildora--abierta">Convocatoria abierta</span>
              : <span className="vac-pildora vac-pildora--cerrada">{oferta.vencida ? 'Plazo vencido' : 'Cerrada'}</span>}
            {oferta.abierta && oferta.dias_restantes !== null && (
              <span className="vac-cabecera__plazo">
                {oferta.dias_restantes === 0 ? 'Cierra hoy' : 'Cierra en ' + oferta.dias_restantes + ' días'}
              </span>
            )}
          </div>

          <h1 className="vac-titulo">{oferta.cargo}</h1>
          <div className="vac-empresa">{oferta.empresa}</div>

          {oferta.tags?.length > 0 && (
            <div className="vac-tags">
              {oferta.tags.map((t, i) => <span key={i} className="chip">{t}</span>)}
            </div>
          )}
        </div>
      </header>

      <div className="section vac-cuerpo">
        <div className="inner vac-cuerpo__rejilla">
          <main>
            <div className="vac-datos">
              {dato(<Icons.ubicacion />, 'Ubicación', oferta.ubicacion)}
              {dato(<Icons.maletin />, 'Modalidad', oferta.modalidad)}
              {dato(<Icons.reloj />, 'Contrato', oferta.tipo_contrato)}
              {dato(<Icons.billete />, 'Salario', oferta.salario)}
              {dato(<Icons.usuario size={15} />, 'Vacantes', oferta.vacantes > 1 ? oferta.vacantes : null)}
              {dato(<Icons.reloj />, 'Cierra', fechaLarga(oferta.fecha_cierre))}
            </div>

            <Bloque titulo="Sobre la vacante" texto={oferta.descripcion} icono={<Icons.sparkle />} />
            <Bloque titulo="Responsabilidades" texto={oferta.responsabilidades} icono={<Icons.check />} />
            <Bloque titulo="Requisitos" texto={oferta.requisitos} icono={<Icons.check />} />
            <Bloque titulo="Beneficios" texto={oferta.beneficios} icono={<Icons.sparkle />} />

            {oferta.contacto_email && (
              <p className="vac-contacto">
                <Icons.mail /> Dudas sobre el proceso:{' '}
                <a href={'mailto:' + oferta.contacto_email}>{oferta.contacto_email}</a>
              </p>
            )}
          </main>

          <aside className="vac-lateral">
            <div className="vac-caja">
              <div className="eyebrow">Publicada</div>
              <div className="vac-caja__fecha">{fechaLarga(oferta.fecha_publicacion) || '—'}</div>

              {!oferta.abierta ? (
                <p className="vac-caja__aviso">
                  Esta vacante ya no recibe postulaciones. Puedes revisar las que siguen abiertas
                  en la bolsa de empleo.
                </p>
              ) : oferta.url_externa ? (
                /* La empresa tiene su propio portal: allí se aplica, y se dice
                   claramente para que nadie llene dos veces el mismo formulario. */
                <>
                  <p className="vac-caja__aviso">
                    {oferta.empresa} recibe las postulaciones en su propio portal.
                  </p>
                  <a className="btn accent vac-caja__btn" href={oferta.url_externa}
                     target="_blank" rel="noopener noreferrer">
                    Aplicar en {oferta.empresa} <Icons.external />
                  </a>
                </>
              ) : (
                /* Botón y no enlace: con HashRouter un href="#aplicar" se
                   interpreta como la ruta /aplicar y saca de la página. */
                <button className="btn accent vac-caja__btn" onClick={bajarAlFormulario}>
                  Aplicar a esta vacante <Icons.arrow />
                </button>
              )}

              <Link className="btn ghost vac-caja__btn" to="/egresados">Ver otras vacantes</Link>
            </div>
          </aside>
        </div>

        {oferta.abierta && !oferta.url_externa && (
          <div className="inner"><Formulario oferta={oferta} /></div>
        )}
      </div>
    </div>
  )
}
