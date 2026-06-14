'use client'
import { useState, useEffect, useCallback } from 'react'

type Order = { id: string; order_num: string; total_brl: number; status: string; created_at: string }
type Customer = { id: string; nome: string; cpf: string; telefone: string; email: string; cidade: string; uf: string; created_at: string; orders: Order[] }

const STATUS_COLOR: Record<string, string> = {
  pendente_pagamento: '#f59e0b', pago: '#3b82f6', pronto_retirada: '#12fd00', retirado: '#555', cancelado: '#ef4444',
}
const STATUS_LABEL: Record<string, string> = {
  pendente_pagamento: 'Aguardando PIX', pago: 'Pago', pronto_retirada: 'Pronto p/ Retirada', retirado: 'Retirado', cancelado: 'Cancelado',
}
const fmt = (n: number) => `R$ ${n.toFixed(2).replace('.', ',')}`
const inp = { width: '100%', padding: '10px 14px', background: '#111', border: '1px solid #1a1a1a', borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const }
const lbl = { fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: '0.08em', display: 'block', marginBottom: 5 } as const

export default function Clientes() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Customer | null>(null)
  const [editing, setEditing] = useState<Partial<Customer> | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await fetch('/api/admin/clientes-list').then(r => r.json()).catch(() => ({ data: [] }))
    setCustomers(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const saveEdit = async () => {
    if (!selected || !editing) return
    setSaving(true)
    await fetch(`/api/admin/clientes/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    })
    setCustomers(prev => prev.map(c => c.id === selected.id ? { ...c, ...editing } : c))
    setSelected(prev => prev ? { ...prev, ...editing } : null)
    setEditing(null)
    setSaving(false)
  }

  const filtered = customers.filter(c => {
    if (!search) return true
    const s = search.toLowerCase()
    return c.nome?.toLowerCase().includes(s) || c.cpf?.includes(s) || c.telefone?.includes(s) || c.email?.toLowerCase().includes(s)
  })

  return (
    <div style={{ padding: '32px 36px', background: '#080808', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Clientes</h1>
          <p style={{ color: '#444', fontSize: 13, marginTop: 4 }}>{customers.length} cadastrados</p>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, CPF, email..."
          style={{ padding: '9px 14px', background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 8, color: '#fff', fontSize: 13, width: 280, outline: 'none' }} />
      </div>

      <div style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #111' }}>
              {['Nome', 'CPF', 'WhatsApp', 'E-mail', 'Cidade', 'Pedidos', 'Cadastro', ''].map(h => (
                <th key={h} style={{ padding: '11px 18px', textAlign: 'left', fontSize: 10, color: '#333', fontWeight: 700, letterSpacing: '0.08em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#333' }}>Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#333', fontSize: 13 }}>Nenhum cliente encontrado</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #0d0d0d', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#111')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                onClick={() => { setSelected(c); setEditing(null) }}>
                <td style={{ padding: '12px 18px', fontSize: 13, color: '#fff', fontWeight: 600 }}>{c.nome}</td>
                <td style={{ padding: '12px 18px', fontSize: 12, color: '#555', fontFamily: 'monospace' }}>{c.cpf}</td>
                <td style={{ padding: '12px 18px', fontSize: 12, color: '#555' }}>{c.telefone}</td>
                <td style={{ padding: '12px 18px', fontSize: 12, color: '#555' }}>{c.email}</td>
                <td style={{ padding: '12px 18px', fontSize: 12, color: '#555' }}>{c.cidade && c.uf ? `${c.cidade}/${c.uf}` : '—'}</td>
                <td style={{ padding: '12px 18px' }}>
                  <span style={{ fontSize: 12, color: '#12fd00', fontWeight: 700 }}>{(c.orders || []).length}</span>
                </td>
                <td style={{ padding: '12px 18px', fontSize: 11, color: '#333' }}>{new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
                <td style={{ padding: '12px 18px', fontSize: 13, color: '#333' }}>→</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selected && (
        <div onClick={() => { setSelected(null); setEditing(null) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#0e0e0e', border: '1px solid #2a2a2a', borderRadius: 16, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>{selected.nome}</h2>
                <p style={{ fontSize: 12, color: '#444', marginTop: 4 }}>Cliente desde {new Date(selected.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {editing ? (
                  <>
                    <button onClick={saveEdit} disabled={saving}
                      style={{ padding: '7px 16px', background: '#12fd00', color: '#000', border: 'none', borderRadius: 7, fontWeight: 700, fontSize: 12, cursor: saving ? 'wait' : 'pointer' }}>
                      {saving ? 'Salvando...' : '✓ Salvar'}
                    </button>
                    <button onClick={() => setEditing(null)}
                      style={{ padding: '7px 14px', background: 'transparent', color: '#555', border: '1px solid #222', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditing({ nome: selected.nome, cpf: selected.cpf, telefone: selected.telefone, email: selected.email, cidade: selected.cidade, uf: selected.uf })}
                    style={{ padding: '7px 16px', background: 'transparent', color: '#888', border: '1px solid #222', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>
                    Editar dados
                  </button>
                )}
                <button onClick={() => { setSelected(null); setEditing(null) }}
                  style={{ background: '#1a1a1a', border: 'none', color: '#666', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
            </div>

            {/* Dados / Edit */}
            <div style={{ background: '#111', borderRadius: 10, padding: '16px', marginBottom: 20 }}>
              <p style={{ fontSize: 10, color: '#444', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 14 }}>DADOS DO CLIENTE</p>
              {editing ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {([['nome', 'Nome completo'], ['cpf', 'CPF'], ['telefone', 'WhatsApp'], ['email', 'E-mail'], ['cidade', 'Cidade'], ['uf', 'UF']] as [keyof Customer, string][]).map(([k, label]) => (
                    <div key={k}>
                      <label style={lbl}>{label.toUpperCase()}</label>
                      <input value={(editing as any)[k] || ''} onChange={e => setEditing(p => ({ ...p, [k]: e.target.value }))} style={inp} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[['Nome', selected.nome], ['CPF', selected.cpf], ['WhatsApp', selected.telefone], ['E-mail', selected.email], ['Cidade', selected.cidade], ['UF', selected.uf]].map(([k, v]) => (
                    <div key={k}>
                      <p style={{ fontSize: 9, color: '#444', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 2 }}>{k}</p>
                      <p style={{ fontSize: 13, color: '#ccc', margin: 0 }}>{v || '—'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pedidos */}
            {(selected.orders || []).length > 0 && (
              <div style={{ background: '#111', borderRadius: 10, padding: '16px' }}>
                <p style={{ fontSize: 10, color: '#444', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 12 }}>PEDIDOS ({selected.orders.length})</p>
                {selected.orders.map(o => (
                  <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1a1a1a' }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#12fd00', marginRight: 12 }}>{o.order_num}</span>
                      <span style={{ fontSize: 11, color: '#555' }}>{new Date(o.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: STATUS_COLOR[o.status] || '#888', background: `${STATUS_COLOR[o.status] || '#888'}15`, padding: '3px 8px', borderRadius: 4, border: `1px solid ${STATUS_COLOR[o.status] || '#888'}30` }}>
                        {STATUS_LABEL[o.status] || o.status}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{fmt(o.total_brl)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
