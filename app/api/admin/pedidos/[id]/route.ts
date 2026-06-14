import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'
import { getConfig } from '@/lib/config'
import { emailProntoRetirada } from '@/lib/email'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth) return auth
  const { id } = await params
  const { data: history } = await supabaseAdmin
    .from('order_status_history')
    .select('status, created_at')
    .eq('order_id', id)
    .order('created_at', { ascending: false })
    .limit(10)
  return NextResponse.json({ history: history || [] })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth) return auth

  const { id } = await params
  const body = await req.json()

  if (body.status) {
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('status, order_num, total_brl, customers(nome, email)')
      .eq('id', id)
      .single()

    if (order && order.status !== body.status) {
      await supabaseAdmin.from('order_status_history').insert({ order_id: id, status: body.status })

      if (body.status === 'pronto_retirada') {
        const config = await getConfig()
        const customer = (order as any).customers
        if (customer?.email) {
          emailProntoRetirada(customer.email, customer.nome, order.order_num, order.total_brl).catch(() => {})
        }
        void config
      }
    }
  }

  const { error } = await supabaseAdmin
    .from('orders')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
