// src/app/messages/[userId]/page.tsx


import ChatPageClient from '@/components/ChatPageClient'

type PageProps = {
  params: Promise<{ userId?: string | string[] }>
}

export default async function MessageUserPage(props: PageProps) {
  const params = await props.params // **await params**

  const userId =
    typeof params.userId === 'string' ? params.userId :
    Array.isArray(params.userId) ? params.userId[0] : ''

  return <ChatPageClient userId={userId} />
}
