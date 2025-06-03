'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import DropdownMenu from './DropdownMenu'


export default function Header({ setShowLoginModal }) {
  const [showNav, setShowNav] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [phone, setPhone] = useState("");

useEffect(() => {
  const loggedIn = localStorage.getItem("isLoggedIn") === "true";
  const storedPhone = localStorage.getItem("userPhone");

  if (loggedIn && storedPhone) {
    setIsLoggedIn(true);
    setPhone(storedPhone);
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
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const storedPhone = localStorage.getItem("userPhone");
    if (loggedIn && storedPhone) {
      setIsLoggedIn(true);
      setPhone(storedPhone);
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

        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold tracking-wide text-gray-800 pointer-events-none select-none">
          FASHIONISTA
        </div>

        <div className="flex items-center space-x-3 w-1/3 justify-end">
          {isLoggedIn ? (
  <div className="flex items-center space-x-3">
    <span className="text-sm text-gray-700">Tere, {phone}</span>
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded-full border border-red-500 text-sm text-red-500 hover:bg-red-100"
    >
      Logi välja
    </button>
  </div>
) : (
  <button
    onClick={() => setShowLoginModal(true)}
    className="px-4 py-2 rounded-full border border-black text-sm hover:bg-gray-100"
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



