'use client'

import { use, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CheckOut from '@/components/CheckOut';

interface PageProps {
  params: Promise<{
    productId: string;
  }>;
}

export default function Page({ params }: PageProps) {
  const unwrappedParams = use(params); // 👈 unwrap Promise

  const [, setShowLoginModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <main className="min-h-screen bg-[#f8f3ef] flex flex-col">
      <Header
        setShowLoginModal={setShowLoginModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <CheckOut productId={unwrappedParams.productId} />

      <Footer />
    </main>
  );
}
