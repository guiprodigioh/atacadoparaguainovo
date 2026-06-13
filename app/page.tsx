'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const A = 'https://web.archive.org/web/20250311085710im_/https://atacadoparaguai.com/wp-content/uploads'

const currencies = [
  { code: 'USD', label: 'Dólar', flag: `${A}/2025/01/002-united-states-1.png`, rate: 1 },
  { code: 'BRL', label: 'Real', flag: `${A}/2025/01/001-brazil-1.png`, rate: 5.91 },
  { code: 'PYG', label: 'Guarani', flag: `${A}/2025/01/003-paraguai-1.png`, rate: 7680 },
]

const navCategories = ['VER TUDO', 'Saúde', 'PODS', 'Perfumes Árabes', 'Líquidos', 'Acessórios']

const slides = [
  { img: `${A}/2022/05/BannerIgnite.jpg`, tag: 'ATACADO E VAREJO', title: 'Conheça a linha Ignite', cta: 'VER MODELOS' },
  { img: `${A}/2024/12/oxbar1.jpg`, tag: 'ATACADO E VAREJO', title: 'Oxbar 30.000 Puffs', cta: 'COMPRAR' },
  { img: `${A}/2024/12/elfbar.jpg`, tag: 'ATACADO E VAREJO', title: 'Elfbar TE 30.000', cta: 'VER MODELOS' },
  { img: `${A}/2024/12/perfume-2.jpg`, tag: 'Perfumes', title: 'Descubra nossa linha de perfumes árabes', cta: 'VER PRODUTOS' },
]

const categories = [
  { name: 'Saúde', count: 60, img: `${A}/2025/01/Born-Nic-Salt-30ml-scaled.jpg`, hot: true },
  { name: 'Descartável', count: 45, img: `${A}/2024/12/descartavel.png`, hot: false },
  { name: 'Perfumes', count: 9, img: `${A}/2024/12/002-perfume.png`, hot: false },
  { name: 'Acessórios', count: 2, img: `${A}/2025/01/acessorios.png`, hot: false },
  { name: 'Líquidos', count: 1, img: `${A}/2025/01/Born-Nic-Salt-30ml-scaled.jpg`, hot: false },
]

type Product = { name: string; usd: number; img: string; variants: boolean; brand?: string }

const peptideos: Product[] = [
  { name: 'Retatrutide 40mg', usd: 60, img: `${A}/2025/01/Born-Nic-Salt-30ml-scaled.jpg`, variants: false, brand: 'Biogenesis' },
  { name: 'Wolverine Blend BPC157 + TB500 20mg', usd: 50, img: `${A}/2025/01/Born-Nic-Salt-30ml-scaled.jpg`, variants: false, brand: 'Biogenesis' },
  { name: 'Selank 10mg', usd: 50, img: `${A}/2025/01/Born-Nic-Salt-30ml-scaled.jpg`, variants: false, brand: 'Biogenesis' },
  { name: 'NAD+ 1000mg', usd: 60, img: `${A}/2025/01/Born-Nic-Salt-30ml-scaled.jpg`, variants: false, brand: 'Biogenesis' },
  { name: 'Tirzepatida 75mg — 01 Pen', usd: 150, img: `${A}/2025/01/Born-Nic-Salt-30ml-scaled.jpg`, variants: false, brand: 'ZPHC' },
  { name: 'Tirzepatida 150mg', usd: 210, img: `${A}/2025/01/Born-Nic-Salt-30ml-scaled.jpg`, variants: false, brand: 'ZPHC' },
  { name: 'Retatrutide 120mg — 02 Vials', usd: 270, img: `${A}/2025/01/Born-Nic-Salt-30ml-scaled.jpg`, variants: false, brand: 'ZPHC' },
  { name: 'Semaglutide 05mg', usd: 50, img: `${A}/2025/01/Born-Nic-Salt-30ml-scaled.jpg`, variants: false, brand: 'ZPHC' },
  { name: 'Somatropin GH 02ml (50 UI) — 05 Vials', usd: 85, img: `${A}/2025/01/Born-Nic-Salt-30ml-scaled.jpg`, variants: false, brand: 'Muscle' },
  { name: 'Primobolan 100mg 10ml', usd: 32, img: `${A}/2025/01/Born-Nic-Salt-30ml-scaled.jpg`, variants: false, brand: 'Muscle' },
  { name: 'Tirzepatide T.G 15mg / 0,5ml', usd: 84, img: `${A}/2025/01/Born-Nic-Salt-30ml-scaled.jpg`, variants: true, brand: 'Indufar' },
  { name: 'Healthcare BPC157 & TB500 40mg — Pen', usd: 95, img: `${A}/2025/01/Born-Nic-Salt-30ml-scaled.jpg`, variants: false, brand: 'Alluvi' },
  { name: 'GHK-Cu 100mg — Pen', usd: 90, img: `${A}/2025/01/Born-Nic-Salt-30ml-scaled.jpg`, variants: false, brand: 'Oxygen' },
  { name: 'Retatrutide 40mg — Pen', usd: 80, img: `${A}/2025/01/Born-Nic-Salt-30ml-scaled.jpg`, variants: false, brand: 'Thera Genetics' },
  { name: 'Tirzepatida 15mg — 04 Vials', usd: 73, img: `${A}/2025/01/Born-Nic-Salt-30ml-scaled.jpg`, variants: false, brand: 'Lipoless' },
  { name: 'Mounjaro Kwikpen 10mg', usd: 300, img: `${A}/2025/01/Born-Nic-Salt-30ml-scaled.jpg`, variants: false, brand: 'Mounjaro' },
  { name: 'Água Bacteriostática 03ml — Pack 10 Vials', usd: 20, img: `${A}/2025/01/Born-Nic-Salt-30ml-scaled.jpg`, variants: false, brand: 'Água Bact.' },
  { name: 'Decabolic (Nandrolone Decanoate) 250mg', usd: 35, img: `${A}/2025/01/Born-Nic-Salt-30ml-scaled.jpg`, variants: false, brand: 'Cooper Pharma' },
]

const brands = ['Todos', 'Biogenesis', 'ZPHC', 'Muscle', 'Indufar', 'Alluvi', 'Oxygen', 'Thera Genetics', 'Lipoless', 'Mounjaro', 'Cooper Pharma']

const products = [
  { name: 'Cartucho Elfbar EW9000', usd: 6.00, img: `${A}/2024/12/elfbar.jpg`, variants: true },
  { name: 'Cartucho Life Pod ECO II 10.000 Puffs', usd: 6.50, img: `${A}/2024/12/descartavel.png`, variants: true },
  { name: 'Kit Life Pod ECO II', usd: 9.00, img: `${A}/2024/12/descartavel.png`, variants: true },
  { name: 'Nic Salt Born To Vape 30ml (35mg)', usd: 6.00, img: `${A}/2025/01/Born-Nic-Salt-30ml-scaled.jpg`, variants: false },
  { name: 'Nic Salt Born To Vape 30ml (50mg)', usd: 6.00, img: `${A}/2025/01/Born-Nic-Salt-30ml-scaled.jpg`, variants: false },
  { name: 'Pod Elfbar EW9000 Kit Bateria + Cartucho', usd: 9.00, img: `${A}/2024/12/elfbar.jpg`, variants: true },
]

const fmt = (n: number, rate: number, code: string) => {
  const v = n * rate
  if (code === 'PYG') return v.toLocaleString('es-PY', { maximumFractionDigits: 0 })
  return v.toFixed(2).replace('.', ',')
}

export default function Home() {
  const [current, setCurrent] = useState(0)
  const [currency, setCurrency] = useState(currencies[0])
  const [activeBrand, setActiveBrand] = useState('Todos')

  useEffect(() => {
    const t = setInterval(() => setCurrent(p => (p + 1) % slides.length), 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white font-sans">

      {/* Top bar */}
      <div className="bg-[#111] py-1.5 px-4 text-xs flex justify-between items-center border-b border-[#2a2a2a]">
        <span className="text-gray-500">USD/BRL = 5.91 &nbsp;|&nbsp; USD/PYG = 7.680</span>
        <div className="flex items-center gap-3">
          {currencies.map(c => (
            <button
              key={c.code}
              onClick={() => setCurrency(c)}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-all ${currency.code === c.code ? 'bg-[#12fd00]/20 text-[#12fd00]' : 'text-gray-400 hover:text-white'}`}
            >
              <div className="relative w-5 h-3.5 overflow-hidden rounded-sm">
                <Image src={c.flag} alt={c.label} fill className="object-cover" unoptimized />
              </div>
              <span>{c.code}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="bg-[#212121] sticky top-0 z-50 border-b border-[#2e2e2e]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Image src={`${A}/2024/11/atacado-paraguai-logo.png`} alt="Atacado Paraguai" width={150} height={59} className="object-contain" unoptimized />

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <a href="#" className="px-3 py-1.5 hover:text-[#12fd00] transition-colors">Home</a>
            <span className="text-[#333]">|</span>
            {navCategories.map((cat, i) => (
              <a key={cat} href="#"
                className={`px-3 py-1.5 transition-colors hover:text-[#12fd00] ${i === 0 ? 'text-[#12fd00] font-semibold' : ''}`}>
                {cat}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4 text-gray-300">
            <button className="hover:text-[#12fd00] transition-colors text-lg">🔍</button>
            <button className="hover:text-[#12fd00] transition-colors text-lg">♡</button>
            <button className="hover:text-[#12fd00] transition-colors flex items-center gap-1.5 text-sm">
              🛒 <span>{currency.code} 0,00</span>
            </button>
            <a href="#" className="hidden md:block text-xs border border-[#444] px-3 py-1.5 rounded hover:border-[#12fd00] hover:text-[#12fd00] transition-colors">
              Entrar
            </a>
          </div>
        </div>
      </header>

      {/* Hero Carousel */}
      <section className="relative h-[420px] md:h-[560px] overflow-hidden">
        {slides.map((s, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <Image src={s.img} alt={s.title} fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-10 md:px-24">
              <span className="text-[#12fd00] text-xs font-bold tracking-[0.2em] uppercase mb-3">{s.tag}</span>
              <h1 className="text-3xl md:text-5xl font-extrabold max-w-md mb-7 leading-tight drop-shadow">{s.title}</h1>
              <a href="#" className="inline-flex items-center bg-[#12fd00] text-black font-bold px-7 py-3 rounded text-sm w-fit hover:bg-white transition-colors uppercase tracking-wide">
                {s.cta}
              </a>
            </div>
          </div>
        ))}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-[#12fd00] w-6' : 'bg-white/30 w-2'}`} />
          ))}
        </div>
        <button onClick={() => setCurrent(p => (p - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors">
          ‹
        </button>
        <button onClick={() => setCurrent(p => (p + 1) % slides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors">
          ›
        </button>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold mb-8 text-center">Categorias</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(cat => (
            <a key={cat.name} href="#"
              className="bg-[#242424] border border-[#333] rounded-xl p-6 flex flex-col items-center gap-4 hover:border-[#12fd00] transition-colors group">
              <div className="w-24 h-24 relative">
                <Image src={cat.img} alt={cat.name} fill className="object-contain drop-shadow-lg" unoptimized />
              </div>
              <div className="text-center">
                <div className="font-semibold group-hover:text-[#12fd00] transition-colors">{cat.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{cat.count} produtos</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Em Destaque</h2>
          <a href="#" className="text-sm text-[#12fd00] hover:underline">Ver todos →</a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {products.map((p, i) => (
            <div key={i} className="bg-[#242424] border border-[#333] rounded-xl overflow-hidden hover:border-[#12fd00] transition-colors group">
              <div className="relative h-52 bg-[#1e1e1e]">
                <Image src={p.img} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                <button className="absolute top-3 right-3 text-gray-400 hover:text-[#12fd00] bg-black/50 rounded-full w-8 h-8 flex items-center justify-center">♡</button>
                <span className="absolute top-3 left-3 bg-[#12fd00] text-black text-[10px] font-bold px-2 py-0.5 rounded">Em estoque</span>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium mb-3 line-clamp-2 leading-snug">{p.name}</h3>
                <div className="mb-4">
                  <div className="text-[#12fd00] font-bold text-lg">{currency.code} {fmt(p.usd, currency.rate, currency.code)}</div>
                  <div className="text-xs text-gray-500">USD {p.usd.toFixed(2).replace('.', ',')}</div>
                </div>
                {p.variants && <p className="text-[10px] text-gray-600 mb-3">Possui variantes — escolha na página do produto</p>}
                <button className="w-full bg-[#0b7f02] hover:bg-[#12fd00] hover:text-black text-white text-xs font-bold py-2.5 rounded transition-colors uppercase tracking-wide">
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Saúde */}
      <section id="peptideos" className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-bold">Saúde</h2>
          <span className="bg-[#12fd00] text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Atacado</span>
        </div>
        <p className="text-sm text-gray-500 mb-6">Stock limitado · Consultar disponibilidade · Venda em atacado</p>

        {/* Brand filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {brands.map(b => (
            <button key={b} onClick={() => setActiveBrand(b)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${activeBrand === b ? 'bg-[#12fd00] text-black border-[#12fd00]' : 'border-[#333] text-gray-400 hover:border-[#12fd00] hover:text-white'}`}>
              {b}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {peptideos.filter(p => activeBrand === 'Todos' || p.brand === activeBrand).map((p, i) => (
            <div key={i} className="bg-[#242424] border border-[#333] rounded-xl overflow-hidden hover:border-[#12fd00] transition-colors group">
              <div className="relative h-40 bg-[#1a1a1a] flex items-center justify-center">
                <div className="text-5xl">💉</div>
                {p.brand && (
                  <span className="absolute top-2 left-2 bg-[#2a2a2a] border border-[#444] text-[10px] text-gray-400 px-2 py-0.5 rounded">{p.brand}</span>
                )}
                <button className="absolute top-2 right-2 text-gray-500 hover:text-[#12fd00] bg-black/50 rounded-full w-7 h-7 flex items-center justify-center text-sm">♡</button>
              </div>
              <div className="p-3">
                <h3 className="text-xs font-medium mb-3 line-clamp-2 leading-snug">{p.name}</h3>
                <div className="mb-3">
                  <div className="text-[#12fd00] font-bold">{currency.code} {fmt(p.usd, currency.rate, currency.code)}</div>
                  <div className="text-[10px] text-gray-500">USD {p.usd.toFixed(2).replace('.', ',')}</div>
                </div>
                <button className="w-full bg-[#0b7f02] hover:bg-[#12fd00] hover:text-black text-white text-[10px] font-bold py-2 rounded transition-colors uppercase tracking-wide">
                  Consultar / Comprar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WhatsApp */}
      <a href="https://wa.me/595" target="_blank" rel="noopener"
        className="fixed bottom-6 right-6 bg-[#25d366] rounded-full p-3.5 shadow-2xl hover:scale-110 transition-transform z-50">
        <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>

      {/* Footer */}
      <footer className="bg-[#111] border-t border-[#222] py-12 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
          <div>
            <Image src={`${A}/2024/11/atacado-paraguai-logo.png`} alt="Atacado Paraguai" width={140} height={55} className="object-contain mb-4" unoptimized />
            <p className="text-sm text-gray-500 leading-relaxed">Atacado e varejo. Compre e retire na loja em Paraguai.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#12fd00] text-sm tracking-wide uppercase">Loja</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              {['PODS', 'Perfumes Árabes', 'Líquidos', 'Acessórios', 'VER TUDO'].map(i => (
                <li key={i}><a href="#" className="hover:text-white transition-colors">{i}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#12fd00] text-sm tracking-wide uppercase">Contato</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>📍 Paraguai</li>
              <li>💬 <a href="https://wa.me/595" className="hover:text-white transition-colors">WhatsApp</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-[#222] text-center text-xs text-gray-700">
          © 2025 Atacado PY. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
