'use client'

import { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'  // <- lisa see import
import { supabase } from '../../lib/supabase'

export default function useSession() {
  const [session, setSession] = useState<Session | null | undefined>(undefined) // laadimine

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session) // paneme sessiooni või null
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return session
}
