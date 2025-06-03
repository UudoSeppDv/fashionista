import ProductCard from '@/components/ProductCard'
import { mockListings } from '@/data/mockListings'

export default function SectionRecentlyViewd() {
  const latestProduct = mockListings[0];

  return (
    <section className="border w-full px-[5rem]  py-25">
      <h3 className="text-2xl font-bold mb-6">Viimati Vaadatud</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <ProductCard
            key={latestProduct.id}
            id={latestProduct.id}
            title={latestProduct.title}
            price={latestProduct.price}
            image={latestProduct.image}
          />
        </div>
      </div>
    </section>
  );
}
