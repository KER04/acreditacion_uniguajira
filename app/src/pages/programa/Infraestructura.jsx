import { useEffect, useState } from 'react'
import { Icons } from '../../components/Icons'
import TramaMarca from '../../components/TramaMarca'
import { apiInfraestructura } from '../../context/DataContext'
import {
  CATEGORIAS_INFRA, ETIQUETA_INFRA, ETIQUETA_SEDE_INFRA, puestosDe,
} from '../../../shared/validacion'

/* Recursos de infraestructura tecnológica.
 *
 * Las cifras que se ven arriba las suma el servidor sobre los recursos
 * visibles; no hay ningún total guardado que pueda dejar de cuadrar con sus
 * partes. Y cada recurso cita de dónde salió su dato: son cifras que revisa un
 * par académico del CNA, y un número sin procedencia no vale como evidencia.
 */

const ICONO = {
  computo: Icons.maletin,
  laboratorio: Icons.sparkle,
  audiovisual: Icons.play,
  conectividad: Icons.external,
  plataforma: Icons.archivo,
  espacio: Icons.ubicacion,
}

/* El equipamiento se escribe como texto libre, una línea por punto. Aquí se
   parte en viñetas sin obligar a nadie a pelearse con un editor de listas. */
function Viñetas({ texto }) {
  const lineas = String(texto ?? '').split('\n').map(l => l.trim().replace(/^[-•*]\s*/, '')).filter(Boolean)
  if (lineas.length === 0) return null
  return (
    <ul className="infra-lista">
      {lineas.map((l, i) => <li key={i}>{l}</li>)}
    </ul>
  )
}

function Tarjeta({ recurso }) {
  const Icono = ICONO[recurso.categoria] ?? Icons.archivo
  const puestos = puestosDe(recurso)

  return (
    <article className={'infra-card' + (recurso.destacado ? ' es-destacado' : '')}>
      <TramaMarca escala={78} opacidad={0.05} />
      <div className="infra-card__cuerpo">
        <header className="infra-card__cabecera">
          <span className="infra-card__icono"><Icono /></span>
          <div style={{ minWidth: 0 }}>
            <h3 className="infra-card__nombre">{recurso.nombre}</h3>
            <div className="infra-card__donde">
              {[recurso.ubicacion, ETIQUETA_SEDE_INFRA[recurso.sede]].filter(Boolean).join(' · ')}
              {recurso.anio && ' · desde ' + recurso.anio}
            </div>
          </div>
        </header>

        {(recurso.cantidad > 1 || puestos || recurso.area_m2) && (
          <div className="infra-card__cifras">
            {recurso.cantidad > 1 && (
              <div><b>{recurso.cantidad}</b><span>espacios</span></div>
            )}
            {puestos && (
              <div>
                <b>{puestos.toLocaleString('es-CO')}</b>
                <span>{recurso.cantidad > 1 ? 'puestos en total' : 'puestos'}</span>
              </div>
            )}
            {recurso.area_m2 && (
              <div><b>{recurso.area_m2.toLocaleString('es-CO')}</b><span>m² construidos</span></div>
            )}
          </div>
        )}

        {recurso.descripcion && <p className="infra-card__texto">{recurso.descripcion}</p>}
        <Viñetas texto={recurso.equipamiento} />

        {recurso.fuente_url && (
          <a className="infra-card__fuente" href={recurso.fuente_url} target="_blank" rel="noopener noreferrer">
            <Icons.external /> {recurso.fuente_nombre || 'Fuente'}
          </a>
        )}
      </div>
    </article>
  )
}

export default function Infraestructura() {
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let vivo = true
    apiInfraestructura()
      .then(d => { if (vivo) setDatos(d) })
      .catch(e => { if (vivo) setError(e.message) })
    return () => { vivo = false }
  }, [])

  if (error) {
    return (
      <div className="page-in section">
        <div className="inner vac-error">
          <h1>No se pudo cargar la infraestructura</h1>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!datos) {
    return (
      <div className="page-in section">
        <div className="inner" style={{ color: 'var(--ink-3)' }}>Cargando recursos…</div>
      </div>
    )
  }

  const { cifras, porCategoria, fuentes } = datos
  const conContenido = CATEGORIAS_INFRA.filter(([k]) => (porCategoria[k] ?? []).length > 0)

  return (
    <div className="page-in">
      <header className="sp-cabecera">
        <TramaMarca blanco escala={118} opacidad={0.12} />
        <div className="inner">
          <div className="eyebrow sp-cabecera__eyebrow">Programa · Infraestructura</div>
          <h1 className="sp-cabecera__titulo">Recursos de infraestructura tecnológica.</h1>
          <p className="sp-cabecera__texto">
            Con qué cuenta el estudiante de Ingeniería de Sistemas: salas de informática,
            laboratorios especializados, conectividad y espacios de trabajo. Las cifras salen de lo
            publicado por la universidad y cada una enlaza su fuente.
          </p>

          {cifras.recursos > 0 && (
            <div className="sp-cifras">
              <div><b>{cifras.salas_computo}</b><span>salas de informática</span></div>
              <div><b>{cifras.laboratorios}</b><span>laboratorios</span></div>
              <div><b>{cifras.puestos.toLocaleString('es-CO')}</b><span>puestos de trabajo</span></div>
              <div><b>{cifras.area_m2.toLocaleString('es-CO')}</b><span>m² construidos</span></div>
            </div>
          )}
        </div>
      </header>

      {conContenido.length === 0 ? (
        <section className="section">
          <div className="inner">
            <div className="eg-vacio">
              <Icons.archivo />
              <span>Todavía no hay recursos publicados. Se registran desde el panel de administración.</span>
            </div>
          </div>
        </section>
      ) : (
        <>
          {conContenido.map(([clave], i) => (
            <section key={clave} className="section"
                     style={{ background: i % 2 ? 'var(--paper-2)' : undefined, paddingTop: i === 0 ? 60 : undefined }}>
              <div className="inner">
                <div className="section-head">
                  <div className="title">
                    <div className="eyebrow">{ETIQUETA_INFRA[clave]}</div>
                    <h2 style={{ marginTop: 10 }}>
                      {porCategoria[clave].length}{' '}
                      {porCategoria[clave].length === 1 ? 'recurso registrado' : 'recursos registrados'}.
                    </h2>
                  </div>
                </div>
                <div className="infra-grid">
                  {porCategoria[clave].map(r => <Tarjeta key={r.id} recurso={r} />)}
                </div>
              </div>
            </section>
          ))}

          {fuentes.length > 0 && (
            <section className="section" style={{ paddingTop: 0 }}>
              <div className="inner">
                <div className="infra-fuentes">
                  <div className="eyebrow">De dónde salen estas cifras</div>
                  <p className="infra-fuentes__nota">
                    Todo lo anterior está publicado por la Universidad de La Guajira. Consultado el
                    18 de septiembre de 2026.
                  </p>
                  <ul>
                    {fuentes.map(f => (
                      <li key={f.url}>
                        <a href={f.url} target="_blank" rel="noopener noreferrer">
                          {f.nombre || f.url} <Icons.external />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
