'use client'

import { useState, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'
import Filters from '@/components/Choises'
import Header from '@/components/Header'
import LoginModal from '@/components/LoginModal'
import Footer from '@/components/Footer'
import { ChevronDown } from 'lucide-react'
import { supabase } from '../../../lib/supabase'  // veendu, et see on õige path

type Product = {
  id: number
  brand: string
  category: string
  size?: string
  price: number
  popularity: number
  filter: string
  image: string[] // pildi urlide massiiv
}

export default function ListingsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [customSizes, setCustomSizes] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOption, setSortOption] = useState('Uusim')
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  const itemsPerPage = 20
// võtmed localStorage jaoks
const LS_KEYS = {
  selectedSizes: 'selectedSizes',
  selectedBrands: 'selectedBrands',
  selectedCategories: 'selectedCategories',
  selectedFilters: 'selectedFilters',
  minPrice: 'minPrice',
  maxPrice: 'maxPrice',
  customSizes: 'customSizes',
}

// Lehe laadimisel loe localStorage'st
useEffect(() => {
  const storedSizes = localStorage.getItem(LS_KEYS.selectedSizes)
  if (storedSizes) setSelectedSizes(JSON.parse(storedSizes))

  const storedBrands = localStorage.getItem(LS_KEYS.selectedBrands)
  if (storedBrands) setSelectedBrands(JSON.parse(storedBrands))

  const storedCategories = localStorage.getItem(LS_KEYS.selectedCategories)
  if (storedCategories) setSelectedCategories(JSON.parse(storedCategories))

  const storedFilters = localStorage.getItem(LS_KEYS.selectedFilters)
  if (storedFilters) setSelectedFilters(JSON.parse(storedFilters))

  const storedMinPrice = localStorage.getItem(LS_KEYS.minPrice)
  if (storedMinPrice) setMinPrice(storedMinPrice)

  const storedMaxPrice = localStorage.getItem(LS_KEYS.maxPrice)
  if (storedMaxPrice) setMaxPrice(storedMaxPrice)

  const storedCustomSizes = localStorage.getItem(LS_KEYS.customSizes)
  if (storedCustomSizes) setCustomSizes(storedCustomSizes)
}, [])

// Iga valiku muutmisel salvesta kohe localStorage'i
useEffect(() => {
  localStorage.setItem(LS_KEYS.selectedSizes, JSON.stringify(selectedSizes))
}, [selectedSizes])



useEffect(() => {
  localStorage.setItem(LS_KEYS.selectedCategories, JSON.stringify(selectedCategories))
}, [selectedCategories])

useEffect(() => {
  localStorage.setItem(LS_KEYS.selectedFilters, JSON.stringify(selectedFilters))
}, [selectedFilters])

useEffect(() => {
  localStorage.setItem(LS_KEYS.minPrice, minPrice)
}, [minPrice])

useEffect(() => {
  localStorage.setItem(LS_KEYS.maxPrice, maxPrice)
}, [maxPrice])

useEffect(() => {
  localStorage.setItem(LS_KEYS.customSizes, customSizes)
}, [customSizes])

  // Fetch products from Supabase on mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')

      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        // Eeldame, et 'images' on string[], kui ei, tee konvertimine
        const normalizedData = data.map(item => ({
          ...item,
          image: Array.isArray(item.images) ? item.images : [],
        }))
        setProducts(normalizedData)
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Arvuta kategooriad ja suurused saadud toodete põhjal
  const categories = Array.from(new Set(products.map(item => item.category)))
  const filters = Array.from(new Set(products.map(item => item.filter)))
  const sizes = Array.from(
    new Set(
      products
        .map(item => item.size)
        .filter((size): size is string => !!size)
    )
  )
  const brands = Array.from(new Set(products.map(item => item.brand)))  // <-- Lisa see
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
    setCurrentPage(1)
  }
const [selectedBrands, setSelectedBrands] = useState<string[]>([])

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

  const customSizesArray = customSizes
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  // Filter + sort funktsioon samamoodi, aga nüüd 'products' põhjal
const filteredListings = products.filter((item) => {
  const matchesSearch = item.brand.toLowerCase().includes(searchQuery.toLowerCase())
  const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category)
  const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(item.brand)   // <-- lisa see
  const matchesFilter = selectedFilters.length === 0 || selectedFilters.includes(item.filter)   // <-- lisa see
  const matchesSize = selectedSizes.length === 0 || (item.size && selectedSizes.includes(item.size))
  const matchesCustomSize = customSizesArray.length === 0 || (item.size && customSizesArray.includes(item.size))
  const price = item.price
  const matchesMinPrice = minPrice === '' || price >= Number(minPrice)
  const matchesMaxPrice = maxPrice === '' || price <= Number(maxPrice)
  return matchesSearch && matchesCategory && matchesBrand &&  matchesFilter && matchesSize && matchesCustomSize && matchesMinPrice && matchesMaxPrice
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
        return b.id - a.id
    }
  })

  const totalItems = sortedListings.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const start = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const end = Math.min(currentPage * itemsPerPage, totalItems)

  const currentItems = sortedListings.slice(start - 1, end)

  const goToPrevPage = () => setCurrentPage((page) => Math.max(page - 1, 1))
  const goToNextPage = () => setCurrentPage((page) => Math.min(page + 1, totalPages))

  return (
    <main className="min-h-screen text-gray-800 relative">
      <Header setShowLoginModal={setShowLoginModal} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      <h1 className="font-montserrat text-gray-400 px-10 py-6">Kõik Tooted</h1>

      <div className="flex justify-between items-center px-10 mb-4 text-sm">
        <div>
          {loading ? (
            <p>Laadimine...</p>
          ) : totalItems > 0 ? (
            <>
              <strong>Kuvatakse {start} – {end}</strong> {totalItems.toLocaleString()} tootest
            </>
          ) : (
            <>Ei leitud ühtegi toodet.</>
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
       <Filters
  brands={brands}
  categories={categories}
  sizes={sizes}
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



        <section className="flex-1 mb-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {loading ? (
            <p className="col-span-full text-center text-gray-500">Laadimine...</p>
          ) : currentItems.length > 0 ? (
            currentItems.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id.toString()}
                brand={item.brand}
                filter={item.filter}
                price={item.price}
                images={item.image}
              />
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
