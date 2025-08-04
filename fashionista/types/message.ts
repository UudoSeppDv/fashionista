// src/types/message.ts
export type Message = {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  on_read: boolean;
  on_read_at: string | null;
};
