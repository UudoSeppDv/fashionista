'use client';

import { useState, useEffect } from 'react';
import Gallery from '@/components/Gallery';
import LoginModal from '@/components/LoginModal';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectionFeaturedProducts from './SectionFeaturedProducts';
import { useFavorites } from '@/context/FavoritesContext' 
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation';
import Image from 'next/image';


export type Product = {
  id: string;
  title?: string;
  brand: string;
  description: string;
  category: string;
  filter: string;
  price: number | string;
  images: string[];
  user_id: string;
  location?: string | null;
  public_users?: {
    id: string;
    first_name?: string | null;
    surname?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
    social_media?: Record<string, { url: string; icon?: string }>;
    sold_products_count?: number | null;
    created_at?: string;
    page_url?: string | null; // ← siia see peab kuuluma!
  };
};



type Props = {
  product: Product;
};

export default function SingleProductView({ product}: Props) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoritesUpdatedAt, setFavoritesUpdatedAt] = useState(Date.now())
  const hasAvatar = !!product.public_users?.avatar_url;
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorited = favorites.has(product.id);
  const [followerCount, setFollowerCount] = useState<number>(0);
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();
  const isOwner = currentUserId === product.user_id;
  const handleSendMessageClick = () => {
    if (!product.public_users?.id) {
      alert('Müüja info puudub, ei saa sõnumit saata.');
      return;
    }
    router.push(`/messages/${product.public_users.id}`);
  };

  useEffect(() => {
  const fetchUserId = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      setCurrentUserId(data.user.id);
    }
  };
  fetchUserId();
}, []);

const getInitials = (user?: {
  first_name?: string | null;
  surname?: string | null;
}) => {
  const first = user?.first_name?.charAt(0).toUpperCase() || '';
  const last = user?.surname?.charAt(0).toUpperCase() || '';
  const initials = first + last;
  return initials || '?';
};

  const handleEditClick = () => {
    router.push(`/edit-product/${product.id}`);
  };
  
useEffect(() => {
  if (!product?.id) return;

  const key = 'recentlyViewed';
  const viewedRaw = localStorage.getItem(key);
  let viewed = viewedRaw ? JSON.parse(viewedRaw) : [];

  // Eemalda olemasolev (et vältida duplikaate), lisa uuesti ette
  viewed = viewed.filter((id: string) => id !== product.id);
  viewed.unshift(product.id);

  // Hoia kuni 10 viimast
  const limited = viewed.slice(0, 10);
  localStorage.setItem(key, JSON.stringify(limited));
}, [product?.id]);

useEffect(() => {
  const loadFollowers = async () => {
    if (!product.public_users?.id) return;

const { count, error } = await supabase
  .from('user_followers')
  .select('*', { count: 'exact', head: false })
  .eq('user_id', product.public_users?.id);

    if (error) {
      console.error('Viga jälgijate päringul:', error.message);
    } else {
      setFollowerCount(count || 0);
    }
  };

  loadFollowers();
}, [product.public_users?.id]);


  // Muuda 'user' struktuur vastavaks, mida komponent ootab
const user = product.public_users
  ? {
      id: product.public_users.id,
      user_metadata: {
        full_name:
          (product.public_users.first_name || '') +
          (product.public_users.surname
            ? ' ' + product.public_users.surname
            : ''),
        avatar: product.public_users.avatar_url || '/default-avatar.png',
        followers: 0,
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
         <div
  className={`bg-[#A692C3] p-4 flex items-center gap-4 ${
    product.public_users?.page_url ? 'cursor-pointer hover:opacity-90' : ''
  }`}
  onClick={() => {
    const pageUrl = product.public_users?.page_url;
    if (pageUrl) {
      router.push(`/kasutaja/${pageUrl}`);
    }
  }}
>
  <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center bg-pink-400 text-white font-medium text-xl select-none relative">
  {hasAvatar && product.public_users?.avatar_url ? (
    <Image
      src={product.public_users.avatar_url}
      alt={user?.user_metadata.full_name || 'Müüja'}
      fill
      className="object-cover"
    />
  ) : (
    <>{getInitials(product.public_users)}</>
  )}
</div>

  <div className="flex flex-col flex-grow">
    <span className="font-semibold">
      {user?.user_metadata.full_name || 'Anonüümne'}
    </span>
    <div className="text-sm text-gray-600">
      <span className="font-bold text-gray-800">{followerCount}</span> Jälgijat&nbsp;
      <span className="font-bold text-gray-800">{user?.user_metadata.sold_count ?? 0}+</span> Müüdud
    </div>
  </div>

  {currentUserId && (
  <button
    onClick={(e) => {
  e.stopPropagation();
  if (isOwner) {
    handleEditClick();
  } else {
    handleSendMessageClick();
  }
}}
    className={`border border-black rounded-full px-4 py-1 text-sm font-medium hover:bg-black hover:text-white transition ${
      isOwner ? 'mx-auto' : ''
    }`}
  >
    {isOwner ? 'MUUDA' : 'SAADA SÕNUM'}
  </button>
)}

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
