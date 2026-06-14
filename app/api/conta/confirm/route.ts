import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  const { data: { user }, error: getUserErr } = await supabaseAdmin.auth.admin.getUserById(userId)
  if (getUserErr || !user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Só confirma contas criadas nos últimos 10 minutos
  const ageMs = Date.now() - new Date(user.created_at).getTime()
  if (ageMs > 10 * 60 * 1000) {
    return NextResponse.json({ error: 'Expired' }, { status: 403 })
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { email_confirm: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
