import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const enc = (s: string | null) => s ? Buffer.from(s).toString('base64') : null

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data } = await supabaseAdmin
    .from('products')
    .select('id, name, brand, usd_price, img_url, estoque')
    .eq('id', id)
    .eq('ativo', true)
    .single()
  if (!data) return NextResponse.json(null, { status: 404 })
  return NextResponse.json({ ...data, name: enc(data.name), brand: enc(data.brand) })
}
