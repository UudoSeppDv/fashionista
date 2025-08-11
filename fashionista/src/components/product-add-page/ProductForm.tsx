'use client'

import { useState } from 'react'
import { useRef, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient'
import ImageUploaderNew from '@/components/product-add-page/ImageUploaderAdd'
import { useRouter } from 'next/navigation'; // või next/router, kui kasutad App Routerit

type FilterType = 'Riided' | 'Aksessuaarid' | 'Jalanõud' | 'Sport' | 'Ilu' | ''

const validFilters: FilterType[] = ['Riided', 'Aksessuaarid', 'Jalanõud', 'Sport', 'Ilu', '']

export default function ProductForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [images, setImages] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const [description, setDescription] = useState('')
  const [brand, setBrand] = useState('')
  const [filter, setFilter] = useState<FilterType>('')
  const [category, setCategory] = useState('')
  const [size, setSize] = useState('')
  const [condition, setCondition] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [location, setLocation] = useState('')
  const [price, setPrice] = useState('')
  const [deliveryOptions, setDeliveryOptions] = useState<string[]>([])
  

const handleFilesChange = useCallback((files: File[]) => {
  setImages(files)
}, [])
async function uploadImage(file: File): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `product-images/${fileName}`;

  const { error } = await supabase.storage
  .from('product-images') // ← ÕIGE
  .upload(filePath, file);


if (error !== null && error !== undefined) {
  console.error('Upload error:', error);
  return null;

}


  // Tagasta faili avalik URL
  const publicUrl = supabase.storage
  .from('product-images') // ← ÕIGE
  .getPublicUrl(filePath).data.publicUrl;

  return publicUrl;
}



  function toggleDelivery(option: string) {
    setDeliveryOptions(prev =>
      prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
    )
  }

  




async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  if (!description || !brand || !filter || !category || !condition || !location || !price) {
    alert('Palun täida kõik kohustuslikud väljad.');
    return;
  }

  setUploading(true);

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    alert('Pead olema sisse logitud!');
    setUploading(false);
    return;
  }

  const userId = session.user.id;

  const uploadedUrls = await Promise.all(
    images.map(file => uploadImage(file))
  );

  if (uploadedUrls.includes(null)) {
    alert('Piltide üleslaadimine ebaõnnestus');
    setUploading(false);
    return;
  }

  const { data, error } = await supabase.from('products').insert([
    {
      user_id: userId,
      description,
      brand,
      filter,
      category,
      condition,
      size,
      quantity,
      location,
      price,
      delivery: deliveryOptions.length > 0 ? deliveryOptions : null,
      images: uploadedUrls.filter((url): url is string => url !== null),
    }
  ]).select().single(); // <– NB! Saame tagasi sisestatud rea koos ID-ga

  setUploading(false);

  if (error || !data) {
    alert('Viga salvestamisel');
    console.error('Supabase veateade:', error);
  } else {
    setSuccessMessage('Toode on üles laetud!');
    setTimeout(() => {
      setSuccessMessage('');
      router.push(`/products/${data.id}`); // Suuna uuele lehele
    }, 1500);
  }
}


  return (
    <form ref={formRef} onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 text-sm font-montserrat">
      
      <ImageUploaderNew files={images} onFilesChange={handleFilesChange} />



      <div>
  <h2 className="text-lg mb-4 font-semibold">Kuulutuse info</h2>

  {/* Kirjeldus */}
  <textarea
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder="Kirjelda toodet võimalikult täpselt"
    className="w-full border p-2 h-24 mb-4"
  />

    {/* Brand */}
  <input
    type="text"
    value={brand}
    onChange={(e) => setBrand(e.target.value)}
    placeholder="Bränd (ainult brändi nimi)"
    className="w-full border p-2"
  />

  <div className="grid grid-cols-2 gap-4 mt-4">

    {/* Filter */}
    <select
      value={filter}
      onChange={(e) => {
  const value = e.target.value
  if (validFilters.includes(value as FilterType)) {
    setFilter(value as FilterType)
  }
}}
      className="border p-2"
    >
      <option value="">Filter</option>
      <option value="Riided">Riided</option>
      <option value="Aksessuaarid">Aksessuaarid</option>
      <option value="Jalanõud">Jalanõud</option>
      <option value="Sport">Sport</option>
      <option value="Ilu">Ilu</option>
    </select>

    {/* Category */}
    <select
      value={category}
      onChange={(e) => setCategory(e.target.value)}
      className="border p-2"
    >
      <option value="">Kategooria</option>
      <option value="Aluspesu">Aluspesu</option>
      <option value="Mantlid">Mantlid</option>
      <option value="Üleriided">Üleriided</option>
      <option value="Joped">Joped</option>
      <option value="Püksid">Püksid</option>
      <option value="Kotid">Kotid</option>
      <option value="Ehted">Ehted</option>
    </select>
  </div>

  <div className="grid grid-cols-3 gap-4 mt-4">

    {/* Seisukord */}
    <select
      value={condition}
      onChange={(e) => setCondition(e.target.value)}
      className="border p-2"
    >
      <option value="">Seisukord</option>
      <option value="Uus">Uus</option>
      <option value="Heas seisus">Heas seisus</option>
      <option value="Kasutatud">Kasutatud</option>
    </select>

    {/* Suurus (valikuline) */}
    <select
      value={size}
      onChange={(e) => setSize(e.target.value)}
      className="border p-2"
    >
      
      <option value="">Suurus (valikuline)</option>
      <option value="XS">XS</option>
      <option value="S">S</option>
      <option value="M">M</option>
      <option value="L">L</option>
      <option value="XL">XL</option>
      <option value="XXL">XXL</option>
    </select>

    {/* Kogus */}
    <select
      value={quantity}
      onChange={(e) => setQuantity(parseInt(e.target.value))}
      className="border p-2"
    >
      {[...Array(10)].map((_, i) => (
        <option key={i + 1} value={i + 1}>{i + 1}</option>
      ))}
    </select>
  </div>

  {/* Asukoht */}
  <input
    type="text"
    value={location}
    onChange={(e) => setLocation(e.target.value)}
    placeholder="Asukoht"
    className="border p-2 mt-4 w-full"
  />

  {/* Hind */}
  <input
  type="number"
  min="0"
  step="0.01"
  value={price}
  onChange={(e) => setPrice(e.target.value)}
  placeholder="Toote hind (€)"
  className="mt-4 border p-2 w-full"
/>

</div>


     <div className="space-y-2">
  {['Ostja tuleb ise järgi', 'DPD', 'Omniva', 'Smartpost'].map(option => {
    const isActive = deliveryOptions.includes(option)
    return (
      <label
        key={option}
        className="flex items-center justify-between border p-3 cursor-pointer select-none"
        onClick={() => toggleDelivery(option)}
      >
        <span>{option}</span>
        {/* Toggle switch */}
        <div className="relative w-10 h-6">
          <div
            className={`absolute inset-0 rounded-full transition-colors duration-300 ${
             isActive ? 'bg-pink-400' : 'bg-gray-300'
            }`}
          ></div>
          <div
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
              isActive ? 'translate-x-4' : ''
            }`}
          ></div>
        </div>
      </label>
    )
  })}
</div>


      {successMessage && (
  <div className="bg-green-100 text-green-800 text-center p-3">
    {successMessage}
  </div>
)}
      

      <button
        type="submit"
        className="bg-black text-white w-full py-3 mb-10 rounded-full hover:bg-gray-800"
        disabled={uploading}
      >
        {uploading ? 'Laen...' : 'AVALDA'}
      </button>
    </form>
  )
}
