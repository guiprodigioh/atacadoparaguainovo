import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, name, brand, usd_price, img_url, estoque')
    .eq('ativo', true)
    .order('sort_order', { ascending: true })
  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data || [])
}
