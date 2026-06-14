'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function Login() {
  const router = useRouter()
  const [redirect, setRedirect] = useState('/checkout')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setRedirect(params.get('redirect') || '/')

    // se já logado, redireciona
    getSupabaseClient().auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace(params.get('redirect') || '/')
      else setChecking(false)
    })
  }, [router])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErr('')
    const { error } = await getSupabaseClient().auth.signInWithPassword({ email, password: pw })
    if (error) {
      setErr('E-mail ou senha incorretos')
      setLoading(false)
    } else {
      router.push(redirect)
      router.refresh()
    }
  }

  if (checking) return <div style={{ minHeight: '100vh', background: '#080808' }} />

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{`
        input:focus { border-color: rgba(18,253,0,0.5) !important; outline: none; box-shadow: 0 0 0 3px rgba(18,253,0,0.06); }
        input::placeholder { color: #2a2a2a; }
      `}</style>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <a href="/"><Image src="/logo.png" alt="Atacado Paraguai" width={120} height={47} style={{ objectFit: 'contain' }} /></a>
          <h1 style={{ fontSize: 18, fontWeight: 900, marginTop: 20, marginBottom: 4 }}>Entrar na sua conta</h1>
          <p style={{ color: '#444', fontSize: 13 }}>Para finalizar sua compra, faça login</p>
        </div>

        <div style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 16, padding: '28px 28px' }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: '0.08em', marginBottom: 6 }}>E-MAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus
                placeholder="seu@email.com"
                style={{ width: '100%', padding: '12px 14px', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' as const }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: '0.08em', marginBottom: 6 }}>SENHA</label>
              <input type="password" value={pw} onChange={e => setPw(e.target.value)} required
                placeholder="Sua senha"
                style={{ width: '100%', padding: '12px 14px', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' as const }} />
            </div>

            {err && <p style={{ fontSize: 12, color: '#ef4444', textAlign: 'center', margin: 0 }}>{err}</p>}

            <button type="submit" disabled={loading}
              style={{ padding: '14px', background: '#12fd00', color: '#000', border: 'none', borderRadius: 10, fontWeight: 900, fontSize: 15, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4, boxShadow: '0 4px 20px rgba(18,253,0,0.25)' }}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div style={{ borderTop: '1px solid #111', marginTop: 24, paddingTop: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: '#444' }}>
              Não tem conta?{' '}
              <a href={`/conta/cadastro?redirect=${encodeURIComponent(redirect)}`}
                style={{ color: '#12fd00', fontWeight: 700, textDecoration: 'none' }}>
                Criar conta grátis
              </a>
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20 }}>
          <a href="/" style={{ color: '#333', fontSize: 12, textDecoration: 'none' }}>← Voltar ao catálogo</a>
        </p>
      </div>
    </div>
  )
}
