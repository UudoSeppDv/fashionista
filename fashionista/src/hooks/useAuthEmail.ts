import { useEffect, useState } from 'react'
import useSession from './useSession'

export default function useAuthEmail() {
  const session = useSession()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email)
    }
  }, [session])

  return email
}
