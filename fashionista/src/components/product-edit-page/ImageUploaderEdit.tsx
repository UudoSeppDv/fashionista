'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface ImageUploaderProps {
  existingImages?: string[]
  onFilesChange: (files: File[]) => void
  onExistingImagesChange?: (urls: string[]) => void
}

export default function ImageUploader({ existingImages = [], onFilesChange, onExistingImagesChange }: ImageUploaderProps) {
  const [images, setImages] = useState<{ file?: File; url: string }[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Hoia viimast existingImages sünkroonimise infot, et effect ei jooksu mitu korda asjatult
  const hasSyncedRef = useRef(false)

  useEffect(() => {
    // Kui pole veel sünkroniseeritud ja images on tühi, siis sünkroniseeri
    if (!hasSyncedRef.current && images.length === 0 && existingImages.length > 0) {
      setImages(existingImages.map(url => ({ url })))
      hasSyncedRef.current = true
    }
  }, [existingImages, images.length])

  // Kui images muutuvad, kutsu callback'id
  useEffect(() => {
    onFilesChange(images.filter(img => img.file).map(img => img.file!))
    if (onExistingImagesChange) {
      onExistingImagesChange(images.filter(img => !img.file).map(img => img.url))
    }
  }, [images, onFilesChange, onExistingImagesChange])

  function handleImageUpload(files: FileList | null) {
    if (!files) return

    const newImages: { file: File; url: string }[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue

      const url = URL.createObjectURL(file)
      newImages.push({ file, url })
    }

    setImages(prev => [...prev, ...newImages])
    hasSyncedRef.current = true // Kui lisame uusi, siis loeme, et oleme juba sünkroniseerinud
  }

  function handleRemoveImage(index: number) {
    setImages(prev => {
      const removed = prev[index]
      if (removed.file) {
        URL.revokeObjectURL(removed.url)
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    handleImageUpload(e.dataTransfer.files)
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 mt-4">Lisa pildid</h2>
      <p className="text-gray-500 mb-4">
        Laadige üles ainult kvaliteetsed pildid. Pärast üleslaadimist kontrollitakse fotod ning aktsepteeritakse, kui need vastavad nõuetele.
      </p>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className="p-6 w-full cursor-pointer text-center"
        style={{
          userSelect: 'none',
          border: 'none',
          backgroundImage:
            'repeating-linear-gradient(to right, #9CA3AF 0, #9CA3AF 10px, transparent 10px, transparent 20px), ' +
            'repeating-linear-gradient(to bottom, #9CA3AF 0, #9CA3AF 10px, transparent 10px, transparent 20px), ' +
            'repeating-linear-gradient(to left, #9CA3AF 0, #9CA3AF 10px, transparent 10px, transparent 20px), ' +
            'repeating-linear-gradient(to top, #9CA3AF 0, #9CA3AF 10px, transparent 10px, transparent 20px)',
          backgroundSize: '100% 1px, 1px 100%, 100% 1px, 1px 100%',
          backgroundPosition: 'top left, top right, bottom left, top left',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto mb-2"
        >
          {/* SVG paths... */}
        </svg>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={e => handleImageUpload(e.target.files)}
          className="hidden"
        />
        <p>
          <strong>
            <u>Vali fail</u>
          </strong>{' '}
          või lohista see siia
        </p>

        <p className="text-sm text-gray-500">
          Toetab ühe või mitme faili korraga üleslaadimist. Maksimaalne faili suurus: 2MB.
        </p>
      </div>

      {images.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4">
          {images.map((img, i) => (
            <div
              key={img.url}
              className="relative w-40 h-40 overflow-hidden group"
            >
              <Image 
                src={img.url} 
                alt={`Upload Preview ${i}`} 
                className="object-cover w-full h-full"
                unoptimized={img.file !== undefined} 
                fill
                sizes="160px"
                style={{ objectFit: 'cover' }}
              />
              <button
                onClick={() => handleRemoveImage(i)}
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white cursor-pointer"
                aria-label="Eemalda pilt"
                type="button"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6H21" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
