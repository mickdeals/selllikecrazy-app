import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Star, MapPin, Package, MessageSquare, Heart, ShieldCheck, Zap, Tag, Share2, Navigation, Flag, Check, Eye, Clock, TrendingUp, ChevronRight } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { formatPrice } from '../lib/geo'
import { MakeOfferModal } from '../components/listings/OfferSystem'
import { ShareSheet } from '../components/listings/ShareSheet'
import { ReportModal } from '../components/listings/ReportModal'
import { ZoomableImage } from '../components/shared/ImageZoom'
import SmartBanner from '../components/shared/SmartBanner'
import { trackView } from './RecentlyViewed'
import toast from 'react-hot-toast'

const DEMO_LISTING = {
  id: 1, title: 'iPhone 14 Pro 256GB — Excellent condition', price: 850, bundlePrice: null,
  category: 'Electronics', location: 'Perth, WA', lat: -31.9505, lng: 115.8605,
  shipping: 'shipping_pickup', pickupSuburb: 'Ballajura, Perth WA', isInternational: false, emoji: '📱', thumb: 1,
  views: 47, saves: 12, responseTime: '~2 hours', responseRate: 96,
  description: 'Selling my iPhone 14 Pro 256GB in Space Black. Purchased new 8 months ago, always had a case and screen protector. Battery health 97%. Comes with original box, charger and unused EarPods. No scratches or marks whatsoever.',
  seller: { id: 'seller-1', username: 'james-t', name: 'James T.', rating: 4.9, reviewCount: 34, memberSince: '2024', isPowerSeller: true, isVerified: true, avatar: 'JT', salesCount: 47 },
  badge: 'hot',
  bundleListings: [
    { id: 101, title: 'iPhone 14 Pro Case (3 pack)', price: 45, emoji: '📱', thumb: 1 },
    { id: 102, title: 'MagSafe Charger', price: 55, emoji: '🔌', thumb: 2 },
  ],
  bundleDealPrice: 899,
  // Offer expiry — 6 hours from now (demo active offer)
  activeOffer: { amount: 800, expiresAt: new Date(Date.now() + 4.5 * 3600000).toISOString() },
}

const SIMILAR_LISTINGS = [
  { id: 9,  title: 'Apple Watch Series 8', price: 420, emoji: '⌚', thumb: 5, location: 'Melbourne, VIC' },
  { id: 5,  title: 'Canon EOS R50',        price: 1100, emoji: '📷', thumb: 5, location: 'Adelaide, SA' },
  { id: 99, title: 'Samsung Galaxy S24',   price: 780, emoji: '📱', thumb: 3, location: 'Brisbane, QLD' },
  { id: 98, title: 'iPad Pro 11" M2',      price: 950, emoji: '📱', thumb: 1, location: 'Perth, WA' },
]

const DEMO_REVIEWS = [
  { id: 1, reviewer: 'Sarah M.', avatar: 'SM', rating: 5, comment: 'Brilliant seller. Item exactly as described, shipped same day.', tags: ['Fast shipping', 'As described'], date: '3 days ago' },
  { id: 2, reviewer: 'Mike R.', avatar: 'MR', rating: 5, comment: 'Super easy transaction. Highly recommend.', tags: ['Would buy again'], date: '1 week ago' },
  { id: 3, reviewer: 'Priya K.', avatar: 'PK', rating: 4, comment: 'Good seller, item was perfect.', tags: ['As described'], date: '2 weeks ago' },
]

const REVIEW_TAGS = ['Fast shipping', 'As described', 'Great comms', 'Would buy again', 'Careful packaging']

function StarRow({ rating, size = 14 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size} fill={i <= Math.round(rating) ? '#FFD000' : 'none'} color={i <= Math.round(rating) ? '#FFD000' : '#AEAEB2'} />
      ))}
    </span>
  )
}

function ReviewForm({ onSubmit, onClose }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const toggleTag = (tag) => setSelectedTags(t => t.includes(tag) ? t.filter(x => x !== tag) : [...t, tag])
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: 'white', borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 430, margin: '0 auto' }}>
        <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 16px' }} />
        <h3 style={{ marginBottom: 16 }}>Leave a review</h3>
        <div className="form-group">
          <div className="input-label" style={{ marginBottom: 8 }}>Your rating</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1,2,3,4,5].map(i => (
              <button key={i} onClick={() => setRating(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <Star size={30} fill={i <= rating ? '#FFD000' : 'none'} color={i <= rating ? '#FFD000' : '#AEAEB2'} />
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <div className="input-label" style={{ marginBottom: 8 }}>Quick tags</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {REVIEW_TAGS.map(tag => (
              <button key={tag} onClick={() => toggleTag(tag)}
                style={{ background: selectedTags.includes(tag) ? '#FFF0F3' : 'var(--bg)', border: `1.5px solid ${selectedTags.includes(tag) ? 'var(--red)' : 'var(--border)'}`, borderRadius: 20, padding: '6px 12px', fontSize: 11, color: selectedTags.includes(tag) ? 'var(--red)' : 'var(--muted)', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
                {tag}
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <div className="input-label" style={{ marginBottom: 6 }}>Comment</div>
          <textarea className="input" rows={3} value={comment} onChange={e => setComment(e.target.value)} placeholder="Tell others about your experience..." />
        </div>
        <button className="btn-primary" onClick={() => onSubmit({ rating, comment, tags: selectedTags })}>Submit review</button>
        <button className="btn-secondary mt-8" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

export default function ListingDetail() {
  const navigate = useNavigate()
  const { user, geo } = useAppStore()
  const symbol = geo?.symbol || '$'
  const l = DEMO_LISTING

  const [showReviewForm, setShowReviewForm] = useState(false)
  const [showOffer, setShowOffer] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [reviews, setReviews] = useState(DEMO_REVIEWS)
  const [saved, setSaved] = useState(false)
  const [showSmartBanner, setShowSmartBanner] = useState(false)

  // Offer countdown timer
  const [offerCountdown, setOfferCountdown] = useState('')
  useEffect(() => {
    if (!l.activeOffer?.expiresAt) return
    const update = () => {
      const ms = new Date(l.activeOffer.expiresAt) - new Date()
      if (ms <= 0) { setOfferCountdown('Expired'); return }
      const h = Math.floor(ms / 3600000)
      const m = Math.floor((ms % 3600000) / 60000)
      const s = Math.floor((ms % 60000) / 1000)
      setOfferCountdown(`${h}h ${m}m ${s}s`)
    }
    update()
    const iv = setInterval(update, 1000)
    return () => clearInterval(iv)
  }, [])

  // Track this view in recently viewed
  useEffect(() => {
    trackView({ id: l.id, title: l.title, price: l.price, emoji: l.emoji, thumb: l.thumb, location: l.location })
  }, [])

  // Show smart banner if user arrived from outside the app (shared link)
  useEffect(() => {
    const referrer = document.referrer
    const isExternal = referrer && !referrer.includes('selllikecrazy.app') && !referrer.includes('localhost')
    const isDirectShare = !referrer // direct link tap from WhatsApp/SMS has no referrer
    const isMobile = /iphone|android|ipad/i.test(navigator.userAgent)
    if ((isExternal || isDirectShare) && isMobile) {
      setShowSmartBanner(true)
    }
  }, [])

  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length

  const handleContact = () => {
    if (!user) { toast('Log in to contact the seller', { icon: '🔒' }); navigate('/login'); return }
    toast.success('Message sent to seller!')
  }

  const handleReviewSubmit = (review) => {
    setReviews(r => [{ id: Date.now(), reviewer: user?.email?.split('@')[0] || 'You', avatar: 'ME', ...review, date: 'Just now' }, ...r])
    setShowReviewForm(false)
    toast.success('Review submitted ⭐')
  }

  return (
    <div className="page">

      {/* Back bar */}
      <div style={{ background: 'white', padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}><ArrowLeft size={22} /></button>
        <h2 style={{ flex: 1, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</h2>
        <button onClick={() => setShowShare(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', marginRight: 4 }}><Share2 size={20} /></button>
        <button onClick={() => { setSaved(s => !s); toast(saved ? 'Removed' : 'Saved!', { icon: saved ? '💔' : '❤️' }) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: saved ? 'var(--red)' : 'var(--muted)' }}>
          <Heart size={22} fill={saved ? 'var(--red)' : 'none'} />
        </button>
      </div>

      {/* Image — tap to zoom */}
      <div style={{ position: 'relative' }}>
        <ZoomableImage
          src={`/demo-${l.thumb}.jpg`}
          alt={l.title}
          allImages={[`/demo-${l.thumb}.jpg`]}
          style={{ height: 280, background: `var(--thumb-${l.thumb}, #F0F0FF)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 90 }}
        />
        {/* Fallback emoji if no image */}
        <div className={`listing-thumb thumb-${l.thumb}`} style={{ height: 280, fontSize: 90, borderRadius: 0, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', inset: 0, zIndex: 0 }}>
          <span>{l.emoji}</span>
        </div>
        {l.badge === 'hot' && <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 2 }}><span className="badge badge-hot">Hot 🔥</span></div>}
        {/* Views FOMO */}
        {l.views > 0 && (
          <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.65)', color: 'white', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, backdropFilter: 'blur(8px)', zIndex: 2 }}>
            <Eye size={12} /> {l.views} views today
          </div>
        )}
        {l.saves > 0 && (
          <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(255,45,85,0.85)', color: 'white', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, zIndex: 2 }}>
            <Heart size={12} fill="white" /> {l.saves} people saved this
          </div>
        )}
      </div>

      {/* Active offer countdown */}
      {l.activeOffer && offerCountdown && offerCountdown !== 'Expired' && (
        <div style={{ background: 'linear-gradient(135deg, #FF6B00, #FFD000)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Clock size={16} color="white" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>Offer of {formatPrice(l.activeOffer.amount, symbol)} pending</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>Expires in {offerCountdown} — respond before it lapses</div>
          </div>
          <button onClick={() => navigate('/dashboard')}
            style={{ background: 'white', color: '#CC6600', border: 'none', borderRadius: 10, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
            Respond
          </button>
        </div>
      )}

      {/* Price + title */}
      <div style={{ background: 'white', padding: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <h1 style={{ fontSize: 18, flex: 1, marginRight: 12, lineHeight: 1.3 }}>{l.title}</h1>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--red)', flexShrink: 0 }}>{formatPrice(l.price, symbol)}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <span className="badge" style={{ background: 'var(--bg)', color: 'var(--muted)', border: '1px solid var(--border)' }}>{l.category}</span>
          <span style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={11} />{l.location}</span>
          {l.shipping === 'free_shipping'  && <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}><Package size={11} />Free shipping</span>}
          {l.shipping === 'buyer_pays'     && <span style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}><Package size={11} />Buyer pays shipping</span>}
          {l.shipping === 'pickup_only'    && <span style={{ fontSize: 12, color: '#CC6600', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>🚗 Local pickup only</span>}
          {l.shipping === 'shipping_pickup'&& <span style={{ fontSize: 12, color: '#CC6600', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>📦🚗 Post or pickup</span>}
          {l.shipping === 'international'  && <span style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}>🌍 Ships internationally</span>}
        </div>

        {/* Pickup info box */}
        {(l.shipping === 'pickup_only' || l.shipping === 'shipping_pickup') && l.pickupSuburb && (
          <div style={{ background: '#FFF9E6', border: '1.5px solid var(--yellow)', borderRadius: 12, padding: '12px 14px', marginBottom: 12, display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🚗</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#664400', marginBottom: 3 }}>Pickup available — {l.pickupSuburb}</div>
              <div style={{ fontSize: 12, color: '#664400', lineHeight: 1.5 }}>
                Full address shared privately via messages once you agree on a sale. Arrange a convenient time with the seller.
              </div>
            </div>
          </div>
        )}

        {l.isInternational && <div className="duty-warning mb-12">⚠️ International buyers may incur customs duties and taxes. Please check your country's import conditions before purchasing.</div>}
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{l.description}</p>
      </div>

      {/* Bundle deal */}
      {l.bundleListings?.length > 0 && (
        <div style={{ margin: 14, background: '#FFF9E6', border: '1.5px solid var(--yellow)', borderRadius: 16, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Tag size={16} color="#CC6600" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#664400' }}>Bundle deal available</span>
            <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 700, color: 'var(--red)' }}>{formatPrice(l.bundleDealPrice, symbol)}</span>
          </div>
          <p style={{ fontSize: 11, color: '#664400', marginBottom: 10 }}>
            Get this + {l.bundleListings.length} more items. Save {formatPrice((l.price + l.bundleListings.reduce((s,b) => s + b.price, 0)) - l.bundleDealPrice, symbol)}!
          </p>
          <button onClick={() => toast.success('Bundle added! Contact seller to arrange.')}
            style={{ width: '100%', background: 'linear-gradient(135deg, #CC6600, var(--yellow))', color: 'white', border: 'none', borderRadius: 10, padding: 11, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            Get bundle — {formatPrice(l.bundleDealPrice, symbol)}
          </button>
        </div>
      )}

      {/* More from this seller */}
      <div style={{ background: 'white', borderTop: '8px solid var(--bg)', padding: '16px 16px 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>More from {l.seller.name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{l.seller.salesCount} items sold · {l.seller.reviewCount} reviews</div>
          </div>
          <button onClick={() => navigate(`/store/${l.seller.username}`)}
            style={{ fontSize: 12, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
            View store →
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10, overflow: 'auto', paddingBottom: 12, scrollbarWidth: 'none' }}>
          {[
            { id: 101, title: 'iPhone 14 Pro Case (3 pack)', price: 45,  emoji: '📱', thumb: 1 },
            { id: 102, title: 'MagSafe Charger',             price: 55,  emoji: '🔌', thumb: 2 },
            { id: 103, title: 'AirPods Pro 2nd Gen',         price: 290, emoji: '🎧', thumb: 3 },
            { id: 104, title: 'Apple Watch Strap',           price: 25,  emoji: '⌚', thumb: 5 },
          ].map(item => (
            <div key={item.id} onClick={() => navigate(`/listing/${item.id}`)}
              style={{ minWidth: 120, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', flexShrink: 0 }}>
              <div className={`listing-thumb thumb-${item.thumb}`}
                style={{ height: 90, fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0 }}>
                {item.emoji}
              </div>
              <div style={{ padding: '8px 10px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)' }}>{formatPrice(item.price, symbol)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seller info with trust badge */}
      <div style={{ background: 'white', padding: 16, borderBottom: '1px solid var(--border)', borderTop: '8px solid var(--bg)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Seller</div>

        {/* Buyer trust / verified badge */}
        {l.seller.isVerified && (
          <div style={{ background: '#F0FFF4', border: '1px solid #D6FFE4', borderRadius: 10, padding: '8px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={16} color="var(--green)" />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1A7A30' }}>Verified seller</div>
              <div style={{ fontSize: 10, color: '#2E7D32' }}>ID verified · {l.seller.salesCount} completed sales · {l.seller.reviewCount} reviews</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg, var(--red), var(--orange))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
            {l.seller.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{l.seller.name}</span>
              {l.seller.isPowerSeller && (
                <span style={{ background: 'linear-gradient(135deg, var(--red), var(--orange))', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Zap size={9} />POWER SELLER
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <StarRow rating={l.seller.rating} size={12} />
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{l.seller.rating} · {l.seller.reviewCount} reviews</span>
            </div>
          </div>
        </div>

        {/* Response rate */}
        {l.responseRate && (
          <div style={{ display: 'flex', gap: 16, padding: '10px 12px', background: 'var(--bg)', borderRadius: 12, marginBottom: 10 }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--green)' }}>{l.responseRate}%</div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>Response rate</div>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }} />
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{l.responseTime}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>Avg response</div>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }} />
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{l.seller.salesCount}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>Sales</div>
            </div>
          </div>
        )}

        <button onClick={() => navigate(`/store/${l.seller.username}`)}
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '7px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: 'var(--text)', fontFamily: 'inherit' }}>
          View store →
        </button>
      </div>

      {/* Map view - local pickup */}
      {l.lat && l.lng && (
        <div style={{ background: 'white', borderTop: '8px solid var(--bg)', padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Location</div>
          {/* Map placeholder — in production use Leaflet or Google Maps */}
          <div style={{ background: 'linear-gradient(135deg, #E8F0FE, #D6E4FF)', borderRadius: 14, height: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1px solid var(--border)', marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(255,45,85,0.4)', position: 'relative', zIndex: 1 }}>
              <MapPin size={20} color="white" fill="white" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', position: 'relative', zIndex: 1 }}>{l.location}</span>
          </div>
          <button onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(l.location)}`, '_blank')}
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: 'var(--text)', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <Navigation size={14} /> Open in Maps
          </button>
        </div>
      )}

      {/* Reviews */}
      <div style={{ background: 'white', borderTop: '8px solid var(--bg)' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <h3>Seller reviews</h3>
            <button onClick={() => { if (!user) { navigate('/login'); return } setShowReviewForm(true) }}
              style={{ fontSize: 12, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              + Leave review
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 700 }}>{avgRating.toFixed(1)}</span>
            <div><StarRow rating={avgRating} size={16} /><div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{reviews.length} reviews</div></div>
          </div>
        </div>
        {reviews.map(r => (
          <div key={r.id} style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--muted)', flexShrink: 0 }}>{r.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{r.reviewer}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{r.date}</span>
                </div>
                <StarRow rating={r.rating} size={12} />
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, marginBottom: r.tags?.length > 0 ? 8 : 0 }}>{r.comment}</p>
            {r.tags?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {r.tags.map(tag => <span key={tag} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20, padding: '3px 9px', fontSize: 10, color: 'var(--muted)', fontWeight: 500 }}>{tag}</span>)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA buttons */}
      <div style={{ padding: '16px 14px 24px', background: 'white', borderTop: '8px solid var(--bg)', display: 'flex', gap: 10 }}>
        <button onClick={() => { if (!user) { navigate('/login'); return } setShowOffer(true) }}
          style={{ flex: 1, background: '#FFF9E6', border: '1.5px solid var(--yellow)', color: '#664400', borderRadius: 14, padding: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          Make offer 🤝
        </button>
        <button className="btn-primary" style={{ flex: 1 }} onClick={handleContact}>
          <MessageSquare size={16} style={{ verticalAlign: 'middle', marginRight: 5 }} />Contact
        </button>
      </div>

      {showReviewForm && <ReviewForm onSubmit={handleReviewSubmit} onClose={() => setShowReviewForm(false)} />}
      {showOffer && <MakeOfferModal listing={l} user={user || { id: 'demo' }} symbol={symbol} onClose={() => setShowOffer(false)} onSuccess={() => setShowOffer(false)} />}
      {showShare && <ShareSheet listing={l} symbol={symbol} onClose={() => setShowShare(false)} />}
      {showReport && <ReportModal listing={l} user={user} onClose={() => setShowReport(false)} />}
      {showSmartBanner && <SmartBanner />}

      {/* How payment works */}
      <div style={{ margin: '0 14px 14px', background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShieldCheck size={15} color="var(--green)" /> How payment works
        </div>
        {[
          { icon: '💳', title: 'Pay securely via Stripe', sub: 'Bank-grade encryption. Card details never stored or shared.' },
          { icon: '🏦', title: 'Money held until delivery confirmed', sub: 'Payment released to seller once you confirm receipt.' },
          { icon: '↩️', title: 'Dispute resolution available', sub: 'Contact us within 7 days if there\'s an issue.' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < 2 ? 12 : 0 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{s.title}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Similar listings */}
      <div style={{ borderTop: '8px solid var(--bg)', paddingTop: 14 }}>
        <div style={{ padding: '0 16px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Similar listings</span>
          <button onClick={() => navigate('/browse')} style={{ fontSize: 12, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }}>See all →</button>
        </div>
        <div style={{ display: 'flex', gap: 10, overflow: 'auto', padding: '0 16px 16px', scrollbarWidth: 'none' }}>
          {SIMILAR_LISTINGS.map(s => (
            <div key={s.id} onClick={() => navigate(`/listing/${s.id}`)}
              style={{ minWidth: 140, background: 'white', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', flexShrink: 0 }}>
              <div className={`listing-thumb thumb-${s.thumb}`} style={{ height: 100, fontSize: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 0 }}>
                {s.emoji}
              </div>
              <div style={{ padding: '8px 10px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--red)' }}>{formatPrice(s.price, symbol)}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <MapPin size={9} />{s.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report link */}
      <div style={{ padding: '8px 16px 16px', textAlign: 'center' }}>
        <button onClick={() => setShowReport(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'inherit' }}>
          <Flag size={12} /> Report this listing
        </button>
      </div>
    </div>
  )
}
