"use client";

import { useState } from 'react';

export default function ProductCard({ title, price, image }: ProductProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <div className="relative w-[250px] group">
      
      {/* Favorite icon */}
      <button
  type="button"
  onClick={() => setIsFavorited(!isFavorited)}
  aria-label="Toggle favorite"
  className="absolute top-3 right-3 p-2 z-20 focus:outline-none"
  style={{ backgroundColor: 'rgba(75, 85, 99, 0.4)' }} 
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-6 w-6 transition-colors duration-300 ${
    isFavorited ? 'fill-pink-200 stroke-pink-200' : 'fill-none stroke-white'}`}
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 
     7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 
     19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
/>
  </svg>
</button>



      {/* Image wrapper with hover shadow and gradient overlay */}
      <div
        className="w-[250px] h-[350px] overflow-hidden border border-gray-600 bg-white relative transition-all duration-300 group-hover:[box-shadow:0_6px_8px_rgba(0,0,0,0.15)]"
      >
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* Shadow overlay on image itself */}
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-300 z-10 pointer-events-none" />
      </div>

      {/* Product info */}
      <div className="py-3">
        <p className="font-montserrat text-sm text-gray-700">{title}</p>
        <p className="font-montserrat text-black text-2xl font-bold mt-1">{price.toFixed(2)} €</p>
      </div>
    </div>
  );
}
