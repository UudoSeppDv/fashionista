import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '../../types/supabase'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)
import { ContactType } from '../../types/contact'



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
}

export default function ChatList({ selectedUserId, onSelectUser }: Props) {
  const supabase = createClientComponentClient<Database>()
  const [contacts, setContacts] = useState<Contact[]>([])

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

    const { data, error } = await supabase
      .from('user_contacts_detailed')
      .select('contact_id, first_name, surname, avatar_url, last_message_text, last_message_timestamp')

    if (error) {
      console.error(error)
      return
    }

    if (data) {
      setContacts(
        data
          .filter((c) => c.contact_id !== myId)
          .map((c) => ({
            id: c.contact_id,
            first_name: c.first_name,
            surname: c.surname,
            avatar_url: c.avatar_url,
            last_message_text: c.last_message_text,
            last_message_timestamp: c.last_message_timestamp,
          }))
      )
    }
  }

  loadContacts()

  // Subscribe to changes in 'messages' table
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
        loadContacts() // Reload contacts when message is inserted/updated
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [supabase])

  return (
    
   <div className="w-1/3 h-full border-gray-600 border-r border-t overflow-y-auto font-montserrat">
      <div className="flex items-center border-gray-600 border-b py-5.5 pl-4">
        <h2 className="font-semibold text-lg">Messages</h2>
      </div>

      {contacts.map((contact) => {
        const timeAgo = contact.last_message_timestamp
          ? dayjs(contact.last_message_timestamp).fromNow()
          : null

        return (
          <div
            key={`${contact.id}-${contact.last_message_timestamp ?? ''}`}
            onClick={() => onSelectUser(contact.id)}
            className={`p-3 border-b border-gray-600 cursor-pointer hover:bg-pink-50 ${
              contact.id === selectedUserId ? 'bg-pink-200' : ''
            }`}
          >
            <div className="flex gap-3">
              {contact.avatar_url ? (
                <img src={contact.avatar_url} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-pink-400 text-white flex items-center justify-center font-semibold">
  {(contact.first_name?.[0]?.toUpperCase() ?? '') + (contact.surname?.[0]?.toUpperCase() ?? '') || '?'}
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
