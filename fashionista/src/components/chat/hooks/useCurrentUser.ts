import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabaseClient'
import type { Session } from '@supabase/supabase-js'

type UserInfo = {
  first_name: string | null
  surname: string | null
  avatar_url: string | null
}

export function useCurrentUser() {
  const [session, setSession] = useState<Session | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserInfo, setCurrentUserInfo] = useState<UserInfo | null>(null)

  // Get initial session + listen for auth changes
  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error.message)
        return
      }

      const currentSession = data.session
      setSession(currentSession)
      setCurrentUserId(currentSession?.user?.id || null)
    }

    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setCurrentUserId(session?.user?.id || null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Fetch user info from public_users once user ID is known
  useEffect(() => {
    if (!currentUserId) return

    const fetchUserInfo = async () => {
      const { data, error } = await supabase
        .from('public_users')
        .select('first_name, surname, avatar_url')
        .eq('id', currentUserId)
        .single()

      if (error) {
        console.error('Failed to fetch user info:', error.message)
        setCurrentUserInfo(null)
      } else {
        setCurrentUserInfo(data)
      }
    }

    fetchUserInfo()
  }, [currentUserId])

  return {
    session,
    currentUserId,
    currentUserInfo,
  }
}
