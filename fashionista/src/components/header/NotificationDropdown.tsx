'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabaseClient'
import Image from 'next/image'
import { NotificationFromDB } from '../../../types/Notification'
import {
  isMessageNotification,
  isOrderNotification,
  isPriceChangeNotification,
} from '../../../lib/utils/notificationGuards'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)
function timeAgo(date: string) {
  return dayjs(date).fromNow()
}

type SenderInfo = {
  id: string
  avatar_url: string | null
  first_name: string
  surname: string | null
}

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<NotificationFromDB[]>([])
  const [senders, setSenders] = useState<Record<string, SenderInfo>>({})
  const [open, setOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

    // Kontrolli unread notifikatsioone pidevalt
  useEffect(() => {
  const getUserAndSubscribe = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return

    const checkUnread = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('is_read', false)
        .limit(1)

      if (!error) {
        setHasUnread(data.length > 0)
      }
    }

    await checkUnread()

    const channel = supabase
      .channel(`unread-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          await checkUnread()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  getUserAndSubscribe()
}, [])

 useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id
      if (!userId) return

      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      const unreadIds = notifs?.filter(n => !n.is_read).map(n => n.id) || []

      if (unreadIds.length > 0) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .in('id', unreadIds)
      }

      const senderIds = [...new Set(notifs?.map(n => n.sender_id).filter(Boolean))] as string[]
      const productIds = [...new Set(
        notifs?.filter(n => isOrderNotification(n) || isPriceChangeNotification(n))
        .map(n => n.product_id)
        .filter(Boolean)
      )] as string[]

      const senderMap: Record<string, SenderInfo> = {}
      if (senderIds.length) {
        const { data: userData } = await supabase
          .from('public_users')
          .select('id, first_name, surname, avatar_url')
          .in('id', senderIds)
        userData?.forEach(user => {
          senderMap[user.id] = user
        })
      }

      const productImageMap: Record<string, string> = {}
      if (productIds.length) {
        const { data: productData } = await supabase
          .from('products')
          .select('id, images')
          .in('id', productIds)
        productData?.forEach(product => {
          if (product.images?.length) {
            productImageMap[product.id] = product.images[0]
          }
        })
      }

      const enriched = notifs?.map(n => {
        const productImage = productImageMap[n.product_id ?? '']
        return productImage
          ? { ...n, product_image_url: productImage }
          : n
      }) || []

      setSenders(senderMap)
      setNotifications(enriched)
    }

    fetchData()
  }, [open])

return (
  <div className="relative" ref={dropdownRef}>
    <button className="hover:scale-110" onClick={() => setOpen(!open)}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.2676 21C10.4431 21.304 10.6956 21.5565 10.9996 21.732C11.3037 21.9075 11.6485 21.9999 11.9996 21.9999C12.3506 21.9999 12.6955 21.9075 12.9995 21.732C13.3036 21.5565 13.556 21.304 13.7316 21" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M3.26127 15.326C3.13063 15.4692 3.04442 15.6472 3.01312 15.8385C2.98183 16.0298 3.00679 16.226 3.08498 16.4034C3.16316 16.5807 3.2912 16.7316 3.45352 16.8375C3.61585 16.9434 3.80545 16.9999 3.99927 17H19.9993C20.1931 17.0001 20.3827 16.9438 20.5451 16.8381C20.7076 16.7324 20.8358 16.5817 20.9142 16.4045C20.9926 16.2273 21.0178 16.0311 20.9867 15.8398C20.9557 15.6485 20.8697 15.4703 20.7393 15.327C19.4093 13.956 17.9993 12.499 17.9993 8C17.9993 6.4087 17.3671 4.88258 16.2419 3.75736C15.1167 2.63214 13.5906 2 11.9993 2C10.408 2 8.88185 2.63214 7.75663 3.75736C6.63141 4.88258 5.99927 6.4087 5.99927 8C5.99927 12.499 4.58827 13.956 3.26127 15.326Z" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
{hasUnread && (
    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
  )}
    </button>

    {open && (
     <div
  className="absolute right-0 mt-0 flex flex-col max-h-[500px]
    sm:w-96  origin-top-right shadow-lg z-50 bg-white focus:outline-none font-montserrat font-medium
  max-sm:fixed max-sm:top-14 max-sm:right-0 max-sm:left-0 max-sm:w-full max-sm:rounded-none max-sm:px-4 max-sm:py-4 max-sm:space-y-2 sm:font-large max-sm:text-base max-sm:z-[999]"
>


        <div className="p-4 border-b font-semibold">Teavitused</div>

        <div className="flex-1 overflow-auto">
          <ul className="divide-y text-sm">
            {notifications.length === 0 ? (
              <li className="p-4 text-gray-500">Teavitusi ei ole</li>
            ) : (
              notifications.map(n => {
                const sender = n.sender_id ? senders[n.sender_id] : null
                return (
                  <li key={n.id} className="flex items-start gap-3 p-3 hover:bg-gray-100">
                    {/* Avatar / Product image */}
                    {(isMessageNotification(n) || n.type === 'new_product') && (
                      <Image
  src={sender?.avatar_url || '/default-avatar.png'}
  width={40} // match your w-10 (2.5rem * 16px = 40px)
  height={40}
  className="rounded-full object-cover"
  alt="Avatar"
/>
                    )}
                    {(isOrderNotification(n) || isPriceChangeNotification(n)) && (
                      <Image
  src={n.product_image_url || '/placeholder.png'}
  width={40}   // w-10 = 2.5rem * 16 = 40px
  height={40}
  className="object-cover"
  alt="Toote pilt"
/>
                    )}

                    {/* Text */}
                   <div className="flex-1">
  {n.link ? (
    <Link href={n.link} className="text-gray-700 hover:underline">
      {(sender && (isMessageNotification(n) || n.type === 'new_product')) && (
        <span className="font-medium">
          {sender.first_name}{sender.surname ? ` ${sender.surname}` : ''}{' '}
        </span>
      )}
      {n.message}
    </Link>
  ) : (
    <p className="text-gray-700">
      {(sender && (isMessageNotification(n) || n.type === 'new_product')) && (
        <span className="font-medium">
          {sender.first_name}{sender.surname ? ` ${sender.surname}` : ''}{' '}
        </span>
      )}
      {n.message}
    </p>
  )}
  <span className="block text-xs text-gray-500">{timeAgo(n.created_at)}</span> {/* <-- block lisatud */}
</div>

                  </li>
                )
              })
            )}
          </ul>
        </div>

        <div className="p-2 border-t text-center">
          <Link href="/teavitused" className="text-sm text-pink-600 hover:underline">
            Kuva kõik
          </Link>
        </div>
      </div>
    )}
  </div>
)

}
