'use client'

import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { supabase } from '../../lib/supabase'
import { FavoritesProvider } from '@/context/FavoritesContext'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <FavoritesProvider>
        {children}
      </FavoritesProvider>
    </SessionContextProvider>
  )
}
