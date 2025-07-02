'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ChatList from './ChatList'
import ChatWindow from './ChatWindow'

type Props = {
  userId: string
}

export default function ChatPageClient({ userId }: Props) {
  const router = useRouter()
  const [selectedUserId, setSelectedUserId] = useState<string>(userId)

  const handleSelectUser = (newUserId: string) => {
    setSelectedUserId(newUserId)
    router.push(`/messages/${newUserId}`)
  }

  if (!selectedUserId) {
    return <div>Vali vestlus kasutajate seast.</div>
  }

  return (
    <div className="flex h-screen">
      <ChatList onSelectUser={handleSelectUser} selectedUserId={selectedUserId} />
      <ChatWindow userId={selectedUserId} />
    </div>
  )
}
