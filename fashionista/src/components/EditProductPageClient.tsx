'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import type { Session } from '@supabase/auth-helpers-nextjs'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import EditProductForm from '../components/EditProductForm'
import LoginModal from '@/components/LoginModal'

type Props = {
  productId: string
}

export default function EditProductPageClient({ productId }: Props) {
  const router = useRouter()


  const [, setShowLoginModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      const currentSession = data.session
      setSession(currentSession)

      if (!currentSession) {
        setShowLoginModal(true)
        setIsLoading(false)
        return
      }

      // Lae toote andmed, et kontrollida omanikku
      const { data: product, error } = await supabase
        .from('products') // ← asenda vastavalt oma tabeli nimega
        .select('user_id') // ← ainult omanikku on vaja
        .eq('id', productId)
        .single()

      if (error || !product) {
        console.error('Toodet ei leitud või viga:', error)
        router.push('/') // Või error page
        return
      }

      if (product.user_id !== currentSession.user.id) {
        console.warn('Pole omanik, suunan välja')
        router.push('/') // Või 403 page
        return
      }

      // Kui kõik OK
      setIsOwner(true)
      setIsLoading(false)
    }

    init()

    const { data: subscriptionData } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        setShowLoginModal(true)
        router.push('/')
      } else {
        setShowLoginModal(false)
      }
    })

    return () => {
      subscriptionData.subscription.unsubscribe()
    }
  }, [productId, router])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Kontrollin õiguseid ja laen andmeid...
      </div>
    )
  }

  if (!session) {
    return (
      <LoginModal
        isOpen={true}
        onClose={() => setShowLoginModal(false)}
      />
    )
  }

  if (!isOwner) {
    return (
      <div className="text-center mt-10 text-xl text-red-600">
        Sul puudub luba seda toodet muuta.
      </div>
    )
  }

  return (
    <>
      <Header
        setShowLoginModal={setShowLoginModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <main className="p-6">
        <EditProductForm productId={productId} />
      </main>
      <Footer />
    </>
  )
}
