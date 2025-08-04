import type {
  Notification,
  NotificationFromDB,
  MessageNotification,
  OrderNotification,
} from '../../types/Notification'

export function isMessageNotification(
  notif: Notification | NotificationFromDB
): notif is MessageNotification {
  return notif.type === 'message'
}

export function isOrderNotification(
  notif: Notification | NotificationFromDB
): notif is OrderNotification {
  return notif.type === 'order'
}

export function isPriceChangeNotification(
  notif: NotificationFromDB
): notif is NotificationFromDB & { type: 'price_change' } {
  return notif.type === 'price_change'
}

