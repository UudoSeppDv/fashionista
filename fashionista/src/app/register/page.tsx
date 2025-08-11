
'use client'

import { useState } from 'react'
import Header from '@/components/header/Header'
import Footer from '@/components/Footer'
import RegisterForm from "@/components/register/RegisterForm";
import LoginModal from '@/components/LoginModal'

export default function RegisterPage() {
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

        <RegisterForm onLoginOpen={() => setShowLoginModal(true)} />

      <Footer />
    </main>
  )
}




  
