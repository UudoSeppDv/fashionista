'use client'

import { useEffect, useState } from 'react'
import ProductCard from '@/components/ProductCard'
import { supabase } from '../../lib/supabase'


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
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        console.error(error)
        setError('Andmete laadimine ebaõnnestus.')
      } else {
        setProducts(data || [])
        setError(null)
      }
      setLoading(false)
    }

    fetchProducts()
  }, [favoritesUpdatedAt]) // refetch ka siis, kui favorite muutub

  return (
    <section className="border-b w-full px-[5rem] py-25 ">
      <h3 className="text-2xl font-bold mb-6">Parimad valikud sulle</h3>

      {loading ? (
        <p>Laadimine...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div
          className="grid gap-[6px]"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
          }}
        >
          {products.map(product => (
            <ProductCard
              key={product.id}
              
              id={product.id}
              brand={product.brand}
              price={product.price}
              images={product.images || []}
             
            />
          ))}
        </div>
      )}
    </section>
  )
}
