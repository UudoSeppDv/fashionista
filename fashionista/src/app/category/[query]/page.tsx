'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../../lib/supabaseClient'
import ProductCard from '@/components/ui/ProductCard'
import Header from '@/components/header/Header'
import LoginModal from '@/components/LoginModal'
import Footer from '@/components/Footer'
import Choises from '@/components/category/Choises'
import { LS_KEYS } from '../../../../lib/constants/localStorageKeys'
import ChoisesMobile from '@/components/category/ChoisesMobile'
import { ChevronDown } from 'lucide-react'

type Product = {
  id: string
  brand: string
  category: string
  filter: string
  description: string
  condition: string
  size?: string
  price: number
  image: string[]
  popularity?: number | null
}

function normalizeProduct(item: Record<string, unknown>): Product {
  return {
    id: String(item.id),
    brand: (item.brand as string) ?? '',
    category: (item.category as string) ?? '',
    filter: (item.filter as string) ?? '',
    description: (item.description as string) ?? '',
    condition: (item.condition as string) ?? '',
    size: (item.size as string) ?? '',
    price: (item.price as number) ?? 0,
    image: Array.isArray(item.images) ? (item.images as string[]) : [],
    popularity: (item.popularity as number) ?? 0,
  }
}

export default function CategorySearchPage() {
  const { query } = useParams()
  const searchTerm = decodeURIComponent(query as string)

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [customSizes, setCustomSizes] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const [sortOption, setSortOption] = useState('Uusim')
  const [showLoginModal, setShowLoginModal] = useState(false)

  const [searchQuery, setSearchQuery] = useState(searchTerm)
const [showSortDropdown, setShowSortDropdown] = useState(false)

const handleSave = () => {
  console.log('Salvestatud valikud:', {
    selectedCategories,
    selectedBrands,
    selectedFilters,
    selectedSizes,
    minPrice,
    maxPrice,
    customSizes,
  })
}

const handleCancel = () => {
  console.log('Filtri muutmine tühistatud')
}
  // Lae filtrite valikud localStorage'ist
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

  // Salvesta filtrite muutused kohe localStorage’i
  useEffect(() => { localStorage.setItem(LS_KEYS.selectedSizes, JSON.stringify(selectedSizes)) }, [selectedSizes])
  useEffect(() => { localStorage.setItem(LS_KEYS.selectedBrands, JSON.stringify(selectedBrands)) }, [selectedBrands])
  useEffect(() => { localStorage.setItem(LS_KEYS.selectedCategories, JSON.stringify(selectedCategories)) }, [selectedCategories])
  useEffect(() => { localStorage.setItem(LS_KEYS.selectedFilters, JSON.stringify(selectedFilters)) }, [selectedFilters])
  useEffect(() => { localStorage.setItem(LS_KEYS.minPrice, minPrice) }, [minPrice])
  useEffect(() => { localStorage.setItem(LS_KEYS.maxPrice, maxPrice) }, [maxPrice])
  useEffect(() => { localStorage.setItem(LS_KEYS.customSizes, customSizes) }, [customSizes])

  // Lae tooted Supabasest vastavalt otsingule
useEffect(() => {
  const fetchProducts = async () => {
  setLoading(true)
  setError(null)
  try {
    const searchTermDecoded = decodeURIComponent(query as string || '')
    const words = searchTermDecoded.split(/\s+/).filter(Boolean)
    if (words.length === 0) {
      setProducts([])
      setLoading(false)
      return
    }

    // Võta kõik read Supabase-st (või piiratud arv)
    const { data, error } = await supabase
      .from('public_products')
      .select('*')
      .limit(1000) // väiksem dataset, et frontend filtreeriks sõnad

    if (error) throw error
    if (!data) throw new Error('No data returned')

    // Frontendis filter: kõik sõnad peavad olema vähemalt ühes väljas
    const filtered = data.filter(item => {
      const text = [
        item.brand,
        item.description,
        item.category,
        item.filter
      ].filter(Boolean).join(' ').toLowerCase()

      return words.every(word => text.includes(word.toLowerCase()))
    })

    setProducts(filtered.map(normalizeProduct))
  } catch (err: unknown) {
    console.error(err)
    if (err instanceof Error) setError(err.message)
    else setError('Something went wrong')
    setProducts([])
  } finally {
    setLoading(false)
  }
}

  if (query) fetchProducts()
}, [query])


  // Arvuta filtrite valikud saadud toodete põhjal
  const categories = Array.from(new Set(products.map(p => p.category)))
  const filters = Array.from(new Set(products.map(p => p.filter)))
  const sizes = Array.from(
    new Set(
      products
        .map(item => item.size)
        .filter((size): size is string => !!size)
    )
  )
  const brands = Array.from(new Set(products.map(p => p.brand)))

  // Toggle funktsioonid filtrite jaoks
  const toggleCategory = (c: string) => { setSelectedCategories(prev => prev.includes(c) ? prev.filter(x=>x!==c) : [...prev, c]); setCurrentPage(1) }
  const toggleBrand = (b: string) => { setSelectedBrands(prev => prev.includes(b) ? prev.filter(x=>x!==b) : [...prev, b]); setCurrentPage(1) }
  const toggleFilter = (f: string) => { setSelectedFilters(prev => prev.includes(f) ? prev.filter(x=>x!==f) : [...prev, f]); setCurrentPage(1) }
  const toggleSize = (s: string) => { setSelectedSizes(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s]); setCurrentPage(1) }

  const customSizesArray = customSizes.split(',').map(s => s.trim()).filter(Boolean)

  // Filtreeri ja sorteeri
  const filteredListings = products.filter(item => {
    const matchesSearch = item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.filter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
    const safeNumber = (v: number | undefined | null) => v ?? 0
    switch(sortOption){
      case 'Madalaim hind': return safeNumber(a.price) - safeNumber(b.price)
      case 'Kõrgeim hind': return safeNumber(b.price) - safeNumber(a.price)
      case 'Populaarseim': return safeNumber(b.popularity) - safeNumber(a.popularity)
      default: return 0
    }
  })

  const totalItems = sortedListings.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const start = totalItems === 0 ? 0 : (currentPage-1)*itemsPerPage+1
  const end = Math.min(currentPage*itemsPerPage, totalItems)
  const currentItems = sortedListings.slice(start-1, end)

  const goToPrevPage = () => setCurrentPage(p => Math.max(p-1,1))
  const goToNextPage = () => setCurrentPage(p => Math.min(p+1,totalPages))

  return (
       <main className="min-h-screen text-gray-800 relative">
      <Header setShowLoginModal={setShowLoginModal} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      <h1 className="font-montserrat text-gray-400 px-10 py-6">Otsing</h1>

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

   


<section className="flex-1 mb-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-6 px-4 sm:px-6 md:px-8 justify-items-center sm:justify-items-start">
  {loading ? (
    <p className="col-span-full text-center text-gray-500">Laadimine...</p>
  ) : currentItems.length > 0 ? (
    currentItems.map((item) => (
      <div
        key={item.id}
        className="w-full mb-2 sm:mb-0"
      >
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
