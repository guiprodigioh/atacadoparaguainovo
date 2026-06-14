import MinhaContaNav from './MinhaContaNav'

export default function ContaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="conta-layout" style={{ minHeight: '100vh', background: '#080808', color: '#fff', display: 'flex' }}>
      <style>{`
        @media (max-width: 700px) {
          .conta-layout { flex-direction: column !important; }
          .conta-main { padding: 24px 16px 80px !important; }
        }
      `}</style>
      <MinhaContaNav />
      <main className="conta-main" style={{ flex: 1, minWidth: 0, padding: '36px 36px 80px' }}>
        {children}
      </main>
    </div>
  )
}
