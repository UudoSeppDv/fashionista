'use client';

import React, { useState } from 'react';

type GalleryProps = {
  images: string[];
};

export default function Gallery({ images }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  if (images.length === 0) return null;

  const prevImage = () => {
    setSelectedIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };

  const nextImage = () => {
    setSelectedIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  return (
    <>
      <div className="flex gap-8">
        {/* Suur valitud pilt koos nooltega */}
        <div className="relative w-[400px] h-[500px]">
          <img
            src={images[selectedIndex]}
            alt={`Valitud pilt ${selectedIndex + 1}`}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setModalOpen(true)}
          />

          {/* Vasaknool */}
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 px-3 text-white text-3xl px-2 pb-1 hover:font-bold transition" 
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
            aria-label="Eelmine pilt"
          >
            ‹
          </button>

          {/* Paremnool */}
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 text-white text-3xl px-2 pb-1 hover:font-bold transition" 
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
            aria-label="Järgmine pilt"
          >
            ›
          </button>
        </div>

        {/* Väike galerii veerg */}
        <div className="flex flex-col gap-2">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Pilt ${i + 1}`}
              className={`w-20 h-24 object-cover cursor-pointer border border-gray-800 hover:opacity-80 ${
                i === selectedIndex ? 'ring-2 ring-gray-800' : ''
              }`}
              onClick={() => setSelectedIndex(i)}
            />
          ))}
        </div>
      </div>

      {/* Mida näidatakse kui pilt on modalina */}
      {modalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setModalOpen(false)}
        >
          {/* Vasaknool */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 px-3 text-white text-3xl px-2 pb-1 hover:font-bold transition" 
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
            aria-label="Eelmine pilt"
          >
            ‹
          </button>

          <img
            src={images[selectedIndex]}
            alt={`Suur pilt ${selectedIndex + 1}`}
            className="max-w-[90vw] max-h-[90vh] rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Paremnool */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 px-3 text-white text-3xl px-2 pb-1 hover:font-bold transition" 
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
            aria-label="Järgmine pilt"
          >
            ›
          </button>

          {/* Sulgemisnupp */}
          <button
            onClick={() => setModalOpen(false)}
            className="absolute top-4 right-4 text-white text-3xl font-bold cursor-pointer select-none"
            aria-label="Sulge modaal"
          >
            &times;
          </button>
        </div>
      )}
    </>
  );
}
