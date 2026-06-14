import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getConfig } from '@/lib/config'
import { emailComprovanteRecebido } from '@/lib/email'

export async function POST(req: Request) {
  const { orderId } = await req.json()
  if (!orderId) return NextResponse.json({ ok: true })

  const [{ data: order }, config] = await Promise.all([
    supabaseAdmin
      .from('orders')
      .select('order_num, total_brl, comprovante_url, customers(nome, email)')
      .eq('id', orderId)
      .single(),
    getConfig(),
  ])

  if (!order || !config.admin_email || !order.comprovante_url) return NextResponse.json({ ok: true })

  const customer = (order as any).customers
  await emailComprovanteRecebido(
    config.admin_email,
    order.order_num,
    customer?.nome || 'Cliente',
    customer?.email || '',
    order.total_brl,
    order.comprovante_url,
  )

  return NextResponse.json({ ok: true })
}
