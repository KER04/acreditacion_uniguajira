/* Panel — Extensión.
 *
 * Edita los tres bloques de /extension —proyectos, convenios y educación
 * continua—, que viven en PostgreSQL desde la migración 022. Antes la página
 * estaba escrita a mano y no había forma de cambiarla sin tocar código.
 *
 * Los tres formularios son la misma pieza con otros campos, así que se
 * describen como datos (CAMPOS_*) y los pinta PanelLista.
 */
import { usePestana } from '../../../hooks/useParametroURL'
import PanelLista from '../PanelLista'
import {
  SEDES_CON_AMBAS, COLORES_TARJETA, SECTORES_CONVENIO, ESTADOS_PROYECTO_EXT,
  TIPOS_CURSO, MODALIDADES_CURSO, fechaLarga,
} from '../../../../shared/validacion'

const ETIQUETA_SEDE = { ambas: 'Ambas sedes', riohacha: 'Riohacha', maicao: 'Maicao' }

const SUBPESTANAS = [
  ['proyectos', 'Proyectos'],
  ['convenios', 'Convenios'],
  ['cursos', 'Educación continua'],
]

/* ─── Descripción de los formularios ───────────────────────────────
   tipo: texto | area | numero | fecha | url | select | lista | check
   ancho: true ocupa las dos columnas. */

const CAMPOS_PROYECTO = [
  { k: 'titulo', l: 'Título', tipo: 'texto', ancho: true, requerido: true },
  { k: 'descripcion', l: 'Descripción', tipo: 'area', ancho: true },
  { k: 'comunidad', l: 'Comunidad o sector beneficiado', tipo: 'texto' },
  { k: 'municipio', l: 'Municipio', tipo: 'texto' },
  { k: 'estado', l: 'Estado', tipo: 'select', opciones: ESTADOS_PROYECTO_EXT },
  { k: 'sede', l: 'Sede', tipo: 'select', opciones: SEDES_CON_AMBAS, etiquetas: ETIQUETA_SEDE },
  { k: 'fecha_inicio', l: 'Inicio', tipo: 'fecha' },
  { k: 'fecha_fin', l: 'Fin (opcional)', tipo: 'fecha' },
  { k: 'integrantes', l: 'Equipo (uno por renglón)', tipo: 'lista', ancho: true },
  { k: 'fuente_url', l: 'Fuente (documento o noticia que respalda el proyecto)', tipo: 'url', ancho: true },
  { k: 'orden', l: 'Orden', tipo: 'numero' },
]
const PROYECTO_VACIO = {
  titulo: '', descripcion: '', comunidad: '', municipio: '', estado: 'En ejecución',
  sede: 'riohacha', fecha_inicio: '', fecha_fin: '', integrantes: '', fuente_url: '', orden: 0,
}

const CAMPOS_CONVENIO = [
  { k: 'organizacion', l: 'Organización', tipo: 'texto', requerido: true },
  { k: 'sector', l: 'Sector', tipo: 'select', opciones: SECTORES_CONVENIO },
  { k: 'tipo', l: 'Tipo de convenio', tipo: 'texto', placeholder: 'Convenio marco, de prácticas…' },
  { k: 'anio_inicio', l: 'Año de firma', tipo: 'numero' },
  { k: 'fecha_fin', l: 'Vigente hasta (vacío = indefinido)', tipo: 'fecha' },
  { k: 'color', l: 'Color de la tarjeta', tipo: 'select', opciones: COLORES_TARJETA.map(c => c[0]), etiquetas: Object.fromEntries(COLORES_TARJETA) },
  { k: 'descripcion', l: 'Qué cubre', tipo: 'area', ancho: true },
  { k: 'url', l: 'Enlace al convenio o al aliado', tipo: 'url', ancho: true },
  { k: 'orden', l: 'Orden', tipo: 'numero' },
]
const CONVENIO_VACIO = {
  organizacion: '', sector: 'Empresarial', tipo: '', anio_inicio: '', fecha_fin: '',
  color: 'var(--ug-azul)', descripcion: '', url: '', orden: 0,
}

const CAMPOS_CURSO = [
  { k: 'titulo', l: 'Título', tipo: 'texto', ancho: true, requerido: true },
  { k: 'tipo', l: 'Tipo', tipo: 'select', opciones: TIPOS_CURSO },
  { k: 'modalidad', l: 'Modalidad', tipo: 'select', opciones: MODALIDADES_CURSO },
  { k: 'horas', l: 'Horas', tipo: 'numero' },
  { k: 'orden', l: 'Orden', tipo: 'numero' },
  { k: 'fecha_inicio', l: 'Inicio', tipo: 'fecha' },
  { k: 'fecha_fin', l: 'Fin', tipo: 'fecha' },
  { k: 'descripcion', l: 'Descripción', tipo: 'area', ancho: true },
  { k: 'url_inscripcion', l: 'Enlace de inscripción (sin él no sale el botón «Inscribirme»)', tipo: 'url', ancho: true },
  { k: 'activo', l: 'Visible en la página', tipo: 'check' },
]
const CURSO_VACIO = {
  titulo: '', tipo: 'Diplomado', modalidad: 'Presencial', horas: '', orden: 0,
  fecha_inicio: '', fecha_fin: '', descripcion: '', url_inscripcion: '', activo: true,
}

const tenue = { fontSize: 12, color: 'var(--ink-3)' }
const fechaCorta = iso => (iso ? fechaLarga(iso) : '—')

export default function TabExtension() {
  const [tab, setTab] = usePestana(SUBPESTANAS, { clave: 'sub' })

  return (
    <div>
      <h3 style={{ marginBottom: 6 }}>Extensión</h3>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>
        Lo que se publica en <a href="#/extension" target="_blank" rel="noopener noreferrer">/extension</a>.
        Las cifras de la cabecera se cuentan solas; cada sección se oculta mientras esté vacía.
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {SUBPESTANAS.map(([k, l]) => (
          <button key={k} className="chip" onClick={() => setTab(k)}
            style={{ cursor: 'pointer', background: tab === k ? 'var(--ink)' : undefined, color: tab === k ? 'var(--paper)' : undefined }}>{l}</button>
        ))}
      </div>

      {tab === 'proyectos' && (
        <PanelLista clave="proyectos_extension" id="tabextension-0" titulos={['Nuevo proyecto', 'Editar proyecto']}
          campos={CAMPOS_PROYECTO} vacio={PROYECTO_VACIO} columnas="1fr 110px 110px 100px auto"
          vacioTexto="Todavía no hay proyectos publicados."
          resumen={p => (<>
            <div><div style={{ fontWeight: 500, fontSize: 14 }}>{p.titulo}</div><div style={tenue}>{p.comunidad}</div></div>
            <span className="chip" style={{ fontSize: 10 }}>{p.estado}</span>
            <span style={tenue}>{p.municipio}</span>
            <span style={tenue}>{fechaCorta(p.fecha_inicio)}</span>
          </>)} />
      )}

      {tab === 'convenios' && (
        <PanelLista clave="convenios" id="tabextension-1" titulos={['Nuevo convenio', 'Editar convenio']}
          campos={CAMPOS_CONVENIO} vacio={CONVENIO_VACIO} columnas="1fr 110px 90px 120px auto"
          vacioTexto="Todavía no hay convenios publicados. La sección no aparece en la página hasta que haya uno vigente."
          resumen={c => (<>
            <div><div style={{ fontWeight: 500, fontSize: 14 }}>{c.organizacion}</div><div style={tenue}>{c.tipo}</div></div>
            <span className="chip" style={{ fontSize: 10 }}>{c.sector}</span>
            <span style={tenue}>{c.anio_inicio ?? '—'}</span>
            <span style={{ ...tenue, color: c.vigente ? 'var(--ug-marino)' : 'var(--ug-flamingo)' }}>
              {c.vigente ? (c.fecha_fin ? `Hasta ${fechaCorta(c.fecha_fin)}` : 'Vigente') : 'Vencido'}
            </span>
          </>)} />
      )}

      {tab === 'cursos' && (
        <PanelLista clave="cursos_extension" id="tabextension-2" titulos={['Nuevo curso o diplomado', 'Editar curso']}
          campos={CAMPOS_CURSO} vacio={CURSO_VACIO} columnas="1fr 100px 100px 140px auto"
          vacioTexto="Todavía no hay cursos. La sección no aparece en la página hasta que haya uno abierto."
          resumen={c => (<>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{c.titulo}</div>
              <div style={tenue}>{[c.url_inscripcion ? '' : 'sin enlace de inscripción', !c.activo && 'oculto', c.terminado && 'terminado'].filter(Boolean).join(' · ')}</div>
            </div>
            <span className="chip" style={{ fontSize: 10 }}>{c.tipo}</span>
            <span style={tenue}>{c.modalidad}</span>
            <span style={tenue}>{fechaCorta(c.fecha_inicio)}</span>
          </>)} />
      )}
    </div>
  )
}
