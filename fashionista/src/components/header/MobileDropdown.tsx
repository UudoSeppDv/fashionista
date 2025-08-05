// ./MobileDropdown.tsx
import { useState } from 'react'

const MobileDropdown = ({ label }: { label: string }) => {
  const [open, setOpen] = useState(false)

  const items = [
    `${label} alamkategooria 1`,
    `${label} alamkategooria 2`,
    `${label} alamkategooria 3`,
  ]

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-2 font-semibold"
      >
        {label}
         <svg
    className={`w-4 h-4 transition-transform duration-200 ${
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
      {open && (
        <ul className="pl-4 text-gray-600">
          {items.map((item, i) => (
            <li key={i} className="py-1">
              <button onClick={() => console.log(`Go to ${item}`)}>{item}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MobileDropdown
