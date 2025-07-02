'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface Product {
  id: string
  brand: string
  images: string[]
  created_at: string
}

export default function SectionRecentlyAdded() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, brand, images, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        setError('Andmete laadimine ebaõnnestus.')
        console.error(error)
      } else if (data) {
        // Puhasta nullid, asenda stringid ja massiivid tühjadega
        const cleanData = (data as Product[]).map(item => ({
          id: item.id,
          brand: item.brand ?? '',
          images: item.images ?? [],
          created_at: item.created_at ?? '',
        }))
        setProducts(cleanData)
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
        <Link href={`/products/${first.id}`} className="border border-gray-600 relative w-[713px] h-[922px] block">
          <Image
            src={first.images?.[0] || '/placeholder.png'}
            alt={first.brand || 'Toode'}
            fill
            className="object-cover"
          />
        </Link>

        <div className="grid grid-cols-2 grid-rows-2 gap-2 w-[713px] h-[926px]">
          {rest.map((item) => (
            <Link
              key={item.id}
              href={`/products/${item.id}`}
              className="relative w-[348px] h-[455px] block border border-gray-600"
            >
              <Image
                src={item.images?.[0] || '/placeholder.png'}
                alt={item.brand || 'Toode'}
                fill
                className="object-cover"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
