'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCarrinho, currencies } from '@/components/CarrinhoContext'
import { getSupabaseClient } from '@/lib/supabase-client'

const navLinks = [
  { label: 'HOME', href: '#' },
  { label: 'SAÚDE', href: '#saude' },
  { label: 'ATACADO', href: '#saude' },
  { label: 'CONTATO', href: 'https://wa.me/595984522822' },
]

type Product = { id: string; name: string; brand: string | null; usd_price: number; img_url: string; estoque: number | null }

const banners = [
  {
    tag: 'TECNOLOGIA BIOLÓGICA DE PONTA',
    title: ['PEPTÍDEOS DE', 'ALTA PERFORMANCE'],
    sub: 'Pureza farmacêutica. Importado direto. Resultados reais.',
    cta: 'VER CATÁLOGO',
    href: '#saude',
    color: '#12fd00',
    bg: 'radial-gradient(ellipse 90% 70% at 35% 50%, #002200 0%, #000d00 60%, #000 100%)',
    productImg: 'https://assets.olaclick.app/companies/products/images/800/78a15da1-ca0f-4fea-8e07-48419b95482c.jpeg',
    productLabel: 'BIOGENESIS RETATRUTIDE 40MG',
    productPrice: 'USD 60',
    rays: [
      { rotate: -35, opacity: 0.7, delay: '0s' },
      { rotate: -20, opacity: 0.35, delay: '0.3s' },
      { rotate: -50, opacity: 0.45, delay: '0.6s' },
      { rotate: 10, opacity: 0.25, delay: '1s' },
    ],
  },
  {
    tag: '54 PRODUTOS DISPONÍVEIS',
    title: ['BIOGENESIS · ZPHC', 'THERA · TNL'],
    sub: 'As maiores marcas do mercado em estoque. Atacado e varejo.',
    cta: 'EXPLORAR MARCAS',
    href: '#saude',
    color: '#00e5ff',
    bg: 'radial-gradient(ellipse 90% 70% at 35% 50%, #001a22 0%, #000810 60%, #000 100%)',
    productImg: 'https://assets.olaclick.app/companies/products/images/800/43a04611-249c-4db5-9d1b-beafa314b533.png',
    productLabel: 'ZPHC RETATRUTIDE 60MG PEN',
    productPrice: 'USD 200',
    rays: [
      { rotate: 40, opacity: 0.6, delay: '0s' },
      { rotate: 60, opacity: 0.3, delay: '0.4s' },
      { rotate: 25, opacity: 0.4, delay: '0.8s' },
      { rotate: -10, opacity: 0.25, delay: '1.2s' },
    ],
  },
  {
    tag: 'ATACADO PARAGUAI OFICIAL',
    title: ['COMPRE DIRETO', 'DA FONTE'],
    sub: 'Melhores preços em USD · Entrega para todo o Brasil',
    cta: 'FAZER PEDIDO',
    href: '#saude',
    color: '#ff2cf7',
    bg: 'radial-gradient(ellipse 90% 70% at 35% 50%, #220018 0%, #0d0008 60%, #000 100%)',
    productImg: 'https://assets.olaclick.app/companies/products/images/800/70658994-2642-457d-8e2f-8a9b8e88d868.jpeg',
    productLabel: 'THERA GLOW 70MG PEN',
    productPrice: 'USD 95',
    rays: [
      { rotate: 15, opacity: 0.65, delay: '0s' },
      { rotate: -5, opacity: 0.35, delay: '0.5s' },
      { rotate: 30, opacity: 0.45, delay: '1s' },
      { rotate: -25, opacity: 0.25, delay: '0.2s' },
    ],
  },
]

const fmt = (n: number, rate: number, code: string) => {
  const v = n * rate
  if (code === 'PYG') return v.toLocaleString('es-PY', { maximumFractionDigits: 0 })
  return v.toFixed(2).replace('.', ',')
}

export default function Home() {
  const router = useRouter()
  const [slide, setSlide] = useState(0)
  const [activeBrand, setActiveBrand] = useState('Todos')
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const { currency, setCurrency, adicionar, abrirSidebar, quantidade } = useCarrinho()

  useEffect(() => {
    getSupabaseClient().auth.getUser().then(({ data: { user } }) => {
      if (user) setUserName(user.user_metadata?.nome || user.email?.split('@')[0] || 'Conta')
    })
  }, [])

  useEffect(() => {
    fetch('/api/produtos').then(r => r.json()).then((data: Product[]) => {
      setProducts(data)
      setLoadingProducts(false)
    })
  }, [])

  useEffect(() => {
    const t = setInterval(() => setSlide(p => (p + 1) % banners.length), 5500)
    return () => clearInterval(t)
  }, [])

  const b = banners[slide]
  const brands = ['Todos', ...Array.from(new Set(products.map(p => p.brand).filter((x): x is string => Boolean(x))))]
  const filtered = products.filter(p => activeBrand === 'Todos' || p.brand === activeBrand)

  return (
    <div className="min-h-screen text-white font-sans" style={{ background: '#080808' }}>
      <style>{`
        @keyframes laserPulse {
          0%, 100% { opacity: var(--op); transform: scaleX(1); }
          50% { opacity: calc(var(--op) * 0.4); transform: scaleX(0.85); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes neonFlicker {
          0%, 95%, 100% { opacity: 1; }
          96% { opacity: 0.7; }
          98% { opacity: 0.9; }
        }
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes borderRun {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }
        @keyframes productFloat {
          0%, 100% { transform: translateY(0px) scale(1) rotate(-1deg); }
          33% { transform: translateY(-14px) scale(1.02) rotate(0.5deg); }
          66% { transform: translateY(-6px) scale(1.01) rotate(-0.5deg); }
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .nav-link { position: relative; }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px; left: 50%; right: 50%;
          height: 1px;
          background: #12fd00;
          box-shadow: 0 0 8px #12fd00;
          transition: left 0.25s, right 0.25s;
        }
        .nav-link:hover::after { left: 0; right: 0; }
        .product-card:hover .card-img { transform: scale(1.08); }
        .product-card:hover { border-color: rgba(18,253,0,0.35) !important; box-shadow: 0 0 24px rgba(18,253,0,0.08) !important; }
        .skeleton { background: linear-gradient(90deg, #0e0e0e 25%, #141414 50%, #0e0e0e 75%); background-size: 400px 100%; animation: shimmer 1.4s ease-in-out infinite; }
      `}</style>

      {/* ══════════ NAVBAR FUTURISTA ══════════ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(6,6,6,0.92)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(18,253,0,0.2)',
        boxShadow: '0 0 40px rgba(18,253,0,0.06), 0 1px 0 rgba(18,253,0,0.15)',
      }}>
        <div style={{
          height: 2,
          background: 'linear-gradient(90deg, transparent 0%, #12fd00 20%, #00e5ff 50%, #ff2cf7 80%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'borderRun 3s linear infinite',
        }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, height: 60 }}>

          <Image src="/logo.png" alt="Atacado Paraguai" width={110} height={43} style={{ objectFit: 'contain' }} />

          <nav style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {navLinks.map((l, i) => (
              <a key={l.label} href={l.href}
                className="nav-link"
                style={{
                  padding: '0 18px',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  color: i === 0 ? '#12fd00' : '#aaa',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  textShadow: i === 0 ? '0 0 12px #12fd00' : 'none',
                  borderRight: i < navLinks.length - 1 ? '1px solid #1a1a1a' : 'none',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#12fd00'; (e.currentTarget as HTMLAnchorElement).style.textShadow = '0 0 10px #12fd00' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = i === 0 ? '#12fd00' : '#aaa'; (e.currentTarget as HTMLAnchorElement).style.textShadow = i === 0 ? '0 0 12px #12fd00' : 'none' }}>
                {l.label}
              </a>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 10, color: '#444', letterSpacing: '0.05em', fontWeight: 600 }}>USD/BRL = 5,20</span>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setCurrencyOpen(p => !p)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 10px', borderRadius: 6,
                  background: 'rgba(18,253,0,0.06)',
                  border: '1px solid rgba(18,253,0,0.25)',
                  color: '#12fd00', fontSize: 11, fontWeight: 700,
                  cursor: 'pointer', letterSpacing: '0.05em',
                  boxShadow: '0 0 8px rgba(18,253,0,0.1)',
                  transition: 'all 0.2s',
                }}>
                <div style={{ position: 'relative', width: 20, height: 14, overflow: 'hidden', borderRadius: 2 }}>
                  <Image src={currency.flag} alt={currency.label} fill style={{ objectFit: 'cover' }} unoptimized />
                </div>
                {currency.code}
                <svg style={{ width: 10, height: 10, transform: currencyOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {currencyOpen && (
                <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, background: '#0e0e0e', border: '1px solid rgba(18,253,0,0.2)', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.8), 0 0 20px rgba(18,253,0,0.08)', zIndex: 999, minWidth: 130, overflow: 'hidden' }}>
                  {currencies.map(c => (
                    <button key={c.code} onClick={() => { setCurrency(c); setCurrencyOpen(false) }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', background: currency.code === c.code ? 'rgba(18,253,0,0.08)' : 'transparent', border: 'none', color: currency.code === c.code ? '#12fd00' : '#888', fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(18,253,0,0.05)')}
                      onMouseLeave={e => (e.currentTarget.style.background = currency.code === c.code ? 'rgba(18,253,0,0.08)' : 'transparent')}>
                      <div style={{ position: 'relative', width: 20, height: 14, overflow: 'hidden', borderRadius: 2, flexShrink: 0 }}>
                        <Image src={c.flag} alt={c.label} fill style={{ objectFit: 'cover' }} unoptimized />
                      </div>
                      {c.code} — {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <a href={userName ? '/conta/minha-conta' : '/conta/login'}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid #222', borderRadius: 8, padding: '7px 12px', color: '#888', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '#333' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#888'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '#222' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {userName ? userName.split(' ')[0].toUpperCase() : 'CONTA'}
            </a>

            <button onClick={abrirSidebar} style={{ position: 'relative', background: 'rgba(18,253,0,0.08)', border: '1px solid rgba(18,253,0,0.2)', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#12fd00', fontSize: 12, fontWeight: 700, boxShadow: '0 0 12px rgba(18,253,0,0.08)', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(18,253,0,0.25)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(18,253,0,0.5)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(18,253,0,0.08)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(18,253,0,0.2)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              CARRINHO
              {quantidade > 0 && (
                <span style={{ background: '#12fd00', color: '#000', borderRadius: 99, fontSize: 10, fontWeight: 900, padding: '0 6px', minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 8px #12fd00' }}>
                  {quantidade}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ══════════ HERO NEON BANNERS ══════════ */}
      <section style={{ position: 'relative', height: 520, overflow: 'hidden' }}>
        {banners.map((bn, idx) => (
          <div key={idx} style={{
            position: 'absolute', inset: 0,
            opacity: idx === slide ? 1 : 0,
            pointerEvents: idx === slide ? 'auto' : 'none',
            transition: 'opacity 0.8s ease',
            background: bn.bg,
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `linear-gradient(${bn.color}08 1px, transparent 1px), linear-gradient(90deg, ${bn.color}08 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
              animation: 'gridMove 8s linear infinite',
            }} />

            {bn.rays.map((r, ri) => (
              <div key={ri} style={{
                position: 'absolute',
                top: 0, left: '-20%', right: '-20%', height: '100%',
                background: `linear-gradient(${r.rotate}deg, transparent 40%, ${bn.color} 50%, transparent 60%)`,
                ['--op' as string]: r.opacity,
                opacity: r.opacity,
                animation: `laserPulse ${2.5 + ri * 0.7}s ease-in-out infinite`,
                animationDelay: r.delay,
                mixBlendMode: 'screen',
                filter: `blur(${2 + ri}px)`,
              }} />
            ))}

            <div style={{
              position: 'absolute', left: 0, right: 0, height: 2,
              background: `linear-gradient(90deg, transparent, ${bn.color}40, transparent)`,
              animation: 'scanline 4s linear infinite',
              animationDelay: '1s',
            }} />

            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
              background: `linear-gradient(to top, ${bn.color}18, transparent)`,
            }} />

            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center',
              padding: '0 56px 0 72px',
              gap: 24,
            }}>
              <div style={{
                flex: '0 0 52%',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                animation: idx === slide ? 'slideIn 0.6s ease' : 'none',
              }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 14,
                  background: `${bn.color}15`, border: `1px solid ${bn.color}40`,
                  borderRadius: 4, padding: '4px 12px', width: 'fit-content',
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: bn.color, boxShadow: `0 0 8px ${bn.color}`, animation: 'neonFlicker 3s ease infinite' }} />
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color: bn.color }}>{bn.tag}</span>
                </div>

                <h1 style={{ margin: 0, marginBottom: 14, lineHeight: 1.05 }}>
                  {bn.title.map((line, li) => (
                    <div key={li} style={{
                      fontSize: 'clamp(26px, 3.4vw, 50px)', fontWeight: 900,
                      letterSpacing: '-0.02em',
                      color: li === 0 ? '#fff' : bn.color,
                      textShadow: li === 1 ? `0 0 30px ${bn.color}, 0 0 60px ${bn.color}40` : '0 2px 20px rgba(0,0,0,0.8)',
                      animation: 'neonFlicker 6s ease infinite',
                      animationDelay: `${li * 0.5}s`,
                    }}>{line}</div>
                  ))}
                </h1>

                <p style={{ color: '#888', fontSize: 13, fontWeight: 500, marginBottom: 24, letterSpacing: '0.03em' }}>{bn.sub}</p>

                <a href={bn.href}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    background: bn.color, color: '#000',
                    fontWeight: 900, fontSize: 12, letterSpacing: '0.12em',
                    padding: '12px 28px', borderRadius: 6, width: 'fit-content',
                    textDecoration: 'none',
                    boxShadow: `0 0 20px ${bn.color}60, 0 0 60px ${bn.color}20`,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 0 40px ${bn.color}80, 0 0 80px ${bn.color}30` }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'none'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 0 20px ${bn.color}60, 0 0 60px ${bn.color}20` }}>
                  {bn.cta}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              </div>

              <div style={{
                flex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
                animation: idx === slide ? 'slideIn 0.8s ease' : 'none',
              }}>
                <div style={{
                  filter: `drop-shadow(0 0 35px ${bn.color}90) drop-shadow(0 0 70px ${bn.color}50)`,
                  animation: 'productFloat 4s ease-in-out infinite',
                }}>
                  <div style={{
                    position: 'relative', width: 230, height: 230,
                    WebkitMaskImage: 'radial-gradient(ellipse 72% 78% at center, black 20%, transparent 100%)',
                    maskImage: 'radial-gradient(ellipse 72% 78% at center, black 20%, transparent 100%)',
                  }}>
                    <Image src={bn.productImg} alt={bn.productLabel} fill style={{ objectFit: 'contain' }} unoptimized />
                  </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: 10 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: bn.color, letterSpacing: '0.12em', textTransform: 'uppercase', animation: 'neonFlicker 4s ease infinite' }}>
                    {bn.productLabel}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 10 }}>
          {banners.map((bn, i) => (
            <button key={i} onClick={() => setSlide(i)}
              style={{ height: 4, borderRadius: 99, border: 'none', cursor: 'pointer', transition: 'all 0.3s', background: i === slide ? bn.color : '#333', width: i === slide ? 28 : 8, boxShadow: i === slide ? `0 0 8px ${bn.color}` : 'none' }} />
          ))}
        </div>

        <button onClick={() => setSlide(p => (p - 1 + banners.length) % banners.length)}
          style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '1px solid #333', color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>‹</button>
        <button onClick={() => setSlide(p => (p + 1) % banners.length)}
          style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '1px solid #333', color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>›</button>
      </section>

      {/* ══════════ PRODUTOS SAÚDE ══════════ */}
      <section id="saude" style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 24px 80px' }}>

        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 3, height: 28, background: '#12fd00', borderRadius: 99, boxShadow: '0 0 10px #12fd00' }} />
            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em' }}>SAÚDE</h2>
            <span style={{ background: 'rgba(18,253,0,0.12)', border: '1px solid rgba(18,253,0,0.3)', color: '#12fd00', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 4, letterSpacing: '0.1em' }}>
              {loadingProducts ? '...' : `${products.length} PRODUTOS`}
            </span>
          </div>
          <p style={{ color: '#555', fontSize: 13, margin: 0 }}>Peptídeos importados · Estoque limitado · Preços em USD</p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
          {brands.map(br => (
            <button key={br} onClick={() => setActiveBrand(br)}
              style={{
                padding: '6px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
                borderRadius: 4, border: `1px solid ${activeBrand === br ? '#12fd00' : '#222'}`,
                background: activeBrand === br ? 'rgba(18,253,0,0.12)' : 'transparent',
                color: activeBrand === br ? '#12fd00' : '#555',
                cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: activeBrand === br ? '0 0 12px rgba(18,253,0,0.15)' : 'none',
              }}>
              {br}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {loadingProducts ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ borderRadius: 12, height: 280 }} />
            ))
          ) : filtered.map(p => (
            <div key={p.id} className="product-card"
              style={{
                background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 12,
                overflow: 'hidden', transition: 'all 0.25s', cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                opacity: p.estoque === 0 ? 0.6 : 1,
              }}>

              {/* Imagem — clique vai para página do produto */}
              <div
                onClick={() => router.push(`/produtos/${p.id}`)}
                style={{ position: 'relative', height: 160, background: '#111', overflow: 'hidden' }}>
                <Image src={p.img_url} alt={p.name} fill className="card-img" style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }} unoptimized />
                {p.brand && (
                  <span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', border: '1px solid #2a2a2a', color: '#777', fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 3, letterSpacing: '0.05em' }}>
                    {p.brand.toUpperCase()}
                  </span>
                )}
                {p.estoque !== null && p.estoque <= 5 && p.estoque > 0 && (
                  <span style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(245,158,11,0.9)', color: '#000', fontSize: 9, fontWeight: 800, padding: '3px 7px', borderRadius: 3 }}>
                    ÚLT. {p.estoque}
                  </span>
                )}
                {p.estoque === 0 && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', padding: '4px 10px', borderRadius: 4, background: 'rgba(0,0,0,0.6)' }}>SEM ESTOQUE</span>
                  </div>
                )}
              </div>

              <div style={{ padding: '12px 12px 14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3
                  onClick={() => router.push(`/produtos/${p.id}`)}
                  style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 600, color: '#ccc', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden', cursor: 'pointer' }}>
                  {p.name}
                </h3>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#12fd00', textShadow: '0 0 8px rgba(18,253,0,0.3)' }}>
                    {currency.code} {fmt(p.usd_price, currency.rate, currency.code)}
                  </div>
                  <div style={{ fontSize: 10, color: '#444', marginTop: 2 }}>USD {p.usd_price.toFixed(2)}</div>
                </div>
                <button
                  disabled={p.estoque === 0}
                  onClick={() => adicionar({ id: p.id, name: p.name, usd: p.usd_price, img: p.img_url, brand: p.brand ?? undefined })}
                  style={{
                    marginTop: 'auto', width: '100%', padding: '9px 0', borderRadius: 6,
                    background: p.estoque === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(18,253,0,0.08)',
                    border: `1px solid ${p.estoque === 0 ? '#1a1a1a' : 'rgba(18,253,0,0.2)'}`,
                    color: p.estoque === 0 ? '#333' : '#12fd00',
                    fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
                    cursor: p.estoque === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { if (p.estoque !== 0) { (e.currentTarget as HTMLButtonElement).style.background = '#12fd00'; (e.currentTarget as HTMLButtonElement).style.color = '#000'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 16px rgba(18,253,0,0.35)' } }}
                  onMouseLeave={e => { if (p.estoque !== 0) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(18,253,0,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#12fd00'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none' } }}>
                  {p.estoque === 0 ? 'INDISPONÍVEL' : '+ ADICIONAR'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WhatsApp FAB */}
      <a href="https://wa.me/595984522822" target="_blank" rel="noopener"
        style={{ position: 'fixed', bottom: 24, right: 24, width: 52, height: 52, borderRadius: '50%', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(37,211,102,0.5)', zIndex: 50, transition: 'transform 0.2s' }}
        onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.1)'}
        onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.transform = 'none'}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>

      {/* Footer */}
      <footer style={{ background: '#060606', borderTop: '1px solid #111', padding: '48px 24px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40 }}>
          <div>
            <Image src="/logo.png" alt="Atacado Paraguai" width={120} height={47} style={{ objectFit: 'contain', marginBottom: 12 }} />
            <p style={{ color: '#444', fontSize: 13, lineHeight: 1.6 }}>Atacado e varejo. Compre e retire na loja em Paraguai.</p>
          </div>
          <div>
            <h4 style={{ color: '#12fd00', fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', marginBottom: 16, textShadow: '0 0 8px rgba(18,253,0,0.4)' }}>CATÁLOGO</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Biogenesis', 'ZPHC', 'Thera Genetics', 'Lipoless', 'Cooper Pharma'].map(i => (
                <li key={i}><a href="#saude" style={{ color: '#555', fontSize: 13, textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#12fd00'} onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#555'}>{i}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#12fd00', fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', marginBottom: 16, textShadow: '0 0 8px rgba(18,253,0,0.4)' }}>CONTATO</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li style={{ color: '#555', fontSize: 13 }}>📍 Paraguai</li>
              <li><a href="https://wa.me/595984522822" style={{ color: '#555', fontSize: 13, textDecoration: 'none' }} onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#25d366'} onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#555'}>💬 WhatsApp</a></li>
            </ul>
          </div>
        </div>
        <div style={{ maxWidth: 1280, margin: '40px auto 0', paddingTop: 20, borderTop: '1px solid #111', textAlign: 'center', color: '#2a2a2a', fontSize: 11, letterSpacing: '0.05em' }}>
          © 2025 ATACADO PARAGUAI — TODOS OS DIREITOS RESERVADOS
        </div>
      </footer>
    </div>
  )
}
