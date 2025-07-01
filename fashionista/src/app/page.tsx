'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import LoginModal from '@/components/LoginModal'
import SectionFeaturedProducts from '@/components/SectionFeaturedProducts'
import SectionFeaturedBrands from '@/components/SectionFeaturedBrands'
import SectionTrends from '@/components/SectionTrends'
import SectionBanner from '@/components/SectionBanner'
import SectionRecentlyAdded from '@/components/SectionRecentlyAdded'
import SectionRecentlyViewd from '@/components/SectionRecentlyViewd'
import Footer from '@/components/Footer'

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // lisa see, et hoida favoriidi muutuste timestampi
  const [favoritesUpdatedAt, setFavoritesUpdatedAt] = useState(Date.now())

  return (
    <>
      <main className="min-h-screen text-gray-800 relative">
        <Header
          setShowLoginModal={setShowLoginModal}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />

        <SectionBanner />
        <SectionFeaturedBrands />

        <SectionFeaturedProducts
          favoritesUpdatedAt={favoritesUpdatedAt}
          onFavoritesChange={() => setFavoritesUpdatedAt(Date.now())}
        />

        <img
          src="/images/flower-vector.svg"
          alt="Taustavektor"
          className="overflow-visible pointer-events-none absolute top-480 left-0 object-cover opacity-90"
          style={{ zIndex: 0, width: '55%', height: '55%', left: '-150px' }}
        />

        <div style={{ position: 'relative', zIndex: 10 }}>
          <SectionTrends />
          <SectionRecentlyAdded />

          <SectionRecentlyViewd
            favoritesUpdatedAt={favoritesUpdatedAt}
            onFavoritesChange={() => setFavoritesUpdatedAt(Date.now())}
          />

          <Footer />
        </div>
      </main>
    </>
  )
}
