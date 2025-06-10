'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'  // kontrolli, et see path on õige

export default function TestSupabase() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(10)

      if (error) {
        setError(error.message)
        console.error(error)
      } else {
        setProducts(data || [])
      }
      setLoading(false)
    }

    fetchProducts()
  }, [])

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Supabase products test</h1>

      {loading && <p>Laadimine...</p>}

      {error && <p className="text-red-600">Viga: {error}</p>}

      {!loading && !error && (
        <pre className="bg-gray-100 p-4 rounded max-h-[600px] overflow-auto">
          {JSON.stringify(products, null, 2)}
        </pre>
      )}
    </main>
  )
}
