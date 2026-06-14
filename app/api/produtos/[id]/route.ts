import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data } = await supabaseAdmin
    .from('products')
    .select('id, name, brand, usd_price, img_url, estoque')
    .eq('id', id)
    .eq('ativo', true)
    .single()
  if (!data) return NextResponse.json(null, { status: 404 })
  return NextResponse.json(data)
}
