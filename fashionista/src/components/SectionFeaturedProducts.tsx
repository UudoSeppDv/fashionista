'use client'

import { useEffect, useState } from 'react'
import ProductCard from '@/components/ProductCard'
import { supabase } from '../../lib/supabase'

export default function SectionFeaturedProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')      // <-- tabeli nimi Supabase'is
        .select('*')
        .limit(5)              // näiteks ainult 8 "featured" toodet

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
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
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
