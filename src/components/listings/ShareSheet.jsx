import { useState } from 'react'
import { X, Link, Mail, Share2 } from 'lucide-react'
import { shareNative, openSharePlatform, copyLink } from '../../lib/share'
import toast from 'react-hot-toast'

const PLATFORMS = [
  { id: 'native',    label: 'Share',     icon: Share2,       color: '#007AFF', bg: '#F0F5FF' },
  { id: 'whatsapp',  label: 'WhatsApp',  emoji: '💬',        color: '#25D366', bg: '#F0FFF4' },
  { id: 'facebook',  label: 'Facebook',  emoji: '👥',        color: '#1877F2', bg: '#F0F5FF' },
  { id: 'twitter',   label: 'X / Twitter', emoji: '🐦',      color: '#0F1419', bg: '#F5F5F7' },
  { id: 'sms',       label: 'SMS',       emoji: '💬',        color: '#34C759', bg: '#F0FFF4' },
  { id: 'email',     label: 'Email',     icon: Mail,         color: '#FF6B00', bg: '#FFF5F0' },
  { id: 'copy',      label: 'Copy link', icon: Link,         color: '#6E6E73', bg: '#F5F5F7' },
]

export function ShareSheet({ listing, symbol = '$', onClose }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async (platformId) => {
    if (platformId === 'native') {
      const result = await shareNative(listing, symbol)
      if (result.success) { onClose?.(); return }
    }

    if (platformId === 'copy') {
      const result = await copyLink(listing)
      if (result.success) {
        setCopied(true)
        toast.success('Link copied!')
        setTimeout(() => setCopied(false), 2000)
      }
      return
    }

    openSharePlatform(platformId, listing, symbol)
    onClose?.()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: 'white', borderRadius: '20px 20px 0 0', padding: '16px 20px 36px' }}>

        <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 16px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>Share listing</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}><X size={20} /></button>
        </div>

        {/* Listing preview */}
        <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '10px 14px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 28 }}>{listing.emoji}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{listing.title}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--red)' }}>{symbol}{listing.price}</div>
          </div>
        </div>

        {/* Platform grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {PLATFORMS.map(p => (
            <button key={p.id} onClick={() => handleShare(p.id)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 4px', borderRadius: 12, fontFamily: 'inherit' }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: p.emoji ? 22 : 0 }}>
                {p.emoji && p.emoji}
                {p.icon && <p.icon size={22} color={p.color} />}
              </div>
              <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 500, textAlign: 'center' }}>
                {p.id === 'copy' && copied ? 'Copied!' : p.label}
              </span>
            </button>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', marginTop: 16 }}>
          Share your listing and sell faster ⚡
        </p>
      </div>
    </div>
  )
}
