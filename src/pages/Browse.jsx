import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Heart, Bell, ShieldCheck, Star, Navigation } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { formatPrice } from '../lib/geo'
import { getUserLocation, filterByDistance, formatDistance, RADIUS_OPTIONS } from '../lib/geocoding'
import toast from 'react-hot-toast'

const ALL_LISTINGS = [
  // Items — no geo needed, show globally
  { id: 1,  title: 'iPhone 14 Pro 256GB',           price: 850,   category: 'Electronics', location: 'Perth, WA',      shipping: 'free_shipping',  badge: 'hot',    emoji: '📱', thumb: 1, type: 'item' },
  { id: 2,  title: 'Nike Air Max Size 10',           price: 95,    category: 'Clothing',    location: 'Melbourne, VIC', shipping: 'buyer_pays',     badge: null,     emoji: '👟', thumb: 2, type: 'item' },
  { id: 3,  title: 'PS5 + 3 games bundle',           price: 620,   category: 'Gaming',      location: 'Sydney, NSW',    shipping: 'free_shipping',  badge: 'bundle', emoji: '🎮', thumb: 3, type: 'item' },
  { id: 4,  title: 'Vintage timber chair',           price: 45,    category: 'Furniture',   location: 'Brisbane, QLD',  shipping: 'pickup_only',    badge: null,     emoji: '🪑', thumb: 4, type: 'item' },
  { id: 5,  title: 'Canon EOS R50 + lens',           price: 1100,  category: 'Electronics', location: 'Adelaide, SA',   shipping: 'buyer_pays',     badge: 'new',    emoji: '📷', thumb: 5, type: 'item' },
  { id: 6,  title: 'Baby clothes 0–6m bundle',       price: 18,    category: 'Clothing',    location: 'Perth, WA',      shipping: 'free_shipping',  badge: 'bundle', emoji: '🛍️', thumb: 6, type: 'item' },
  { id: 7,  title: '2019 Toyota Corolla 45k km',     price: 19500, category: 'Vehicles',    location: 'Brisbane, QLD',  shipping: 'pickup_only',    badge: null,     emoji: '🚗', thumb: 1, type: 'item' },
  { id: 8,  title: 'Makita drill set + case',        price: 180,   category: 'Tools',       location: 'Sydney, NSW',    shipping: 'shipping_pickup', badge: null,    emoji: '🔧', thumb: 3, type: 'item' },
  { id: 9,  title: 'Apple Watch Series 8',           price: 420,   category: 'Electronics', location: 'Melbourne, VIC', shipping: 'free_shipping',  badge: 'hot',    emoji: '⌚', thumb: 5, type: 'item' },
  { id: 10, title: 'Kids toy bundle x12',            price: 35,    category: 'Toys',        location: 'Perth, WA',      shipping: 'shipping_pickup', badge: 'bundle', emoji: '🧸', thumb: 4, type: 'item' },
  // Services — with lat/lng for geo-filtering
  { id: 101, title: 'Scalp Micropigmentation — Full Head',  price: 800, category: 'Scalp Micropigmentation', location: 'Ballajura, Perth WA', badge: 'verified', emoji: '💆', thumb: 1, type: 'service', rating: 4.9, reviews: 34, experience: 'Expert',    delivery: 'In-person',               travelRadius: '30km', lat: -31.8466, lng: 115.8877, countryCode: 'AU' },
  { id: 102, title: 'SMP Touch-Up Session',                 price: 250, category: 'Scalp Micropigmentation', location: 'Ballajura, Perth WA', badge: 'verified', emoji: '✨', thumb: 2, type: 'service', rating: 4.9, reviews: 34, experience: 'Expert',    delivery: 'In-person',               travelRadius: '30km', lat: -31.8466, lng: 115.8877, countryCode: 'AU' },
  { id: 103, title: 'Hair Tattoo — Hairline Design',        price: 350, category: 'Hair & Beauty',           location: 'Melbourne, VIC',     badge: 'verified', emoji: '💈', thumb: 3, type: 'service', rating: 4.8, reviews: 22, experience: 'Qualified', delivery: 'In-person',               travelRadius: '20km', lat: -37.8136, lng: 144.9631, countryCode: 'AU' },
  { id: 104, title: 'Personal Training — 10 Sessions',      price: 450, category: 'Personal Training',       location: 'Sydney, NSW',        badge: null,       emoji: '💪', thumb: 4, type: 'service', rating: 4.7, reviews: 18, experience: 'Qualified', delivery: 'Both in-person & online', travelRadius: '15km', lat: -33.8688, lng: 151.2093, countryCode: 'AU' },
  { id: 105, title: 'Portrait Photography — 1hr Session',   price: 280, category: 'Photography',             location: 'Brisbane, QLD',      badge: 'new',      emoji: '📸', thumb: 5, type: 'service', rating: 5.0, reviews: 8,  experience: 'Trained',   delivery: 'Mobile (I come to you)', travelRadius: '25km', lat: -27.4698, lng: 153.0251, countryCode: 'AU' },
  { id: 106, title: 'Guitar Lessons — All Levels',          price: 60,  category: 'Music Lessons',           location: 'Perth, WA',          badge: null,       emoji: '🎸', thumb: 6, type: 'service', rating: 4.9, reviews: 41, experience: 'Expert',    delivery: 'Both in-person & online', travelRadius: '10km', lat: -31.9505, lng: 115.8605, countryCode: 'AU' },
  { id: 107, title: 'Lawn Mowing — Weekly Service',         price: 85,  category: 'Trades & Handyman',       location: 'New York, NY',       badge: null,       emoji: '🌿', thumb: 1, type: 'service', rating: 4.6, reviews: 12, experience: 'Trained',   delivery: 'In-person',               travelRadius: '20km', lat: 40.7128,  lng: -74.0060, countryCode: 'US' },
  { id: 108, title: 'Japanese Tutoring — All Levels',       price: 55,  category: 'Tutoring & Education',    location: 'Tokyo, Japan',       badge: null,       emoji: '📚', thumb: 2, type: 'service', rating: 5.0, reviews: 28, experience: 'Expert',    delivery: 'Online / Remote',         travelRadius: null,   lat: 35.6762,  lng: 139.6503, countryCode: 'JP' },
]

const SERVICE_CATEGORIES = ['All services', 'Hair & Beauty', 'Scalp Micropigmentation', 'Trades & Handyman', 'Tutoring & Education', 'Photography', 'Personal Training', 'Music Lessons', 'Pet Services']

export default function Browse() {
  const navigate = useNavigate()
  const { user, categories, geo } = useAppStore()
  const symbol = geo?.symbol || '$'

  const [search, setSearch] = useState('')
  const [priceFilter, setPriceFilter] = useState(null)
  const [catFilter, setCatFilter] = useState(null)
  const [sortBy, setSortBy] = useState('recent')
  const [listingType, setListingType] = useState('all')

  // Geo state — for service filtering
  const [userLat, setUserLat] = useState(null)
  const [userLng, setUserLng] = useState(null)
  const [userCity, setUserCity] = useState(null)
  const [radiusKm, setRadiusKm] = useState(50)
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoDetected, setGeoDetected] = useState(false)

  // Auto-detect location when services tab opened
  useEffect(() => {
    if ((listingType === 'services' || listingType === 'all') && !geoDetected) {
      setGeoLoading(true)
      getUserLocation().then(loc => {
        setUserLat(loc.lat)
        setUserLng(loc.lng)
        setUserCity(loc.city)
        setGeoDetected(true)
        setGeoLoading(false)
      })
    }
  }, [listingType])

  // Filter item listings
  const itemListings = ALL_LISTINGS
    .filter(l => l.type === 'item')
    .filter(l => {
      if (priceFilter && l.price > priceFilter) return false
      if (catFilter && l.category !== catFilter) return false
      if (search && !l.title.toLowerCase().includes(search.toLowerCase()) && !l.category.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price
      if (sortBy === 'price_desc') return b.price - a.price
      return b.id - a.id
    })

  // Filter service listings — with geo
  const baseServices = ALL_LISTINGS.filter(l => l.type === 'service')
  const geoFilteredServices = (userLat && userLng && !onlineOnly)
    ? filterByDistance(baseServices, userLat, userLng, radiusKm, true)
    : onlineOnly
      ? baseServices.filter(l => l.delivery?.toLowerCase().includes('online'))
      : baseServices

  const serviceListings = geoFilteredServices
    .filter(l => {
      if (catFilter && catFilter !== 'All services' && l.category !== catFilter) return false
      if (search && !l.title.toLowerCase().includes(search.toLowerCase()) && !l.category.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      // Online first, then by distance
      if (a.isOnline && !b.isOnline) return -1
      if (!a.isOnline && b.isOnline) return 1
      if (a.distance != null && b.distance != null) return a.distance - b.distance
      if (sortBy === 'price_asc') return a.price - b.price
      if (sortBy === 'price_desc') return b.price - a.price
      return 0
    })

  const handleClick = (l) => {
    if (!user) { toast('Log in to view full listing and contact seller', { icon: '🔒' }); navigate('/login'); return }
    navigate(`/listing/${l.id}`)
  }

  const serviceCount = ALL_LISTINGS.filter(l => l.type === 'service').length
  const itemCount = ALL_LISTINGS.filter(l => l.type === 'item').length

  return (
    <div className="page">

      {/* Header */}
      <div style={{ background: 'white', padding: 16, borderBottom: '1px solid var(--border)' }}>
        <div className="flex-between mb-12">
          <h2>Browse everything</h2>
          <button onClick={() => navigate('/saved-searches')}
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '6px 11px', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: 'var(--text)', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Bell size={13} /> Save search
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 14, padding: '11px 14px' }}>
          <Search size={18} color="var(--muted)" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search items and services..."
            style={{ border: 'none', background: 'none', flex: 1, fontSize: 14, color: 'var(--text)', outline: 'none', fontFamily: 'inherit' }} />
        </div>
      </div>

      {/* Item / Service / All toggle */}
      <div style={{ background: 'white', padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8 }}>
        {[
          { id: 'all',      label: `All (${ALL_LISTINGS.length})` },
          { id: 'items',    label: `📦 Items (${itemCount})` },
          { id: 'services', label: `🛠️ Services (${serviceCount})` },
        ].map(t => (
          <button key={t.id} onClick={() => { setListingType(t.id); setCatFilter(null) }}
            style={{ padding: '8px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: listingType === t.id ? 'var(--red)' : 'var(--bg)', color: listingType === t.id ? 'white' : 'var(--muted)', transition: 'all 0.15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Geo location strip — services only */}
      {listingType !== 'items' && (
        <div style={{ background: '#F0F5FF', borderBottom: '1px solid #D6E4FF', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Navigation size={14} color="#007AFF" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#007AFF', fontWeight: 600 }}>
            {geoLoading ? 'Detecting your location...' : userCity ? `Services near ${userCity}` : 'Services near you'}
          </span>
          {/* Radius chips */}
          <div style={{ display: 'flex', gap: 6, overflow: 'auto', scrollbarWidth: 'none', marginLeft: 'auto' }}>
            {RADIUS_OPTIONS.map(opt => (
              <button key={opt.label} onClick={() => {
                if (opt.onlineOnly) { setOnlineOnly(true); setRadiusKm(0) }
                else { setOnlineOnly(false); setRadiusKm(opt.km) }
              }}
                style={{ padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: (opt.onlineOnly ? onlineOnly : !onlineOnly && radiusKm === opt.km) ? '#007AFF' : 'white', color: (opt.onlineOnly ? onlineOnly : !onlineOnly && radiusKm === opt.km) ? 'white' : '#007AFF', border: '1px solid #D6E4FF', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price filter — items */}
      {listingType !== 'services' && (
        <div style={{ background: 'white', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 8, overflow: 'auto', padding: '10px 16px', scrollbarWidth: 'none' }}>
            {[null, 10, 20, 50, 100].map(p => (
              <button key={p ?? 'all'} onClick={() => setPriceFilter(p)} className={`chip ${priceFilter === p ? 'active' : ''}`}>
                {p ? `Under ${symbol}${p}` : 'All prices'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category filter — services */}
      {listingType === 'services' && (
        <div style={{ background: 'white', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 8, overflow: 'auto', padding: '10px 16px', scrollbarWidth: 'none' }}>
            {SERVICE_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCatFilter(cat === 'All services' ? null : cat)}
                className={`chip ${(cat === 'All services' && !catFilter) || catFilter === cat ? 'active' : ''}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category filter — items */}
      {listingType === 'items' && (
        <div style={{ background: 'white', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 8, overflow: 'auto', padding: '8px 16px', scrollbarWidth: 'none' }}>
            <button className={`chip ${!catFilter ? 'active' : ''}`} onClick={() => setCatFilter(null)}>All</button>
            {categories.filter(c => !c.includes('Lesson') && !c.includes('Training') && c !== 'Photography' && !c.includes('Service') && !c.includes('Micropigmentation') && !c.includes('Beauty') && !c.includes('Tattoo') && !c.includes('Wellness') && !c.includes('Handyman') && !c.includes('Tutoring') && !c.includes('Chef') && !c.includes('Event')).map(cat => (
              <button key={cat} className={`chip ${catFilter === cat ? 'active' : ''}`}
                onClick={() => setCatFilter(cat === catFilter ? null : cat)}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results count + sort */}
      <div style={{ padding: '10px 16px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          {listingType === 'services' ? serviceListings.length : listingType === 'items' ? itemListings.length : itemListings.length + serviceListings.length} result{(listingType === 'services' ? serviceListings.length : itemListings.length) !== 1 ? 's' : ''}
          {listingType === 'services' && userCity && !onlineOnly ? ` within ${radiusKm === 99999 ? 'all of' : radiusKm + 'km of'} ${userCity}` : ''}
        </span>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          <option value="recent">Recent</option>
          <option value="price_asc">Price: Low–High</option>
          <option value="price_desc">Price: High–Low</option>
        </select>
      </div>

      {/* Item grid */}
      {listingType !== 'services' && itemListings.length > 0 && (
        <div className="listing-grid" style={{ paddingTop: 8 }}>
          {itemListings.map(l => (
            <div key={l.id} className="listing-card" onClick={() => handleClick(l)}>
              <div className={`listing-thumb thumb-${l.thumb}`}>
                <span>{l.emoji}</span>
                <div className="listing-thumb-badges">
                  {l.badge === 'hot'    && <span className="badge badge-hot">Hot</span>}
                  {l.badge === 'new'    && <span className="badge badge-new">New</span>}
                  {l.badge === 'bundle' && <span className="badge badge-bundle">Bundle</span>}
                </div>
                <button className="listing-save-btn" onClick={e => { e.stopPropagation(); toast('Saved!', { icon: '❤️' }) }}><Heart size={13} /></button>
              </div>
              <div className="listing-info">
                <div className="listing-title">{l.title}</div>
                <div className="listing-price">{formatPrice(l.price, symbol)}</div>
                <div className="listing-loc">
                  <MapPin size={10} />{l.location}
                  {l.shipping === 'free_shipping'   && <span className="ship-tag ship-free">Free post</span>}
                  {l.shipping === 'pickup_only'      && <span className="ship-tag" style={{ background: '#FFF9E6', color: '#CC6600', borderColor: '#FFD080' }}>🚗 Pickup</span>}
                  {l.shipping === 'shipping_pickup'  && <span className="ship-tag" style={{ background: '#FFF9E6', color: '#CC6600', borderColor: '#FFD080' }}>📦🚗 Post or pickup</span>}
                  {l.shipping === 'local'            && <span className="ship-tag">Local</span>}
                  {l.shipping === 'international'    && <span className="ship-tag">🌍 Intl</span>}
                  {l.shipping === 'buyer_pays'       && <span className="ship-tag">{l.shippingCost || 'Buyer pays'}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Services section header (all tab) */}
      {listingType === 'all' && serviceListings.length > 0 && (
        <div style={{ padding: '14px 16px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>🛠️ Services near you</span>
          <button onClick={() => setListingType('services')} style={{ fontSize: 11, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }}>See all →</button>
        </div>
      )}

      {/* Service cards */}
      {listingType !== 'items' && serviceListings.length > 0 && (
        <div style={{ padding: '8px 14px' }}>
          {serviceListings.map(l => (
            <div key={l.id} onClick={() => handleClick(l)}
              style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 14, marginBottom: 10, cursor: 'pointer' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div className={`listing-thumb thumb-${l.thumb}`} style={{ width: 56, height: 56, borderRadius: 14, fontSize: 26, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {l.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, flex: 1, marginRight: 8 }}>{l.title}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--red)', flexShrink: 0 }}>{formatPrice(l.price, symbol)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, background: '#F0F0FF', color: '#635BFF', padding: '2px 8px', borderRadius: 20 }}>{l.experience}</span>
                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>{l.category}</span>
                    {l.badge === 'verified' && <span style={{ fontSize: 10, fontWeight: 700, background: '#E8F8EC', color: '#1A7A30', padding: '2px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3 }}><ShieldCheck size={9} /> Verified</span>}
                    {l.badge === 'new' && <span className="badge badge-new" style={{ fontSize: 9 }}>New</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--muted)', flexWrap: 'wrap' }}>
                    {l.rating && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Star size={11} fill="#FFD000" color="#FFD000" /> {l.rating} ({l.reviews})</span>}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={10} /> {l.location}</span>
                    {/* Distance badge */}
                    {l.distance != null && (
                      <span style={{ background: '#F0F5FF', color: '#007AFF', fontWeight: 700, padding: '2px 7px', borderRadius: 20, fontSize: 10, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Navigation size={9} /> {formatDistance(l.distance)}
                      </span>
                    )}
                    {l.isOnline && (
                      <span style={{ background: '#F0FFF4', color: '#1A7A30', fontWeight: 700, padding: '2px 7px', borderRadius: 20, fontSize: 10 }}>
                        🌐 Online
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 600, background: 'var(--bg)', border: '1px solid var(--border)', padding: '3px 9px', borderRadius: 20, color: 'var(--muted)' }}>{l.delivery}</span>
                {l.travelRadius && <span style={{ fontSize: 10, fontWeight: 600, background: 'var(--bg)', border: '1px solid var(--border)', padding: '3px 9px', borderRadius: 20, color: 'var(--muted)' }}>Travels {l.travelRadius}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {((listingType === 'items' && itemListings.length === 0) ||
        (listingType === 'services' && serviceListings.length === 0) ||
        (listingType === 'all' && itemListings.length === 0 && serviceListings.length === 0)) && (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--muted)' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>
            {listingType === 'services' && !onlineOnly ? '📍' : '🔍'}
          </div>
          <h3 style={{ marginBottom: 8 }}>
            {listingType === 'services' && !search ? `No services found within ${radiusKm === 99999 ? 'your country' : radiusKm + 'km'}` : 'No results found'}
          </h3>
          <p style={{ fontSize: 13 }}>
            {listingType === 'services' && !search ? 'Try expanding your radius or check Online services' : 'Try a different search or category'}
          </p>
          {listingType === 'services' && radiusKm < 99999 && (
            <button className="btn-primary" style={{ marginTop: 16, width: 'auto', padding: '11px 24px' }}
              onClick={() => setRadiusKm(99999)}>
              Show nationwide services
            </button>
          )}
        </div>
      )}
    </div>
  )
}
