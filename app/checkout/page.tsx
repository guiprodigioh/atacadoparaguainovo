'use client'
import { useState, useEffect, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCarrinho, currencies } from '@/components/CarrinhoContext'
import { getSupabaseClient } from '@/lib/supabase-client'

const BRL_RATE = currencies.find(c => c.code === 'BRL')!.rate
const PIX_KEY = '62533491000193'
const PIX_HOLDER = 'ATACADO PARAGUAI'
const WHATSAPP = '595984522822'

const fmtBRL = (usd: number) =>
  `R$ ${(usd * BRL_RATE).toFixed(2).replace('.', ',')}`

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
  nome: string; cpf: string; email: string; telefone: string
  cep: string; endereco: string; numero: string; complemento: string
  bairro: string; cidade: string; uf: string
}
const empty: F = {
  nome: '', cpf: '', email: '', telefone: '',
  cep: '', endereco: '', numero: '', complemento: '',
  bairro: '', cidade: '', uf: '',
}

export default function Checkout() {
  const router = useRouter()
  const { itens, totalUsd, limpar } = useCarrinho()
  const [form, setForm] = useState<F>(empty)
  const [errs, setErrs] = useState<Partial<Record<keyof F, string>>>({})
  const [step, setStep] = useState<'form' | 'pix'>('form')
  const [orderNum, setOrderNum] = useState('')
  const [cepLoad, setCepLoad] = useState(false)
  const [copied, setCopied] = useState<'key' | 'val' | null>(null)
  const [mounted, setMounted] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  const [orderId, setOrderId] = useState('')
  const [comprovante, setComprovante] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [globalErr, setGlobalErr] = useState('')

  useEffect(() => {
    setMounted(true)
    const supabase = getSupabaseClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profile) {
        setUserName(profile.nome || '')
        setForm({
          nome: profile.nome || '',
          cpf: profile.cpf || '',
          email: user.email || '',
          telefone: profile.telefone || '',
          cep: profile.cep || '',
          endereco: profile.endereco || '',
          numero: profile.numero || '',
          complemento: profile.complemento || '',
          bairro: profile.bairro || '',
          cidade: profile.cidade || '',
          uf: profile.uf || '',
        })
      } else {
        setForm(p => ({ ...p, email: user.email || '' }))
      }
    })
  }, [])

  const set = (k: keyof F) => (e: ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value
    if (k === 'cpf') v = maskCPF(v)
    else if (k === 'telefone') v = maskPhone(v)
    else if (k === 'cep') {
      v = maskCEP(v)
      if (v.replace(/\D/g, '').length === 8) lookupCEP(v)
    }
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
      if (!d.erro) {
        setForm(p => ({ ...p, endereco: d.logradouro || '', bairro: d.bairro || '', cidade: d.localidade || '', uf: d.uf || '' }))
      }
    } catch {}
    finally { setCepLoad(false) }
  }

  const validate = () => {
    const e: Partial<Record<keyof F, string>> = {}
    if (!form.nome.trim()) e.nome = 'Obrigatório'
    if (!form.cpf.replace(/\D/g, '').match(/^\d{11}$/)) e.cpf = 'CPF inválido'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'E-mail inválido'
    if (!form.telefone.replace(/\D/g, '').match(/^\d{10,11}$/)) e.telefone = 'Número inválido'
    if (!form.cep.replace(/\D/g, '').match(/^\d{8}$/)) e.cep = 'CEP inválido'
    if (!form.endereco.trim()) e.endereco = 'Obrigatório'
    if (!form.numero.trim()) e.numero = 'Obrigatório'
    setErrs(e)
    return Object.keys(e).length === 0
  }

  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!validate()) return
    setSubmitting(true)
    setGlobalErr('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form, itens, userId }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setGlobalErr(d.error || 'Erro ao registrar pedido. Tente novamente.')
        setSubmitting(false)
        return
      }
      const { orderNum: num, orderId: oid } = await res.json()
      setOrderNum(num)
      setOrderId(oid || '')
      limpar()
      setStep('pix')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setGlobalErr('Erro de conexão. Verifique sua internet e tente novamente.')
    }
    setSubmitting(false)
  }

  const totalBRL = totalUsd * BRL_RATE
  const totalBRLStr = totalBRL.toFixed(2).replace('.', ',')

  const copy = async (text: string, which: 'key' | 'val') => {
    try { await navigator.clipboard.writeText(text) } catch {}
    setCopied(which)
    setTimeout(() => setCopied(null), 2200)
  }

  const sendWhatsApp = () => {
    const linhas = itens.map(i => `• ${i.name} x${i.quantity} — ${fmtBRL(i.usd * i.quantity)}`).join('\n')
    const msg = encodeURIComponent(
      `*PEDIDO ${orderNum}*\n\n` +
      `Nome: ${form.nome}\n` +
      `CPF: ${form.cpf}\n` +
      `Tel: ${form.telefone}\n` +
      `Email: ${form.email}\n` +
      `Endereço: ${form.endereco}, ${form.numero}${form.complemento ? `, ${form.complemento}` : ''}\n` +
      `${form.bairro} — ${form.cidade}/${form.uf} — CEP ${form.cep}\n\n` +
      `*PRODUTOS:*\n${linhas}\n\n` +
      `*TOTAL: R$ ${totalBRLStr}*\n\n` +
      `✅ PIX enviado`
    )
    window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank')
  }

  const uploadComprovante = async (file: File) => {
    if (!orderId) return
    setComprovante('uploading')
    try {
      const supabase = getSupabaseClient()
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${userId || 'guest'}/${orderId}.${ext}`
      const { error: upErr } = await supabase.storage.from('comprovantes').upload(path, file, { upsert: true })
      if (upErr) { setComprovante('error'); return }
      const { data: { publicUrl } } = supabase.storage.from('comprovantes').getPublicUrl(path)
      await supabase.from('orders').update({ comprovante_url: publicUrl }).eq('id', orderId)
      fetch('/api/notify/comprovante', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId }) }).catch(() => {})
      setComprovante('done')
    } catch {
      setComprovante('error')
    }
  }

  const inp = (err?: string) => ({
    width: '100%', padding: '11px 14px',
    background: '#0e0e0e', border: `1px solid ${err ? '#ef4444' : '#2a2a2a'}`,
    borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s',
  })

  const lbl = {
    display: 'block', fontSize: 11, fontWeight: 700, color: '#555',
    letterSpacing: '0.08em', marginBottom: 6,
  }

  const err = { fontSize: 10, color: '#ef4444', marginTop: 4 }

  if (!mounted) return <div style={{ minHeight: '100vh', background: '#080808' }} />

  if (itens.length === 0 && step === 'form') {
    return (
      <div style={{ minHeight: '100vh', background: '#080808', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <p style={{ color: '#555', fontSize: 15 }}>Seu carrinho está vazio</p>
        <button onClick={() => router.push('/')}
          style={{ padding: '12px 28px', background: '#12fd00', color: '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          Ver Catálogo
        </button>
      </div>
    )
  }

  /* ─── PIX SCREEN ─── */
  if (step === 'pix') {
    return (
      <div style={{ minHeight: '100vh', background: '#080808', color: '#fff' }}>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }`}</style>
        <header style={{ borderBottom: '1px solid #1a1a1a', padding: '0 24px', display: 'flex', alignItems: 'center', height: 60 }}>
          <Image src="/logo.png" alt="Atacado Paraguai" width={90} height={35} style={{ objectFit: 'contain' }} />
        </header>

        <div style={{ maxWidth: 520, margin: '48px auto', padding: '0 24px 64px' }}>
          {/* success badge */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(18,253,0,0.08)', border: '2px solid #12fd00', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 30px rgba(18,253,0,0.2)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#12fd00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>Pedido Confirmado!</h1>
            <p style={{ color: '#555', fontSize: 13 }}>
              Pedido <span style={{ color: '#12fd00', fontWeight: 700 }}>#{orderNum}</span> — aguardando pagamento PIX
            </p>
          </div>

          {/* PIX card */}
          <div style={{ background: '#0e0e0e', border: '1px solid #2a2a2a', borderRadius: 16, padding: '24px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#12fd00', boxShadow: '0 0 8px #12fd00', animation: 'pulse 2s ease infinite' }} />
              <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', color: '#12fd00' }}>PAGUE VIA PIX</span>
            </div>

            <p style={{ fontSize: 12, color: '#555', marginBottom: 20, lineHeight: 1.6 }}>
              Abra o app do seu banco, acesse <strong style={{ color: '#888' }}>Pix → Copia e Cola</strong>, cole a chave abaixo e informe o valor exato.
            </p>

            {/* Chave PIX */}
            <div style={{ marginBottom: 14 }}>
              <p style={{ ...lbl, marginBottom: 8 }}>CHAVE PIX</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, padding: '11px 14px', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 13, color: '#ccc', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {PIX_KEY}
                </div>
                <button onClick={() => copy(PIX_KEY, 'key')}
                  style={{ flexShrink: 0, padding: '0 16px', background: copied === 'key' ? 'rgba(18,253,0,0.15)' : 'rgba(18,253,0,0.08)', border: `1px solid ${copied === 'key' ? '#12fd00' : 'rgba(18,253,0,0.3)'}`, borderRadius: 8, color: '#12fd00', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                  {copied === 'key' ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Valor */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ ...lbl, marginBottom: 8 }}>VALOR A PAGAR</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, padding: '12px 14px', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 20, fontWeight: 900, color: '#12fd00', fontFamily: 'monospace' }}>
                  R$ {totalBRLStr}
                </div>
                <button onClick={() => copy(totalBRL.toFixed(2), 'val')}
                  style={{ flexShrink: 0, padding: '0 16px', background: copied === 'val' ? 'rgba(18,253,0,0.15)' : 'rgba(18,253,0,0.08)', border: `1px solid ${copied === 'val' ? '#12fd00' : 'rgba(18,253,0,0.3)'}`, borderRadius: 8, color: '#12fd00', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                  {copied === 'val' ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Beneficiário */}
            <div style={{ padding: '12px 14px', background: '#111', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[['Beneficiário', PIX_HOLDER], ['Pedido', `#${orderNum}`], ['Banco', 'Transferência PIX']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#555' }}>{k}</span>
                  <span style={{ color: '#888', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo */}
          <div style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
            <p style={{ ...lbl, marginBottom: 12 }}>RESUMO DO PEDIDO</p>
            {itens.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', marginBottom: 8 }}>
                <span style={{ flex: 1, marginRight: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name} × {item.quantity}</span>
                <span style={{ color: '#888', whiteSpace: 'nowrap' }}>{fmtBRL(item.usd * item.quantity)}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 12, marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 900 }}>
              <span>Total</span>
              <span style={{ color: '#12fd00' }}>R$ {totalBRLStr}</span>
            </div>
          </div>

          {/* Comprovante */}
          <div style={{ background: '#0e0e0e', border: `1px solid ${comprovante === 'done' ? 'rgba(18,253,0,0.3)' : '#1a1a1a'}`, borderRadius: 12, padding: '20px', marginBottom: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: comprovante === 'done' ? '#12fd00' : '#555', letterSpacing: '0.1em', margin: '0 0 10px' }}>ENVIAR COMPROVANTE</p>
            {comprovante === 'done' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#12fd00', fontSize: 13, fontWeight: 700 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Comprovante recebido! Aguarde a confirmação.
              </div>
            ) : (
              <>
                <p style={{ fontSize: 12, color: '#444', margin: '0 0 14px', lineHeight: 1.5 }}>
                  Após realizar o PIX, envie o comprovante aqui para agilizar a confirmação.
                </p>
                <label style={{ display: 'block', border: '1px dashed #2a2a2a', borderRadius: 10, padding: '16px', textAlign: 'center', cursor: comprovante === 'uploading' ? 'wait' : 'pointer', background: '#111' }}>
                  <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadComprovante(f) }} />
                  {comprovante === 'uploading' ? (
                    <span style={{ fontSize: 13, color: '#555' }}>Enviando...</span>
                  ) : comprovante === 'error' ? (
                    <span style={{ fontSize: 13, color: '#ef4444' }}>Erro ao enviar. Tente novamente.</span>
                  ) : (
                    <span style={{ fontSize: 13, color: '#555' }}>
                      <span style={{ display: 'block', fontSize: 22, marginBottom: 4 }}>📎</span>
                      Clique para anexar foto ou PDF
                    </span>
                  )}
                </label>
              </>
            )}
          </div>

          {/* CTAs */}
          <button onClick={sendWhatsApp}
            style={{ width: '100%', padding: '16px', background: '#25d366', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 4px 24px rgba(37,211,102,0.3)', marginBottom: 12 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Já paguei — Confirmar pelo WhatsApp
          </button>

          <button onClick={() => router.push('/')}
            style={{ width: '100%', padding: '13px', background: 'transparent', color: '#444', border: '1px solid #1a1a1a', borderRadius: 12, fontSize: 13, cursor: 'pointer' }}>
            Voltar ao Catálogo
          </button>
        </div>
      </div>
    )
  }

  /* ─── FORM SCREEN ─── */
  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#fff' }}>
      <style>{`
        input:focus { border-color: rgba(18,253,0,0.5) !important; box-shadow: 0 0 0 3px rgba(18,253,0,0.06); outline: none; }
        input::placeholder { color: #2a2a2a; }
        @media (max-width: 768px) {
          .ck-grid { grid-template-columns: 1fr !important; }
          .ck-two-col { grid-template-columns: 1fr !important; }
          .ck-summary { position: static !important; order: -1; }
        }
      `}</style>

      {/* header */}
      <header style={{ borderBottom: '1px solid #1a1a1a', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <Image src="/logo.png" alt="Atacado Paraguai" width={90} height={35} style={{ objectFit: 'contain' }} />
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#555', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Voltar
        </button>
      </header>

      {/* steps */}
      <div style={{ borderBottom: '1px solid #111', padding: '14px 24px', display: 'flex', justifyContent: 'center', gap: 48 }}>
        {[['1', 'Dados de Entrega', true], ['2', 'Pagamento PIX', false]].map(([n, label, active]) => (
          <div key={String(n)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: active ? '#12fd00' : '#1a1a1a', border: `1px solid ${active ? '#12fd00' : '#2a2a2a'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: active ? '#000' : '#333' }}>
              {n}
            </div>
            <span style={{ fontSize: 12, color: active ? '#fff' : '#333', fontWeight: active ? 700 : 400 }}>{label as string}</span>
          </div>
        ))}
      </div>

      <div className="ck-grid" style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 32, alignItems: 'start' }}>

        {/* ── FORM ── */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 28, letterSpacing: '-0.01em' }}>Dados de Entrega</h2>

          <div style={{ display: 'grid', gap: 18 }}>
            {/* Nome */}
            <div>
              <label style={lbl}>NOME COMPLETO</label>
              <input value={form.nome} onChange={set('nome')} placeholder="Seu nome completo" style={inp(errs.nome)} />
              {errs.nome && <p style={err}>{errs.nome}</p>}
            </div>

            <div className="ck-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={lbl}>CPF</label>
                <input value={form.cpf} onChange={set('cpf')} placeholder="000.000.000-00" style={inp(errs.cpf)} />
                {errs.cpf && <p style={err}>{errs.cpf}</p>}
              </div>
              <div>
                <label style={lbl}>WHATSAPP</label>
                <input value={form.telefone} onChange={set('telefone')} placeholder="(00) 00000-0000" style={inp(errs.telefone)} />
                {errs.telefone && <p style={err}>{errs.telefone}</p>}
              </div>
            </div>

            <div>
              <label style={lbl}>E-MAIL</label>
              <input value={form.email} onChange={set('email')} type="email" placeholder="seu@email.com" style={inp(errs.email)} />
              {errs.email && <p style={err}>{errs.email}</p>}
            </div>

            <div>
              <label style={lbl}>
                CEP
                {cepLoad && <span style={{ color: '#444', fontWeight: 400, marginLeft: 8 }}>buscando...</span>}
              </label>
              <input value={form.cep} onChange={set('cep')} placeholder="00000-000" style={inp(errs.cep)} />
              {errs.cep && <p style={err}>{errs.cep}</p>}
            </div>

            <div>
              <label style={lbl}>ENDEREÇO</label>
              <input value={form.endereco} onChange={set('endereco')} placeholder="Rua / Avenida" style={inp(errs.endereco)} />
              {errs.endereco && <p style={err}>{errs.endereco}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16 }}>
              <div>
                <label style={lbl}>NÚMERO</label>
                <input value={form.numero} onChange={set('numero')} placeholder="Nº" style={inp(errs.numero)} />
                {errs.numero && <p style={err}>{errs.numero}</p>}
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 16 }}>
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

          {globalErr && <p style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#ef4444', fontSize: 13, fontWeight: 600 }}>{globalErr}</p>}
          <button onClick={submit}
            disabled={submitting}
            style={{ marginTop: 16, width: '100%', padding: '16px', background: '#12fd00', color: '#000', border: 'none', borderRadius: 12, fontWeight: 900, fontSize: 16, cursor: submitting ? 'wait' : 'pointer', letterSpacing: '0.05em', boxShadow: '0 4px 24px rgba(18,253,0,0.3)', transition: 'all 0.2s', opacity: submitting ? 0.7 : 1 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 40px rgba(18,253,0,0.5)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(18,253,0,0.3)'; (e.currentTarget as HTMLButtonElement).style.transform = 'none' }}>
            Ir para Pagamento →
          </button>
        </div>

        {/* ── ORDER SUMMARY ── */}
        <div className="ck-summary" style={{ position: 'sticky', top: 80 }}>
          <div style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #111' }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: '#555', letterSpacing: '0.1em', margin: 0 }}>RESUMO DO PEDIDO</p>
            </div>
            <div style={{ padding: '16px 20px', maxHeight: 380, overflowY: 'auto' }}>
              {itens.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 6, overflow: 'hidden', position: 'relative', flexShrink: 0, background: '#111' }}>
                    <Image src={item.img} alt={item.name} fill style={{ objectFit: 'cover' }} unoptimized />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 11, color: '#888', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                    <p style={{ fontSize: 11, color: '#555', margin: 0 }}>×{item.quantity}</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#12fd00', whiteSpace: 'nowrap' }}>{fmtBRL(item.usd * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: '16px 20px', borderTop: '1px solid #111' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: '#555' }}>
                <span>Subtotal</span>
                <span>R$ {totalBRLStr}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 13, color: '#555' }}>
                <span>Frete</span>
                <span style={{ color: '#12fd00', fontWeight: 700 }}>A combinar</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid #1a1a1a', fontSize: 20, fontWeight: 900 }}>
                <span>Total</span>
                <span style={{ color: '#12fd00' }}>R$ {totalBRLStr}</span>
              </div>
              <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(18,253,0,0.06)', border: '1px solid rgba(18,253,0,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#12fd00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
                <span style={{ fontSize: 11, color: '#12fd00', fontWeight: 700 }}>Pagamento via PIX</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
