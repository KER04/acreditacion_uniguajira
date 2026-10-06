/* Dirección y contacto del programa.

   Misma cabecera que /pensum, /pensum-propuesto y /resoluciones: migas y
   hero-card con la franja tejida. Debajo, dos tarjetas —qué hace la dirección
   y cómo contactar a cada sede— y el organigrama.

   Todo sale de la base (migración 026) y se edita en el panel, pestaña
   «Contacto». Antes estaba escrito aquí con datos que no eran los de la
   universidad: la oficina en otro bloque, correos que no existen, la sede de
   Maicao en otra calle y un organigrama con coordinadores de ejemplo.

   El organigrama conserva su lectura: el despacho (dirección de cada sede) en
   tarjetas anchas y las coordinaciones debajo en tarjetas compactas. La foto
   es la propia del cargo o, si no hay, la de su ficha de docente; sin
   ninguna, el hexágono con las iniciales. */
import { useData } from '../../context/DataContext'
import { Icons } from '../../components/Icons'

const TONOS = ['azul', 'ambar', 'terracota', 'azul']
const COLOR_TONO = { azul: 'var(--ug-azul)', ambar: 'var(--ug-amarillo)', terracota: 'var(--ug-flamingo)' }
const ETIQUETA_SEDE = { riohacha: 'Sede Riohacha', maicao: 'Sede Maicao', ambas: 'Ambas sedes' }

/* Las dos primeras iniciales en mayúscula del nombre: de "Adanud Segundo Meza
   Valle" salen AS. El filtro descarta partículas en minúscula ("de", "la"). */
const iniciales = nombre =>
  String(nombre).split(' ').map(p => p[0]).filter(c => /[A-ZÁÉÍÓÚÑ]/.test(c ?? '')).slice(0, 2).join('')

function Retrato({ p }) {
  return p.foto_url
    ? <img className="org-card__hex org-card__foto" src={p.foto_url} alt="" />
    : <div className="org-card__hex">{iniciales(p.nombre)}</div>
}

function Sede({ s }) {
  const datos = [
    ['Oficina', s.ubicacion],
    ['Dirección', [s.direccion, s.ciudad].filter(Boolean).join(', ')],
    ['Teléfono', s.telefono + (s.extension ? ` · ext. ${s.extension}` : '')],
    ['Horario', s.horario],
  ].filter(([, v]) => v)
  return (
    <div className="contacto-sede">
      <div className="contacto-sede__cabeza">
        <b>{s.nombre}</b>
        {s.url && <a href={s.url} target="_blank" rel="noopener noreferrer">Página oficial <Icons.external /></a>}
      </div>
      {s.correo && <a className="contacto-sede__correo" href={'mailto:' + s.correo}><Icons.mail /> {s.correo}</a>}
      <dl className="contacto-datos">
        {datos.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
    </div>
  )
}

export default function Contacto() {
  const { data } = useData()
  const sedes = data.contacto?.sedes ?? []
  // `cargos` va aparte porque el panel lo edita por REST y lo recarga solo.
  const cargos = data.cargos ?? data.contacto?.cargos ?? []
  const programa = data.contacto?.programa

  const director = cargos.find(c => c.nivel === 'direccion' && c.sede === 'riohacha') ?? cargos.find(c => c.nivel === 'direccion')
  const despacho = cargos.filter(c => c.nivel === 'direccion')
  const coordinaciones = cargos.filter(c => c.nivel === 'coordinacion')
  const apoyo = cargos.filter(c => c.nivel === 'apoyo')
  const [nombre1, ...resto] = String(director?.nombre ?? 'Dirección del programa').split(' ')
  const partido = [ [nombre1, resto[0]].filter(Boolean).join(' '), resto.slice(1).join(' ') ]

  return (
    <div className="page-in pagina-con-margen" style={{ padding: 'clamp(28px,4vw,44px) var(--gutter) 0' }}>
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>

        <nav className="miga" aria-label="Ruta de navegación">
          <span>Programa</span>
          <span aria-hidden="true">/</span>
          <span className="miga__actual">Dirección y contacto</span>
        </nav>

        <header className="hero-card">
          <div className="hero-card__patron" aria-hidden="true" />
          <div className="hero-card__contenido">
            <p className="hero-card__insignia">
              <span className="hero-card__punto" aria-hidden="true" />
              {director?.cargo ?? 'Dirección'} · Ingeniería de Sistemas
            </p>
            <h1 className="hero-card__titulo">
              {partido[0]} {partido[1] && <span>{partido[1]}</span>}
            </h1>
            <p className="hero-card__subtitulo">
              Facultad de Ingeniería · Universidad de La Guajira · Sedes Riohacha y Maicao
            </p>
          </div>
        </header>

        <div className="contacto-cuerpo">
          <section className="contacto-panel">
            <div className="contacto-panel__cuerpo">
              <div className="contacto-encabezado">
                <div className="contacto-encabezado__titulo">
                  <Icons.archivo /> Gestión y liderazgo académico
                </div>
              </div>

              {programa?.presentacion && <p className="contacto-entrada">{programa.presentacion}</p>}

              {programa?.ejes?.length > 0 && (
                <div className="contacto-ejes">
                  <div className="contacto-ejes__label">Ejes de gestión</div>
                  <div className="contacto-ejes__lista">
                    {programa.ejes.map((e, i) => (
                      <span key={e} className={'eje' + (i === 2 ? ' eje--ambar' : i === 3 ? ' eje--terracota' : '')}>{e}</span>
                    ))}
                  </div>
                </div>
              )}

              {programa?.horario && (
                <div className="contacto-horario">
                  <div className="contacto-encabezado">
                    <div className="contacto-encabezado__titulo">
                      <Icons.reloj /> Horario de atención a estudiantes
                    </div>
                  </div>
                  <div className="contacto-horario__fila">
                    <div className="contacto-horario__tramos">{programa.horario}</div>
                    {programa.nota_cita && <div className="contacto-cita">{programa.nota_cita}</div>}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="contacto-panel">
            <div className="hero-card__patron" aria-hidden="true" />
            <div className="contacto-panel__cuerpo">
              <div className="contacto-encabezado__titulo" style={{ marginBottom: 6 }}>
                Contacto institucional
              </div>
              {sedes.map(s => <Sede key={s.sede} s={s} />)}
            </div>
          </section>
        </div>

        {cargos.length > 0 && (
          <section className="doc-seccion">
            <div className="organigrama__cabecera">
              <div className="organigrama__eyebrow">Estructura académico-administrativa</div>
              <h2 className="organigrama__titulo">Quién dirige el programa</h2>
              <p className="organigrama__desc">Dirección del programa en cada sede y sus coordinaciones.</p>
            </div>

            {despacho.length > 0 && (
              <>
                <div className="organigrama__nivel">
                  <span className="organigrama__rotulo">Dirección y coordinación de sede</span>
                </div>
                <div className="org-grid org-grid--despacho">
                  {despacho.map((p, i) => {
                    const tono = TONOS[i % TONOS.length]
                    return (
                      <article key={p.id} className="org-card org-card--ancha" style={{ '--tono': COLOR_TONO[tono] }}>
                        <div className="org-card__cabeza">
                          <Retrato p={p} />
                          <div className="org-card__textos">
                            <span className={'org-card__area org-card__area--' + tono}>{p.area || ETIQUETA_SEDE[p.sede]}</span>
                            <h3 className="org-card__nombre">{p.nombre}</h3>
                            <div className="org-card__detalle">{p.cargo}</div>
                          </div>
                          {p.extension && <span className="org-card__ext">Ext. {p.extension}</span>}
                        </div>
                        {p.descripcion && <p className="org-card__descripcion">{p.descripcion}</p>}
                        <div className="org-card__pie">
                          {p.correo && <a className="org-dato" href={'mailto:' + p.correo}><Icons.mail /> {p.correo}</a>}
                          {p.ubicacion && <span className="org-card__lugar"><Icons.ubicacion /> {p.ubicacion}</span>}
                        </div>
                      </article>
                    )
                  })}
                </div>
              </>
            )}

            {[['Coordinaciones misionales', coordinaciones], ['Apoyo administrativo', apoyo]].map(([rotulo, lista]) => lista.length > 0 && (
              <div key={rotulo}>
                <div className="organigrama__nivel">
                  <span className="organigrama__rotulo">{rotulo}</span>
                </div>
                <div className="org-grid org-grid--coordinacion">
                  {lista.map((p, i) => {
                    const tono = TONOS[(i + 1) % TONOS.length]
                    return (
                      <article key={p.id} className="org-card" style={{ '--tono': COLOR_TONO[tono] }}>
                        <div className="org-card__cabeza">
                          <Retrato p={p} />
                          {p.area && <span className={'org-card__area org-card__area--' + tono}>{p.area}</span>}
                        </div>
                        <div className="org-card__textos">
                          <div className="org-card__cargo">{p.cargo}</div>
                          <h3 className="org-card__nombre">{p.nombre}</h3>
                          {p.descripcion && <div className="org-card__detalle">{p.descripcion}</div>}
                        </div>
                        {p.correo && (
                          <a className="org-dato org-card__correo" href={'mailto:' + p.correo}><Icons.mail /> {p.correo}</a>
                        )}
                        <div className="org-card__pie">
                          <span className="org-card__lugar"><Icons.ubicacion /> {p.ubicacion || ETIQUETA_SEDE[p.sede]}</span>
                          {p.extension && <span className="org-card__ext">Ext. {p.extension}</span>}
                        </div>
                      </article>
                    )
                  })}
                </div>
              </div>
            ))}
          </section>
        )}

        <div style={{ height: 70 }} />
      </div>
    </div>
  )
}
