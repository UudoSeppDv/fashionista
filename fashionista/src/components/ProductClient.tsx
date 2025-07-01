'use client';

import { useState } from 'react';
import Gallery from '@/components/Gallery';
import LoginModal from '@/components/LoginModal';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectionFeaturedProducts from './SectionFeaturedProducts';
import { useFavorites } from '@/context/FavoritesContext' 



export type Product = {
  id: string;
  title?: string; // sul pole 'title' päringus, tee valikuline
  brand: string;
  description: string;
  category: string;
  filter: string;
  price: number | string; // serverist võib tulla string ka
  images: string[];
  user_id: string;
  location?: string | null;
  public_users?: {
    id: string;
    display_name?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
    social_media?: Record<string, { url: string; icon?: string }>;
    sold_products_count?: number | null;
    created_at?: string;
  };
};



type Props = {
  product: Product;
};

export default function ProductClient({ product}: Props) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoritesUpdatedAt, setFavoritesUpdatedAt] = useState(Date.now())
  const hasAvatar = !!product.public_users?.avatar_url;
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorited = favorites.has(product.id);


  // Muuda 'user' struktuur vastavaks, mida komponent ootab
  const user = product.public_users
    ? {
        id: product.public_users.id,
        user_metadata: {
          display_name: product.public_users.display_name || 'Anonüümne',
          avatar: product.public_users.avatar_url || '/default-avatar.png',
          followers: 0, // lisa hiljem päringust või ignoreeri
          sold_count: product.public_users.sold_products_count || 0,
        },
      }
    : undefined;

  return (
    <>
      <Header
        setShowLoginModal={setShowLoginModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        
      />
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      
  <div className=" w-full px-[5rem] py-4 mt-8 text-m  text-gray-400 font-montserrat">
  {product.category} &gt; {product.filter}
</div>
      <div className="w-full px-[5rem] flex flex-col lg:flex-row gap-8 font-montserrat mt-4 pb-10 border-b">
      
        <Gallery images={product.images || []} />

        <div className="flex-1 flex flex-col gap-4">
          {/* Müüja info */}
         <div className="bg-[#A692C3] p-4 flex items-center gap-4">
  <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center bg-pink-400 text-white font-medium text-4xl select-none">
    {hasAvatar && product.public_users?.avatar_url ? (
  <img
    src={product.public_users.avatar_url}
    alt={user?.user_metadata.display_name || 'Müüja'}
    className="w-full h-full object-cover"
  />
) : (
  user?.user_metadata.display_name?.charAt(0).toUpperCase() || '?'
)}

  </div>
  <div className="flex flex-col flex-grow">
    <span className="font-semibold">{user?.user_metadata.display_name}</span>
    <div className="text-sm text-gray-600">
  <span className="font-bold text-gray-800">{user?.user_metadata.followers ?? 0}</span> Jälgijat &nbsp;
  <span className="font-bold text-gray-800">{user?.user_metadata.sold_count ?? 0}+</span> Müüdud
</div>
  </div>
  <button className="border border-black rounded-full px-4 py-1 text-sm font-medium hover:bg-black hover:text-white transition">
    SAADA SÕNUM
  </button>
          </div>

          <div className="text-sm text-gray-600">{product.location}</div>
          <div className="text-sm font-bold">{product.description || 'Kirjeldus puudub'}</div>

          {/* Hind */}
          <div className="text-2xl font-bold mt-20">{Number(product.price).toFixed(2)} €</div>

          {/* Nupud */}
          <div className="flex gap-2">
            <button className="bg-black text-white px-30 py-2 rounded-full hover:bg-gray-900 transition">
              OSTA
            </button>
             {/* Favorite icon */}
        <button
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    toggleFavorite(product.id);
  }}
  aria-label="Toggle favorite"
  className={`rounded-full border p-1 px-4 transition-colors duration-300 hover:bg-gray-100 ${
    isFavorited ? 'border-gray-900 bg-transparent' : 'border-gray-900 bg-transparent hover:bg-gray-100'
  }`}
  
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-6 w-6 ${
      isFavorited ? 'fill-pink-200 stroke-pink-200' : 'fill-none stroke-gray-600'
    }`}
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
         2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
         C13.09 3.81 14.76 3 16.5 3 
         19.58 3 22 5.42 22 8.5
         c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
    />
  </svg>
</button>

          </div>
        </div>
      </div>
  

     <SectionFeaturedProducts
              favoritesUpdatedAt={favoritesUpdatedAt}
              onFavoritesChange={() => setFavoritesUpdatedAt(Date.now())}
            />


      <Footer />
      
    </>
  );
}
