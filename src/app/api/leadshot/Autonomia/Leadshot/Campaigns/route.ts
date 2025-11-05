import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory store for dev
// Note: resets on server restart. Suitable for local testing only.

type Campaign = {
  id: string
  name: string
  description?: string
  template_message_id?: string | null
  account_id: string
  product_id: string
  created_at: string
  account_name?: string
  template_name?: string
}

const campaigns: Campaign[] = [
  {
    id: 'c1b2a3a4-1111-2222-3333-444455556666',
    name: 'Campanha Boas-vindas',
    description: 'Mensagens iniciais para novos leads',
    template_message_id: null,
    account_id: 'acc-demo-01',
    product_id: '83678adb-39c4-444c-bfb3-d8955aab5d47',
    created_at: new Date().toISOString(),
    account_name: 'Conta Demo 01',
    template_name: '—',
  },
  {
    id: 'd2c3b4b5-7777-8888-9999-aaaabbbbcccc',
    name: 'Campanha Reengajamento',
    description: 'Reengajar contatos frios',
    template_message_id: null,
    account_id: 'acc-demo-02',
    product_id: '83678adb-39c4-444c-bfb3-d8955aab5d47',
    created_at: new Date().toISOString(),
    account_name: 'Conta Demo 02',
    template_name: '—',
  },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId') || searchParams.get('product_id')

  const filtered = productId
    ? campaigns.filter(c => c.product_id === productId)
    : campaigns

  return NextResponse.json({ success: true, data: filtered })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, account_id, template_message_id, product_id } = body || {}

    if (!name || !account_id || !product_id) {
      return NextResponse.json({ success: false, message: 'Campos obrigatórios: name, account_id, product_id' }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const created: Campaign = {
      id,
      name,
      description: description || null,
      template_message_id: template_message_id || null,
      account_id,
      product_id,
      created_at: new Date().toISOString(),
    }
    campaigns.unshift(created)
    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Erro ao criar campanha' }, { status: 500 })
  }
}
