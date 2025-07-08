'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import ChatList from './ChatList'
import ChatWindow from './ChatWindow'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Session } from '@supabase/supabase-js'

export default function ChatPageClient() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const pathname = usePathname()

  const [session, setSession] = useState<Session | null>(null)

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
  }, [supabase])

  // selectedUserId URL-ist
  const userIdFromUrl = pathname?.split('/').pop() || null
  const [selectedUserId, setSelectedUserId] = useState<string | null>(userIdFromUrl)

  useEffect(() => {
    setSelectedUserId(userIdFromUrl)
  }, [userIdFromUrl])

  // Kontroll: pole sisse logitud
  if (!currentUserId) {
    return <div>Palun logi sisse, et kasutada vestlust.</div>
  }

  // kasutaja valimine (nt ChatList-is)
  const handleSelectUser = (newUserId: string) => {
    setSelectedUserId(newUserId)
    router.push(`/messages/${newUserId}`)
  }

  // kui pole selectedUserId
  if (!selectedUserId) {
    return <div>Vali vestlus kasutajate seast.</div>
  }

  return (
    
    <div className="flex max-h-[85vh]">
      
      <ChatList

        onSelectUser={handleSelectUser}
        selectedUserId={selectedUserId}
      />
      
      <ChatWindow userId={selectedUserId} />
    </div>
  )
}
