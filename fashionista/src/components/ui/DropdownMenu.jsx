'use client'

import { useState, useEffect, useRef } from 'react'

export default function DropdownMenu({ label, links, title}) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  // Sulge dropdown, kui klikitakse väljapoole
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {label}
      </button>

      {isOpen && (
        <div
          className={`
  fixed left-0 right-0 top-[53px]
  bg-[#F1ECE6] border-b border-gray-300 shadow-lg z-[10000]
  px-6
`}
        >
         <div className="pt-10 pb-10 mx-auto flex flex-col gap-2 items-start">
            {title && (
              <div className="w-full text-gray-500 text-sm mb-2 border-gray-200 pb-1 font-light">
                {title}
              </div>
            )}
  {links.map((link, i) => (
    <a
      key={i}
      href={link.href}
      className="text-sm font-medium hover:underline text-left"
    >
      {link.label}
    </a>
  ))}
</div>



        </div>
      )}
    </div>
  )
}
