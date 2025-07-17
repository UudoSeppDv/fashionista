'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import ProductCard from '@/components/ProductCard'
import UserCard from '@/components/UserCard'

interface SocialMedia {
  instagram?: string
  facebook?: string
  [key: string]: string | undefined
}

interface UserData {
  id: string
  display_name: string | null
  first_name: string | null
  surname: string | null
  avatar_url: string | null
  location: string | null
  bio: string | null
  social_media: SocialMedia | null
  sold_products_count: number
  
}

interface Product {
  id: string
  brand: string
  price: number
  images: string[]
}

interface Follower {
  id: string
  user_id: string
  follower_id: string
}

interface UserProfileProps {
  pageUrl: string
}

export default function UserProfile({ pageUrl }: UserProfileProps) {
  const [user, setUser] = useState<UserData | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [followers, setFollowers] = useState<Follower[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const { data: userData, error: userError } = await supabase
          .from('public_users')
          .select('*')
          .eq('page_url', pageUrl)
          .single()

        if (userError) throw userError
        if (!userData) throw new Error('Kasutajat ei leitud')

        setUser(userData)

        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', userData.id)
          .order('created_at', { ascending: false })

        if (productError) throw productError
        setProducts(productData || [])

        const { data: followerData, error: followerError } = await supabase
          .from('user_followers')
          .select('*')
          .eq('user_id', userData.id)

        if (followerError) throw followerError
        setFollowers(followerData || [])

      } catch {
        setError( 'Andmete laadimisel tekkis viga')
      } finally {
        setLoading(false)
      }
    }

    if (pageUrl) {
      fetchData()
    }
  }, [pageUrl])

  if (loading) return <div className="p-6">Laen...</div>
  if (error) return <div className="p-6 text-red-600">Viga: {error}</div>
  if (!user) return <div className="p-6">Kasutajat ei leitud</div>

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 min-h-screen">
      <aside className="w-full md:w-72 text-white flex flex-col items-center">
        <UserCard
          name={`${user.first_name ?? ''} ${user.surname ?? ''}`.trim() || user.display_name || 'Kasutaja'}
          followers={followers.length}
          sold={user.sold_products_count.toString()}
          location={user.location || 'Asukoht teadmata'}
          social_media={user.social_media || {}}
          imageUrl={user.avatar_url}
          description={user.bio || ''}
          userId={user.id}
          firstName={user.first_name ?? ''}
          surname={user.surname ?? ''}

        />
      </aside>

      <section className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {products.length === 0 ? (
          <p className="text-center col-span-full text-gray-500 mt-4">
            Tooteid pole
          </p>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              images={product.images}
              brand={product.brand}
              price={product.price}

            />
          ))
        )}
      </section>
    </div>
  )
}
