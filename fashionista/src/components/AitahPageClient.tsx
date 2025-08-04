'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase } from '../../lib/supabaseClient'

export default function AitahPageClient() {
  const searchParams = useSearchParams()
  const [, setShowLoginModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sellerName, setSellerName] = useState<string | null>(null)

  const price = parseFloat(searchParams.get('price') || '0')
  const service = parseFloat(searchParams.get('service') || '0')
  const transport = parseFloat(searchParams.get('transport') || '0')
  const total = parseFloat(searchParams.get('total') || '0')
  const productId = searchParams.get('product_id')

  const notificationSentRef = useRef(false)  // <-- useRef lipuke

  useEffect(() => {
    const sendNotification = async () => {
      if (!productId || notificationSentRef.current) return

      notificationSentRef.current = true  // <-- paneme siia, et takistada topelt

      // 1. Hangi product → user_id
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('user_id')
        .eq('id', productId)
        .single()

      if (productError || !product) {
        console.error('Toote omanikku ei leitud:', productError)
        return
      }

      const sellerId = product.user_id

      // 2. Hangi omaniku nimi
      const { data: sellerData } = await supabase
        .from('public_users')
        .select('first_name, surname')
        .eq('id', sellerId)
        .single()

      const fullName = sellerData
        ? `${sellerData.first_name ?? ''} ${sellerData.surname ?? ''}`.trim()
        : 'Müüja'

      setSellerName(fullName)

      // 3. Hangi ostja (sisselogitud) kasutaja
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error('Kasutaja pole sisse logitud')
        return
      }

      const senderId = user.id

      // 4. Lisa teavitus
      const message = `Ost sooritatud! Anname sulle teada, kui ${fullName} su tellimuse teele paneb.`

      const { error: notifError } = await supabase.from('notifications').insert([
        {
          user_id: sellerId,
          sender_id: senderId,
          product_id: productId,
          type: 'order',
          message: message,
          link: `/minu-ostud`, // vajadusel asenda õige lingiga
          created_at: new Date().toISOString(),
        },
      ])

      if (notifError) {
        console.error('Teavituse salvestus ebaõnnestus:', notifError)
        return
      }
    }

    sendNotification()
  }, [productId])

  const format = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    })
      .format(value)
      .replace('€', '')
      .trim() + ' €'

  return (
    <main className="min-h-screen flex flex-col">
      <Header
        setShowLoginModal={setShowLoginModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="flex flex-col items-center justify-center font-montserrat text-center p-6 mt-24 mb-30">
        <h1 className="text-3xl font-bold mb-6">Aitäh!</h1>

        <div className="border p-10 w-full max-w-2xl text-left space-y-5">
          <h2 className="text-2xl font-semibold pb-2">Tellimuse Kokkuvõte</h2>

          <div className="text-base space-y-5">
            <div className="flex justify-between">
              <span>Toote hind:</span>
              <span className="font-semibold">{format(price)}</span>
            </div>
            <div className="flex justify-between">
              <span>Teenustasu:</span>
              <span className="font-semibold">{format(service)}</span>
            </div>
            <div className="flex justify-between">
              <span>Transport:</span>
              <span className="font-semibold">
                {transport === 0 ? 'Tasuta' : format(transport)}
              </span>
            </div>

            <div className="flex justify-between border-t pt-5 mt-5 text-lg">
              <span className="font-bold">Kokku:</span>
              <span className="font-bold">{format(total)}</span>
            </div>
          </div>

          {sellerName && (
            <p className="text-sm text-gray-600 pt-4">
              Anname sulle teada, kui <strong>{sellerName}</strong> su tellimuse teele paneb.
            </p>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
