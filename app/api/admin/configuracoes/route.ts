import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
  const auth = await requireAdmin()
  if (auth) return auth
  const { data } = await supabaseAdmin.from('configuracoes').select('*').eq('id', 'default').single()
  return NextResponse.json(data || {})
}

export async function PATCH(req: Request) {
  const auth = await requireAdmin()
  if (auth) return auth
  const body = await req.json()
  const { error } = await supabaseAdmin
    .from('configuracoes')
    .upsert({ id: 'default', ...body, updated_at: new Date().toISOString() })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
