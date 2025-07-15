'use client'

import { useEffect, useState } from 'react'
import ProductCard from '@/components/ProductCard'
import { supabase } from '../../lib/supabaseClient'

interface Product {
  id: string
  brand: string
  price: number
  images: string[]
  created_at: string
}

interface Props {
  favoritesUpdatedAt: number
  onFavoritesChange?: () => void
}

export default function SectionRecentlyViewed({ favoritesUpdatedAt }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecentlyViewedProducts = async () => {
      setLoading(true)

      try {
        const viewedIdsRaw = localStorage.getItem('recentlyViewed') || '[]'
        let viewedIds = JSON.parse(viewedIdsRaw) as string[]

        // Filterda välja vaid UUID formaadile vastavad id-d
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        viewedIds = viewedIds.filter(id => id && id !== 'NaN' && uuidRegex.test(id))

        let data, error

        if (viewedIds.length === 0) {
          // Kui vaatamisajalugu tühi, too lihtsalt viimased 5 toodet
          const response = await supabase
            .from('public_products')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5)

          data = response.data
          error = response.error
        } else {
          // Kui vaatamisajalugu on, too konkreetsed tooted
          const response = await supabase
            .from('public_products')
            .select('*')
            .in('id', viewedIds)

          data = response.data
          error = response.error
        }

        if (error) {
          setError('Toodete laadimine ebaõnnestus.')
          setProducts([])
          setLoading(false)
          return
        }

        // Andmete puhastus ja tüübi kindlustamine
        const cleanData = (data || []).map(item => ({
          id: item.id,
          brand: item.brand ?? '',
          price: item.price !== null && item.price !== undefined ? Number(item.price) : 0,
          images: item.images ?? [],
          created_at: item.created_at ?? '',
        }))

        // Sorteeri tooted vastavalt vaatamisajaloo järjekorrale (kui on)
        const sortedProducts = viewedIds.length > 0
          ? viewedIds
              .map(id => cleanData.find(product => product.id === id))
              .filter(Boolean) as Product[]
          : cleanData

        setProducts(sortedProducts)
        setError(null)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        setError(`Viga: ${message}`)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecentlyViewedProducts()
  }, [favoritesUpdatedAt]) // uuenda kui favoriitide muutus


  return (
    <section className="border w-full px-[5rem] py-6">
      <h3 className="text-2xl font-bold mb-6">Viimati vaadatud</h3>

      {loading ? (
        <p>Laadimine...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : products.length > 0 ? (
        <div
          className="grid gap-[6px]"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}
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
      ) : (
        <p>Ühtegi toodet ei leitud.</p>
      )}
    </section>
  )
}
