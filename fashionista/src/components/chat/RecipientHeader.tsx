import Image from 'next/image'
import { useRouter } from 'next/navigation'

type RecipientInfo = {
  first_name: string | null
  surname: string | null
  avatar_url: string | null
  page_url: string | null
}

function getInitials(firstName: string | null, lastName: string | null) {
  const firstInitial = firstName ? firstName[0].toUpperCase() : ''
  const lastInitial = lastName ? lastName[0].toUpperCase() : ''
  return firstInitial + lastInitial
}

export function RecipientHeader({
  recipientInfo,
  loading,
}: {
  recipientInfo: RecipientInfo | null
  loading: boolean
}) {
  const router = useRouter()

  if (loading) {
    return (
      <div className="flex items-center border-gray-600 border-b p-4">
        <div className="w-10 h-10 rounded-full bg-pink-200 animate-pulse cursor-pointer" />
        <div className="ml-3 w-24 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  if (!recipientInfo) return null

  const goToPage = () => {
    if (recipientInfo.page_url) {
      router.push(`/kasutaja/${recipientInfo.page_url}`)
    }
  }

  return (
    <div className="flex items-center border-gray-600 border-b p-4">
      {recipientInfo.avatar_url ? (
        <div
          onClick={goToPage}
          className="w-10 h-10 rounded-full overflow-hidden cursor-pointer"
        >
          <Image
            src={recipientInfo.avatar_url}
            alt="Kontopilt"
            className="object-cover w-full h-full"
            width={40}
            height={40}
          />
        </div>
      ) : (
        <div
          onClick={goToPage}
          className="w-10 h-10 rounded-full bg-pink-400 text-white flex items-center justify-center font-semibold cursor-pointer"
        >
          {getInitials(recipientInfo.first_name, recipientInfo.surname)}
        </div>
      )}
      <div onClick={goToPage} className="cursor-pointer ml-3 font-semibold text-lg">
        {recipientInfo.first_name} {recipientInfo.surname}
      </div>
    </div>
  )
}
