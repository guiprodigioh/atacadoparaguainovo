import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
  const auth = await requireAdmin()
  if (auth) return auth
  const { data } = await supabaseAdmin
    .from('customers')
    .select('*, orders(id, order_num, total_brl, status, created_at)')
    .order('created_at', { ascending: false })
  return NextResponse.json({ data: data || [] })
}
