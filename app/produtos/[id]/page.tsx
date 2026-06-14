'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'
import { useCarrinho, currencies } from '@/components/CarrinhoContext'

type Product = { id: string; name: string; brand: string | null; usd_price: number; img_url: string; estoque: number | null }

const dec = (s: string | null) => { try { return s ? atob(s) : null } catch { return s } }

const fmt = (n: number, rate: number, code: string) => {
  if (code === 'PYG') return n > 0 ? (n * rate).toLocaleString('es-PY', { maximumFractionDigits: 0 }) : '0'
  return (n * rate).toFixed(2).replace('.', ',')
}

export default function ProdutoPage() {
  const router = useRouter()
  const params = useParams()
  const { adicionar, abrirSidebar, quantidade, currency, setCurrency } = useCarrinho()

  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [currencyOpen, setCurrencyOpen] = useState(false)

  const loadProduct = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/produtos/${params.id}`)
    if (!res.ok) { router.replace('/'); return }
    const raw: Product = await res.json()
    const data = { ...raw, name: dec(raw.name) ?? raw.name, brand: dec(raw.brand) }
    setProduct(data)
    setLoading(false)

    if (data.brand) {
      const all = await fetch('/api/produtos').then(r => r.json()) as Product[]
      setRelated(all
        .map((p: Product) => ({ ...p, name: dec(p.name) ?? p.name, brand: dec(p.brand) }))
        .filter((p: Product) => p.brand === data.brand && p.id !== data.id)
        .slice(0, 4))
    }
  }, [params.id, router])

  useEffect(() => { loadProduct() }, [loadProduct])

  const handleAdd = () => {
    if (!product) return
    for (let i = 0; i < qty; i++) {
      adicionar({ id: product.id, name: product.name, usd: product.usd_price, img: product.img_url, brand: product.brand ?? undefined })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 3000)
  }

  const stockStatus = (product: Product) => {
    if (product.estoque === null) return { label: 'Em estoque', color: '#12fd00', bg: 'rgba(18,253,0,0.1)', border: 'rgba(18,253,0,0.3)' }
    if (product.estoque === 0) return { label: 'Sem estoque', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' }
    if (product.estoque <= 5) return { label: `Últimas ${product.estoque} unidades`, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' }
    return { label: `${product.estoque} em estoque`, color: '#12fd00', bg: 'rgba(18,253,0,0.1)', border: 'rgba(18,253,0,0.3)' }
  }

  return (
    <div style={{ background: '#080808', minHeight: '100vh', color: '#fff' }}>
      <style>{`
        @keyframes productFloat {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-14px) rotate(0.5deg); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes borderRun {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .qty-btn:hover { background: rgba(18,253,0,0.15) !important; color: #12fd00 !important; }
        .rel-card:hover { border-color: rgba(18,253,0,0.4) !important; transform: translateY(-4px); box-shadow: 0 12px 32px rgba(18,253,0,0.08) !important; }
        .rel-card:hover .rel-img { transform: scale(1.06); }
        .rel-card { transition: all 0.25s; }
        .rel-img { transition: transform 0.4s ease; }
        @media (max-width: 768px) {
          .product-grid { flex-direction: column !important; }
          .product-image-col { width: 100% !important; max-width: 100% !important; }
          .product-info-col { width: 100% !important; }
          .product-name { font-size: 22px !important; }
          .price-usd { font-size: 42px !important; }
          .related-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* ═══ NAVBAR ═══ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(6,6,6,0.94)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(18,253,0,0.15)',
      }}>
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent 0%, #12fd00 20%, #00e5ff 50%, #ff2cf7 80%, transparent 100%)', backgroundSize: '200% 100%', animation: 'borderRun 3s linear infinite' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Image src="/logo.png" alt="Atacado Paraguai" width={100} height={39} style={{ objectFit: 'contain', cursor: 'pointer' }} onClick={() => router.push('/')} />
            <button onClick={() => router.push('/#saude')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid #1e1e1e', borderRadius: 6, color: '#555', fontSize: 11, fontWeight: 700, padding: '5px 12px', cursor: 'pointer', letterSpacing: '0.05em', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#12fd00'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(18,253,0,0.3)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#555'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#1e1e1e' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              CATÁLOGO
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Currency picker */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setCurrencyOpen(p => !p)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, background: 'rgba(18,253,0,0.06)', border: '1px solid rgba(18,253,0,0.2)', color: '#12fd00', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                <div style={{ position: 'relative', width: 18, height: 13, overflow: 'hidden', borderRadius: 2 }}>
                  <Image src={currency.flag} alt={currency.code} fill style={{ objectFit: 'cover' }} unoptimized />
                </div>
                {currency.code}
                <svg style={{ width: 9, height: 9 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
              </button>
              {currencyOpen && (
                <div style={{ position: 'absolute', right: 0, top: '110%', background: '#0e0e0e', border: '1px solid rgba(18,253,0,0.2)', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.8)', zIndex: 999, minWidth: 130, overflow: 'hidden' }}>
                  {currencies.map(c => (
                    <button key={c.code} onClick={() => { setCurrency(c); setCurrencyOpen(false) }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', background: currency.code === c.code ? 'rgba(18,253,0,0.08)' : 'transparent', border: 'none', color: currency.code === c.code ? '#12fd00' : '#888', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      <div style={{ position: 'relative', width: 18, height: 13, overflow: 'hidden', borderRadius: 2, flexShrink: 0 }}>
                        <Image src={c.flag} alt={c.code} fill style={{ objectFit: 'cover' }} unoptimized />
                      </div>
                      {c.code} — {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => { abrirSidebar() }} style={{ position: 'relative', background: 'rgba(18,253,0,0.08)', border: '1px solid rgba(18,253,0,0.2)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#12fd00', fontSize: 12, fontWeight: 700 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              CARRINHO
              {quantidade > 0 && (
                <span style={{ background: '#12fd00', color: '#000', borderRadius: 99, fontSize: 10, fontWeight: 900, padding: '0 6px', minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{quantidade}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 24px', display: 'flex', gap: 48 }}>
          <div style={{ width: 480, height: 480, background: '#0e0e0e', borderRadius: 20, flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[60, 32, 24, 80, 56, 100].map((h, i) => (
              <div key={i} style={{ height: h, background: '#0e0e0e', borderRadius: 8, width: i === 0 ? '40%' : i === 5 ? '100%' : '70%' }} />
            ))}
          </div>
        </div>
      ) : product ? (
        <>
          {/* ═══ PRODUCT HERO ═══ */}
          <section style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px 64px', animation: 'fadeUp 0.5s ease' }}>
            <div className="product-grid" style={{ display: 'flex', gap: 56, alignItems: 'flex-start' }}>

              {/* IMAGE COL */}
              <div className="product-image-col" style={{ width: 460, flexShrink: 0 }}>
                <div style={{ position: 'sticky', top: 80 }}>
                  <div style={{
                    position: 'relative',
                    background: 'radial-gradient(ellipse 80% 80% at center, #002200 0%, #000d00 60%, #080808 100%)',
                    borderRadius: 20,
                    border: '1px solid rgba(18,253,0,0.12)',
                    overflow: 'hidden',
                    aspectRatio: '1',
                    boxShadow: '0 0 80px rgba(18,253,0,0.06), inset 0 0 60px rgba(18,253,0,0.03)',
                  }}>
                    {/* grid overlay */}
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(18,253,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(18,253,0,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
                    {/* glow orb */}
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(18,253,0,0.15) 0%, transparent 70%)', animation: 'glowPulse 3s ease-in-out infinite', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ position: 'relative', width: '78%', height: '78%', animation: 'productFloat 4s ease-in-out infinite', filter: 'drop-shadow(0 0 40px rgba(18,253,0,0.5)) drop-shadow(0 0 80px rgba(18,253,0,0.2))' }}>
                        <Image src={product.img_url} alt={product.name} fill style={{ objectFit: 'contain' }} unoptimized />
                      </div>
                    </div>
                    {/* corner accents */}
                    <div style={{ position: 'absolute', top: 12, left: 12, width: 20, height: 20, borderTop: '2px solid rgba(18,253,0,0.4)', borderLeft: '2px solid rgba(18,253,0,0.4)', borderRadius: '3px 0 0 0' }} />
                    <div style={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderTop: '2px solid rgba(18,253,0,0.4)', borderRight: '2px solid rgba(18,253,0,0.4)', borderRadius: '0 3px 0 0' }} />
                    <div style={{ position: 'absolute', bottom: 12, left: 12, width: 20, height: 20, borderBottom: '2px solid rgba(18,253,0,0.4)', borderLeft: '2px solid rgba(18,253,0,0.4)', borderRadius: '0 0 0 3px' }} />
                    <div style={{ position: 'absolute', bottom: 12, right: 12, width: 20, height: 20, borderBottom: '2px solid rgba(18,253,0,0.4)', borderRight: '2px solid rgba(18,253,0,0.4)', borderRadius: '0 0 3px 0' }} />
                  </div>

                  {/* trust badges below image */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 16 }}>
                    {[
                      { icon: '🛡️', label: 'Original' },
                      { icon: '🚀', label: 'Pronta entrega' },
                      { icon: '✅', label: 'Autenticado' },
                    ].map(b => (
                      <div key={b.label} style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: 18, marginBottom: 4 }}>{b.icon}</div>
                        <div style={{ fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: '0.05em' }}>{b.label.toUpperCase()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* INFO COL */}
              <div className="product-info-col" style={{ flex: 1, minWidth: 0 }}>

                {/* brand + stock row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                  {product.brand && (
                    <span style={{ background: 'rgba(18,253,0,0.08)', border: '1px solid rgba(18,253,0,0.25)', color: '#12fd00', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 4, letterSpacing: '0.12em' }}>
                      {product.brand.toUpperCase()}
                    </span>
                  )}
                  {(() => {
                    const s = stockStatus(product)
                    return (
                      <span style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 4, letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, display: 'inline-block', boxShadow: `0 0 6px ${s.color}` }} />
                        {s.label.toUpperCase()}
                      </span>
                    )
                  })()}
                </div>

                {/* name */}
                <h1 className="product-name" style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 32px', color: '#fff' }}>
                  {product.name}
                </h1>

                {/* divider */}
                <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(18,253,0,0.3), transparent)', marginBottom: 28 }} />

                {/* PRICE */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#444', letterSpacing: '0.1em', marginBottom: 8 }}>PREÇO UNITÁRIO</div>
                  <div className="price-usd" style={{ fontSize: 54, fontWeight: 900, color: '#12fd00', textShadow: '0 0 40px rgba(18,253,0,0.5), 0 0 80px rgba(18,253,0,0.2)', letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                    {currency.code} {fmt(product.usd_price, currency.rate, currency.code)}
                  </div>
                  {currency.code !== 'USD' && (
                    <div style={{ fontSize: 14, color: '#444', marginTop: 6, fontWeight: 600 }}>
                      USD {product.usd_price.toFixed(2)}
                    </div>
                  )}
                  {currency.code === 'USD' && (
                    <div style={{ fontSize: 14, color: '#444', marginTop: 6, fontWeight: 600 }}>
                      ≈ R$ {fmt(product.usd_price, 5.20, 'BRL')}
                    </div>
                  )}
                </div>

                {/* QUANTITY */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#444', letterSpacing: '0.1em', marginBottom: 10 }}>QUANTIDADE</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: 'fit-content', border: '1px solid #222', borderRadius: 10, overflow: 'hidden' }}>
                    <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}
                      style={{ width: 44, height: 44, background: '#0e0e0e', border: 'none', color: '#666', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                      −
                    </button>
                    <div style={{ width: 56, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff', background: '#111', borderLeft: '1px solid #1a1a1a', borderRight: '1px solid #1a1a1a' }}>
                      {qty}
                    </div>
                    <button className="qty-btn" onClick={() => setQty(q => q + 1)}
                      style={{ width: 44, height: 44, background: '#0e0e0e', border: 'none', color: '#666', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                      disabled={product.estoque !== null && qty >= product.estoque}>
                      +
                    </button>
                  </div>
                  {qty > 1 && (
                    <div style={{ fontSize: 13, color: '#555', marginTop: 8 }}>
                      Total: <span style={{ color: '#12fd00', fontWeight: 700 }}>{currency.code} {fmt(product.usd_price * qty, currency.rate, currency.code)}</span>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {product.estoque === 0 ? (
                    <div style={{ padding: '16px 0', textAlign: 'center', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, color: '#ef4444', fontSize: 14, fontWeight: 700 }}>
                      Produto sem estoque no momento
                    </div>
                  ) : (
                    <button onClick={handleAdd}
                      style={{
                        width: '100%', padding: '18px 0', borderRadius: 12, border: 'none',
                        background: added ? 'rgba(18,253,0,0.15)' : '#12fd00',
                        color: added ? '#12fd00' : '#000',
                        fontSize: 15, fontWeight: 900, letterSpacing: '0.12em',
                        cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: added ? '0 0 0 1px rgba(18,253,0,0.4)' : '0 0 30px rgba(18,253,0,0.4), 0 0 80px rgba(18,253,0,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      }}
                      onMouseEnter={e => { if (!added) { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 50px rgba(18,253,0,0.6), 0 0 100px rgba(18,253,0,0.25)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)' } }}
                      onMouseLeave={e => { if (!added) { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 30px rgba(18,253,0,0.4), 0 0 80px rgba(18,253,0,0.15)'; (e.currentTarget as HTMLButtonElement).style.transform = 'none' } }}>
                      {added ? (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          ADICIONADO AO CARRINHO
                        </>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                          ADICIONAR AO CARRINHO
                        </>
                      )}
                    </button>
                  )}

                  {added && (
                    <button onClick={abrirSidebar}
                      style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: '1px solid rgba(18,253,0,0.3)', background: 'transparent', color: '#12fd00', fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(18,253,0,0.08)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
                      VER CARRINHO →
                    </button>
                  )}

                  <button onClick={() => router.push('/checkout')}
                    style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: '1px solid #1e1e1e', background: 'rgba(255,255,255,0.02)', color: '#555', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#fff'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#333' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#555'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#1e1e1e' }}>
                    COMPRAR AGORA →
                  </button>
                </div>

                {/* divider */}
                <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(18,253,0,0.15), transparent)', margin: '28px 0' }} />

                {/* info grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'PAGAMENTO', value: 'PIX à vista' },
                    { label: 'RETIRADA', value: 'Na loja — Paraguai' },
                    { label: 'ORIGEM', value: 'Importado direto' },
                    { label: 'DISPONIBILIDADE', value: product.estoque === null ? 'Imediata' : product.estoque > 0 ? 'Imediata' : 'Indisponível' },
                  ].map(item => (
                    <div key={item.label} style={{ background: '#0e0e0e', border: '1px solid #141414', borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ fontSize: 9, color: '#333', fontWeight: 800, letterSpacing: '0.1em', marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#888' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ═══ RELATED PRODUCTS ═══ */}
          {related.length > 0 && (
            <section style={{ borderTop: '1px solid #111', padding: '48px 24px 64px', background: '#060606' }}>
              <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                  <div style={{ width: 3, height: 24, background: '#12fd00', borderRadius: 99, boxShadow: '0 0 10px #12fd00' }} />
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, letterSpacing: '-0.01em' }}>
                    MAIS DA {product.brand?.toUpperCase()}
                  </h2>
                </div>
                <div className="related-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                  {related.map(p => (
                    <div key={p.id} className="rel-card"
                      onClick={() => { router.push(`/produtos/${p.id}`); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }}>
                      <div style={{ position: 'relative', height: 160, background: '#111', overflow: 'hidden' }}>
                        <Image src={p.img_url} alt={p.name} fill className="rel-img" style={{ objectFit: 'cover' }} unoptimized />
                      </div>
                      <div style={{ padding: '12px' }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#aaa', margin: '0 0 8px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                          {p.name}
                        </p>
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#12fd00' }}>
                          {currency.code} {fmt(p.usd_price, currency.rate, currency.code)}
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); adicionar({ id: p.id, name: p.name, usd: p.usd_price, img: p.img_url, brand: p.brand ?? undefined }) }}
                          style={{ marginTop: 10, width: '100%', padding: '8px 0', borderRadius: 6, background: 'rgba(18,253,0,0.08)', border: '1px solid rgba(18,253,0,0.2)', color: '#12fd00', fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', cursor: 'pointer', transition: 'all 0.15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#12fd00'; (e.currentTarget as HTMLButtonElement).style.color = '#000' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(18,253,0,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#12fd00' }}>
                          + ADICIONAR
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      ) : null}
    </div>
  )
}
