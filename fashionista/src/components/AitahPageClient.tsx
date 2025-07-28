'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AitahPageClient() {
  const searchParams = useSearchParams();
  const [, setShowLoginModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const price = parseFloat(searchParams.get('price') || '0');
  const service = parseFloat(searchParams.get('service') || '0');  // teenustasu
  const transport = parseFloat(searchParams.get('transport') || '0');
  const total = parseFloat(searchParams.get('total') || '0');

  const format = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    })
      .format(value)
      .replace('€', '')
      .trim() + ' €';

  return (
    <main className="min-h-screen flex flex-col">
      <Header
        setShowLoginModal={setShowLoginModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="flex flex-col items-center justify-center font-montserrat text-center p-6 mt-24 mb-30">
        <h1 className="text-3xl font-bold mb-6">Aitäh!</h1>

        <div className="border p-10 w-full max-w-2xl text-left space-y-5">
          <h2 className="text-2xl font-semibold pb-2">Tellimuse Kokkuvõte</h2>

          <div className="text-base space-y-5">
            <div className="flex justify-between">
              <span>Toote hind:</span>
              <span className="font-semibold">{format(price)}</span>
            </div>
            <div className="flex justify-between">
              <span>Teenustasu:</span>
              <span className="font-semibold">{format(service)}</span>
            </div>
            <div className="flex justify-between">
  <span>Transport:</span>
  <span className="font-semibold">
    {transport === 0 ? 'Tasuta' : format(transport)}
  </span>
</div>

            <div className="flex justify-between border-t pt-5 mt-5 text-lg">
              <span className="font-bold">Kokku:</span>
              <span className="font-bold">{format(total)}</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
