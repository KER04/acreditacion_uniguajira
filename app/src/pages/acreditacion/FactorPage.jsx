/* Ficha de un factor de la autoevaluación.
 *
 * Misma cabecera que el resto del sitio —migas y hero-card con la franja
 * tejida— y debajo los bloques del informe. Cada bloque se dibuja SOLO si el
 * factor trae ese dato: hoy el detalle completo está cargado para el factor 1
 * y los demás muestran lo que tengan, sin huecos.
 */
import { Icons } from '../../components/Icons'
import CircularProgress from './CircularProgress'
import {
  STATUS_LABELS, STATUS_COLOR, STATUS_LETRA, statusFromScore, judgmentFromScore, imagenFactor,
} from '../../data/acreditacion'

const CAT_COLOR = {
  Evidencia: 'var(--ug-azul)', Anexo: 'var(--ug-marino)', Normativa: 'var(--ug-amarillo)',
  Informe: 'var(--ug-flamingo)', Otro: 'var(--ink-3)',
}

/* Los cuatro tonos de la marca, con su tinte y su color de texto, para que un
   bloque solo tenga que decir "ambar" y no repetir tres variables. */
const TONO = {
  azul:      { fondo: 'var(--doc-azul-tint)',      borde: 'color-mix(in oklab, var(--ug-azul) 32%, transparent)',      texto: 'var(--doc-azul-texto)' },
  marino:    { fondo: 'var(--doc-neutro-tint)',    borde: 'color-mix(in oklab, var(--ug-marino) 32%, transparent)',    texto: 'var(--ug-marino)' },
  ambar:     { fondo: 'var(--doc-ambar-tint)',     borde: 'color-mix(in oklab, var(--ug-amarillo) 42%, transparent)',  texto: 'var(--doc-ambar-texto)' },
  terracota: { fondo: 'var(--doc-terracota-tint)', borde: 'color-mix(in oklab, var(--ug-flamingo) 32%, transparent)',  texto: 'var(--doc-terracota-texto)' },
}
const vars = t => {
  const x = TONO[t] ?? TONO.azul
  return { '--fondo-tono': x.fondo, '--borde-tono': x.borde, '--texto-tono': x.texto }
}

const coma = n => String(n).replace('.', ',')

function Seccion({ titulo, desc, children, ...resto }) {
  return (
    <section className="fac-seccion" {...resto}>
      <h2 className="doc-seccion__titulo">{titulo}</h2>
      {desc && <p className="doc-seccion__desc">{desc}</p>}
      {children}
    </section>
  )
}

function DocRow({ doc }) {
  const ext = doc.url ? doc.url.split('.').pop().toUpperCase().slice(0, 4) : 'DOC'
  const catColor = CAT_COLOR[doc.cat] ?? 'var(--ug-azul)'
  return (
    <div className="doc-norma doc-norma--evidencia">
      <span className="doc-norma__ref" style={{ width: 54 }}>
        <b style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 6, background: `color-mix(in oklab, ${catColor} 18%, var(--paper))`, fontSize: 9 }}>{ext}</b>
      </span>
      <div className="doc-norma__cuerpo">
        <div className="doc-norma__titulo">{doc.nombre ?? doc.t}</div>
        {(doc.desc ?? doc.d) && <p className="doc-norma__desc">{doc.desc ?? doc.d}</p>}
        {doc.cat && <div className="doc-norma__fuente">{doc.cat}</div>}
      </div>
      <span className="doc-card__dato">{doc.fecha ?? doc.f ?? ''}</span>
      {doc.url
        ? <a className="doc-boton" href={doc.url} target="_blank" rel="noopener noreferrer"><Icons.download /> Abrir</a>
        : <button className="doc-boton" disabled title="Sin documento cargado"><Icons.download /> Sin documento</button>}
    </div>
  )
}

/* ─── Bloques de datos de una característica ────────────────────
   El informe desarrolla cada característica con sus propias barras, tablas y
   notas al margen. En vez de escribir una sección a medida por característica
   —serían 48 en los doce factores— cada bloque declara su tipo y aquí se
   decide cómo se pinta. */

const mil = n => Number(n).toLocaleString('es-CO')

/* Color sólido de cada tono, para barras y viñetas. */
const SOLIDO = {
  azul: 'var(--ug-azul)', marino: 'var(--ug-marino)',
  ambar: 'var(--ug-amarillo)', terracota: 'var(--ug-flamingo)',
}
const solido = t => SOLIDO[t] ?? SOLIDO.marino

/* El valor de una barra: siempre con separador de miles y coma decimal
   (1.418, 95,9), y detrás la unidad si la hay (90 %, 7.168 Mbps). */
const valorDe = (v, unidad) => mil(v) + (unidad ? ' ' + unidad : '')

function BloqueBarras({ b }) {
  const max = b.max ?? Math.max(...b.items.map(i => Number(i.v)))
  return (
    <div className="fac-bloque">
      {b.titulo && <div className="fac-bloque__titulo">{b.titulo}</div>}
      <div className="fac-barrasH">
        {b.items.map(i => (
          <div key={i.l} className="fac-barraH" style={{ '--tono': solido(i.tono) }}>
            <span className="fac-barraH__l">{i.l}</span>
            <span className="fac-barraH__pista">
              <i style={{ width: Math.max(0, Math.min(100, (Number(i.v) / max) * 100)) + '%' }} />
            </span>
            <span className="fac-barraH__v">{valorDe(i.v, b.unidad)}</span>
          </div>
        ))}
      </div>
      {b.nota && <p className="fac-bloque__nota">{b.nota}</p>}
    </div>
  )
}

function BloqueTabla({ b }) {
  /* Las columnas que no son la primera se alinean a la derecha, porque casi
     siempre son cifras. Una columna marcada 'txt' en b.alin vuelve a leerse
     como texto corrido. */
  const esTexto = i => b.alin?.[i] === 'txt'
  return (
    <div className="fac-bloque">
      {b.titulo && <div className="fac-bloque__titulo">{b.titulo}</div>}
      {/* En el teléfono la tabla se desliza dentro de su marco en vez de
          empujar la página: las cifras no se parten y no caben todas. */}
      <div className="tabla-desliza fac-tabla-marco">
      <table className="fac-tabla">
        <thead>
          <tr>{b.cols.map((c, i) => <th key={c} className={esTexto(i) ? 'es-txt' : undefined}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {b.filas.map(fila => (
            <tr key={String(fila[0])}>
              {fila.map((celda, i) => <td key={i} className={esTexto(i) ? 'es-txt' : undefined}>{celda}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {b.nota && <p className="fac-bloque__nota">{b.nota}</p>}
    </div>
  )
}

function BloqueCifras({ b }) {
  return (
    <div className="fac-bloque">
      {b.titulo && <div className="fac-bloque__titulo">{b.titulo}</div>}
      <div className="fac-cifras" style={{ marginTop: 0 }}>
        {b.items.map(c => <div key={c.v + c.l} className="fac-cifra"><b>{c.v}</b><span>{c.l}</span></div>)}
      </div>
      {b.nota && <p className="fac-bloque__nota">{b.nota}</p>}
    </div>
  )
}

function BloqueDato({ b }) {
  return (
    <div className="fac-bloque">
      <div className="fac-dato-solo" style={{ '--tono': solido(b.tono ?? 'azul') }}>
        <span className="fac-dato-solo__v">{b.v}</span>
        <span className="fac-dato-solo__l">{b.l}</span>
      </div>
    </div>
  )
}

function BloqueNota({ b }) {
  return (
    <div className="fac-bloque">
      <div className="fac-callout" style={vars(b.tono)}>
        <span className="fac-callout__k">{b.k}</span>
        <span className="fac-callout__v">{b.v}</span>
      </div>
    </div>
  )
}

function BloqueLista({ b }) {
  return (
    <div className="fac-bloque">
      {b.titulo && <div className="fac-bloque__titulo">{b.titulo}</div>}
      <ul className="fac-lista" style={{ '--tono': solido(b.tono) }}>
        {b.items.map(x => <li key={x}><span className="fac-lista__punto" aria-hidden="true" />{x}</li>)}
      </ul>
      {b.nota && <p className="fac-bloque__nota">{b.nota}</p>}
    </div>
  )
}

function BloqueImpacto({ b }) {
  return (
    <div className="fac-bloque">
      {b.titulo && <div className="fac-bloque__titulo">{b.titulo}</div>}
      <div className="fac-impacto">
        {b.items.map(i => (
          <div key={i.k} className="fac-ind" style={vars(i.tono)}>
            <div className="fac-ind__k">{i.k}</div>
            <div className="fac-ind__salto">
              {i.de
                ? <><span className="fac-ind__de">{i.de}</span>
                    <span className="fac-ind__flecha" aria-hidden="true">→</span>
                    <span className="fac-ind__a">{i.a}</span></>
                : <span className="fac-ind__a">{i.valor}</span>}
            </div>
            <div className="fac-ind__l">{i.l}</div>
          </div>
        ))}
      </div>
      {b.nota && <p className="fac-bloque__nota">{b.nota}</p>}
    </div>
  )
}

/* Dos series medidas sobre lo mismo —las dos sedes, casi siempre—. Cada fila
   lleva sus dos barras juntas para que la diferencia se vea sin buscarla. */
function BloquePares({ b }) {
  const max = b.max ?? Math.max(...b.items.flatMap(i => i.v.map(Number)))
  return (
    <div className="fac-bloque">
      {b.titulo && <div className="fac-bloque__titulo">{b.titulo}</div>}
      <div className="fac-pares__leyenda">
        {b.series.map(s => (
          <span key={s.l} style={{ '--tono': solido(s.tono) }}><i aria-hidden="true" />{s.l}</span>
        ))}
      </div>
      <div className="fac-pares">
        {b.items.map(i => (
          <div key={i.l} className="fac-par">
            <span className="fac-barraH__l">{i.l}</span>
            <div className="fac-par__barras">
              {b.series.map((s, k) => (
                <div key={s.l} className="fac-par__fila" style={{ '--tono': solido(s.tono) }}>
                  <span className="fac-barraH__pista" title={s.l}>
                    <i style={{ width: Math.max(0, Math.min(100, (Number(i.v[k]) / max) * 100)) + '%' }} />
                  </span>
                  <span className="fac-barraH__v">{valorDe(i.v[k], b.unidad)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {b.nota && <p className="fac-bloque__nota">{b.nota}</p>}
    </div>
  )
}

/* Nombres sueltos —países, redes, aliados— que no piden frase ni cifra. */
function BloqueEtiquetas({ b }) {
  return (
    <div className="fac-bloque">
      {b.titulo && <div className="fac-bloque__titulo">{b.titulo}</div>}
      <div className="fac-tendencias">
        {b.items.map(x => (
          <span key={x} className="fac-tendencia" style={vars(b.tono)}><i aria-hidden="true" /> {x}</span>
        ))}
      </div>
      {b.nota && <p className="fac-bloque__nota">{b.nota}</p>}
    </div>
  )
}

/* ─── Esquemas ──────────────────────────────────────────────────
   Diagramas del informe —marcos normativos, niveles del currículo, modelo
   pedagógico— redibujados con cajas del sistema en vez de pegar la imagen:
   así se leen en el teléfono, siguen el tema oscuro y se pueden corregir. */

/* Tinte, borde y texto del tono, más su color sólido para rótulos e iconos. */
const tonoCompleto = t => (t ? { ...vars(t), '--solido': solido(t) } : undefined)

/* Filas de cajas. Entre una fila y la siguiente baja una flecha; dentro de la
   fila, `une` pone un conector entre cajas («→») cuando una lleva a la otra.
   `izq` y `der` son rótulos sueltos a los lados de la fila. */
function FilasEsquema({ filas }) {
  return filas.map((f, i) => (
    <div key={i} className="fac-esq__tramo">
      {i > 0 && <div className="fac-esq__baja" aria-hidden="true">↓</div>}
      <div className="fac-esq__fila">
        {f.izq && <span className="fac-esq__lado fac-esq__lado--izq">{f.izq}</span>}
        {f.cajas.map((caja, j) => {
          const c = typeof caja === 'string' ? { t: caja } : caja
          return (
            <div key={c.t} className="fac-esq__paso">
              {j > 0 && f.une && <span className="fac-esq__une" aria-hidden="true">{f.une}</span>}
              <div className={'fac-esq__caja' + (c.d ? ' con-detalle' : '') + (c.fuerte ? ' is-fuerte' : '')}
                   style={tonoCompleto(c.tono)}>
                <b>{c.t}</b>
                {c.d && <span>{c.d}</span>}
              </div>
            </div>
          )
        })}
        {f.der && <span className="fac-esq__lado fac-esq__lado--der">{f.der}</span>}
      </div>
    </div>
  ))
}

/* Un esquema suelto: filas de cajas y, si acaso, una nota de cierre. */
function BloqueEsquema({ b }) {
  return (
    <div className="fac-bloque">
      {b.titulo && <div className="fac-bloque__titulo">{b.titulo}</div>}
      <div className="fac-esq">
        <FilasEsquema filas={b.filas} />
      </div>
      {b.pie && (
        <div className="fac-callout" style={{ ...vars(b.pie.tono), marginTop: 16 }}>
          <span className="fac-callout__k">{b.pie.k}</span>
          <span className="fac-callout__v">{b.pie.v}</span>
        </div>
      )}
      {b.nota && <p className="fac-bloque__nota">{b.nota}</p>}
    </div>
  )
}

/* Niveles apilados: cada franja lleva su rótulo a un lado y sus cajas dentro.
   `lado: 'izq'` pone el rótulo a la izquierda; por defecto va a la derecha.
   `cierre` es el recuadro final al que desemboca todo. */
function BloqueNiveles({ b }) {
  return (
    <div className="fac-bloque">
      {b.titulo && <div className="fac-bloque__titulo">{b.titulo}</div>}
      <div className={'fac-niveles' + (b.lado === 'izq' ? ' fac-niveles--izq' : '')}>
        {b.niveles.map((n, i) => (
          <div key={n.k} className="fac-esq__tramo">
            {i > 0 && <div className="fac-esq__baja" aria-hidden="true">↓</div>}
            <div className="fac-nivel" style={tonoCompleto(n.tono)}>
              <div className="fac-nivel__rotulo"><b>{n.k}</b>{n.sub && <span>{n.sub}</span>}</div>
              <div className="fac-nivel__cuerpo"><FilasEsquema filas={n.filas} /></div>
            </div>
          </div>
        ))}
        {b.cierre && (
          <div className="fac-esq__tramo">
            <div className="fac-esq__baja" aria-hidden="true">↓</div>
            <div className="fac-nivel-cierre" style={tonoCompleto(b.cierre.tono ?? 'ambar')}>
              <div className="fac-nivel-cierre__k">{b.cierre.k}</div>
              <p className="fac-nivel-cierre__v">{b.cierre.v}</p>
            </div>
          </div>
        )}
      </div>
      {b.nota && <p className="fac-bloque__nota">{b.nota}</p>}
    </div>
  )
}

/* Iconos de las tarjetas de pilares. Viven aquí porque solo los usa este
   bloque; el resto del sitio no tiene libro ni engranaje. */
const trazo = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }
const ICONO_PILAR = {
  libro: <svg {...trazo}><path d="M12 6.5C10.2 5.2 7.6 4.8 4 5v13c3.6-.2 6.2.2 8 1.5 1.8-1.3 4.4-1.7 8-1.5V5c-3.6-.2-6.2.2-8 1.5zM12 6.5v13"/></svg>,
  engranaje: <svg {...trazo}><circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/></svg>,
  persona: <svg {...trazo}><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.6-3.6 3.4-5.5 7-5.5s6.4 1.9 7 5.5"/></svg>,
  grupo: <svg {...trazo}><circle cx="8" cy="9" r="2.8"/><circle cx="16.5" cy="9.5" r="2.3"/><path d="M2.5 19c.5-3 2.7-4.6 5.5-4.6s5 1.6 5.5 4.6M15 14.6c2.9-.3 5.6 1.1 6.5 4.4"/></svg>,
}

/* Tarjetas de pilares: icono, nombre, qué significa y cómo se concreta. La
   `cadena` de arriba dice de dónde viene cada pilar hasta llegar al aula. */
function BloquePilares({ b }) {
  return (
    <div className="fac-bloque">
      {b.titulo && <div className="fac-bloque__titulo">{b.titulo}</div>}
      {b.cadena?.length > 0 && (
        <div className="fac-cadena">
          {b.cadena.map((x, i) => (
            <span key={x}>{i > 0 && <i aria-hidden="true">→</i>}{x}</span>
          ))}
        </div>
      )}
      <div className="fac-pilares">
        {b.items.map(p => (
          <article key={p.t} className="fac-pilar" style={tonoCompleto(p.tono)}>
            <div className="fac-pilar__icono" aria-hidden="true">{ICONO_PILAR[p.icono] ?? ICONO_PILAR.libro}</div>
            <h4 className="fac-pilar__t">{p.t}</h4>
            <div className="fac-pilar__sub">{p.sub}</div>
            {p.detalles?.map(d => <p key={d} className="fac-pilar__d">{d}</p>)}
          </article>
        ))}
      </div>
      {b.nota && <p className="fac-bloque__nota">{b.nota}</p>}
    </div>
  )
}

const BLOQUES = {
  barras: BloqueBarras, tabla: BloqueTabla, cifras: BloqueCifras,
  dato: BloqueDato, nota: BloqueNota, lista: BloqueLista, impacto: BloqueImpacto,
  pares: BloquePares, etiquetas: BloqueEtiquetas,
  esquema: BloqueEsquema, niveles: BloqueNiveles, pilares: BloquePilares,
}

function Bloque({ b }) {
  const Pinta = BLOQUES[b.tipo]
  return Pinta ? <Pinta b={b} /> : null
}

/* El desarrollo de una característica: su encabezado con la calificación y el
   peso, y debajo sus bloques en el orden en que vienen. */
function CaracteristicaDetalle({ c }) {
  const st = c.status ?? statusFromScore(c.score ?? c.calificacion)
  return (
    <section className="fac-caract-seccion" style={{ '--tono': STATUS_COLOR[st] }}>
      <div className="fac-caract-seccion__cab">
        <span className="fac-caract-seccion__n">Característica {String(c.n).replace('C', '')}</span>
        <div className="fac-caract-seccion__textos">
          <h3 className="fac-caract-seccion__titulo">{c.name}</h3>
          {c.desc && <p className="fac-caract-seccion__desc">{c.desc}</p>}
        </div>
        <div className="fac-caract-seccion__cifra">
          <div className="fac-caract-seccion__score">{coma(c.score ?? c.calificacion)}</div>
          {c.peso ? <div className="fac-caract-seccion__peso">peso {coma(c.peso)}</div> : null}
        </div>
      </div>
      {c.bloques.map((b, i) => <Bloque key={i} b={b} />)}
    </section>
  )
}

export default function FactorPage({ factor, allFactores, onBack, onNavigate }) {
  const prev = allFactores.find(x => x.n === factor.n - 1)
  const next = allFactores.find(x => x.n === factor.n + 1)
  const status = statusFromScore(factor.score)
  const color = STATUS_COLOR[status]

  const docs = factor.documentos?.length ? factor.documentos : []
  const evidencias = factor.evidencias ?? []
  const anexos = factor.anexos ?? []

  const ev = factor.evolucion ?? []
  const delta = ev.length > 1 ? ev[ev.length - 1].score - ev[0].score : null

  const caso = factor.caso
  /* Los pesos de las características normalmente suman 100, pero el factor 2
     los trae sumando 101 en la fuente. Se usa el total real para que el peso
     de cada una se lea sobre la base correcta. */
  const pesoTotal = factor.pesoTotal
    ?? (factor.caracteristicas ?? []).reduce((a, c) => a + (Number(c.peso) || 0), 0)
  const conDetalle = (factor.caracteristicas ?? []).filter(c => c.bloques?.length)
  const pert = factor.pertinencia

  /* Las cuatro cifras de cabecera salen del propio factor. */
  const CIFRAS = [
    { k: 'score', tono: 'acento', valor: coma(factor.score.toFixed(2)), etiqueta: STATUS_LABELS[status] + ' · ' + STATUS_LETRA[status] },
    { k: 'pond', valor: factor.ponderacion ? coma(factor.ponderacion.toFixed(2)) + ' %' : '—', etiqueta: 'Ponderación del programa' },
    { k: 'caract', tono: 'acento', valor: factor.caracteristicas?.length ?? 0, etiqueta: 'Características evaluadas' },
    { k: 'escala', tono: 'ambar', valor: '0–100', etiqueta: 'Escala · 90 o más es pleno' },
  ]

  return (
    <div className="page-in pagina-con-margen" style={{ padding: 'clamp(28px,4vw,44px) var(--gutter) 0' }}>
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>

        <nav className="miga" aria-label="Ruta de navegación">
          <span>Acreditación</span>
          <span aria-hidden="true">/</span>
          <button onClick={onBack}
                  style={{ background: 'none', border: 0, padding: 0, font: 'inherit', color: 'inherit', cursor: 'pointer' }}>
            Los doce factores
          </button>
          <span aria-hidden="true">/</span>
          <span className="miga__actual">Factor {String(factor.n).padStart(2, '0')}</span>
        </nav>

        <header className="hero-card">
          <div className="hero-card__patron" aria-hidden="true" />
          {/* Ilustración del factor como franja: la imagen es cuadrada y se
              recorta al centro. Decorativa, por eso alt vacío. */}
          <img className="fac-hero__img" src={imagenFactor(factor.n)} alt="" decoding="async" fetchpriority="high" />
          <div className="hero-card__contenido">
            {/* El título a la izquierda y la calificación en su anillo a la
                derecha, el mismo del tablero, para que el número se vea antes
                de leer nada. */}
            <div className="fac-hero">
              <div className="fac-hero__textos">
                <p className="hero-card__insignia">
                  <span className="hero-card__punto" aria-hidden="true" />
                  Factor {String(factor.n).padStart(2, '0')} · Acuerdo 02 de 2020 del CESU
                </p>

                <h1 className="hero-card__titulo">{factor.t}</h1>

                {factor.summary && <p className="hero-card__texto">{factor.summary}</p>}
              </div>
              <div className="fac-hero__anillo" role="img"
                   aria-label={`Calificación del factor: ${coma(factor.score.toFixed(2))} sobre 100`}>
                <CircularProgress value={factor.score} size={190} stroke={12}
                                  texto={coma(factor.score.toFixed(2))}
                                  label="CALIFICACIÓN · 0–100" />
              </div>
            </div>

            <dl className="hero-card__cifras">
              {CIFRAS.map(c => (
                <div key={c.k} className={'hero-card__cifra' + (c.tono ? ' hero-card__cifra--' + c.tono : '')}>
                  <dt>{c.valor}</dt>
                  <dd>{c.etiqueta}</dd>
                </div>
              ))}
            </dl>

            <button className="hero-card__cta" onClick={onBack}>
              <span aria-hidden="true">←</span> Volver al tablero
            </button>
          </div>
        </header>

        {/* ── Evolución ── */}
        {ev.length > 0 && (
          <Seccion titulo="Evolución de la calificación"
                   desc="Mediciones consecutivas bajo modelos de evaluación sucesivos. No son el mismo factor con el mismo nombre: cada modelo lo define a su manera, y por eso cada medición lleva el suyo.">
            <div className="fac-evolucion">
              {ev.map((m, i) => (
                <div key={m.anio} className={'fac-medicion' + (i === ev.length - 1 ? ' is-actual' : '')}>
                  <div className="fac-medicion__anio">{m.anio}</div>
                  <div className="fac-medicion__score">{coma(m.score.toFixed(2))}</div>
                  <div className="fac-medicion__barra"><i style={{ width: m.score + '%' }} /></div>
                  <div className="fac-medicion__modelo">{m.modelo}</div>
                  <div className="fac-medicion__factor">{m.factor}</div>
                </div>
              ))}
            </div>
            {delta !== null && (
              <div className="fac-delta">
                <b>{delta > 0 ? '+' : ''}{coma(delta.toFixed(2))}</b>
                <span>puntos entre {ev[0].anio} y {ev[ev.length - 1].anio}</span>
              </div>
            )}
          </Seccion>
        )}

        {/* ── Comparación con la medición anterior ── */}
        {factor.comparativo && (
          <Seccion titulo={factor.comparativo.titulo} desc={factor.comparativo.bajada}>
            <div className="fac-evolucion">
              {[factor.comparativo.antes, factor.comparativo.despues].map((m, i) => (
                <div key={m.modelo} className={'fac-medicion' + (i === 1 ? ' is-actual' : '')}>
                  <div className="fac-medicion__anio">{i === 0 ? 'Anterior' : 'Actual'}</div>
                  <div className="fac-medicion__score">{coma(m.score)}</div>
                  <div className="fac-medicion__barra"><i style={{ width: m.score + '%' }} /></div>
                  <div className="fac-medicion__modelo">{m.modelo}</div>
                  <div className="fac-medicion__factor">{m.juicio}</div>
                </div>
              ))}
            </div>
            <div className="fac-delta">
              <b>+{coma((factor.comparativo.despues.score - factor.comparativo.antes.score).toFixed(2))}</b>
              <span>puntos entre una medición y la otra</span>
            </div>
          </Seccion>
        )}

        {/* ── Características ── */}
        {factor.caracteristicas?.length > 0 && (
          <Seccion titulo="Características del factor"
                   desc={`La calificación del factor sale de estas ${factor.caracteristicas.length}, cada una con su peso dentro del factor.`}>
            <div className="fac-caracts">
              {factor.caracteristicas.map(c => {
                const st = c.status ?? statusFromScore(c.score ?? c.calificacion)
                return (
                  <article key={c.n} className="fac-caract" style={{ '--tono': STATUS_COLOR[st] }}>
                    <div className="fac-caract__alto">
                      <div>
                        <div className="fac-caract__n">Característica {String(c.n).replace('C', '')}</div>
                        <h3 className="fac-caract__nombre">{c.name}</h3>
                      </div>
                      <div className="fac-caract__cifra">
                        <div className="fac-caract__score">{coma(c.score ?? c.calificacion)}</div>
                        {c.peso ? <div className="fac-caract__peso">peso {coma(c.peso)} de {coma(pesoTotal)}</div> : null}
                      </div>
                    </div>
                    <span className={'doc-pin doc-pin--' + (st === 'pleno' ? 'azul' : st === 'alto' ? 'ambar' : 'terracota')}
                          style={{ alignSelf: 'flex-start' }}>
                      {c.juicio ?? judgmentFromScore(c.score ?? c.calificacion)}
                    </span>
                    {c.desc && <p className="fac-caract__desc">{c.desc}</p>}
                  </article>
                )
              })}
            </div>
          </Seccion>
        )}

        {/* ── Desarrollo de cada característica ── */}
        {conDetalle.length > 0 && (
          <Seccion titulo="Desarrollo por característica"
                   desc="Lo que respalda cada calificación, con los datos y las fuentes del informe.">
            {conDetalle.map(c => <CaracteristicaDetalle key={c.n} c={c} />)}
          </Seccion>
        )}

        {/* ── Fortalezas ── */}
        {factor.fortalezas?.length > 0 && (
          <Seccion titulo="Fortalezas" desc="Las que recoge el informe de autoevaluación para este factor.">
            <ul className="fac-lista" style={{ '--tono': 'var(--ug-azul)' }}>
              {factor.fortalezas.map((f, i) => (
                <li key={i}><span className="fac-lista__punto" aria-hidden="true" />{f}</li>
              ))}
            </ul>
          </Seccion>
        )}

        {/* ── Marco normativo ── */}
        {factor.marco && (
          <Seccion titulo="El PEP y su marco normativo"
                   desc="Tres marcos lo sostienen: el nacional que lo exige, el institucional que lo orienta y el prospectivo que lo proyecta.">
            <div className="fac-marco">
              {factor.marco.marcos.map(m => (
                <div key={m.k} className="fac-marco__caja" style={vars(m.tono)}>
                  <div className="fac-marco__k">{m.k}</div>
                  <div className="fac-marco__v">{m.v}</div>
                </div>
              ))}
            </div>
            {factor.marco.apropiacion && (
              <div className="fac-remate">
                Más del <b>{factor.marco.apropiacion} %</b> de docentes y estudiantes conoce o participó
                en la actualización del PEP
              </div>
            )}
          </Seccion>
        )}

        {/* ── Coherencia de misiones ── */}
        {factor.coherencia?.length > 0 && (
          <Seccion titulo="Coherencia entre la misión institucional y la del programa"
                   desc="Lo que promete la Universidad y cómo lo concreta el programa, frase por frase.">
            <div className="fac-coherencia">
              <div className="fac-coherencia__cab">
                <div>Misión institucional · PPEI 2017–2030</div>
                <div>Misión del programa · PEP</div>
              </div>
              {factor.coherencia.map((f, i) => (
                <div key={i} className="fac-coherencia__fila">
                  <div>{f.institucional}</div>
                  <div>{f.programa}</div>
                </div>
              ))}
            </div>
          </Seccion>
        )}

        {/* ── Funciones misionales ── */}
        {factor.misionales?.length > 0 && (
          <Seccion titulo="Articulación de las funciones misionales"
                   desc="Dónde se ve el PEP dentro del plan de estudios.">
            <div className="fac-misionales">
              {factor.misionales.map(m => (
                <div key={m.k} className="fac-marco__caja" style={vars(m.tono)}>
                  <div className="fac-marco__k">{m.k}</div>
                  <div className="fac-marco__v" style={{ fontWeight: 400, fontSize: 13.5 }}>{m.v}</div>
                </div>
              ))}
            </div>
          </Seccion>
        )}

        {/* ── El caso: del principio a la decisión ── */}
        {caso && (
          <Seccion titulo={caso.titulo} desc={caso.bajada}>
            <div className="fac-pasos">
              {caso.pasos.map(p => (
                <div key={p.k} className="fac-paso" style={vars(p.tono)}>
                  <div className="fac-paso__k">{p.k}</div>
                  <div className="fac-paso__v">{p.v}</div>
                </div>
              ))}
            </div>

            {caso.efecto && (
              <div className="fac-efecto">
                <div className="doc-seccion__titulo" style={{ margin: '0 0 4px' }}>{caso.efecto.titulo}</div>
                <p className="doc-seccion__desc" style={{ marginBottom: 22 }}>{caso.efecto.bajada}</p>

                <div className="fac-efecto__salto">
                  <div className="fac-efecto__lado fac-efecto__lado--antes">
                    <div className="fac-efecto__valor">{coma(caso.efecto.antes.valor)} %</div>
                    <div className="fac-efecto__etiqueta">{caso.efecto.antes.etiqueta}</div>
                  </div>
                  <span className="fac-efecto__flecha" aria-hidden="true">→</span>
                  <div className="fac-efecto__lado fac-efecto__lado--despues">
                    <div className="fac-efecto__valor">{coma(caso.efecto.despues.valor)} %</div>
                    <div className="fac-efecto__etiqueta">{caso.efecto.despues.etiqueta}</div>
                  </div>
                </div>

                <div className="fac-barras">
                  {caso.efecto.cohortes.map(c => (
                    <div key={c.c} className={'fac-barra' + (c.despues ? ' is-despues' : '')}>
                      <span className="fac-barra__v">{c.v} %</span>
                      {/* Altura sobre 40 %, que deja aire por encima del pico de 37 %. */}
                      <span className="fac-barra__caja" style={{ height: (c.v / 40) * 100 + '%' }} />
                      <span className="fac-barra__c">{c.c}</span>
                    </div>
                  ))}
                </div>
                {caso.efecto.hito && <p className="fac-efecto__hito">↑ {caso.efecto.hito}</p>}

                {caso.efecto.distinguidos && (
                  <div className="fac-distinguidos">
                    <div className="fac-distinguidos__titular">
                      <b>{caso.efecto.distinguidos.texto}</b>
                      <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 3 }}>
                        Promedio del grupo {caso.efecto.distinguidos.promedio}
                      </div>
                    </div>
                    <div className="fac-distinguidos__lista">
                      {caso.efecto.distinguidos.nombres.map(d => (
                        <div key={d.n} className="fac-distinguidos__uno">
                          <div className="fac-distinguidos__p">{d.p}</div>
                          <div className="fac-distinguidos__n">{d.n}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Seccion>
        )}

        {/* ── Pertinencia: tendencias ── */}
        {pert?.tendencias && (
          <Seccion titulo={pert.tendencias.titulo} desc={pert.tendencias.nota}>
            <div className="fac-tendencias">
              {pert.tendencias.items.map((t, i) => (
                <span key={t} className="fac-tendencia" style={vars(['azul', 'marino', 'ambar', 'terracota'][i % 4])}>
                  <i aria-hidden="true" /> {t}
                </span>
              ))}
            </div>
            {pert.tendencias.cifras?.length > 0 && (
              <div className="fac-cifras">
                {pert.tendencias.cifras.map(c => (
                  <div key={c.v} className="fac-cifra"><b>{c.v}</b><span>{c.l}</span></div>
                ))}
              </div>
            )}
          </Seccion>
        )}

        {/* ── Pertinencia: comparabilidad ── */}
        {pert?.comparabilidad && (
          <Seccion titulo={pert.comparabilidad.titulo}
                   desc="El plan se contrastó con tres programas de referencia; de ahí salieron los ajustes de la reforma.">
            <div className="fac-referentes">
              {pert.comparabilidad.referentes.map(r => (
                <div key={r.u} className="fac-referente">
                  <div className="fac-referente__u">{r.u}</div>
                  <div className="fac-referente__p">{r.p}</div>
                </div>
              ))}
            </div>

            <div className="doc-seccion__titulo" style={{ margin: '26px 0 10px' }}>Ajustes curriculares resultantes</div>
            <div className="doc-card__etiquetas">
              {pert.comparabilidad.ajustes.map(a => (
                <span key={a} className="doc-pin doc-pin--neutro">{a}</span>
              ))}
            </div>

            {pert.comparabilidad.cambios?.length > 0 && (
              <div className="fac-cambios">
                {pert.comparabilidad.cambios.map(c => (
                  <div key={c.l} className="fac-cambio">
                    <div className="fac-cambio__nums">{c.de}<em>→</em>{c.a}</div>
                    <div className="fac-cambio__l">{c.l}</div>
                  </div>
                ))}
              </div>
            )}
            {pert.comparabilidad.continuidad && (
              <p className="doc-seccion__desc" style={{ marginTop: 16, marginBottom: 0 }}>
                {pert.comparabilidad.continuidad}
              </p>
            )}
          </Seccion>
        )}

        {/* ── Pertinencia social ── */}
        {pert?.social?.length > 0 && (
          <Seccion titulo="Relevancia y pertinencia social del programa">
            <div className="fac-social">
              {pert.social.map(s => (
                <div key={s.t} className="fac-social__caja" style={vars(s.tono)}>
                  <div className="fac-social__t">{s.t}</div>
                  <p className="fac-social__d">{s.d}</p>
                  <div className="fac-social__pie">
                    {s.cifra
                      ? <><span className="fac-social__cifra">{s.cifra}</span><span className="fac-social__cifraPie">{s.cifraPie}</span></>
                      : <div className="fac-social__nota">{s.pie}</div>}
                  </div>
                </div>
              ))}
            </div>
          </Seccion>
        )}

        {/* ── Marco normativo ── */}
        {factor.normativa?.length > 0 && (
          <Seccion titulo="Soporte normativo"
                   desc="Los actos institucionales en los que se apoya el factor.">
            <dl className="fac-normativa">
              {factor.normativa.map(x => (
                <div key={x.k}><dt>{x.k}</dt><dd>{x.v}</dd></div>
              ))}
            </dl>
          </Seccion>
        )}

        {/* ── Evidencias y anexos ── */}
        {(docs.length > 0 || evidencias.length > 0) && (
          <Seccion titulo="Evidencias documentales"
                   desc={`Soporte del factor ${String(factor.n).padStart(2, '0')}.`}>
            <div className="doc-lista">
              {docs.length > 0
                ? docs.map((d, i) => <DocRow key={i} doc={d} />)
                : evidencias.map((d, i) => <DocRow key={i} doc={d} />)}
            </div>
          </Seccion>
        )}

        {anexos.length > 0 && (
          <Seccion titulo="Anexos del factor" desc="Archivos organizados por categoría.">
            {anexos.map(a => (
              <div key={a.cat} style={{ marginBottom: 18 }}>
                <div className="doc-seccion__titulo" style={{ margin: '0 0 10px' }}>{a.cat}</div>
                <div className="doc-card__etiquetas">
                  {a.items.map(it => <span key={it} className="doc-pin doc-pin--neutro">{it}</span>)}
                </div>
              </div>
            ))}
          </Seccion>
        )}

        {/* ── Equipo ── */}
        {factor.equipo?.length > 0 && (
          <Seccion titulo="Equipo responsable" desc="Quienes lideran y trabajan este factor.">
            <div className="doc-grid">
              {factor.equipo.map(p => (
                <article key={p.n} className="doc-card">
                  <div className={'doc-card__acento doc-card__acento--' + (p.rol?.toLowerCase().includes('líder') ? 'azul' : 'neutro')} />
                  <div className="doc-card__cuerpo">
                    <div className="doc-card__etiquetas">
                      <span className={'doc-pin doc-pin--' + (p.rol?.toLowerCase().includes('líder') ? 'azul' : 'neutro')}>{p.rol}</span>
                    </div>
                    <h3 className="doc-card__titulo" style={{ fontSize: 15 }}>{p.n}</h3>
                    {p.cargo && <p className="doc-card__texto" style={{ fontSize: 12.5 }}>{p.cargo}</p>}
                  </div>
                </article>
              ))}
            </div>
          </Seccion>
        )}

        {/* ── Navegación ── */}
        <section className="fac-seccion">
          <div className="fac-nav">
            {prev ? (
              <button className="fac-nav__btn" onClick={() => onNavigate(prev.n)}>
                <span className="fac-nav__dir">← Factor {String(prev.n).padStart(2, '0')}</span>
                <span className="fac-nav__t">{prev.t}</span>
              </button>
            ) : <span style={{ flex: 1, minWidth: 220 }} />}
            {next ? (
              <button className="fac-nav__btn fac-nav__btn--sig" onClick={() => onNavigate(next.n)}>
                <span className="fac-nav__dir">Factor {String(next.n).padStart(2, '0')} →</span>
                <span className="fac-nav__t">{next.t}</span>
              </button>
            ) : <span style={{ flex: 1, minWidth: 220 }} />}
          </div>
        </section>

        <div style={{ height: 60 }} />
      </div>
    </div>
  )
}
