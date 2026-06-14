'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCarrinho } from './CarrinhoContext'

const fmtCurrency = (usd: number, rate: number, code: string) => {
  const v = usd * rate
  if (code === 'PYG') return `${code} ${v.toLocaleString('es-PY', { maximumFractionDigits: 0 })}`
  return `${code} ${v.toFixed(2).replace('.', ',')}`
}

export function CarrinhoSidebar() {
  const router = useRouter()
  const { itens, currency, sidebarAberto, fecharSidebar, remover, atualizar, totalUsd, quantidade } = useCarrinho()

  return (
    <>
      {sidebarAberto && (
        <div
          onClick={fecharSidebar}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 999, backdropFilter: 'blur(3px)' }}
        />
      )}

      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100dvh', width: 400, maxWidth: '100vw',
        background: '#161616', borderLeft: '1px solid #2a2a2a',
        zIndex: 1000, display: 'flex', flexDirection: 'column',
        transform: sidebarAberto ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: sidebarAberto ? '-12px 0 48px rgba(0,0,0,0.7)' : 'none',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #2a2a2a', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12fd00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>Carrinho</span>
            {quantidade > 0 && (
              <span style={{ background: '#12fd00', color: '#000', borderRadius: 99, fontSize: 11, fontWeight: 800, padding: '2px 8px' }}>
                {quantidade}
              </span>
            )}
          </div>
          <button
            onClick={fecharSidebar}
            style={{ width: 32, height: 32, borderRadius: '50%', background: '#2a2a2a', border: '1px solid #333', color: '#999', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ×
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {itens.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '72px 0' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px', display: 'block' }}>
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <p style={{ color: '#555', fontSize: 14, fontWeight: 600 }}>Carrinho vazio</p>
            </div>
          ) : (
            itens.map(item => (
              <div key={item.id} style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 12, padding: '12px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>

                <div style={{ width: 54, height: 54, background: '#111', borderRadius: 8, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                  <Image src={item.img} alt={item.name} fill style={{ objectFit: 'cover' }} unoptimized />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {item.brand && (
                    <p style={{ fontSize: 10, color: '#666', fontWeight: 600, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.brand}</p>
                  )}
                  <p style={{ fontWeight: 600, fontSize: 12, color: '#fff', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </p>
                  <p style={{ fontSize: 12, color: '#12fd00', fontWeight: 700, marginBottom: 10 }}>
                    {fmtCurrency(item.usd, currency.rate, currency.code)}/un.
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#111', border: '1px solid #333', borderRadius: 8, overflow: 'hidden' }}>
                      <button onClick={() => atualizar(item.id, item.quantity - 1)}
                        style={{ width: 30, height: 30, background: 'none', border: 'none', color: '#999', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ width: 34, textAlign: 'center', fontWeight: 700, fontSize: 13, color: '#fff' }}>{item.quantity}</span>
                      <button onClick={() => atualizar(item.id, item.quantity + 1)}
                        style={{ width: 30, height: 30, background: 'none', border: 'none', color: '#999', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: 13, color: '#fff' }}>
                        {fmtCurrency(item.usd * item.quantity, currency.rate, currency.code)}
                      </span>
                      <button onClick={() => remover(item.id)}
                        style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {itens.length > 0 && (
          <div style={{ padding: '16px 18px', borderTop: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 14, color: '#999' }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: 22, color: '#12fd00' }}>
                {fmtCurrency(totalUsd, currency.rate, currency.code)}
              </span>
            </div>

            <button onClick={() => { fecharSidebar(); router.push('/checkout') }}
              style={{ width: '100%', height: 50, background: '#12fd00', color: '#000', borderRadius: 12, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(18,253,0,0.25)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              Finalizar Pedido
            </button>

            <button onClick={fecharSidebar}
              style={{ width: '100%', height: 40, background: 'transparent', color: '#666', borderRadius: 12, fontWeight: 500, fontSize: 13, border: '1px solid #2a2a2a', cursor: 'pointer' }}>
              Continuar comprando
            </button>
          </div>
        )}
      </div>
    </>
  )
}
