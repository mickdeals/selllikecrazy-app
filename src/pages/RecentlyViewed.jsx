import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, MapPin, X } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { formatPrice } from '../lib/geo'

const MAX_RECENT = 20

/**
 * Track a listing view — call this on ListingDetail mount
 */
export function trackView(listing) {
  try {
    const key = 'slc_recently_viewed'
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    const filtered = existing.filter(l => l.id !== listing.id)
    const updated = [{ ...listing, viewedAt: Date.now() }, ...filtered].slice(0, MAX_RECENT)
    localStorage.setItem(key, JSON.stringify(updated))
  } catch {}
}

/**
 * Get recently viewed listings
 */
export function getRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem('slc_recently_viewed') || '[]')
  } catch { return [] }
}

/**
 * Clear recently viewed
 */
export function clearRecentlyViewed() {
  try { localStorage.removeItem('slc_recently_viewed') } catch {}
}

function timeAgo(ts) {
  const mins = Math.floor((Date.now() - ts) / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function RecentlyViewed() {
  const navigate = useNavigate()
  const { geo } = useAppStore()
  const symbol = geo?.symbol || '$'
  const [listings, setListings] = useState([])

  useEffect(() => {
    setListings(getRecentlyViewed())
  }, [])

  const remove = (id) => {
    const updated = listings.filter(l => l.id !== id)
    setListings(updated)
    try { localStorage.setItem('slc_recently_viewed', JSON.stringify(updated)) } catch {}
  }

  if (listings.length === 0) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>👀</div>
        <h2 style={{ marginBottom: 8 }}>Nothing viewed yet</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.6 }}>
          Listings you tap will appear here so you can easily find them again
        </p>
        <button className="btn-primary" onClick={() => navigate('/browse')}>Start browsing</button>
      </div>
    )
  }

  return (
    <div className="page">
      <div style={{ background: 'linear-gradient(135deg, var(--red), var(--orange))', padding: '20px 16px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Clock size={20} color="white" />
          <h2 style={{ color: 'white', flex: 1 }}>Recently viewed</h2>
          <button onClick={() => { clearRecentlyViewed(); setListings([]) }}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 20, padding: '4px 12px', fontSize: 11, color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>
            Clear all
          </button>
        </div>
      </div>

      <div style={{ padding: '8px 14px' }}>
        {listings.map(l => (
          <div key={l.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 14, marginBottom: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className={`listing-thumb thumb-${l.thumb || 1}`}
              onClick={() => navigate(`/listing/${l.id}`)}
              style={{ width: 62, height: 62, borderRadius: 14, fontSize: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              {l.emoji || '📦'}
            </div>
            <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => navigate(`/listing/${l.id}`)}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--red)', marginBottom: 3 }}>{formatPrice(l.price, symbol)}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={10} />{timeAgo(l.viewedAt)}
                {l.location && <><MapPin size={10} />{l.location}</>}
              </div>
            </div>
            <button onClick={() => remove(l.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4, flexShrink: 0 }}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Compact recently viewed strip — shown on Home page
 */
export function RecentlyViewedStrip() {
  const navigate = useNavigate()
  const { geo } = useAppStore()
  const symbol = geo?.symbol || '$'
  const [listings, setListings] = useState([])

  useEffect(() => {
    setListings(getRecentlyViewed().slice(0, 6))
  }, [])

  if (listings.length === 0) return null

  return (
    <div>
      <div style={{ padding: '14px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>Recently viewed</span>
        <button onClick={() => navigate('/recently-viewed')}
          style={{ fontSize: 12, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }}>
          See all →
        </button>
      </div>
      <div style={{ display: 'flex', gap: 10, overflow: 'auto', padding: '0 16px 16px', scrollbarWidth: 'none' }}>
        {listings.map(l => (
          <div key={l.id} onClick={() => navigate(`/listing/${l.id}`)}
            style={{ minWidth: 120, background: 'white', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', flexShrink: 0 }}>
            <div className={`listing-thumb thumb-${l.thumb || 1}`}
              style={{ height: 90, fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0 }}>
              {l.emoji || '📦'}
            </div>
            <div style={{ padding: '8px 10px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text)' }}>{l.title}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)' }}>{formatPrice(l.price, symbol)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
