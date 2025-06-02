import ProductCard from '@/components/ProductCard'
import { mockListings } from '@/data/mockListings'


export default function SectionFeaturedProducts() {
  return (
    <section className="border-b w-full px-[5rem] py-25">
      {/* FEATURED PRODUCTS (mock) */}
      <h3 className="text-2xl font-bold">Parimad valikud sulle</h3>
      <div
        className="grid gap-[6px]"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        }}
      >
        {mockListings.map((item) => (
          <ProductCard
            key={item.id}
            title={item.title}
            price={item.price}
            image={item.image}
          />
        ))}
      </div>
    </section>
  );
}
