'use client'

import { useState, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'
import Filters from '@/components/Choises'
import Header from '@/components/Header'
import LoginModal from '@/components/LoginModal'
import Footer from '@/components/Footer'
import { ChevronDown } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import React from 'react';




type Product = {
   id: string
  brand: string
  category: string
  size: string
  filter: string
  image: string[]
  condition: string
  price: number
  popularity: number
  // lisa vajadusel teised väljad
}

function normalizeProduct(item: Record<string, unknown>): Product {
  return {
    id: String(item.id),
    brand: (item.brand as string) ?? '',
    category: (item.category as string) ?? '',
    size: (item.size as string) ?? '',
    filter: (item.filter as string) ?? '',
    image: Array.isArray(item.images) ? (item.images as string[]) : [],
    condition: (item.condition as string) ?? '',
    price: (item.price as number) ?? 0,
    popularity: (item.popularity as number) ?? 0,
  }
}


export default function FavoritesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [showEmptyState, setShowEmptyState] = React.useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [customSizes, setCustomSizes] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  


  const [currentPage, setCurrentPage] = useState(1)
  const [sortOption, setSortOption] = useState('Uusim')
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  const itemsPerPage = 20

useEffect(() => {
  const checkUser = async () => {
    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
      router.replace('/')
    } else {
      setLoading(false)
    }
  }

  checkUser()
}, [router])

React.useEffect(() => {
  const timer = setTimeout(() => setShowEmptyState(true), 2000);
  return () => clearTimeout(timer);
}, []);


  // Loeme filtrite eelseisud localStorage'st (või võid soovi korral selle eemaldada)
  useEffect(() => {
    const storedSizes = localStorage.getItem('selectedSizes')
    if (storedSizes) setSelectedSizes(JSON.parse(storedSizes))

    const storedBrands = localStorage.getItem('selectedBrands')
    if (storedBrands) setSelectedBrands(JSON.parse(storedBrands))

    const storedCategories = localStorage.getItem('selectedCategories')
    if (storedCategories) setSelectedCategories(JSON.parse(storedCategories))

    const storedFilters = localStorage.getItem('selectedFilters')
    if (storedFilters) setSelectedFilters(JSON.parse(storedFilters))

    const storedMinPrice = localStorage.getItem('minPrice')
    if (storedMinPrice) setMinPrice(storedMinPrice)

    const storedMaxPrice = localStorage.getItem('maxPrice')
    if (storedMaxPrice) setMaxPrice(storedMaxPrice)

    const storedCustomSizes = localStorage.getItem('customSizes')
    if (storedCustomSizes) setCustomSizes(storedCustomSizes)
  }, [])

  // Salvesta filtrite eelseisud localStorage'sse
  useEffect(() => {
    localStorage.setItem('selectedSizes', JSON.stringify(selectedSizes))
  }, [selectedSizes])
  useEffect(() => {
    localStorage.setItem('selectedBrands', JSON.stringify(selectedBrands))
  }, [selectedBrands])
  useEffect(() => {
    localStorage.setItem('selectedCategories', JSON.stringify(selectedCategories))
  }, [selectedCategories])
  useEffect(() => {
    localStorage.setItem('selectedFilters', JSON.stringify(selectedFilters))
  }, [selectedFilters])
  useEffect(() => {
    localStorage.setItem('minPrice', minPrice)
  }, [minPrice])
  useEffect(() => {
    localStorage.setItem('maxPrice', maxPrice)
  }, [maxPrice])
  useEffect(() => {
    localStorage.setItem('customSizes', customSizes)
  }, [customSizes])

  // Laeme kasutaja lemmiktooted Supabase'ist
useEffect(() => {
  const fetchFavorites = async () => {
    setLoading(true)
    setError(null)

    try {
      // 1) Võta aktiivne kasutaja
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) {
        router.push('/')
        return
      }

      // 2) Võta favorites tabelist kasutaja lemmikute product_id'd
      const { data: favoriteRows, error: favError } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id)

      if (favError) throw favError
      if (!favoriteRows || favoriteRows.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }

      const favoriteIds = favoriteRows.map(row => row.product_id)

      // 3) Võta tooted, mille id on favoriteIds sees
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .in('id', favoriteIds)

      if (productsError) throw productsError
      if (!productsData) {
        setProducts([])
        setLoading(false)
        return
      }

      // 4) Normaliseeri tooted, kasutades normalizeProduct
      const normalized = productsData.map(normalizeProduct)

      setProducts(normalized)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(String(err))
      }
    } finally {
      setLoading(false)
    }
  }

  fetchFavorites()
}, [])

  // Sinu olemasolev filtrite, otsingu ja sorteerimise loogika
  const categories = Array.from(new Set(products.map(p => p.category)))
  const brands = Array.from(new Set(products.map(p => p.brand)))
  const filters = Array.from(new Set(products.map(p => p.filter)))
  const sizes = Array.from(new Set(products.map(p => p.size).filter((s): s is string => !!s)))

  const customSizesArray = customSizes
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const filteredListings = products.filter(item => {
    const matchesSearch = item.brand.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category)
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(item.brand)
    const matchesFilter = selectedFilters.length === 0 || selectedFilters.includes(item.filter)
    const matchesSize = selectedSizes.length === 0 || (item.size && selectedSizes.includes(item.size))
    const matchesCustomSize = customSizesArray.length === 0 || (item.size && customSizesArray.includes(item.size))
    const price = item.price
    const matchesMinPrice = minPrice === '' || price >= Number(minPrice)
    const matchesMaxPrice = maxPrice === '' || price <= Number(maxPrice)

    return matchesSearch && matchesCategory && matchesBrand && matchesFilter && matchesSize && matchesCustomSize && matchesMinPrice && matchesMaxPrice
  })

  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortOption) {
      case 'Madalaim hind':
        return a.price - b.price
      case 'Kõrgeim hind':
        return b.price - a.price
      case 'Populaarseim':
        return (b.popularity || 0) - (a.popularity || 0)
      default:
        return b.id.localeCompare(a.id)
    }
  })

  const totalItems = sortedListings.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const start = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const end = Math.min(currentPage * itemsPerPage, totalItems)

  const currentItems = sortedListings.slice(start - 1, end)

  const goToPrevPage = () => setCurrentPage(p => Math.max(1, p - 1))
  const goToNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1))

  return (
  <main className="min-h-screen text-gray-800 relative">
    <Header setShowLoginModal={() => {}} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
    <LoginModal isOpen={false} onClose={() => {}} />

    <h1 className="font-montserrat text-gray-400 px-10 py-6">Minu lemmikud</h1>

    {loading && (
      <p className="px-10">Laadimine...</p>
     )}
    {!loading && products.length > 0 && (
      <>
      
        <div className="flex justify-between items-center px-10 mb-4 text-sm">
          <div>
            <strong>Kuvatakse {start} – {end}</strong> {totalItems.toLocaleString()} tootest
            {error && <p className="text-red-600 mt-2">Viga: {error}</p>}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(p => !p)}
              className="px-3 py-2 rounded flex items-center gap-2 hover:text-gray-500 hover:transition"
            >
              Sordi: {sortOption} <ChevronDown size={16} />
            </button>
            {showSortDropdown && (
              <ul className="absolute right-0 mt-1 w-35 bg-white shadow-md z-50">
                {['Uusim', 'Populaarseim', 'Madalaim hind', 'Kõrgeim hind'].map(option => (
                  <li
                    key={option}
                    onClick={() => {
                      setSortOption(option)
                      setShowSortDropdown(false)
                      setCurrentPage(1)
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex gap-8">
          <Filters
            brands={brands}
            categories={categories}
            sizes={sizes}
            filters={filters}
            selectedBrands={selectedBrands}
            selectedCategories={selectedCategories}
            selectedSizes={selectedSizes}
            selectedFilters={selectedFilters}
            minPrice={minPrice}
            maxPrice={maxPrice}
            toggleBrand={brand => {
              setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand])
              setCurrentPage(1)
            }}
            toggleCategory={cat => {
              setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
              setCurrentPage(1)
            }}
            toggleSize={size => {
              setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])
              setCurrentPage(1)
            }}
            toggleFilter={filter => {
              setSelectedFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter])
              setCurrentPage(1)
            }}
            setMinPrice={setMinPrice}
            setMaxPrice={setMaxPrice}
            customSizes={customSizes}
            setCustomSizes={setCustomSizes}
          />

          <section className="flex-1 flex flex-col gap-4">
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
    {currentItems.map(product => (
      <ProductCard
        key={product.id}
        id={product.id}
        brand={product.brand}
        price={product.price}
        images={product.image || []}
      />
    ))}
  </div>

            <div className="flex gap-4 mt-4 items-center justify-center text-sm">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="border border-gray-300 px-3 py-1 rounded disabled:opacity-50"
              >
                Eelmine
              </button>
              <span>{start} – {end} / {totalItems.toLocaleString()}</span>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="border border-gray-300 px-3 py-1 rounded disabled:opacity-50"
              >
                Järgmine
              </button>
            </div>
          </section>
        </div>
      </>
    )}

          {!loading && products.length === 0 && showEmptyState && (

      <div className="flex flex-col items-center justify-center gap-4 text-center py-10">
        <svg width="107" height="119" viewBox="0 0 107 119" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M39.6444 29.1327C56.4669 33.2037 67.8416 34.1615 78.3183 30.7491C92.4469 26.1394 112.442 40.687 105.019 58.4076C99.3914 71.9374 97.1763 70.2612 100.05 85.8864C101.666 94.5072 92.2673 109.055 78.1986 117.077C71.7928 120.669 58.0834 120.07 50.4204 100.434C42.7575 80.7977 36.1721 80.2589 23.7199 77.3853C15.3385 75.4696 -4.89642 68.2856 1.09025 47.5717C6.17892 29.9709 22.8219 25.0618 39.6444 29.1327Z" fill="#EAD5DE"/>
<path d="M35.5722 23.9243C35.5722 23.9243 19.5279 13.9864 28.0888 6.02414C40.0023 -5.0512 46.7672 11.951 48.0843 9.43655C49.4014 6.98202 51.7362 0.875609 58.9202 0.0973412C68.1995 -0.920393 68.6785 6.38335 70.2949 6.14388C71.9113 5.90442 83.8846 -1.93813 90.2904 7.28135C95.9178 15.4232 79.9334 23.6848 78.5565 29.9708C76.1019 41.2856 78.0775 53.0794 64.7871 56.3721C45.1508 61.341 35.5722 23.9243 35.5722 23.9243Z" fill="#EEB1C2"/>
<path d="M47.1279 26.0794C48.5048 23.8643 56.8263 34.8798 56.7664 33.8022C56.6467 31.5272 54.6112 25.6603 56.5869 24.882C58.5625 24.1038 59.1013 35.239 59.5802 34.0416C60.0591 32.8443 61.6755 25.9596 65.507 22.4874C69.3384 18.9552 70.6555 19.8532 67.0635 24.5228C64.1301 28.4142 63.6511 36.7356 61.7952 41.7645C61.017 43.9197 65.4471 59.6646 70.2365 70.9195C73.3495 78.1634 78.8573 86.1257 76.9415 84.8685C72.4515 81.8752 64.8485 70.5603 58.3829 41.8243C58.0835 40.148 45.8707 28.1747 47.1279 26.0794Z" fill="#B4A6A6"/>
</svg>

        <h2 className="text-xl font-m font-montserrat text-gray-800">Tundub, et sa pole veel midagi oma lemmikute hulka lisanud.
       <br/ >Ära muretse, alustamine on lihtne!</h2>
        
        <a
          href="/category"
          className="mt-10 mb-20 px-10 py-1 border font-montserrat text-black rounded-full hover:bg-gray-100 transition"
        >
          AVASTA&nbsp;&nbsp;<span className="text-xl">→</span>
        </a>
      </div>
      )}

    <Footer />
  </main>
)

}