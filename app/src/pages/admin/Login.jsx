import { useState } from 'react'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [enviando, setEnviando] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setErr('')
    setEnviando(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',        // deja que el navegador guarde la cookie de sesión
        body: JSON.stringify({ email, password }),
      })
      const cuerpo = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErr(cuerpo.error ?? 'No se pudo iniciar sesión')
        return
      }
      onLogin(cuerpo.usuario)
    } catch {
      setErr('No hay conexión con el servidor. ¿Está corriendo el backend?')
    } finally {
      setEnviando(false)
    }
  }

  return (
    /* `adm` envuelve también la entrada: así los campos y el botón usan el
       mismo sistema que el panel al que se entra, en vez de heredar el del
       sitio público. */
    <div className="adm adm-login">
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--ug-marino)', margin: '0 auto 16px', display: 'grid', placeItems: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 style={{ fontSize: 22 }}>Panel de administración</h2>
          <p style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 6 }}>Ingeniería de Sistemas · UniGuajira</p>
        </div>
        <form className="card" style={{ padding: 30 }} onSubmit={submit}>
          <div className="field">
            <label>Correo institucional</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" required autoFocus />
          </div>
          <div className="field" style={{ marginTop: 14 }}>
            <label>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
          </div>
          {err && <div style={{ color: 'var(--ug-flamingo)', fontSize: 13, marginTop: 10 }}>{err}</div>}
          <button className="btn accent" type="submit" disabled={enviando} style={{ width: '100%', marginTop: 20, justifyContent: 'center', opacity: enviando ? .6 : 1 }}>
            {enviando ? 'Verificando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
