'use client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

  
  
  export default function SectionFeaturedBrands() {
    const router = useRouter()
  return (
  
  
  <section className="border-b w-screen h-[360px] bg-[#F1ECE6] flex flex-col items-center justify-center px-6">
      {/* Logo Row */}
      <div className="flex justify-center items-center gap-20 mb-15 max-w-7xl w-full overflow-hidden">
        <div className="h-18 flex items-center">
          <Image src="/images/brandnames/chanel.png" alt="Chanel" width={100} height={40} className="object-contain h-full w-auto" />
        </div>
        <div className="h-18 flex items-center">
          <Image src="/images/brandnames/louisvuitton.png" alt="Louis Vuitton" width={100} height={40} className="object-contain h-full w-auto" />
        </div>
        <div className="h-18 flex items-center">
          <Image src="/images/brandnames/prada.png" alt="Prada" width={100} height={40} className="object-contain h-full w-auto" />
        </div>
        <div className="h-18 flex items-center">
          <Image src="/images/brandnames/calvinklein.png" alt="Calvin Klein" width={100} height={40} className="object-contain h-full w-auto" />
        </div>
        <div className="h-18 flex items-center">
          <Image src="/images/brandnames/denim.png" alt="Denim" width={100} height={40} className="object-contain h-full w-auto" />
        </div>
        <div className="h-18 flex items-center">
          <Image src="/images/brandnames/adidas.png" alt="Adidas" width={100} height={40} className="object-contain h-full w-auto" />
        </div>
      </div>

      {/* CTA Button */}
     <button
  onClick={() => router.push('/category')}
  className="cursor-pointer border border-black rounded-full px-8 py-3 text-sm font-semibold hover:bg-black hover:text-white transition flex items-center gap-2"
>
  VAATA KÕIKI BRÄNDE
  <svg
    width="68"
    height="8"
    viewBox="0 0 68 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-2 w-auto"
  >
    <path
      d="M1.25 3.45068C0.973858 3.45068 0.75 3.67454 0.75 3.95068C0.75 4.22683 0.973858 4.45068 1.25 4.45068V3.45068ZM67.1036 4.30424C67.2988 4.10897 67.2988 3.79239 67.1036 3.59713L63.9216 0.41515C63.7263 0.219887 63.4097 0.219887 63.2145 0.41515C63.0192 0.610412 63.0192 0.926994 63.2145 1.12226L66.0429 3.95068L63.2145 6.77911C63.0192 6.97437 63.0192 7.29096 63.2145 7.48622C63.4097 7.68148 63.7263 7.68148 63.9216 7.48622L67.1036 4.30424ZM1.25 4.45068H66.75V3.45068H1.25V4.45068Z"
      fill="#222222"
    />
  </svg>
</button>


    </section>
  );
}