import { useEffect, useState } from 'react'
import type { Database } from '../../types/supabase'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function useAuthEmail() {
  const [email, setEmail] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setEmail(data.user?.email ?? null)
    }

    fetchUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null)
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  return email
}
