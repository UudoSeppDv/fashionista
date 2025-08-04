'use client'

import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import MessageInput from './MessageInput'
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useSendMessage } from './hooks/useSendMessage'
import { useBlockedStatus } from './hooks/useBlockedStatus'
import { useMarkNotificationsRead } from './hooks/useMarkNotificationsRead'
import { useMarkMessagesAsRead } from './hooks/useMarkMessagesAsRead'
import { useCurrentUser } from './hooks/useCurrentUser'
import { useMessageChannel } from './hooks/useMessageChannel'
import { useSignedImageUrls } from './hooks/useSignedImageUrls'
import { useLoadMessages } from './hooks/useLoadMessages'

type Props = {
  userId: string | null
}

export default function ChatWindow({ userId }: Props) {
  const { session, currentUserId, currentUserInfo } = useCurrentUser()
  const isBlocked = useBlockedStatus(currentUserId, userId)
  const router = useRouter()
  

  // Kasutame hooki sõnumite laadimiseks
  const { messages, loadMessages, loadingMore, messagesContainerRef } = useLoadMessages({
    currentUserId,
    userId,
  })

  // Hoidame sõnumid ka refis, et saaks alati viimaseid sõnumeid kasutada
  const messagesRef = useRef(messages)
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  // Funktsioon, mis lisab ainult unikaalsed sõnumid, et vältida duplekte
  const addNewMessages = (newMsgs: typeof messages) => {
    const existingIds = new Set(messagesRef.current.map((m) => m.id))
    const uniqueNewMsgs = newMsgs.filter((m) => !existingIds.has(m.id))

    if (uniqueNewMsgs.length > 0) {
      loadMessages({ prepend: false, newMessages: uniqueNewMsgs })
    }
  }

  const [loading, setLoading] = useState(false)
  const [openImage, setOpenImage] = useState<string | null>(null)
  const imageUrls = useSignedImageUrls(messages, session)

  const [recipientInfo, setRecipientInfo] = useState<{
    first_name: string | null
    surname: string | null
    avatar_url: string | null
    page_url: string | null
  } | null>(null)

  useMarkNotificationsRead(currentUserId, userId)
  useMarkMessagesAsRead({
    messages,
    currentUserId,
    userId,
    readMessages: new Set(), // vajadusel halda eraldi readMessages state
    setReadMessages: () => {},
  })

  useMessageChannel({
    userId,
    onNewMessage: (newMsg) => {
      addNewMessages([newMsg])
    },
  })

  const { sendMessage, sending } = useSendMessage({
    userId: userId as string,
    onNewMessage: (newMsg) => {
      addNewMessages([newMsg])
    },
  })

  useEffect(() => {
    if (!userId) {
      setRecipientInfo(null)
      return
    }

    const loadRecipientInfo = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('public_users')
        .select('first_name, surname, avatar_url, page_url')
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

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const firstInitial = firstName ? firstName[0].toUpperCase() : ''
    const lastInitial = lastName ? lastName[0].toUpperCase() : ''
    return firstInitial + lastInitial
  }

  if (!userId) {
    return <>Palun logi sisse</>
  }

  return (
    <div className="flex border-gray-600 border-t flex-col flex-1 font-montserrat">
      <div className="flex items-center border-gray-600 border-b p-4">
        {loading ? (
          <div
            onClick={() => recipientInfo?.page_url && router.push(recipientInfo.page_url)}
            className="w-10 h-10 rounded-full bg-pink-200 animate-pulse cursor-pointer"
          />
        ) : recipientInfo?.avatar_url ? (
          <div
            onClick={() => recipientInfo?.page_url && router.push(recipientInfo.page_url)}
            className="w-10 h-10 rounded-full overflow-hidden cursor-pointer"
          >
            <Image
              src={recipientInfo.avatar_url}
              alt="Kontopilt"
              className="object-cover w-full h-full"
              width={40}
              height={40}
            />
          </div>
        ) : (
          <div
            onClick={() => recipientInfo?.page_url && router.push(`/kasutaja/${recipientInfo.page_url}`)}
            className="w-10 h-10 rounded-full bg-pink-400 text-white flex items-center justify-center font-semibold cursor-pointer"
          >
            {getInitials(recipientInfo?.first_name || '', recipientInfo?.surname || '')}
          </div>
        )}

        <div
          onClick={() => recipientInfo?.page_url && router.push(`/kasutaja/${recipientInfo.page_url}`)}
          className="cursor-pointer ml-3 font-semibold text-lg"
        >
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
        {loadingMore && (
          <div className="text-center text-gray-500 py-2">Laen vanemaid sõnumeid...</div>
        )}
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">Alusta vestlust selle kasutajaga</div>
        ) : (
          messages.map((msg, index) => {
            const isCurrentUser = msg.sender_id === currentUserId
            const avatarUrl = isCurrentUser
              ? currentUserInfo?.avatar_url || null
              : recipientInfo?.avatar_url
            const firstName = isCurrentUser
              ? currentUserInfo?.first_name || ''
              : recipientInfo?.first_name || ''
            const surname = isCurrentUser
              ? currentUserInfo?.surname || ''
              : recipientInfo?.surname || ''
            const showAvatar = index === 0 || messages[index - 1].sender_id !== msg.sender_id

            return (
              <div
                key={msg.id}
                
                className={`p-3 max-w-[70%] flex items-end ${
                  isCurrentUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {showAvatar ? (
                  <div className="w-10 h-10 rounded-full bg-pink-400 text-white flex items-center justify-center font-semibold flex-shrink-0">
                    {avatarUrl ? (
                     <div className="relative w-10 h-10">
  <Image
    src={avatarUrl}
    alt="Avatar"
    fill
    sizes="40px"
    className="rounded-full object-cover"
  />
</div>



                    ) : (
                      ((firstName?.[0]?.toUpperCase() ?? '') + (surname?.[0]?.toUpperCase() ?? '')) || '?'
                    )}
                  </div>
                ) : (
                  <div className="w-10 h-10 flex-shrink-0" />
                )}

                <div
  className={`p-2 ml-2 mr-2 border ${
  msg.image_url
    ? 'bg-transparent border-none'
    : isCurrentUser
      ? 'bg-pink-100 border-gray-900 ml-2'
      : 'bg-gray-900 text-white mr-2'
} max-w-[calc(100%-56px)]`}

>

                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {msg.image_url && imageUrls[msg.id] && (
                    <>
                     <div
  className="relative mt-2 cursor-pointer rounded"
  style={{ maxWidth: 300, maxHeight: '12rem', width: 'auto', height: 'auto' }}
  onClick={() => setOpenImage(imageUrls[msg.id])}
>
<Image
  src={imageUrls[msg.id]}
  alt="Sõnumi pilt"
  width={300}
  height={300} // pane kõrgus sama mis laius, pilt skaleeritakse automaatselt proportsioonis
  unoptimized
  style={{
    objectFit: 'contain',
    maxHeight: '12rem',
  }}
  className="rounded cursor-pointer mt-2"
  onClick={() => setOpenImage(imageUrls[msg.id])}
/>


</div>




                      {openImage && (
                        <div
                          className="fixed inset-0 z-50 bg-opacity-80 flex items-center justify-center"
                          style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                          onClick={() => setOpenImage(null)}
                        >
                          <button
                            className="absolute top-4 right-4 text-white text-3xl font-bold"
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenImage(null)
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
                              priority
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
      </div>

      {isBlocked ? (
        <div className="p-4 text-center text-red-600 font-semibold">
          Kasutaja on sind blokeerinud. Sa ei saa sõnumeid saata.
        </div>
      ) : (
        <MessageInput onSend={sendMessage} sending={sending} />
      )}
    </div>
  )
}
