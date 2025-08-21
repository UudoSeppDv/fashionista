'use client'


import React from 'react'
import { useState } from 'react';
import SizeModal from '../SizeModal';

type ChoisesProps = {
  categories: string[]
  sizes: string[]
  brands: string[]
  filters: string[]
  selectedCategories: string[]
  selectedSizes: string[]
  selectedBrands: string[]
  selectedFilters: string[]
  minPrice: string
  maxPrice: string
  toggleCategory: (category: string) => void
  toggleSize: (size: string) => void
  toggleBrand: (brand: string) => void
  toggleFilter: (filter: string) => void
  setMinPrice: (value: string) => void
  setMaxPrice: (value: string) => void
  customSizes: string
  setCustomSizes: (value: string) => void
}


export default function Choises({
  categories,
  sizes,
  brands,
  filters,
  selectedCategories,
  selectedSizes,
  selectedBrands,
  selectedFilters,
  minPrice,
  maxPrice,
  toggleCategory,
  toggleFilter,
  toggleSize,
  toggleBrand,
  setMinPrice,
  setMaxPrice,
}: ChoisesProps) {




  const [modalOpen, setModalOpen] = useState(false);


  return (
    <div className="font-montserrat w-full sm:w-80 flex flex-col mb-10 gap-12 sm:ml-10">
      <aside className="w-full sm:w-80 p-4 border shadow">
        <div className="flex items-center mb-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20.3798 3.46L15.9998 2C15.9998 3.06087 15.5784 4.07828 14.8282 4.82843C14.0781 5.57857 13.0607 6 11.9998 6C10.9389 6 9.92151 5.57857 9.17137 4.82843C8.42122 4.07828 7.9998 3.06087 7.9998 2L3.6198 3.46C3.16718 3.61079 2.78337 3.91842 2.53765 4.32734C2.29193 4.73627 2.20047 5.21956 2.2798 5.69L2.8598 9.16C2.89787 9.39491 3.01848 9.60855 3.19994 9.76251C3.3814 9.91648 3.61182 10.0007 3.8498 10H5.9998V20C5.9998 21.1 6.8998 22 7.9998 22H15.9998C16.5302 22 17.0389 21.7893 17.414 21.4142C17.7891 21.0391 17.9998 20.5304 17.9998 20V10H20.1498C20.3878 10.0007 20.6182 9.91648 20.7997 9.76251C20.9811 9.60855 21.1017 9.39491 21.1398 9.16L21.7198 5.69C21.7991 5.21956 21.7077 4.73627 21.4619 4.32734C21.2162 3.91842 20.8324 3.61079 20.3798 3.46Z" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
  <h2 className="font-bold ml-2">MINU SUURUSED</h2>
  

</div>

        <p className="text-sm text-gray-600 mb-4">Kuva ainult sulle sobivad tooted</p>
  <div >
    <div>
  {selectedSizes.length > 0 && (
    <div className="border border-gray-400 rounded-full  text-sm px-2 py-1 mb-2 inline-block">
      Riided: {selectedSizes.join(', ')}
    </div>
  )}

  <div className="flex justify-center">
    <button
      onClick={() => setModalOpen(true)}
      className="text-sm font-semibold rounded-full border px-10 py-2 hover:bg-gray-100 transition"
    >
      {selectedSizes.length > 0 ? 'MUUDA MINU SUURUSED' : 'LISA MINU SUURUSED'}
    </button>
  </div>
</div>


    {/* Suuruste valiku modaal */}
    {modalOpen && (
      <SizeModal
        sizes={sizes}
        initialSizes={selectedSizes}
        onSave={(newSizes) => {
          // Lisa uued suurused
          newSizes.forEach((size) => {
            if (!selectedSizes.includes(size)) toggleSize(size)
          })
          // Eemalda tühistatud suurused
          selectedSizes.forEach((size) => {
            if (!newSizes.includes(size)) toggleSize(size)
          })
          setModalOpen(false)
        }}
        onClose={() => setModalOpen(false)}
      />
    )}
  </div>
</aside>

<aside className="w-full sm:w-80 p-4 border shadow">
        <h2 className="font-bold mb-2">HIND</h2>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-x-4">
            <p className="text-sm text-gray-600">Vahemik</p>

            <div className="relative flex items-center">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="border px-2 py-1 w-20 pr-6"
                min="0"
              />
              {minPrice && (
                <span className="absolute right-2 text-gray-500">€</span>
              )}
            </div>

            <p>-</p>

            <div className="relative flex items-center">
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="border px-2 py-1 w-20 pr-6"
                min="0"
              />
              {maxPrice && (
                <span className="absolute right-2 text-gray-500">€</span>
              )}
            </div>
          </div>

          {(minPrice || maxPrice) && (
            <button
              onClick={() => {
                setMinPrice('')
                setMaxPrice('')
              }}
              className="text-sm text-black-600 hover:underline w-fit"
            >
              Lähtesta hind
            </button>
          )}
        </div>

        <h2 className="font-bold mb-2 mt-6">FILTRID</h2>
        {filters.map((filter) => (
          <label
            key={filter}
            className="font-montserrat flex items-start gap-4 mb-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedFilters.includes(filter)}
              onChange={() => toggleFilter(filter)}
              className="w-5 h-5 border border-gray-800 appearance-none checked:bg-[#F8C6DF] checked:transition-all duration-200 cursor-pointer relative after:content-['✓'] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-black after:text-sm after:opacity-0 checked:after:opacity-100"
            />
            <span className="-mt-[1px]">{filter}</span>
          </label>
        ))}

        <h2 className="font-bold mb-2 mt-6">BRANDID</h2>
        {brands.map((brand) => (
          <label
            key={brand}
            className="font-montserrat flex items-start gap-4 mb-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedBrands.includes(brand)}  // kontroll brändide valikust
              onChange={() => toggleBrand(brand)}       // toggle brändi jaoks
              className="w-5 h-5 border border-gray-800 appearance-none checked:bg-[#F8C6DF] checked:transition-all duration-200 cursor-pointer relative after:content-['✓'] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-black after:text-sm after:opacity-0 checked:after:opacity-100"
            />
            <span className="-mt-[1px]">{brand}</span>
          </label>
        ))}

        <h2 className="font-bold mb-2 mt-6">KATEGOORIAD</h2>
        {categories.map((cat) => (
          <label
            key={cat}
            className="font-montserrat flex items-start gap-4 mb-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedCategories.includes(cat)}
              onChange={() => toggleCategory(cat)}
              className="w-5 h-5 border border-gray-800 appearance-none checked:bg-[#F8C6DF] checked:transition-all duration-200 cursor-pointer relative after:content-['✓'] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-black after:text-sm after:opacity-0 checked:after:opacity-100"
            />
            <span className="-mt-[1px]">{cat}</span>
          </label>
        ))}

        <h2 className="font-bold mt-6 mb-2">SUURUSED</h2>
        {sizes.map((size) => (
          <label
            key={size}
            className="font-montserrat flex items-start gap-4 mb-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedSizes.includes(size)}
              onChange={() => toggleSize(size)}
              className="w-5 h-5 border border-gray-800 appearance-none checked:bg-[#F8C6DF] checked:transition-all duration-200 cursor-pointer relative after:content-['✓'] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-black after:text-sm after:opacity-0 checked:after:opacity-100"
            />
            {size}
          </label>
        ))}
      </aside>
    </div>
  )
}
