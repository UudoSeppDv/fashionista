'use client'

import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { supabase } from '../../../lib/supabaseClient'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { AlertProvider } from "./AlertProvider";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionContextProvider supabaseClient={supabase}>
       <AlertProvider>
      <FavoritesProvider>
        {children}
      </FavoritesProvider>
      </AlertProvider>
    </SessionContextProvider>
  )
}
