'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminLogin() {
  const router = useRouter()
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErr('')
    const r = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    })
    if (r.ok) {
      router.push('/admin')
    } else {
      setErr('Senha incorreta')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{`input:focus { border-color: rgba(18,253,0,0.5) !important; outline: none; }`}</style>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Image src="/logo.png" alt="Atacado Paraguai" width={120} height={47} style={{ objectFit: 'contain' }} />
          <p style={{ color: '#444', fontSize: 12, marginTop: 12, letterSpacing: '0.1em' }}>PAINEL ADMINISTRATIVO</p>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="Senha de acesso"
            autoFocus
            style={{ padding: '14px 16px', background: '#0e0e0e', border: '1px solid #2a2a2a', borderRadius: 10, color: '#fff', fontSize: 15, width: '100%', boxSizing: 'border-box' as const }}
          />
          {err && <p style={{ color: '#ef4444', fontSize: 12, textAlign: 'center' }}>{err}</p>}
          <button type="submit" disabled={loading}
            style={{ padding: '14px', background: '#12fd00', color: '#000', border: 'none', borderRadius: 10, fontWeight: 900, fontSize: 15, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
