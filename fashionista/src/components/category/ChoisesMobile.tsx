'use client'

import React, { useState, useEffect } from 'react'
import SizeModal from '../SizeModal'


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
  setMinPrice: (price: string) => void;
  setMaxPrice: (price: string) => void;
  onSaveClick: () => void
  onCancelClick: () => void
}

export default function ChoisesModal({
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
  onSaveClick,
  onCancelClick,
}: ChoisesProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [sizeModalOpen, setSizeModalOpen] = useState(false)

  // Lokaalne state filtrite koopia jaoks
  const [localSelectedCategories, setLocalSelectedCategories] = useState<string[]>(selectedCategories)
  const [localSelectedSizes, setLocalSelectedSizes] = useState<string[]>(selectedSizes)
  const [localSelectedBrands, setLocalSelectedBrands] = useState<string[]>(selectedBrands)
  const [localSelectedFilters, setLocalSelectedFilters] = useState<string[]>(selectedFilters)
  const [localMinPrice, setLocalMinPrice] = useState<string>(minPrice)
  const [localMaxPrice, setLocalMaxPrice] = useState<string>(maxPrice)

  // Akordionide avamise seisud modaalis



  // Lokaalsed toggle funktsioonid
  function localToggleCategory(category: string) {
    setLocalSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  function localToggleSize(size: string) {
    setLocalSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
  }

  function localToggleBrand(brand: string) {
    setLocalSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    )
  }

  function localToggleFilter(filter: string) {
    setLocalSelectedFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    )
  }

  

  // Save - rakenda lokaalsed valikud vanematele õigesti
  function handleSave() {
    // Kõigepealt viia vanematesse kõik valikud - peame võrrelda vanu ja uusi ning kutsuma toggle üksikult
    // Eemaldame need, mis olid vanad, kuid pole uutes
    selectedCategories.forEach((cat) => {
      if (!localSelectedCategories.includes(cat)) {
        toggleCategory(cat)
      }
    })
    // Lisame need, mis on uutes, kuid polnud vanades
    localSelectedCategories.forEach((cat) => {
      if (!selectedCategories.includes(cat)) {
        toggleCategory(cat)
      }
    })

    selectedSizes.forEach((size) => {
      if (!localSelectedSizes.includes(size)) {
        toggleSize(size)
      }
    })
    localSelectedSizes.forEach((size) => {
      if (!selectedSizes.includes(size)) {
        toggleSize(size)
      }
    })

    selectedBrands.forEach((brand) => {
      if (!localSelectedBrands.includes(brand)) {
        toggleBrand(brand)
      }
    })
    localSelectedBrands.forEach((brand) => {
      if (!selectedBrands.includes(brand)) {
        toggleBrand(brand)
      }
    })

    selectedFilters.forEach((filter) => {
      if (!localSelectedFilters.includes(filter)) {
        toggleFilter(filter)
      }
    })
    localSelectedFilters.forEach((filter) => {
      if (!selectedFilters.includes(filter)) {
        toggleFilter(filter)
      }
    })

    setMinPrice(localMinPrice)
    setMaxPrice(localMaxPrice)

    onSaveClick()
    setModalOpen(false)
  }

  

  // Cancel - viska lokaalsed muudatused ära
  function handleCancel() {
    setLocalSelectedCategories(selectedCategories)
    setLocalSelectedSizes(selectedSizes)
    setLocalSelectedBrands(selectedBrands)
    setLocalSelectedFilters(selectedFilters)
    setLocalMinPrice(minPrice)
    setLocalMaxPrice(maxPrice)

    onCancelClick()
    setModalOpen(false)
  }

useEffect(() => {
  // Kõigepealt eemaldame need, mis olid valitud, aga nüüd mitte
  selectedSizes.forEach((size) => {
    if (!localSelectedSizes.includes(size)) {
      toggleSize(size);
    }
  });
  // Lisame need, mis nüüd valitud, aga vanemal polnud
  localSelectedSizes.forEach((size) => {
    if (!selectedSizes.includes(size)) {
      toggleSize(size);
    }
  });
}, [localSelectedSizes, selectedSizes, toggleSize]);

const [openSections, setOpenSections] = useState<string[]>([]);

  function toggleSection(key: string) {
    setOpenSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

function AccordionSection({
  title,
  sectionKey,
  children,
  openSections,
  toggleSection,
  transitionClass = 'transition-transform duration-200',
}: {
  title: string;
  sectionKey: string;
  children: React.ReactNode;
  openSections: string[];
  toggleSection: (key: string) => void;
  transitionClass?: string; // optional prop
}) {
  const open = openSections.includes(sectionKey);

  return (
    <div className="border-gray-300">
      <button
        type="button"
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex justify-between items-center py-3 font-bold text-left"
        aria-expanded={open}
        aria-controls={`${sectionKey}-content`}
      >
        <span>{title}</span>
        <svg
          className={`w-4 h-4 ${transitionClass} ${
            open ? 'rotate-180' : 'rotate-0'
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        id={`${sectionKey}-content`}
        className={`px-4 pb-4 ${open ? 'block' : 'hidden'}`}
      >
        {children}
      </div>
    </div>
  );
}


  return (
    <>
      {/* Hamburger icon */}
      <button
        aria-label="Open filters"
        onClick={() => setModalOpen(true)}
        className="top-10 left-5 z-50 flex flex-col justify-between w-8 h-8 cursor-pointer sm:hidden"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 4H14" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 4H3" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 12H12" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 12H3" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 20H16" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 20H3" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2V6" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 10V14" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 18V22" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

    
      {/* Modal content */}
      {modalOpen && (
        <aside
          className="fixed inset-0 bg-[#f1ece6] z-40 overflow-auto font-montserrat mx-auto sm:mx-0 sm:max-w-sm"
          role="dialog"
          aria-modal="true"
          onClick={e => e.stopPropagation()}
        >
            <div className="border-b p-2 pl-6 bg-[#FE9BD4] w-screen">
  <button
    className="text-gray-400 mt-15 hover:text-black"
    onClick={handleCancel}
  >
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15 18L9 12L15 6" stroke="#222222" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
</svg>

  </button>
</div>

          <div className="mb-6 p-5">
            <aside className="w-full sm:w-80 p-4 mb-5 border shadow">
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
                 onClick={() => setSizeModalOpen(true)}
                  className="text-sm font-semibold rounded-full border px-10 py-2 hover:bg-gray-100 transition"
                >
                  {selectedSizes.length > 0 ? 'MUUDA MINU SUURUSED' : 'LISA MINU SUURUSED'}
                </button>
              </div>
            </div>
            
            
                {/* Suuruste valiku modaal */}
                {sizeModalOpen && (
<SizeModal
  sizes={sizes}
  initialSizes={localSelectedSizes}   // <-- LOKAALNE KOOPIA
  onSave={(newSizes) => {
    setLocalSelectedSizes(newSizes)   // <-- Uuendame ainult lokaalselt
    setSizeModalOpen(false)
  }}
  onClose={() => setSizeModalOpen(false)}
/>

)}

              </div>
            </aside>
                     <div className="mb-4">
  <h3 className="font-bold mb-2">HIND</h3>
  <div className="flex gap-2 text-base items-center">
    <input
      type="number"
      placeholder="Min"
      value={localMinPrice}
      onChange={(e) => setLocalMinPrice(e.target.value)}
      className="border px-2 py-1 w-20 pr-3"
      min="0"
    />
    <span>-</span>
    <input
      type="number"
      placeholder="Max"
      value={localMaxPrice}
      onChange={(e) => setLocalMaxPrice(e.target.value)}
      className="border px-2 py-1 w-20 pr-3"
      min="0"
    />
  </div>
</div>



            <AccordionSection title="FILTRID" sectionKey="filters"openSections={openSections}
        toggleSection={toggleSection}>
              {filters.map((filter) => (
                <label key={filter} className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    checked={localSelectedFilters.includes(filter)}
                    onChange={() => localToggleFilter(filter)}
                    className="w-5 h-5 border border-gray-800 appearance-none checked:bg-[#F8C6DF] checked:transition-all duration-200 cursor-pointer relative after:content-['✓'] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-black after:text-sm after:opacity-0 checked:after:opacity-100"
                  />
                  {filter}
                </label>
              ))}
            </AccordionSection>



            <AccordionSection title="BRÄNDID" sectionKey="brands" openSections={openSections}
        toggleSection={toggleSection}>
              {brands.map((brand) => (
                <label key={brand} className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    checked={localSelectedBrands.includes(brand)}
                    onChange={() => localToggleBrand(brand)}
                    className="w-5 h-5 border border-gray-800 appearance-none checked:bg-[#F8C6DF] checked:transition-all duration-200 cursor-pointer relative after:content-['✓'] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-black after:text-sm after:opacity-0 checked:after:opacity-100"
                  />
                  {brand}
                </label>
              ))}
            </AccordionSection>



            <AccordionSection title="KATEGOORIAD" sectionKey="categories" openSections={openSections}
        toggleSection={toggleSection}>
              {categories.map((category) => (
                <label key={category} className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    checked={localSelectedCategories.includes(category)}
                    onChange={() => localToggleCategory(category)}
                    className="w-5 h-5 border border-gray-800 appearance-none checked:bg-[#F8C6DF] checked:transition-all duration-200 cursor-pointer relative after:content-['✓'] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-black after:text-sm after:opacity-0 checked:after:opacity-100"
                  />
                  {category}
                </label>
              ))}
            </AccordionSection>

            <AccordionSection title="SUURUSED" sectionKey="sizes" openSections={openSections}
        toggleSection={toggleSection}>
              {sizes.map((size) => (
                <label key={size} className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    checked={localSelectedSizes.includes(size)}
                    onChange={() => localToggleSize(size)}
                    className="w-5 h-5 border border-gray-800 appearance-none checked:bg-[#F8C6DF] checked:transition-all duration-200 cursor-pointer relative after:content-['✓'] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-black after:text-sm after:opacity-0 checked:after:opacity-100"
                  />
                  {size}
                </label>
              ))}
            </AccordionSection>

  
          </div>

          
<div className="flex gap-4 w-full max-w-sm mx-auto">
  <button
    onClick={handleCancel}
    className="w-1/2 rounded-full border border-gray-400 py-2 px-6 cursor-pointer hover:bg-gray-100 transition"
  >
    Tühista valikud
  </button>
  <button
    onClick={handleSave}
    className="w-1/2 rounded-full bg-pink-600 text-white py-2 px-6 cursor-pointer hover:bg-pink-700 transition"
  >
    Salvesta
  </button>
</div>

        </aside>
      )}

      {/* Size modal */}
    
    </>
  )
}

