"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    // 1) Registreeri kasutaja Supabase Auth'is
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      setMessage(`Registreerimisel tekkis viga: ${signUpError.message}`);
      setMessageType("error");
      setLoading(false);
      return;
    }

    // 2) Kui kasutaja edukalt loodud, lisa avalik profiil public_users tabelisse
    if (signUpData?.user) {
      const userId = signUpData.user.id;

      const { error: profileError } = await supabase.from("public_users").insert({
        id: userId,
        display_name: fullName,
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

    setMessage("Registreerimine õnnestus! Kontrolli oma e-maili kinnitamiseks.");
    setMessageType("success");

    // Tühjenda vormi väljad
    setEmail("");
    setPassword("");
    setFullName("");
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleRegister}
      className="max-w-md mx-auto p-4 flex flex-col gap-4 border rounded shadow"
    >
      <h2 className="text-xl font-bold">Registreeru</h2>

      {message && (
        <div
          className={`text-sm p-2 rounded ${
            messageType === "error"
              ? "text-red-700 bg-red-100"
              : messageType === "success"
              ? "text-green-700 bg-green-100"
              : ""
          }`}
        >
          {message}
        </div>
      )}

      <input
        type="text"
        placeholder="Täisnimi"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <input
        type="password"
        placeholder="Parool"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 rounded"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "Registreerin..." : "Registreeru"}
      </button>
    </form>
  );
}
