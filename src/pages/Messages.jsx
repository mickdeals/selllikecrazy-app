import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Search, Ban } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useBlockedUsers, BlockUserButton } from './BlockedUsers'
import toast from 'react-hot-toast'

const DEMO_THREADS = [
  {
    id: 1, listingId: 1, listingTitle: 'iPhone 14 Pro 256GB', listingEmoji: '📱',
    otherUser: { name: 'James T.', avatar: 'JT', isPowerSeller: true },
    lastMessage: 'Is the battery health really 97%?',
    lastTime: '2m ago', unread: 2, thumb: 1,
    messages: [
      { id: 1, from: 'them', text: 'Hi, is this still available?', time: '10:14am' },
      { id: 2, from: 'me',   text: 'Yes it is! Still in great condition.', time: '10:16am' },
      { id: 3, from: 'them', text: 'Is the battery health really 97%?', time: '10:22am' },
    ]
  },
  {
    id: 2, listingId: 3, listingTitle: 'PS5 + 3 games bundle', listingEmoji: '🎮',
    otherUser: { name: 'Sarah M.', avatar: 'SM', isPowerSeller: false },
    lastMessage: 'Would you take $580 for the bundle?',
    lastTime: '1hr ago', unread: 1, thumb: 3,
    messages: [
      { id: 1, from: 'them', text: 'Hey, love the bundle deal!', time: '9:00am' },
      { id: 2, from: 'them', text: 'Would you take $580 for the bundle?', time: '9:05am' },
    ]
  },
  {
    id: 3, listingId: 5, listingTitle: 'Canon EOS R50 + lens', listingEmoji: '📷',
    otherUser: { name: 'Mike R.', avatar: 'MR', isPowerSeller: false },
    lastMessage: 'Thanks! Will pick up Saturday.',
    lastTime: 'Yesterday', unread: 0, thumb: 5,
    messages: [
      { id: 1, from: 'me',   text: 'Camera is still available, great condition.', time: 'Yesterday' },
      { id: 2, from: 'them', text: 'Thanks! Will pick up Saturday.', time: 'Yesterday' },
    ]
  },
]

function ThreadList({ threads, onSelect, selectedId }) {
  return (
    <div>
      {threads.map(t => (
        <div key={t.id} onClick={() => onSelect(t)}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--border)', background: selectedId === t.id ? '#FFF0F3' : 'white', cursor: 'pointer', transition: 'background 0.1s' }}>
          {/* Avatar */}
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
          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
              <span style={{ fontSize: 14, fontWeight: t.unread > 0 ? 700 : 600, color: 'var(--text)' }}>{t.otherUser.name}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{t.lastTime}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2 }}>{t.lastMessage}</div>
            <div style={{ fontSize: 11, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>{t.listingEmoji}</span>{t.listingTitle}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function MessageThread({ thread, onBack, onSend }) {
  const [input, setInput] = useState('')
  const { blockUser, unblockUser, isBlocked } = useBlockedUsers()
  const blocked = isBlocked(thread.otherUser.id || 'demo-id')

  const handleSend = () => {
    if (!input.trim()) return
    if (blocked) { toast.error('You have blocked this user'); return }
    onSend(thread.id, input.trim())
    setInput('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Thread header */}
      <div style={{ background: 'white', padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}><ArrowLeft size={22} /></button>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--red), var(--orange))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
          {thread.otherUser.avatar}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{thread.otherUser.name}</div>
          <div style={{ fontSize: 11, color: 'var(--red)' }}>{thread.listingEmoji} {thread.listingTitle}</div>
        </div>
        <BlockUserButton
          targetId={thread.otherUser.id || 'demo-id'}
          targetName={thread.otherUser.name}
          isBlocked={blocked}
          onBlock={() => blockUser(thread.otherUser.id || 'demo-id', thread.otherUser.name)}
          onUnblock={() => unblockUser(thread.otherUser.id || 'demo-id')}
        />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px', background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {thread.messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '75%' }}>
              <div style={{ background: msg.from === 'me' ? 'linear-gradient(135deg, var(--red), var(--orange))' : 'white', color: msg.from === 'me' ? 'white' : 'var(--text)', padding: '10px 14px', borderRadius: msg.from === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', fontSize: 14, lineHeight: 1.4, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                {msg.text}
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3, textAlign: msg.from === 'me' ? 'right' : 'left' }}>{msg.time}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
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
  const [threads, setThreads] = useState(DEMO_THREADS)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')

  if (!user) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 50, marginBottom: 16 }}>💬</div>
        <h2 style={{ marginBottom: 8 }}>Sign in to see messages</h2>
        <button className="btn-primary" onClick={() => navigate('/login')}>Sign in</button>
      </div>
    )
  }

  const handleSend = (threadId, text) => {
    setThreads(prev => prev.map(t => {
      if (t.id !== threadId) return t
      return {
        ...t,
        lastMessage: text,
        lastTime: 'Just now',
        unread: 0,
        messages: [...t.messages, { id: Date.now(), from: 'me', text, time: 'Just now' }],
      }
    }))
  }

  const handleSelect = (thread) => {
    setSelected(thread)
    // Mark as read
    setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, unread: 0 } : t))
  }

  const filtered = threads.filter(t =>
    t.otherUser.name.toLowerCase().includes(search.toLowerCase()) ||
    t.listingTitle.toLowerCase().includes(search.toLowerCase())
  )

  const totalUnread = threads.reduce((s, t) => s + t.unread, 0)

  if (selected) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', paddingBottom: 66 }}>
        <MessageThread thread={selected} onBack={() => setSelected(null)} onSend={handleSend} />
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

      {filtered.length === 0 ? (
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
