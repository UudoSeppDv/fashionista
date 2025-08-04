import { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabaseClient' // või sinu tegelik import

export type BlockedStatus = null | 'blockedByMe' | 'blockedByThem'

export function useBlockedStatus(currentUserId: string | null, userId: string | null) {
  const [isBlocked, setIsBlocked] = useState<BlockedStatus>(null)

  useEffect(() => {
    if (!currentUserId || !userId) {
      setIsBlocked(null)
      return
    }

    const checkBlockedStatus = async () => {
      try {
        const { data: blockedByMe, error: errorBlockedByMe } = await supabase
          .from('user_blocks')
          .select('*')
          .eq('blocker_id', currentUserId)
          .eq('blocked_id', userId)
          .single()

        if (errorBlockedByMe && errorBlockedByMe.code !== 'PGRST116') {
          console.error('Blokeeringu kontroll (mina -> tema) ebaõnnestus:', errorBlockedByMe)
          setIsBlocked(null)
          return
        }
        if (blockedByMe) {
          setIsBlocked('blockedByMe')
          return
        }

        const { data: blockedByThem, error: errorBlockedByThem } = await supabase
          .from('user_blocks')
          .select('*')
          .eq('blocker_id', userId)
          .eq('blocked_id', currentUserId)
          .single()

        if (errorBlockedByThem && errorBlockedByThem.code !== 'PGRST116') {
          console.error('Blokeeringu kontroll (tema -> mina) ebaõnnestus:', errorBlockedByThem)
          setIsBlocked(null)
          return
        }
        if (blockedByThem) {
          setIsBlocked('blockedByThem')
          return
        }

        setIsBlocked(null)
      } catch (err) {
        console.error('Blokeeringu kontrolli üldviga:', err)
        setIsBlocked(null)
      }
    }

    checkBlockedStatus()
  }, [currentUserId, userId])

  return isBlocked
}
