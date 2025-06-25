  import Image from "next/image";

  
  
  export default function SectionFeaturedBrands() {
  return (
  
  
  <section className="border-b w-screen h-[360px] bg-[#F1ECE6] flex flex-col items-center justify-center px-6">
      {/* Logo Row */}
      <div className="flex justify-center items-center gap-20 mb-15 max-w-7xl w-full overflow-hidden">
        <div className="h-18 flex items-center">
          <Image src="/images/brandNames/chanel.png" alt="Chanel" width={100} height={40} className="object-contain h-full w-auto" />
        </div>
        <div className="h-18 flex items-center">
          <Image src="/images/brandNames/louisvuitton.png" alt="Louis Vuitton" width={100} height={40} className="object-contain h-full w-auto" />
        </div>
        <div className="h-18 flex items-center">
          <Image src="/images/brandNames/prada.png" alt="Prada" width={100} height={40} className="object-contain h-full w-auto" />
        </div>
        <div className="h-18 flex items-center">
          <Image src="/images/brandNames/calvinklein.png" alt="Calvin Klein" width={100} height={40} className="object-contain h-full w-auto" />
        </div>
        <div className="h-18 flex items-center">
          <Image src="/images/brandNames/denim.png" alt="Denim" width={100} height={40} className="object-contain h-full w-auto" />
        </div>
        <div className="h-18 flex items-center">
          <Image src="/images/brandNames/adidas.png" alt="Adidas" width={100} height={40} className="object-contain h-full w-auto" />
        </div>
      </div>

      {/* CTA Button */}
      <button className="border border-black rounded-full px-8 py-3 text-sm font-semibold hover:bg-black hover:text-white transition">
        VAATA KÕIKI BRÄNDE &rarr;
      </button>
    </section>
  );
}