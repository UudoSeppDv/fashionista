import { useState } from "react";
import { FaFacebookF, FaGoogle } from "react-icons/fa";

window.dispatchEvent(new Event("user-logged-in"));


export default function LoginModal({ isOpen, onClose }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

const [phone, setPhone] = useState("");
const [email, setEmail] = useState("");

const handleContinue = () => {
  if (phone.trim().length > 5 || email.trim().toLowerCase() === "uudo@quantumhorizon.ee") {
    const userIdentifier = email.trim() || phone.trim();
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userPhone", userIdentifier);
    setIsLoggedIn(true);

    // SIIN saadame teate, et kasutaja logis sisse:
    window.dispatchEvent(new Event("user-logged-in"));

    onClose();
  } else {
    alert("Sisesta kehtiv telefoninumber või email");
  }
};



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
      <div className="font-montserrat relative bg-[#F1ECE6] w-full max-w-[600px] p-8 shadow-lg animate-fade-in">


        {/* Sulgemisnupp */}
        <button
          onClick={onClose}
          className="font-light absolute top-7 right-8 text-4xl text-gray-500 hover:text-black"
          aria-label="Sulge"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-6">Registreeru / Logi sisse</h2>
        <hr className="border-gray-400 mb-6" />


        {/* Telefonisisestus */}
        <div className="flex border border-black text-gray-500 mb-6">
          <select className="px-3 py-2 bg-transparent focus:outline-none border-black">
            <option value="+372">+372</option>
            <option value="+358">+358</option>
            <option value="+370">+370</option>
          </select>
          <input
            type="tel"
            placeholder="Telefoninumber"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2 focus:outline-none"
          />
        </div>
        {/* Emailisisestus */}
<div className="mb-6">
  <input
    type="email"
    placeholder="Või sisesta e-mail (nt uudo@quantumhorizon.ee)"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="w-full px-4 py-2 border border-black text-gray-700 focus:outline-none"
  />
</div>

        {/* Jätka nupp */}
        <button
  onClick={handleContinue}
  className="w-full bg-black text-white py-2 rounded-full font-semibold flex items-center justify-center gap-2 mb-4"
>
  JÄTKA <span className="text-lg">→</span>
</button>

        {/* Tingimused */}
        <p className="text-sm text-gray-500 mb-6">
          Registreerimisel nõustud{" "}
          <a href="#" className="underline font-semibold text-gray-500">
            kasutustingimuste
          </a>{" "}
          ja{" "}
          <a href="#" className="underline font-semibold text-gray-500">
            privaatsuspoliitikaga
          </a>
          .
        </p>

        {/* Või separator */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-400" />
          <span className="mx-4 text-gray-500">Või</span>
          <div className="flex-grow border-t border-gray-400" />
        </div>

        {/* Facebook ja Google nupud */}
        <button className="font-semibold w-full flex items-center justify-center border border-black rounded-full py-2 mb-4 hover:bg-gray-100 transition">
          <FaFacebookF className="mr-3" />
          JÄTKA FACEBOOKI KONTOGA
        </button>

        <button className="font-semibold w-full flex items-center justify-center border border-black rounded-full py-2 hover:bg-gray-100 transition">
          <FaGoogle className="mr-3" />
          JÄTKA GOOGLE KONTOGA
        </button>
      </div>
    </div>
  );
}
