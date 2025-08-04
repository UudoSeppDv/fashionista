import { useEffect, useRef } from 'react'
import { supabase } from '../../../../lib/supabaseClient'

export function useMarkNotificationsRead(currentUserId: string | null, userId: string | null) {
  const readNotificationsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!currentUserId || !userId) return

    async function markNotificationAsRead(notificationId: string) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', currentUserId)
        .eq('is_read', false)

      if (error) {
        console.error('Viga teavituse loetuks märkimisel:', error)
      } else {
        readNotificationsRef.current.add(notificationId)
        console.log(`Teavitus ${notificationId} märgitud loetuks`)
      }
    }

    async function processUnreadNotifications() {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('id, is_read')
        .eq('user_id', currentUserId)
        .eq('is_read', false)

      if (error) {
        console.error('Teavituste laadimise viga:', error)
        return
      }

      const unread = notifications?.filter(
        notif => !notif.is_read && !readNotificationsRef.current.has(notif.id)
      )

      unread?.forEach(notif => markNotificationAsRead(notif.id))
    }

    processUnreadNotifications()
  }, [currentUserId, userId])
}
