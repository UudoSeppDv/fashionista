// components/Header.tsx
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function Header() {
  return (
   <header className="sticky top-0 z-50 bg-white">
  <div className="relative flex items-center justify-between px-6 py-3">
    {/* Search */}
    <div className="flex items-center w-1/3">
      <div className="relative w-full">
        <span className="absolute left-3 top-2.5 text-gray-400">
          <MagnifyingGlassIcon className="w-5 h-5" />
        </span>
        <input
          type="text"
          placeholder="Otsi toote või kategooria järgi"
          className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
    </div>

    {/* Logo */}
    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold tracking-wide text-gray-800 pointer-events-none select-none">
      FASHIONISTA
    </div>

    {/* Buttons */}
    <div className="flex items-center space-x-3 w-1/3 justify-end">
      
      <button className="px-4 py-2 rounded-full border border-black text-sm hover:bg-gray-100">
        Logi sisse / Registreeri
      </button>
    </div>
  </div>

  {/* Category nav */}
  <nav className="border-t border-gray-200 px-6 py-2 text-sm font-medium text-gray-700 space-x-6">
   <a href="#">Uus</a>
   <a href="#">Brändid</a>
   <a href="#">Riided</a>
   <a href="#">Jalanõud</a>
   <a href="#">Sport</a>
   <a href="#">Ilu</a>
  </nav>
</header>

  )
}
