import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)
import { ContactType } from '../../../types/contact'
import Image from 'next/image'

type Props = {
  contacts: ContactType[]
  selectedUserId: string | null
  onSelectUser: (id: string) => void
  className?: string
}

type Contact = {
  id: string
  first_name: string | null
  surname: string | null
  avatar_url: string | null
  last_message_text: string | null
  last_message_timestamp: string | null
  on_read: boolean | null
  last_message_sender_id?: string | null
}

export default function ChatList({ selectedUserId, onSelectUser }: Props) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [myId, setMyId] = useState<string | null>(null)

  useEffect(() => {
    const loadContacts = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error(userError)
        return
      }

      const myId = user?.id
      if (!myId) return
      setMyId(myId)

      const { data: contactsData, error: contactsError } = await supabase
        .from('user_contacts_detailed')
        .select(
          'contact_id, first_name, surname, avatar_url, last_message_text, last_message_timestamp, on_read'
        )

      if (contactsError) {
        console.error(contactsError)
        return
      }

      if (!contactsData) return

      const timestamps = contactsData
        .map((c) => c.last_message_timestamp)
        .filter((t): t is string => !!t)

      if (timestamps.length === 0) {
        setContacts(
          contactsData.map((c) => ({
            id: c.contact_id!,
            first_name: c.first_name ?? '',
            surname: c.surname ?? '',
            avatar_url: c.avatar_url ?? '',
            last_message_text: c.last_message_text ?? '',
            last_message_timestamp: c.last_message_timestamp ?? '',
            on_read: c.on_read ?? true,
            last_message_sender_id: null,
          }))
        )
        return
      }

      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('sender_id, created_at')
        .in('created_at', timestamps)

      if (messagesError) {
        console.error(messagesError)
        return
      }

      const contactsWithSenderId = contactsData.map((contact) => {
        const msg = messagesData?.find(
          (m) => m.created_at === contact.last_message_timestamp
        )
        return {
          id: contact.contact_id!,
          first_name: contact.first_name ?? '',
          surname: contact.surname ?? '',
          avatar_url: contact.avatar_url ?? '',
          last_message_text: contact.last_message_text ?? '',
          last_message_timestamp: contact.last_message_timestamp ?? '',
          on_read: contact.on_read ?? true,
          last_message_sender_id: msg?.sender_id ?? null,
        }
      })

      setContacts(contactsWithSenderId.filter((c) => c.id !== myId))
    }

    loadContacts()

    const channel = supabase
      .channel('messages-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log('Realtime message change:', payload)
          loadContacts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className=" h-full border-gray-600 border-r border-t overflow-y-auto font-montserrat">
      <div className="flex items-center border-gray-600 border-b py-5.5 pl-4">
        <h2 className="font-semibold text-lg">Messages</h2>
      </div>

      {contacts.map((contact) => {
        const timeAgo = contact.last_message_timestamp
          ? dayjs(contact.last_message_timestamp).fromNow()
          : null

        const isUnreadAndNotMyMessage =
          contact.on_read === false &&
          contact.last_message_sender_id !== undefined &&
          contact.last_message_sender_id !== null &&
          contact.last_message_sender_id !== myId

        return (
          <div
            key={`${contact.id}-${contact.last_message_timestamp ?? ''}`}
            onClick={() => onSelectUser(contact.id)}
            className={`p-3 border-b border-gray-600 cursor-pointer hover:bg-pink-50 ${
              contact.id === selectedUserId
                ? 'bg-pink-200'
                : isUnreadAndNotMyMessage
                ? 'bg-pink-100'
                : ''
            }`}
          >
            <div className="flex gap-3">
              {contact.avatar_url ? (
                <Image
                  alt="Avatar_URL"
                  src={contact.avatar_url}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-pink-400 text-white flex items-center justify-center font-semibold">
                  {(contact.first_name?.[0]?.toUpperCase() ?? '') +
                    (contact.surname?.[0]?.toUpperCase() ?? '') || '?'}
                </div>
              )}
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {contact.first_name} {contact.surname}
                  </span>
                  {timeAgo && (
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {timeAgo}
                    </span>
                  )}
                </div>
                {contact.last_message_text && (
                  <div className="text-sm text-gray-600 truncate">
                    {contact.last_message_text.length > 50
                      ? contact.last_message_text.slice(0, 50) + '...'
                      : contact.last_message_text}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
