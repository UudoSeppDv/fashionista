import Image from 'next/image'
import { mockListings } from '@/data/mockListings'

export default function SectionRecentlyAdded() {
  if (!mockListings || mockListings.length < 1) return null;

  // Eeldame, et kõige uuem on esimesena
  const [first, ...rest] = mockListings.slice(0, 5);

  return (
    <section className="py-8">
  <h2 className="px-14 text-xl font-bold mb-4">Hiljuti lisatud</h2>

  <div className="flex flex-col md:flex-row gap-2 justify-center items-stretch">
    
    {/* Vasak suur pilt */}
    <div className="border border-gray-600 relative w-[713px] h-[922px]">
      <Image
        src={first.image}
        alt={first.brand}
        fill
        className="object-cover"
      />
    </div>

    {/* 2x2 ruudustik paremal */}
    <div className=" grid grid-cols-2 grid-rows-2 gap-2 w-[713px] h-[926px]">
      {rest.map((item) => (
        <div key={item.id} className="relative w-[348px] h-[455px]">
          <Image
            src={item.image}
            alt={item.brand}
            fill
            className="object-cover border border-gray-600"
          />
        </div>
      ))}
    </div>

  </div>
</section>

  );
}
