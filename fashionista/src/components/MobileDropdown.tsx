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
        className="w-full flex justify-between items-center py-2 border-b font-semibold"
      >
        {label}
        <span>{open ? '−' : '+'}</span>
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
