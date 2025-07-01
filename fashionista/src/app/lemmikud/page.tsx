'use client'

import { useState, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'
import Filters from '@/components/Choises'
import Header from '@/components/Header'
import LoginModal from '@/components/LoginModal'
import Footer from '@/components/Footer'
import { ChevronDown } from 'lucide-react'
import { supabase } from '../../../lib/supabase'



type Product = {
  id: string
  brand: string
  category: string
  size?: string
  price: number
  popularity: number
  filter: string
  images: string[]
}

export default function FavoritesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        if (!user) throw new Error('Kasutaja pole sisse logitud')

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

        // 4) Normaliseeri pildid
        const normalized = productsData.map(item => ({
          ...item,
          images: Array.isArray(item.images) ? item.images : [],
        }))

        setProducts(normalized)
        setLoading(false)
      } catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message);
  } else {
    setError(String(err)); // kui error ei ole Error-tüüp, siis teisenda stringiks
  }
  setLoading(false);
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

      <div className="flex justify-between items-center px-10 mb-4 text-sm">
        <div>
          {loading ? (
            <p>Laadimine...</p>
          ) : totalItems > 0 ? (
            <>
              <strong>Kuvatakse {start} – {end}</strong> {totalItems.toLocaleString()} tootest
            </>
          ) : (
            <>Sul pole veel lemmikuid valitud.</>
          )}
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
          {loading && <p>Laadimine...</p>}
          {!loading && currentItems.length === 0 && <p>Tooteid ei leitud.</p>}

          <div className="grid grid-cols-2 gap-3">
            {currentItems.map(product => (
              <ProductCard
                            key={product.id}
                            id={product.id}
                            brand={product.brand}
                            price={product.price}
                            images={product.images || []}
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

            <span>
              {start} – {end} / {totalItems.toLocaleString()}
            </span>

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

      <Footer />
    </main>
  )
}
