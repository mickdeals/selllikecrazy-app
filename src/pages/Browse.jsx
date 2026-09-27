import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, MapPin, Heart, Bell, ShieldCheck, Star, Navigation } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { formatPrice } from '../lib/geo'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const SERVICE_CATEGORIES = ['All services', 'Hair & Beauty', 'Scalp Micropigmentation', 'Trades & Handyman', 'Tutoring & Education', 'Photography', 'Personal Training', 'Music Lessons', 'Pet Services']

export default function Browse() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, geo } = useAppStore()
  const symbol = geo?.symbol || '$'

  const [search, setSearch] = useState('')
  const [priceFilter, setPriceFilter] = useState(null)
  const [catFilter, setCatFilter] = useState(searchParams.get('category') || null)
  const [sortBy, setSortBy] = useState('recent')
  const [listingType, setListingType] = useState('items')

  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])

  // Fetch listings from Supabase
  useEffect(() => {
    fetchListings()
  }, [catFilter, priceFilter, sortBy, listingType])

  const fetchListings = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')

      if (listingType === 'items') query = query.eq('type', 'item')
      if (listingType === 'services') query = query.eq('type', 'service')

      if (catFilter) query = query.eq('category', catFilter)
      if (priceFilter) query = query.lte('price', priceFilter)

      if (sortBy === 'price_asc') query = query.order('price', { ascending: true })
      else if (sortBy === 'price_desc') query = query.order('price', { ascending: false })
      else query = query.order('created_at', { ascending: false })

      const { data, error } = await query.limit(100)
      if (error) throw error
      setListings(data || [])

      // Build category list from results (or fetch all)
      if (!catFilter) {
        const cats = [...new Set((data || []).map(l => l.category).filter(Boolean))].sort()
        setCategories(cats)
      }
    } catch (err) {
      console.error('Browse fetch error:', err)
      toast.error('Could not load listings')
    } finally {
      setLoading(false)
    }
  }

  // Also fetch all categories for filter chips
  useEffect(() => {
    supabase
      .from('listings')
      .select('category')
      .eq('status', 'active')
      .eq('type', 'item')
      .then(({ data }) => {
        if (data) {
          const cats = [...new Set(data.map(l => l.category).filter(Boolean))].sort()
          setCategories(cats)
        }
      })
  }, [])

  // Search filter (client-side on fetched results)
  const filtered = listings.filter(l => {
    if (!search) return true
    const q = search.toLowerCase()
    return l.title?.toLowerCase().includes(q) ||
           l.category?.toLowerCase().includes(q) ||
           l.description?.toLowerCase().includes(q)
  })

  const handleClick = (l) => {
    if (!user) { toast('Log in to view full listing and contact seller', { icon: '🔒' }); navigate('/login'); return }
    navigate(`/listing/${l.id}`)
  }

  const handleSave = async (e, listing) => {
    e.stopPropagation()
    if (!user) { navigate('/login'); return }
    toast('Saved!', { icon: '❤️' })
  }

  const clearFilters = () => {
    setCatFilter(null)
    setPriceFilter(null)
    setSearch('')
  }

  const hasFilters = catFilter || priceFilter || search

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
          {search && (
            <button onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 18, lineHeight: 1 }}>×</button>
          )}
        </div>
      </div>

      {/* Item / Service / All toggle */}
      <div style={{ background: 'white', padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8 }}>
        {[
          { id: 'all',      label: 'All' },
          { id: 'items',    label: '📦 Items' },
          { id: 'services', label: '🛠️ Services' },
        ].map(t => (
          <button key={t.id} onClick={() => { setListingType(t.id); setCatFilter(null) }}
            style={{ padding: '8px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: listingType === t.id ? 'var(--red)' : 'var(--bg)', color: listingType === t.id ? 'white' : 'var(--muted)', transition: 'all 0.15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Price filter — items */}
      {listingType !== 'services' && (
        <div style={{ background: 'white', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 8, overflow: 'auto', padding: '10px 16px', scrollbarWidth: 'none' }}>
            {[null, 10, 20, 50, 100, 500].map(p => (
              <button key={p ?? 'all'} onClick={() => setPriceFilter(p)} className={`chip ${priceFilter === p ? 'active' : ''}`}>
                {p ? `Under ${symbol}${p}` : 'All prices'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category filter — items */}
      {listingType !== 'services' && categories.length > 0 && (
        <div style={{ background: 'white', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 8, overflow: 'auto', padding: '8px 16px', scrollbarWidth: 'none' }}>
            <button className={`chip ${!catFilter ? 'active' : ''}`} onClick={() => setCatFilter(null)}>All</button>
            {categories.map(cat => (
              <button key={cat} className={`chip ${catFilter === cat ? 'active' : ''}`}
                onClick={() => setCatFilter(cat === catFilter ? null : cat)}>
                {cat}
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

      {/* Active filters + clear */}
      {hasFilters && (
        <div style={{ background: '#FFF0F3', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #FFD0D8' }}>
          <span style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600 }}>
            Filters active{catFilter ? `: ${catFilter}` : ''}{priceFilter ? ` · Under $${priceFilter}` : ''}
          </span>
          <button onClick={clearFilters}
            style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--red)', background: 'none', border: '1px solid var(--red)', borderRadius: 20, padding: '3px 10px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
            Clear all
          </button>
        </div>
      )}

      {/* Results count + sort */}
      <div style={{ padding: '10px 16px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          {loading ? 'Loading...' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
        </span>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          <option value="recent">Recent</option>
          <option value="price_asc">Price: Low–High</option>
          <option value="price_desc">Price: High–Low</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <p style={{ fontSize: 13 }}>Loading listings...</p>
        </div>
      )}

      {/* Listing grid */}
      {!loading && filtered.length > 0 && (
        <div className="listing-grid" style={{ paddingTop: 8 }}>
          {filtered.map(l => (
            <div key={l.id} className="listing-card" onClick={() => handleClick(l)}>
              <div className="listing-thumb" style={{ background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, position: 'relative' }}>
                {l.images?.[0]
                  ? <img src={l.images[0]} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span>📦</span>
                }
                <button className="listing-save-btn" onClick={e => handleSave(e, l)}><Heart size={13} /></button>
              </div>
              <div className="listing-info">
                <div className="listing-title">{l.title}</div>
                <div className="listing-price">{formatPrice(l.price, symbol)}</div>
                <div className="listing-loc">
                  <MapPin size={10} />{l.location || l.pickup_suburb || '—'}
                  {l.shipping_option === 'free_shipping'    && <span className="ship-tag ship-free">Free post</span>}
                  {l.shipping_option === 'pickup_only'      && <span className="ship-tag" style={{ background: '#FFF9E6', color: '#CC6600', borderColor: '#FFD080' }}>🚗 Pickup</span>}
                  {l.shipping_option === 'shipping_pickup'  && <span className="ship-tag" style={{ background: '#FFF9E6', color: '#CC6600', borderColor: '#FFD080' }}>📦🚗 Post or pickup</span>}
                  {l.shipping_option === 'international'    && <span className="ship-tag">🌍 Intl</span>}
                  {l.shipping_option === 'buyer_pays'       && <span className="ship-tag">Buyer pays</span>}
                </div>
                {l.category && (
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>{l.category}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--muted)' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
          <h3 style={{ marginBottom: 8 }}>No results found</h3>
          <p style={{ fontSize: 13, marginBottom: 16 }}>
            {catFilter ? `No listings in "${catFilter}" yet` : 'Try a different search or category'}
          </p>
          {hasFilters && (
            <button className="btn-primary" style={{ width: 'auto', padding: '11px 24px' }} onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
