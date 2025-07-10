import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '../types/supabase'

export async function updatePrivateData(data: {
  firstName: string
  lastName: string
  phone: string
  email: string
  location: string
  iban: string
}) {
  const supabase = createClientComponentClient<Database>()

  // 1. Hangi sessioon ja kasutaja
  const { data: sessionData } = await supabase.auth.getSession()
  const user = sessionData.session?.user

  if (!user) return { error: "No user session" }

  // 2. Uuenda email Supabase auth.users tabelis
  const { error: emailError } = await supabase.auth.updateUser({
    email: data.email,
  })

  // NB: Kui emailError on tõsine (nt duplikaat), tagasta kohe
  if (emailError) {
    return { error: emailError.message }
  }

  // 3. Uuenda public_users tabelit (nimi ja asukoht)
  const { error: publicError } = await supabase
    .from('public_users')
    .update({
      first_name: data.firstName,
      surname: data.lastName,
      location: data.location,
    })
    .eq('id', user.id)

  if (publicError) {
    return { error: publicError.message }
  }

  // 4. Uuenda user_private_data tabelit (telefon ja IBAN)
  const { error: privateError } = await supabase
    .from('user_private_data')
    .update({
      phone: data.phone,
      iban: data.iban,
    })
    .eq('user_id', user.id)

  if (privateError) {
    return { error: privateError.message }
  }

  // Kui kõik edukas
  return { error: null }
}
