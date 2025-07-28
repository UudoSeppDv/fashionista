'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MyPurchases from '@/components/MyPurchases'
import LoginModal from '@/components/LoginModal';

export default function KontoPage() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <main className="min-h-screen bg-[#f8f3ef] flex flex-col">
      <Header
        setShowLoginModal={setShowLoginModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <LoginModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                  />

      <div className="flex-grow py-10">
        <MyPurchases />
      </div>

      <Footer />
    </main>
  )
}
