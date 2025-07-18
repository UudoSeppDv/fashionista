"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { BackgroundSvg } from "./BackgroundSvg";
import { User } from "@supabase/supabase-js";
import { FaFacebookF, FaGoogle } from "react-icons/fa";

function normalizePageUrl(url: string) {
  return url
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function RegisterHeader({ onLoginOpen }: { onLoginOpen: () => void }) {
  const router = useRouter();

  
const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [pageUrlError, setPageUrlError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");

  // Kontrollime kasutaja olekut
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoadingUser(false);
    };
    getUser();

    // Võid ka kuulata auth muutusi:
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

const handleOAuthLogin = async (provider: "google" | "facebook") => {
    try {
      await supabase.auth.signInWithOAuth({ provider });
      // Supabase teeb redirecti ise
    } catch (err) {
      console.error(err);
      alert("OAuth login ebaõnnestus");
    }
  };



  // Debounce pageUrl kontroll
  useEffect(() => {
    if (!pageUrl) {
      setPageUrlError("");
      return;
    }
    setPageUrlError("");

    const timer = setTimeout(async () => {
      const { data: existingPageUrl } = await supabase
        .from("public_users")
        .select("id")
        .eq("page_url", pageUrl)
        .single();

      if (existingPageUrl) {
        setPageUrlError("See profiili URL on juba kasutusel.");
      } else {
        setPageUrlError("");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [pageUrl]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    if (
      !firstName.trim() ||
      !surname.trim() ||
      !email.trim() ||
      !pageUrl.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setMessage("Palun täida kõik väljad.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Paroolid ei kattu.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    if (pageUrlError) {
      setMessage(pageUrlError);
      setMessageType("error");
      setLoading(false);
      return;
    }
    

    const fullName = `${firstName} ${surname}`;

    const { data: existingPageUrl } = await supabase
      .from("public_users")
      .select("id")
      .eq("page_url", pageUrl)
      .single();

    if (existingPageUrl) {
      setMessage("See profiili URL on juba kasutusel. Palun vali teine.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          surname: surname,
          full_name: fullName,
          page_url: pageUrl,
        },
      },
    });

    if (signUpError) {
      setMessage(`Registreerimisel tekkis viga: ${signUpError.message}`);
      setMessageType("error");
      setLoading(false);
      return;
    }

    if (signUpData?.user) {
      const userId = signUpData.user.id;

      const { error: profileError } = await supabase.from("public_users").insert({
        id: userId,
        first_name: firstName,
        surname: surname,
        display_name: fullName,
        page_url: pageUrl,
        avatar_url: null,
        location: null,
        bio: null,
        social_media: {},
        sold_products_count: 0,
      });

      if (profileError) {
        setMessage(`Profiili loomisel tekkis viga: ${profileError.message}`);
        setMessageType("error");
        setLoading(false);
        return;
      }
    }

    router.push("/konto?edit=true");
  };

  if (loadingUser) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-700">
        Laen...
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-4">
        <BackgroundSvg />
        <p className="text-lg font-semibold text-gray-800">
          Oled juba sisse logitud.
        </p>
      </div>
    );
  }

  return (
    <>
      <BackgroundSvg />
      <form
        onSubmit={handleRegister}
        className="z-10 w-full mx-auto my-8 p-8 bg-[#F1ECE6] max-w-[600px] border border-gray-200 shadow-md font-montserrat space-y-6"
      >
       <h2 className="text-2xl font-bold mb-6">
      <span className="text-gray-900">Registreeru</span>{" "}
      /{" "}
      <span
        onClick={onLoginOpen}
        className="cursor-pointer underline hover:text-gray-600"
      >
        Logi sisse
      </span>
    </h2>
        <hr className="border-gray-400 mb-6" />

        {message && (
          <div
            className={`text-sm p-3 rounded-lg ${
              messageType === "error"
                ? "bg-red-100 text-red-700"
                : messageType === "success"
                ? "bg-green-100 text-green-700"
                : ""
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Eesnimi"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="flex-1 border border-black px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            required
          />
          <input
            type="text"
            placeholder="Perekonnanimi"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            className="flex-1 border border-black px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            required
          />
        </div>

        <input
          type="text"
          placeholder="fashionista/*SinuURL*"
          value={pageUrl}
          onChange={(e) => setPageUrl(normalizePageUrl(e.target.value))}
          className={`w-full border px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none ${
            pageUrlError ? "border-red-500" : "border border-black"
          }`}
          required
        />
        {pageUrlError && <p className="text-red-500 text-xs mt-1">{pageUrlError}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-black px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
          required
        />
        <input
          type="password"
          placeholder="Parool"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-black px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
          required
        />
        <input
          type="password"
          placeholder="Korda parooli"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border border-black px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
          required
        />

        <button
          type="submit"
          disabled={loading || !!pageUrlError}
          className="w-full bg-black text-white py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? "REGISTREERIN..." : "REGISTREERU"}
          <span className="pl-4 text-lg">→</span>
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
      </form>
    </>
  );
}
