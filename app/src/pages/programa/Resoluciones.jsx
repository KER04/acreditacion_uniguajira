/* Marco legal del programa: registro calificado, acreditación y los actos
   administrativos que los rodean.

   Misma cabecera que /pensum y /pensum-propuesto —migas y hero-card con la
   franja tejida—. Los datos salen de la base (migración 025) y se editan en
   el panel, pestaña «Resoluciones».

   Las dos resoluciones que enmarcan el programa no van en la lista. Van en
   tarjeta con banda de color porque no son dos filas más: son la razón de ser
   de la página. Son el acto más reciente de cada categoría; los anteriores
   (un registro renovado, una acreditación previa) bajan a la lista.

   Los botones de descarga solo aparecen si hay documento: antes había
   «Descargar PDF» y «Ver en SACES» que no llevaban a ninguna parte.

   Pulsar una tarjeta abre la ficha flotante del acto (FichaActo): el resumen
   de qué trata y el documento a mano. El botón de PDF de la tarjeta sigue
   yendo directo al archivo sin pasar por la ficha. */
import { useState } from 'react'
import { useData } from '../../context/DataContext'
import FichaActo from '../../components/FichaActo'
import { Icons } from '../../components/Icons'
import { WayuuBackdrop } from '../../components/WayuuPatterns'
import { fechaLarga } from '../../../shared/validacion'

const PRINCIPALES = [
  { categoria: 'registro', eyebrow: 'Registro calificado', color: 'var(--ug-azul)' },
  { categoria: 'acreditacion', eyebrow: 'Acreditación de alta calidad', color: 'var(--ug-amarillo)' },
]

/* El color de la franja dice qué órgano lo expidió, sin gastar una línea en
   repetirlo. Los cuatro tonos son los de la marca, como en el resto del sitio. */
function tonoDe(organo) {
  const o = String(organo).toLowerCase()
  if (o.includes('ministerio') || o.includes('men')) return 'terracota'
  if (o.includes('superior')) return 'marino'
  if (o.includes('rector')) return 'ambar'
  if (o.includes('académico') || o.includes('academico')) return 'azul'
  return 'neutro'
}

const COLOR_TONO = {
  azul: 'var(--ug-azul)', ambar: 'var(--ug-amarillo)', terracota: 'var(--ug-flamingo)',
  marino: 'var(--ug-marino-soft)', neutro: 'var(--paper-3)',
}

/* Props para que una tarjeta se comporte como botón: clic, Enter y espacio. */
const abre = fn => ({
  role: 'button',
  tabIndex: 0,
  onClick: fn,
  onKeyDown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn() } },
})

function Documento({ acto, fuerte = false, corto = false }) {
  if (!acto.enlace) return null
  const esArchivo = Boolean(acto.archivo_id)
  return (
    <a className={'doc-boton' + (fuerte ? ' doc-boton--fuerte' : '')}
       href={esArchivo ? acto.descarga : acto.enlace} target="_blank" rel="noopener noreferrer"
       onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}
       aria-label={(esArchivo ? 'Descargar ' : 'Ver ') + acto.referencia}>
      {esArchivo ? <Icons.download /> : <Icons.external />}
      {corto ? (esArchivo ? 'PDF' : 'Ver') : (esArchivo ? 'Descargar PDF' : 'Ver documento')}
    </a>
  )
}

export default function Resoluciones() {
  const { data } = useData()
  const actos = data.actos ?? []
  const [abierto, setAbierto] = useState(null)

  const principales = PRINCIPALES
    .map(p => ({ ...p, acto: actos.find(a => a.categoria === p.categoria) }))
    .filter(p => p.acto)
  const idsPrincipales = new Set(principales.map(p => p.acto.id))
  const otros = actos.filter(a => !idsPrincipales.has(a.id))

  const registro = principales.find(p => p.categoria === 'registro')?.acto
  const acreditacion = principales.find(p => p.categoria === 'acreditacion')?.acto

  return (
    <div className="page-in pagina-con-margen" style={{ padding: 'clamp(28px,4vw,44px) var(--gutter) 0' }}>
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>

        <nav className="miga" aria-label="Ruta de navegación">
          <span>Programa</span>
          <span aria-hidden="true">/</span>
          <span className="miga__actual">Resoluciones</span>
        </nav>

        <header className="hero-card">
          <div className="hero-card__patron" aria-hidden="true" />
          <div className="hero-card__contenido">
            <h1 className="hero-card__titulo">
              Marco legal <span>del programa.</span>
            </h1>

            {/* Los rótulos salen de los actos: si uno vence, su pastilla se va. */}
            <div className="doc-card__etiquetas" style={{ marginTop: 20 }}>
              <span className="doc-pin doc-pin--azul">SNIES 17579</span>
              {registro && !registro.vencido && <span className="doc-pin doc-pin--azul">Registro calificado vigente</span>}
              {acreditacion && !acreditacion.vencido && <span className="doc-pin doc-pin--ambar">Acreditado en alta calidad</span>}
            </div>
          </div>
        </header>

        {principales.length > 0 && (
          <section className="doc-seccion">
            <div className="resolucion-grid">
              {principales.map(({ categoria, eyebrow, color, acto }) => (
                <article key={categoria} className="resolucion resolucion--abre"
                         aria-label={`Ver resumen de ${acto.referencia}`}
                         {...abre(() => setAbierto({ acto, color }))}>
                  <div className="resolucion__banda" style={{ background: color }}>
                    <WayuuBackdrop variant="a" />
                    <div className="resolucion__tipo">{eyebrow}</div>
                    <div className="resolucion__numero">{acto.tipo} N.º {acto.numero}</div>
                  </div>

                  <div className="resolucion__cuerpo">
                    <dl className="resolucion__datos">
                      {acto.fecha && <div><dt>Fecha</dt><dd>{fechaLarga(acto.fecha)}</dd></div>}
                      {(acto.vigencia || acto.fecha_fin) && (
                        <div>
                          <dt>{acto.vencido ? 'Venció' : 'Vigencia'}</dt>
                          <dd>{[acto.vigencia, acto.fecha_fin && `hasta ${fechaLarga(acto.fecha_fin)}`].filter(Boolean).join(', ')}</dd>
                        </div>
                      )}
                      {acto.expedido_por && (
                        <div style={{ gridColumn: '1 / -1' }}><dt>Expedida por</dt><dd>{acto.expedido_por}</dd></div>
                      )}
                    </dl>

                    {acto.descripcion && <p className="resolucion__texto">{acto.descripcion}</p>}

                    <div className="resolucion__acciones">
                      <span className="acto__mas">Ver resumen <Icons.arrow /></span>
                      <Documento acto={acto} fuerte />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {otros.length > 0 && (
          <section className="doc-seccion">
            <h2 className="doc-seccion__titulo">Otros actos administrativos</h2>
            <p className="doc-seccion__desc">Resoluciones, acuerdos y demás actos que rigen el programa.</p>

            <div className="actos-grid">
              {otros.map(a => (
                <article key={a.id} className="acto acto--abre"
                         aria-label={`Ver resumen de ${a.referencia}`}
                         {...abre(() => setAbierto({ acto: a, color: COLOR_TONO[tonoDe(a.expedido_por)] }))}>
                  <div className={'acto__acento acto__acento--' + tonoDe(a.expedido_por)} />
                  <div className="acto__cuerpo">
                    <div className="acto__organo">{[a.tipo, a.expedido_por].filter(Boolean).join(' · ')}</div>
                    <div className="acto__numero">{a.numero || a.tipo}</div>
                    <p className="acto__asunto">{a.asunto}</p>

                    <div className="acto__pie">
                      <span className="acto__fecha">{a.fecha ? fechaLarga(a.fecha) : ''}{a.vencido ? ' · vencido' : ''}</span>
                      <Documento acto={a} corto />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <div style={{ height: 70 }} />
      </div>

      {abierto && <FichaActo acto={abierto.acto} color={abierto.color} onCerrar={() => setAbierto(null)} />}
    </div>
  )
}
