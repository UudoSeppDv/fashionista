import Image from 'next/image'

export default function SectionBanner() {
  return (
    <section className="border-b relative md:min-h-[553px] flex flex-col md:flex-row items-center justify-center py-0 bg-[#F1ECE6] overflow-hidden">


      {/* Mobile full-width image */}
      <div className="relative w-full h-[300px] md:hidden">
        <Image
          src="/images/left-image.png"
          alt="Vasak pilt"
          fill
          className="object-cover"
        />
        {/* Fade effect */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#F1ECE6] to-transparent" />
      </div>

      {/* Left image for md+ */}
      <div className="hidden md:block relative w-full h-[250px] md:h-auto md:absolute md:top-0 md:bottom-0 md:left-0 md:w-[557px]">
        <Image
          src="/images/left-image.png"
          alt="Vasak pilt"
          fill
          className="object-contain shadow-lg"
        />
      </div>

        <Image
    src="/images/flower-vector.svg"
    alt="Flower vector"
    width={55}
    height={55}
    className="absolute -top-3 left-155"
  />

  <Image
    src="/images/flower-vector.svg"
    alt="Flower vector"
    width={110}
    height={110}
    className="absolute top-8 left-130"
  />

    <Image
    src="/images/flower-vector.svg"
    alt="Flower vector"
    width={210}
    height={210}
    className=" z-1 absolute top-100 left-220"
  />

<Image
  src="/images/flower-vector.svg"
  alt="Flower vector"
  width={210}
  height={210}
  className="hidden md:block z-0 absolute top-9 right-32"
/>


      {/* Right image */}
      <div className="hidden md:block absolute top-0 bottom-0 right-0 w-[359px] hide-at-1330">
        <Image
          src="/images/right-image.png"
          alt="Parem pilt"
          fill
          className="object-contain shadow-lg"
        />
      </div>

      

      {/* Text content */}
      <div className="w-full md:w-1/2 text-center relative z-10 px-4 mt-[-50px] md:mt-0">
        <div className="md:ml-[300px] flex flex-col items-start md:items-start">
          <h2 className="font-clash text-5xl mb-4 font-bold">
            Anna oma stiilile<br />
          </h2>
          <h2 className="font-clash text-5xl mb-4 font-bold inline-block md:ml-[14rem]">
            uus elu! 
          </h2>
          <p className="text-gray-700 mb-6 font-montserrat text-left p-2 rounded-md">
            Fashionista pakub hoolikalt valitud taaskasutatud <br /> moekaupu – kvaliteet, ilu ja jätkusuutlikkus ühes.
          </p>
        </div>
      </div>
    </section>
  );
}
