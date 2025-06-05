'use client'

import { useState } from 'react'
import ProductCard from '@/components/ProductCard'
import Filters from '@/components/Filters'
import { mockListings } from '@/data/mockListings'
import Header from '@/components/Header'
import LoginModal from '@/components/LoginModal'
import Footer from '@/components/Footer'

export default function ListingsPage() {
  const categories = Array.from(new Set(mockListings.map(item => item.category)))
  const sizes = Array.from(
    new Set(
      mockListings
        .map(item => item.size)
        .filter((size): size is string => !!size)
    )
  )

  const [showLoginModal, setShowLoginModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])

  // Uus oma suuruste state stringina (nt "XS, M, L")
  const [customSizes, setCustomSizes] = useState('')

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size]
    )
  }

  // Jagame customSizes stringi massiiviks ja puhastame tühikud
  const customSizesArray = customSizes
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const filteredListings = mockListings.filter((item) => {
    const matchesSearch =
      item.brand.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(item.category)

    const matchesSize =
      selectedSizes.length === 0 ||
      (item.size && selectedSizes.includes(item.size))

    // Lisame ka customSizes filteri
    const matchesCustomSize =
      customSizesArray.length === 0 ||
      (item.size && customSizesArray.includes(item.size))

    const price = item.price

    const matchesMinPrice = minPrice === '' || price >= Number(minPrice)
    const matchesMaxPrice = maxPrice === '' || price <= Number(maxPrice)

    return (
      matchesSearch &&
      matchesCategory &&
      matchesSize &&
      matchesCustomSize &&
      matchesMinPrice &&
      matchesMaxPrice
    )
  })

  return (
    <main className="min-h-screen text-gray-800 relative">
      <Header
        setShowLoginModal={setShowLoginModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      <h1 className="font-montserrat w-full pl-10 pr-4 py-6 text-gray-400 text-sm">
  Kõik Tooted
</h1>

      <div className="flex gap-8">
        <Filters
          categories={categories}
          sizes={sizes}
          selectedCategories={selectedCategories}
          selectedSizes={selectedSizes}
          minPrice={minPrice}
          maxPrice={maxPrice}
          toggleCategory={toggleCategory}
          toggleSize={toggleSize}
          setMinPrice={setMinPrice}
          setMaxPrice={setMaxPrice}
          customSizes={customSizes}
          setCustomSizes={setCustomSizes}
        />

        <section className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredListings.length > 0 ? (
            filteredListings.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                brand={item.brand}
                price={item.price}
                image={item.image}
              />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              Ei leitud ühtegi toodet.
            </p>
          )}
        </section>
      </div>

      <Footer />
    </main>
  )
}
