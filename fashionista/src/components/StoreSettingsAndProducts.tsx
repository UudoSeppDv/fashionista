"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "../../types/supabase"
import { Button } from "../components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Check, EyeOff, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"



type Product = Database["public"]["Tables"]["products"]["Row"]
type User = Database["public"]["Tables"]["public_users"]["Row"]

export default function StoreSettingsAndProducts() {
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()
  const [form, setForm] = useState({
  url: "",
  bio: "",
  social_media: {
    facebook: "",
    instagram: "",
  } as { facebook: string; instagram: string },
})


  const [user, setUser] = useState<User | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const fetchUserAndProducts = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: storeData } = await supabase
    .from("public_users")
    .select("*")
    .eq("id", user.id)
    .single()

  const { data: productData } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user.id)

  if (storeData) {
    setUser(storeData)
    setForm({
      url: storeData.url || "",
      bio: storeData.bio || "",
      social_media: {
    facebook: storeData.social_media?.facebook || "",
    instagram: storeData.social_media?.instagram || "",
  },
    })
  }

  if (productData) setProducts(productData)
  setLoading(false)
}







  useEffect(() => {
  fetchUserAndProducts()
}, [])

const handleStoreSave = async () => {
  if (!user) return

  const cleanedSocialMedia = Object.fromEntries(
    Object.entries(form.social_media).filter(([, v]) => v?.trim() !== "")
  )

  const { error } = await supabase
    .from("public_users")
    .update({
      url: form.url,
      bio: form.bio,
      social_media: cleanedSocialMedia,
    })
    .eq("id", user.id)

  if (error) {
    console.error(error)
    alert("Viga salvestamisel")
  } else {
    alert("Salvestatud!")
  }
}



  const handleProductAction = async (id: string, action: string) => {
    switch (action) {
      case "delete":
      const confirmed = window.confirm("Oled kindel, et soovid selle toote kustutada?");
      if (!confirmed) return;
      await supabase.from("products").delete().eq("id", id);
      break
      case "sold":
        // Kui sul on status välja, lisa andmebaasi ja siin uuenda:
        await supabase.from("products").update({ status: "sold" }).eq("id", id)
        break
      case "hide":
        // Kui sul on visible välja, lisa andmebaasi ja siin uuenda:
        await supabase.from("products").update({ visible: false }).eq("id", id)
        break
        case "unhide":
  await supabase.from("products").update({ visible: true }).eq("id", id)
  await fetchUserAndProducts()

  break

      default:
        break
    }
    // Värskenda toodete nimekiri
    if (!user) return;
const { data } = await supabase.from("products").select("*").eq("user_id", user.id || user.id);
if (data) setProducts(data);
}

  if (loading) return <div>Laen...</div>

   return (
    <div className="flex flex-col md:flex-row gap-8 p-8">
      {/* Store settings */}
      <div className="border border-gray-600 w-full md:w-1/3 p-6">
        <h2 className="text-xl font-semibold mb-4">Poe seaded</h2>
        <div className="space-y-4 ">
          
          <label htmlFor="store-url" className="block text-sm mb-1 font-montserrat text-gray-700">
    Poe veebiaadress
  </label>
  <Input
    id="store-url"
    placeholder="fashionista.ee/NIMI"
    value={form.url}
    onChange={(e) => setForm({ ...form, url: e.target.value })}
  />
          
          <label className="block text-sm mb-1 font-montserrat text-gray-700">
  Instagram
</label>
<Input
  placeholder="https://www.instagram.com/kasutajanimi"
  value={form.social_media.instagram || ""}
  onChange={(e) =>
    setForm({
      ...form,
      social_media: {
        ...form.social_media,
        instagram: e.target.value,
      },
    })
  }
/>

<label className="block text-sm mb-1 font-montserrat text-gray-700">
  Facebook
</label>
<Input
  placeholder="https://www.facebook.com/kasutajanimi"
  value={form.social_media.facebook || ""}
  onChange={(e) =>
    setForm({
      ...form,
      social_media: {
        ...form.social_media,
        facebook: e.target.value,
      },
    })
  }
/>

          <label htmlFor="store-description" className="block text-sm mb-1 font-montserrat text-gray-700">
      Poe kirjeldus
    </label>
    <Textarea
      id="store-description"
      placeholder="Poe kirjeldus"
      value={form.bio}
      onChange={(e) => setForm({ ...form, bio: e.target.value })}
    />
          <Button onClick={handleStoreSave}>Salvesta</Button>
        </div>
      </div>

      {/* Product grid */}
      <div className="w-full md:w-2/3 flex flex-wrap gap-4 justify-start">
  {products.map((product) => (
    <div
      key={product.id}
      className="relative w-[250px] group"
    >
      <div
        className={`w-[250px] h-[350px] overflow-hidden bg-white relative transition-all duration-300 ${
          product.status === "sold" ? "opacity-50 grayscale" : ""
        }`}
      >
        <img
          src={
            product.images && product.images.length > 0
              ? product.images[0]
              : "/placeholder.png"
          }
          alt={product.brand || "Toode"}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Allosas bränd ja hind */}
      <div className="py-3 px-2">
        <p className="font-montserrat text-sm text-gray-700">{product.brand}</p>
        <p className="font-montserrat text-black text-2xl font-bold mt-1">
          {product.price != null ? `${Number(product.price).toFixed(2)} €` : "Hind puudub"}
        </p>
      </div>

      {/* Toote tegevuste dropdown */}
      <div className="text-white absolute top-2 p-3 right-2 z-20">
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
  className="w-15 h-15 bg-[rgba(75,85,99,0.4)] hover:bg-[rgba(75,85,99,0.2)] text-white rounded-none p-0 flex items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-0 shadow-none"
>
  <MoreHorizontal className="w-5 h-5" />
</Button>

          </DropdownMenuTrigger>
          <DropdownMenuContent className="font-montserrat rounded-none mr-20">
  {product.status !== "sold" ? (
    <>
      <DropdownMenuItem onClick={() => router.push(`/edit-product/${product.id}`)}>
      Muuda toodet
     </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleProductAction(product.id, "sold")}>
        Märgi müüduks
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() =>
          handleProductAction(product.id, product.visible === false ? "unhide" : "hide")
        }
      >
        {product.visible === false ? "Näita" : "Peida"}
      </DropdownMenuItem>
    </>
  ) : (
    <div className="px-4 py-2 text-sm text-gray-500 text-left">
      Toode on müüdud
    </div>
  )}

  <DropdownMenuItem
    className="text-red-600"
    onClick={() => handleProductAction(product.id, "delete")}
  >
    Kustuta
  </DropdownMenuItem>
</DropdownMenuContent>


        </DropdownMenu>
      </div>

      {/* Staatus ikoonid */}
      {product.status === "sold" && (
        <div className="w-15 h-15 absolute p-5 top-25 right-5 bg-green-200 text-green-600 p-1 flex items-center justify-center">
          <Check className="w-10 h-10" />
        </div>
      )}
      {product.visible === false && (
        <div className="w-15 h-15 text-white absolute p-5 top-25 right-5 z-20" style={{ backgroundColor: "rgba(75, 85, 99, 0.4)" }}>
          <EyeOff className="w-5 h-5" />
        </div>
      )}
    </div>
  ))}
</div>
</div>

  )
}