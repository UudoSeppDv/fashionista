'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function SectionRecentlyAdded() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })  // uusimad ees
        .limit(5)

      if (error) {
        setError('Andmete laadimine ebaõnnestus.')
        console.error(error)
      } else {
        setProducts(data)
      }
      setLoading(false)
    }

    fetchProducts()
  }, [])

  if (loading) return <p>Laadimine...</p>
  if (error) return <p className="text-red-500">{error}</p>
  if (products.length === 0) return null

  const [first, ...rest] = products

  return (
    <section className="py-8">
      <h2 className="px-14 text-xl font-bold mb-4">Hiljuti lisatud</h2>

      <div className="flex flex-col md:flex-row gap-2 justify-center items-stretch">
        {/* Vasak suur pilt */}
        <div className="border border-gray-600 relative w-[713px] h-[922px]">
          <Image
            src={first.images?.[0] || '/placeholder.png'}
            alt={first.brand || 'Toode'}
            fill
            className="object-cover"
          />
        </div>

        {/* 2x2 ruudustik paremal */}
        <div className="grid grid-cols-2 grid-rows-2 gap-2 w-[713px] h-[926px]">
          {rest.map((item) => (
            <div key={item.id} className="relative w-[348px] h-[455px]">
              <Image
                src={item.images?.[0] || '/placeholder.png'}
                alt={item.brand || 'Toode'}
                fill
                className="object-cover border border-gray-600"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
