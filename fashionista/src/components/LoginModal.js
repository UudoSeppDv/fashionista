import { useState } from "react";
import { FaFacebookF, FaGoogle } from "react-icons/fa";
import { supabase } from "../../lib/supabase";

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  

  const handleContinue = async () => {
    if (!email || !password) {
      alert("Sisesta email ja parool");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        alert(error.message);
      } else {
        // edu korral
        window.dispatchEvent(new Event("user-logged-in"));
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert("Sisselogimine ebaõnnestus");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    try {
      await supabase.auth.signInWithOAuth({
        provider,
      });
      // Supabase teeb redirecti automaatselt
    } catch (err) {
      console.error(err);
      alert("OAuth login ebaõnnestus");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
    >
      <div className="font-montserrat relative bg-[#F1ECE6] w-full max-w-[600px] p-8 shadow-lg animate-fade-in">
        <button
          onClick={onClose}
          className="font-light absolute top-7 right-8 text-4xl text-gray-500 hover:text-black"
          aria-label="Sulge"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-6">Registreeru / Logi sisse</h2>
        <hr className="border-gray-400 mb-6" />

        {/* Email */}
        <div className="flex border border-black text-gray-500 mb-6">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 focus:outline-none"
          />
        </div>

        {/* Parool */}
        <div className="mb-6">
          <input
            type="password"
            placeholder="Parool"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-black text-gray-700 focus:outline-none"
          />
        </div>

        {/* Jätka */}
        <button
          onClick={handleContinue}
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-full font-semibold flex items-center justify-center gap-2 mb-4"
        >
          {loading ? "Sisse logimine..." : <>JÄTKA <span className="text-lg">→</span></>}
        </button>

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

        {/* Või */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-400" />
          <span className="mx-4 text-gray-500">Või</span>
          <div className="flex-grow border-t border-gray-400" />
        </div>

        {/* Facebook */}
        <button
          onClick={() => handleOAuthLogin("facebook")}
          className="font-semibold w-full flex items-center justify-center border border-black rounded-full py-2 mb-4 hover:bg-gray-100 transition"
        >
          <FaFacebookF className="mr-3" />
          JÄTKA FACEBOOKI KONTOGA
        </button>

        {/* Google */}
        <button
          onClick={() => handleOAuthLogin("google")}
          className="font-semibold w-full flex items-center justify-center border border-black rounded-full py-2 hover:bg-gray-100 transition"
        >
          <FaGoogle className="mr-3" />
          JÄTKA GOOGLE KONTOGA
        </button>
      </div>
    </div>
  );
}
