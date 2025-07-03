'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Session } from '@supabase/supabase-js'
import type { Database } from '../../../types/supabase' // tee kindlaks, et tee on õige ja sul on see fail olemas

type Message = Database['public']['Tables']['messages']['Row']

export default function LoginAndMessages() {
  const supabase = createClientComponentClient<Database>()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])

  // Kontrollime sessiooni
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [supabase])

  // Laeme sõnumid, kui on sessioon
  useEffect(() => {
    if (!session?.user?.id) {
      setMessages([])
      return
    }

    setLoading(true)
    supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setMessages(data ?? [])
        setLoading(false)
      })
  }, [session, supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
    } else {
      setError(null)
      // sessioon uuendatakse automaatselt onAuthStateChange kaudu
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setMessages([])
  }

  if (!session?.user) {
    // LOGIN FORM
    return (
      <div style={{ maxWidth: 400, margin: '2rem auto', padding: 20, border: '1px solid #ddd' }}>
        <h2>Logi sisse</h2>
        <form onSubmit={handleLogin}>
          <label>
            Email<br />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: 8, marginBottom: 12 }}
            />
          </label>
          <label>
            Parool<br />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: 8, marginBottom: 12 }}
            />
          </label>
          <button type="submit" disabled={loading} style={{ padding: '10px 20px' }}>
            {loading ? 'Logimise käigus...' : 'Logi sisse'}
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
      </div>
    )
  }

  // USER LOGGED IN - SHOW MESSAGES
  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: 20, border: '1px solid #ddd' }}>
      <h2>Tere, {session.user.email}</h2>
      <button onClick={handleLogout} style={{ marginBottom: 20, padding: '6px 12px' }}>
        Logi välja
      </button>

      {loading && <p>Laen sõnumeid...</p>}
      {error && <p style={{ color: 'red' }}>Viga: {error}</p>}

      {!loading && messages.length === 0 && <p>Sõnumeid pole.</p>}

      {messages.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Saatja</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Saaja</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Sõnum</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg) => (
              <tr key={msg.id}>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{msg.sender_id}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{msg.receiver_id}</td>
                <td
                  style={{ border: '1px solid #ccc', padding: 8 }}
                  dangerouslySetInnerHTML={{ __html: msg.content ?? '[puudub tekst]' }}
                />
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
