/* Vista Egresados — el trámite de grado.
 *
 * Distinta de Graduados a propósito. En el uso colombiano son dos momentos:
 * el *egresado* terminó el plan y está en trámite; el *graduado* ya tiene el
 * título. Esta página es para el primero y reúne las cuatro cosas que busca:
 * por dónde graduarse, qué norma lo rige, qué prácticas hay abiertas y sobre
 * qué puede investigar.
 *
 * El diseño es el de la propuesta de actualización curricular —migas, la
 * hero-card con su franja tejida y sus cifras, los tokens --doc-* — porque
 * las dos son páginas de consulta institucional y no hay razón para que se
 * vean distintas. Lo propio de aquí son las tarjetas, con prefijo `grado-`:
 * el prefijo `eg-` ya es de Graduados.
 *
 * Todo sale de la base y se edita desde el panel. Dos bloques se leen de
 * tablas que ya existían —las modalidades del módulo Estudiantes y las
 * prácticas del de Convocatorias—, así que se editan en su sitio de siempre
 * y aquí solo se muestran: un único catálogo, sin copias que se contradigan.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icons } from '../../components/Icons'
import { useData } from '../../context/DataContext'
import { usePestana } from '../../hooks/useParametroURL'
import { fechaLarga } from '../../../shared/validacion'

/* ─── Piezas compartidas ───────────────────────────────────────── */

function Pin({ tono = 'neutro', children }) {
  return <span className={`doc-pin doc-pin--${tono}`}>{children}</span>
}

function Seccion({ titulo, desc, children }) {
  return (
    <section className="doc-seccion">
      <h2 className="doc-seccion__titulo">{titulo}</h2>
      {desc && <p className="doc-seccion__desc">{desc}</p>}
      {children}
    </section>
  )
}

function Vacio({ children }) {
  return <div className="doc-vacio">{children}</div>
}

function Chip({ activo, onClick, children, n }) {
  return (
    <button className={'doc-chip' + (activo ? ' is-activo' : '')}
            onClick={onClick} aria-pressed={activo}>
      {children}
      {n !== undefined && <span className="doc-chip__n">{n}</span>}
    </button>
  )
}

function Requisitos({ items }) {
  if (!items?.length) return null
  return (
    <ul className="doc-card__requisitos">
      {items.map((r, j) => <li key={j}><Icons.check /> {r}</li>)}
    </ul>
  )
}

/* ─── Modalidades de grado ─────────────────────────────────────── */

function Modalidades() {
  const { data } = useData()
  const modalidades = data.modalidades_grado ?? []

  return (
    <Seccion
      titulo="Modalidades de grado"
      desc="Escoge la que mejor se ajuste a tu perfil y al tiempo del que dispones. Todas exigen paz y salvo financiero y dominio de lengua extranjera en nivel B1.">

      {modalidades.length === 0 ? (
        <Vacio>Todavía no hay modalidades publicadas.</Vacio>
      ) : (
        <div className="doc-grid">
          {modalidades.map(m => (
            <article key={m.id} className="doc-card">
              {/* El color lo pone el panel, así que va en línea y no como
                  modificador: cada modalidad elige el suyo de la paleta. */}
              <div className="doc-card__acento" style={{ background: m.color || 'var(--ug-azul)' }} />
              <div className="doc-card__cuerpo">
                <h3 className="doc-card__titulo">{m.nombre}</h3>
                {m.descripcion && <p className="doc-card__texto">{m.descripcion}</p>}
                <Requisitos items={m.requisitos} />

                <div className="doc-card__pie">
                  <span className="doc-card__dato">
                    {m.duracion ? 'Duración · ' + m.duracion : 'Duración sin definir'}
                  </span>
                  {m.documento_url && (
                    <a className="doc-boton" href={m.documento_url} target="_blank" rel="noopener noreferrer">
                      <Icons.download /> Guía
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </Seccion>
  )
}

/* ─── Normativas ───────────────────────────────────────────────── */

function Normativas() {
  const { data } = useData()
  const todas = data.normativas ?? []
  const [verDerogadas, setVerDerogadas] = useState(false)

  const vigentes = todas.filter(n => n.vigente)
  const derogadas = todas.filter(n => !n.vigente)
  const lista = verDerogadas ? derogadas : vigentes

  return (
    <Seccion
      titulo="Normativa aplicable"
      desc="Acuerdos, resoluciones y reglamentos que rigen el trámite. Descarga el texto completo antes de radicar cualquier solicitud: los requisitos que cuentan son los de la norma, no los del resumen.">

      {/* Las derogadas no se borran: los trámites viejos las siguen citando. */}
      {derogadas.length > 0 && (
        <div className="doc-filtros" role="tablist" aria-label="Vigencia de las normas">
          <Chip activo={!verDerogadas} onClick={() => setVerDerogadas(false)} n={vigentes.length}>Vigentes</Chip>
          <Chip activo={verDerogadas} onClick={() => setVerDerogadas(true)} n={derogadas.length}>Derogadas</Chip>
        </div>
      )}

      {lista.length === 0 ? (
        <Vacio>{verDerogadas ? 'No hay normas derogadas registradas.' : 'Todavía no hay normativa publicada.'}</Vacio>
      ) : (
        <div className="doc-lista">
          {lista.map(n => (
            <div key={n.id} className={'doc-norma' + (n.vigente ? '' : ' is-apagada')}>
              <div className="doc-norma__ref">
                <b>{n.tipo}</b>
                <span>{n.numero || (n.anio ?? '—')}</span>
              </div>

              <div className="doc-norma__cuerpo">
                <div className="doc-norma__titulo">
                  {n.titulo}
                  {!n.vigente && <> <Pin tono="terracota">Derogada</Pin></>}
                </div>
                {n.descripcion && <p className="doc-norma__desc">{n.descripcion}</p>}
                {(n.expedida_por || n.anio) && (
                  <div className="doc-norma__fuente">
                    {[n.expedida_por, n.anio].filter(Boolean).join(' · ')}
                  </div>
                )}
              </div>

              {/* `descarga` apunta al PDF de la base o, si es un enlace
                  externo, a la URL tal cual. */}
              {n.descarga
                ? <a className="doc-boton" href={n.descarga} target="_blank" rel="noopener noreferrer">
                    <Icons.download /> Abrir
                  </a>
                : <button className="doc-boton" disabled title="Sin documento cargado">
                    <Icons.download /> Sin documento
                  </button>}
            </div>
          ))}
        </div>
      )}
    </Seccion>
  )
}

/* ─── Convocatorias de prácticas ───────────────────────────────── */

/* Son las convocatorias de categoría "Prácticas", filtradas por el servidor.
   No hay tabla aparte: se publican desde el módulo Convocatorias del panel.

   Una cerrada o con el plazo vencido no debe competir por la atención con
   las que todavía se pueden aprovechar, pero tampoco se esconde: sirve de
   referencia de lo que suele salir. */
const practicaAbierta = p => p.estado !== 'Cerrada' && !p.vencida

/* Fuera del componente a propósito: definida dentro, React la trataría como
   un tipo nuevo en cada render y volvería a montar todas las tarjetas. */
function TarjetaPractica({ p, apagada }) {
  return (
    <article className={'doc-card' + (apagada ? ' is-apagada' : '')}>
      <div className={'doc-card__acento doc-card__acento--' + (apagada ? 'neutro' : 'azul')} />
      <div className="doc-card__cuerpo">
        <div className="doc-card__etiquetas">
          <Pin tono={apagada ? 'neutro' : 'azul'}>{p.estado}</Pin>
          {p.vencida && p.estado !== 'Cerrada' && <Pin tono="terracota">Plazo vencido</Pin>}
          {p.dirigida_a && <Pin tono="neutro">{p.dirigida_a}</Pin>}
        </div>

        <h3 className="doc-card__titulo">{p.titulo}</h3>
        {p.descripcion && <p className="doc-card__texto">{p.descripcion}</p>}
        <Requisitos items={p.requisitos} />

        <div className="doc-card__pie">
          <span className="doc-card__dato">
            {p.fecha_cierre ? 'Cierra ' + fechaLarga(p.fecha_cierre) : 'Sin fecha de cierre'}
          </span>
          <div className="doc-card__acciones">
            {p.documento_url && (
              <a className="doc-boton" href={p.documento_url} target="_blank" rel="noopener noreferrer">
                <Icons.download /> Términos
              </a>
            )}
            {p.url_postulacion && !apagada && (
              <a className="doc-boton doc-boton--fuerte" href={p.url_postulacion} target="_blank" rel="noopener noreferrer">
                Postularme <Icons.external />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

function Practicas() {
  const { data } = useData()
  const todas = data.practicas ?? []
  const abiertas = todas.filter(practicaAbierta)
  const pasadas = todas.filter(p => !practicaAbierta(p))

  return (
    <Seccion
      titulo="Convocatorias de prácticas"
      desc="Práctica empresarial, pasantía y prácticas sociales. Revisa los requisitos antes de postularte: casi todas piden estar a paz y salvo académico y haber cursado un mínimo de créditos.">

      {todas.length === 0 ? (
        <Vacio>Ahora mismo no hay convocatorias de prácticas publicadas.</Vacio>
      ) : (
        <>
          {abiertas.length === 0
            ? <Vacio>No hay convocatorias abiertas en este momento. Abajo quedan las anteriores como referencia.</Vacio>
            : <div className="doc-grid doc-grid--ancha">{abiertas.map(p => <TarjetaPractica key={p.id} p={p} />)}</div>}

          {pasadas.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <h3 className="doc-seccion__titulo">Cerradas</h3>
              <div className="doc-grid doc-grid--ancha">
                {pasadas.map(p => <TarjetaPractica key={p.id} p={p} apagada />)}
              </div>
            </div>
          )}
        </>
      )}
    </Seccion>
  )
}

/* ─── Ideas de investigación ───────────────────────────────────── */

/* Cada estado con su color, el mismo criterio que la línea de tiempo del
   trámite: azul lo que se puede tomar, ámbar lo que está andando. El mismo
   tono tiñe la pastilla y la franja lateral de la tarjeta. */
const TONO_ESTADO = {
  Disponible: 'azul',
  'En curso': 'ambar',
  Tomada: 'neutro',
  Terminada: 'marino',
}

function Ideas() {
  const { data } = useData()
  const todas = data.ideas_investigacion ?? []

  /* Las líneas no son un catálogo cerrado: salen de lo que hay publicado, así
     que el filtro se adapta solo cuando el panel añade una línea nueva. */
  const lineas = [...new Set(todas.map(i => i.linea).filter(Boolean))].sort()
  const [linea, setLinea] = useState('')
  const [soloLibres, setSoloLibres] = useState(true)

  const lista = todas
    .filter(i => (linea ? i.linea === linea : true))
    .filter(i => (soloLibres ? i.disponible : true))

  /* Cada chip cuenta lo que quedaría al pulsarlo, respetando el otro filtro.
     Así "Todas las líneas" no muestra el total de la línea ya seleccionada. */
  const visibles = todas.filter(i => (soloLibres ? i.disponible : true))
  const cuantas = l => visibles.filter(i => i.linea === l).length

  return (
    <Seccion
      titulo="Ideas de investigación"
      desc="Temas que los docentes del programa proponen como punto de partida para el trabajo de grado. No son propuestas cerradas: escribe al tutor y conversa la idea antes de radicarla.">

      {todas.length > 0 && (
        <div className="doc-filtros">
          <Chip activo={soloLibres} onClick={() => setSoloLibres(s => !s)}>Solo disponibles</Chip>
          {lineas.length > 0 && (
            <>
              <Chip activo={linea === ''} onClick={() => setLinea('')} n={visibles.length}>Todas las líneas</Chip>
              {lineas.map(l => (
                <Chip key={l} activo={linea === l} onClick={() => setLinea(l)} n={cuantas(l)}>{l}</Chip>
              ))}
            </>
          )}
        </div>
      )}

      {lista.length === 0 ? (
        <Vacio>
          {todas.length === 0
            ? 'Todavía no hay ideas publicadas.'
            : 'Ninguna idea coincide con el filtro. Prueba quitando «solo disponibles» o cambiando de línea.'}
        </Vacio>
      ) : (
        <div className="doc-grid doc-grid--ancha">
          {lista.map(i => (
            <article key={i.id} className={'doc-card' + (i.disponible ? '' : ' is-apagada')}>
              <div className={'doc-card__acento doc-card__acento--' + (TONO_ESTADO[i.estado] ?? 'neutro')} />
              <div className="doc-card__cuerpo">
                <div className="doc-card__etiquetas">
                  <Pin tono={TONO_ESTADO[i.estado] ?? 'neutro'}>{i.estado}</Pin>
                  <Pin tono="neutro">{i.dificultad}</Pin>
                  {i.linea && <Pin tono="neutro">{i.linea}</Pin>}
                </div>

                <h3 className="doc-card__titulo">{i.titulo}</h3>
                {i.descripcion && <p className="doc-card__texto">{i.descripcion}</p>}

                {(i.palabras ?? []).length > 0 && (
                  <div className="doc-tags">
                    {i.palabras.map((p, j) => <span key={j} className="doc-tag">#{p}</span>)}
                  </div>
                )}

                <div className="doc-card__pie">
                  <div className={'grado-tutor' + (i.docente ? '' : ' grado-tutor--vacante')}>
                    {i.docente ? <>Propuesta por <b>{i.docente}</b></> : 'Tutor por asignar'}
                    {i.modalidad && <div className="doc-card__dato">Apunta a {i.modalidad}</div>}
                  </div>
                  {i.contacto && (
                    <a className="doc-boton" href={i.contacto.includes('@') ? 'mailto:' + i.contacto : i.contacto}>
                      <Icons.mail /> Escribir
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </Seccion>
  )
}

/* ─── Página ───────────────────────────────────────────────────── */

const TABS = [
  ['modalidades', 'Modalidades de grado'],
  ['normativas', 'Normativas'],
  ['practicas', 'Prácticas'],
  ['ideas', 'Ideas de investigación'],
]

const SECCIONES = {
  modalidades: Modalidades,
  normativas: Normativas,
  practicas: Practicas,
  ideas: Ideas,
}

export default function Egresados() {
  /* En la URL, como en el resto del sitio: recargar no devuelve a la primera
     pestaña y se puede enlazar directo (#/egresados?seccion=ideas). */
  const [tab, setTab] = usePestana(TABS, { clave: 'seccion' })
  const { data } = useData()
  const Actual = SECCIONES[tab] ?? Modalidades

  const modalidades = (data.modalidades_grado ?? []).length
  const normativas = (data.normativas ?? []).filter(n => n.vigente).length
  const practicas = (data.practicas ?? []).filter(p => p.estado !== 'Cerrada' && !p.vencida).length
  const ideas = (data.ideas_investigacion ?? []).filter(i => i.disponible).length

  const CUENTA = { modalidades, normativas, practicas, ideas }

  /* Las cuatro cifras de cabecera salen de los mismos datos que pinta cada
     sección: ninguna está escrita a mano, así que publicar algo en el panel
     las mueve solas. */
  const CIFRAS = [
    { k: 'modalidades', tono: 'acento', valor: modalidades, etiqueta: 'Modalidades de grado' },
    { k: 'normativas', valor: normativas, etiqueta: 'Normas vigentes' },
    { k: 'practicas', tono: 'ambar', valor: practicas, etiqueta: 'Convocatorias de prácticas abiertas' },
    { k: 'ideas', tono: 'acento', valor: ideas, etiqueta: 'Ideas de investigación libres' },
  ]

  return (
    <div className="page-in">
      <div className="grado-page">

        <nav className="miga" aria-label="Ruta de navegación">
          <span>Comunidad</span>
          <span aria-hidden="true">/</span>
          <span className="miga__actual">Egresados · trámite de grado</span>
        </nav>

        <header className="hero-card">
          <div className="hero-card__patron" aria-hidden="true" />
          <div className="hero-card__contenido">

            <p className="hero-card__insignia">
              <span className="hero-card__punto" aria-hidden="true" />
              Egresados · en trámite de grado
            </p>

            <h1 className="hero-card__titulo">
              Terminaste las materias. <span>Esto es lo que sigue.</span>
            </h1>

            <p className="hero-card__texto">
              Aquí está reunido el trámite completo: las modalidades entre las que puedes escoger,
              la norma que rige cada una, las prácticas abiertas y las ideas de investigación que
              proponen los docentes. Es la etapa entre terminar el plan de estudios y recibir el
              título — <b>se es egresado desde que se cursa la última asignatura y graduado solo
              después de la ceremonia</b>, y lo que necesita cada uno es distinto.
            </p>

            <dl className="hero-card__cifras">
              {CIFRAS.map(c => (
                <div key={c.k} className={'hero-card__cifra' + (c.tono ? ` hero-card__cifra--${c.tono}` : '')}>
                  <dt>{c.valor}</dt>
                  <dd>{c.etiqueta}</dd>
                </div>
              ))}
            </dl>

            <Link className="hero-card__cta" to="/graduados">
              ¿Ya recibiste el título? Pasa a Graduados
              <span aria-hidden="true">→</span>
            </Link>

          </div>
        </header>

        {/* Panel de secciones: el equivalente de los filtros y la dona en la
            propuesta curricular. Dice cuánto hay en cada bloque antes de
            entrar, para no tener que abrirlos uno por uno. */}
        <div className="grado-panel">
          <div className="doc-chips" role="tablist" aria-label="Secciones del trámite de grado">
            {TABS.map(([k, l]) => (
              <Chip key={k} activo={tab === k} onClick={() => setTab(k)} n={CUENTA[k]}>{l}</Chip>
            ))}
          </div>
          <p className="grado-panel__nota">
            Las cifras cuentan lo que está disponible hoy: normas vigentes, convocatorias con el
            plazo abierto e ideas que nadie ha tomado. Si algo cambia en el panel, cambia aquí.
          </p>
        </div>

        <Actual />
      </div>
    </div>
  )
}
