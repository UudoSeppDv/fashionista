'use client'

import { useState } from 'react'
import AccountSettings from '@/components/AccountSettings'
import Header from '@/components/header/Header'
import Footer from '@/components/Footer'

export default function KontoPage() {
  const [, setShowLoginModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <main className="min-h-screen bg-[#f8f3ef] flex flex-col">
      <Header
        setShowLoginModal={setShowLoginModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="flex-grow py-10">
        <AccountSettings />
      </div>

      <Footer />
    </main>
  )
}
