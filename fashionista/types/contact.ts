export type ContactType = {
  id: string
  first_name: string
  surname: string
  avatar_url: string | null
  last_message_text: string | null
  last_message_timestamp: string | null
  on_read?: boolean;
}
