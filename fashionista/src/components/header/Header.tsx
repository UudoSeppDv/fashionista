'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Database } from '..../../../types/supabase' 
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import DropdownMenu from '../DropdownMenu'
import UserDropdownMenu from './UserDropdownMenu'
import SearchBar from './SearchBar'
import NotificationDropdown from './NotificationDropdown'
import MobileDropdown from './MobileDropdown'
import Link from 'next/link'

interface HeaderProps {
  setShowLoginModal: React.Dispatch<React.SetStateAction<boolean>>;
  searchQuery: string;
  
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export default function Header({ setShowLoginModal, searchQuery, setSearchQuery }: HeaderProps) {
  const router = useRouter()
  const [showNav, setShowNav] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const supabase = createClientComponentClient<Database>();
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showUserOptions, setShowUserOptions] = useState(false)


  // Komponendi sees:
useEffect(() => {
  const handleResize = () => {
    if (window.innerWidth >= 640) {
      setMobileMenuOpen(false);
    }
  };

  window.addEventListener('resize', handleResize);

  // Cleanup listeneri eemaldamiseks
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        setIsLoggedIn(true)
        setUserId(session.user.id)

        // kui tahad nime profiilist, eeldades et sul on näiteks
        // public.profiles tabel kus on `full_name`:
        const { data } = await supabase
          .from('public_users')
          .select('first_name')
          .eq('id', session.user.id)
          .single()

        if (data?.first_name) {
          setUserName(data.first_name)
        } else {
          setUserName(session.user.email ?? null); // fallback
        }

      } else {
        setIsLoggedIn(false)
        setUserName(null)
      }
    }

    checkSession()

    // kuula auth state muutusi
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkSession()
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    setUserName(null)
  }

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

  const [hasUnread, setHasUnread] = useState(false)

useEffect(() => {
  if (!userId) return;

  const checkUnread = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('id')
      .eq('receiver_id', userId)
      .eq('on_read', false)
      .limit(1)

    if (!error) {
      setHasUnread(data.length > 0)
    }
  }

  checkUnread()

  const channel = supabase
    .channel(`unread-messages-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`,
      },
      async () => {
        await checkUnread()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [userId, supabase])



  return (
    <header className="sticky top-0 z-50">
      <div className="z-50 relative flex items-center justify-between px-6 py-3 bg-[#FE9BD4]">
      <div className="flex items-center w-1/3">
  {/* Väike ekraan – hamburger menu nupp */}
<button
  className="sm:hidden flex flex-col justify-center items-center w-8 h-8 relative"
  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
  aria-label={mobileMenuOpen ? 'Sulge menüü' : 'Ava menüü'}
>
  <span
    className={`block h-0.5 w-6 bg-gray-800 rounded transform transition duration-300 ease-in-out
      ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : 'rotate-0 translate-y-0'}`}
  />
  <span
    className={`block h-0.5 w-6 bg-gray-800 rounded my-1 transition-opacity duration-300 ease-in-out
      ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}
  />
  <span
    className={`block h-0.5 w-6 bg-gray-800 rounded transform transition duration-300 ease-in-out
      ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : 'rotate-0 translate-y-0'}`}
  />
</button>

  {/* Suur ekraan – otsinguriba */}
  <div className="hidden sm:flex w-full">
    <SearchBar
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      onSelectSuggestion={(val) => {
        const categorySlug = val.toLowerCase().replace(/\s+/g, '-')
        router.push(`/category/${categorySlug}`)
      }}
    />
  </div>
</div>

     <div
  onClick={() => router.push('/')}
  className="absolute top-1/2 transform -translate-y-1/2 left-4 ml-13 sm:left-1/2 sm:-translate-x-1/2 sm:ml-0 cursor-pointer text-2xl font-bold tracking-wide text-gray-800"
>
  FASHIONISTA
</div>
        <div className="flex items-center space-x-3 w-1/3 justify-end">
          {isLoggedIn ? (
            <div className="flex items-center space-x-2">
              <button
  onClick={() => router.push('/add-product')}
  className="hidden sm:inline-flex font-semibold font-montserrat bg-black text-white px-5 py-2 rounded-full text-sm hover:bg-gray-800 transition-colors duration-200"
>
  MÜÜ
</button>



<div className="flex items-center gap-5 mx-4">
  <div className="relative hover:scale-110 w-5 h-[22px]">
    <button onClick={() => router.push('/messages')}>
      <svg
        width="25"
        height="25"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.9 20C9.80858 20.9791 12.0041 21.2443 14.0909 20.7478C16.1777 20.2514 18.0186 19.0259 19.2818 17.2922C20.545 15.5586 21.1474 13.4308 20.9806 11.2922C20.8137 9.15366 19.8886 7.14502 18.3718 5.62824C16.855 4.11146 14.8464 3.1863 12.7078 3.01946C10.5693 2.85263 8.44147 3.45509 6.70782 4.71829C4.97417 5.98149 3.74869 7.82236 3.25222 9.90916C2.75575 11.996 3.02094 14.1915 4 16.1L2 22L7.9 20Z"
          stroke="#222222"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {hasUnread && (
        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
      )}
    </button>
  </div>

  <div className="cursor-pointer relative w-5 h-5">
    <NotificationDropdown />
  </div>

  <div className="cursor-pointer relative w-5 h-5">
    <UserDropdownMenu
      onLogout={handleLogout}
      userName={userName ?? 'Kasutaja'}
    />
  </div>
</div>




            <div className="hidden ml-2 relative sm:inline font-montserrat text-gray-700">
  Hei, <span className="font-bold">{userName ?? 'Kasutaja'}</span>.
</div>
            </div>
          ) : (
            <>
  <button
    onClick={() => setShowLoginModal(true)}
    className="relative hidden sm:inline-block font-montserrat px-4 py-2 rounded-full border border-black text-sm hover:bg-gray-100"
  >
    Logi sisse / Registreeri
  </button>

  <button
    onClick={() => setShowLoginModal(true)}
    className="sm:hidden w-5 h-5 mr-4 hover:scale-110 transition-transform"
    aria-label="Logi sisse või registreeru"
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full text-gray-700"
    >
      <path
        d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
        stroke="#222222"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.5901 22C20.5901 18.13 16.7402 15 12.0002 15C7.26015 15 3.41016 18.13 3.41016 22"
        stroke="#222222"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </button>
</>

          )}
        </div>
       
    </div>
  

      <div className="overflow-visible relative">
        <nav
  className={`hidden sm:flex transition-transform duration-300 ease-in-out transform ${
    showNav ? 'translate-y-0' : '-translate-y-full'
  } z-20 border-t border-b border-gray-600 px-6 py-4 text-sm font-semibold text-gray-700 space-x-6 font-montserrat bg-[#F1ECE6]`}
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
      
          {/* Mobile Menu */}
    {mobileMenuOpen && (
      <div className="sm:hidden top-0 left-0 right-0 bg-white z-40 flex flex-col px-6 py-4 max-h-[calc(100vh-64px)] overflow-y-auto">

{isLoggedIn ? (
  <div className="space-y-3 mb-5 font-montserrat">
<button
  onClick={() => setShowUserOptions(!showUserOptions)}
  className="text-gray-700 w-full text-left py-2 border-b pb-5 border-gray-200 flex justify-between items-center"
>
  <span>
    Tere, <span className="font-semibold">{userName ?? 'Kasutaja'}</span>!
  </span>

  {/* Dropdown ikoon */}
  <svg
    className={`w-4 h-4 transition-transform duration-200 ${
      showUserOptions ? 'rotate-180' : 'rotate-0'
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

    {showUserOptions && (
      <>
        <button
          onClick={() => {
            router.push('/lemmikud')
            setMobileMenuOpen(false)
            setShowUserOptions(false)
          }}
          className="w-full text-left py-2 border-b border-gray-200"
        >
          Lemmikud
        </button>
        <button
          onClick={() => {
            router.push('/minu-pood')
            setMobileMenuOpen(false)
            setShowUserOptions(false)
          }}
          className="w-full text-left py-2 border-b border-gray-200"
        >
          Minu Pood
        </button>
        <button
          onClick={() => {
            router.push('/minu-poe-tellimused')
            setMobileMenuOpen(false)
            setShowUserOptions(false)
          }}
          className="w-full text-left py-2 border-b border-gray-200"
        >
          Minu Poe Tellimused
        </button>
        <button
          onClick={() => {
            router.push('/minu-ostud')
            setMobileMenuOpen(false)
            setShowUserOptions(false)
          }}
          className="w-full text-left py-2 border-b border-gray-200"
        >
          Minu Ostud
        </button>
        <button
          onClick={() => {
            router.push('/konto')
            setMobileMenuOpen(false)
            setShowUserOptions(false)
          }}
          className="w-full text-left py-2 border-b border-gray-200"
        >
          Konto Seaded
        </button>
        <button
          onClick={() => {
            router.push('/liikmelisus')
            setMobileMenuOpen(false)
            setShowUserOptions(false)
          }}
          className="w-full text-left py-2 border-b border-gray-200"
        >
          Liikmelisus
        </button>
        <button
          onClick={() => {
            handleLogout()
            setMobileMenuOpen(false)
            setShowUserOptions(false)
          }}
          className="w-full text-left py-2 text-red-600"
        >
          Logi välja
        </button>
      </>
    )}
  </div>
) : (
  <div className="border-gray-200 border-b">
  <button
    onClick={() => {
      setShowLoginModal(true)
      setMobileMenuOpen(false)
    }}
    className="w-full border py-2 mb-10 rounded-full"
  >
    Logi sisse / Registreeri
  </button>
  </div>
)}


<div className="mt-10">
        {/* Mobile SearchBar */}
        <SearchBar
          searchQuery={searchQuery}
          
          setSearchQuery={setSearchQuery}
          onSelectSuggestion={(val) => {
            const categorySlug = val.toLowerCase().replace(/\s+/g, '-')
            router.push(`/category/${categorySlug}`)
            setMobileMenuOpen(false)
            
          }}

        />
        </div>
        {isLoggedIn ? (
            <>
              <button
                onClick={() => {
                  router.push('/add-product')
                  setMobileMenuOpen(false)
                }}
                className="w-full bg-black text-white py-2 my-4 rounded-full"
              >
                MÜÜ
              </button>
            </>
          ) : (
           <div></div>
          )}

        {/* Mobile dropdown accordion */}


<div className="mt-4 space-y-2">
  {['UUS', 'BRÄNDID', 'RIIDED', 'JALANÕUD', 'SPORT', 'ILU'].map((label) => {
    if (label === 'UUS' || label === 'BRÄNDID') {
      return (
        <Link
          key={label}
          href={`/search?category=${label.toLowerCase()}`} // või mingi sobiv url
          className="block p-2 text-lg font-semibold hover:bg-gray-100 rounded"
        >
          {label}
        </Link>
      )
    }
    return <MobileDropdown key={label} label={label} />
  })}
</div>

        
      </div>
      
    )}
    </header>
  )
}
