/* Panel — Resoluciones (marco legal del programa, migración 025).
 *
 * Una sola lista de actos. En la página pública, el acto más reciente de
 * «Registro calificado» y de «Acreditación» sale en tarjeta grande; los demás
 * van a «Otros actos administrativos». Si se carga una renovación, la anterior
 * baja sola a la lista: no hace falta tocarla.
 */
import PanelLista from '../PanelLista'
import { CATEGORIAS_ACTO, TIPOS_ACTO, fechaLarga } from '../../../../shared/validacion'

const ETIQUETA_CATEGORIA = Object.fromEntries(CATEGORIAS_ACTO)

const CAMPOS = [
  { k: 'categoria', l: 'Categoría', tipo: 'select', opciones: CATEGORIAS_ACTO.map(c => c[0]), etiquetas: ETIQUETA_CATEGORIA },
  { k: 'tipo', l: 'Tipo de acto', tipo: 'select', opciones: TIPOS_ACTO },
  { k: 'numero', l: 'Número', tipo: 'texto', placeholder: '02872' },
  { k: 'fecha', l: 'Fecha del acto', tipo: 'fecha' },
  { k: 'expedido_por', l: 'Expedido por', tipo: 'texto', placeholder: 'Ministerio de Educación Nacional' },
  { k: 'asunto', l: 'Asunto', tipo: 'texto', requerido: true, placeholder: 'Registro calificado del programa' },
  { k: 'descripcion', l: 'Resumen: de qué trata (se ve al pulsar la tarjeta; línea en blanco = nuevo párrafo)', tipo: 'area', ancho: true },
  { k: 'vigencia', l: 'Vigencia (como la cita el acto)', tipo: 'texto', placeholder: '7 años' },
  { k: 'fecha_fin', l: 'Vence el (vacío = no se muestra vencimiento)', tipo: 'fecha' },
  { k: 'archivo_id', l: 'Documento (PDF)', tipo: 'archivo', ancho: true },
  { k: 'url', l: 'O enlace externo (SACES, Drive…), si no se sube el PDF', tipo: 'url', ancho: true },
  { k: 'orden', l: 'Orden', tipo: 'numero' },
]

const VACIO = {
  categoria: 'otro', tipo: 'Resolución', numero: '', fecha: '', expedido_por: '', asunto: '',
  descripcion: '', vigencia: '', fecha_fin: '', archivo_id: '', url: '', orden: 0,
}

const tenue = { fontSize: 12, color: 'var(--ink-3)' }

export default function TabResoluciones() {
  return (
    <div>
      <h3 style={{ marginBottom: 6 }}>Resoluciones</h3>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>
        Marco legal que se publica en <a href="#/resoluciones" target="_blank" rel="noopener noreferrer">/resoluciones</a>.
        El acto más reciente de registro calificado y de acreditación va en tarjeta grande; el resto, en la lista.
        Con fecha de vencimiento, la página marca solo si está vencido.
      </p>
      <PanelLista clave="actos" id="tabresoluciones-0" titulos={['Nuevo acto administrativo', 'Editar acto']}
        campos={CAMPOS} vacio={VACIO} columnas="150px 1fr 110px 90px auto"
        vacioTexto="Todavía no hay actos cargados."
        resumen={a => (<>
          <span className="chip" style={{ fontSize: 10 }}>{ETIQUETA_CATEGORIA[a.categoria]}</span>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{a.referencia} · {a.asunto}</div>
            <div style={tenue}>{a.expedido_por}</div>
          </div>
          <span style={tenue}>{a.fecha ? fechaLarga(a.fecha) : '—'}</span>
          <span style={{ ...tenue, color: a.enlace ? undefined : 'var(--ug-flamingo)' }}>
            {a.vencido ? 'Vencido' : a.archivo_id ? 'PDF' : a.url ? 'Enlace' : 'Sin documento'}
          </span>
        </>)} />
    </div>
  )
}
