import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Zap, ShieldCheck, Tag, Bell, Store, MessageSquare, Camera, DollarSign, Heart, Globe, Star, ChevronRight, Check, Clock, Navigation, TrendingUp, CheckSquare } from 'lucide-react'

const BUYER_BENEFITS = [
  { icon: ShieldCheck,  color: '#34C759', bg: '#E8F8EC', title: 'Verified sellers only',        sub: 'Every seller ID and mobile verified before listing. 18+ platform — age confirmed on signup' },
  { icon: Tag,          color: '#FF6B00', bg: '#FFF5F0', title: 'Shop by price',                sub: 'Under $10, $20, $50, $100 — find bargains instantly' },
  { icon: MessageSquare,color: '#007AFF', bg: '#F0F5FF', title: 'Make an offer',                sub: 'Negotiate directly — accepted offers lock the listing for 6 hours' },
  { icon: Bell,         color: '#FF2D55', bg: '#FFF0F3', title: 'Instant search alerts',        sub: 'Save a search — get notified the moment a match is listed, in real time' },
  { icon: Heart,        color: '#FF2D55', bg: '#FFF0F3', title: 'Save listings + price alerts', sub: 'Heart any listing and get notified automatically when the price drops' },
  { icon: Clock,        color: '#635BFF', bg: '#F0F0FF', title: 'Recently viewed',              sub: 'Every listing you tap is saved so you can find it again instantly' },
  { icon: Navigation,   color: '#007AFF', bg: '#F0F5FF', title: 'Geo-filtered services',        sub: 'Services near you first — SMP, trades, tutoring, photography filtered by distance' },
  { icon: Globe,        color: '#635BFF', bg: '#F0F0FF', title: 'Shop worldwide',               sub: 'Auto-detects your language and local currency — 13 currencies supported' },
]

const SELLER_BENEFITS = [
  { icon: Camera,       color: '#FF2D55', bg: '#FFF0F3', title: 'AI writes your listing',       sub: 'Take a photo — AI fills title, description and price. Category-specific fields auto-detected' },
  { icon: DollarSign,   color: '#34C759', bg: '#E8F8EC', title: 'Zero commission on sales',     sub: '100% of every sale goes straight to your Stripe account — nothing via us' },
  { icon: Zap,          color: '#FF6B00', bg: '#FFF5F0', title: 'Items AND services',           sub: 'Sell physical goods OR your skills — SMP, hair, trades, tutoring, photography, anything you do' },
  { icon: CheckSquare,  color: '#635BFF', bg: '#F0F0FF', title: 'Guided setup checklist',       sub: 'Step-by-step from signup to first sale — with a Power Seller unlock path' },
  { icon: TrendingUp,   color: '#007AFF', bg: '#F0F5FF', title: 'Per-listing analytics',        sub: 'See views, saves and enquiries on every listing — know what sells and what needs work' },
  { icon: Store,        color: '#635BFF', bg: '#F0F0FF', title: 'Share straight from the app',  sub: 'Share any listing to Instagram, Facebook, WhatsApp, TikTok and more in one tap' },
  { icon: Tag,          color: '#FF9500', bg: '#FFF9E6', title: 'Bundle deals',                 sub: 'Group listings and offer buyers a bundle price — more value, more sales' },
  { icon: Star,         color: '#FFD000', bg: '#FFFBF0', title: 'Power Seller badge',           sub: 'Build reputation — get featured above standard sellers in search results' },
]

const PLANS = [
  { name: 'Free starter',            price: '$0',   period: '',        features: ['10 free item listings', '1 free service listing', 'AI listing tool', 'Seller setup checklist', 'Per-listing analytics', 'No card needed'], highlight: false },
  { name: 'Pay per listing',         price: '$1',   period: '/listing', features: ['Pay as you go', 'No commitment', 'All features included', 'Casual sellers'], highlight: false },
  { name: 'Annual unlimited selling', price: '$50',  period: '/year',   features: ['Unlimited selling', 'Bundle deals', 'Power Seller badge', '1 free bump per week', 'Auto-renews annually — cancel anytime'], highlight: true },
]

function BenefitCard({ icon: Icon, color, bg, title, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{sub}</div>
      </div>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('buyer') // buyer | seller

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', paddingBottom: 32 }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--red) 0%, var(--orange) 55%, var(--yellow) 100%)', padding: '40px 20px 32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.07, backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, position: 'relative' }}>
          <div style={{ width: 50, height: 50, background: 'white', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.18)', flexShrink: 0 }}>
            <img src="/logo.png" alt="Sell Like Crazy" style={{ width: 46, height: 46, objectFit: 'contain' }}
              onError={e => { e.target.style.display = 'none'; e.target.parentNode.textContent = '⚡' }} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>Sell Like Crazy</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>Everything sells here.</div>
          </div>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 700, color: 'white', lineHeight: 1.15, marginBottom: 10, position: 'relative', textShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
          Australia's smartest marketplace
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.88)', marginBottom: 24, lineHeight: 1.6, position: 'relative' }}>
          Buy and sell anything. AI-powered listings, zero commission, verified sellers, and a whole lot more.
        </p>

        <div style={{ display: 'flex', gap: 10, position: 'relative' }}>
          <button onClick={() => navigate('/onboarding')}
            style={{ flex: 1, background: 'white', color: 'var(--red)', border: 'none', padding: '14px', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
            Get started free ⚡
          </button>
          <button onClick={() => navigate('/')}
            style={{ flex: 1, background: 'rgba(255,255,255,0.18)', color: 'white', border: '1.5px solid rgba(255,255,255,0.45)', padding: '14px', borderRadius: 14, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
            Browse first
          </button>
        </div>

        {/* Social proof */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 20, position: 'relative', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex' }}>
            {['JT', 'SM', 'MR', 'PK'].map((av, i) => (
              <div key={av} style={{ width: 28, height: 28, borderRadius: '50%', background: `hsl(${i * 60}, 70%, 60%)`, border: '2px solid rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white', marginLeft: i > 0 ? -8 : 0 }}>
                {av}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
            Join thousands of Australians already selling
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 4 }}>
            🔞 18+ platform
          </div>
        </div>
      </div>

      {/* Buyer / Seller toggle */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ display: 'flex', background: 'white', borderRadius: 14, padding: 4, marginBottom: 4, border: '1px solid var(--border)' }}>
          {['buyer', 'seller'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, padding: '11px', borderRadius: 11, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: tab === t ? 'linear-gradient(135deg, var(--red), var(--orange))' : 'transparent', color: tab === t ? 'white' : 'var(--muted)', transition: 'all 0.2s', boxShadow: tab === t ? '0 2px 8px rgba(255,45,85,0.3)' : 'none' }}>
              {t === 'buyer' ? '🛍️ I want to buy' : '⚡ I want to sell'}
            </button>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div style={{ background: 'white', margin: '12px 16px', borderRadius: 16, padding: '4px 16px', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, padding: '14px 0 4px' }}>
          {tab === 'buyer' ? 'Why buyers love it' : 'Why sellers choose us'}
        </div>
        {(tab === 'buyer' ? BUYER_BENEFITS : SELLER_BENEFITS).map((b, i) => (
          <BenefitCard key={i} {...b} />
        ))}
      </div>

      {/* Pricing */}
      {tab === 'seller' && (
        <div style={{ margin: '0 16px 16px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Simple pricing</div>
          {PLANS.map(p => (
            <div key={p.name} style={{ background: 'white', border: `1.5px solid ${p.highlight ? 'var(--red)' : 'var(--border)'}`, borderRadius: 16, padding: 16, marginBottom: 10, position: 'relative' }}>
              {p.highlight && (
                <div style={{ position: 'absolute', top: -10, left: 16, background: 'linear-gradient(135deg, var(--red), var(--orange))', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 12px', borderRadius: 20 }}>
                  Most popular
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{p.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: p.highlight ? 'var(--red)' : 'var(--text)' }}>{p.price}</span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{p.period}</span>
                </div>
              </div>
              {p.features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, fontSize: 12, color: 'var(--muted)' }}>
                  <Check size={13} color="var(--green)" /> {f}
                </div>
              ))}
            </div>
          ))}
          <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 6 }}>
            Zero commission on sales — 100% goes to you
          </div>
        </div>
      )}

      {/* How it works — seller */}
      {tab === 'seller' && (
        <div style={{ margin: '0 16px 16px', background: 'white', borderRadius: 16, padding: 16, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>List in 60 seconds</div>
          {[
            { step: '1', icon: '📷', title: 'Take a photo', sub: 'Point your camera at your item' },
            { step: '2', icon: '✨', title: 'AI writes it for you', sub: 'Title, description and price auto-filled' },
            { step: '3', icon: '⚡', title: 'Publish', sub: 'Live instantly — buyers can see it now' },
            { step: '4', icon: '💰', title: 'Get paid', sub: 'Money goes straight to your bank via Stripe' },
          ].map((s, i) => (
            <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: i < 3 ? 14 : 0 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--red), var(--orange))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {s.icon}
              </div>
              {i < 3 && <div style={{ position: 'absolute', left: 52, marginTop: 40, width: 1, height: 14, background: 'var(--border)' }} />}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{s.title}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* vs competitors */}
      <div style={{ margin: '0 16px 16px', background: 'white', borderRadius: 16, padding: 16, border: '1px solid var(--border)', overflowX: 'auto' }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
          {tab === 'buyer' ? 'Better than the rest' : 'Why not Gumtree or eBay?'}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '6px 0', color: 'var(--muted)', fontWeight: 600, width: '40%' }}>Feature</th>
              <th style={{ textAlign: 'center', padding: '6px 4px', color: 'var(--red)', fontWeight: 700 }}>SLC ⚡</th>
              <th style={{ textAlign: 'center', padding: '6px 4px', color: 'var(--muted)', fontWeight: 600 }}>Gumtree</th>
              <th style={{ textAlign: 'center', padding: '6px 4px', color: 'var(--muted)', fontWeight: 600 }}>eBay</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['AI listing tool',            '✅', '❌', '❌'],
              ['Zero commission',            '✅', '❌', '❌'],
              ['Make an offer',              '✅', '❌', '✅'],
              ['Verified sellers',           '✅', '❌', '⚠️'],
              ['Services marketplace',       '✅', '⚠️', '❌'],
              ['Geo-filtered services',      '✅', '❌', '❌'],
              ['Price drop alerts',          '✅', '❌', '⚠️'],
              ['Recently viewed',            '✅', '❌', '✅'],
              ['Push notifications',         '✅', '❌', '✅'],
              ['Category-specific fields',   '✅', '⚠️', '✅'],
              ['Seller analytics',           '✅', '❌', '⚠️'],
              ['Bundle deals',               '✅', '❌', '❌'],
              ['Multi-currency',             '✅', '❌', '✅'],
            ].map(([feat, slc, gt, eb]) => (
              <tr key={feat} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '9px 0', color: 'var(--text)', fontWeight: 500 }}>{feat}</td>
                <td style={{ textAlign: 'center', padding: '9px 4px', fontWeight: 700 }}>{slc}</td>
                <td style={{ textAlign: 'center', padding: '9px 4px' }}>{gt}</td>
                <td style={{ textAlign: 'center', padding: '9px 4px' }}>{eb}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Final CTA */}
      <div style={{ padding: '0 16px' }}>
        <button onClick={() => navigate('/onboarding')}
          className="btn-primary" style={{ marginBottom: 10 }}>
          Get started free — 10 listings + AI tool ⚡
        </button>
        <button onClick={() => navigate('/login')}
          className="btn-secondary">
          Already have an account? Sign in
        </button>
      </div>

    </div>
  )
}
