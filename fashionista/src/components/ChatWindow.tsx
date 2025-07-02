'use client'

import { useEffect, useState, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '../../types/supabase'
import { useSession } from '@supabase/auth-helpers-react'

type Props = {
  userId: string | null
}

export default function ChatWindow({ userId }: Props) {
  const supabase = createClientComponentClient<Database>()
  const session = useSession()
  const currentUserId = session?.user.id

  const [messages, setMessages] = useState<Database['public']['Tables']['messages']['Row'][]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  // Vestluspartneri info
  const [recipientInfo, setRecipientInfo] = useState<{
    first_name: string | null
    surname: string | null
    avatar_url: string | null
  } | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!currentUserId || !userId) {
      setMessages([])
      setRecipientInfo(null)
      return
    }

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUserId})`
        )
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Load messages error:', error)
      } else {
        setMessages(data || [])
      }
    }

    loadMessages()
  }, [currentUserId, userId, supabase])

  // Lae vestluspartneri info
  useEffect(() => {
    if (!userId) {
      setRecipientInfo(null)
      return
    }

    const loadRecipientInfo = async () => {
      const { data, error } = await supabase
        .from('public_users')
        .select('first_name, surname, avatar_url')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error loading recipient info:', error)
        setRecipientInfo(null)
      } else {
        setRecipientInfo(data)
      }
    }

    loadRecipientInfo()
  }, [userId, supabase])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!currentUserId || !userId) return

    const sortedIds = [currentUserId, userId].sort()
    const channelName = `messages-${sortedIds[0]}-${sortedIds[1]}`

    const channel = supabase.channel(channelName)

    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => {
        const newMsg = payload.new as Database['public']['Tables']['messages']['Row']
        if (
          (newMsg.sender_id === currentUserId && newMsg.receiver_id === userId) ||
          (newMsg.sender_id === userId && newMsg.receiver_id === currentUserId)
        ) {
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        }
      }
    )

    channel.subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [currentUserId, userId, supabase])

  const handleSend = async () => {
    if (sending || !newMessage.trim() || !currentUserId || !userId) return

    setSending(true)
    const messageToSend = newMessage.trim()

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUserId,
        receiver_id: userId,
        content: messageToSend,
      })
      .select()
      .single()

    setSending(false)

    if (error) {
      console.error('Send message error:', error)
      alert('Sõnumi saatmisel tekkis viga')
    } else if (data) {
      setMessages((prev) => [...prev, data])
      setNewMessage('')
    }
  }

  // Funktsioon esitähtede saamiseks
  const getInitials = (firstName: string | null, lastName: string | null) => {
    const firstInitial = firstName ? firstName[0].toUpperCase() : ''
    const lastInitial = lastName ? lastName[0].toUpperCase() : ''
    return firstInitial + lastInitial
  }

  
  return (
    <div className="flex flex-col flex-1 p-4 h-screen">
      {/* Vestluspartneri info kast */}
      <div className="flex items-center border-b p-2 mb-2">
        {recipientInfo?.avatar_url ? (
          <img
            src={recipientInfo.avatar_url}
            alt="Kontopilt"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold text-lg">
            {getInitials(recipientInfo?.first_name || '', recipientInfo?.surname || '')}
          </div>
        )}
        <div className="ml-3 font-semibold text-lg">
          {recipientInfo?.first_name || ''} {recipientInfo?.surname || ''}
        </div>
      </div>

      {/* Sõnumite ala */}
      <div className="flex-1 overflow-y-auto border rounded p-2 flex flex-col">
  {messages.length === 0 ? (
    <div className="text-center text-gray-500 mt-10">Alusta vestlust selle kasutajaga</div>
  ) : (
    messages.map((msg) => (
      <div
        key={msg.id}
        className={`p-2 my-1 rounded max-w-[70%] ${
          msg.sender_id === currentUserId ? 'bg-green-100 ml-auto' : 'bg-gray-200 mr-auto'
        }`}
      >
        {msg.content}
        <div className="text-xs text-gray-500 text-right">
          {new Date(msg.created_at).toLocaleTimeString()}
        </div>
      </div>
    ))
  )}
  <div ref={messagesEndRef} />
</div>


      {/* Sõnumi sisestus ja nupp */}
      <div className="flex gap-2 mt-2">
        <input
          className="flex-1 border rounded p-2"
          placeholder="Sisesta sõnum..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              await handleSend()
            }
          }}
          disabled={sending}
        />
        <button
          onClick={handleSend}
          disabled={sending}
          className={`px-4 rounded text-white ${sending ? 'bg-gray-500 cursor-not-allowed' : 'bg-black hover:bg-gray-800'}`}
        >
          {sending ? 'Saadan...' : 'Saada'}
        </button>
      </div>
    </div>
  )
}
