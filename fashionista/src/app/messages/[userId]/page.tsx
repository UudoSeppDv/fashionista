'use client'

import { useState } from 'react'
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import LoginModal from '@/components/LoginModal'
import ChatPageClient from '@/components/ChatPageClient'

export default function MessageUserPage() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="flex flex-col h-screen"> {/* HORIZONTAL SCREEN */}
      <Header
        setShowLoginModal={setShowLoginModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="flex-1"> {/* Prevent outer scroll */}
        <ChatPageClient />
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

     <Footer />
      
    </div>
  )
}
