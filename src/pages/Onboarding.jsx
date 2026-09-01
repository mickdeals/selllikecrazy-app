import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Sparkles, Zap, DollarSign, ShieldCheck, Bell, Tag, Store, Check, Heart, Clock, Navigation, TrendingUp, CheckSquare } from 'lucide-react'
import { requestNotificationPermission } from '../lib/notifications'
import { useAppStore } from '../store/useAppStore'
import toast from 'react-hot-toast'

const SCREENS = [
  {
    id: 'welcome',
    emoji: '⚡',
    gradFrom: '#FF2D55',
    gradTo: '#FF6B00',
    title: 'Welcome to Sell Like Crazy',
    subtitle: 'Everything sells here — here\'s what you get from day one',
    points: [
      { icon: DollarSign,  text: 'Zero commission — 100% of every sale goes straight to you' },
      { icon: ShieldCheck, text: '18+ platform — every seller ID and mobile verified' },
      { icon: Tag,         text: 'Make offers — accepted offers lock the listing for 6 hours' },
      { icon: Heart,       text: 'Save listings + price alerts — notified the moment a price drops' },
      { icon: Clock,       text: 'Recently viewed — every listing you tap is saved for easy return' },
      { icon: Navigation,  text: 'Services near you — geo-filtered by distance so you see what\'s actually nearby' },
    ],
  },
  {
    id: 'listing',
    emoji: '📷',
    gradFrom: '#635BFF',
    gradTo: '#007AFF',
    title: 'List anything in 60 seconds',
    subtitle: 'AI does the hard work — photo to live listing in under a minute',
    steps: [
      { icon: Camera,       color: '#FF2D55', label: 'Take a photo of your item or portfolio work' },
      { icon: Sparkles,     color: '#635BFF', label: 'AI fills title, description, price and category-specific fields' },
      { icon: Zap,          color: '#FF6B00', label: 'Review and publish — live for buyers immediately' },
      { icon: DollarSign,   color: '#34C759', label: 'Money hits your bank via Stripe — nothing via us' },
    ],
    planNote: true,
  },
  {
    id: 'seller_tools',
    emoji: '🛠️',
    gradFrom: '#34C759',
    gradTo: '#007AFF',
    title: 'Tools to grow your sales',
    subtitle: 'Everything you need to sell more — built in from day one',
    sellerPoints: [
      { icon: CheckSquare,  color: '#635BFF', text: 'Seller setup checklist — guided path from signup to Power Seller' },
      { icon: TrendingUp,   color: '#007AFF', text: 'Per-listing analytics — views, saves and enquiries on every item' },
      { icon: Store,        color: '#FF2D55', text: 'Your own storefront — share on Instagram, Facebook, WhatsApp, TikTok' },
      { icon: Tag,          color: '#FF9500', text: 'Bundle deals — group listings and offer a bundle price' },
      { icon: Zap,          color: '#FF6B00', text: 'Power Seller badge — get featured above standard sellers' },
    ],
  },
  {
    id: 'notifications',
    emoji: '🔔',
    gradFrom: '#FF9500',
    gradTo: '#FFD000',
    title: 'Never miss a thing',
    subtitle: 'Turn on notifications — you\'ll be first to know every time',
    notifPoints: [
      'Someone makes you an offer on your listing',
      'A buyer messages you about an item',
      'A listing you saved drops in price',
      'A new match for your saved search appears',
      'Your offer is accepted, countered or declined',
      'Your listing is about to expire — time to relist',
    ],
  },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const [screen, setScreen] = useState(0)
  const [notifStatus, setNotifStatus] = useState('idle') // idle | requesting | granted | denied
  const current = SCREENS[screen]
  const isLast = screen === SCREENS.length - 1

  const handleNext = async () => {
    if (current.id === 'notifications' && notifStatus === 'idle') {
      await handleNotifications()
      return
    }
    if (isLast) {
      navigate('/')
    } else {
      setScreen(s => s + 1)
    }
  }

  const handleNotifications = async () => {
    setNotifStatus('requesting')
    const granted = await requestNotificationPermission(user?.id || 'demo')
    setNotifStatus(granted ? 'granted' : 'denied')
    if (granted) {
      toast.success('Notifications enabled 🔔')
    }
  }

  const handleSkip = () => {
    if (isLast) navigate('/')
    else setScreen(s => s + 1)
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Progress dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '16px 0 0' }}>
        {SCREENS.map((_, i) => (
          <div key={i} style={{ width: i === screen ? 20 : 6, height: 6, borderRadius: 3, background: i === screen ? 'var(--red)' : 'var(--border)', transition: 'all 0.3s' }} />
        ))}
      </div>

      {/* Hero gradient */}
      <div style={{ background: `linear-gradient(135deg, ${current.gradFrom}, ${current.gradTo})`, margin: 16, borderRadius: 24, padding: '32px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        <div style={{ fontSize: 56, marginBottom: 16, position: 'relative' }}>{current.emoji}</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 8, position: 'relative' }}>{current.title}</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.88)', lineHeight: 1.6, position: 'relative' }}>{current.subtitle}</p>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '0 16px' }}>

        {/* Welcome screen — buyer and seller benefits */}
        {current.points && (
          <div style={{ background: 'white', borderRadius: 16, padding: '6px 16px', border: '1px solid var(--border)', marginBottom: 16 }}>
            {current.points.map(({ icon: Icon, text }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0', borderBottom: i < current.points.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--red), var(--orange))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} color="white" />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{text}</div>
              </div>
            ))}
          </div>
        )}

        {/* Seller tools screen */}
        {current.sellerPoints && (
          <div style={{ background: 'white', borderRadius: 16, padding: '6px 16px', border: '1px solid var(--border)', marginBottom: 16 }}>
            {current.sellerPoints.map(({ icon: Icon, color, text }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0', borderBottom: i < current.sellerPoints.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}22`, border: `1.5px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} color={color} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{text}</div>
              </div>
            ))}
          </div>
        )}

        {/* Listing screen — steps */}
        {current.steps && (
          <>
            <div style={{ background: 'white', borderRadius: 16, padding: '6px 16px', border: '1px solid var(--border)', marginBottom: 12 }}>
              {current.steps.map(({ icon: Icon, color, label }, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: i < current.steps.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${color}22`, border: `1.5px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 1 }}>Step {i + 1}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Plan note */}
            <div style={{ background: '#FFF9E6', border: '1.5px solid var(--yellow)', borderRadius: 14, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#664400', marginBottom: 8 }}>🎁 Start free — no card needed</div>
              <div style={{ fontSize: 12, color: '#664400', marginBottom: 10, lineHeight: 1.6 }}>
                • <strong>10 free item listings</strong> to start selling today<br />
                • <strong>1 free service listing</strong> to try listing your skills<br />
                • <strong>AI listing tool, setup checklist + analytics</strong> included free
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { name: '$1/listing', detail: 'Pay as you go', highlight: false },
                  { name: '$50/year', detail: 'Unlimited selling\nAuto-renews · Cancel anytime', highlight: true },
                ].map(p => (
                  <div key={p.name} style={{ flex: 1, background: p.highlight ? 'white' : 'rgba(255,255,255,0.6)', border: `1.5px solid ${p.highlight ? 'var(--red)' : 'transparent'}`, borderRadius: 12, padding: '10px 12px' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: p.highlight ? 'var(--red)' : 'var(--text)' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: '#664400', whiteSpace: 'pre-line', marginTop: 2 }}>{p.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Notifications screen */}
        {current.notifPoints && (
          <>
            <div style={{ background: 'white', borderRadius: 16, padding: '6px 16px', border: '1px solid var(--border)', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.8, padding: '12px 0 8px' }}>
                You'll be notified when:
              </div>
              {current.notifPoints.map((point, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: '1px solid var(--border)' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: '#FFF9E6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bell size={14} color="#CC9900" />
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{point}</div>
                </div>
              ))}
            </div>

            {notifStatus === 'granted' && (
              <div style={{ background: '#F0FFF4', border: '1px solid #D6FFE4', borderRadius: 14, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Check size={18} color="var(--green)" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1A7A30' }}>Notifications enabled!</span>
              </div>
            )}

            {notifStatus === 'denied' && (
              <div style={{ background: '#FFF0F3', border: '1px solid #FFD0D8', borderRadius: 14, padding: '12px 16px', marginBottom: 16, fontSize: 12, color: '#990020' }}>
                Notifications blocked — you can enable them in your phone settings anytime.
              </div>
            )}
          </>
        )}
      </div>

      {/* CTA buttons */}
      <div style={{ padding: '8px 16px 36px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={handleNext} className="btn-primary">
          {current.id === 'notifications' && notifStatus === 'idle'
            ? '🔔 Enable notifications'
            : current.id === 'notifications' && notifStatus !== 'idle'
            ? 'Get started →'
            : isLast ? 'Get started ⚡' : 'Next'}
        </button>
        <button onClick={handleSkip}
          style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, cursor: 'pointer', padding: '8px', fontFamily: 'inherit' }}>
          {isLast ? 'Skip for now' : 'Skip'}
        </button>
      </div>

    </div>
  )
}
