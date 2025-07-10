import { useState, useEffect } from 'react'
import type { Database } from '../types/supabase'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import useSession from '../src/hooks/useSession'
import useAuthEmail from '../src/hooks/useAuthEmail' // ✅ Lisa see

type PrivateData = {
  phone: string | null
  email: string | null
  iban: string | null
  first_name: string | null
  surname: string | null
  location: string | null
  avatar_url: string | null
}

export function usePrivateData() {
  const session = useSession()
  const email = useAuthEmail()
  const [privateData, setPrivateData] = useState<PrivateData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  const fetchData = async () => {
    if (!session) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const userId = session.user.id

      const { data: privateDataRow, error: privateError } = await supabase
        .from('user_private_data')
        .select('phone, iban')
        .eq('user_id', userId)
        .maybeSingle()

      if (privateError) throw privateError

      const { data: publicUserData, error: publicUserError } = await supabase
        .from('public_users')
        .select('first_name, surname, location, avatar_url')
        .eq('id', userId)
        .maybeSingle()

      if (publicUserError) throw publicUserError

      setPrivateData({
        phone: privateDataRow?.phone ?? null,
        iban: privateDataRow?.iban ?? null,
        email: email ?? null,
        first_name: publicUserData?.first_name ?? null,
        surname: publicUserData?.surname ?? null,
        location: publicUserData?.location ?? null,
        avatar_url: publicUserData?.avatar_url ?? null,
      })
    } catch (error) {
      console.error(error)
      setPrivateData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [session, email])

  return { privateData, loading, refresh: fetchData }
}
