import { useState } from 'react'
import { useData } from '../../../context/DataContext'
import { Icons } from '../../../components/Icons'

export default function TabPrograma() {
  const { data, update } = useData()
  const pg = data.programa ?? {}
  const fk = pg.ficha ?? {}

  const [mision, setMision] = useState(pg.mision ?? '')
  const [vision, setVision] = useState(pg.vision ?? '')
  const [objetivos, setObjetivos] = useState((pg.objetivos ?? []).join('\n'))
  const [perfil, setPerfil] = useState(pg.perfilEgresado ?? '')
  const [ficha, setFicha] = useState({ codigo: fk.codigo ?? '', creditos: fk.creditos ?? '', duracion: fk.duracion ?? '', jornada: fk.jornada ?? '', modalidad: fk.modalidad ?? '', titulo: fk.titulo ?? '', registro: fk.registro ?? '', acreditacion: fk.acreditacion ?? '', snies: fk.snies ?? '' })
  const [saved, setSaved] = useState(false)

  const save = e => {
    e.preventDefault()
    update('programa', { mision, vision, objetivos: objetivos.split('\n').filter(Boolean), perfilEgresado: perfil, ficha })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const ff = (k, v) => setFicha(f => ({ ...f, [k]: v }))

  return (
    <form onSubmit={save}>
      <h3 style={{ marginBottom: 20 }}>Información del Programa</h3>

      <div className="card" style={{ background: 'var(--paper-2)', marginBottom: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 14 }}>Misión y Visión</div>
        <div className="field"><label>Misión</label><textarea rows="4" value={mision} onChange={e => setMision(e.target.value)} /></div>
        <div className="field" style={{ marginTop: 14 }}><label>Visión</label><textarea rows="4" value={vision} onChange={e => setVision(e.target.value)} /></div>
      </div>

      <div className="card" style={{ background: 'var(--paper-2)', marginBottom: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 14 }}>Objetivos del programa</div>
        <div className="field">
          <label>Un objetivo por línea</label>
          <textarea rows="6" value={objetivos} onChange={e => setObjetivos(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ background: 'var(--paper-2)', marginBottom: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 14 }}>Perfil del egresado</div>
        <div className="field"><textarea rows="5" value={perfil} onChange={e => setPerfil(e.target.value)} /></div>
      </div>

      <div className="card" style={{ background: 'var(--paper-2)', marginBottom: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 14 }}>Ficha técnica</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[['codigo','Código SNIES'],['snies','SNIES'],['creditos','Créditos'],['duracion','Duración'],['jornada','Jornada'],['modalidad','Modalidad'],['titulo','Título otorgado'],['registro','Reg. calificado'],['acreditacion','Acreditación']].map(([k,l]) => (
            <div key={k} className="field" style={{ margin: 0 }}>
              <label>{l}</label>
              <input value={ficha[k] ?? ''} onChange={e => ff(k, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button className="btn accent" type="submit" style={{ padding: '10px 24px' }}>Guardar <Icons.check /></button>
        {saved && <span style={{ fontSize: 13, color: 'var(--ug-azul-deep)' }}>✓ Guardado</span>}
      </div>
    </form>
  )
}
