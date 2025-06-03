'use client'

import React, { useState } from 'react'

type FiltersProps = {
  categories: string[]
  sizes: string[]
  selectedCategories: string[]
  selectedSizes: string[]
  minPrice: string
  maxPrice: string
  toggleCategory: (category: string) => void
  toggleSize: (size: string) => void
  setMinPrice: (value: string) => void
  setMaxPrice: (value: string) => void

  customSizes: string
  setCustomSizes: (value: string) => void
}

export default function Filters({
  categories,
  sizes,
  selectedCategories,
  selectedSizes,
  minPrice,
  maxPrice,
  toggleCategory,
  toggleSize,
  setMinPrice,
  setMaxPrice,
  customSizes,
  setCustomSizes,
}: FiltersProps) {
  return (
    <>
    <div className="w-64 flex flex-col gap-12 ml-10">

      <aside className="w-64 p-4 border shadow mt-8">
        <h2 className="font-semibold mb-2">Lisa oma suurused (komadega eraldatult)</h2>
        <input
          type="text"
          placeholder="Näiteks: XS, M, L"
          value={customSizes}
          onChange={(e) => setCustomSizes(e.target.value)}
          className="w-full border px-2 py-1"
        />
      </aside>

      <aside className="w-64 p-4 border shadow">
        <h2 className="font-semibold mb-2">Kategooriad</h2>
        {categories.map((cat) => (
         <label key={cat} className="font-montserrat flex items-start gap-4 mb-2 cursor-pointer">
  <input
    type="checkbox"
    checked={selectedCategories.includes(cat)}
    onChange={() => toggleCategory(cat)}
    className="w-5 h-5 border border-gray-800 appearance-none checked:bg-[#F8C6DF] checked:transition-all duration-200 cursor-pointer relative after:content-['✓'] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-black after:text-sm after:opacity-0 checked:after:opacity-100"
  />
  <span className="-mt-[1px]">{cat}</span>
</label>


        ))}

        <h2 className="font-semibold mt-6 mb-2">Hinnavahemik</h2>
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="border px-2 py-1 w-20"
            min="0"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="border px-2 py-1 w-20"
            min="0"
          />
        </div>

        <h2 className="font-semibold mt-6 mb-2">Suurused</h2>
        {sizes.map((size) => (
          <label key={size} className="font-montserrat flex items-start gap-4 mb-2 cursor-pointer">
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
    </>
  )
}
