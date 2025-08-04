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
        <p className="font-montserrat text-xl text-[#2B438D] mb-2">Fashionista soovitab</p>
        <h2 className="font-montserrat text-3xl md:text-4xl font-bold text-[#2B438D] leading-snug mb-6">
          Avasta Hetke <br /> Moetrendid
        </h2>

        <div className="w-full px-8 md:px-0 md:w-auto">
          <button className="bg-pink-100 w-full md:w-auto inline-flex items-center justify-center border border-pink-500 text-pink-500 px-5 py-2 rounded-full font-semibold hover:bg-pink-200 transition">
            VAATA
            <span className="ml-3 text-xl"><svg width="67" height="8" viewBox="0 0 67 8" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 3.5C0.723858 3.5 0.5 3.72386 0.5 4C0.5 4.27614 0.723858 4.5 1 4.5V3.5ZM66.8536 4.35355C67.0488 4.15829 67.0488 3.84171 66.8536 3.64645L63.6716 0.464466C63.4763 0.269204 63.1597 0.269204 62.9645 0.464466C62.7692 0.659728 62.7692 0.976311 62.9645 1.17157L65.7929 4L62.9645 6.82843C62.7692 7.02369 62.7692 7.34027 62.9645 7.53553C63.1597 7.7308 63.4763 7.7308 63.6716 7.53553L66.8536 4.35355ZM1 4.5H66.5V3.5H1V4.5Z" fill="#F153B0"/>
</svg>
</span>
          </button>
        </div>
      </div>
    </section>
  );
}
