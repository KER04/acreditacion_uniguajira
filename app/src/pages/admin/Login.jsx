import { useState } from 'react'

const CREDENTIALS = { user: 'admin', pass: 'sistemas2024' }

export default function Login({ onLogin }) {
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [err, setErr] = useState('')

  const submit = e => {
    e.preventDefault()
    if (u === CREDENTIALS.user && p === CREDENTIALS.pass) onLogin()
    else setErr('Credenciales incorrectas.')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--paper-2)' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--ug-marino)', margin: '0 auto 16px', display: 'grid', placeItems: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--paper)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 style={{ fontSize: 22 }}>Panel de administración</h2>
          <p style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 6 }}>Ingeniería de Sistemas · UniGuajira</p>
        </div>
        <form className="card" style={{ background: 'var(--paper)', padding: 32 }} onSubmit={submit}>
          <div className="field"><label>Usuario</label><input value={u} onChange={e => setU(e.target.value)} autoComplete="username" required /></div>
          <div className="field" style={{ marginTop: 14 }}><label>Contraseña</label><input type="password" value={p} onChange={e => setP(e.target.value)} autoComplete="current-password" required /></div>
          {err && <div style={{ color: 'var(--ug-flamingo)', fontSize: 13, marginTop: 10 }}>{err}</div>}
          <button className="btn accent" type="submit" style={{ width: '100%', marginTop: 20, justifyContent: 'center' }}>Ingresar</button>
        </form>
      </div>
    </div>
  )
}
