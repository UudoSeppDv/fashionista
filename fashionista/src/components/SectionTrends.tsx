// components/SectionTrends.tsx
import Image from "next/image";

export default function SectionTrends() {
  return (
    <section className="border-b w-full py-20 px-8 flex flex-col md:flex-row items-center justify-center gap-12">
      {/* Left: Image */}
      <div className="flex-shrink-0 border border-pink-100">
        <Image
          src="/images/fashionista.jpg" // replace with your actual image path
          alt="Fashionista"
          width={512}
          height={512}
          className="object-cover"
        />
      </div>

      {/* Right: Text content */}
      <div className="max-w-md text-center md:text-left">
        <p className="text-sm text-gray-500 mb-2">Fashionista soovitab</p>
        <h2 className="text-3xl md:text-4xl font-bold text-[#1C2A67] leading-snug mb-6">
          Avasta Hetke <br /> Moetrendid
        </h2>

        <button className="inline-flex items-center border border-pink-500 text-pink-500 px-5 py-2 rounded-full font-semibold hover:bg-pink-50 transition">
          VAATA
          <span className="ml-3 text-xl">→</span>
        </button>
      </div>
    </section>
  );
}
