// src/components/LoginModal.tsx

import { useState, useEffect } from "react";
import { FaFacebookF, FaGoogle } from "react-icons/fa";
import type { Session } from "@supabase/supabase-js";
import type { Database } from '..../../../types/supabase' 
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient<Database>();
 const [, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Kontrolli olemasolevat sessiooni
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        onClose(); // Kui juba sessioon olemas, sulge modal kohe
      }
    });

    // Kuula sisselogimist / väljalogimist
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          onClose(); // Sulge modal kui kasutaja sisse logitud
          window.dispatchEvent(new Event("user-logged-in")); // Võid vajadusel ka kuulata seda eventi mujal
        }
      }
    );
  

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [onClose, supabase]);

  // Funktsioon Enter-klahvi jaoks
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!loading) {
        handleContinue();
      }
    }
  };

  if (!isOpen) return null;


  const handleContinue = async () => {
    if (!email || !password) {
      alert("Sisesta email ja parool");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        alert(error.message);
      } else {
        setSession(data.session);
        onClose(); // Modal sulgub peale edukat loginut
        window.dispatchEvent(new Event("user-logged-in"));
      }
    } catch (err) {
      console.error(err);
      alert("Sisselogimine ebaõnnestus");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "facebook") => {
    try {
      await supabase.auth.signInWithOAuth({ provider });
      // Supabase teeb redirecti ise
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
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-2 focus:outline-none"
            disabled={loading}
          />
        </div>

        {/* Parool */}
        <div className="mb-6">
          <input
            type="password"
            placeholder="Parool"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-2 border border-black text-gray-700 focus:outline-none"
            disabled={loading}
          />
        </div>

        {/* Jätka */}
        <button
  onClick={handleContinue}
  disabled={loading}
  className="w-full bg-black text-white py-2 rounded-full font-semibold flex items-center justify-center gap-2 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {loading ? (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  ) : (
    <>
      JÄTKA <span className="text-lg">→</span>
    </>
  )}
</button>


        <p className="text-sm text-gray-500 mb-6">
          Registreerimisel nõustud{" "}
          <a href="#" className="underline font-semibold text-gray-500">
            kasutustingimustega
          </a>{" "}
          ja{" "}
          <a href="#" className="underline font-semibold text-gray-500">
            privaatsuspoliitikaga
          </a>.
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
          disabled={loading}
        >
          <FaFacebookF className="mr-3" />
          JÄTKA FACEBOOKI KONTOGA
        </button>

        {/* Google */}
        <button
          onClick={() => handleOAuthLogin("google")}
          className="font-semibold w-full flex items-center justify-center border border-black rounded-full py-2 hover:bg-gray-100 transition"
          disabled={loading}
        >
          <FaGoogle className="mr-3" />
          JÄTKA GOOGLE KONTOGA
        </button>
      </div>
    </div>
  );
}
