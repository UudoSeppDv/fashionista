'use client'

import { useState, useEffect } from 'react'
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import ChatList from '../../components/ChatList'
import { useRouter, usePathname } from 'next/navigation'
import LoginModal from '@/components/LoginModal'

// Kui sul on mingi auth lahendus (nt Supabase), siis peaksid currentUserId tooma sealt
// import { useSession } vms

export default function MessagePage() {
  const router = useRouter()
  const pathname = usePathname()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const userIdFromUrl = pathname?.split('/').pop() || null
  const [selectedUserId, setSelectedUserId] = useState<string | null>(userIdFromUrl)

  useEffect(() => {
    setSelectedUserId(userIdFromUrl)
  }, [userIdFromUrl])

  // Oletame, et currentUserId tuleb kuskilt auth süsteemist
  const currentUserId = true // <-- Asenda see tegeliku auth loogikaga

  if (!currentUserId) {
    return <div className="p-4">Palun logi sisse, et kasutada vestlust.</div>
  }

  const handleSelectUser = (newUserId: string) => {
    setSelectedUserId(newUserId)
    router.push(`/messages/${newUserId}`)
  }

  if (!selectedUserId) {
    return <div className="p-4">Vali vestlus kasutajate seast.</div>
  }

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
      <main className="min-h-screen">
        <ChatList
          onSelectUser={handleSelectUser}
          selectedUserId={selectedUserId}
        />
      </main>
      <Footer />
    </>
  )
}
