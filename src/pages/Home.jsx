import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Gift, Globe, MapPin, Heart, Search } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { detectGeo, LANGUAGE_MAP, formatPrice } from '../lib/geo'
import { RecentlyViewedStrip } from './RecentlyViewed'
import toast from 'react-hot-toast'


// Demo listings — in production these come from Supabase
const DEMO_LISTINGS = [
  { id: 1, title: 'iPhone 14 Pro 256GB', price: 850, category: 'Electronics', location: 'Perth, WA', shipping: 'free', badge: 'hot', emoji: '📱', thumb: 1 },
  { id: 2, title: 'Nike Air Max Size 10', price: 95, category: 'Clothing', location: 'Melbourne, VIC', shipping: '$12', badge: null, emoji: '👟', thumb: 2 },
  { id: 3, title: 'PS5 + 3 games bundle', price: 620, category: 'Gaming', location: 'Sydney, NSW', shipping: 'free', badge: 'bundle', emoji: '🎮', thumb: 3 },
  { id: 4, title: 'Vintage timber chair', price: 45, category: 'Furniture', location: 'Brisbane, QLD', shipping: 'local', badge: null, emoji: '🪑', thumb: 4 },
  { id: 5, title: 'Canon EOS R50 + lens', price: 1100, category: 'Electronics', location: 'Adelaide, SA', shipping: '$15', badge: 'new', emoji: '📷', thumb: 5 },
  { id: 6, title: 'Baby clothes 0–6m bundle', price: 18, category: 'Clothing', location: 'Perth, WA', shipping: '$8', badge: 'bundle', emoji: '🛍️', thumb: 6 },
]

const LANG_OPTIONS = [
  { code: 'en', currency: 'AUD', flag: '🇦🇺', country: 'Australia', symbol: '$' },
  { code: 'zh', currency: 'CNY', flag: '🇨🇳', country: 'China', symbol: '¥' },
  { code: 'ja', currency: 'JPY', flag: '🇯🇵', country: 'Japan', symbol: '¥' },
  { code: 'en', currency: 'USD', flag: '🇺🇸', country: 'USA', symbol: '$' },
  { code: 'de', currency: 'EUR', flag: '🇩🇪', country: 'Germany', symbol: '€' },
  { code: 'pt', currency: 'BRL', flag: '🇧🇷', country: 'Brazil', symbol: 'R$' },
  { code: 'ar', currency: 'AED', flag: '🇦🇪', country: 'UAE', symbol: 'د.إ' },
]

const CURRENCIES = ['AUD', 'USD', 'EUR', 'GBP', 'JPY']
const CURRENCY_SYMBOLS = { AUD: '$', USD: '$', EUR: '€', GBP: '£', JPY: '¥' }

export default function Home() {
  const navigate = useNavigate()
  const { geo, setGeo, user, categories } = useAppStore()

  const [lang, setLang] = useState('en')
  const [currency, setCurrency] = useState(geo.currency || 'AUD')
  const [symbol, setSymbol] = useState(geo.symbol || '$')
  const [country, setCountry] = useState(geo.country || 'Australia')
  const [priceFilter, setPriceFilter] = useState(null)
  const [search, setSearch] = useState('')
  const [langOpen, setLangOpen] = useState(false)
  const [detectedLabel, setDetectedLabel] = useState('Detecting...')
  const t = LANGUAGE_MAP[lang] || LANGUAGE_MAP.en

  // Auto-detect geo on mount
  useEffect(() => {
    detectGeo().then(result => {
      setGeo(result)
      setLang(result.lang)
      setCurrency(result.currency)
      setSymbol(result.symbol)
      setCountry(result.country)
      setDetectedLabel(`${result.country} · ${result.currency}`)
    })
  }, [])

  const switchLang = (opt) => {
    setLang(opt.code)
    setCurrency(opt.currency)
    setSymbol(opt.symbol)
    setCountry(opt.country)
    setDetectedLabel(`${opt.country} · ${opt.currency}`)
    setLangOpen(false)
    toast.success(`${opt.flag} Switched to ${opt.country}`)
  }

  const switchCurrency = (cur) => {
    const sym = CURRENCY_SYMBOLS[cur] || '$'
    setCurrency(cur)
    setSymbol(sym)
    toast.success(`Currency: ${cur}`)
  }

  // Filter listings
  const listings = DEMO_LISTINGS.filter(l => {
    if (priceFilter && l.price > priceFilter) return false
    if (search && !l.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleListingClick = () => {
    if (!user) {
      toast('Please log in to contact the seller', { icon: '🔒' })
      navigate('/login')
    }
  }

  return (
    <div className="page">

      {/* ── Hero ── */}
      <div className="hero">
        <div className="hero-dots" aria-hidden="true" />

        {/* Language switcher */}
        <div style={{ position: 'absolute', top: 20, right: 16, zIndex: 10 }}>
          <button
            onClick={() => setLangOpen(o => !o)}
            style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 20, padding: '5px 11px', color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
          >
            <Globe size={13} /> {lang.toUpperCase()} · {currency}
          </button>
          {langOpen && (
            <div style={{ position: 'absolute', top: 36, right: 0, background: 'white', borderRadius: 14, boxShadow: '0 8px 30px rgba(0,0,0,0.15)', minWidth: 170, overflow: 'hidden', zIndex: 100 }}>
              {LANG_OPTIONS.map(opt => (
                <button key={opt.country} onClick={() => switchLang(opt)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', fontSize: 13, color: '#0A0A0F', cursor: 'pointer', background: 'none', border: 'none', borderBottom: '1px solid #E8E8ED', width: '100%', fontFamily: 'inherit', textAlign: 'left' }}>
                  {opt.flag} {opt.code === 'en' ? 'English' : opt.code === 'zh' ? '中文' : opt.code === 'ja' ? '日本語' : opt.code === 'de' ? 'Deutsch' : opt.code === 'pt' ? 'Português' : 'عربي'} · {opt.currency}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Logo */}
        <div className="logo-row">
          <div className="logo-img-wrap">
            <img src="/logo.png" alt="Sell Like Crazy" onError={e => { e.target.style.display = 'none'; e.target.parentNode.textContent = '⚡' }} />
          </div>
          <div>
            <div className="logo-name">Sell Like Crazy</div>
            <div className="logo-slogan">{t.heroTitle.split('.')[0]}.</div>
          </div>
        </div>

        <h1 className="hero-title">{t.heroTitle}</h1>
        <p className="hero-sub">{t.heroSub}</p>

        {/* Search bar in hero */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: '12px 16px', marginBottom: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          <Search size={18} color="var(--muted)" style={{ flexShrink: 0 }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t.searchPh}
            style={{ border: 'none', background: 'none', flex: 1, fontSize: 15, color: 'var(--text)', outline: 'none', fontFamily: 'inherit' }} />
          {search && (
            <button onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0, display: 'flex', alignItems: 'center' }}>
              ✕
            </button>
          )}
        </div>

        <div className="hero-btns">
          <button className="btn-hero-primary" onClick={() => navigate('/sell')}>{t.sellBtn}</button>
          <button className="btn-ghost-white" onClick={() => navigate('/browse')}>{t.browseBtn}</button>
        </div>

        <div className="free-pill">
          <Gift size={15} />
          <span>{t.freePill}</span>
        </div>
      </div>

      {/* ── Geo / Currency strip ── */}
      <div className="geo-strip">
        <div className="geo-detected">
          <MapPin size={13} />
          Detected: <strong>{detectedLabel}</strong>
        </div>
        <div style={{ display: 'flex', gap: 5, overflow: 'auto', scrollbarWidth: 'none' }}>
          {CURRENCIES.map(cur => (
            <button key={cur} onClick={() => switchCurrency(cur)}
              className={`chip ${currency === cur ? 'active' : ''}`}
              style={{ padding: '4px 10px', fontSize: 11 }}>
              {cur}
            </button>
          ))}
        </div>
      </div>

      {/* ── Price filter ── */}
      <div style={{ background: 'white', padding: '14px 16px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="section-label" style={{ padding: 0, marginBottom: 10 }}>{t.shopByPrice}</div>
        <div className="scroll-row" style={{ padding: '0 0 14px' }}>
          {[null, 10, 20, 50, 100].map(p => (
            <button key={p ?? 'all'} onClick={() => setPriceFilter(p)}
              className={`chip ${priceFilter === p ? 'active' : ''}`}>
              {p ? `${t.allPrices === 'All prices' ? 'Under' : '>'} ${symbol}${p}` : t.allPrices}
            </button>
          ))}
        </div>
      </div>

      {/* ── Categories ── */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)' }}>
        <div className="scroll-row">
          <button className="chip" style={{ background: '#FFF0F0', borderColor: '#FFD0D8', color: 'var(--red)' }}
            onClick={() => navigate('/browse')}>🔥 {t.trending}</button>
          {categories.slice(0, 6).map(cat => (
            <button key={cat} className="chip" onClick={() => navigate(`/browse?cat=${cat}`)}>{cat}</button>
          ))}
          <button className="chip" style={{ background: '#F0F0FF', borderColor: '#C0C0FF', color: '#635BFF' }}
            onClick={() => navigate('/browse')}>🛠️ Services</button>
        </div>
      </div>

      {/* ── Listings ── */}
      {/* Recently viewed strip */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)' }}>
        <RecentlyViewedStrip />
      </div>

      <div style={{ padding: '14px 0' }}>
        <div className="flex-between px-16 mb-12">
          <h3>{t.latest}</h3>
          <button onClick={() => navigate('/browse')} style={{ fontSize: 12, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }}>See all →</button>
        </div>

        <div className="listing-grid">
          {listings.map(l => (
            <div key={l.id} className="listing-card" onClick={handleListingClick}>
              <div className={`listing-thumb thumb-${l.thumb}`}>
                <span>{l.emoji}</span>
                <div className="listing-thumb-badges">
                  {l.badge === 'hot' && <span className="badge badge-hot">{t.hotBadge}</span>}
                  {l.badge === 'new' && <span className="badge badge-new">{t.newBadge}</span>}
                  {l.badge === 'bundle' && <span className="badge badge-bundle">{t.bundleBadge}</span>}
                </div>
                <button className="listing-save-btn" onClick={e => { e.stopPropagation(); toast('Saved!', { icon: '❤️' }) }}>
                  <Heart size={14} />
                </button>
              </div>
              <div className="listing-info">
                <div className="listing-title">{l.title}</div>
                <div className="listing-price">{formatPrice(l.price, symbol)}</div>
                <div className="listing-loc">
                  <MapPin size={10} />
                  {l.location}
                  {l.shipping === 'free' && <span className="ship-tag ship-free">{t.freeShip}</span>}
                  {l.shipping === 'local' && <span className="ship-tag">{t.localOnly}</span>}
                  {l.shipping !== 'free' && l.shipping !== 'local' && <span className="ship-tag">{symbol}{l.shipping.replace('$','')}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {listings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 14 }}>No listings match your search</div>
          </div>
        )}
      </div>
    </div>
  )
}
