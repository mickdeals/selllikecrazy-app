import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, MessageSquare, Zap, Tag, Star, ShieldCheck, CreditCard, Check, Clock, Shield, TrendingUp, Heart } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { formatPrice } from '../lib/geo'
import { getExpiryStatus } from '../lib/expiry'
import { SellerChecklist } from '../components/seller/SellerChecklist'
import toast from 'react-hot-toast'

const DEMO_MY_LISTINGS = [
  { id: 1, title: 'iPhone 14 Pro', category: 'Electronics', price: 850, shipping: 'Free shipping', views: 47, saves: 12, inquiries: 2, status: 'active',  emoji: '📱', thumb: 1, expires_at: new Date(Date.now() + 22 * 86400000).toISOString() },
  { id: 2, title: 'PS5 bundle',    category: 'Gaming',      price: 620, shipping: 'Free shipping', views: 31, saves: 8,  inquiries: 1, status: 'active',  emoji: '🎮', thumb: 3, expires_at: new Date(Date.now() + 3  * 86400000).toISOString() },
  { id: 3, title: 'Nike Air Max',  category: 'Clothing',    price: 95,  shipping: '$12 shipping',  views: 14, saves: 3,  inquiries: 0, status: 'pending', emoji: '👟', thumb: 2, expires_at: new Date(Date.now() + 30 * 86400000).toISOString() },
]

const DEMO_BUNDLES = [
  { id: 1, name: 'iPhone + Accessories pack', items: 2, originalPrice: 950, bundlePrice: 899, views: 5 },
]

function PowerSellerBadge() {
  return (
    <div style={{ margin: '0 14px 14px', background: 'linear-gradient(135deg, var(--red), var(--orange))', borderRadius: 16, padding: 16, color: 'white', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Zap size={22} color="white" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
          ⚡ Power Seller
          <ShieldCheck size={14} />
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>Annual plan · Unlimited selling · Bundle deals unlocked</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Rating</div>
        <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}><Star size={13} fill="white" color="white" />4.9</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, plan, freeListingsRemaining, geo } = useAppStore()
  const symbol = geo?.symbol || '$'
  const isPowerSeller = plan === 'annual'

  const [listings, setListings] = useState(DEMO_MY_LISTINGS)
  const [bundles, setBundles] = useState(isPowerSeller ? DEMO_BUNDLES : [])
  const [activeTab, setActiveTab] = useState('listings')

  const totalViews = listings.reduce((s, l) => s + l.views, 0)
  const totalInquiries = listings.reduce((s, l) => s + l.inquiries, 0)
  const activeCount = listings.filter(l => l.status === 'active').length

  const removeListing = (id) => { setListings(l => l.filter(x => x.id !== id)); toast.success('Listing removed') }
  const removeBundle = (id) => { setBundles(b => b.filter(x => x.id !== id)); toast.success('Bundle removed') }

  if (!user) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 50, marginBottom: 16 }}>🔒</div>
        <h2 style={{ marginBottom: 8 }}>Sign in to see your dashboard</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Manage your listings, track views and inquiries.</p>
        <button className="btn-primary" onClick={() => navigate('/login')}>Sign in</button>
      </div>
    )
  }

  return (
    <div className="page">

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--red), var(--orange))', padding: '22px 20px', color: 'white' }}>
        <h2 style={{ color: 'white', marginBottom: 3 }}>Dashboard</h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Welcome back ⚡</p>
      </div>

      {/* Seller checklist compact */}
      <div style={{ padding: '12px 14px 0' }}>
        <SellerChecklist compact />
      </div>

      {/* 2FA security nudge — shown when not enabled */}
      <div style={{ margin: '12px 14px 0', background: 'linear-gradient(135deg, #F0F0FF, #E8F0FF)', border: '1.5px solid #C0C0FF', borderRadius: 16, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg, #635BFF, #007AFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Shield size={18} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#3730A3', marginBottom: 2 }}>Protect your payouts — enable 2FA</div>
          <div style={{ fontSize: 11, color: '#635BFF', lineHeight: 1.4 }}>Your Stripe account is connected. Add two-factor authentication to keep it secure.</div>
        </div>
        <button onClick={() => navigate('/security/2fa')}
          style={{ background: 'linear-gradient(135deg, #635BFF, #007AFF)', color: 'white', border: 'none', borderRadius: 10, padding: '7px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
          Enable
        </button>
      </div>
      <div className="stats-grid">
        <div className="stat-box"><div className="stat-num">{activeCount}</div><div className="stat-lbl">Active</div></div>
        <div className="stat-box"><div className="stat-num">{totalViews}</div><div className="stat-lbl">Views today</div></div>
        <div className="stat-box"><div className="stat-num">{totalInquiries}</div><div className="stat-lbl">Inquiries</div></div>
      </div>

      {/* Power seller badge or plan status */}
      {isPowerSeller ? <PowerSellerBadge /> : (
        <div style={{ margin: '0 14px 16px', background: 'linear-gradient(135deg, #FFF0F3, #FFF5F0)', border: '1.5px solid #FFD0D8', borderRadius: 16, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700 }}>{plan === 'per_listing' ? 'Pay per listing' : `${freeListingsRemaining} free listings left`}</p>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{plan === 'per_listing' ? '$1 per listing via Stripe' : 'Upgrade for unlimited + bundle deals'}</span>
          </div>
          <button onClick={() => toast.success('Redirecting to Stripe...')}
            style={{ background: 'var(--grad-btn)', color: 'white', border: 'none', borderRadius: 10, padding: '7px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: 'linear-gradient(135deg, var(--red), var(--orange))' }}>
            Go annual
          </button>
        </div>
      )}

      {/* Stripe Connect CTA */}
      <div style={{ margin: '0 14px 14px', background: 'white', border: '1.5px solid #635BFF33', borderRadius: 16, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#635BFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <CreditCard size={20} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Receive payments</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>Connect Stripe to get paid directly by buyers — 100% goes to you</div>
        </div>
        <button onClick={() => navigate('/stripe/connect')}
          style={{ background: '#635BFF', color: 'white', border: 'none', borderRadius: 10, padding: '7px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
          Set up →
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'white', borderBottom: '1px solid var(--border)', padding: '0 14px' }}>
        {['listings', 'bundles'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: activeTab === tab ? 'var(--red)' : 'var(--muted)', borderBottom: `2px solid ${activeTab === tab ? 'var(--red)' : 'transparent'}`, marginBottom: -1 }}>
            {tab === 'listings' ? `My listings (${listings.length})` : `Bundle deals (${bundles.length})`}
          </button>
        ))}
      </div>

      {/* Listings tab */}
      {activeTab === 'listings' && (
        <div>
          {listings.map(l => (
            <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: '1px solid var(--border)', background: 'white' }}>
              <div className={`listing-thumb thumb-${l.thumb}`} style={{ width: 46, height: 46, borderRadius: 12, fontSize: 22, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{l.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {l.bumped && <span style={{ fontSize: 9, background: '#FFF9E6', color: '#CC6600', fontWeight: 700, border: '1px solid #FFD080', borderRadius: 20, padding: '1px 6px', marginRight: 5 }}>⚡ BUMPED</span>}
                  {l.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={10} /> {l.views}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Heart size={10} /> {l.saves || 0}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MessageSquare size={10} /> {l.inquiries}</span>
                  <span className={`badge ${l.status === 'active' ? 'badge-live' : l.status === 'sold' ? 'badge-live' : 'badge-pending'}`}>
                    {l.status === 'sold' ? '✓ Sold' : l.status}
                  </span>
                  {l.expires_at && l.status === 'active' && (() => {
                    const exp = getExpiryStatus(l.expires_at)
                    return (
                      <span style={{ fontSize: 10, fontWeight: 600, color: exp.color, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={9} /> {exp.label}
                      </span>
                    )
                  })()}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--red)', marginRight: 4 }}>{formatPrice(l.price, symbol)}</div>
              <div style={{ display: 'flex', gap: 5 }}>
                <button onClick={() => toast.success('Edit listing — coming soon')}
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--muted)' }} title="Edit"><Edit size={14} /></button>
                <button onClick={() => {
                  if (l.status === 'sold') { toast('Already marked as sold'); return }
                  setListings(prev => prev.map(x => x.id === l.id ? { ...x, status: 'sold' } : x))
                  toast.success('Marked as sold!')
                }}
                  style={{ background: l.status === 'sold' ? '#E8F8EC' : 'var(--bg)', border: `1px solid ${l.status === 'sold' ? '#D6FFE4' : 'var(--border)'}`, borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: l.status === 'sold' ? 'var(--green)' : 'var(--muted)' }}
                  title="Mark as sold"><Check size={14} /></button>
                <button onClick={() => {
                  toast.success('Listing bumped to top! ⚡', { duration: 3000 })
                  setListings(prev => prev.map(x => x.id === l.id ? { ...x, bumped: true } : x))
                }}
                  style={{ background: l.bumped ? '#FFF9E6' : 'var(--bg)', border: `1px solid ${l.bumped ? '#FFD080' : 'var(--border)'}`, borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: l.bumped ? '#CC6600' : 'var(--muted)' }}
                  title="Bump listing — $2"><Zap size={14} /></button>
                <button onClick={() => removeListing(l.id)}
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--red)' }} title="Delete"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          <div style={{ padding: '14px 14px 24px' }}>
            <button className="btn-primary" onClick={() => navigate('/sell')}><Plus size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Add new listing</button>
          </div>
        </div>
      )}

      {/* Bundles tab */}
      {activeTab === 'bundles' && (
        <div>
          {!isPowerSeller && (
            <div style={{ margin: 14, background: '#FFF0F3', border: '1.5px solid #FFD0D8', borderRadius: 16, padding: 16, textAlign: 'center' }}>
              <Zap size={28} color="var(--red)" style={{ marginBottom: 8 }} />
              <h3 style={{ marginBottom: 6 }}>Power Seller feature</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.5 }}>Bundle deals are exclusive to Annual plan holders. Link your listings and offer buyers a special deal.</p>
              <button className="btn-primary" onClick={() => toast.success('Redirecting to Stripe...')}>Upgrade to Annual — $50/year</button>
            </div>
          )}

          {isPowerSeller && bundles.map(b => (
            <div key={b.id} style={{ margin: '0 14px 10px', background: '#FFF9E6', border: '1.5px solid var(--yellow)', borderRadius: 16, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#664400', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Tag size={13} color="#CC6600" />{b.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#996600', marginTop: 3 }}>
                    {b.items} items · Was {formatPrice(b.originalPrice, symbol)} → <strong>{formatPrice(b.bundlePrice, symbol)}</strong> · {b.views} views
                  </div>
                </div>
                <button onClick={() => removeBundle(b.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CC6600' }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}

          {isPowerSeller && (
            <div style={{ padding: '8px 14px 24px' }}>
              <button className="btn-primary" onClick={() => navigate('/bundle/create')}>
                <Tag size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Create bundle deal
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
