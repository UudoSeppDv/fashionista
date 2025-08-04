import { FaFacebook, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-zinc-900 z-10 px-5 text-zinc-300 py-15">
      <div className="font-montserrat max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Vasak veerg */}
        <div className="space-y-4">
          <p>
            Vajad abi? Saada meile kiri <br /> aadressile <a href="mailto:info@fashionista.com" className="underline">info@fashionista.com</a>.<br />
            Oleme sinu jaoks olemas.
          </p>

          <div className="flex items-center space-x-4 py-2">
            <a href="#" aria-label="Instagram">
              <FaInstagram className="text-white text-3xl hover:text-purple-400 transition" />
            </a>
            <a href="#" aria-label="Facebook">
              <FaFacebook className="text-white text-3xl hover:text-purple-400 transition" />
            </a>
          </div>

          {/* Lisa border-b väikestel ekraanidel */}
          <div className="md:hidden border-b border-zinc-700 py-4" />

          <div className="flex space-x-6 pt-4 text-sm">
            <a href="/privaatsus" className="underline hover:text-white">Privaatsuspoliitika</a>
            <a href="/tingimused" className="underline hover:text-white">Tingimused</a>
          </div>
        </div>

        {/* Keskmine veerg (peidetud väikestel ekraanidel) */}
        <div className="hidden md:block">
          <h4 className="text-white font-bold mb-2">Kasutajatugi</h4>
          <ul className="space-y-1">
            <li><a href="/muujale" className="hover:text-white">Müüjale</a></li>
            <li><a href="/ostjale" className="hover:text-white">Ostjale</a></li>
            <li><a href="/probleem" className="hover:text-white">Tehniline probleem</a></li>
          </ul>
        </div>

        {/* Parem veerg (peidetud väikestel ekraanidel) */}
        <div className="hidden md:block">
          <h4 className="text-white font-bold mb-2">Meist</h4>
          <ul>
            <li><a href="/meist" className="hover:text-white">Meist</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
