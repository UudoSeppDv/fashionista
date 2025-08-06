'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

type GalleryProps = {
  images: string[];
};

export default function Gallery({ images }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState<boolean | null>(null);

  const prevImage = useCallback(() => {
    setSelectedIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const nextImage = useCallback(() => {
    setSelectedIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'Escape' && modalOpen) {
        setModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen, prevImage, nextImage]);

  if (images.length === 0) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
    setIsDragging(true);
    setIsHorizontalSwipe(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX !== null && touchStartY !== null) {
      const currentX = e.targetTouches[0].clientX;
      const currentY = e.targetTouches[0].clientY;
      const diffX = currentX - touchStartX;
      const diffY = currentY - touchStartY;

      if (isHorizontalSwipe === null) {
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 5) {
          setIsHorizontalSwipe(true);
        } else if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 5) {
          setIsHorizontalSwipe(false);
        }
      }

      if (isHorizontalSwipe) {
        e.preventDefault();
        setDragX(diffX);
      }
    }
  };

  const handleTouchEnd = () => {
    if (isHorizontalSwipe) {
      if (dragX < -50) {
        nextImage();
      } else if (dragX > 50) {
        prevImage();
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
    setDragX(0);
    setIsDragging(false);
    setIsHorizontalSwipe(null);
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
          className="w-full h-[600px] relative overflow-hidden touch-pan-x"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={images[selectedIndex]}
            alt={`Pilt ${selectedIndex + 1}`}
            fill
            className="object-cover transition-transform duration-200 ease-out"
            style={{
              transform: `translateX(${isDragging ? dragX : 0}px)`,
            }}
            onClick={() => setModalOpen(true)}
          />
        </div>

        {images.length > 1 && (
          <div className="flex justify-center mt-2 space-x-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`w-2 h-2 rounded-full ${
                  selectedIndex === i ? 'bg-pink-400' : 'bg-gray-400'
                }`}
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
          >
            &times;
          </button>
        </div>
      )}
    </>
  );
}
