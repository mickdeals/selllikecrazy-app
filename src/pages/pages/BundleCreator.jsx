import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Zap, Plus, X, Tag, Lock } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { supabase } from '../lib/supabase'
import { formatPrice } from '../lib/geo'
import toast from 'react-hot-toast'

export default function BundleCreator() {
  const navigate = useNavigate()
  const { user, plan, geo } = useAppStore()
  const symbol = geo?.symbol || '$'
  const isPowerSeller = plan === 'annual'

  const [myListings, setMyListings] = useState([])
  const [loadingListings, setLoadingListings] = useState(true)
  const [selected, setSelected] = useState([])
  const [bundlePrice, setBundlePrice] = useState('')
  const [bundleName, setBundleName] = useState('')

  useEffect(() => {
    if (!user || !isPowerSeller) { setLoadingListings(false); return }
    const fetchListings = async () => {
      setLoadingListings(true)
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, price, photo_urls, category')
        .eq('seller_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      if (!error && data) {
        setMyListings(data)
      }
      setLoadingListings(false)
    }
    fetchListings()
  }, [user, isPowerSeller])

  const totalOriginal = selected.reduce((s, id) => {
    const l = myListings.find(x => x.id === id)
    return s + (l?.price || 0)
  }, 0)

  const saving = bundlePrice ? totalOriginal - parseFloat(bundlePrice) : 0

  const toggleListing = (id) => {
    if (selected.includes(id)) {
      setSelected(s => s.filter(x => x !== id))
    } else {
      if (selected.length >= 5) { toast.error('Max 5 listings per bundle'); return }
      setSelected(s => [...s, id])
    }
  }

  const handleCreate = () => {
    if (selected.length < 2) { toast.error('Select at least 2 listings'); return }
    if (!bundlePrice) { toast.error('Set a bundle price'); return }
    if (parseFloat(bundlePrice) >= totalOriginal) { toast.error('Bundle price must be less than combined total'); return }
    toast.success('Bundle deal created! ⚡ Buyers will see it on each listing.')
    navigate('/dashboard')
  }

  if (!isPowerSeller) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
        <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'linear-gradient(135deg, var(--red), var(--orange))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Lock size={30} color="white" />
        </div>
        <h2 style={{ marginBottom: 10 }}>Power Seller feature</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
          Bundle deals are exclusive to Annual plan holders. Upgrade for $50/year and unlock unlimited selling, bundle deals and your Power Seller badge.
        </p>
        <div style={{ background: 'linear-gradient(135deg, #FFF0F3, #FFF5F0)', border: '1.5px solid #FFD0D8', borderRadius: 16, padding: 16, marginBottom: 24, width: '100%' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Annual plan includes:</div>
          {['Unlimited selling all year', 'Bundle deal creator', '⚡ Power Seller badge', 'Priority in search results', 'Advanced dashboard stats'].map(f => (
            <div key={f} style={{ fontSize: 12, color: 'var(--muted)', padding: '4px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--green)' }}>✓</span> {f}
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={() => toast.success('Redirecting to Stripe checkout...')}>
          Upgrade to Annual — $50/year
        </button>
        <button className="btn-secondary mt-8" onClick={() => navigate('/dashboard')}>Back to dashboard</button>
      </div>
    )
  }

  return (
    <div className="page">

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--red), var(--orange))', padding: '20px 16px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
            <ArrowLeft size={22} />
          </button>
          <h2 style={{ color: 'white', flex: 1 }}>Create bundle deal</h2>
          <span style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 20, padding: '3px 10px', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Zap size={10} /> POWER SELLER
          </span>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
          Link your listings and offer buyers a special deal. Bundle badge shows on each linked listing.
        </p>
      </div>

      {/* Bundle name */}
      <div style={{ padding: '14px 14px 0' }}>
        <div className="form-group">
          <label className="input-label">Bundle name</label>
          <input className="input" value={bundleName} onChange={e => setBundleName(e.target.value)}
            placeholder="e.g. iPhone + Accessories pack" />
        </div>
      </div>

      {/* Select listings */}
      <div style={{ padding: '0 14px 14px' }}>
        <div className="section-label" style={{ padding: 0, marginBottom: 12 }}>
          Select listings to bundle (2–5)
        </div>

        {loadingListings ? (
          <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Loading your listings...</p>
        ) : myListings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted)' }}>
            <p style={{ fontSize: 13, marginBottom: 12 }}>You have no active listings to bundle.</p>
            <button className="btn-secondary" onClick={() => navigate('/create-listing')}>Create a listing</button>
          </div>
        ) : myListings.map(l => {
          const isSelected = selected.includes(l.id)
          const thumb = l.photo_urls?.[0]
          return (
            <div key={l.id} onClick={() => toggleListing(l.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: isSelected ? '#FFF0F3' : 'white', border: `1.5px solid ${isSelected ? 'var(--red)' : 'var(--border)'}`, borderRadius: 14, marginBottom: 8, cursor: 'pointer', transition: 'all 0.15s' }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, fontSize: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', overflow: 'hidden' }}>
                {thumb
                  ? <img src={thumb} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
                  : '📦'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{l.title}</div>
                <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 700 }}>{formatPrice(l.price, symbol)}</div>
              </div>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: isSelected ? 'var(--red)' : 'var(--bg)', border: `1.5px solid ${isSelected ? 'var(--red)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {isSelected && <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>✓</span>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bundle pricing */}
      {selected.length >= 2 && (
        <div style={{ margin: '0 14px 14px', background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>
          <div className="section-label" style={{ padding: 0, marginBottom: 12 }}>Bundle pricing</div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
            <span style={{ color: 'var(--muted)' }}>Combined original price</span>
            <span style={{ fontWeight: 700 }}>{formatPrice(totalOriginal, symbol)}</span>
          </div>

          <div className="form-group">
            <label className="input-label">Your bundle price</label>
            <input className="input" type="number" value={bundlePrice}
              onChange={e => setBundlePrice(e.target.value)}
              placeholder={`Less than ${formatPrice(totalOriginal, symbol)}`} />
          </div>

          {saving > 0 && (
            <div style={{ background: '#F0FFF4', border: '1px solid #D6FFE4', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tag size={14} color="var(--green)" />
              <span style={{ fontSize: 12, color: '#1A7A30', fontWeight: 600 }}>
                Buyers save {formatPrice(saving, symbol)} ({Math.round(saving/totalOriginal*100)}% off)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      {selected.length >= 2 && bundlePrice && saving > 0 && (
        <div style={{ margin: '0 14px 14px', background: '#FFF9E6', border: '1.5px solid var(--yellow)', borderRadius: 16, padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#664400', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Preview — how buyers see it
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Tag size={13} color="#CC6600" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#664400' }}>
              {bundleName || 'Bundle deal available'}
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 700, color: 'var(--red)' }}>
              {formatPrice(bundlePrice, symbol)}
            </span>
          </div>
          <p style={{ fontSize: 11, color: '#664400' }}>
            {selected.length} items · Save {formatPrice(saving, symbol)} · Bundle badge shows on each listing
          </p>
        </div>
      )}

      {/* Create button */}
      <div style={{ padding: '0 14px 24px' }}>
        <button className="btn-primary" onClick={handleCreate}
          disabled={selected.length < 2 || !bundlePrice || saving <= 0}>
          Create bundle deal ⚡
        </button>
        <button className="btn-secondary mt-8" onClick={() => navigate('/dashboard')}>Cancel</button>
      </div>
    </div>
  )
}
