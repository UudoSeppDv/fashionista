'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import ImageUploader from '@/components/ImageUploader'

type FilterType = 'Riided' | 'Aksessuaarid' | 'Jalanõud' | 'Sport' | 'Ilu' | ''

const validFilters: FilterType[] = ['Riided', 'Aksessuaarid', 'Jalanõud', 'Sport', 'Ilu', '']

export default function ProductForm() {
  const [images, setImages] = useState<File[]>([])

  const [uploading, setUploading] = useState(false)

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

  // Failide üleslaadimise funktsioon, mida edastan ImageUploaderile
function handleFilesChange(files: File[]) {
  if (files.length === 0) return;
  setImages(prev => [...prev, ...files]); // siin on nüüd File[] tüüpi massiiv, mitte URL-id
}

async function uploadImage(file: File): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `product-images/${fileName}`;

  const { data, error } = await supabase.storage
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

  // Laeme kõik pildid üles ja võtame URLid
  const uploadedUrls = await Promise.all(
    images.map(file => uploadImage(file))
  );

  // Kui mõni upload null, võid ka errorit käsitleda
  if (uploadedUrls.includes(null)) {
    alert('Piltide üleslaadimine ebaõnnestus');
    setUploading(false);
    return;
  }

  const parsedPrice = parseFloat(price);

  const { error } = await supabase.from('products').insert([
    {
      description,
      brand,
      filter,
      category,
      condition,
      size,
      quantity,
      location,
      price: parsedPrice,
      delivery: deliveryOptions,
      images: uploadedUrls.filter((url): url is string => url !== null),
    }
  ]);

  setUploading(false);

  if (error) {
    alert('Viga salvestamisel');
    console.error('Supabase veateade:', error);
  } else {
    alert('Toode lisatud!');
    // Reset
    setDescription('');
    setBrand('');
    setFilter('');
    setCategory('');
    setCondition('');
    setSize('');
    setQuantity(1);
    setLocation('');
    setPrice('');
    setDeliveryOptions([]);
    setImages([]);
  }
}

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 text-sm font-montserrat">
      <ImageUploader onFilesChange={handleFilesChange} />

      <div>
  <h2 className="text-lg font-semibold">Kuulutuse info</h2>

  {/* Kirjeldus */}
  <textarea
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder="Kirjelda toodet võimalikult täpselt"
    className="w-full border rounded-md p-2 h-24 mb-4"
  />

    {/* Brand */}
  <input
    type="text"
    value={brand}
    onChange={(e) => setBrand(e.target.value)}
    placeholder="Bränd (ainult brändi nimi)"
    className="w-full border rounded-md p-2"
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
      className="border p-2 rounded-md"
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
      className="border p-2 rounded-md"
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
      className="border p-2 rounded-md"
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
      className="border p-2 rounded-md"
    >
      <option value="">Suurus</option>
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
      className="border p-2 rounded-md"
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
    className="border p-2 rounded-md mt-4 w-full"
  />

  {/* Hind */}
  <input
  type="number"
  min="0"
  step="0.01"
  value={price}
  onChange={(e) => setPrice(e.target.value)}
  placeholder="Toote hind (€)"
  className="mt-4 border p-2 rounded-md w-full"
/>

</div>


      <div>
        <h2 className="text-lg font-semibold mt-6">Kohaletoimetamine</h2>
        <p className="text-gray-500 mb-2">Ostja tasub pakiautomaadi kulu koos toote hinnaga</p>
        <div className="space-y-2">
          {['Ostja tuleb ise järgi', 'DPD', 'Omniva', 'Itella'].map(option => (
            <label
              key={option}
              className="flex items-center justify-between border p-3 rounded-md cursor-pointer"
            >
              <span>{option}</span>
              <input
                type="checkbox"
                checked={deliveryOptions.includes(option)}
                onChange={() => toggleDelivery(option)}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="bg-green-100 text-green-800 text-center p-2 rounded-md text-sm">
        Kuulutus avaldatakse peale administraatori kontrolli, kui kõik nõuded on täidetud
      </div>

      <button
        type="submit"
        className="bg-black text-white w-full py-2 rounded-full hover:bg-gray-800"
        disabled={uploading}
      >
        {uploading ? 'Laen...' : 'AVALDA'}
      </button>
    </form>
  )
}
