export type NotificationBase = {
  id: string
  user_id: string
  message: string
  is_read: boolean
  created_at: string
  type: string
  link: string | null
}

// Supabase’ist tulev tüüp (laiendatud uue tüübiga)
export type NotificationFromDB = NotificationBase & {
  type: 'message' | 'order' | 'new_product' | 'price_change'
  sender_id?: string | null
  product_id?: string | null
  product_image_url?: string | null
}

// Spetsiifilised tüübid
export type MessageNotification = NotificationBase & {
  type: 'message'
  sender_id: string | null
}

export type OrderNotification = NotificationBase & {
  type: 'order'
  product_id: string | null
  product_image_url: string | null
}

export type NewProductNotification = NotificationBase & {
  type: 'new_product'
  sender_id: string | null
  product_id: string | null
}

export type PriceChangeNotification = NotificationBase & {
  type: 'price_change'
  product_id: string | null
  product_image_url: string | null
}


// Union tüüp kõikidele notifikatsioonidele
export type Notification =
  | MessageNotification
  | OrderNotification
  | NewProductNotification
  | PriceChangeNotification
