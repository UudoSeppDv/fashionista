import ProductCard from '@/components/ProductCard'
import { mockListings } from '@/data/mockListings'

export default function ListingsPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tooted</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {mockListings.map((item) => (
          <ProductCard
            key={item.id}
            title={item.title}
            price={item.price}
            image={item.image}
          />
        ))}
      </div>
    </main>
  )
}
