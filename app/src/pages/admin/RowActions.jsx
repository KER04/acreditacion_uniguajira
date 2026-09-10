import { Icons } from '../../components/Icons'

export default function RowActions({ onEdit, onDelete }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={onEdit} title="Editar"><Icons.edit /></button>
      <button className="icon-btn" style={{ width: 30, height: 30, color: 'var(--ug-flamingo)' }} onClick={onDelete} title="Eliminar"><Icons.trash /></button>
    </div>
  )
}
