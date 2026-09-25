import { useEffect, useState } from 'react'
import { Icons } from '../../components/Icons'
import CarruselTarjetas from '../../components/CarruselTarjetas'
import { apiSaberPro, useData } from '../../context/DataContext'
import { useParametroURL } from '../../hooks/useParametroURL'
import {
  MODULOS_SABERPRO, CLAVES_MODULOS, ETIQUETA_MODULO,
  PUNTAJE_SABERPRO_MAX, fechaLarga,
} from '../../../shared/validacion'

/* Módulo Saber Pro.
 *
 * Todo lo que se pinta aquí sale del reporte del ICFES: cinco módulos
 * genéricos en escala 0–300 y un global que es su promedio simple. La página
 * NO recibe el listado completo de resultados —eso es dato personal y se queda
 * en el panel—, sino los agregados y los destacados que el servidor ya calculó.
 */

/* Un color por competencia, de la paleta institucional, estable en toda la
   página: la misma competencia es siempre el mismo color en la tabla, en el
   podio y en las barras. */
const COLOR_MODULO = {
  lectura_critica: 'var(--ug-azul)',
  razonamiento_cuantitativo: 'var(--ug-amarillo)',
  competencias_ciudadanas: 'var(--ug-flamingo)',
  comunicacion_escrita: 'var(--ug-marino-soft)',
  ingles: 'var(--ug-azul-deep)',
}

const num = v => (v === null || v === undefined ? '—' : String(v))

/* Barra proporcional al puntaje sobre la escala real del examen (0–300). Sin
   ese denominador una media de 150 y otra de 160 se verían casi iguales o muy
   distintas según el máximo que hubiera ese año, y no serían comparables entre
   años, que es justo lo que la tabla quiere dejar ver. */
function Barra({ valor, color, titulo }) {
  const pct = Math.max(0, Math.min(100, (Number(valor) / PUNTAJE_SABERPRO_MAX) * 100))
  return (
    <div className="sp-barra" title={titulo}>
      <i style={{ width: pct + '%', background: color }} />
    </div>
  )
}

/* Tono de cada puesto del podio. Del cuarto en adelante no hay tono y la
   ficha queda en gris: es lo que marca dónde acaban los tres primeros. */
const TONO_PUESTO = ['var(--ug-amarillo)', 'var(--ug-azul)', 'var(--ug-flamingo)']

const ETIQUETA_SEDE = { riohacha: 'Riohacha', maicao: 'Maicao' }

/* Iniciales del nombre, como en el organigrama: hacen de retrato mientras no
   haya fotos de los estudiantes. */
const iniciales = nombre =>
  String(nombre ?? '').split(' ').map(p => p[0])
    .filter(c => /[A-ZÁÉÍÓÚÑ]/.test(c ?? '')).slice(0, 2).join('')

function FichaDestacado({ e, puesto }) {
  const tono = TONO_PUESTO[puesto - 1]
  const esPodio = Boolean(tono)

  /* Las cinco competencias de este estudiante, de la más alta a la más baja:
     así la ficha cuenta en qué destaca, no repite siempre el mismo orden. */
  const competencias = CLAVES_MODULOS
    .map(k => ({ k, valor: Number(e[k]) }))
    .filter(c => Number.isFinite(c.valor))
    .sort((a, b) => b.valor - a.valor)

  return (
    <article className={'sp-ficha' + (esPodio ? ' sp-ficha--podio' : '')}
             style={tono ? { '--tono': tono } : undefined}>

      <div className="sp-ficha__cabeza">
        <div className="sp-ficha__avatar">
          {iniciales(e.estudiante)}
          {puesto === 1 && <span className="sp-ficha__estrella" aria-hidden="true">★</span>}
        </div>

        <div className="sp-ficha__ident">
          <h3 className="sp-ficha__nombre">{e.estudiante}</h3>
          <div className="sp-ficha__donde">
            <Icons.ubicacion />
            Sede {ETIQUETA_SEDE[e.sede] ?? e.sede} · Cohorte {e.anio}
          </div>
        </div>

        <span className="sp-puesto">
          {puesto === 1 && <span aria-hidden="true">🏆</span>}
          {puesto}.º lugar
        </span>
      </div>

      <div className="sp-global">
        <div>
          <div className="sp-global__label">Puntaje global Saber Pro</div>
          {/* La única frase que se puede sostener con lo que hay guardado: su
              posición dentro del programa. Nada de calificativos. */}
          <div className="sp-global__nota">
            {puesto === 1 ? 'El más alto del programa' : `${puesto}.º del programa`}
          </div>
        </div>
        <div className="sp-global__cifra">
          <div className="sp-global__valor">{e.puntaje_global}</div>
          <div className="sp-global__escala">de {PUNTAJE_SABERPRO_MAX} puntos</div>
        </div>
      </div>

      <div>
        <div className="sp-desglose__titulo">
          <span>Desempeño por competencia</span>
          <span>Puntaje / {PUNTAJE_SABERPRO_MAX}</span>
        </div>

        {competencias.map(c => (
          <div key={c.k} className="sp-comp-fila" style={{ '--tono': COLOR_MODULO[c.k] }}>
            <div className="sp-comp-fila__alto">
              <span className="sp-comp-fila__punto" aria-hidden="true" />
              <span className="sp-comp-fila__nombre">{ETIQUETA_MODULO[c.k]}</span>
              <span className="sp-comp-fila__valor">{c.valor}</span>
            </div>
            <div className="sp-comp-fila__barra">
              <i style={{ width: Math.max(0, Math.min(100, (c.valor / PUNTAJE_SABERPRO_MAX) * 100)) + '%' }} />
            </div>
          </div>
        ))}
      </div>

      <div className="sp-ficha__pie">
        <span>Saber Pro {e.periodo || e.anio}</span>
        <span>Reporte ICFES</span>
      </div>
    </article>
  )
}

function Destacados({ destacados, anio, sede, setSede, busqueda, setBusqueda, anios, setAnio }) {
  const general = destacados.general ?? []

  /* El filtro de sede y la búsqueda se aplican aquí y no en el servidor: son
     cinco tarjetas, y una llamada por cada tecla sería mucho ruido para nada. */
  const lista = general
    .filter(e => (sede === 'todas' ? true : e.sede === sede))
    .filter(e => e.estudiante.toLowerCase().includes(busqueda.trim().toLowerCase()))

  return (
    <section className="section" style={{ paddingTop: 34 }}>
      <div className="inner">

        <h2 className="doc-seccion__titulo">Estudiantes destacados</h2>

        <div className="sp-filtros">
          {/* Siempre visible, aunque de momento solo haya un año cargado:
              es el filtro por el que se pregunta al llegar. */}
          <div className="sp-seg" role="tablist" aria-label="Año">
            <button role="tab" aria-selected={anio === 'todos'}
                    className={anio === 'todos' ? 'is-activo' : ''}
                    onClick={() => setAnio('todos')}>Histórico</button>
            {anios.map(a => (
              <button key={a} role="tab" aria-selected={String(a) === String(anio)}
                      className={String(a) === String(anio) ? 'is-activo' : ''}
                      onClick={() => setAnio(String(a))}>Saber Pro {a}</button>
            ))}
          </div>

          <div className="sp-seg" role="tablist" aria-label="Sede">
            {[['todas', 'Ambas sedes'], ['riohacha', 'Riohacha'], ['maicao', 'Maicao']].map(([k, l]) => (
              <button key={k} role="tab" aria-selected={sede === k}
                      className={sede === k ? 'is-activo' : ''}
                      onClick={() => setSede(k)}>{l}</button>
            ))}
          </div>

          <div className="sp-buscador">
            <Icons.search />
            <input type="search" value={busqueda} onChange={ev => setBusqueda(ev.target.value)}
                   placeholder="Buscar estudiante por nombre…"
                   aria-label="Buscar estudiante por nombre" />
          </div>
        </div>

        <div className="sp-leyenda">
          <span className="sp-leyenda__label">
            {MODULOS_SABERPRO.length} competencias oficiales evaluadas:
          </span>
          <span className="sp-leyenda__items">
            {MODULOS_SABERPRO.map(([k, etiqueta]) => (
              <span key={k} className="sp-leyenda__item" style={{ '--tono': COLOR_MODULO[k] }}>
                <span className="sp-leyenda__punto" aria-hidden="true" />
                {etiqueta}
              </span>
            ))}
          </span>
        </div>

        {lista.length === 0 ? (
          <div className="sp-dest__vacio">
            {general.length === 0
              ? 'Todavía no hay resultados para destacar.'
              : 'Ningún destacado coincide con el filtro.'}
          </div>
        ) : (
          <div className="sp-fichas">
            {lista.map(e => (
              <FichaDestacado key={e.id} e={e} puesto={general.indexOf(e) + 1} />
            ))}
          </div>
        )}

        {/* Los podios por competencia siguen aquí: quien lidera Lectura
            Crítica puede no estar entre los cinco mejores globales, y si solo
            se pintaran las fichas de arriba ese reconocimiento se perdería. */}
        <div className="doc-seccion__titulo" style={{ margin: '44px 0 16px' }}>Por competencia</div>
        <div className="sp-competencias">
          {MODULOS_SABERPRO.map(([k, etiqueta]) => {
            const lista = destacados.competencias?.[k] ?? []
            return (
              <div key={k} className="sp-comp" style={{ '--tono': COLOR_MODULO[k] }}>
                <h3 className="sp-comp__titulo">{etiqueta}</h3>
                {lista.length === 0 && <p className="sp-comp__vacio">Sin datos.</p>}
                {lista.map((e, i) => (
                  <div key={e.id} className="sp-comp__fila">
                    <span className="sp-comp__pos">{i + 1}</span>
                    <span className="sp-comp__nombre">{e.estudiante}</span>
                    <span className="sp-comp__anio">{e.anio}</span>
                    <span className="sp-comp__puntaje">{e.puntaje}</span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* Explica la regla con los números que están guardados, no con un texto fijo:
   si el Consejo Académico cambia el acuerdo, la frase cambia sola. */
function reglaEnPalabras(p, aprobatorio) {
  if (aprobatorio?.modo === 'bases') {
    return 'igualar o superar el puntaje aprobatorio de cada competencia'
  }
  const partes = ['puntaje global de ' + p.puntaje_minimo + ' o más']
  if (p.percentil_minimo !== null) partes.push('percentil nacional desde ' + p.percentil_minimo)
  if (p.minimo_por_modulo !== null) partes.push('ninguna competencia por debajo de ' + p.minimo_por_modulo)
  return partes.join(', ')
}

/* El puntaje aprobatorio, competencia por competencia, con cuántos lo alcanzan.
 *
 * Es lo que convierte la lista de elegibles en algo que se puede leer: sin
 * estas cifras, quien mira la página ve nombres y no sabe contra qué se
 * midieron. La barra no es decoración —dice de un vistazo dónde se atasca la
 * promoción, que es la competencia con menos gente por encima de su base. */
function Aprobatorio({ aprobatorio, cumplimiento }) {
  if (aprobatorio?.modo !== 'bases') return null
  const evaluados = cumplimiento?.evaluados ?? 0

  return (
    <div className="sp-bases">
      <div className="sp-bases__cabeza">
        <div>
          <div className="sp-bases__titulo">Puntaje aprobatorio por competencia</div>
          <p className="sp-bases__nota">
            Se aprueba igualando o superando la base en <b>todas</b>. El general es el promedio
            de las cinco.
          </p>
        </div>
        <div className="sp-bases__general">
          <b>{aprobatorio.general}</b>
          <span>general</span>
        </div>
      </div>

      <ul className="sp-bases__lista">
        {MODULOS_SABERPRO.map(([k, etiqueta]) => {
          const alcanzan = cumplimiento?.[k] ?? null
          const parte = evaluados > 0 && alcanzan !== null ? Math.round((alcanzan / evaluados) * 100) : null
          return (
            <li key={k} className="sp-bases__item">
              <div className="sp-bases__fila">
                <span className="sp-bases__nombre">{etiqueta}</span>
                <span className="sp-bases__cifra">{aprobatorio.competencias[k]}</span>
              </div>
              {parte !== null && (
                <>
                  <div className="sp-bases__barra">
                    <span style={{ width: parte + '%' }} />
                  </div>
                  <div className="sp-bases__pie">{alcanzan} de {evaluados} la alcanzan · {parte}%</div>
                </>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Elegibles({ elegibles, parametros, aprobatorio, cumplimiento }) {
  return (
    <section className="section">
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Opción de grado por Saber Pro</div>
            <h2 style={{ marginTop: 10 }}>Quiénes alcanzan el puntaje.</h2>
          </div>
          <p className="desc">
            Estudiantes cuyo resultado cumple los requisitos vigentes para acogerse a la opción de
            grado por resultado en las pruebas Saber Pro.
          </p>
        </div>

        <Aprobatorio aprobatorio={aprobatorio} cumplimiento={cumplimiento} />

        <div className="sp-regla">
          <div className="sp-regla__icono"><Icons.check /></div>
          <div>
            <div className="sp-regla__titulo">
              Requisito vigente: {reglaEnPalabras(parametros, aprobatorio)}.
            </div>
            <div className="sp-regla__fuente">
              {aprobatorio?.modo === 'bases'
                ? 'Bases tomadas del reporte' + (aprobatorio.origen ? ' · ' + aprobatorio.origen : '')
                  + (aprobatorio.actualizado_en ? ' · leído el ' + fechaLarga(aprobatorio.actualizado_en) : '')
                : (parametros.norma || 'Norma por registrar en el panel')
                  + (parametros.vigente_desde ? ' · vigente desde ' + fechaLarga(parametros.vigente_desde) : '')}
            </div>
          </div>
          <div className="sp-regla__conteo">
            <b>{elegibles.length}</b>
            {elegibles.length === 1 ? 'estudiante' : 'estudiantes'}
          </div>
        </div>

        {elegibles.length === 0 ? (
          <div className="eg-vacio">
            <Icons.archivo />
            <span>Ningún resultado cargado alcanza todavía el puntaje requerido.</span>
          </div>
        ) : (
          <div className="sp-tabla-marco">
            <table className="sp-tabla sp-tabla--elegibles">
              <thead>
                <tr>
                  <th scope="col">Estudiante</th>
                  <th scope="col" className="sp-num">Año</th>
                  <th scope="col" className="sp-num">Global</th>
                  {MODULOS_SABERPRO.map(([k, etiqueta, sigla]) => (
                    <th key={k} scope="col" className="sp-num" title={etiqueta}>{sigla}</th>
                  ))}
                  <th scope="col" className="sp-num">Percentil</th>
                </tr>
              </thead>
              <tbody>
                {elegibles.map(e => (
                  <tr key={e.id}>
                    <th scope="row" className="sp-nombre">{e.estudiante}</th>
                    <td className="sp-num">{e.anio}</td>
                    <td className="sp-num"><span className="sp-pildora">{e.puntaje_global}</span></td>
                    {CLAVES_MODULOS.map(k => (
                      <td key={k} className="sp-num" title={ETIQUETA_MODULO[k]}>{e[k]}</td>
                    ))}
                    <td className="sp-num">{e.percentil_nacional !== null ? e.percentil_nacional + '%' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default function SaberPro() {
  /* Dos fuentes, y cada una por su razón: los resultados se piden aparte
     porque dependen del año elegido, y las tarjetas del carrusel vienen con el
     resto del sitio, que ya está cargado cuando se abre la página. */
  const { data } = useData()
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')
  const [anio, setAnio] = useParametroURL('anio', 'todos')
  /* Sede y búsqueda no van a la URL: filtran cinco tarjetas ya cargadas y no
     merecen ensuciar la dirección ni recargar del servidor. */
  const [sede, setSede] = useState('todas')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    let vivo = true
    setError('')
    apiSaberPro(anio === 'todos' ? undefined : anio)
      .then(d => { if (vivo) setDatos(d) })
      .catch(e => { if (vivo) setError(e.message) })
    return () => { vivo = false }
  }, [anio])

  if (error) {
    return (
      <div className="page-in section">
        <div className="inner vac-error">
          <h1>No se pudieron cargar los resultados</h1>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!datos) {
    return (
      <div className="page-in section">
        <div className="inner" style={{ color: 'var(--ink-3)' }}>Cargando resultados Saber Pro…</div>
      </div>
    )
  }

  const hayDatos = datos.total > 0

  /* Las tarjetas del carrusel llegan con el resto del sitio por /api/all, no
     con los resultados: son contenido editorial de la página, no un dato del
     examen. Solo vienen las visibles. */
  const tarjetas = data.tarjetas?.['saber-pro'] ?? []

  /* Las tres cifras de cabecera salen de lo cargado: ninguna está escrita a
     mano, así que registrar un resultado en el panel las mueve solas. */
  const CIFRAS = [
    { k: 'total', tono: 'acento', valor: datos.total, etiqueta: datos.total === 1 ? 'Resultado cargado' : 'Resultados cargados' },
    { k: 'anios', valor: datos.desde === datos.hasta ? datos.desde : datos.desde + '–' + datos.hasta, etiqueta: 'Años con registro' },
    { k: 'grado', tono: 'ambar', valor: datos.elegibles.length, etiqueta: 'Alcanzan el grado por puntaje' },
  ]

  return (
    <div className="page-in" style={{ padding: 'clamp(28px,4vw,44px) var(--gutter) 0' }}>
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>

        <nav className="miga" aria-label="Ruta de navegación">
          <span>Comunidad</span>
          <span aria-hidden="true">/</span>
          <span className="miga__actual">Saber Pro</span>
        </nav>

        <header className={'hero-card' + (tarjetas.length > 0 ? ' hero-card--split' : '')}>
          <div className="hero-card__patron" aria-hidden="true" />
          <div className="hero-card__columnas">
          <div className="hero-card__contenido">
            <p className="hero-card__insignia">
              <span className="hero-card__punto" aria-hidden="true" />
              Pruebas de Estado ICFES
            </p>

            <h1 className="hero-card__titulo">
              Resultados Saber Pro <span>del programa.</span>
            </h1>

            <p className="hero-card__texto">
              Las pruebas Saber Pro evalúan cinco competencias genéricas en una escala de 0 a 300.
              El puntaje global es el promedio simple de las cinco.
            </p>
            <p className="hero-card__texto" style={{ marginTop: 12 }}>
              Reconocimiento a la excelencia académica. Conoce a los estudiantes con mejores
              resultados globales y el desglose de su desempeño en cada una de las cinco
              competencias evaluadas.
            </p>

            {hayDatos && (
              <dl className="hero-card__cifras">
                {CIFRAS.map(c => (
                  <div key={c.k} className={'hero-card__cifra' + (c.tono ? ' hero-card__cifra--' + c.tono : '')}>
                    <dt>{c.valor}</dt>
                    <dd>{c.etiqueta}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* El costado cuenta en tarjetas lo que no cabe en el titular: el
              puntaje aprobatorio, cómo se lee el examen, lo que el programa
              quiera destacar del período. Se carga desde el panel. Sin
              tarjetas no se pinta la columna: un hueco al lado del titular se
              lee como un fallo de carga. */}
          {tarjetas.length > 0 && (
            <aside className="hero-card__lateral">
              <CarruselTarjetas tarjetas={tarjetas} etiqueta="Tarjetas sobre las pruebas Saber Pro" />
            </aside>
          )}
          </div>
        </header>
      </div>

      {!hayDatos ? (
        <section className="section">
          <div className="inner">
            <div className="eg-vacio">
              <Icons.archivo />
              <span>
                Todavía no hay resultados Saber Pro cargados. La coordinación los registra desde el
                panel de administración.
              </span>
            </div>
          </div>
        </section>
      ) : (
        <>
          <Destacados destacados={datos.destacados}
                      anio={anio} setAnio={setAnio} anios={datos.anios}
                      sede={sede} setSede={setSede}
                      busqueda={busqueda} setBusqueda={setBusqueda} />
          <Elegibles elegibles={datos.elegibles} parametros={datos.parametros}
                     aprobatorio={datos.aprobatorio} cumplimiento={datos.cumplimiento} />
        </>
      )}
    </div>
  )
}
