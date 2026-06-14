'use client'
import { useState, useEffect, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getSupabaseClient } from '@/lib/supabase-client'

const maskCPF = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11)
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, (_, a, b, c, x) =>
    x ? `${a}.${b}.${c}-${x}` : c ? `${a}.${b}.${c}` : b ? `${a}.${b}` : a
  )
}
const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length > 10) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  if (d.length > 6) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
  if (d.length > 2) return d.replace(/(\d{2})(\d{0,})/, '($1) $2')
  return d
}
const maskCEP = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 8)
  return d.length > 5 ? d.replace(/(\d{5})(\d{0,3})/, '$1-$2') : d
}

type F = {
  nome: string; cpf: string; telefone: string; email: string; senha: string; confirmSenha: string
  cep: string; endereco: string; numero: string; complemento: string; bairro: string; cidade: string; uf: string
}
const empty: F = {
  nome: '', cpf: '', telefone: '', email: '', senha: '', confirmSenha: '',
  cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '',
}

export default function Cadastro() {
  const router = useRouter()
  const [redirect, setRedirect] = useState('/checkout')
  const [form, setForm] = useState<F>(empty)
  const [errs, setErrs] = useState<Partial<Record<keyof F, string>>>({})
  const [globalErr, setGlobalErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [cepLoad, setCepLoad] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setRedirect(params.get('redirect') || '/')
  }, [])

  const set = (k: keyof F) => (e: ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value
    if (k === 'cpf') v = maskCPF(v)
    else if (k === 'telefone') v = maskPhone(v)
    else if (k === 'cep') { v = maskCEP(v); if (v.replace(/\D/g, '').length === 8) lookupCEP(v) }
    setForm(p => ({ ...p, [k]: v }))
    setErrs(p => { const n = { ...p }; delete n[k]; return n })
  }

  const lookupCEP = async (val: string) => {
    const digits = val.replace(/\D/g, '')
    if (digits.length !== 8) return
    setCepLoad(true)
    try {
      const r = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const d = await r.json()
      if (!d.erro) setForm(p => ({ ...p, endereco: d.logradouro || '', bairro: d.bairro || '', cidade: d.localidade || '', uf: d.uf || '' }))
    } catch {}
    finally { setCepLoad(false) }
  }

  const validate = () => {
    const e: Partial<Record<keyof F, string>> = {}
    if (!form.nome.trim()) e.nome = 'Obrigatório'
    if (!form.cpf.replace(/\D/g, '').match(/^\d{11}$/)) e.cpf = 'CPF inválido'
    if (!form.telefone.replace(/\D/g, '').match(/^\d{10,11}$/)) e.telefone = 'Número inválido'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'E-mail inválido'
    if (form.senha.length < 6) e.senha = 'Mínimo 6 caracteres'
    if (form.senha !== form.confirmSenha) e.confirmSenha = 'Senhas não coincidem'
    if (!form.cep.replace(/\D/g, '').match(/^\d{8}$/)) e.cep = 'CEP inválido'
    if (!form.endereco.trim()) e.endereco = 'Obrigatório'
    if (!form.numero.trim()) e.numero = 'Obrigatório'
    setErrs(e)
    return Object.keys(e).length === 0
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setGlobalErr('')

    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
      options: { data: { nome: form.nome } },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setGlobalErr('Este e-mail já está cadastrado. Faça login.')
      } else {
        setGlobalErr(error.message)
      }
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        nome: form.nome, cpf: form.cpf, telefone: form.telefone,
        cep: form.cep, endereco: form.endereco, numero: form.numero,
        complemento: form.complemento, bairro: form.bairro, cidade: form.cidade, uf: form.uf,
        updated_at: new Date().toISOString(),
      })
      // confirma e-mail via service_role (bypass email confirmation)
      await fetch('/api/conta/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user.id }),
      })
    }

    if (!data.session) {
      // faz login manual após confirmação
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email: form.email, password: form.senha })
      if (signInErr) {
        setGlobalErr('Conta criada! Faça login para continuar.')
        setSuccess(true)
        setLoading(false)
        return
      }
    }

    router.push(redirect)
    router.refresh()
  }

  const inp = (err?: string) => ({
    width: '100%', padding: '11px 14px', background: '#0a0a0a',
    border: `1px solid ${err ? '#ef4444' : '#2a2a2a'}`, borderRadius: 8,
    color: '#fff', fontSize: 14, boxSizing: 'border-box' as const,
  })
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: '0.08em', marginBottom: 6 } as const
  const errTxt = { fontSize: 10, color: '#ef4444', marginTop: 4 } as const

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(18,253,0,0.08)', border: '2px solid #12fd00', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 30px rgba(18,253,0,0.2)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#12fd00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 10 }}>Conta criada!</h2>
          <p style={{ color: '#555', fontSize: 14, lineHeight: 1.6 }}>
            Verifique seu e-mail <strong style={{ color: '#888' }}>{form.email}</strong> e clique no link de confirmação para ativar sua conta.
          </p>
          <a href={`/conta/login?redirect=${encodeURIComponent(redirect)}`}
            style={{ display: 'inline-block', marginTop: 24, padding: '12px 28px', background: '#12fd00', color: '#000', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            Ir para Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#fff', padding: '40px 24px 80px' }}>
      <style>{`
        input:focus { border-color: rgba(18,253,0,0.5) !important; outline: none; box-shadow: 0 0 0 3px rgba(18,253,0,0.06); }
        input::placeholder { color: #2a2a2a; }
      `}</style>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <a href="/"><Image src="/logo.png" alt="Atacado Paraguai" width={110} height={43} style={{ objectFit: 'contain' }} /></a>
          <h1 style={{ fontSize: 20, fontWeight: 900, marginTop: 20, marginBottom: 4 }}>Criar conta</h1>
          <p style={{ color: '#444', fontSize: 13 }}>Cadastre-se para finalizar seu pedido</p>
        </div>

        <form onSubmit={submit}>
          {/* Dados pessoais */}
          <div style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 14, padding: '22px 22px', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: '#12fd00', letterSpacing: '0.12em', marginBottom: 18 }}>DADOS PESSOAIS</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={lbl}>NOME COMPLETO</label>
                <input value={form.nome} onChange={set('nome')} placeholder="Seu nome completo" style={inp(errs.nome)} />
                {errs.nome && <p style={errTxt}>{errs.nome}</p>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={lbl}>CPF</label>
                  <input value={form.cpf} onChange={set('cpf')} placeholder="000.000.000-00" style={inp(errs.cpf)} />
                  {errs.cpf && <p style={errTxt}>{errs.cpf}</p>}
                </div>
                <div>
                  <label style={lbl}>WHATSAPP</label>
                  <input value={form.telefone} onChange={set('telefone')} placeholder="(00) 00000-0000" style={inp(errs.telefone)} />
                  {errs.telefone && <p style={errTxt}>{errs.telefone}</p>}
                </div>
              </div>
              <div>
                <label style={lbl}>E-MAIL</label>
                <input type="email" value={form.email} onChange={set('email')} placeholder="seu@email.com" style={inp(errs.email)} />
                {errs.email && <p style={errTxt}>{errs.email}</p>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={lbl}>SENHA</label>
                  <input type="password" value={form.senha} onChange={set('senha')} placeholder="Mínimo 6 caracteres" style={inp(errs.senha)} />
                  {errs.senha && <p style={errTxt}>{errs.senha}</p>}
                </div>
                <div>
                  <label style={lbl}>CONFIRMAR SENHA</label>
                  <input type="password" value={form.confirmSenha} onChange={set('confirmSenha')} placeholder="Repita a senha" style={inp(errs.confirmSenha)} />
                  {errs.confirmSenha && <p style={errTxt}>{errs.confirmSenha}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 14, padding: '22px 22px', marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: '#12fd00', letterSpacing: '0.12em', marginBottom: 18 }}>ENDEREÇO</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={lbl}>CEP {cepLoad && <span style={{ color: '#444', fontWeight: 400 }}>buscando...</span>}</label>
                <input value={form.cep} onChange={set('cep')} placeholder="00000-000" style={inp(errs.cep)} />
                {errs.cep && <p style={errTxt}>{errs.cep}</p>}
              </div>
              <div>
                <label style={lbl}>ENDEREÇO</label>
                <input value={form.endereco} onChange={set('endereco')} placeholder="Rua / Avenida" style={inp(errs.endereco)} />
                {errs.endereco && <p style={errTxt}>{errs.endereco}</p>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 14 }}>
                <div>
                  <label style={lbl}>NÚMERO</label>
                  <input value={form.numero} onChange={set('numero')} placeholder="Nº" style={inp(errs.numero)} />
                  {errs.numero && <p style={errTxt}>{errs.numero}</p>}
                </div>
                <div>
                  <label style={lbl}>COMPLEMENTO</label>
                  <input value={form.complemento} onChange={set('complemento')} placeholder="Apto, bloco..." style={inp()} />
                </div>
              </div>
              <div>
                <label style={lbl}>BAIRRO</label>
                <input value={form.bairro} onChange={set('bairro')} placeholder="Bairro" style={inp()} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px', gap: 14 }}>
                <div>
                  <label style={lbl}>CIDADE</label>
                  <input value={form.cidade} onChange={set('cidade')} placeholder="Cidade" style={inp()} />
                </div>
                <div>
                  <label style={lbl}>UF</label>
                  <input value={form.uf} onChange={set('uf')} placeholder="SP" maxLength={2} style={inp()} />
                </div>
              </div>
            </div>
          </div>

          {globalErr && <p style={{ fontSize: 13, color: '#ef4444', textAlign: 'center', marginBottom: 16 }}>{globalErr}</p>}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '15px', background: '#12fd00', color: '#000', border: 'none', borderRadius: 12, fontWeight: 900, fontSize: 16, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 24px rgba(18,253,0,0.3)' }}>
            {loading ? 'Criando conta...' : 'Criar Conta e Continuar →'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#444' }}>
            Já tem conta?{' '}
            <a href={`/conta/login?redirect=${encodeURIComponent(redirect)}`} style={{ color: '#12fd00', fontWeight: 700, textDecoration: 'none' }}>Entrar</a>
          </p>
        </form>
      </div>
    </div>
  )
}
