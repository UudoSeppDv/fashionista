'use client'

import { useEffect, useState } from 'react'
import ProductCard from '@/components/ui/ProductCard'
import { supabase } from '../../../lib/supabaseClient'

interface Product {
  id: string
  brand: string
  price: number
  images: string[]
}

interface Props {
  favoritesUpdatedAt: number
  onFavoritesChange: () => void
}

export default function SectionFeaturedProducts({
  favoritesUpdatedAt
}: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('public_products')
        .select('id, brand, price, images')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        console.error(error)
        setError('Andmete laadimine ebaõnnestus.')
      } else if (data) {
        const cleanData: Product[] = (data || [])
          .filter(item => item.id !== null)
          .map(item => ({
            id: item.id as string,
            brand: item.brand ?? '',
            price: item.price !== null ? Number(item.price) : 0,
            images: item.images ?? [],
          }))
        setProducts(cleanData)
        setError(null)
      }
      setLoading(false)
    }

    fetchProducts()
  }, [favoritesUpdatedAt])

  return (
    <section className="border-b w-full py-25 ">
      <h3 className="text-2xl font-bold mb-6 ml-10 md:ml-20">Parimad valikud sulle</h3>

      {loading ? (
        <p>Laadimine...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {/* Suured ekraanid: grid */}
          <div
            className="hidden md:grid  px-[5rem] gap-[6px]"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            }}
          >
            {products.map(product => (
              <ProductCard
                key={product.id}
                id={product.id}
                brand={product.brand}
                price={product.price}
                images={product.images}
              />
            ))}
          </div>

          {/* Väiksed ekraanid: slider */}
          <div className="md:hidden mx-10 flex overflow-x-auto gap-4 px-0 snap-x snap-mandatory">
            {products.map(product => (
              <div key={product.id} className="flex-shrink-0 w-[250px] snap-start">
                <ProductCard
                  id={product.id}
                  brand={product.brand}
                  price={product.price}
                  images={product.images}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
