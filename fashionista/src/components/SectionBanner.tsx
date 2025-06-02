 import Image from 'next/image'

  export default function SectionBanner() {
  return (
 
<section className="border-b relative min-h-[553px] flex flex-col md:flex-row items-center justify-center px-6 py-16 bg-[#F1ECE6] overflow-hidden">

{/* Vasak pilt */}
<div className="relative w-full h-[250px] md:h-auto md:absolute md:top-0 md:bottom-0 md:left-0 md:w-[557px]">
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

  );
}