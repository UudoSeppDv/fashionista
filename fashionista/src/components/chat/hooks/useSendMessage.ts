import { useState } from 'react'
import { supabase } from '../../../../lib/supabaseClient' 
import type { Message } from '../../../../types/message';

type SendMessageOptions = {
  userId: string;
  onNewMessage?: (msg: Message) => void;
  onImageUrl?: (msgId: string, url: string) => void;
};



export const useSendMessage = ({ userId, onNewMessage, onImageUrl }: SendMessageOptions) => {
  const [sending, setSending] = useState(false)

  const sendMessage = async ({
    text,
    image,
  }: {
    text: string
    image: File | null
  }) => {
    if (sending || (!text && !image) || !userId) return
    setSending(true)

    try {
      const { data: userData, error: authError } = await supabase.auth.getUser()
      if (authError || !userData?.user?.id) {
        console.error('Auth viga:', authError)
        alert('Sisselogimine on vajalik sõnumi saatmiseks')
        return
      }

      const currentUserId = userData.user.id

      // Kontrolli, kas kontakt on olemas
      const { data: existingContact, error: contactCheckError } = await supabase
        .from('user_contacts')
        .select('*')
        .eq('user_id', currentUserId)
        .eq('contact_id', userId)
        .single()

      if (!existingContact && contactCheckError?.code === 'PGRST116') {
        const { error: insertContactError } = await supabase
          .from('user_contacts')
          .insert({
            user_id: currentUserId,
            contact_id: userId,
          })

        if (insertContactError) {
          console.error('Kontakti lisamise viga:', insertContactError)
          alert('Kontakti lisamine ebaõnnestus')
          return
        }
      } else if (contactCheckError && contactCheckError.code !== 'PGRST116') {
        console.error('Kontakti kontrolli viga:', contactCheckError)
        alert('Kontakti kontroll ebaõnnestus')
        return
      }

      // Lae pilt (kui on)
      let imageFileName: string | null = null
      if (image) {
        const fileExt = image.name.split('.').pop()
        const fileName = `${currentUserId}_${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(fileName, image)

        if (uploadError) {
          console.error('Pildi üleslaadimise viga:', uploadError.message)
          alert('Pildi üleslaadimine ebaõnnestus')
          return
        }

        imageFileName = fileName
      }

      // Lisa sõnum andmebaasi
      const { data: insertedMessages, error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUserId,
          receiver_id: userId,
          content: text,
          image_url: imageFileName,
          created_at: new Date().toISOString(),
        })
        .select()

      if (messageError) {
        console.error('Sõnumi saatmise viga:', messageError)
        alert('Sõnumi saatmine ebaõnnestus')
        return
      }

      const newMsg = insertedMessages?.[0]
      if (!newMsg) return

      // Lisa local state'i (läbi callbacki)
      onNewMessage?.(newMsg)

      // Signed URL pildile (kui vaja)
      if (newMsg.image_url) {
        const { data, error } = await supabase.storage
          .from('chat-images')
          .createSignedUrl(newMsg.image_url, 60 * 60)

        if (!error && data?.signedUrl) {
          onImageUrl?.(newMsg.id, data.signedUrl)
        }
      }

      // Siin sendNotification eemaldatud, sest trigger lisab teavituse automaatselt
    } catch (err) {
      console.error('Tundmatu viga sõnumi saatmisel:', err)
      alert('Sõnumi saatmine ebaõnnestus')
    } finally {
      setSending(false)
    }
  }

  return { sendMessage, sending }
}
