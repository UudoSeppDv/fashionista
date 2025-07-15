'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import LoginModal from '@/components/LoginModal'
import SectionFeaturedProducts from '@/components/SectionFeaturedProducts'
import SectionFeaturedBrands from '@/components/SectionFeaturedBrands'
import SectionTrends from '@/components/SectionTrends'
import SectionBanner from '@/components/SectionBanner'
import SectionRecentlyAdded from '@/components/SectionRecentlyAdded'
import SectionRecentlyViewd from '@/components/SectionRecentlyViewd'
import Footer from '@/components/Footer'


export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // lisa see, et hoida favoriidi muutuste timestampi
  const [favoritesUpdatedAt, setFavoritesUpdatedAt] = useState(Date.now())

  return (
    <>
      <main className="min-h-screen text-gray-800 relative">
        <Header
          setShowLoginModal={setShowLoginModal}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />

        <SectionBanner />
        <SectionFeaturedBrands />

        <SectionFeaturedProducts
          favoritesUpdatedAt={favoritesUpdatedAt}
          onFavoritesChange={() => setFavoritesUpdatedAt(Date.now())}
        />

        <svg
  width="1900px"
  height="1500px"
  viewBox="20 220 1444"  // siin muutsin suuremaks ja nihutasin allapoole
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  className="overflow-visible pointer-events-none absolute"
  style={{ zIndex: -1, left: '-150px', top: '1190px' }}
>
      <path
        d="M-1276.09 1470.59C-1288.44 1193.35 -1044.3 949.281 -845.487 899.077C-666.759 854.252 -511.816 906.249 -378.751 1028.17C-350.481 1055.14 -320.5 1080.25 -288.995 1103.37C-169.169 1187.75 -106.901 1155.03 -56.9734 1011.03C-24.9976 918.688 -52.9343 829.262 -79.4126 743.311C-132.032 572.304 -130.911 402.866 -56.9734 242.73C2.04175 115.876 100.101 23.3123 250.892 3.02912C431.528 -21.4004 620.354 104.894 651.095 275.116C663.886 346.051 632.359 410.375 621.476 477.724C611.154 541.487 599.037 604.914 606.105 670.134C613.622 741.966 654.798 766.62 720.769 737.372C776.271 710.57 826.389 673.843 868.644 629.007C1050.51 446.683 1263.46 430.658 1486.51 524.678C1648.97 593.26 1673.31 767.74 1551.69 885.181C1492.45 942.333 1415.37 966.874 1345.36 1004.42C1309.24 1023.8 1271.2 1039.71 1235.97 1060.45C1133.2 1121.52 1119.74 1223.27 1198.28 1317.4C1283.43 1419.38 1404.6 1453.9 1522.97 1493.34C1641.34 1532.79 1740.97 1590.27 1781.02 1718.03C1828.48 1868.41 1758.58 1983.72 1635.95 2048.38C1472.48 2134.56 1294.65 2133.22 1117.27 2111.25C1040.02 2099.71 961.818 2095.73 883.79 2099.37C792.574 2105.98 751.287 2180.28 714.823 2253.23C666.467 2349.94 647.505 2458.31 600.159 2554.9C541.031 2674.81 483.923 2796.51 346.259 2853.1C159.116 2929.98 -121.037 2892.77 -213.375 2649.37C-252.082 2547.17 -241.76 2440.94 -215.057 2336.27C-182.072 2206.5 -125.974 2083.91 -96.5785 1952.46C-74.1393 1852.16 -111.949 1773.16 -198.34 1746.04C-218.125 1741.06 -238.811 1740.83 -258.702 1745.37C-391.991 1765.54 -514.06 1825.61 -645.89 1851.38C-758.086 1873.79 -870.282 1882.87 -983.712 1860.23C-1167.38 1823.92 -1305.27 1677.68 -1276.09 1470.59Z"
        fill="#A692C3"
      />
    </svg>
    
        <div style={{ position: 'relative', zIndex: 10 }}>
          <SectionTrends />
          <SectionRecentlyAdded />

          <SectionRecentlyViewd
            favoritesUpdatedAt={favoritesUpdatedAt}
            onFavoritesChange={() => setFavoritesUpdatedAt(Date.now())}
          />

          <Footer />
        </div>
      </main>
    </>
  )
}
