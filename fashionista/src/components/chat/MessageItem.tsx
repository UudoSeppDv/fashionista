import Image from 'next/image'

type Message = {
  id: number
  sender_id: string
  content: string
  image_url: string | null
}

type UserInfo = {
  first_name?: string | null
  surname?: string | null
  avatar_url?: string | null
}

export function MessageItem({
  msg,
  isCurrentUser,
  currentUserInfo,
  recipientInfo,
  showAvatar,
  imageUrls,
  onOpenImage,
}: {
  msg: Message
  isCurrentUser: boolean
  currentUserInfo: UserInfo
  recipientInfo: UserInfo
  showAvatar: boolean
  imageUrls: Record<string, string>
  onOpenImage: (url: string) => void
}) {
  const firstName = isCurrentUser
    ? currentUserInfo.first_name || ''
    : recipientInfo.first_name || ''
  const surname = isCurrentUser
    ? currentUserInfo.surname || ''
    : recipientInfo.surname || ''
  const avatarUrl = isCurrentUser
    ? currentUserInfo.avatar_url || null
    : recipientInfo.avatar_url

  return (
    <div
      key={msg.id}
      className={`p-3 max-w-[70%] flex items-end ${
        isCurrentUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      }`}
    >
      {showAvatar ? (
        <div className="w-10 h-10 rounded-full bg-pink-400 text-white flex items-center justify-center font-semibold flex-shrink-0">
          {avatarUrl ? (
            <div className="relative w-10 h-10">
              <Image
                src={avatarUrl}
                alt="Avatar"
                fill
                sizes="40px"
                className="rounded-full object-cover"
              />
            </div>
          ) : (
            ((firstName?.[0]?.toUpperCase() ?? '') +
              (surname?.[0]?.toUpperCase() ?? '')) ||
            '?'
          )}
        </div>
      ) : (
        <div className="w-10 h-10 flex-shrink-0" />
      )}

      <div
        className={`p-2 ml-2 mr-2 border ${
          msg.image_url
            ? 'bg-transparent border-none'
            : isCurrentUser
            ? 'bg-pink-100 border-gray-900 ml-2'
            : 'bg-gray-900 text-white mr-2'
        } max-w-[calc(100%-56px)]`}
      >
        <div className="whitespace-pre-wrap">{msg.content}</div>

        {msg.image_url && imageUrls[msg.id] && (
          <div
            className="relative mt-2 cursor-pointer rounded"
            style={{ maxWidth: 300, maxHeight: '12rem', width: 'auto', height: 'auto' }}
            onClick={() => onOpenImage(imageUrls[msg.id])}
          >
            <Image
              src={imageUrls[msg.id]}
              alt="Sõnumi pilt"
              width={300}
              height={300}
              unoptimized
              style={{ objectFit: 'contain', maxHeight: '12rem' }}
              className="rounded cursor-pointer mt-2"
            />
          </div>
        )}
      </div>
    </div>
  )
}
