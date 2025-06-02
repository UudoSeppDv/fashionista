// components/SectionTrends.tsx
import Image from "next/image";

export default function SectionTrends() {
  return (
    <section className="border-b w-full py-40 px-4 flex flex-col md:flex-row items-start justify-center gap-12">
      {/* Image */}
      <div className="w-full md:w-1/2 max-w-2xl mx-auto md:mx-0 py-4">
        <Image
          src="/images/fashionistaTrend.png"
          alt="Fashionista"
          width={670}
          height={650}
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Text content */}
      <div className="w-full md:w-1/2 max-w-md text-left md:mt-20 mt-4">
        <p className="font-montserrat text-sm text-[#2B438D] mb-2">Fashionista soovitab</p>
        <h2 className="font-montserrat text-3xl md:text-4xl font-bold text-[#2B438D] leading-snug mb-6">
          Avasta Hetke <br /> Moetrendid
        </h2>

        <div className="w-full px-8 md:px-0 md:w-auto">
          <button className="w-full md:w-auto inline-flex items-center justify-center border border-pink-500 text-pink-500 px-5 py-2 rounded-full font-semibold hover:bg-pink-50 transition">
            VAATA
            <span className="ml-3 text-xl">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
