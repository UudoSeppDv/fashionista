'use client'

import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient' // eeldades, et kasutad seda
import { Button } from "../components/ui/button"


import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

interface SocialMedia {
  facebook?: string
  instagram?: string
}

interface UserCardProps {
  name: string
  firstName?: string
  surname?: string
  followers: number
  sold: string
  location: string
  social_media: SocialMedia
  description: string
  imageUrl: string | null | undefined
  userId: string
}


const UserCard: React.FC<UserCardProps> = ({
  name,
  firstName,
  surname,
  followers,
  sold,
  location,
  social_media,
  description,
  imageUrl,
  userId,
}) => {
  const router = useRouter()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
const [isFollowing, setIsFollowing] = useState(false)
const [loadingFollow, setLoadingFollow] = useState(false)
const [followersCount, setFollowersCount] = useState(followers)

useEffect(() => {
  async function checkIfFollowing() {
    if (!currentUserId || currentUserId === userId) return

    const { data, error } = await supabase
      .from('user_followers')
      .select('follower_id')
      .eq('user_id', userId)
      .eq('follower_id', currentUserId)
      .maybeSingle()

    if (error) {
      console.error('Jälgimise kontroll ebaõnnestus:', error)
    } else {
      setIsFollowing(!!data)
    }
  }

  checkIfFollowing()
}, [currentUserId, userId])

const handleBlockToggle = async () => {
  if (!currentUserId || currentUserId === userId) return

  if (isBlocked) {
    // Eemalda blokeering
    const confirmed = confirm("Kas soovid selle kasutaja blokeeringu eemaldada?")
    if (!confirmed) return

    const { error } = await supabase
      .from('user_blocks')
      .delete()
      .eq('blocker_id', currentUserId)
      .eq('blocked_id', userId)

    if (error) {
      console.error("Blokeeringu eemaldamine ebaõnnestus:", error)
      alert("Midagi läks valesti.")
    } else {
      setIsBlocked(false)
      alert("Kasutaja blokeering eemaldatud.")
    }

  } else {
    // Lisa blokeering
    const confirmed = confirm("Kas soovid selle kasutaja blokeerida?")
    if (!confirmed) return

    const { error } = await supabase
      .from('user_blocks')
      .insert({
        blocker_id: currentUserId,
        blocked_id: userId,
      })

    if (error) {
      console.error("Blokeerimine ebaõnnestus:", error)
      alert("Midagi läks valesti.")
    } else {
      setIsBlocked(true)
      alert("Kasutaja on blokeeritud.")

      // Eemalda follow kui eksisteerib
      const { error: unfollowError } = await supabase
        .from('user_followers')
        .delete()
        .eq('user_id', userId)
        .eq('follower_id', currentUserId)

      if (unfollowError) {
        console.error("Jälgimise eemaldamine blokeerimise ajal ebaõnnestus:", unfollowError)
      } else {
        setIsFollowing(false)
        setFollowersCount((count) => Math.max(count - 1, 0))
      }
    }
  }
}

useEffect(() => {
  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      setCurrentUserId(data.user.id);
    }
  };

  fetchUser();

  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      setCurrentUserId(session.user.id);
    } else {
      setCurrentUserId(null);
    }
  });

  return () => {
    listener.subscription.unsubscribe();
  };
}, []);


// handleFollowToggle sees:

const handleFollowToggle = async () => {
  if (!currentUserId || currentUserId === userId) return
  setLoadingFollow(true)

  if (isFollowing) {
    // Unfollow
    const { error } = await supabase
      .from('user_followers')
      .delete()
      .eq('user_id', userId)
      .eq('follower_id', currentUserId)

    if (error) {
      alert('Jälgimise lõpetamine ebaõnnestus')
      console.error(error)
    } else {
      setIsFollowing(false)
      setFollowersCount((count) => Math.max(count - 1, 0))  // vähenda jälgijate arvu
    }
  } else {
    // Follow
    const { error } = await supabase.from('user_followers').insert({
      user_id: userId,
      follower_id: currentUserId,
    })

    if (error) {
      alert('Jälgimine ebaõnnestus')
      console.error(error)
    } else {
      setIsFollowing(true)
      setFollowersCount((count) => count + 1) // suurenda jälgijate arvu
    }
  }

  setLoadingFollow(false)
}


  useEffect(() => {
  async function fetchCurrentUser() {
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      // Kui viga tuleb, ära logi seda välja logitud kasutaja puhul
      if (error.message !== 'Auth session missing!') {
        console.error('Kasutaja tuvastamine ebaõnnestus:', error)
      }
      setCurrentUserId(null)
      return
    }

    if (!data?.user) {
      setCurrentUserId(null)
    } else {
      setCurrentUserId(data.user.id)
    }
  }

  fetchCurrentUser()
}, [])

const isOwner = currentUserId === userId;


  const handleSendMessageClick = () => {
  if (!userId) {
    alert('Müüja info puudub, ei saa sõnumit saata.')
    return
  }

  router.push(`/messages/${userId}`)
}
const initials =
    (firstName?.[0] ?? '')?.toUpperCase() + (surname?.[0] ?? '')?.toUpperCase()

  const handleEditClick = () => {
    router.push(`/minu-pood`)
  }

  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(() => {
  async function checkIfBlocked() {
    if (!currentUserId || currentUserId === userId) return

    const { data, error } = await supabase
      .from('user_blocks')
      .select('*')
      .eq('blocker_id', currentUserId)
      .eq('blocked_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Blokeeringu kontroll ebaõnnestus:', error)
    } else if (data) {
      setIsBlocked(true)
    } else {
      setIsBlocked(false)
    }
  }

  checkIfBlocked()
}, [currentUserId, userId])


  return (
    <div className="relative bg-[#A692C3] border p-6 w-full text-black font-montserrat">
      {!isOwner && (
  <div className="absolute top-0 right-0 z-20 p-3">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="text-white bg-transparent border-none hover:bg-transparent p-0 flex items-center justify-center transition duration-200 focus:outline-none focus-visible:ring-0 shadow-none"
        >
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="font-montserrat rounded-none font-medium border-none mr-27 mt-0">
        <DropdownMenuItem
          onClick={handleBlockToggle}
          className="text-gray-900 cursor-pointer"
        >
          {isBlocked ? 'Eemalda blokeering' : 'Blokeeri kasutaja'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
)}


      
      <div className="flex flex-col items-center">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${name} profiilipilt`}
            className="border rounded-full w-28 h-28 object-cover mb-4"
            width={112}
            height={112}
          />
        ) : (
          <div className="w-28 h-28 mb-4 rounded-full bg-pink-400 flex items-center justify-center text-white text-4xl font-bold select-none">
            {initials || '?'}
          </div>
        )}
        <h2 className="text-xl font-bold">{name}</h2>
        {isBlocked ? (
    <p className="mt-2 text-center font-semibold text-red-600">
      Oled blokeerinud selle kasutaja
    </p>
  ) : (
    <p className="mt-2">
      <strong>{followersCount}</strong> Jälgijat &nbsp;
      <strong>{sold}</strong> Müüdud
    </p>
  )}
        {!isOwner && currentUserId && !isBlocked && (
  <div className="mt-4 flex space-x-4">
   <button
  onClick={handleFollowToggle}
  className="mt-4 bg-black text-white px-4 py-2 rounded-full flex items-center justify-center transition-colors duration-200 hover:bg-white group disabled:opacity-50"
  disabled={loadingFollow}
>
  {isFollowing ? (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="stroke-white group-hover:stroke-black transition-colors duration-200"
    >
      <path d="M2 21C1.99992 19.4603 2.44413 17.9533 3.27935 16.6598C4.11456 15.3664 5.30527 14.3414 6.7086 13.708C8.11193 13.0745 9.66824 12.8595 11.1908 13.0886C12.7133 13.3178 14.1373 13.9815 15.292 15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 13C12.7614 13 15 10.7614 15 8C15 5.23858 12.7614 3 10 3C7.23858 3 5 5.23858 5 8C5 10.7614 7.23858 13 10 13Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 19L18 21L22 17" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ) : (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="stroke-white group-hover:stroke-black transition-colors duration-200"
    >
      <path d="M2 21C2 19.4603 2.44413 17.9533 3.27935 16.6598C4.11456 15.3664 5.30527 14.3414 6.7086 13.708C8.11193 13.0745 9.66824 12.8595 11.1908 13.0886C12.7133 13.3178 14.1373 13.9815 15.292 15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 13C12.7614 13 15 10.7614 15 8C15 5.23858 12.7614 3 10 3C7.23858 3 5 5.23858 5 8C5 10.7614 7.23858 13 10 13Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 16V22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 19H16" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )}
</button>

   
    

    <button
      onClick={handleSendMessageClick}
  className="mt-4 text-sm font-medium border border-black px-4 py-2 rounded-full hover:bg-white transition-colors"
>
      SAADA SÕNUM
    </button>
  </div>
)}

{isOwner && (
  <button
  type="button"
  onClick={handleEditClick}
  className="mt-4 text-sm font-medium border border-black px-4 py-2 rounded-full hover:bg-white transition-colors"
>
    MUUDA POODI
  </button>
)}

        

        <hr className="w-full my-4 border-black" />

        <p className="text-center">{location}</p>

        {/* Sotsiaalmeedia */}
        <div className="flex flex-col space-y-2 mt-2">
          {social_media.instagram && (
            <a
              href={`https://instagram.com/${social_media.instagram}`}
              className="text-center font-medium underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              @{social_media.instagram}
            </a>
          )}
          {social_media.facebook && (
            <a
              href={`https://facebook.com/${social_media.facebook}`}
              className="text-center font-medium underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              @{social_media.facebook}
            </a>
          )}
        </div>

        <hr className="w-full my-4 border-black" />

        <p className="text-sm text-left whitespace-pre-line">{description}</p>
      </div>
    </div>
  )
}

export default UserCard
