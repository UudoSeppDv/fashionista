'use client'

import { useEffect, useState } from 'react'
import ProductCard from '@/components/ProductCard'
import { supabase } from '../../lib/supabase'

interface Product {
  id: number
  brand: string
  price: number
  images: string[]
  created_at: string
}

export default function SectionRecentlyViewed() {
  const [latestProduct, setLatestProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLatestProduct = async () => {
      const { data, error } = await supabase
        .from<'products', Product>('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        setError('Toote laadimine ebaõnnestus.')
        console.error(error)
      } else {
        setLatestProduct(data?.[0] || null)
      }

      setLoading(false)
    }

    fetchLatestProduct()
  }, [])

  return (
    <section className="border w-full px-[5rem] py-25">
      <h3 className="text-2xl font-bold mb-6">Viimati vaadatud</h3>

      {loading ? (
        <p>Laadimine...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : latestProduct ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ProductCard
  key={latestProduct.id}
  id={latestProduct.id.toString()}  // teisendame number stringiks
  brand={latestProduct.brand}
  price={latestProduct.price}
  images={latestProduct.images || []}
/>

          </div>
        </div>
      ) : (
        <p>Ühtegi toodet ei leitud.</p>
      )}
    </section>
  )
}
