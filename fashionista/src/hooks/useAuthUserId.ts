import { useEffect, useState } from 'react'
import type { Database } from '..../../../types/supabase' 
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function useAuthUserId() {
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUserId(data.user?.id ?? null)
    }

    fetchUser()

    // Subscribe auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null)
    })

    // Cleanup function
    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  return userId
}
