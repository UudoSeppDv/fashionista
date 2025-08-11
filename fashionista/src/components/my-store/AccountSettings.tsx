"use client"

import React, { useEffect, useState } from "react"
import { usePrivateData } from "../../../lib/getPrivateData"
import { updatePrivateData } from "../../../lib/updatePrivateData"
import { supabase } from '../../../lib/supabaseClient'
import Image from 'next/image'

export default function AccountSettings() {
  const { privateData, loading, refresh } = usePrivateData()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(privateData?.avatar_url ?? null)

useEffect(() => {
  if (privateData?.avatar_url) {
    setAvatarUrl(privateData.avatar_url)
  }
}, [privateData])


const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    location: "",
    iban: "",
  })
  const [editing, setEditing] = useState(false)
  const [,setHasChanges] = useState(false)

  
  // Kui privateData muutub, täida vorm
  useEffect(() => {
    if (privateData) {
      setFormData({
        firstName: privateData.first_name ?? "",
        lastName: privateData.surname ?? "",
        phone: privateData.phone ?? "",
        email: privateData.email ?? "",
        location: privateData.location ?? "",
        iban: privateData.iban ?? "",
      })
      setHasChanges(false) // lähtesta muudatused
      setEditing(false) // peale andmete laadimist mitte redigeerimisrežiimi
    }
  }, [privateData])
const handleAvatarChange = async (file: File) => {
  setUploading(true)
  
  const user = (await supabase.auth.getUser()).data.user
  if (!user) {
    alert("Pole kasutajat!")
    setUploading(false)
    return
  }


  // Kui vana pilt on, kustuta see enne uue üleslaadimist
  if (avatarUrl) {
    try {
      // avatarUrl on avalik URL, pead failinime leidma teisiti:
      // Võta kasutaja ID ja loo failitee, mis sul uploadi jaoks on kasutusel:
      const filePrefix = `${user.id}`

      const { data: files } = await supabase.storage.from('avatars').list()
      const matchingFile = files?.find(f => f.name.startsWith(filePrefix))

      if (matchingFile) {
        await supabase.storage.from('avatars').remove([matchingFile.name])
      }
    } catch (error) {
      console.error("Vana pildi kustutamine ebaõnnestus:", error)
    }
  }

  // Lae uus pilt üles
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    console.error(uploadError)
    alert("Pildi üleslaadimine ebaõnnestus")
    setUploading(false)
    return
  }

  const { data: imageData } = supabase.storage.from('avatars').getPublicUrl(filePath)
  const publicUrl = `${imageData.publicUrl}?t=${Date.now()}`

  const { error: updateError } = await supabase
    .from('public_users')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)

  if (updateError) {
    console.error(updateError)
    alert("Avatar URLi uuendamine ebaõnnestus")
    setUploading(false)
    return
  }

  setAvatarUrl(publicUrl)
  alert("Pilt uuendatud!")
  setUploading(false)
  refresh()
}

const handleAvatarDelete = async () => {
  
  const user = (await supabase.auth.getUser()).data.user
  if (!user) return alert("Pole kasutajat!")

  const filePrefix = `${user.id}`
  const { data: files } = await supabase.storage.from("avatars").list()
  const matchingFile = files?.find(f => f.name.startsWith(filePrefix))

  if (matchingFile) {
    await supabase.storage.from("avatars").remove([matchingFile.name])
  }

  const { error } = await supabase
    .from('public_users')
    .update({ avatar_url: null })
    .eq('id', user.id)

  if (error) {
    console.error(error)
    alert("Pildi kustutamine ebaõnnestus")
    return
  }

  setAvatarUrl(null)
  alert("Pilt kustutatud!")
}

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const newForm = { ...prev, [name]: value }

      // Võrdle, kas on tehtud muudatusi võrreldes privateData-ga
      if (!privateData) {
        setHasChanges(false)
      } else {
        const changed =
          newForm.firstName !== (privateData.first_name ?? "") ||
          newForm.lastName !== (privateData.surname ?? "") ||
          newForm.phone !== (privateData.phone ?? "") ||
          newForm.location !== (privateData.location ?? "") ||
          newForm.iban !== (privateData.iban ?? "")
        setHasChanges(changed)
      }

      return newForm
    })
  }

  const handleEditToggle = () => setEditing(true)

const handleSave = async () => {
  const { error } = await updatePrivateData(formData)
  if (error) {
    alert("Viga andmete salvestamisel")
  } else {
    alert("Andmed salvestatud!")
    setEditing(false)
    setHasChanges(false)
    refresh()  // <-- Siin peaks uuendama andmeid
  }
}


const handleDelete = async () => {
  if (!confirm("Kas oled kindel, et soovid konto kustutada?")) return

 
  const user = (await supabase.auth.getUser()).data.user
  if (!user) return alert("Pole kasutajat!")

  // Kustuta esmalt public_users rida (kui on vaja)
  await supabase.from('public_users').delete().eq('id', user.id)

  // Kutsu oma API route, mis kustutab auth kasutaja
  const res = await fetch('/api/delete-user', {
    method: 'POST',
    body: JSON.stringify({ user_id: user.id }),
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    const { error } = await res.json()
    alert('Kustutamine ebaõnnestus: ' + error)
    return
  }

  // Logi välja ja suuna
  await supabase.auth.signOut()
  window.location.href = '/'
}


if (loading) return <p>Laen andmeid...</p>

  if (!privateData) {
    return (
      <div className="p-6 max-w-3xl mx-auto font-montserrat text-sm text-gray-800 bg-[#f8f3ef]">
        <p className="text-red-600 font-semibold">
          Konto muutmiseks peab olema sisse logitud.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto font-montserrat text-sm text-gray-800 space-y-8 bg-[#f8f3ef]">
      <div className="border p-4 flex items-center space-x-6">
  {/* Avatar */}
  {avatarUrl ? (
   <div className="relative w-20 h-20 rounded-full overflow-hidden">
  <Image
    src={avatarUrl}
    alt="Profiilipilt"
    fill
    className="object-cover"
  />
</div>

  ) : (
    <div className="w-20 h-20 rounded-full bg-pink-300 text-white flex items-center justify-center text-xl font-bold">
      {formData.firstName.charAt(0)}
      {formData.lastName.charAt(0)}
    </div>
  )}
{uploading && (
    <p className="text-gray-500 text-sm">Laadimine...</p>
    )}

  {/* Avatariga seotud nupud */}
<div className="space-x-4 text-right">
  {/* Kui pilti pole, siis näita "Lisa pilti" */}
  {!avatarUrl && (
    <label className="font-semibold underline cursor-pointer">
      Lisa pilt
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleAvatarChange(file)
        }}
        className="hidden"
      />
    </label>
  )}

  {/* Kui pilti on, näita "Muuda pilti" */}
  {avatarUrl && (
    <>
      <label className="font-semibold underline cursor-pointer">
        Muuda pilti
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleAvatarChange(file)
          }}
          className="hidden"
        />
      </label>

      <button
        onClick={handleAvatarDelete}
        className="text-red-600 underline"
      >
        Kustuta pilt
      </button>
    </>
  )}
</div>
  
</div>

      <div className="border p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label>Nimi</label>
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            disabled={!editing}
            className="w-full border p-2 mt-1"
          />
        </div>
        <div>
          <label>Perekonnanimi</label>
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            disabled={!editing}
            className="w-full border p-2 mt-1"
          />
        </div>
        <div>
          <label>Telefoninumber</label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={!editing}
            className="w-full border p-2 mt-1"
          />
        </div>
        <div>
          <label>Email</label>
          <input
  name="email"
  value={formData.email}
  onChange={handleChange}
  disabled={!editing}
  className="w-full border p-2 mt-1"
/>
        </div>
        <div className="sm:col-span-2">
          <label>Asukoht</label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            disabled={!editing}
            className="w-full border p-2 mt-1"
          />
        </div>
      </div>

      <div className="border p-4 space-y-4">
        <h3 className="font-semibold text-base">Pangakonto</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label>Konto number (IBAN)</label>
            <input
              name="iban"
              value={formData.iban}
              onChange={handleChange}
              disabled={!editing}
              className="w-full border p-2 mt-1"
            />
          </div>
        </div>
      </div>

      {/* Kui on redigeerimisrežiim ja muudatused tehtud, näita all Salvesta nuppu ka */}
      <div className="space-x-4 text-right">
          {!editing && (
            <button onClick={handleEditToggle} className="font-semibold underline">
              Muuda
            </button>
          )}
          {editing && (
            <button onClick={handleSave} className="font-semibold underline">
              Salvesta
            </button>
          )}
          <button onClick={handleDelete} className="text-red-600 underline">
            Kustuta konto
          </button>
        </div>
    </div>
  )
}
