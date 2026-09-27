import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Star, Zap, ShieldCheck, MapPin, Heart, Share2 } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { supabase } from '../lib/supabase'
import { formatPrice } from '../lib/geo'
import { ShareSheet } from '../components/listings/ShareSheet'
import toast from 'react-hot-toast'

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
  const [seller, setSeller] = useState(null)
  const [listings, setListings] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStorefront = async () => {
      setLoading(true)

      // Fetch seller profile by username
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (profileError || !profile) {
        setLoading(false)
        return
      }

      setSeller(profile)

      // Fetch active listings for this seller
      const { data: listingData } = await supabase
        .from('listings')
        .select('id, title, price, category, location, pickup_suburb, photo_urls, listing_type, shipping_type, status')
        .eq('seller_id', profile.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      setListings(listingData || [])

      // Fetch reviews for this seller
      const { data: reviewData } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at, reviewer:profiles!reviewer_id(username, display_name, avatar_url)')
        .eq('seller_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20)

      setReviews(reviewData || [])
      setLoading(false)
    }

    if (username) fetchStorefront()
  }, [username])

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <p style={{ color: 'var(--muted)' }}>Loading store...</p>
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
        <h2 style={{ marginBottom: 8 }}>Seller not found</h2>
        <button className="btn-secondary" onClick={() => navigate(-1)}>Go back</button>
      </div>
    )
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null

  const memberSince = seller.created_at
    ? new Date(seller.created_at).getFullYear()
    : null

  const storefrontShare = {
    id: `store/${seller.username}`,
    title: `${seller.display_name || seller.username}'s store on Sell Like Crazy`,
    price: '',
    emoji: '🏪',
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatReviewDate = (dateStr) => {
    if (!dateStr) return ''
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return '1 day ago'
    if (days < 7) return `${days} days ago`
    if (days < 14) return '1 week ago'
    return `${Math.floor(days / 7)} weeks ago`
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
          <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: 'var(--red)', flexShrink: 0, boxShadow: '0 4px 14px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            {seller.avatar_url
              ? <img src={seller.avatar_url} alt={seller.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : getInitials(seller.display_name || seller.username)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 19, fontWeight: 700, color: 'white' }}>{seller.display_name || seller.username}</span>
              {seller.is_power_seller && (
                <span style={{ background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Zap size={9} /> POWER SELLER
                </span>
              )}
              {seller.is_verified && <ShieldCheck size={16} color="rgba(255,255,255,0.9)" />}
            </div>
            {avgRating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <StarRow rating={parseFloat(avgRating)} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
                  {avgRating} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
              {seller.location && <span><MapPin size={11} style={{ verticalAlign: 'middle' }} /> {seller.location}</span>}
              {seller.sales_count > 0 && <span>⚡ {seller.sales_count} sales</span>}
              {memberSince && <span>Since {memberSince}</span>}
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
          { num: listings.length, label: 'Active listings' },
          { num: seller.sales_count || 0, label: 'Total sales' },
          { num: avgRating ? `${avgRating}★` : '—', label: 'Avg rating' },
        ].map(s => (
          <div key={s.label} style={{ padding: '14px 8px', textAlign: 'center', borderRight: '1px solid var(--border)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{s.num}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Listings */}
      <div style={{ padding: '14px 0' }}>
        <div className="section-label px-16 mb-12">Active listings ({listings.length})</div>
        <div className="listing-grid">
          {listings.map(l => (
            <div key={l.id} className="listing-card" onClick={() => navigate(`/listing/${l.id}`)}>
              <div className="listing-thumb" style={{ background: 'var(--bg)', overflow: 'hidden' }}>
                {l.photo_urls?.[0]
                  ? <img src={l.photo_urls[0]} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span>📦</span>}
                <div className="listing-thumb-badges">
                  {l.listing_type === 'service' && <span className="badge badge-new">Service</span>}
                </div>
                <button className="listing-save-btn" onClick={e => { e.stopPropagation(); toast('Saved!', { icon: '❤️' }) }}>
                  <Heart size={13} />
                </button>
              </div>
              <div className="listing-info">
                <div className="listing-title">{l.title}</div>
                <div className="listing-price">{formatPrice(l.price, symbol)}</div>
                <div className="listing-loc">
                  <MapPin size={10} />{l.pickup_suburb || l.location}
                  {l.shipping_type === 'free_shipping' && <span className="ship-tag ship-free">Free</span>}
                  {l.shipping_type === 'buyer_pays' && <span className="ship-tag">+ shipping</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div style={{ background: 'white', borderTop: '1px solid var(--border)', marginTop: 8 }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Reviews ({reviews.length})</h3>
          {avgRating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <StarRow rating={parseFloat(avgRating)} size={14} />
              <span style={{ fontSize: 14, fontWeight: 700 }}>{avgRating}</span>
            </div>
          )}
        </div>
        {reviews.map(r => {
          const reviewer = r.reviewer || {}
          const reviewerName = reviewer.display_name || reviewer.username || 'Anonymous'
          const reviewerInitials = getInitials(reviewerName)
          return (
            <div key={r.id} style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--muted)', flexShrink: 0, overflow: 'hidden' }}>
                  {reviewer.avatar_url
                    ? <img src={reviewer.avatar_url} alt={reviewerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : reviewerInitials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{reviewerName}</span>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>{formatReviewDate(r.created_at)}</span>
                  </div>
                  <StarRow rating={r.rating} size={11} />
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{r.comment}</p>
            </div>
          )
        })}
      </div>

      {showShare && (
        <ShareSheet listing={storefrontShare} symbol={symbol} onClose={() => setShowShare(false)} />
      )}
    </div>
  )
}
