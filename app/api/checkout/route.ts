import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getConfig } from '@/lib/config'

export async function POST(req: Request) {
  const { form, itens, userId } = await req.json()

  const [config] = await Promise.all([getConfig()])

  const totalUsd = +(itens as { usd: number; quantity: number }[])
    .reduce((s, i) => s + i.usd * i.quantity, 0)
    .toFixed(2)

  const orderNum = `AP${Date.now().toString().slice(-8)}${Math.random().toString(36).slice(2, 5).toUpperCase()}`

  const { data: customer, error: ce } = await supabaseAdmin
    .from('customers')
    .insert({ nome: form.nome, cpf: form.cpf, email: form.email, telefone: form.telefone, cep: form.cep, endereco: form.endereco, numero: form.numero, complemento: form.complemento, bairro: form.bairro, cidade: form.cidade, uf: form.uf, user_id: userId || null })
    .select('id')
    .single()
  if (ce) return NextResponse.json({ error: ce.message }, { status: 500 })

  const { data: order, error: oe } = await supabaseAdmin
    .from('orders')
    .insert({ order_num: orderNum, customer_id: customer.id, user_id: userId || null, total_usd: totalUsd, total_brl: +(totalUsd * config.brl_rate).toFixed(2) })
    .select('id')
    .single()
  if (oe) return NextResponse.json({ error: oe.message }, { status: 500 })

  const items = (itens as { name: string; brand?: string; usd: number; quantity: number }[]).map(i => ({
    order_id: order.id,
    product_name: i.name,
    product_brand: i.brand || null,
    unit_usd: i.usd,
    quantity: i.quantity,
    subtotal_usd: +(i.usd * i.quantity).toFixed(2),
  }))

  const { error: ie } = await supabaseAdmin.from('order_items').insert(items)
  if (ie) return NextResponse.json({ error: ie.message }, { status: 500 })

  await supabaseAdmin.from('order_status_history').insert({ order_id: order.id, status: 'pendente_pagamento' })

  return NextResponse.json({ ok: true, orderId: order.id, orderNum })
}
