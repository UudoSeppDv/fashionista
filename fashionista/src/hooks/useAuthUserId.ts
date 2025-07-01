import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function useAuthUserId() {
  const [userId, setUserId] = useState<string | null>(null)

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
