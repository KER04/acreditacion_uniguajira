/* Resumen del panel.
 *
 * Contesta dos preguntas al entrar: cuánto contenido hay publicado y desde
 * dónde se toca. Los accesos rápidos ahora llevan de verdad a su sección:
 * antes eran etiquetas con aspecto de botón que no hacían nada, que es peor
 * que no ponerlas.
 */
import { useState } from 'react'
import { useData } from '../../context/DataContext'

/* Cada cifra con la sección que la administra, para poder saltar desde el
   número a donde se edita. */
const CIFRAS = [
  ['noticias', 'Noticias', 'noticias'],
  ['eventos', 'Eventos', 'eventos'],
  ['convocatorias', 'Convocatorias', 'convocatorias'],
  ['docentes', 'Docentes', 'docentes'],
  ['honor', 'Cuadro de honor', 'estudiantes'],
  ['destacados', 'Graduados destacados', 'egresados'],
  ['ofertas', 'Ofertas laborales', 'egresados'],
  ['grupos', 'Grupos de investigación', 'funciones'],
  ['semilleros', 'Semilleros', 'funciones'],
  ['produccion', 'Producción de investigación', 'funciones'],
  ['proyectos_extension', 'Proyectos de extensión', 'extension'],
  ['convenios', 'Convenios', 'extension'],
  ['convenios_int', 'Convenios internacionales', 'internacionalizacion'],
]

export default function Dashboard({ onIr }) {
  const { data, reset } = useData()
  const [confirmar, setConfirmar] = useState(false)

  const irA = clave => onIr?.(clave)

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(168px,1fr))', gap: 12, marginBottom: 30 }}>
        {CIFRAS.map(([clave, etiqueta, seccion]) => (
          <button key={clave} type="button" onClick={() => irA(seccion)} className="adm-kpi">
            <span className="adm-kpi__n">{(data[clave] ?? []).length}</span>
            <span className="adm-kpi__l">{etiqueta}</span>
          </button>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 26 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Por dónde empezar</div>
        <p style={{ fontSize: 12.5, color: 'var(--ink-3)', margin: '0 0 14px' }}>
          Lo que más se toca en el día a día del programa.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            ['noticias', 'Publicar una noticia'],
            ['eventos', 'Agendar un evento'],
            ['convocatorias', 'Abrir una convocatoria'],
            ['docentes', 'Actualizar un docente'],
            ['saberpro', 'Cargar Saber Pro'],
            ['cna', 'Acreditación CNA'],
          ].map(([clave, etiqueta]) => (
            <button key={clave} type="button" className="chip" style={{ cursor: 'pointer' }}
              onClick={() => irA(clave)}>
              {etiqueta}
            </button>
          ))}
        </div>
      </div>

      <div className="card adm-riesgo">
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ug-flamingo-deep)' }}>Zona de riesgo</div>
        <p style={{ fontSize: 12.5, color: 'var(--ink-3)', margin: '6px 0 14px', maxWidth: '70ch' }}>
          Restablecer devuelve el contenido guardado en este navegador a los valores de
          partida. No se puede deshacer.
        </p>
        {!confirmar ? (
          <button className="btn ghost adm-btn-riesgo" onClick={() => setConfirmar(true)}>
            Restablecer datos
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13 }}>¿Seguro?</span>
            <button className="btn ghost adm-btn-riesgo" onClick={() => { reset(); setConfirmar(false) }}>
              Sí, restablecer
            </button>
            <button className="btn ghost" onClick={() => setConfirmar(false)}>Cancelar</button>
          </div>
        )}
      </div>
    </>
  )
}
