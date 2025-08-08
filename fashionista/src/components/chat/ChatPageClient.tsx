'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import ChatList from './ChatList'
import ChatWindow from './ChatWindow'
import { supabase } from '../../../lib/supabaseClient'
import type { Session } from '@supabase/supabase-js'
import { ContactType } from '../../../types/contact'

export default function ChatPageClient() {
  const router = useRouter()
  const pathname = usePathname()

  const [session, setSession] = useState<Session | null>(null)
  const [windowWidth, setWindowWidth] = useState<number | undefined>(undefined)
  const currentUserId = session?.user.id

  // Sessiooni haldus
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // Jälgi akna laiust
  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // selectedUserId URL-ist
  const userIdFromUrl = pathname?.split('/').pop() || null
  const [selectedUserId, setSelectedUserId] = useState<string | null>(userIdFromUrl)
  const [contacts] = useState<ContactType[]>([])
  useEffect(() => {
    setSelectedUserId(userIdFromUrl)
  }, [userIdFromUrl])

  // kasutaja valimine (nt ChatList-is)
  const handleSelectUser = (newUserId: string) => {
    setSelectedUserId(newUserId)
    router.push(`/messages/${newUserId}`)
  }

  const isMobile = windowWidth !== undefined && windowWidth < 768

  // Kontroll: pole sisse logitud
  if (!currentUserId) {
    return <div>Palun logi sisse, et kasutada vestlust.</div>
  }

  // kui pole selectedUserId
  if (!selectedUserId) {
    return <div>Vali vestlus kasutajate seast.</div>
  }

  // Väikese ekraani vaade - ainult ChatWindow
  if (isMobile) {
    return (
      <div className="flex h-[85vh]">
        <ChatWindow userId={selectedUserId} />
      </div>
    )
  }

  // Suure ekraani vaade - ChatList ja ChatWindow kõrvuti
  return (
    <div className="flex h-[85vh]">
      <div className="w-1/3 h-full border-r border-gray-300">
            <ChatList
              contacts={contacts}
              onSelectUser={handleSelectUser}
              selectedUserId={selectedUserId}
            />
          </div>
      <ChatWindow userId={selectedUserId} />
    </div>
  )
}
