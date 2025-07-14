'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "../../types/supabase"
import ImageUploader from '@/components/ImageUploader'

export default function EditProductForm({ productId }: { productId: string }) {
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

  const [formResetKey, setFormResetKey] = useState(Date.now())
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [successMessage, setSuccessMessage] = useState('')
  const supabase = createClientComponentClient<Database>()
  

  const [description, setDescription] = useState('')
  const [brand, setBrand] = useState('')
  const [filter, setFilter] = useState('')
  const [category, setCategory] = useState('')
  const [size, setSize] = useState('')
  const [condition, setCondition] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [location, setLocation] = useState('')
  const [price, setPrice] = useState('')
  const [deliveryOptions, setDeliveryOptions] = useState<string[]>([])

  const validFilters = ['Riided', 'Aksessuaarid', 'Jalanõud', 'Sport', 'Ilu']

  useEffect(() => {
    const loadProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (error) {
        console.error('Viga toote laadimisel', error)
        return
      }

      setDescription(data.description || '')
      setBrand(data.brand || '')
      setFilter(data.filter || '')
      setCategory(data.category || '')
      setSize(data.size || '')
      setCondition(data.condition || '')
      setQuantity(data.quantity || 1)
      setLocation(data.location || '')
      setPrice(data.price || '')
      setDeliveryOptions(data.delivery || [])
      setExistingImages(data.images || [])
    }

    loadProduct()
  }, [productId])

  const handleFilesChange = (files: File[]) => {
    setImages(files)
  }

  const toggleDelivery = (option: string) => {
    setDeliveryOptions(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    )
  }

  async function uploadImage(file: File): Promise<string | null> {
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const filePath = `product-images/${fileName}`

    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)

    if (error) return null

    return supabase.storage
      .from('product-images')
      .getPublicUrl(filePath).data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  setUploading(true)
  setSuccessMessage('')

  try {
    // Laeme üles kõik uued pildid
    const uploadedUrls = await Promise.all(
      images.map(file => uploadImage(file))
    )
    // Filtreerime välja need, mis uploadimisel ebaõnnestusid (null)
    const newImages = uploadedUrls.filter((url): url is string => url !== null)
    // Koos olemasolevate piltidega
    const finalImages = [...existingImages, ...newImages]

    // Uuendame toodet Supabase'is
    const { error } = await supabase
      .from('products')
      .update({
        description,
        brand,
        filter,
        category,
        size,
        condition,
        quantity,
        location,
        price,
        delivery: deliveryOptions,
        images: finalImages,
      })
      .eq('id', productId)

    if (error) {
      alert('Midagi läks valesti toote uuendamisel.')
      console.error(error)
    } else {
      setSuccessMessage('Toode edukalt uuendatud!')
      setFormResetKey(Date.now()) // reset uploader
      setTimeout(() => {
        router.push(`/products/${productId}`)
      }, 1500)
      return // lõpetame funktsiooni pärast suunamist
    }
  } catch (err) {
    alert('Midagi läks valesti.')
    console.error(err)
  } finally {
    setUploading(false)
  }
}


  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto space-y-6 text-sm font-montserrat"
    >
     <ImageUploader
  key={formResetKey}
  onFilesChange={handleFilesChange}
  existingImages={existingImages}
  onExistingImagesChange={setExistingImages}
/>



      <div>
        <h2 className="text-lg mb-4 font-semibold">Kuulutuse info</h2>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Kirjelda toodet võimalikult täpselt"
          className="w-full border border-gray-600 p-2 h-24 mb-4"
        />

        <input
          type="text"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="Bränd (ainult brändi nimi)"
          className="w-full border border-gray-600 p-2"
        />

        <div className="grid grid-cols-2 gap-4 mt-4">
          <select
            value={filter}
            onChange={(e) => {
              const value = e.target.value
              if (validFilters.includes(value)) {
                setFilter(value)
              }
            }}
            className="border border-gray-600 p-2"
          >
            <option value="">Filter</option>
            {validFilters.map(f => <option key={f} value={f}>{f}</option>)}
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-600 p-2"
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
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="border border-gray-600 p-2"
          >
            <option value="">Seisukord</option>
            <option value="Uus">Uus</option>
            <option value="Heas seisus">Heas seisus</option>
            <option value="Kasutatud">Kasutatud</option>
          </select>

          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="border border-gray-600 p-2"
          >
            <option value="">Suurus (valikuline)</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
          </select>

          <select
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="border border-gray-600 p-2"
          >
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>

        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Asukoht"
          className="border border-gray-600 p-2 mt-4 w-full"
        />

        <input
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Toote hind (€)"
          className="mt-4 border border-gray-600 p-2 w-full"
        />
      </div>

      <div className="space-y-2">
        {['Ostja tuleb ise järgi', 'DPD', 'Omniva', 'Itella'].map(option => {
          const isActive = deliveryOptions.includes(option)
          return (
            <label
              key={option}
              className="flex items-center justify-between border border-gray-600 p-3 cursor-pointer select-none"
              onClick={() => toggleDelivery(option)}
            >
              <span>{option}</span>
              <div className="relative w-10 h-6">
                <div
                  className={`absolute inset-0 rounded-full transition-colors duration-300 ${
                    isActive ? 'bg-pink-400' : 'bg-gray-300'
                  }`}
                />
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                    isActive ? 'translate-x-4' : ''
                  }`}
                />
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
        {uploading ? 'Laen...' : 'SALVESTA'}
      </button>
    </form>
  )
}
