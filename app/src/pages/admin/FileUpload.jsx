import { useState, useRef } from 'react'
import { apiUpload } from '../../context/DataContext'

/* ─── FileUpload ───────────────────────────────────────────────────
   Props:
     tipo        — upload type key (e.g. 'docente-foto', 'noticia-imagen')
     extra       — extra query params object (e.g. { factor: '01' })
     accept      — input accept string (default '*')
     previewType — 'image' | 'file' (default 'file')
     onUploaded  — (url: string) => void   called after successful upload
     label       — field label text
     currentUrl  — URL of existing file (shown as current value)
──────────────────────────────────────────────────────────────────── */
export default function FileUpload({
  tipo,
  extra = {},
  accept = '*',
  previewType = 'file',
  onUploaded,
  label = 'Archivo',
  currentUrl = '',
}) {
  const [preview, setPreview] = useState(null)
  const [filename, setFilename] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const onPick = e => {
    const file = e.target.files[0]
    if (!file) return
    setFilename(file.name)
    setError('')
    if (previewType === 'image') {
      const reader = new FileReader()
      reader.onload = ev => setPreview(ev.target.result)
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  const upload = async () => {
    const file = inputRef.current?.files[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const { url } = await apiUpload(tipo, file, extra)
      onUploaded(url)
      setPreview(null)
      setFilename('')
      if (inputRef.current) inputRef.current.value = ''
    } catch {
      setError('Error al subir el archivo. Verifica que el servidor esté activo.')
    } finally {
      setUploading(false)
    }
  }

  const displayUrl = currentUrl || ''

  return (
    <div>
      <label style={{ fontSize: 12, color: 'var(--ink-3)', letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{label}</label>

      {previewType === 'image' && (preview || displayUrl) && (
        <img
          src={preview ?? displayUrl}
          alt="preview"
          style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, display: 'block', marginBottom: 8, border: '2px solid color-mix(in oklab, var(--ink) 10%, transparent)' }}
        />
      )}

      {previewType === 'file' && filename && (
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 6, padding: '4px 10px', background: 'var(--paper-2)', borderRadius: 6, display: 'inline-block' }}>
          📄 {filename}
        </div>
      )}

      {previewType === 'file' && !filename && displayUrl && (
        <div style={{ fontSize: 12, color: 'var(--ug-azul-deep)', marginBottom: 6 }}>
          Archivo actual: <a href={displayUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>{displayUrl.split('/').pop()}</a>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label style={{ cursor: 'pointer', padding: '7px 14px', background: 'var(--paper-2)', border: '1px solid color-mix(in oklab, var(--ink) 15%, transparent)', borderRadius: 8, fontSize: 13, color: 'var(--ink)', display: 'inline-block' }}>
          {filename ? '📎 Cambiar archivo' : '📎 Seleccionar archivo'}
          <input ref={inputRef} type="file" accept={accept} onChange={onPick} style={{ display: 'none' }} />
        </label>
        {filename && (
          <button
            type="button"
            onClick={upload}
            disabled={uploading}
            style={{ padding: '7px 16px', background: 'var(--ug-azul)', color: 'var(--paper)', border: 'none', borderRadius: 8, fontSize: 13, cursor: uploading ? 'wait' : 'pointer', opacity: uploading ? .7 : 1 }}>
            {uploading ? 'Subiendo…' : '↑ Subir'}
          </button>
        )}
      </div>
      {error && <div style={{ fontSize: 12, color: 'var(--ug-flamingo)', marginTop: 6 }}>{error}</div>}
    </div>
  )
}
