'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client'

type OrderItem = { id: string; product_name: string; product_brand: string | null; unit_usd: number; quantity: number; subtotal_usd: number }
type Order = { id: string; order_num: string; status: string; total_brl: number; total_usd: number; created_at: string; notas: string | null; comprovante_url: string | null; order_items: OrderItem[] }

const STATUS_STEPS = ['pendente_pagamento', 'pago', 'pronto_retirada', 'retirado']
const STATUS_LABEL: Record<string, string> = {
  pendente_pagamento: 'Aguardando PIX',
  pago: 'Pago',
  pronto_retirada: 'Pronto p/ Retirada',
  retirado: 'Retirado',
  cancelado: 'Cancelado',
}

const PIX_KEY = '62533491000193'
const PIX_HOLDER = 'ATACADO PARAGUAI'
const fmt = (n: number) => `R$ ${n.toFixed(2).replace('.', ',')}`
const fmtUsd = (n: number) => `$ ${n.toFixed(2)}`

export default function PedidoDetalhe() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<Order | null>(null)
  const [copied, setCopied] = useState<'key' | 'valor' | null>(null)
  const [comprovante, setComprovante] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')

  useEffect(() => {
    const supabase = getSupabaseClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace('/conta/login'); return }
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()
      if (!data) { router.replace('/conta/minha-conta/pedidos'); return }
      setOrder(data)
      setLoading(false)
    })
  }, [router, params.id])

  const copy = (text: string, type: 'key' | 'valor') => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const uploadComprovante = async (file: File) => {
    if (!order) return
    setComprovante('uploading')
    try {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setComprovante('error'); return }
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${user.id}/${order.id}.${ext}`
      const { error: upErr } = await supabase.storage.from('comprovantes').upload(path, file, { upsert: true })
      if (upErr) { setComprovante('error'); return }
      const { data: { publicUrl } } = supabase.storage.from('comprovantes').getPublicUrl(path)
      await supabase.from('orders').update({ comprovante_url: publicUrl }).eq('id', order.id)
      fetch('/api/notify/comprovante', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: order.id }) }).catch(() => {})
      setOrder(o => o ? { ...o, comprovante_url: publicUrl } : o)
      setComprovante('done')
    } catch {
      setComprovante('error')
    }
  }

  if (loading) return <div style={{ minHeight: 200 }} />
  if (!order) return null

  const stepIndex = STATUS_STEPS.indexOf(order.status)
  const isCanceled = order.status === 'cancelado'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <button onClick={() => router.push('/conta/minha-conta/pedidos')} style={{ background: 'transparent', border: '1px solid #222', borderRadius: 8, color: '#555', padding: '7px 14px', fontSize: 12, cursor: 'pointer' }}>← Pedidos</button>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>{order.order_num}</h1>
          <p style={{ fontSize: 11, color: '#444', margin: 0 }}>
            {new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Status timeline */}
      {!isCanceled ? (
        <div style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 14, padding: '24px', marginBottom: 20 }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: '#12fd00', letterSpacing: '0.1em', margin: '0 0 24px' }}>STATUS DO PEDIDO</p>
          <div style={{ display: 'flex' }}>
            {STATUS_STEPS.map((step, i) => {
              const done = i <= stepIndex
              const current = i === stepIndex
              return (
                <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  {i < STATUS_STEPS.length - 1 && (
                    <div style={{
                      position: 'absolute', top: 13, left: '50%', width: '100%', height: 2,
                      background: i < stepIndex ? '#12fd00' : '#1a1a1a', zIndex: 0,
                    }} />
                  )}
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    border: `2px solid ${done ? '#12fd00' : '#222'}`,
                    background: current ? '#12fd00' : done ? 'rgba(18,253,0,0.12)' : '#0a0a0a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1, position: 'relative',
                    boxShadow: current ? '0 0 16px rgba(18,253,0,0.4)' : 'none',
                  }}>
                    {done && !current && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#12fd00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                  <p style={{ fontSize: 9, fontWeight: current ? 800 : 600, color: current ? '#12fd00' : done ? '#666' : '#2a2a2a', marginTop: 8, textAlign: 'center', letterSpacing: '0.03em', lineHeight: 1.3 }}>
                    {STATUS_LABEL[step]}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
          <p style={{ color: '#ef4444', fontWeight: 700, fontSize: 13, margin: 0 }}>Pedido cancelado</p>
        </div>
      )}

      {/* PIX info */}
      {order.status === 'pendente_pagamento' && (
        <div style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 14, padding: '24px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 0 }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: '#f59e0b', letterSpacing: '0.1em', margin: '0 0 14px' }}>PAGAMENTO VIA PIX</p>
          <p style={{ fontSize: 13, color: '#666', marginBottom: 18, lineHeight: 1.5 }}>
            Transfira o valor exato abaixo para a chave PIX e aguarde a confirmação.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '14px 16px' }}>
              <p style={{ fontSize: 10, color: '#444', fontWeight: 700, margin: '0 0 8px', letterSpacing: '0.08em' }}>CHAVE PIX (CNPJ)</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 900, fontFamily: 'monospace', letterSpacing: '0.05em', flex: 1 }}>{PIX_KEY}</span>
                <button onClick={() => copy(PIX_KEY, 'key')} style={{ padding: '6px 14px', background: copied === 'key' ? 'rgba(18,253,0,0.12)' : '#1a1a1a', border: `1px solid ${copied === 'key' ? '#12fd00' : '#252525'}`, borderRadius: 6, color: copied === 'key' ? '#12fd00' : '#888', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}>
                  {copied === 'key' ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
              <p style={{ fontSize: 11, color: '#444', margin: '8px 0 0' }}>Beneficiário: {PIX_HOLDER}</p>
            </div>
            <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '14px 16px' }}>
              <p style={{ fontSize: 10, color: '#444', fontWeight: 700, margin: '0 0 8px', letterSpacing: '0.08em' }}>VALOR A TRANSFERIR</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22, fontWeight: 900, flex: 1 }}>{fmt(order.total_brl)}</span>
                <button onClick={() => copy(order.total_brl.toFixed(2), 'valor')} style={{ padding: '6px 14px', background: copied === 'valor' ? 'rgba(18,253,0,0.12)' : '#1a1a1a', border: `1px solid ${copied === 'valor' ? '#12fd00' : '#252525'}`, borderRadius: 6, color: copied === 'valor' ? '#12fd00' : '#888', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}>
                  {copied === 'valor' ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>
          </div>

          {/* Upload comprovante */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(245,158,11,0.1)' }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: comprovante === 'done' || order.comprovante_url ? '#12fd00' : '#f59e0b', letterSpacing: '0.1em', margin: '0 0 10px' }}>COMPROVANTE DE PAGAMENTO</p>
            {(comprovante === 'done' || order.comprovante_url) ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#12fd00', fontSize: 13, fontWeight: 700 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Comprovante enviado — aguardando confirmação
              </div>
            ) : (
              <>
                <p style={{ fontSize: 12, color: '#777', margin: '0 0 12px', lineHeight: 1.5 }}>
                  Após o PIX, envie o comprovante aqui para agilizar a confirmação.
                </p>
                <label style={{ display: 'block', border: '1px dashed rgba(245,158,11,0.3)', borderRadius: 10, padding: '14px', textAlign: 'center', cursor: comprovante === 'uploading' ? 'wait' : 'pointer', background: 'rgba(245,158,11,0.03)' }}>
                  <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadComprovante(f) }} />
                  {comprovante === 'uploading' ? (
                    <span style={{ fontSize: 13, color: '#777' }}>Enviando...</span>
                  ) : comprovante === 'error' ? (
                    <span style={{ fontSize: 13, color: '#ef4444' }}>Erro ao enviar. Tente novamente.</span>
                  ) : (
                    <span style={{ fontSize: 13, color: '#666' }}>📎 Clique para anexar foto ou PDF</span>
                  )}
                </label>
              </>
            )}
          </div>
        </div>
      )}

      {/* Items */}
      <div style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #111' }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: '#12fd00', letterSpacing: '0.1em', margin: 0 }}>ITENS DO PEDIDO</p>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #0d0d0d' }}>
              {['Produto', 'Qtd', 'Unit.', 'Subtotal'].map(h => (
                <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 10, color: '#333', fontWeight: 700, letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {order.order_items.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #0d0d0d' }}>
                <td style={{ padding: '12px 20px' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{item.product_name}</p>
                  {item.product_brand && <p style={{ fontSize: 10, color: '#444', margin: '2px 0 0' }}>{item.product_brand}</p>}
                </td>
                <td style={{ padding: '12px 20px', fontSize: 13, color: '#777' }}>{item.quantity}x</td>
                <td style={{ padding: '12px 20px', fontSize: 12, color: '#555' }}>{fmtUsd(item.unit_usd)}</td>
                <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 700 }}>{fmtUsd(item.subtotal_usd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #111', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#444', fontWeight: 700, letterSpacing: '0.06em' }}>TOTAL</span>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, color: '#444', margin: 0 }}>{fmtUsd(order.total_usd)}</p>
            <p style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>{fmt(order.total_brl)}</p>
          </div>
        </div>
      </div>

      {/* Pickup note */}
      <div style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 14, padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#12fd00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, margin: '0 0 4px', color: '#12fd00' }}>Retirada em loja</p>
            <p style={{ fontSize: 12, color: '#555', margin: 0, lineHeight: 1.6 }}>
              Seu pedido ficará disponível para retirada após a confirmação do pagamento. Você receberá um aviso quando estiver pronto.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
