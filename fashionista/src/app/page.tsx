import Image from 'next/image'
import Header from '@/components/Header'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      {/* NAVIGATION */}
        <Header />

      {/* HERO */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 py-16 bg-purple-100">
        <div className="max-w-xl">
          <h2 className="text-4xl font-bold text-purple-800 mb-4">Avasta stiilsed kasutatud rõivad</h2>
          <p className="text-gray-700 mb-6">Müü või osta ainulaadseid moeesemeid. Säästa loodust ja raha!</p>
          <a href="/listings" className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700">
            Sirvi tooteid
          </a>
        </div>
        <div className="mt-8 md:mt-0">
          <Image
            src="/images/hero.jpg"
            alt="Hero pilt"
            width={400}
            height={300}
            className="rounded-xl shadow-lg"
          />
        </div>
      </section>

      {/* FEATURED PRODUCTS (mock) */}
      <section className="px-6 py-12">
        <h3 className="text-2xl font-bold mb-6">Populaarsed tooted</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-4">
            <img src="/images/jacket.jpg" alt="jakk" className="w-full h-48 object-cover rounded" />
            <h4 className="mt-2 font-semibold">Vintage nahkjakk</h4>
            <p className="text-sm text-gray-600">45 €</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <img src="/images/jeans.jpg" alt="teksad" className="w-full h-48 object-cover rounded" />
            <h4 className="mt-2 font-semibold">Teksapüksid</h4>
            <p className="text-sm text-gray-600">30 €</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <img src="/images/glasses.jpg" alt="prillid" className="w-full h-48 object-cover rounded" />
            <h4 className="mt-2 font-semibold">Retro prillid</h4>
            <p className="text-sm text-gray-600">15 €</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-6 border-t mt-12 text-sm text-gray-500">
        © 2025 Fashionista. Kõik õigused kaitstud.
      </footer>
    </main>
  )
}
