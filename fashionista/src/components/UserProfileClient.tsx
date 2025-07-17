'use client'

import { useParams } from 'next/navigation'
import UserProfile from '@/components/UserProfile'

export default function UserProfileClient() {
  const params = useParams()
  const rawPageUrl = params.page_url // next/navigation kasutab snake_case param nimesid

  // Normaliseeri pageUrl, et oleks string
  const pageUrl =
    typeof rawPageUrl === 'string'
      ? rawPageUrl
      : Array.isArray(rawPageUrl)
      ? rawPageUrl[0]
      : ''

  if (!pageUrl) {
    return <div>Puudub kasutaja URL</div>
  }

  return <UserProfile pageUrl={pageUrl} />
}
