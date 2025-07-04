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

  useEffect(() => {
    const loadContacts = async () => {
      const { data, error } = await supabase
        .from('user_contacts_detailed') // VIEW
        .select('contact_id, first_name, surname, avatar_url')

      if (error) {
        console.error(error)
        return
      }

      if (data) {
        setContacts(
          data.map((c) => ({
            id: c.contact_id,
            first_name: c.first_name,
            surname: c.surname,
            avatar_url: c.avatar_url,
          }))
        )
      }
    }

    loadContacts()
  }, [supabase])

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
