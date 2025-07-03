'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { mockListings, Listing } from '@/data/mockListings'

interface SearchBarProps {
  searchQuery: string
  setSearchQuery: (val: string) => void
  onSelectSuggestion?: (val: string) => void
}

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  onSelectSuggestion,
}: SearchBarProps) {
  const [suggestions, setSuggestions] = useState<Array<Partial<Listing>>>([])
  const router = useRouter()

 useEffect(() => {
  if (!searchQuery || searchQuery.trim() === '') {
    setSuggestions([])
    return
  }

  const q = searchQuery.toLowerCase()

  const matchedListings = mockListings.filter((item) =>
    [item.brand, item.category, item.filter, item.size]
      .filter(Boolean) // eemaldab undefined
      .some((val) => val!.toLowerCase().includes(q))
  )

  const matchedCategories = Array.from(
    new Set(
      mockListings
        .filter((item) =>
          [item.category, item.filter].some((val) => val.toLowerCase().includes(q))
        )
        .map((item) => item.category)
    )
  ).map((cat) => ({ brand: cat }))

  const combined = [
    ...matchedListings.map(({ id, brand, category }) => ({ id, brand, category })),
    ...matchedCategories,
  ]

  const unique = Array.from(
    new Map(combined.map((item) => [item.brand, item])).values()
  ).slice(0, 5)

  setSuggestions(unique)
}, [searchQuery])


  function handleSelect(brand: string, category?: string) {
  setSearchQuery(brand)
  setSuggestions([])
  if (onSelectSuggestion) {
    onSelectSuggestion(brand)
  }

  if (!category) {
    const slug = brand.toLowerCase().replace(/\s+/g, '-')
    router.push(`/category/${slug}`)
  } else {
    // soovi korral: router.push(`/product/${id}`)
  }
}


  return (
    <div className="relative w-full">
      <span className="absolute left-3 top-2.5 text-gray-400">
        <MagnifyingGlassIcon className="w-4 h-4" />
      </span>
      <input
        type="text"
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
{Array.isArray(suggestions) && suggestions.length > 0 && (
  <ul className="absolute z-50 top-full left-0 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
    {suggestions.map((item, index) =>
      item.brand ? (
        <li
          key={`${item.id ?? 'no-id'}-${item.brand}-${index}`}
          className="px-4 py-2 cursor-pointer hover:bg-purple-100"
          onClick={async () => await handleSelect(item.brand!, item.category)}
        >
          <span className="font-semibold">{item.brand}</span>
          {item.category && (
            <span className="ml-2 text-gray-500 italic">({item.category})</span>
          )}
        </li>
      ) : null
    )}
  </ul>
)}


    
    </div>
  )
}
