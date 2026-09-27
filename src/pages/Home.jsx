import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Package, Star, Zap, Heart, ChevronRight, Search, SlidersHorizontal } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { formatPrice } from '../lib/geo'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Home() {
  const navigate = useNavigate()
  const { user, geo } = useAppStore()
  const symbol = geo?.symbol || '$'

  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [priceFilter, setPriceFilter] = useState('')

  useEffect(() => { fetchListings() }, [priceFilter, search])

  const fetchListings = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(12)
      if (priceFilter) query = query.lte('price', priceFilter)
      if (search) query = query.ilike('title', `%${search}%`)
      const { data, error } = await query
      if (error) throw error
      setListings(data || [])
    } catch {
      toast.error('Could not load listings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      {/* Hero header */}
      <div style={{ background: 'linear-gradient(135deg, var(--red), var(--orange))', padding: '20px 16px 16px', color: 'white' }}>
        <h1 style={{ color: 'white', fontSize: 22, marginBottom: 4 }}>Sell Like Crazy 🔥</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 14 }}>Australia's marketplace. Zero commission.</p>
        {/* Search bar */}
        <div style={{ display: 'flex', background: 'white', borderRadius: 14, padding: '10px 14px', gap: 10, alignItems: 'center' }}>
          <Search size={16} color="var(--muted)" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search listings..."
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, fontFamily: 'inherit', color: 'var(--text)', background: 'transparent' }}
          />
        </div>
      </div>

      {/* Price filter chips */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[['', 'All'], ['50', 'Under $50'], ['100', 'Under $100'], ['500', 'Under $500'], ['1000', 'Under $1k']].map(([val, label]) => (
          <button key={val} onClick={() => setPriceFilter(val)}
            style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1.5px solid ${priceFilter === val ? 'var(--red)' : 'var(--border)'}`, background: priceFilter === val ? '#FFF0F3' : 'white', color: priceFilter === val ? 'var(--red)' : 'var(--muted)', cursor: 'pointer', fontFamily: 'inherit' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Listings grid */}
      <div style={{ padding: '0 14px 80px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>Loading listings...</div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 50, marginBottom: 12 }}>🔍</div>
            <h3 style={{ marginBottom: 8 }}>No listings found</h3>
            <p style={{ fontSize: 13 }}>Try a different search or filter</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {listings.map(item => (
              <div key={item.id} onClick={() => navigate(`/listing/${item.id}`)}
                style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ height: 130, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                  {item.photo_urls?.[0] ? (
                    <img src={item.photo_urls[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : '📦'}
                </div>
                <div style={{ padding: '10px 11px 12px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 5, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--red)', marginBottom: 4 }}>
                    {item.listing_type === 'service' ? 'From ' : ''}{formatPrice(item.sale_price || item.price, symbol)}
                  </div>
                  {item.location && (
                    <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <MapPin size={10} />{item.location}
                    </div>
                  )}
                  {item.shipping_option === 'free_shipping' && (
                    <div style={{ fontSize: 10, color: 'var(--green)', fontWeight: 700, marginTop: 3 }}>Free shipping</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
