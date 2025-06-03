'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import DropdownMenu from './DropdownMenu'
import UserDropdownMenu from './UserDropdownMenu'
import SearchBar from './SearchBar'  // <- lisa import siia


interface HeaderProps {
  setShowLoginModal: React.Dispatch<React.SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}
export default function Header({ setShowLoginModal, searchQuery, setSearchQuery }: HeaderProps) {
  const router = useRouter()

  const [showNav, setShowNav] = useState<boolean>(true);
  const [lastScrollY, setLastScrollY] = useState<number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      const storedPhone = localStorage.getItem("userPhone");

      if (loggedIn && storedPhone) {
        setIsLoggedIn(true);
        setPhone(storedPhone);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userPhone");
    setIsLoggedIn(false);
    setPhone("");
  };

  useEffect(() => {
    const handleLogin = () => {
      if (typeof window !== 'undefined') {
        const loggedIn = localStorage.getItem("isLoggedIn") === "true";
        const storedPhone = localStorage.getItem("userPhone");

        if (loggedIn && storedPhone) {
          setIsLoggedIn(true);
          setPhone(storedPhone);
        }
      }
    };

    window.addEventListener("user-logged-in", handleLogin);
    return () => {
      window.removeEventListener("user-logged-in", handleLogin);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setShowNav(false)
      } else {
        setShowNav(true)
      }
      setLastScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <header className="sticky top-0 z-50">
      {/* Ülemine riba */}
      <div className="z-50 relative flex items-center justify-between px-6 py-3 bg-[#FE9BD4]">
        <div className="flex items-center w-1/3">
          {/* Siin nüüd ainult SearchBar */}
          <SearchBar
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      onSelectSuggestion={(val) => {
        const categorySlug = val.toLowerCase().replace(/\s+/g, '-')
        router.push(`/category/${categorySlug}`)
      }}
    />
        </div>

         <div
      onClick={() => router.push('/')}
      className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold tracking-wide text-gray-800 cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          router.push('/')
        }
      }}
    >
      FASHIONISTA
    </div>

        <div className="flex items-center space-x-3 w-1/3 justify-end">
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <button className="font-semibold font-montserrat bg-black text-white px-5 py-2 rounded-full text-sm">
                MÜÜ
              </button>
              <UserDropdownMenu onLogout={handleLogout} />
              <span className="font-montserrat text-gray-700">
                Hei, <span className="font-bold">{phone}</span>.
              </span>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="font-montserrat px-4 py-2 rounded-full border border-black text-sm hover:bg-gray-100"
            >
              Logi sisse / Registreeri
            </button>
          )}
        </div>
      </div>

      {/* Navibar */}
      <div className="overflow-visible relative">
        <nav
          className={`transition-transform duration-300 ease-in-out transform ${
            showNav ? 'translate-y-0' : '-translate-y-full'
          } z-20 border-t border-b border-gray-600 px-6 py-4 text-sm font-semibold text-gray-700 space-x-6 font-montserrat bg-[#F1ECE6] flex`}
        >
          <DropdownMenu label="UUS" title="UUS" links={[
            { label: 'Uus 1', href: '#' },
            { label: 'Uus 2', href: '#' },
            { label: 'Uus 3', href: '#' },
          ]} />

          <DropdownMenu label="BRÄNDID" title="BRÄNDID" links={[
            { label: 'Bränd 1', href: '#' },
            { label: 'Bränd 2', href: '#' },
          ]} />

          <DropdownMenu label="RIIDED" title="RIIDED" links={[
            { label: 'Meeste riided', href: '#' },
            { label: 'Naiste riided', href: '#' },
          ]} />

          <DropdownMenu label="JALANÕUD" title="JALANÕUD" links={[
            { label: 'Tossud', href: '#' },
            { label: 'Saapad', href: '#' },
          ]} />

          <DropdownMenu label="SPORT" title="SPORT" links={[
            { label: 'Jooks', href: '#' },
            { label: 'Fitness', href: '#' },
          ]} />

          <DropdownMenu label="ILU" title="ILU" links={[
            { label: 'Meik', href: '#' },
            { label: 'Parfüümid', href: '#' },
          ]} />
        </nav>
      </div>
    </header>
  )
}
