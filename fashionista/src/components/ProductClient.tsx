'use client';

import { useState } from 'react';
import Gallery from '@/components/Gallery';
import LoginModal from '@/components/LoginModal';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export type Product = {
  id: string;
  brand: string;
  price: number;
  images: string[];
  description?: string;
  seller_name?: string;
  seller_avatar?: string;
  location?: string;
  followers?: number;
  sold_count?: number;
};

type Props = {
  product: Product;
};

export default function ProductClient({ product }: Props) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <Header
        setShowLoginModal={setShowLoginModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      <div className="max-w-6xl mx-auto p-6 flex gap-8">
        <Gallery images={product.images || []} />

        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-[#D7C0E4] p-4 rounded-md flex items-center gap-4">
            <img
              src={product.seller_avatar || '/default-avatar.png'}
              alt={product.seller_name || 'Müüja'}
              className="w-14 h-14 rounded-full object-cover"
            />
            <div className="flex flex-col flex-grow">
              <span className="font-semibold">{product.seller_name || 'Laura Lõhmus'}</span>
              <div className="text-sm text-gray-700">
                {product.followers ?? 34} Jälgijat · {product.sold_count ?? 40}+ Müüdud
              </div>
            </div>
            <button className="border border-black rounded-full px-4 py-1 text-sm font-medium hover:bg-black hover:text-white transition">
              SAADA SÕNUM
            </button>
          </div>

          <div className="text-sm text-gray-800">{product.location || 'Tallinn, Estonia'}</div>
          <div>{product.description || 'H&M kott heas korras'}</div>

          <div className="text-2xl font-semibold">{Number(product.price).toFixed(2)} €</div>

          <div className="flex gap-2">
            <button className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-900 transition">
              OSTA
            </button>
            <button className="border border-black rounded-full px-4 py-2">🤍</button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
