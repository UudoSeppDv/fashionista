import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '../../types/supabase'

type Props = {
  selectedUserId: string | null
  onSelectUser: (id: string) => void
}

export default function ChatList({ selectedUserId, onSelectUser }: Props) {
  const supabase = createClientComponentClient<Database>()
  const [contacts, setContacts] = useState<
    { id: string; first_name: string | null; surname: string | null; avatar_url: string | null }[]
  >([])
  const [sessionUserId, setSessionUserId] = useState<string | null>(null)

  useEffect(() => {
    const getSessionUser = async () => {
      const { data } = await supabase.auth.getUser()
      setSessionUserId(data?.user?.id ?? null)
    }
    getSessionUser()
  }, [supabase])

  useEffect(() => {
    // lae kõik unikaalsed inimesed, kellega on vahetatud sõnumeid
    const loadContacts = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('sender_id, receiver_id')

      if (error) {
        console.error(error)
        return
      }

      const userIds = new Set<string>()
      data?.forEach((msg) => {
        userIds.add(msg.sender_id)
        userIds.add(msg.receiver_id)
      })

      // eemalda iseennast
      if (sessionUserId) {
        userIds.delete(sessionUserId)
      }

      const ids = Array.from(userIds)

      // lae public_users tabelist nimed
      const { data: users, error: usersError } = await supabase
        .from('public_users')
        .select('id, first_name, surname, avatar_url')
        .in('id', ids)

      if (usersError) {
        console.error(usersError)
        return
      }

      if (users) {
        setContacts(users)
      }
    }

    if (sessionUserId) {
      loadContacts()
    }
  }, [supabase, sessionUserId])

  return (
    <div className="w-1/3 border-r overflow-y-auto">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          onClick={() => onSelectUser(contact.id)}
          className={`p-2 cursor-pointer hover:bg-gray-100 ${
            contact.id === selectedUserId ? 'bg-gray-200' : ''
          }`}
        >
          <div className="flex items-center gap-2">
            {contact.avatar_url ? (
              <img src={contact.avatar_url} className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center">
                {contact.first_name?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
            <span>{contact.first_name} {contact.surname}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
