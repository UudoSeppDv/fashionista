'use client'

import React from 'react'

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
  customSizes,
  setCustomSizes,
}: ChoisesProps) {

  return (
    <div className="w-80 flex flex-col mb-10 gap-12 ml-10">
      <aside className="w-80 p-4 border shadow">
        <h2 className="font-semibold mb-2">Lisa oma suurused (komadega eraldatult)</h2>
        <input
          type="text"
          placeholder="Näiteks: XS, M, L"
          value={customSizes}
          onChange={(e) => setCustomSizes(e.target.value)}
          className="w-full border px-2 py-1"
        />
      </aside>

      <aside className="w-80 p-4 border shadow">
        <h2 className="font-semibold mb-2">HIND</h2>
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

        <h2 className="font-semibold mb-2 mt-6">FILTRID</h2>
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

        <h2 className="font-semibold mb-2 mt-6">BRANDID</h2>
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

        <h2 className="font-semibold mb-2 mt-6">KATEGOORIAD</h2>
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

        <h2 className="font-semibold mt-6 mb-2">SUURUSED</h2>
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
