import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../../../lib/supabaseClient'
import { useCurrentUser } from '../hooks/useCurrentUser'
import type { Database } from '../../../../types/supabase'

type Message = Database['public']['Tables']['messages']['Row']

export function useMessageChannel({
  userId,
  onNewMessage,
}: {
  userId: string | null
  onNewMessage: (message: Message) => void
}) {
  const { currentUserId } = useCurrentUser()
  const [isConnected, setIsConnected] = useState(false)

  // Hoia viidet viimasele onNewMessage funktsioonile
  const onNewMessageRef = useRef(onNewMessage)
  useEffect(() => {
    onNewMessageRef.current = onNewMessage
  }, [onNewMessage])

  useEffect(() => {
    if (!userId || !currentUserId) {
      setIsConnected(false) // kui ei ole userId, pole ühendust
      return
    }

    const sortedIds = [currentUserId, userId].sort()
    const channelName = `messages-${sortedIds[0]}-${sortedIds[1]}`
    const channel = supabase.channel(channelName)

    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as Message
          if (
            (newMsg.sender_id === currentUserId && newMsg.receiver_id === userId) ||
            (newMsg.sender_id === userId && newMsg.receiver_id === currentUserId)
          ) {
            onNewMessageRef.current(newMsg)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime kanal aktiivne')
          setIsConnected(true)
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime kanal error')
          setIsConnected(false)
        }
      })

    return () => {
      channel.unsubscribe()
      setIsConnected(false)
    }
  }, [currentUserId, userId])

  return { isConnected }
}
