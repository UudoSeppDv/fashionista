// app/api/check-order-status/route.ts

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Vigane ID' }, { status: 400 })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('orders')
      .select('status') // <- vajadusel lisa siia ka .select('*') debugiks
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Andmebaasiviga' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Tellimust ei leitud' }, { status: 404 })
    }

    console.log('Order status:', data.status)

    return NextResponse.json({ sent: data.status === 'sent' })
  } catch (e: unknown) {
  if (e instanceof Error) {
    console.error('Server crash:', e.message)
  } else {
    console.error('Server crash: Unknown error')
  }
  return NextResponse.json({ error: 'Serveri viga' }, { status: 500 })
}
}
