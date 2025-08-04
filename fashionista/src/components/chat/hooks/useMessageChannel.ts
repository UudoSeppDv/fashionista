import { useEffect, useRef } from 'react'
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

  // Hoia viidet viimasele onNewMessage funktsioonile
  const onNewMessageRef = useRef(onNewMessage)
  useEffect(() => {
    onNewMessageRef.current = onNewMessage
  }, [onNewMessage])

  useEffect(() => {
    if (!userId || !currentUserId) return

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
            // Kasuta alati kõige värskemat onNewMessage funktsiooni
            onNewMessageRef.current(newMsg)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime kanal aktiivne')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime kanal error')
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }, [currentUserId, userId])
}
