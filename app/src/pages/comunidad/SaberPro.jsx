import { useEffect, useState } from 'react'
import { Icons } from '../../components/Icons'
import TramaMarca from '../../components/TramaMarca'
import { apiSaberPro } from '../../context/DataContext'
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

function Medias({ medias }) {
  if (medias.length === 0) return null

  return (
    <section className="section" style={{ paddingTop: 20 }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Media por año</div>
            <h2 style={{ marginTop: 10 }}>Cómo se mueve el programa.</h2>
          </div>
          <p className="desc">
            Promedio del programa en cada competencia, año por año. La escala del examen va de 0 a
            300 y el puntaje global es el promedio simple de las cinco competencias.
          </p>
        </div>

        <div className="sp-tabla-marco">
          <table className="sp-tabla">
            <thead>
              <tr>
                <th scope="col">Año</th>
                <th scope="col" className="sp-num">Evaluados</th>
                <th scope="col">Global</th>
                {MODULOS_SABERPRO.map(([k, etiqueta, sigla]) => (
                  <th key={k} scope="col" className="sp-num" title={etiqueta}>{sigla}</th>
                ))}
                <th scope="col" className="sp-num">Mín · Máx</th>
              </tr>
            </thead>
            <tbody>
              {medias.map(m => (
                <tr key={m.anio}>
                  <th scope="row" className="sp-anio">{m.anio}</th>
                  <td className="sp-num">{m.evaluados}</td>
                  <td className="sp-global">
                    <span className="sp-global__n">{num(m.puntaje_global)}</span>
                    <Barra valor={m.puntaje_global} color="var(--ug-marino)"
                           titulo={'Global ' + m.anio + ': ' + m.puntaje_global + ' de 300'} />
                  </td>
                  {CLAVES_MODULOS.map(k => (
                    <td key={k} className="sp-num">
                      <span className="sp-celda__n">{num(m[k])}</span>
                      <Barra valor={m[k]} color={COLOR_MODULO[k]}
                             titulo={ETIQUETA_MODULO[k] + ' ' + m.anio + ': ' + m[k] + ' de 300'} />
                    </td>
                  ))}
                  <td className="sp-num sp-extremos">{num(m.minimo)} · {num(m.maximo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sp-leyenda">
          {MODULOS_SABERPRO.map(([k, etiqueta, sigla]) => (
            <span key={k} className="sp-leyenda__item">
              <i style={{ background: COLOR_MODULO[k] }} /> <b>{sigla}</b> {etiqueta}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function Destacados({ destacados }) {
  const general = destacados.general ?? []
  if (general.length === 0) return null

  return (
    <section className="section" style={{ background: 'var(--paper-2)' }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Estudiantes destacados</div>
            <h2 style={{ marginTop: 10 }}>Los mejores puntajes.</h2>
          </div>
          <p className="desc">
            Por media general y por cada competencia evaluada. Un estudiante puede destacar en una
            competencia sin liderar el global, y al revés.
          </p>
        </div>

        <div className="eyebrow" style={{ marginBottom: 16 }}>Por media general</div>
        <div className="sp-podio">
          {general.map((e, i) => (
            <article key={e.id} className="sp-podio__tarjeta" style={{ '--puesto': i === 0 ? 'var(--ug-amarillo)' : i === 1 ? 'var(--ug-azul)' : 'var(--ug-flamingo)' }}>
              <TramaMarca escala={74} opacidad={0.07}
                          tono={i === 0 ? 'var(--ug-amarillo)' : i === 1 ? 'var(--ug-azul)' : 'var(--ug-flamingo)'} />
              <div className="sp-podio__cuerpo">
                <div className="sp-podio__puesto">{i + 1}°</div>
                <div className="sp-podio__nombre">{e.estudiante}</div>
                <div className="sp-podio__puntaje">{e.puntaje}</div>
                <div className="sp-podio__escala">de {PUNTAJE_SABERPRO_MAX} · {e.anio}</div>
              </div>
            </article>
          ))}
        </div>

        <div className="eyebrow" style={{ margin: '44px 0 16px' }}>Por competencia</div>
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
function reglaEnPalabras(p) {
  const partes = ['puntaje global de ' + p.puntaje_minimo + ' o más']
  if (p.percentil_minimo !== null) partes.push('percentil nacional desde ' + p.percentil_minimo)
  if (p.minimo_por_modulo !== null) partes.push('ninguna competencia por debajo de ' + p.minimo_por_modulo)
  return partes.join(', ')
}

function Elegibles({ elegibles, parametros }) {
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

        <div className="sp-regla">
          <div className="sp-regla__icono"><Icons.check /></div>
          <div>
            <div className="sp-regla__titulo">Requisito vigente: {reglaEnPalabras(parametros)}.</div>
            <div className="sp-regla__fuente">
              {parametros.norma || 'Norma por registrar en el panel'}
              {parametros.vigente_desde && ' · vigente desde ' + fechaLarga(parametros.vigente_desde)}
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
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')
  const [anio, setAnio] = useParametroURL('anio', 'todos')

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

  return (
    <div className="page-in">
      <header className="sp-cabecera">
        <TramaMarca blanco escala={118} opacidad={0.12} />
        <div className="inner">
          <div className="eyebrow sp-cabecera__eyebrow">Comunidad · Saber Pro</div>
          <h1 className="sp-cabecera__titulo">Resultados Saber Pro del programa.</h1>
          <p className="sp-cabecera__texto">
            Las pruebas Saber Pro evalúan cinco competencias genéricas en una escala de 0 a 300. El
            puntaje global es el promedio simple de las cinco.
          </p>

          {hayDatos && (
            <div className="sp-cifras">
              <div><b>{datos.total}</b><span>resultados cargados</span></div>
              <div><b>{datos.desde}–{datos.hasta}</b><span>años con registro</span></div>
              <div><b>{datos.elegibles.length}</b><span>alcanzan el grado por puntaje</span></div>
            </div>
          )}
        </div>
      </header>

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
          {datos.anios.length > 1 && (
            <section className="section" style={{ paddingTop: 40, paddingBottom: 0 }}>
              <div className="inner">
                <div className="eyebrow" style={{ marginBottom: 12 }}>Filtrar por año</div>
                <div className="sp-anios">
                  <button className={'btn ' + (anio === 'todos' ? 'accent' : 'ghost')}
                          onClick={() => setAnio('todos')} aria-pressed={anio === 'todos'}>
                    Todos los años
                  </button>
                  {datos.anios.map(a => (
                    <button key={a} className={'btn ' + (String(a) === String(anio) ? 'accent' : 'ghost')}
                            onClick={() => setAnio(String(a))} aria-pressed={String(a) === String(anio)}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          <Medias medias={datos.medias} />
          <Destacados destacados={datos.destacados} />
          <Elegibles elegibles={datos.elegibles} parametros={datos.parametros} />
        </>
      )}
    </div>
  )
}
