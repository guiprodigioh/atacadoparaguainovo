'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

type Product = { id: string; name: string; brand: string; usd_price: number; img_url: string; ativo: boolean; sort_order: number; estoque: number | null }

export default function Produtos() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<{ id: string; price: string } | null>(null)
  const [editingEstoque, setEditingEstoque] = useState<{ id: string; val: string } | null>(null)
  const [filterBrand, setFilterBrand] = useState('')
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/produtos-list').then(r => r.json()).then(data => {
      setProducts(data)
      setLoading(false)
    })
  }, [])

  const patch = async (id: string, payload: object) => {
    setSaving(id)
    await fetch(`/api/admin/produtos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSaving(null)
  }

  const toggleAtivo = async (p: Product) => {
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, ativo: !x.ativo } : x))
    await patch(p.id, { ativo: !p.ativo })
  }

  const savePrice = async (id: string) => {
    if (!editing || editing.id !== id) return
    const price = parseFloat(editing.price.replace(',', '.'))
    if (isNaN(price) || price <= 0) return
    setProducts(prev => prev.map(x => x.id === id ? { ...x, usd_price: price } : x))
    setEditing(null)
    await patch(id, { usd_price: price })
  }

  const saveEstoque = async (id: string) => {
    if (!editingEstoque || editingEstoque.id !== id) return
    const val = editingEstoque.val === '' ? null : parseInt(editingEstoque.val)
    setProducts(prev => prev.map(x => x.id === id ? { ...x, estoque: val } : x))
    setEditingEstoque(null)
    await patch(id, { estoque: val })
  }

  const brands = ['Todos', ...Array.from(new Set(products.map(p => p.brand).filter(Boolean)))]
  const filtered = filterBrand && filterBrand !== 'Todos'
    ? products.filter(p => p.brand === filterBrand)
    : products

  const ativos = products.filter(p => p.ativo).length

  return (
    <div style={{ padding: '32px 36px', background: '#080808', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Produtos</h1>
          <p style={{ color: '#444', fontSize: 13, marginTop: 4 }}>{ativos} ativos de {products.length}</p>
        </div>
      </div>

      {/* Brand filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {brands.map(b => (
          <button key={b} onClick={() => setFilterBrand(b)}
            style={{ padding: '5px 12px', fontSize: 11, fontWeight: 700, borderRadius: 6, border: `1px solid ${filterBrand === b || (b === 'Todos' && !filterBrand) ? '#12fd00' : '#1a1a1a'}`, background: filterBrand === b || (b === 'Todos' && !filterBrand) ? 'rgba(18,253,0,0.1)' : 'transparent', color: filterBrand === b || (b === 'Todos' && !filterBrand) ? '#12fd00' : '#444', cursor: 'pointer' }}>
            {b}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 12, height: 280 }} />
          ))
        ) : filtered.map(p => (
          <div key={p.id} style={{ background: '#0e0e0e', border: `1px solid ${p.ativo ? '#1a1a1a' : '#ef444420'}`, borderRadius: 12, overflow: 'hidden', opacity: p.ativo ? 1 : 0.5, transition: 'all 0.2s' }}>
            <div style={{ position: 'relative', height: 140, background: '#111' }}>
              {p.img_url && <Image src={p.img_url} alt={p.name} fill style={{ objectFit: 'cover' }} unoptimized />}
              {p.brand && (
                <span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.8)', color: '#666', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3 }}>{p.brand.toUpperCase()}</span>
              )}
              {/* Toggle */}
              <button onClick={() => toggleAtivo(p)} disabled={saving === p.id}
                style={{ position: 'absolute', top: 8, right: 8, padding: '4px 10px', fontSize: 10, fontWeight: 700, borderRadius: 4, border: `1px solid ${p.ativo ? 'rgba(18,253,0,0.4)' : 'rgba(239,68,68,0.4)'}`, background: p.ativo ? 'rgba(18,253,0,0.15)' : 'rgba(239,68,68,0.15)', color: p.ativo ? '#12fd00' : '#ef4444', cursor: 'pointer' }}>
                {saving === p.id ? '...' : p.ativo ? 'ATIVO' : 'INATIVO'}
              </button>
            </div>
            <div style={{ padding: '10px 12px' }}>
              <p style={{ fontSize: 10, color: '#888', margin: '0 0 8px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{p.name}</p>
              {/* Price edit */}
              {editing?.id === p.id ? (
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    value={editing.price}
                    onChange={e => setEditing({ id: p.id, price: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && savePrice(p.id)}
                    autoFocus
                    style={{ flex: 1, padding: '6px 8px', background: '#111', border: '1px solid rgba(18,253,0,0.4)', borderRadius: 6, color: '#12fd00', fontSize: 13, fontWeight: 700, outline: 'none', width: 0 }}
                  />
                  <button onClick={() => savePrice(p.id)} style={{ padding: '0 10px', background: '#12fd00', color: '#000', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>✓</button>
                  <button onClick={() => setEditing(null)} style={{ padding: '0 8px', background: '#1a1a1a', color: '#666', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>×</button>
                </div>
              ) : (
                <button onClick={() => setEditing({ id: p.id, price: p.usd_price.toString() })}
                  style={{ display: 'flex', alignItems: 'baseline', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: '#12fd00' }}>USD {p.usd_price.toFixed(2)}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              )}
              {/* Estoque */}
              <div style={{ marginTop: 8 }}>
                {editingEstoque?.id === p.id ? (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <input type="number" min="0" value={editingEstoque.val}
                      onChange={e => setEditingEstoque({ id: p.id, val: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && saveEstoque(p.id)}
                      autoFocus placeholder="ilimitado"
                      style={{ flex: 1, padding: '4px 8px', background: '#111', border: '1px solid rgba(18,253,0,0.4)', borderRadius: 5, color: '#12fd00', fontSize: 12, outline: 'none', width: 0 }} />
                    <button onClick={() => saveEstoque(p.id)} style={{ padding: '0 8px', background: '#12fd00', color: '#000', border: 'none', borderRadius: 5, fontWeight: 700, fontSize: 10, cursor: 'pointer' }}>✓</button>
                    <button onClick={() => setEditingEstoque(null)} style={{ padding: '0 6px', background: '#1a1a1a', color: '#666', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12 }}>×</button>
                  </div>
                ) : (
                  <button onClick={() => setEditingEstoque({ id: p.id, val: p.estoque?.toString() ?? '' })}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 10, color: p.estoque === 0 ? '#ef4444' : p.estoque !== null ? '#f59e0b' : '#2a2a2a' }}>
                      {p.estoque === null ? 'Estoque: ∞' : p.estoque === 0 ? 'Sem estoque' : `Estoque: ${p.estoque}`}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
