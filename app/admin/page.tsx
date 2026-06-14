import { supabaseAdmin } from '@/lib/supabase'

const BRL_RATE = 5.20
const fmt = (n: number) => `R$ ${n.toFixed(2).replace('.', ',')}`

const STATUS_LABEL: Record<string, string> = {
  pendente_pagamento: 'Pendente PIX',
  pago: 'Pago',
  pronto_retirada: 'Pronto p/ Retirada',
  retirado: 'Retirado',
  cancelado: 'Cancelado',
}
const STATUS_COLOR: Record<string, string> = {
  pendente_pagamento: '#f59e0b',
  pago: '#3b82f6',
  pronto_retirada: '#12fd00',
  retirado: '#555',
  cancelado: '#ef4444',
}

async function getData() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [{ data: orders }, { data: customers }, { data: todayOrders }] = await Promise.all([
    supabaseAdmin.from('orders').select('*, customers(nome)').order('created_at', { ascending: false }),
    supabaseAdmin.from('customers').select('id, created_at'),
    supabaseAdmin.from('orders').select('*').gte('created_at', today.toISOString()),
  ])

  return { orders: orders || [], customers: customers || [], todayOrders: todayOrders || [] }
}

export default async function AdminDashboard() {
  const { orders, customers, todayOrders } = await getData()

  const totalBRL = orders.filter(o => o.status !== 'cancelado').reduce((s, o) => s + o.total_brl, 0)
  const totalUSD = orders.filter(o => o.status !== 'cancelado').reduce((s, o) => s + o.total_usd, 0)
  const pagosBRL = orders.filter(o => ['pago', 'pronto_retirada', 'retirado'].includes(o.status)).reduce((s, o) => s + o.total_brl, 0)
  const pendentes = orders.filter(o => o.status === 'pendente_pagamento').length
  const recentOrders = orders.slice(0, 8)

  const cards = [
    { label: 'Pedidos Hoje', value: todayOrders.length, sub: `${orders.length} total`, color: '#12fd00' },
    { label: 'Receita Confirmada', value: fmt(pagosBRL), sub: `USD ${totalUSD.toFixed(2)}`, color: '#12fd00' },
    { label: 'Aguardando PIX', value: pendentes, sub: 'pedidos pendentes', color: '#f59e0b' },
    { label: 'Clientes', value: customers.length, sub: 'cadastrados', color: '#00e5ff' },
  ]

  return (
    <div style={{ padding: '32px 36px', background: '#080808', minHeight: '100vh' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Dashboard</h1>
        <p style={{ color: '#444', fontSize: 13, marginTop: 4 }}>Visão geral do dia</p>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 36 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 12, padding: '20px 22px' }}>
            <p style={{ fontSize: 11, color: '#444', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 12 }}>{c.label.toUpperCase()}</p>
            <p style={{ fontSize: 26, fontWeight: 900, color: c.color, margin: '0 0 4px' }}>{c.value}</p>
            <p style={{ fontSize: 11, color: '#333', margin: 0 }}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Pedidos recentes */}
      <div style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Pedidos Recentes</p>
          <a href="/admin/pedidos" style={{ fontSize: 11, color: '#12fd00', textDecoration: 'none', fontWeight: 700 }}>Ver todos →</a>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #111' }}>
              {['Pedido', 'Cliente', 'Total', 'Status', 'Data'].map(h => (
                <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 10, color: '#444', fontWeight: 700, letterSpacing: '0.08em' }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '32px 20px', textAlign: 'center', color: '#333', fontSize: 13 }}>Nenhum pedido ainda</td></tr>
            ) : recentOrders.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid #111' }}>
                <td style={{ padding: '12px 20px', fontSize: 12, color: '#12fd00', fontWeight: 700 }}>{o.order_num}</td>
                <td style={{ padding: '12px 20px', fontSize: 12, color: '#888' }}>{(o as any).customers?.nome || '—'}</td>
                <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 700, color: '#fff' }}>{fmt(o.total_brl)}</td>
                <td style={{ padding: '12px 20px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: STATUS_COLOR[o.status] || '#888', background: `${STATUS_COLOR[o.status]}15`, padding: '3px 8px', borderRadius: 4, border: `1px solid ${STATUS_COLOR[o.status]}30` }}>
                    {STATUS_LABEL[o.status] || o.status}
                  </span>
                </td>
                <td style={{ padding: '12px 20px', fontSize: 12, color: '#444' }}>{new Date(o.created_at).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
