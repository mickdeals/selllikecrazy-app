import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Star, MapPin, Package, MessageSquare, Heart, ShieldCheck, Zap, Tag, Share2, Navigation, Flag, Check, Eye, Clock, ChevronRight } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { formatPrice } from '../lib/geo'
import { MakeOfferModal } from '../components/listings/OfferSystem'
import { ShareSheet } from '../components/listings/ShareSheet'
import { ReportModal } from '../components/listings/ReportModal'
import { ZoomableImage } from '../components/shared/ImageZoom'
import SmartBanner from '../components/shared/SmartBanner'
import { trackView } from './RecentlyViewed'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

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
  const { id } = useParams()
  const { user, geo } = useAppStore()
  const symbol = geo?.symbol || '$'

  const [l, setL] = useState(null)
  const [loading, setLoading] = useState(true)
  const [similar, setSimilar] = useState([])
  const [reviews, setReviews] = useState([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [showOffer, setShowOffer] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showSmartBanner, setShowSmartBanner] = useState(false)
  const [offerCountdown, setOfferCountdown] = useState('')

  useEffect(() => {
    fetchListing()
    // Smart banner
    const referrer = document.referrer
    const isExternal = referrer && !referrer.includes('selllikecrazy.app') && !referrer.includes('localhost')
    const isDirectShare = !referrer
    const isMobile = /iphone|android|ipad/i.test(navigator.userAgent)
    if ((isExternal || isDirectShare) && isMobile) setShowSmartBanner(true)
  }, [id])

  const fetchListing = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*, seller:seller_id (id, email, raw_user_meta_data)')
        .eq('id', id)
        .single()
      if (error) throw error
      setL(data)
      trackView({ id: data.id, title: data.title, price: data.price, location: data.location })
      // Fetch similar listings
      const { data: sim } = await supabase
        .from('listings')
        .select('id, title, price, photo_urls, location, category, listing_type')
        .eq('status', 'active')
        .eq('category', data.category)
        .neq('id', data.id)
        .limit(4)
      setSimilar(sim || [])
      // Fetch seller reviews
      const { data: rev } = await supabase
        .from('reviews')
        .select('*')
        .eq('seller_id', data.seller_id)
        .order('created_at', { ascending: false })
        .limit(10)
      setReviews(rev || [])
    } catch {
      toast.error('Could not load listing')
    } finally {
      setLoading(false)
    }
  }

  // Offer countdown
  useEffect(() => {
    if (!l?.active_offer_expires_at) return
    const update = () => {
      const ms = new Date(l.active_offer_expires_at) - new Date()
      if (ms <= 0) { setOfferCountdown('Expired'); return }
      const h = Math.floor(ms / 3600000)
      const m = Math.floor((ms % 3600000) / 60000)
      const s = Math.floor((ms % 60000) / 1000)
      setOfferCountdown(`${h}h ${m}m ${s}s`)
    }
    update()
    const iv = setInterval(update, 1000)
    return () => clearInterval(iv)
  }, [l])

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  const handleContact = () => {
    if (!user) { toast('Log in to contact the seller', { icon: '🔒' }); navigate('/login'); return }
    toast.success('Message sent to seller!')
  }

  const handleReviewSubmit = async (review) => {
    try {
      const { data, error } = await supabase.from('reviews').insert({
        seller_id: l.seller_id,
        reviewer_id: user.id,
        listing_id: l.id,
        rating: review.rating,
        comment: review.comment,
        tags: review.tags,
      }).select().single()
      if (error) throw error
      setReviews(r => [data, ...r])
      setShowReviewForm(false)
      toast.success('Review submitted ⭐')
    } catch {
      toast.error('Could not submit review')
    }
  }

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
          <p>Loading listing...</p>
        </div>
      </div>
    )
  }

  if (!l) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>😕</div>
          <h3>Listing not found</h3>
          <button className="btn-primary" onClick={() => navigate('/browse')} style={{ marginTop: 16 }}>Browse listings</button>
        </div>
      </div>
    )
  }

  const sellerName = l.seller?.raw_user_meta_data?.username || l.seller?.email?.split('@')[0] || 'Seller'
  const sellerAvatar = sellerName.slice(0, 2).toUpperCase()
  const mainPhoto = l.photo_urls?.[0]
  const shipping = l.shipping_option

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

      {/* Image */}
      <div style={{ position: 'relative' }}>
        {mainPhoto ? (
          <ZoomableImage
            src={mainPhoto}
            alt={l.title}
            allImages={l.photo_urls || [mainPhoto]}
            style={{ height: 280, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
        ) : (
          <div style={{ height: 280, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 90 }}>
            📦
          </div>
        )}
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

      {/* Price + title */}
      <div style={{ background: 'white', padding: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <h1 style={{ fontSize: 18, flex: 1, marginRight: 12, lineHeight: 1.3 }}>{l.title}</h1>
          <div>
            {l.sale_price && l.sale_price < l.price && (
              <div style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'line-through', textAlign: 'right' }}>{formatPrice(l.price, symbol)}</div>
            )}
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--red)', flexShrink: 0 }}>{formatPrice(l.sale_price || l.price, symbol)}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <span className="badge" style={{ background: 'var(--bg)', color: 'var(--muted)', border: '1px solid var(--border)' }}>{l.category}</span>
          <span style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={11} />{l.location}</span>
          {shipping === 'free_shipping'   && <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}><Package size={11} />Free shipping</span>}
          {shipping === 'buyer_pays'      && <span style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}><Package size={11} />Buyer pays shipping</span>}
          {shipping === 'pickup_only'     && <span style={{ fontSize: 12, color: '#CC6600', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>🚗 Local pickup only</span>}
          {shipping === 'shipping_pickup' && <span style={{ fontSize: 12, color: '#CC6600', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>📦🚗 Post or pickup</span>}
          {shipping === 'international'   && <span style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}>🌍 Ships internationally</span>}
        </div>

        {(shipping === 'pickup_only' || shipping === 'shipping_pickup') && l.pickup_suburb && (
          <div style={{ background: '#FFF9E6', border: '1.5px solid var(--yellow)', borderRadius: 12, padding: '12px 14px', marginBottom: 12, display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🚗</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#664400', marginBottom: 3 }}>Pickup available — {l.pickup_suburb}</div>
              <div style={{ fontSize: 12, color: '#664400', lineHeight: 1.5 }}>
                Full address shared privately via messages once you agree on a sale. Arrange a convenient time with the seller.
              </div>
            </div>
          </div>
        )}

        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{l.description}</p>
      </div>

      {/* Seller info */}
      <div style={{ background: 'white', padding: 16, borderBottom: '1px solid var(--border)', borderTop: '8px solid var(--bg)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Seller</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg, var(--red), var(--orange))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
            {sellerAvatar}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{sellerName}</div>
            {reviews.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <StarRow rating={avgRating} size={12} />
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{avgRating.toFixed(1)} · {reviews.length} reviews</span>
              </div>
            )}
          </div>
        </div>
        <button onClick={() => navigate(`/store/${l.seller?.raw_user_meta_data?.username || l.seller_id}`)}
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '7px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: 'var(--text)', fontFamily: 'inherit' }}>
          View store →
        </button>
      </div>

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
          {reviews.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 700 }}>{avgRating.toFixed(1)}</span>
              <div><StarRow rating={avgRating} size={16} /><div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{reviews.length} reviews</div></div>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>No reviews yet — be the first!</p>
          )}
        </div>
        {reviews.map(r => (
          <div key={r.id} style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--muted)', flexShrink: 0 }}>
                {(r.reviewer_name || 'U').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{r.reviewer_name || 'User'}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(r.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}</span>
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

      {/* Similar listings */}
      {similar.length > 0 && (
        <div style={{ borderTop: '8px solid var(--bg)', paddingTop: 14 }}>
          <div style={{ padding: '0 16px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Similar listings</span>
            <button onClick={() => navigate('/browse')} style={{ fontSize: 12, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }}>See all →</button>
          </div>
          <div style={{ display: 'flex', gap: 10, overflow: 'auto', padding: '0 16px 16px', scrollbarWidth: 'none' }}>
            {similar.map(s => (
              <div key={s.id} onClick={() => navigate(`/listing/${s.id}`)}
                style={{ minWidth: 140, background: 'white', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', flexShrink: 0 }}>
                <div style={{ height: 100, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
                  {s.photo_urls?.[0] ? (
                    <img src={s.photo_urls[0]} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : '📦'}
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
      )}

      {/* How payment works */}
      <div style={{ margin: '0 14px 14px', background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShieldCheck size={15} color="var(--green)" /> How payment works
        </div>
        {[
          { icon: '💳', title: 'Pay securely via Stripe', sub: 'Bank-grade encryption. Card details never stored or shared.' },
          { icon: '🏦', title: 'Money held until delivery confirmed', sub: 'Payment released to seller once you confirm receipt.' },
          { icon: '↩️', title: 'Dispute resolution available', sub: "Contact us within 7 days if there's an issue." },
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

      {/* Report link */}
      <div style={{ padding: '8px 16px 16px', textAlign: 'center' }}>
        <button onClick={() => setShowReport(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'inherit' }}>
          <Flag size={12} /> Report this listing
        </button>
      </div>

      {showReviewForm && <ReviewForm onSubmit={handleReviewSubmit} onClose={() => setShowReviewForm(false)} />}
      {showOffer && l && <MakeOfferModal listing={l} user={user || { id: 'guest' }} symbol={symbol} onClose={() => setShowOffer(false)} onSuccess={() => setShowOffer(false)} />}
      {showShare && l && <ShareSheet listing={l} symbol={symbol} onClose={() => setShowShare(false)} />}
      {showReport && l && <ReportModal listing={l} user={user} onClose={() => setShowReport(false)} />}
      {showSmartBanner && <SmartBanner />}
    </div>
  )
}
