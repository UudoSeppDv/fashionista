'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useSwipeable } from 'react-swipeable';

type GalleryProps = {
  images: string[];
};

export default function Gallery({ images }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const modalScrollRef = useRef<HTMLDivElement>(null);
const prevModalOpen = useRef(modalOpen);
const selectedIndexRef = useRef(selectedIndex);

// Uuendame refi iga renderiga, aga effecti ei käivitata
selectedIndexRef.current = selectedIndex;

useEffect(() => {
  if (!prevModalOpen.current && modalOpen && isMobile && modalScrollRef.current) {
    const timeout = setTimeout(() => {
      modalScrollRef.current?.scrollTo({
        left: selectedIndexRef.current * modalScrollRef.current.clientWidth,
        behavior: 'instant', // kohe kerimine
      });
    },);

    return () => clearTimeout(timeout);
  }

  prevModalOpen.current = modalOpen;
}, [modalOpen, isMobile]); // NB! selectedIndex ei lähe dependencyks



  // Kui selectedIndex muutub, kerime horisontaalselt õigele pildile (ainult galeriis, mitte modalis)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: selectedIndex * scrollRef.current.clientWidth,
        behavior: 'smooth',
      });
    }
  }, [selectedIndex]);

  // Scroll event, et uuendada aktiivset indeksit (peagaleriis)
  const onScroll = () => {
    if (modalOpen) return; // ignoreeri kui modal avatud
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const width = scrollRef.current.clientWidth;
      const index = Math.round(scrollLeft / width);
      if (index !== selectedIndex) {
        setSelectedIndex(index);
      }
    }
  };

  // Scroll event modalis (mobiil)
  const onModalScroll = () => {
    if (modalScrollRef.current) {
      const scrollLeft = modalScrollRef.current.scrollLeft;
      const width = modalScrollRef.current.clientWidth;
      const index = Math.round(scrollLeft / width);
      if (index !== selectedIndex) setSelectedIndex(index);
    }
  };

  // Kui modal avatakse mobiilis, kerime õigesse kohta

  // Kontrolli ekraani laiust
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // swipe ainult desktop modalis
  const handlers = useSwipeable({
    onSwipedLeft: () => nextImage(),
    onSwipedRight: () => prevImage(),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const prevImage = () => {
    setSelectedIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };

  const nextImage = () => {
    setSelectedIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  if (images.length === 0) return null;

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
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {images.map((img, i) => (
            <div
  key={i}
  className="flex-shrink-0 w-full h-full relative snap-center cursor-pointer"
  onClick={() => {
    setSelectedIndex(i);
    setModalOpen(true);
  }}
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
          className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-[rgba(0,0,0,0.7)]"
          onClick={() => setModalOpen(false)}
        >
          <div
            {...(!isMobile ? handlers : {})} // swipe ainult desktopil
            onClick={(e) => e.stopPropagation()}
            className="relative w-[90vw] h-[90vh] max-w-full max-h-full rounded shadow-lg flex items-center justify-center"
          >
            {/* Vasaknool ainult desktopil */}
            {!isMobile && (
              <button
                onClick={prevImage}
                className="z-50 absolute left-6 top-1/2 hidden md:block transform -translate-y-1/2 px-2 text-white text-3xl hover:font-bold transition"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                aria-label="Eelmine pilt"
              >
                ‹
              </button>
            )}

            {/* MODALI GALERII */}
            <div
              ref={modalScrollRef}
              onScroll={isMobile ? onModalScroll : undefined}
              className={
                isMobile
                  ? 'flex w-full h-full overflow-x-auto scroll-smooth snap-x snap-mandatory'
                  : 'w-full h-full flex items-center justify-center'
              }
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {isMobile ? (
                images.map((img, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-full h-full relative snap-center"
                  >
                    <Image
                      src={img}
                      alt={`Suur pilt ${i + 1}`}
                      fill
                      className="object-contain rounded"
                      draggable={false}
                    />
                  </div>
                ))
              ) : (
                <div className="relative w-[600px] h-[700px] cursor-pointer">
                  <Image
                    src={images[selectedIndex]}
                    alt={`Suur pilt ${selectedIndex + 1}`}
                    fill
                    className="object-contain rounded"
                    draggable={false}
                  />
                </div>
              )}
            </div>

            {/* Paremnool ainult desktopil */}
            {!isMobile && (
              <button
                onClick={nextImage}
                className="z-50 absolute right-6 top-1/2 hidden md:block transform -translate-y-1/2 px-2 text-white text-3xl hover:font-bold transition"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                aria-label="Järgmine pilt"
              >
                ›
              </button>
            )}

            {/* Sulgemisnupp */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-white text-3xl font-bold cursor-pointer select-none"
              aria-label="Sulge modal"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
