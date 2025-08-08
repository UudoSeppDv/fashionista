import React, { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useCurrentUser } from './hooks/useCurrentUser'
import { useBlockedStatus } from './hooks/useBlockedStatus'
import { useMarkNotificationsRead } from './hooks/useMarkNotificationsRead'
import { useMarkMessagesAsRead } from './hooks/useMarkMessagesAsRead'
import { useMessageChannel } from './hooks/useMessageChannel'
import { useSignedImageUrls } from './hooks/useSignedImageUrls'
import { useLoadMessages } from './hooks/useLoadMessages'
import { useSendMessage } from './hooks/useSendMessage'
import Image from 'next/image'
import MessageInput from './MessageInput'
import { RecipientHeader } from './RecipientHeader'
import { MessageItem } from './MessageItem'

type Props = { userId: string | null }

export default function ChatWindow({ userId }: Props) {
  const { session, currentUserId, currentUserInfo } = useCurrentUser()
  const isBlocked = useBlockedStatus(currentUserId, userId)


  const { messages, addNewMessages, messagesContainerRef, loadingMore } = useLoadMessages({ currentUserId, userId })

  // Hoidame readMessages seisu, et kasutada useMarkMessagesAsRead hooks õigesti
  const [readMessages, setReadMessages] = useState<Set<number>>(new Set())

  useMarkNotificationsRead(currentUserId, userId)
  useMarkMessagesAsRead({
    messages,
    currentUserId,
    userId,
    readMessages,
    setReadMessages,
  })

  const [loading, setLoading] = useState(false)
  const [openImage, setOpenImage] = useState<string | null>(null)

  const [recipientInfo, setRecipientInfo] = useState<{
    first_name: string | null
    surname: string | null
    avatar_url: string | null
    page_url: string | null
  } | null>(null)

  const { isConnected } = useMessageChannel({
    userId,
    onNewMessage: (newMsg) => addNewMessages([newMsg]),
  })

  const { sendMessage, sending } = useSendMessage({
    userId: userId as string,
    onNewMessage: (newMsg) => addNewMessages([newMsg]),
  })

  useEffect(() => {
    if (!userId) {
      setRecipientInfo(null)
      return
    }

    const loadRecipientInfo = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('public_users')
          .select('first_name, surname, avatar_url, page_url')
          .eq('id', userId)
          .single()

        if (error) throw error
        setRecipientInfo(data)
      } catch (error) {
        console.error('Error loading recipient info:', error)
        setRecipientInfo(null)
      } finally {
        setLoading(false)
      }
    }

    loadRecipientInfo()
  }, [userId])

  const imageUrls = useSignedImageUrls(messages, session)

  if (!userId) return <>Palun logi sisse</>

  if (!isConnected)
    return (
      <div className="flex items-center justify-center flex-1 h-full bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500 mx-auto mb-4" />
          <div className="text-sm text-gray-500">Ühendab vestluskanaliga...</div>
        </div>
      </div>
    )

  return (
    <div className="flex border-gray-600 border-t flex-col flex-1 font-montserrat">
      <RecipientHeader recipientInfo={recipientInfo} loading={loading} />

      <div
        ref={messagesContainerRef}  // <- SIIN on oluline ref lisada
        className="flex-1 overflow-y-auto p-2 flex flex-col"
      >
        {loadingMore && (
          <div className="text-center text-gray-500 py-2">Laen vanemaid sõnumeid...</div>
        )}

        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            Alusta vestlust selle kasutajaga
          </div>
        ) : (
          messages.map((msg, index) => {
            const isCurrentUser = msg.sender_id === currentUserId
            const showAvatar =
              index === 0 || messages[index - 1].sender_id !== msg.sender_id

            return (

              
              <MessageItem
                key={msg.id}
                msg={msg}
                isCurrentUser={isCurrentUser}
                currentUserInfo={currentUserInfo ?? { first_name: '', surname: '', avatar_url: '' }}
                recipientInfo={recipientInfo ?? { first_name: '', surname: '', avatar_url: '' }}
                showAvatar={showAvatar}
                imageUrls={imageUrls}
                onOpenImage={setOpenImage}
              />
            )
          })
        )}
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
          <Image
  src={openImage}
  alt="Suur pilt"
  width={0} // 0 tähendab, et sa ei määra täpset laiust
  height={0}
  sizes="90vw"
  style={{
    maxHeight: '90vh',
    maxWidth: '90vw',
    width: 'auto',
    height: 'auto',
    display: 'block',
    margin: '0 auto',
    objectFit: 'contain',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
  }}
  unoptimized // Kui pildid on välisest allikast ja sa EI taha optimeerimist
/>

        </div>
      )}

      {!isBlocked && userId && (
        <MessageInput
  sending={sending}
  onSend={sendMessage}
/>

      )}

      {isBlocked && (
        <div className="p-4 text-center text-red-600 bg-red-100">
          Sa ei saa selle kasutajaga suhelda, kuna oled blokeeritud või oled blokeerinud selle kasutaja.
        </div>
      )}
    </div>
  )
}
