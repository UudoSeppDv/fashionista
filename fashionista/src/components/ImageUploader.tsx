'use client'

import { useState, useRef } from 'react'

interface ImageUploaderProps {
  onFilesChange: (files: File[]) => void
}

export default function ImageUploader({ onFilesChange }: ImageUploaderProps) {
  const [images, setImages] = useState<{ file: File; url: string }[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Failide laadimine (input või drop kaudu)
  function handleImageUpload(files: FileList | null) {
    if (!files) return

    const newImages: { file: File; url: string }[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue

      const url = URL.createObjectURL(file)
      newImages.push({ file, url })
    }

    const updatedImages = [...images, ...newImages]
    setImages(updatedImages)
    onFilesChange(updatedImages.map(i => i.file))
  }

  // Piltide kustutamine
  function handleRemoveImage(index: number) {
    setImages(prev => {
      // Tühjenda URL objekt, et vabastada mälu
      URL.revokeObjectURL(prev[index].url)
      const updated = prev.filter((_, i) => i !== index)
      onFilesChange(updated.map(i => i.file))
      return updated
    })
  }

  // Drag-and-drop sündmused
  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    handleImageUpload(e.dataTransfer.files)
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Lisa pildid</h2>
      <p className="text-gray-500 mb-4">
        Laadige üles ainult kvaliteetsed pildid. Pärast üleslaadimist kontrollitakse fotod ning aktsepteeritakse, kui need vastavad nõuetele.
      </p>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className="border border-dashed border-gray-400 p-4 rounded-md w-full cursor-pointer text-center"
        style={{ userSelect: 'none' }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto mb-2"
        >
          <path
            d="M16 17.3335V28.0002"
            stroke="#A692C3"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.33313 19.8652C4.34252 18.8531 3.59523 17.6288 3.14785 16.2851C2.70047 14.9414 2.56474 13.5135 2.75095 12.1096C2.93715 10.7057 3.44041 9.36253 4.22259 8.18191C5.00478 7.00129 6.04538 6.01415 7.26558 5.29527C8.48578 4.57638 9.85357 4.1446 11.2654 4.03263C12.6771 3.92067 14.0959 4.13145 15.4142 4.64901C16.7324 5.16657 17.9156 5.97734 18.8741 7.01991C19.8326 8.06248 20.5413 9.30951 20.9465 10.6665H23.3331C24.6205 10.6664 25.8737 11.0803 26.9078 11.8471C27.9418 12.6139 28.7018 13.693 29.0755 14.9249C29.4492 16.1569 29.4167 17.4763 28.9829 18.6884C28.5491 19.9004 27.737 20.9408 26.6665 21.6559"
            stroke="#A692C3"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.666 22.6668L15.9993 17.3335L21.3327 22.6668"
            stroke="#A692C3"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleImageUpload(e.target.files)}
          className="hidden"
        />
        <p>Vali fail või lohista see siia</p>
        <p className="text-sm text-gray-500">
          Toetab ühe või mitme faili korraga üleslaadimist. Maksimaalne faili suurus: 2MB.
        </p>
      </div>

      {/* Kuvame pildid konteineri all */}
      {images.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4">
          {images.map((img, i) => (
            <div key={i} className="relative w-24 h-24 border rounded overflow-hidden">
              <img
                src={img.url}
                alt={`Upload Preview ${i}`}
                className="object-cover w-full h-full"
              />
              <button
                onClick={() => handleRemoveImage(i)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700"
                aria-label="Eemalda pilt"
                type="button"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
