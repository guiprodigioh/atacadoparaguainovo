'use client'
import { useState, useEffect } from 'react'

type Cfg = { pix_key: string; pix_holder: string; brl_rate: string; admin_email: string; store_name: string }
const empty: Cfg = { pix_key: '', pix_holder: '', brl_rate: '', admin_email: '', store_name: '' }

const inp = { width: '100%', padding: '11px 14px', background: '#111', border: '1px solid #1a1a1a', borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }
const lbl = { fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: '0.08em', display: 'block', marginBottom: 6 } as const

export default function Configuracoes() {
  const [cfg, setCfg] = useState<Cfg>(empty)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/configuracoes').then(r => r.json()).then(d => {
      setCfg({
        pix_key: d.pix_key || '',
        pix_holder: d.pix_holder || '',
        brl_rate: d.brl_rate?.toString() || '5.20',
        admin_email: d.admin_email || '',
        store_name: d.store_name || '',
      })
      setLoading(false)
    })
  }, [])

  const set = (k: keyof Cfg) => (e: React.ChangeEvent<HTMLInputElement>) => setCfg(p => ({ ...p, [k]: e.target.value }))

  const save = async () => {
    setSaving(true)
    await fetch('/api/admin/configuracoes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...cfg, brl_rate: parseFloat(cfg.brl_rate) || 5.20 }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <div style={{ padding: '32px 36px', background: '#080808', minHeight: '100vh' }} />

  return (
    <div style={{ padding: '32px 36px', background: '#080808', minHeight: '100vh' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Configurações</h1>
        <p style={{ color: '#444', fontSize: 13, marginTop: 4 }}>Ajuste PIX, câmbio e notificações sem precisar de deploy</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 800 }}>

        {/* PIX */}
        <div style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 14, padding: 24, gridColumn: '1 / -1' }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#12fd00', letterSpacing: '0.1em', margin: '0 0 20px' }}>PAGAMENTO PIX</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={lbl}>CHAVE PIX</label>
              <input value={cfg.pix_key} onChange={set('pix_key')} placeholder="CNPJ, CPF, e-mail ou aleatória" style={inp} />
            </div>
            <div>
              <label style={lbl}>NOME DO BENEFICIÁRIO</label>
              <input value={cfg.pix_holder} onChange={set('pix_holder')} placeholder="ATACADO PARAGUAI" style={inp} />
            </div>
          </div>
        </div>

        {/* Câmbio */}
        <div style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 14, padding: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#f59e0b', letterSpacing: '0.1em', margin: '0 0 20px' }}>COTAÇÃO DO DÓLAR</p>
          <label style={lbl}>USD → BRL (taxa de conversão)</label>
          <input value={cfg.brl_rate} onChange={set('brl_rate')} placeholder="5.20" type="number" step="0.01" style={inp} />
          <p style={{ fontSize: 12, color: '#444', margin: '8px 0 0' }}>
            Afeta o cálculo do total em R$ nos novos pedidos
          </p>
        </div>

        {/* Email admin */}
        <div style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 14, padding: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#3b82f6', letterSpacing: '0.1em', margin: '0 0 20px' }}>NOTIFICAÇÕES</p>
          <label style={lbl}>E-MAIL DO ADMINISTRADOR</label>
          <input value={cfg.admin_email} onChange={set('admin_email')} placeholder="seu@email.com" type="email" style={inp} />
          <p style={{ fontSize: 12, color: '#444', margin: '8px 0 0' }}>
            Recebe alerta quando cliente envia comprovante
          </p>
        </div>

        {/* Loja */}
        <div style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 14, padding: 24, gridColumn: '1 / -1' }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#888', letterSpacing: '0.1em', margin: '0 0 20px' }}>DADOS DA LOJA</p>
          <label style={lbl}>NOME DA LOJA</label>
          <input value={cfg.store_name} onChange={set('store_name')} placeholder="Atacado Paraguai" style={{ ...inp, maxWidth: 360 }} />
        </div>
      </div>

      <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={save} disabled={saving}
          style={{ padding: '12px 32px', background: saving ? '#1a1a1a' : '#12fd00', color: saving ? '#555' : '#000', border: 'none', borderRadius: 10, fontWeight: 900, fontSize: 14, cursor: saving ? 'wait' : 'pointer', transition: 'all 0.2s' }}>
          {saving ? 'Salvando...' : 'Salvar configurações'}
        </button>
        {saved && <span style={{ fontSize: 13, color: '#12fd00', fontWeight: 700 }}>✓ Salvo com sucesso</span>}
      </div>
    </div>
  )
}
