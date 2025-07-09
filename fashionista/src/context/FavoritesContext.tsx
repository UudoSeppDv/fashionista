

import React, { createContext, useContext, useState, ReactNode } from 'react'
import useAuthUserId from "../hooks/useAuthUserId";
import type { Database } from '..../../../types/supabase' 
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'


type FavoritesContextType = {
  favorites: Set<string> // Set of product IDs
  toggleFavorite: (id: string) => Promise<void>
  isLoading: boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)




export function FavoritesProvider({ children }: { children: ReactNode }) {
  const userId = useAuthUserId()
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
const supabase = createClientComponentClient<Database>();
  // Lae lemmikud kasutaja ID järgi supabase’ist
  React.useEffect(() => {
    if (!userId) {
      setFavorites(new Set())
      return
    }

    const fetchFavorites = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', userId)

      if (error) {
        console.error('Favoriidi laadimise viga:', error)
      } else if (data) {
        const favSet = new Set(data.map((item) => item.product_id))
        setFavorites(favSet)
      }
      setIsLoading(false)
    }

    fetchFavorites()
  }, [userId])

  const toggleFavorite = async (id: string) => {
    if (!userId) {
      alert('Pead olema sisse logitud, et lemmikuks lisada.')
      return
    }

    setIsLoading(true)

    if (favorites.has(id)) {
      // eemalda lemmikust
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', id)

      if (error) {
        console.error('Favoriidi eemaldamise viga:', error)
      } else {
        setFavorites((prev) => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
      }
    } else {
      // lisa lemmikuks
      const { error } = await supabase.from('favorites').insert([
        {
          user_id: userId,
          product_id: id,
        },
      ])

      if (error) {
        console.error('Favoriidi lisamise viga:', error)
      } else {
        setFavorites((prev) => new Set(prev).add(id))
      }
    }

    setIsLoading(false)
  }

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isLoading }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
