import { useEffect, useState } from 'react'
import { supabase } from '../../../..//lib/supabaseClient'
import type { Session } from '@supabase/supabase-js'
import type { Database } from '../../../../types/supabase'

type Message = Database['public']['Tables']['messages']['Row']

export function useSignedImageUrls(messages: Message[], session: Session | null) {
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({})

  useEffect(() => {
    if (!messages.length || !session) return

    const fetchSignedUrls = async () => {
      const newUrls: Record<number, string> = {}

      for (const msg of messages) {
        if (msg.image_url) {
          const { data, error } = await supabase.storage
            .from('chat-images')
            .createSignedUrl(msg.image_url, 60 * 60) // 1h kehtivus

          if (!error && data?.signedUrl) {
            newUrls[msg.id] = data.signedUrl
          } else {
            console.error('Signed URL genereerimise viga:', error)
          }
        }
      }

      setImageUrls(newUrls)
    }

    fetchSignedUrls()
  }, [messages, session])

  return imageUrls
}
