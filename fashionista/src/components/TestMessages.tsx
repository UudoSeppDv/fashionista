'use client'

import { useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'


type Props = {
  currentUserId: string
}

export default function TestMessages({ currentUserId }: Props) {

  useEffect(() => {
    const loadMessages = async () => {
      if (!currentUserId) {
        console.log('No currentUserId provided')
        return
      }

      // Lae sõnumid, kus currentUser on saatja
      const { data: sentMessages, error: sentError } = await supabase
        .from('messages')
        .select('*')
        .eq('sender_id', currentUserId)

      if (sentError) {
        console.error('Error loading sent messages:', sentError)
        return
      }

      // Lae sõnumid, kus currentUser on saaja
      const { data: receivedMessages, error: receivedError } = await supabase
        .from('messages')
        .select('*')
        .eq('receiver_id', currentUserId)

      if (receivedError) {
        console.error('Error loading received messages:', receivedError)
        return
      }

      // Ühenda mõlemad massiivid
      const allMessages = [...(sentMessages ?? []), ...(receivedMessages ?? [])]

      console.log('All messages for current user:', allMessages)
    }

    loadMessages()
  }, [currentUserId])

  return <div>Vaata konsooli, et näha praeguse kasutaja sõnumeid.</div>
}
