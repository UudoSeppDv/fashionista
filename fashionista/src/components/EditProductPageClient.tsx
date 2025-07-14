'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Database } from '..../../../types/supabase' 
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
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
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setIsLoading(false)

      if (!data.session) {
        setShowLoginModal(true)
      }
    }
    checkSession()

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
  }, [router])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Kontrollin kasutaja õiguseid...
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
