'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import Footer from '@/components/Footer'
import Header from '@/components/header/Header'
import LoginModal from '@/components/LoginModal'
import ChatList from './ChatList'
import { ContactType } from '../../../types/contact'

export default function ChatView() {
  
  const router = useRouter()
  const pathname = usePathname()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')


const [contacts, setContacts] = useState<ContactType[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const userIdFromUrl = pathname?.split('/').pop() || null
  const [selectedUserId, setSelectedUserId] = useState<string | null>(userIdFromUrl)

  useEffect(() => {
    setSelectedUserId(userIdFromUrl)
  }, [userIdFromUrl])

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) console.error('Auth error:', error)
      setCurrentUserId(user?.id || null)
    }

    fetchUser()
  }, [])

  useEffect(() => {
    const fetchContacts = async () => {
      if (!currentUserId) return

      const { data, error } = await supabase
        .from('user_contacts_detailed')
        .select(`
          contact_id,
          first_name,
          surname,
          avatar_url,
          last_message_text,
          last_message_timestamp
        `)

      if (error) {
        console.error('Fetch contacts error:', error)
        return
      }

      if (data) {
        const filtered = data
  .filter((c) => c.contact_id !== currentUserId && c.contact_id !== null)
  .map((c) => ({
    id: c.contact_id!,
    first_name: c.first_name ?? '',         // kui null, siis ''
    surname: c.surname ?? '',
    avatar_url: c.avatar_url ?? '',
    last_message_text: c.last_message_text ?? '',
    last_message_timestamp: c.last_message_timestamp ?? '',
  }))
        setContacts(filtered)
      }
    }

    fetchContacts()
  }, [currentUserId])

  if (!currentUserId) {
    return <div className="p-4">Palun logi sisse, et kasutada vestlust.</div>
  }

  const handleSelectUser = (newUserId: string) => {
    setSelectedUserId(newUserId)
    router.push(`/messages/${newUserId}`)
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

      <main className="flex h-[85vh] font-montserrat">
  {contacts.length === 0 ? (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center text-center space-y-4">
        <svg
          width="107"
          height="119"
          viewBox="0 0 107 119"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M39.6444 29.1327C56.4669 33.2037 67.8416 34.1615 78.3183 30.7491C92.4469 26.1394 112.442 40.687 105.019 58.4076C99.3914 71.9374 97.1763 70.2612 100.05 85.8864C101.666 94.5072 92.2673 109.055 78.1986 117.077C71.7928 120.669 58.0834 120.07 50.4204 100.434C42.7575 80.7977 36.1721 80.2589 23.7199 77.3853C15.3385 75.4696 -4.89642 68.2856 1.09025 47.5717C6.17892 29.9709 22.8219 25.0618 39.6444 29.1327Z" fill="#EAD5DE"/>
          <path d="M35.5722 23.9243C35.5722 23.9243 19.5279 13.9864 28.0888 6.02414C40.0023 -5.0512 46.7672 11.951 48.0843 9.43655C49.4014 6.98202 51.7362 0.875609 58.9202 0.0973412C68.1995 -0.920393 68.6785 6.38335 70.2949 6.14388C71.9113 5.90442 83.8846 -1.93813 90.2904 7.28135C95.9178 15.4232 79.9334 23.6848 78.5565 29.9708C76.1019 41.2856 78.0775 53.0794 64.7871 56.3721C45.1508 61.341 35.5722 23.9243 35.5722 23.9243Z" fill="#EEB1C2"/>
          <path d="M47.1279 26.0794C48.5048 23.8643 56.8263 34.8798 56.7664 33.8022C56.6467 31.5272 54.6112 25.6603 56.5869 24.882C58.5625 24.1038 59.1013 35.239 59.5802 34.0416C60.0591 32.8443 61.6755 25.9596 65.507 22.4874C69.3384 18.9552 70.6555 19.8532 67.0635 24.5228C64.1301 28.4142 63.6511 36.7356 61.7952 41.7645C61.017 43.9197 65.4471 59.6646 70.2365 70.9195C73.3495 78.1634 78.8573 86.1257 76.9415 84.8685C72.4515 81.8752 64.8485 70.5603 58.3829 41.8243C58.0835 40.148 45.8707 28.1747 47.1279 26.0794Z" fill="#B4A6A6"/>
        </svg>

        <p className="text-gray-800 text-lg">
          Pole veel sõnumeid
        </p>
      </div>
    </div>
  ) : (
    <>
      <ChatList
        contacts={contacts}
        onSelectUser={handleSelectUser}
        selectedUserId={selectedUserId}
      />
      <div className="flex-1 flex items-center justify-center border-gray-600 border-t">
        <p className="text-gray-600 text-lg text-center">
          Alusta vestlust kellegagi vasakult nimekirjast.
        </p>
      </div>
    </>
  )}
</main>


      <Footer />
    </>
  )
}
