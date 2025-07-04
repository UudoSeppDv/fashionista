'use client'

import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '../../types/supabase'
import MessageInput from './MessageInput'
import type { Session } from '@supabase/supabase-js' 

type Props = {
  userId: string | null
}

export default function ChatWindow({ userId }: Props) {
  const supabase = createClientComponentClient<Database>()
  const [session, setSession] = useState<Session | null>(null)  // <- muudetud tüüp
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const [messages, setMessages] = useState<Database['public']['Tables']['messages']['Row'][]>([])
  const [sending, setSending] = useState(false)
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(false)
  const [recipientInfo, setRecipientInfo] = useState<{
    first_name: string | null
    surname: string | null
    avatar_url: string | null
  } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

    useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setCurrentUserId(data.session?.user.id || null)
    }
    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setCurrentUserId(session?.user.id || null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  // Lae esialgsed sõnumid
  useEffect(() => {
    if (!currentUserId || !userId) return

    const loadMessages = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUserId})`
        )
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Load messages error:', error)
        setMessages([])
      } else {
        setMessages(data || [])
      }
      setLoading(false)
      scrollToBottom()
    }

    loadMessages()
  }, [currentUserId, userId, supabase])

  // signed URLid
  useEffect(() => {
    if (!messages.length || !session) return

    const fetchSignedUrls = async () => {
      const newUrls: Record<number, string> = {}
      for (const msg of messages) {
        if (msg.image_url) {
          const { data, error } = await supabase.storage
            .from('chat-images')
            .createSignedUrl(msg.image_url, 60 * 60)

          if (!error && data?.signedUrl) {
            newUrls[msg.id] = data.signedUrl
          } else {
            console.error('Signed URL genereerimise viga:', error)
          }
        }
      }
      setImageUrls(newUrls)
    }

    fetchSignedUrls()
  }, [messages, session, supabase])

  // vastaspoole profiil
  useEffect(() => {
    if (!userId) {
      setRecipientInfo(null)
      return
    }

    const loadRecipientInfo = async () => {
      setLoading(true)
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
      setLoading(false)
    }

    loadRecipientInfo()
  }, [userId, supabase])

  // automaatne scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // realtime
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

  // sõnumi saatmine
  const handleSend = async ({
    text,
    image,
  }: {
    text: string
    image: File | null
  }) => {
    if (sending || (!text && !image) || !currentUserId || !userId) return

    setSending(true)

    try {
      let imageFileName: string | null = null

      if (image) {
        const fileExt = image.name.split('.').pop()
        const fileName = `${currentUserId}_${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(fileName, image)

        if (uploadError) {
          console.error('Pildi üleslaadimise viga:', uploadError.message)
          alert('Pildi üleslaadimine ebaõnnestus')
          setSending(false)
          return
        }

        imageFileName = fileName
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUserId,
          receiver_id: userId,
          content: text,
          image_url: imageFileName,
          created_at: new Date().toISOString(),
        })

      if (error) {
        console.error('Sõnumi saatmise viga:', error)
        alert('Sõnumi saatmine ebaõnnestus')
        setSending(false)
        return
      }
      // realtime hoiab sõnumid ise sünkroonis
    } catch (err) {
      console.error('Tundmatu viga sõnumi saatmisel:', err)
      alert('Sõnumi saatmine ebaõnnestus')
    } finally {
      setSending(false)
    }
  }

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const firstInitial = firstName ? firstName[0].toUpperCase() : ''
    const lastInitial = lastName ? lastName[0].toUpperCase() : ''
    return firstInitial + lastInitial
  }

  return (
    <div className="flex flex-col flex-1 p-4 h-screen">
      <div className="flex items-center border-b p-2 mb-2">
        {loading ? (
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
        ) : recipientInfo?.avatar_url ? (
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
          {loading ? (
            <span className="bg-gray-200 w-24 h-4 rounded animate-pulse" />
          ) : (
            <>
              {recipientInfo?.first_name || ''} {recipientInfo?.surname || ''}
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto border rounded p-2 flex flex-col">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">Alusta vestlust selle kasutajaga</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 my-2 rounded max-w-[70%] flex flex-col ${
                msg.sender_id === currentUserId ? 'bg-green-100 ml-auto' : 'bg-gray-200 mr-auto'
              }`}
            >
              <div className="font-semibold mb-1 text-sm text-gray-700">
                {msg.sender_id === currentUserId ? 'Sina' : `${recipientInfo?.first_name || 'Kasutaja'}`}
              </div>
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.image_url && imageUrls[msg.id] && (
                <div className="relative mt-2 w-full h-48 rounded overflow-hidden">
                  <Image
                    src={imageUrls[msg.id]}
                    alt="Sõnumi pilt"
                    fill
                    style={{ objectFit: 'contain' }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
              <div className="text-xs text-gray-500 text-right mt-1">
                {new Date(msg.created_at).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSend={handleSend} sending={sending} />
    </div>
  )
}
