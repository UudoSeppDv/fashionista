'use client'

import { useState, useEffect } from 'react'
import ProductCard from '@/components/ui/ProductCard'
import Choises from '@/components/category/Choises'
import Header from '@/components/header/Header'
import LoginModal from '@/components/LoginModal'
import Footer from '@/components/Footer'
import { ChevronDown } from 'lucide-react'
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import React from 'react';
import ChoisesMobile from '@/components/category/ChoisesMobile'




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

  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [customSizes, setCustomSizes] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [showLoginModal, setShowLoginModal] = useState(false)



  const [currentPage, setCurrentPage] = useState(1)
  const [sortOption, setSortOption] = useState('Uusim')
  const [showSortDropdown, setShowSortDropdown] = useState(false)


    // Nupuvajutuste handlerid
const handleSave = () => {
  console.log('Salvestatud valikud:', {
    selectedCategories,
    selectedSizes,
    selectedBrands,
    selectedFilters,
    minPrice,
    maxPrice,
  });


}
  const handleCancel = () => {
    // tee midagi tühistamisel - nt sulge akordion, tühjenda valikud vms
    
  }

    const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
    setCurrentPage(1)
  }


const toggleBrand = (brand: string) => {
  setSelectedBrands((prevSelectedBrands) => {
    if (prevSelectedBrands.includes(brand)) {
      return prevSelectedBrands.filter(b => b !== brand)
    } else {
      return [...prevSelectedBrands, brand]
    }
  })
  setCurrentPage(1)
}

const toggleFilter = (filter: string) => {
  setSelectedFilters((prevSelectedFilters) => {
    if (prevSelectedFilters.includes(filter)) {
      return prevSelectedFilters.filter(b => b !== filter)
    } else {
      return [...prevSelectedFilters, filter]
    }
  })
  setCurrentPage(1)
}

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
    setCurrentPage(1)
  }

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
}, [router]) // nüüd hoiatus kaob ja kõik töötab ootuspäraselt
 


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
        .from('public_products')
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
}, [router])

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
        <Header setShowLoginModal={setShowLoginModal} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
  
        <h1 className="font-montserrat text-gray-400 px-10 py-6">Kõik Tooted</h1>
  
  <div className="flex justify-between items-center px-10 mb-4 text-sm">
    <div>
  {loading ? (
    <p>Laadimine...</p>
  ) : (
    <>
      {/* Desktop kuvab infot toodete arvu kohta ainult siis, kui on tooteid */}
      {totalItems > 0 ? (
        <div className="hidden md:block">
          <strong>Kuvatakse {start} – {end}</strong> {totalItems.toLocaleString()} tootest
        </div>
      ) : (
        <div className="hidden md:block">Ei leitud ühtegi toodet.</div>
      )}
  
      {/* Mobiilis kuvame alati ChoisesMobile */}
      <div className="md:hidden">
        <ChoisesMobile
          categories={categories}
          sizes={sizes}
          setSelectedSizes={setSelectedSizes}
          brands={brands}
          filters={filters}
          selectedCategories={selectedCategories}
          selectedSizes={selectedSizes}
          selectedBrands={selectedBrands}
          selectedFilters={selectedFilters}
          minPrice={minPrice}
          maxPrice={maxPrice}
          toggleCategory={toggleCategory}
          toggleSize={toggleSize}
          toggleBrand={toggleBrand}
          toggleFilter={toggleFilter}
          setMinPrice={setMinPrice}
          setMaxPrice={setMaxPrice}
          onSaveClick={handleSave}
          onCancelClick={handleCancel}
        />
      </div>
    </>
  )}
  
      {error && <p className="text-red-600 mt-2">Viga: {error}</p>}
    </div>
  
    <div className="relative">
      <button
        onClick={() => setShowSortDropdown(prev => !prev)}
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
          <div className="hidden md:block">
         <Choises
    brands={brands}
    categories={categories}
    sizes={sizes}
    setSelectedSizes={setSelectedSizes}
    filters={filters}               // korrektselt plural
    selectedBrands={selectedBrands}
    selectedCategories={selectedCategories}
    selectedSizes={selectedSizes}
    selectedFilters={selectedFilters}
    minPrice={minPrice}
    maxPrice={maxPrice}
    toggleBrand={toggleBrand}
    toggleCategory={toggleCategory}
    toggleSize={toggleSize}
    toggleFilter={toggleFilter}
    setMinPrice={setMinPrice}
    setMaxPrice={setMaxPrice}
    customSizes={customSizes}
    setCustomSizes={setCustomSizes}
  />
  
  </div>
  
     
  
  
          <section className="flex-1 mb-10 grid grid-cols-2 sm:gap-4 md:grid-cols-4 md:gap-6 sm:px-3 md:px-0">
    {loading ? (
      <p className="col-span-full text-center text-gray-500">Laadimine...</p>
    ) : currentItems.length > 0 ? (
      currentItems.map((item) => (
        <div key={item.id} className="transform scale-90 sm:scale-95 md:scale-100">
          <ProductCard
            id={item.id.toString()}
            brand={item.brand}
            filter={item.filter}
            price={item.price}
            images={item.image}
          />
        </div>
      ))
    ) : (
      <p className="col-span-full text-center text-gray-500">Ei leitud ühtegi toodet.</p>
    )}
  </section>
  
  
  
        </div>
  
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6 pb-10">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Eelmine
            </button>
            <span>Leht {currentPage} / {totalPages}</span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Järgmine
            </button>
          </div>
        )}
  
        <Footer />
      </main>
)

}