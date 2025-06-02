import Image from 'next/image'
import Header from '@/components/Header'
import SectionFeaturedProducts from '@/components/SectionFeaturedProducts';
import SectionFeaturedBrands from '@/components/SectionFeaturedBrands';
import SectionTrends from "@/components/SectionTrends";
import SectionBanner from "@/components/SectionBanner";
import SectionRecentlyAdded from '@/components/SectionRecentlyAdded';

export default function Home() {
  return (
    <main className="min-h-screen text-gray-800">
      {/* NAVIGATION */}
        <Header />
        <SectionBanner />
        <SectionFeaturedBrands />
        <SectionFeaturedProducts />
        <SectionTrends />
        <SectionRecentlyAdded />



      {/* FOOTER */}
      <footer className="text-center py-6 border-t mt-12 text-sm text-gray-500">
        © 2025 Fashionista. Kõik õigused kaitstud.
      </footer>
    </main>
  )
}
