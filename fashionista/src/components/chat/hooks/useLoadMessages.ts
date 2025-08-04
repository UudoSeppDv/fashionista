import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../../../lib/supabaseClient'

const PAGE_SIZE = 10

interface Message {
  id: number 
  sender_id: string
  receiver_id: string
  created_at: string
  content: string
  image_url: string | null
  on_read: boolean
  on_read_at: string | null
}

interface UseLoadMessagesProps {
  currentUserId: string | null
  userId: string | null
}

interface LoadMessagesOptions {
  prepend?: boolean
  reset?: boolean
  newMessages?: Message[]
}

export function useLoadMessages({ currentUserId, userId }: UseLoadMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
const [initialLoadDone, setInitialLoadDone] = useState(false)

  const pageRef = useRef(0)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const lastLoadPrependRef = useRef(false)
  const prevMessagesLengthRef = useRef(0)

  const loadMessages = useCallback(
  async ({ prepend = false, reset = false }: LoadMessagesOptions = {}) => {
    if (!currentUserId || !userId || loadingMore || (!hasMore && !prepend)) return

    lastLoadPrependRef.current = prepend

    const container = messagesContainerRef.current
    const previousScrollTop = container?.scrollTop ?? 0
    const previousScrollHeight = container?.scrollHeight ?? 0

    if (reset) {
      pageRef.current = 0
      setHasMore(true)
    }

    setLoadingMore(true)

    const from = pageRef.current * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUserId})`
      )
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Load messages error:', error)
      setLoadingMore(false)
      return
    }

    if (data && data.length > 0) {
      const sorted = data.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )

      setMessages((prev) => {
        const prevIds = new Set(prev.map((m) => m.id))
        // Ainult need sõnumid, mida prev-s pole, lisame
        const filtered = sorted.filter((msg) => !prevIds.has(msg.id))

        if (reset) {
          return sorted
        } else if (prepend) {
          return [...filtered, ...prev]
        } else {
          return [...prev, ...filtered]
        }
      })

      if (!reset) {
        pageRef.current += 1
      }

      if (data.length < PAGE_SIZE) {
        setHasMore(false)
      }
    } else {
      setHasMore(false)
    }

    setLoadingMore(false)

    // Scrolli taastamine peale prependi
    if (prepend && container) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          const newHeight = container.scrollHeight
          container.scrollTop = newHeight - previousScrollHeight + previousScrollTop
        }, 0)
      })
    }
  },
  [currentUserId, userId, loadingMore, hasMore]
)


useEffect(() => {
  if (!currentUserId || !userId || initialLoadDone) return

  const initLoad = async () => {
    await loadMessages({ reset: true })
    const container = messagesContainerRef.current

    if (container && container.scrollHeight > container.clientHeight) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight
      })
    }

    setInitialLoadDone(true)
  }

  initLoad()
}, [currentUserId, userId, loadMessages, initialLoadDone])


useEffect(() => {
  const container = messagesContainerRef.current
  if (!container) return

  const lastScrollTopRef = { current: container.scrollTop }

  const handleScroll = () => {
    const currentScroll = container.scrollTop
    const isScrollingUp = currentScroll < lastScrollTopRef.current
    lastScrollTopRef.current = currentScroll

    if (
      isScrollingUp &&
      currentScroll <= 20 &&
      container.scrollHeight > container.clientHeight &&
      hasMore &&
      !loadingMore
    ) {
      console.log('Loading older messages...')
      loadMessages({ prepend: true })
    }
  }

  container.addEventListener('scroll', handleScroll)
  return () => container.removeEventListener('scroll', handleScroll)
}, [loadMessages, loadingMore, hasMore])



  // Scrolli alla ainult uue sõnumi lisamisel, mitte ajaloo laadimisel
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    if (messages.length > prevMessagesLengthRef.current && !lastLoadPrependRef.current) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight
      })
    }

    prevMessagesLengthRef.current = messages.length
  }, [messages])

  return {
    messages,
    loadMessages,
    messagesContainerRef,
    loadingMore,
    hasMore,
  }
}
