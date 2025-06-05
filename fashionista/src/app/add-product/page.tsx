'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductForm from '@/components/ProductForm'
import LoginModal from '@/components/LoginModal'

export default function AddProductPage() {
  // State modaalakna avamiseks/sulgemiseks
  const [showLoginModal, setShowLoginModal] = useState(false)

  // State otsinguküsimuse jaoks
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <>
      <Header
        setShowLoginModal={setShowLoginModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Lisa uus toode</h1>
        <ProductForm />
      </main>
      <Footer />
    </>
  )
}
