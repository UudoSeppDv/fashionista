'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)
function timeAgo(date: string) {
  return dayjs(date).fromNow()
}

import {
  NotificationFromDB
} from '../../../types/Notification'

import {
  isMessageNotification,
  isOrderNotification,
  isPriceChangeNotification,
} from '../../../lib/utils/notificationGuards'

import { supabase } from '../../../lib/supabaseClient'

type SenderInfo = {
  id: string
  avatar_url: string | null
  first_name: string
  surname: string | null
}


export default function NotificationItem() {
  const [notifications, setNotifications] = useState<NotificationFromDB[]>([])
  const [senders, setSenders] = useState<Record<string, SenderInfo>>({})
  const readNotificationsRef = useRef<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [totalNotifications, setTotalNotifications] = useState(0)
  const [loading, setLoading] = useState(false)

  // Arvutame lehtede arvu dünaamiliselt
  const totalPages = Math.ceil(totalNotifications / pageSize)
  const maxVisiblePages = 5

  const visibleStart = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
  const visibleEnd = Math.min(totalPages, visibleStart + maxVisiblePages - 1)

  

  const fetchNotifications = useCallback(async (page: number) => {
  // Märgi teavitused loetuks
  const markNotificationAsRead = async (notificationId: string, userId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (!error) {
      readNotificationsRef.current.add(notificationId)
    } else {
      console.error('Teavituse märkimine loetuks ebaõnnestus:', error)
    }
  }

  setLoading(true)

  const { data: userData, error: authError } = await supabase.auth.getUser()
  const userId = userData?.user?.id

  if (!userId || authError) {
    console.error('Kasutaja viga:', authError)
    setLoading(false)
    return
  }

  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize - 1

  // Teavituste koguarv
  const { count, error: countError } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (countError) {
    console.error('Teavituste koguarvu laadimine ebaõnnestus:', countError)
    setLoading(false)
    return
  }

  setTotalNotifications(count || 0)

  // Lae teavitused ise
  const { data: notificationsData, error: notifError } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(startIndex, endIndex)

  if (notifError) {
    console.error('Teavituste laadimine ebaõnnestus:', notifError)
    setLoading(false)
    return
  }

  // Kogu saatjate id-d unikaalselt
  const senderIds = Array.from(
    new Set(
      (notificationsData || [])
        .map((n) => n.sender_id)
        .filter((id): id is string => !!id)
    )
  )

  const senderMap: Record<string, SenderInfo> = {}


  if (senderIds.length > 0) {
    const { data: usersData, error: usersError } = await supabase
      .from('public_users')
      .select('id, first_name, surname, avatar_url')
      .in('id', senderIds)

    if (usersError) {
      console.error('Saatjate info laadimine ebaõnnestus:', usersError)
    } else {
      usersData?.forEach((user) => {
        senderMap[user.id] = {
          id: user.id,
          first_name: user.first_name,
          surname: user.surname,
          avatar_url: user.avatar_url,
        }
      })
    }
  }

  setSenders(senderMap)

  // Kogu toodete id-d order- ja hinna muutmise teavituste jaoks
  const productIds = Array.from(
    new Set(
      (notificationsData || [])
        .filter((n) => isOrderNotification(n) || isPriceChangeNotification(n))
        .map((n) => n.product_id)
        .filter((id): id is string => !!id)
    )
  )

  const productImageMap: Record<string, string> = {}


  if (productIds.length > 0) {
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('id, images')
      .in('id', productIds)

    if (productsError) {
      console.error('Toote piltide laadimine ebaõnnestus:', productsError)
    } else {
      productsData?.forEach((product) => {
        if (Array.isArray(product.images) && product.images.length > 0) {
          productImageMap[product.id] = product.images[0]
        }
      })
    }
  }

  // Lisa pildid ja märgi teavitused loetuks
  const enrichedNotifications = (notificationsData || []).map((notif) => {
    // Märgi loetuks, kui pole veel tehtud
    if (!notif.is_read && !readNotificationsRef.current.has(notif.id)) {
      markNotificationAsRead(notif.id, userId)
    }

    // Lisa toote pilt, kui teavitus on tellimuse või hinna muutmise kohta
    if (
      (isOrderNotification(notif) || isPriceChangeNotification(notif)) &&
      notif.product_id &&
      productImageMap[notif.product_id]
    ) {
      return {
        ...notif,
        product_image_url: productImageMap[notif.product_id],
      }
    }

    return notif
  })

  setNotifications(enrichedNotifications)
  setLoading(false)
}, [pageSize, readNotificationsRef])



  // Kui currentPage muutub, laeme uued teavitused
useEffect(() => {
  fetchNotifications(currentPage);
}, [currentPage, fetchNotifications]);


  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Teavitused</h1>

      {loading && <p>Laen teavitusi...</p>}

      {!loading && notifications.length === 0 && (
        <p>Teavitusi ei ole.</p>
      )}

      <div className="space-y-3 text-s">
        {notifications.map((notif) => {
          let sender: SenderInfo | null = null
if ((isMessageNotification(notif) || notif.type === 'new_product') && notif.sender_id) {
  sender = senders[notif.sender_id]
}


          return (
            <div
              key={notif.id}
              className={`flex items-start gap-3 p-3 font-montserrat border-b ${
                notif.is_read ? 'bg-none' : 'bg-pink-50'
              }`}
            >
              {/* Avatar või tootepilt */}
              {(isMessageNotification(notif) || notif.type === 'new_product') && (
  notif.link ? (
    <Link href={notif.link}>
      {sender?.avatar_url ? (
        <Image
  src={sender.avatar_url}
  alt={sender.first_name}
  width={40}
  height={40}
  className="rounded-full object-cover"
/>
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-300" />
      )}
    </Link>
  ) : sender?.avatar_url ? (
    <Image
  src={sender.avatar_url || '/default-avatar.png'}
  alt={sender.first_name || 'Avatar'}
  width={40}
  height={40}
  className="rounded-full object-cover"
/>
  ) : (
    <div className="w-10 h-10 rounded-full bg-gray-300" />
  )
)}

              {(isOrderNotification(notif) || isPriceChangeNotification(notif)) && (
  notif.product_image_url ? (
    <Link href={notif.link || '#'}>
      <Image
  src={notif.product_image_url || '/placeholder.png'}
  alt="Toote pilt"
  width={40}
  height={40}
  className="object-cover"
/>
    </Link>
  ) : (
    <div className="w-10 h-10 bg-gray-300" />
  )
)}


              <div className="flex-1 flex justify-between items-start gap-4">
                <div className="flex-1">
                  {notif.link ? (
  <Link href={notif.link} className="text-gray-600">
    {(sender && (isMessageNotification(notif) || notif.type === 'new_product')) ? (
      <>
        <span className="font-medium underline hover:font-medium">
          {sender.first_name}{sender.surname ? ` ${sender.surname}` : ''}
        </span>{' '}
        <span>{notif.message}</span>
      </>
    ) : (
      notif.message
    )}
  </Link>
) : (
  <p>
    {(sender && (isMessageNotification(notif) || notif.type === 'new_product')) ? (
      <>
        <span className="font-medium">
          {sender.first_name}{sender.surname ? ` ${sender.surname}` : ''}
        </span>{' '}
        <span>{notif.message}</span>
      </>
    ) : (
      notif.message
    )}
  </p>
)}

                </div>
                <span className="text-gray-500 whitespace-nowrap">
                  {timeAgo(notif.created_at)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1 px-3 border rounded disabled:opacity-40"
          >
            Eelmine
          </button>

          {[...Array(visibleEnd - visibleStart + 1)].map((_, idx) => {
            const pageNum = visibleStart + idx
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`p-1 px-3 border rounded ${
                  pageNum === currentPage ? 'bg-pink-400 text-white' : ''
                }`}
              >
                {pageNum}
              </button>
            )
          })}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1 px-3 border rounded disabled:opacity-40"
          >
            Järgmine
          </button>
        </div>
      )}
    </div>
  )
}
