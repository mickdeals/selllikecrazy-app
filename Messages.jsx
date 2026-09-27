import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Search } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useBlockedUsers, BlockUserButton } from './BlockedUsers'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

function ThreadList({ threads, onSelect, selectedId }) {
  return (
    <div>
      {threads.map(t => (
        <div key={t.id} onClick={() => onSelect(t)}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--border)', background: selectedId === t.id ? '#FFF0F3' : 'white', cursor: 'pointer', transition: 'background 0.1s' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg, var(--red), var(--orange))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 15 }}>
              {t.otherUser.avatar}
            </div>
            {t.unread > 0 && (
              <div style={{ position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: 'var(--red)', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                {t.unread}
              </div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
              <span style={{ fontSize: 14, fontWeight: t.unread > 0 ? 700 : 600, color: 'var(--text)' }}>{t.otherUser.name}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{t.lastTime}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2 }}>{t.lastMessage}</div>
            <div style={{ fontSize: 11, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>{t.listingEmoji || '📦'}</span>{t.listingTitle}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function MessageThread({ thread, onBack, onSend, currentUserId }) {
  const [input, setInput] = useState('')
  const { blockUser, unblockUser, isBlocked } = useBlockedUsers()
  const blocked = isBlocked(thread.otherUser.id)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread.messages])

  const handleSend = () => {
    if (!input.trim()) return
    if (blocked) { toast.error('You have blocked this user'); return }
    onSend(thread, input.trim())
    setInput('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ background: 'white', padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}><ArrowLeft size={22} /></button>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--red), var(--orange))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
          {thread.otherUser.avatar}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{thread.otherUser.name}</div>
          <div style={{ fontSize: 11, color: 'var(--red)' }}>{thread.listingEmoji || '📦'} {thread.listingTitle}</div>
        </div>
        <BlockUserButton
          targetId={thread.otherUser.id}
          targetName={thread.otherUser.name}
          isBlocked={blocked}
          onBlock={() => blockUser(thread.otherUser.id, thread.otherUser.name)}
          onUnblock={() => unblockUser(thread.otherUser.id)}
        />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px', background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {thread.messages.map(msg => {
          const isMe = msg.sender_id === currentUserId
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '75%' }}>
                <div style={{ background: isMe ? 'linear-gradient(135deg, var(--red), var(--orange))' : 'white', color: isMe ? 'white' : 'var(--text)', padding: '10px 14px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', fontSize: 14, lineHeight: 1.4, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                  {msg.content}
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3, textAlign: isMe ? 'right' : 'left' }}>
                  {new Date(msg.created_at).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ background: 'white', padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder="Type a message..."
          rows={1}
          style={{ flex: 1, border: '1.5px solid var(--border)', borderRadius: 20, padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'none', background: 'var(--bg)', color: 'var(--text)', maxHeight: 100 }} />
        <button onClick={handleSend}
          style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, var(--red), var(--orange))', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(255,45,85,0.3)' }}>
          <Send size={18} color="white" />
        </button>
      </div>
    </div>
  )
}

export default function Messages() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (user) fetchThreads()
  }, [user])

  const fetchThreads = async () => {
    setLoading(true)
    try {
      // Fetch all messages where I'm sender or recipient, ordered by newest
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          listing:listing_id (id, title, listing_type),
          sender:sender_id (id, email, raw_user_meta_data),
          recipient:recipient_id (id, email, raw_user_meta_data)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group messages into threads by (other_user_id + listing_id)
      const threadMap = {}
      for (const msg of (data || [])) {
        const otherId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id
        const key = `${otherId}-${msg.listing_id}`
        if (!threadMap[key]) {
          const otherUser = msg.sender_id === user.id ? msg.recipient : msg.sender
          const name = otherUser?.raw_user_meta_data?.username || otherUser?.email?.split('@')[0] || 'User'
          const avatar = name.slice(0, 2).toUpperCase()
          threadMap[key] = {
            id: key,
            listingId: msg.listing_id,
            listingTitle: msg.listing?.title || 'Listing',
            listingEmoji: msg.listing?.listing_type === 'service' ? '🛠️' : '📦',
            otherUser: { id: otherId, name, avatar },
            lastMessage: msg.content,
            lastTime: formatTime(msg.created_at),
            unread: 0,
            messages: [],
          }
        }
        if (!msg.read_at && msg.recipient_id === user.id) {
          threadMap[key].unread++
        }
        threadMap[key].messages.push(msg)
      }

      // Sort messages within each thread oldest first
      const threadList = Object.values(threadMap)
      threadList.forEach(t => t.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)))
      setThreads(threadList)
    } catch (e) {
      console.error(e)
      toast.error('Could not load messages')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (iso) => {
    const d = new Date(iso)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    if (diff < 172800000) return 'Yesterday'
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
  }

  const handleSend = async (thread, text) => {
    try {
      const { data, error } = await supabase.from('messages').insert({
        listing_id: thread.listingId,
        sender_id: user.id,
        recipient_id: thread.otherUser.id,
        content: text,
      }).select().single()
      if (error) throw error
      // Update thread locally
      setThreads(prev => prev.map(t => {
        if (t.id !== thread.id) return t
        return { ...t, lastMessage: text, lastTime: 'Just now', messages: [...t.messages, data] }
      }))
      if (selected?.id === thread.id) {
        setSelected(prev => ({ ...prev, lastMessage: text, messages: [...prev.messages, data] }))
      }
    } catch {
      toast.error('Failed to send message')
    }
  }

  const handleSelect = async (thread) => {
    setSelected(thread)
    // Mark messages as read
    await supabase.from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('recipient_id', user.id)
      .eq('listing_id', thread.listingId)
      .eq('sender_id', thread.otherUser.id)
      .is('read_at', null)
    setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, unread: 0 } : t))
  }

  if (!user) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 50, marginBottom: 16 }}>💬</div>
        <h2 style={{ marginBottom: 8 }}>Sign in to see messages</h2>
        <button className="btn-primary" onClick={() => navigate('/login')}>Sign in</button>
      </div>
    )
  }

  const filtered = threads.filter(t =>
    t.otherUser.name.toLowerCase().includes(search.toLowerCase()) ||
    t.listingTitle.toLowerCase().includes(search.toLowerCase())
  )

  const totalUnread = threads.reduce((s, t) => s + t.unread, 0)

  if (selected) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', paddingBottom: 66 }}>
        <MessageThread thread={selected} onBack={() => setSelected(null)} onSend={handleSend} currentUserId={user.id} />
      </div>
    )
  }

  return (
    <div className="page">
      <div style={{ background: 'linear-gradient(135deg, var(--red), var(--orange))', padding: '20px 16px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ color: 'white', flex: 1 }}>Messages</h2>
          {totalUnread > 0 && (
            <div style={{ background: 'white', color: 'var(--red)', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
              {totalUnread} unread
            </div>
          )}
        </div>
      </div>

      <div style={{ background: 'white', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '9px 13px' }}>
          <Search size={16} color="var(--muted)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages..."
            style={{ border: 'none', background: 'none', flex: 1, fontSize: 14, outline: 'none', fontFamily: 'inherit', color: 'var(--text)' }} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--muted)' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>💬</div>
          <p>Loading messages...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--muted)' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>💬</div>
          <h3 style={{ marginBottom: 8 }}>No messages yet</h3>
          <p style={{ fontSize: 13 }}>When buyers contact you or you contact sellers, messages appear here</p>
        </div>
      ) : (
        <ThreadList threads={filtered} onSelect={handleSelect} selectedId={selected?.id} />
      )}
    </div>
  )
}
