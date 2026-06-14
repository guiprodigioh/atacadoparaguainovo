'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Currency = { code: string; label: string; flag: string; rate: number }
export const currencies: Currency[] = [
  { code: 'USD', label: 'Dólar', flag: 'https://flagcdn.com/w40/us.png', rate: 1 },
  { code: 'BRL', label: 'Real', flag: 'https://flagcdn.com/w40/br.png', rate: 5.20 },
  { code: 'PYG', label: 'Guarani', flag: 'https://flagcdn.com/w40/py.png', rate: 7680 },
]

export type CartItem = {
  id: string
  name: string
  usd: number
  img: string
  brand?: string
  quantity: number
}

type CarrinhoCtx = {
  itens: CartItem[]
  currency: Currency
  setCurrency: (c: Currency) => void
  sidebarAberto: boolean
  abrirSidebar: () => void
  fecharSidebar: () => void
  adicionar: (item: Omit<CartItem, 'quantity'>) => void
  remover: (id: string) => void
  atualizar: (id: string, qty: number) => void
  limpar: () => void
  totalUsd: number
  quantidade: number
}

const Ctx = createContext<CarrinhoCtx | null>(null)

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<CartItem[]>([])
  const [currency, setCurrency] = useState<Currency>(currencies[0])
  const [sidebarAberto, setSidebarAberto] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('apnovo_cart')
      if (saved) setItens(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('apnovo_cart', JSON.stringify(itens))
  }, [itens])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(t)
  }, [toast])

  const adicionar = (item: Omit<CartItem, 'quantity'>) => {
    setItens(prev => {
      const exists = prev.find(i => i.id === item.id)
      if (exists) {
        setToast('Quantidade atualizada')
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      setToast('Produto adicionado ao carrinho')
      return [...prev, { ...item, quantity: 1 }]
    })
    setSidebarAberto(true)
  }

  const remover = (id: string) => setItens(prev => prev.filter(i => i.id !== id))

  const atualizar = (id: string, qty: number) => {
    if (qty <= 0) return remover(id)
    setItens(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i))
  }

  const limpar = () => setItens([])
  const totalUsd = itens.reduce((acc, i) => acc + i.usd * i.quantity, 0)
  const quantidade = itens.reduce((acc, i) => acc + i.quantity, 0)

  return (
    <Ctx.Provider value={{ itens, currency, setCurrency, sidebarAberto, abrirSidebar: () => setSidebarAberto(true), fecharSidebar: () => setSidebarAberto(false), adicionar, remover, atualizar, limpar, totalUsd, quantidade }}>
      {children}
      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: '#12fd00', color: '#000', borderRadius: 99, padding: '10px 22px', fontSize: 13, fontWeight: 700, zIndex: 99999, pointerEvents: 'none', whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(18,253,0,0.3)' }}>
          {toast}
        </div>
      )}
    </Ctx.Provider>
  )
}

export function useCarrinho() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCarrinho fora do CarrinhoProvider')
  return ctx
}
