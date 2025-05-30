import Image from 'next/image'
import Header from '@/components/Header'
import SectionFeaturedProducts from '@/components/SectionFeaturedProducts';
import SectionTrends from "@/components/SectionTrends";

export default function Home() {
  return (
    <main className="min-h-screen text-gray-800">
      {/* NAVIGATION */}
        <Header />

      {/* HERO */}

<section className="border-b relative min-h-[553px] flex flex-col md:flex-row items-center justify-center px-6 py-16 bg-[#F1ECE6] overflow-hidden">

  {/* Vasak pilt */}
  <div className="hidden md:block absolute top-0 bottom-0 left-0 w-[557px]">
    <Image
  src="/images/left-image.png"
  alt="Vasak pilt"
  fill
  className="object-contain shadow-lg"
/>

  </div>

     <img
    src="/images/flower-vector.svg"
    alt="Flower vector"
    width={55}
    height={55}
    className="absolute -top-3 left-155"
  />

  <img
    src="/images/flower-vector.svg"
    alt="Flower vector"
    width={110}
    height={110}
    className="absolute top-8 left-130"
  />

    <img
    src="/images/flower-vector.svg"
    alt="Flower vector"
    width={210}
    height={210}
    className=" z-1 absolute top-100 left-220"
  />

      <img
    src="/images/flower-vector.svg"
    alt="Flower vector"
    width={210}
    height={210}
    className=" z-0 absolute top-9 right-32"
  />

  <div className="hidden md:block absolute top-0 bottom-0 right-0 w-[359px] hide-at-1330">
  <Image
    src="/images/right-image.png"
    alt="Parem pilt"
    fill
    className="object-contain shadow-lg"
  />
</div>


  {/* Keskne sisu */}
  <div className="w-full md:w-1/2 text-center relative z-10 px-4">
    {/* Dekoratiivne lill */}
  

<div style={{ marginLeft: '300px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>

  <h2 className="font-clash text-5xl mb-4 font-bold">
    Anna oma stiilile<br />
  </h2>
<h2 className="font-clash text-5xl mb-4 font-bold inline-block ml-0 ml-56-at-1400">
  uus elu! 
</h2>

  <p className="text-gray-700 mb-6 font-montserrat text-left">
    Fashionista pakub hoolikalt valitud taaskasutatud <br /> moekaupu – kvaliteet, ilu ja jätkusuutlikkus ühes.
  </p>
</div>


  </div>
</section>

  <section className="border-b w-screen h-[360px] bg-[#F1ECE6] flex flex-col items-center justify-center px-6">
      {/* Logo Row */}
      <div className="flex justify-center items-center gap-20 mb-15 max-w-7xl w-full overflow-hidden">
        <div className="h-18 flex items-center">
          <Image src="/images/chanel.png" alt="Chanel" width={100} height={40} className="object-contain h-full w-auto" />
        </div>
        <div className="h-18 flex items-center">
          <Image src="/images/louisvuitton.png" alt="Louis Vuitton" width={100} height={40} className="object-contain h-full w-auto" />
        </div>
        <div className="h-18 flex items-center">
          <Image src="/images/prada.png" alt="Prada" width={100} height={40} className="object-contain h-full w-auto" />
        </div>
        <div className="h-18 flex items-center">
          <Image src="/images/calvinklein.png" alt="Calvin Klein" width={100} height={40} className="object-contain h-full w-auto" />
        </div>
        <div className="h-18 flex items-center">
          <Image src="/images/denim.png" alt="Denim" width={100} height={40} className="object-contain h-full w-auto" />
        </div>
        <div className="h-18 flex items-center">
          <Image src="/images/adidas.png" alt="Adidas" width={100} height={40} className="object-contain h-full w-auto" />
        </div>
      </div>

      {/* CTA Button */}
      <button className="border border-black rounded-full px-8 py-3 text-sm font-semibold hover:bg-black hover:text-white transition">
        VAATA KÕIKI BRÄNDE &rarr;
      </button>
    </section>


      {/* FEATURED PRODUCTS (mock) */}

      <SectionFeaturedProducts />

<SectionTrends />


      {/* FOOTER */}
      <footer className="text-center py-6 border-t mt-12 text-sm text-gray-500">
        © 2025 Fashionista. Kõik õigused kaitstud.
      </footer>
    </main>
  )
}
