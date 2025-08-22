'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../../lib/supabaseClient'

interface SearchBarProps {
  searchQuery: string
  setSearchQuery: (val: string) => void
  onSelectSuggestion?: (val: string) => void
}

type ProductRow = {
  id: string
  brand: string | null
  description: string | null
  filter: string | null
  category: string | null
  
}

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  onSelectSuggestion,
}: SearchBarProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      setSuggestions([])
      return
    }

    const fetchSuggestions = async () => {
      const q = searchQuery.toLowerCase()

      // Võta vajalikud väljad Supabasest
      const { data, error } = await supabase
        .from('public_products')
        .select('id, brand, description, filter, category')
        .limit(50) // väldi liiga suuri päringuid

      if (error) {
        console.error(error)
        return
      }

      if (!data) return

      // Tee suggestionid: otsi kõigist väljadest
      const matched: string[] = []

     data.forEach((item: ProductRow) => {
  const fields = [item.brand, item.description, item.filter, item.category]
  fields.forEach((val) => {
    if (val && val.toString().toLowerCase().includes(q)) {
      matched.push(val.toString())
    }
  })
})


      // Unikaalsed + esimesed 5
      const unique = Array.from(new Set(matched)).slice(0, 5)
      setSuggestions(unique)
    }

    fetchSuggestions()
  }, [searchQuery])

  function handleSelect(value: string) {
    setSearchQuery(value)
    setSuggestions([])
    if (onSelectSuggestion) {
      onSelectSuggestion(value)
    }
    router.push(`/category/${encodeURIComponent(value)}`)
  }

  return (
    <div className="relative w-full">
      <span className="absolute left-3 top-2.5 text-gray-400">
        <MagnifyingGlassIcon className="w-4 h-4" />
      </span>

      <input
        type="text"
        id="product-search"
        name="search"
        placeholder="Otsi toote või kategooria järgi"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        autoComplete="off"
        className="font-montserrat w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSelect(searchQuery)
          }
        }}
      />

      {suggestions.length > 0 && (
        <ul className="absolute z-50 top-full left-0 w-full bg-white border border-gray-300  mt-1 max-h-60 overflow-y-auto shadow-lg">
          {suggestions.map((val, index) => (
            <li
              key={`${val}-${index}`}
              className="px-4 py-2 cursor-pointer hover:bg-purple-100"
              onClick={() => handleSelect(val)}
            >
              {val}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
