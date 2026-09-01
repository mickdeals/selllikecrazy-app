import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Star, Zap, ShieldCheck, MapPin, Heart, Share2 } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { formatPrice } from '../lib/geo'
import { ShareSheet } from '../components/listings/ShareSheet'
import toast from 'react-hot-toast'

// Demo seller data — in production fetched from Supabase by username
const DEMO_SELLER = {
  id: 'seller-1',
  username: 'james-t',
  displayName: 'James T.',
  avatar: 'JT',
  location: 'Perth, WA',
  memberSince: '2024',
  rating: 4.9,
  reviewCount: 34,
  salesCount: 47,
  isPowerSeller: true,
  isVerified: true,
  bio: 'Tech enthusiast and collector based in Perth. All items genuinely described, fast shipping, great comms. Happy to bundle!',
  listings: [
    { id: 1, title: 'iPhone 14 Pro 256GB', price: 850, category: 'Electronics', location: 'Perth, WA', shipping: 'free', badge: 'hot', emoji: '📱', thumb: 1 },
    { id: 5, title: 'Canon EOS R50 + lens', price: 1100, category: 'Electronics', location: 'Perth, WA', shipping: '$15', badge: 'new', emoji: '📷', thumb: 5 },
    { id: 9, title: 'Makita drill set + case', price: 180, category: 'Tools', location: 'Perth, WA', shipping: '$12', badge: null, emoji: '🔧', thumb: 3 },
    { id: 11, title: 'Apple Watch Series 8', price: 420, category: 'Electronics', location: 'Perth, WA', shipping: 'free', badge: 'hot', emoji: '⌚', thumb: 5 },
  ],
  reviews: [
    { id: 1, reviewer: 'Sarah M.', avatar: 'SM', rating: 5, comment: 'Brilliant seller, fast shipping, item exactly as described.', date: '3 days ago' },
    { id: 2, reviewer: 'Mike R.', avatar: 'MR', rating: 5, comment: 'Super easy transaction. Highly recommend.', date: '1 week ago' },
    { id: 3, reviewer: 'Priya K.', avatar: 'PK', rating: 4, comment: 'Good seller, item was perfect.', date: '2 weeks ago' },
  ],
}

function StarRow({ rating, size = 13 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size} fill={i <= Math.round(rating) ? '#FFD000' : 'none'} color={i <= Math.round(rating) ? '#FFD000' : '#AEAEB2'} />
      ))}
    </span>
  )
}

export default function SellerStorefront() {
  const navigate = useNavigate()
  const { username } = useParams()
  const { geo } = useAppStore()
  const symbol = geo?.symbol || '$'
  const [showShare, setShowShare] = useState(false)
  const seller = DEMO_SELLER // In production: fetch by username

  // Build a shareable "listing" object for the storefront itself
  const storefrontShare = {
    id: `store/${seller.username}`,
    title: `${seller.displayName}'s store on Sell Like Crazy`,
    price: '',
    emoji: '🏪',
  }

  return (
    <div className="page">

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--red), var(--orange))', padding: '20px 16px 0', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
            <ArrowLeft size={22} />
          </button>
          <span style={{ flex: 1, fontSize: 16, fontWeight: 600, color: 'white' }}>Seller store</span>
          <button onClick={() => setShowShare(true)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10, padding: '7px 10px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
            <Share2 size={14} /> Share store
          </button>
        </div>

        {/* Seller info */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', paddingBottom: 20 }}>
          <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: 'var(--red)', flexShrink: 0, boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
            {seller.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 19, fontWeight: 700, color: 'white' }}>{seller.displayName}</span>
              {seller.isPowerSeller && (
                <span style={{ background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Zap size={9} /> POWER SELLER
                </span>
              )}
              {seller.isVerified && <ShieldCheck size={16} color="rgba(255,255,255,0.9)" />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <StarRow rating={seller.rating} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
                {seller.rating} · {seller.reviewCount} reviews
              </span>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
              <span><MapPin size={11} style={{ verticalAlign: 'middle' }} /> {seller.location}</span>
              <span>⚡ {seller.salesCount} sales</span>
              <span>Since {seller.memberSince}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {seller.bio && (
        <div style={{ background: 'white', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{seller.bio}</p>
        </div>
      )}

      {/* Stats strip */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {[
          { num: seller.listings.length, label: 'Active listings' },
          { num: seller.salesCount, label: 'Total sales' },
          { num: `${seller.rating}★`, label: 'Avg rating' },
        ].map(s => (
          <div key={s.label} style={{ padding: '14px 8px', textAlign: 'center', borderRight: '1px solid var(--border)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{s.num}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Listings */}
      <div style={{ padding: '14px 0' }}>
        <div className="section-label px-16 mb-12">Active listings ({seller.listings.length})</div>
        <div className="listing-grid">
          {seller.listings.map(l => (
            <div key={l.id} className="listing-card" onClick={() => navigate(`/listing/${l.id}`)}>
              <div className={`listing-thumb thumb-${l.thumb}`}>
                <span>{l.emoji}</span>
                <div className="listing-thumb-badges">
                  {l.badge === 'hot' && <span className="badge badge-hot">Hot</span>}
                  {l.badge === 'new' && <span className="badge badge-new">New</span>}
                </div>
                <button className="listing-save-btn" onClick={e => { e.stopPropagation(); toast('Saved!', { icon: '❤️' }) }}>
                  <Heart size={13} />
                </button>
              </div>
              <div className="listing-info">
                <div className="listing-title">{l.title}</div>
                <div className="listing-price">{formatPrice(l.price, symbol)}</div>
                <div className="listing-loc">
                  <MapPin size={10} />{l.location}
                  {l.shipping === 'free' && <span className="ship-tag ship-free">Free</span>}
                  {l.shipping !== 'free' && l.shipping !== 'local' && <span className="ship-tag">{l.shipping}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div style={{ background: 'white', borderTop: '1px solid var(--border)', marginTop: 8 }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Reviews ({seller.reviewCount})</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <StarRow rating={seller.rating} size={14} />
            <span style={{ fontSize: 14, fontWeight: 700 }}>{seller.rating}</span>
          </div>
        </div>
        {seller.reviews.map(r => (
          <div key={r.id} style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--muted)', flexShrink: 0 }}>
                {r.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{r.reviewer}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{r.date}</span>
                </div>
                <StarRow rating={r.rating} size={11} />
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{r.comment}</p>
          </div>
        ))}
      </div>

      {showShare && (
        <ShareSheet listing={storefrontShare} symbol={symbol} onClose={() => setShowShare(false)} />
      )}
    </div>
  )
}
