import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const enc = (s: string | null) => s ? Buffer.from(s).toString('base64') : null

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, name, brand, usd_price, img_url, estoque')
    .eq('ativo', true)
    .order('sort_order', { ascending: true })
  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json((data || []).map(p => ({ ...p, name: enc(p.name), brand: enc(p.brand) })))
}
