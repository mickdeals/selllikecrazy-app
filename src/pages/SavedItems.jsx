import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MapPin, Trash2, Bell, Search } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { formatPrice } from '../lib/geo'
import toast from 'react-hot-toast'

const DEMO_SAVED = [
  { id: 1,  title: 'iPhone 14 Pro 256GB',      price: 850,  category: 'Electronics', location: 'Perth, WA',      emoji: '📱', thumb: 1, savedAt: '2 hours ago',   shipping: 'free_shipping' },
  { id: 3,  title: 'PS5 + 3 games bundle',     price: 620,  category: 'Gaming',      location: 'Sydney, NSW',    emoji: '🎮', thumb: 3, savedAt: '1 day ago',     shipping: 'free_shipping', badge: 'bundle' },
  { id: 9,  title: 'Apple Watch Series 8',     price: 420,  category: 'Electronics', location: 'Melbourne, VIC', emoji: '⌚', thumb: 5, savedAt: '2 days ago',    shipping: 'free_shipping' },
  { id: 5,  title: 'Canon EOS R50 + lens',     price: 1100, category: 'Electronics', location: 'Adelaide, SA',   emoji: '📷', thumb: 5, savedAt: '3 days ago',    shipping: 'buyer_pays' },
  { id: 101, title: 'Scalp Micropigmentation', price: 800,  category: 'SMP',          location: 'Ballajura, WA',  emoji: '💆', thumb: 1, savedAt: '5 days ago',    type: 'service' },
]

export default function SavedItems() {
  const navigate = useNavigate()
  const { user, geo } = useAppStore()
  const symbol = geo?.symbol || '$'
  const [saved, setSaved] = useState(DEMO_SAVED)
  const [search, setSearch] = useState('')

  const filtered = saved.filter(l =>
    !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.category.toLowerCase().includes(search.toLowerCase())
  )

  const remove = (id) => {
    setSaved(s => s.filter(l => l.id !== id))
    toast('Removed from saved', { icon: '💔' })
  }

  if (!user) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
        <Heart size={50} color="var(--border)" style={{ marginBottom: 16 }} />
        <h2 style={{ marginBottom: 8 }}>Sign in to see saved items</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>Heart any listing to save it here</p>
        <button className="btn-primary" onClick={() => navigate('/login')}>Sign in</button>
      </div>
    )
  }

  return (
    <div className="page">
      <div style={{ background: 'linear-gradient(135deg, var(--red), var(--orange))', padding: '20px 16px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Heart size={20} color="white" fill="white" />
          <h2 style={{ color: 'white', flex: 1 }}>Saved items</h2>
          <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
            {saved.length}
          </span>
        </div>
      </div>

      {/* Search */}
      <div style={{ background: 'white', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '9px 13px' }}>
          <Search size={16} color="var(--muted)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search saved items..."
            style={{ border: 'none', background: 'none', flex: 1, fontSize: 14, outline: 'none', fontFamily: 'inherit', color: 'var(--text)' }} />
        </div>
      </div>

      {filtered.length === 0 && saved.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>❤️</div>
          <h3 style={{ marginBottom: 8 }}>No saved items yet</h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.6 }}>
            Tap the heart on any listing to save it here for later
          </p>
          <button className="btn-primary" onClick={() => navigate('/browse')}>Browse listings</button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
          <p>No saved items match your search</p>
        </div>
      ) : (
        <div style={{ padding: '8px 14px' }}>
          {filtered.map(l => (
            <div key={l.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 14, marginBottom: 10, display: 'flex', gap: 12, alignItems: 'flex-start' }}
              onClick={() => navigate(`/listing/${l.id}`)}>

              {/* Thumb */}
              <div className={`listing-thumb thumb-${l.thumb}`}
                style={{ width: 72, height: 72, borderRadius: 14, fontSize: 30, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                {l.emoji}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4, lineHeight: 1.3 }}>{l.title}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--red)', marginBottom: 4 }}>{formatPrice(l.price, symbol)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted)', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={10} /> {l.location}</span>
                  {l.shipping === 'free_shipping' && <span style={{ color: 'var(--green)', fontWeight: 700 }}>Free shipping</span>}
                  {l.type === 'service' && <span style={{ background: '#F0F0FF', color: '#635BFF', fontWeight: 700, padding: '1px 7px', borderRadius: 20, fontSize: 10 }}>Service</span>}
                  <span>· Saved {l.savedAt}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                <button onClick={(e) => {
                  e.stopPropagation()
                  // Toggle price drop alert
                  const isOn = l.priceAlert
                  setSaved(s => s.map(x => x.id === l.id ? { ...x, priceAlert: !isOn } : x))
                  toast(isOn ? 'Price alert removed' : '🔔 You\'ll be notified if the price drops!', { duration: 2500 })
                }}
                  style={{ width: 34, height: 34, borderRadius: 10, background: l.priceAlert ? '#FFF0F3' : 'var(--bg)', border: `1px solid ${l.priceAlert ? 'var(--red)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: l.priceAlert ? 'var(--red)' : 'var(--muted)' }}>
                  <Bell size={14} fill={l.priceAlert ? 'var(--red)' : 'none'} />
                </button>
                <button onClick={() => remove(l.id)}
                  style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--muted)' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {/* Tip */}
          <div style={{ background: 'var(--bg)', borderRadius: 14, padding: '12px 14px', textAlign: 'center', marginTop: 8 }}>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
              🔔 Tap the bell on any saved item to get notified when the price drops
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
