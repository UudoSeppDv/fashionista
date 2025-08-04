import { useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';

type Message = {
  id: number;
  receiver_id: string;
  sender_id: string;
  on_read: boolean;
  // other fields if needed
};

export function useMarkMessagesAsRead({
  messages,
  currentUserId,
  userId,
  readMessages,
  setReadMessages,
}: {
  messages: Message[];
  currentUserId: string | null;
  userId: string | null;
  readMessages: Set<number>;
  setReadMessages: React.Dispatch<React.SetStateAction<Set<number>>>;
}) {
  useEffect(() => {
    if (!currentUserId || !userId) return;

    async function markMessageAsRead(messageId: number) {
      const { error } = await supabase
        .from('messages')
        .update({ on_read: true, on_read_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('receiver_id', currentUserId)
        .eq('on_read', false);

      if (error) {
        console.error('Viga sõnumi loetuks märkimisel:', error);
      } else {
        setReadMessages((prev) => new Set(prev).add(messageId));
        console.log(`Sõnum ${messageId} märgitud loetuks`);
      }
    }

    const unreadMessages = messages.filter(
      (msg) =>
        msg.receiver_id === currentUserId &&
        msg.sender_id === userId &&
        !msg.on_read &&
        !readMessages.has(msg.id)
    );

    if (unreadMessages.length === 0) return;

    (async () => {
      await Promise.all(unreadMessages.map((msg) => markMessageAsRead(msg.id)));
    })();
  }, [messages, currentUserId, userId, readMessages, setReadMessages]);
}
