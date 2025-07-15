'use client'

import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import MessageInput from './MessageInput'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabaseClient'
import type { Database } from '../../types/supabase' 

type Props = {
  userId: string | null
}

export default function ChatWindow({ userId }: Props) {
  
  const [session, setSession] = useState<Session | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<
    Database['public']['Tables']['messages']['Row'][]
  >([])
  const [sending, setSending] = useState(false)
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(false)
  const [openImage, setOpenImage] = useState<string | null>(null);

  const [recipientInfo, setRecipientInfo] = useState<{
    first_name: string | null
    surname: string | null
    avatar_url: string | null
  } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

 


  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setCurrentUserId(data.session?.user.id || null)
    }
    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setCurrentUserId(session?.user.id || null)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

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
      
    }

    loadMessages()
  }, [currentUserId, userId])

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
  }, [messages, session])

useEffect(() => {
  const container = messagesContainerRef.current;
  if (!container) return;

  // Võta timeout, et lasta DOM-il piltide laetamisel kohaneda
  const timeout = setTimeout(() => {
    container.scrollTop = container.scrollHeight;
  }, 100); // 100 ms võib olla piisav

  return () => clearTimeout(timeout);
}, [messages]);


  const [currentUserInfo, setCurrentUserInfo] = useState<{
  first_name: string | null
  surname: string | null
  avatar_url: string | null
} | null>(null)

useEffect(() => {
  if (!currentUserId) return

  const loadCurrentUserInfo = async () => {
    const { data, error } = await supabase
      .from('public_users')
      .select('first_name, surname, avatar_url')
      .eq('id', currentUserId)
      .single()

    if (error) {
      console.error('Error loading current user info:', error)
      setCurrentUserInfo(null)
    } else {
      setCurrentUserInfo(data)
    }
  }

  loadCurrentUserInfo()
}, [currentUserId])


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
  }, [userId])



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
  }, [currentUserId, userId])

const handleSend = async ({
  text,
  image,
}: {
  text: string
  image: File | null
}) => {
  if (sending || (!text && !image) || !userId) return

  setSending(true)

  try {
    // Saa aktiivne kasutaja Supabase auth kaudu
    const { data: userData, error: authError } = await supabase.auth.getUser()
    if (authError || !userData?.user?.id) {
      console.error('Auth viga:', authError)
      alert('Sisselogimine on vajalik sõnumi saatmiseks')
      setSending(false)
      return
    }

    const currentUserId = userData.user.id

    // Kontrolli, kas kontakt juba on olemas
    const { data: existingContact, error: contactCheckError } = await supabase
      .from('user_contacts')
      .select('*')
      .eq('user_id', currentUserId)
      .eq('contact_id', userId)
      .single()

    // Kui kontakti pole, lisa see
    if (!existingContact && contactCheckError?.code === 'PGRST116') {
      const { error: insertContactError } = await supabase
        .from('user_contacts')
        .insert({
          user_id: currentUserId,
          contact_id: userId,
        })

      if (insertContactError) {
        console.error('Kontakti lisamise viga:', insertContactError)
        alert('Kontakti lisamine ebaõnnestus')
        setSending(false)
        return
      }
    } else if (contactCheckError && contactCheckError.code !== 'PGRST116') {
      console.error('Kontakti kontrolli viga:', contactCheckError)
      alert('Kontakti kontroll ebaõnnestus')
      setSending(false)
      return
    }

    // Kui pilt olemas, lae üles
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

    // Sõnumi saatmine
    const { error } = await supabase.from('messages').insert({
      sender_id: currentUserId,
      receiver_id: userId,
      content: text,
      image_url: imageFileName,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Sõnumi saatmise viga:', error)
      alert('Sõnumi saatmine ebaõnnestus')
    }
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
    
    <div className="flex border-gray-600 border-t flex-col flex-1 font-montserrat ">
      
      <div className="flex items-center border-gray-600 border-b p-4">
        {loading ? (
          <div className="w-10 h-10 rounded-full bg-pink-200 animate-pulse" />
        ) : recipientInfo?.avatar_url ? (
          <Image
            src={recipientInfo.avatar_url}
            alt="Kontopilt"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-pink-400 text-white flex items-center justify-center font-semibold">
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

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-2 flex flex-col">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">Alusta vestlust selle kasutajaga</div>
        ) : (
    messages.map((msg, index) => {
      const isCurrentUser = msg.sender_id === currentUserId;

      const avatarUrl = isCurrentUser
  ? currentUserInfo?.avatar_url || null
  : recipientInfo?.avatar_url

const firstName = isCurrentUser
  ? currentUserInfo?.first_name || ''
  : recipientInfo?.first_name || ''

const surname = isCurrentUser
  ? currentUserInfo?.surname || ''
  : recipientInfo?.surname || ''

      // Kuvame avatari ainult siis, kui see on esimene sõnum või eelmine sõnum oli teisest saatjast
      const showAvatar =
        index === 0 || messages[index - 1].sender_id !== msg.sender_id;
            return (
              <div
              
                key={msg.id}
                className={`p-3 max-w-[70%] flex items-end ${
                  isCurrentUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                     {/* Avatar ainult kui showAvatar === true */}
      {showAvatar ? (
        <div className="w-10 h-10 rounded-full bg-pink-400 text-white flex items-center justify-center font-semibold flex-shrink-0">
  {avatarUrl ? (
    <Image
      src={avatarUrl}
      alt="Avatar"
      width={40}
      height={40}
      className="rounded-full object-cover"
    />
  ) : (
    ((firstName?.[0]?.toUpperCase() ?? '') + (surname?.[0]?.toUpperCase() ?? '')) || '?'
  )}
</div>

      ) : (
        // Kui avatarit ei kuvata, siis lisame sama laiusega tühja ruumi, et sõnumid oleksid joondatud
        <div className="w-10 h-10 flex-shrink-0" />
      )}

      {/* Sõnumi kast */}
      <div
        className={`p-2 ml-2 mr-2 border ${
          isCurrentUser
            ? 'bg-pink-100 border-gray-900 ml-2'
            : 'bg-gray-900 text-white mr-2'
        } max-w-[calc(100%-56px)]`}
      >
        <div className="whitespace-pre-wrap">{msg.content}</div>
        {msg.image_url && imageUrls[msg.id] && (
  <>
    <Image
  src={imageUrls[msg.id]}
  alt="Sõnumi pilt"
  width={300}   // pane sobiv laius ja kõrgus vastavalt
  height={192}  // hoia proportsioonid (või arvuta vastavalt)
  className="mt-2 rounded cursor-pointer"
  style={{ objectFit: 'contain', maxHeight: '12rem' }}
  onClick={() => setOpenImage(imageUrls[msg.id])}
/>


    {openImage && (
      <div
        className="fixed inset-0 z-50 bg-opacity-80 flex items-center justify-center"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
        onClick={() => setOpenImage(null)} // võimalus sulgeda klikkides taustal
      >
        <button
          className="absolute top-4 right-4 text-white text-3xl font-bold"
          onClick={(e) => {
            e.stopPropagation(); // et ei sulgeks kui klikid nupul
            setOpenImage(null);
          }}
        >
          &times;
        </button>
        <div className="relative w-[90vw] h-[80vh] max-w-4xl">
          <Image
            src={openImage}
            alt="Avatud pilt"
            fill
            style={{ objectFit: 'contain' }}
            sizes="100vw"
          />
        </div>
      </div>
    )}
  </>
)}

      </div>
    </div>
  )
})
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSend={handleSend} sending={sending} />
    </div>
  )
}
