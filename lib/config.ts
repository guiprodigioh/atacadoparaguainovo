import { supabaseAdmin } from '@/lib/supabase'

export type Config = {
  pix_key: string
  pix_holder: string
  brl_rate: number
  admin_email: string
  store_name: string
}

const DEFAULTS: Config = {
  pix_key: '62533491000193',
  pix_holder: 'ATACADO PARAGUAI',
  brl_rate: 5.20,
  admin_email: '',
  store_name: 'Atacado Paraguai',
}

export async function getConfig(): Promise<Config> {
  try {
    const { data } = await supabaseAdmin.from('configuracoes').select('*').eq('id', 'default').single()
    if (!data) return DEFAULTS
    return {
      pix_key: data.pix_key || DEFAULTS.pix_key,
      pix_holder: data.pix_holder || DEFAULTS.pix_holder,
      brl_rate: Number(data.brl_rate) || DEFAULTS.brl_rate,
      admin_email: data.admin_email || DEFAULTS.admin_email,
      store_name: data.store_name || DEFAULTS.store_name,
    }
  } catch {
    return DEFAULTS
  }
}
