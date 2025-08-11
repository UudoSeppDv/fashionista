
'use client'

import { useState } from 'react'
import Header from '@/components/header/Header'
import Footer from '@/components/Footer'
import NotificationItem from '@/components/notification-page/NotificationItem'
import LoginModal from '@/components/LoginModal'

export default function RegisterPage() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  return (
    <main className="bg-[#f8f3ef]">
      <Header
        setShowLoginModal={setShowLoginModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
              />

        <NotificationItem />

      <Footer />
    </main>
  )
}




  
