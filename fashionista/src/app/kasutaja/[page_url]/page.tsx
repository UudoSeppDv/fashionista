'use client'

import UserProfileClient from '../../../components/UserProfileClient'
import { useState } from 'react'
import Header from '@/components/header/Header'
import Footer from '@/components/Footer'
import LoginModal from '@/components/LoginModal'

export default function Page() {
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
        <UserProfileClient />
      </div>

      <Footer />
    </main>
  )
}
