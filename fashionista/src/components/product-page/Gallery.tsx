'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

type GalleryProps = {
  images: string[];
};

export default function Gallery({ images }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Kui selectedIndex muutub, kerime horisontaalselt õigele pildile
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: selectedIndex * scrollRef.current.clientWidth,
        behavior: 'smooth',
      });
    }
  }, [selectedIndex]);

  // Scrolli event, et uuendada aktiivset indeksit
  const onScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const width = scrollRef.current.clientWidth;
      const index = Math.round(scrollLeft / width);
      if (index !== selectedIndex) {
        setSelectedIndex(index);
      }
    }
  };

  if (images.length === 0) return null;

  const prevImage = () => {
    setSelectedIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };

  const nextImage = () => {
    setSelectedIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex gap-8">
        <div className="relative w-[600px] h-[700px] group">
          <div
            className="relative w-full h-full cursor-pointer"
            onClick={() => setModalOpen(true)}
          >
            <Image
              src={images[selectedIndex]}
              alt={`Valitud pilt ${selectedIndex + 1}`}
              fill
              className="object-cover"
            />
          </div>

          {/* Vasaknool */}
          <button
            onClick={prevImage}
            className="z-50 absolute left-2 top-1/2 transform -translate-y-1/2 px-2 text-white text-3xl transition-opacity opacity-0 group-hover:opacity-100"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
            aria-label="Eelmine pilt"
          >
            ‹
          </button>

          {/* Paremnool */}
          <button
            onClick={nextImage}
            className="z-50 absolute right-2 top-1/2 transform -translate-y-1/2 px-2 text-white text-3xl transition-opacity opacity-0 group-hover:opacity-100"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
            aria-label="Järgmine pilt"
          >
            ›
          </button>
        </div>

        <div className="flex flex-col gap-1 max-h-100 overflow-y-auto">
          {images.map((img, i) => (
            <Image
              key={i}
              priority
              src={img}
              alt={`Pilt ${i + 1}`}
              width={120}
              height={136}
              className={`object-cover cursor-pointer border border-gray-800 hover:opacity-80 ${
                i === selectedIndex ? 'ring-2 ring-gray-800' : ''
              }`}
              onClick={() => setSelectedIndex(i)}
            />
          ))}
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden w-full relative">
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory w-full h-[600px]"
          style={{ scrollbarWidth: 'none' /* Firefox */, msOverflowStyle: 'none' /* IE 10+ */ }}
        >
          {images.map((img, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-full h-full relative snap-center cursor-pointer"
              onClick={() => setModalOpen(true)}
            >
              <Image
                src={img}
                alt={`Pilt ${i + 1}`}
                fill
                className="object-cover"
                draggable={false}
                loading="eager"
              />
            </div>
          ))}
        </div>

        {/* Indikaatorid */}
        {images.length > 1 && (
          <div className="flex justify-center mt-2 space-x-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`w-2 h-2 rounded-full ${
                  selectedIndex === i ? 'bg-pink-400' : 'bg-gray-400'
                }`}
                aria-label={`Vali pilt ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setModalOpen(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="z-50 absolute left-6 top-1/2 transform -translate-y-1/2 px-2 text-white text-3xl hover:font-bold transition"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          >
            ‹
          </button>

          <div className="relative w-[90vw] h-[90vh] max-w-full max-h-full rounded shadow-lg">
            <Image
              src={images[selectedIndex]}
              alt={`Suur pilt ${selectedIndex + 1}`}
              fill
              className="object-contain rounded"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="z-50 absolute right-6 top-1/2 transform -translate-y-1/2 px-2 text-white text-3xl hover:font-bold transition"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          >
            ›
          </button>

          <button
            onClick={() => setModalOpen(false)}
            className="absolute top-4 right-4 text-white text-3xl font-bold cursor-pointer select-none"
            aria-label="Sulge modal"
          >
            &times;
          </button>
        </div>
      )}
    </>
  );
}
