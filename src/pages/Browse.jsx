import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const PRICE_FILTERS = [
  { label: 'Any price', value: '' },
  { label: 'Under $50', value: '50' },
  { label: 'Under $100', value: '100' },
  { label: 'Under $500', value: '500' },
]

const SORT_OPTIONS = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Price: low to high', value: 'price_asc' },
  { label: 'Price: high to low', value: 'price_desc' },
]

export default function Browse() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])

  const listingType = searchParams.get('type') || 'items'
  const catFilter = searchParams.get('category') || ''
  const priceFilter = searchParams.get('price') || ''
  const sortBy = searchParams.get('sort') || 'newest'

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  const clearFilters = () => { setSearchParams({ type: listingType }) }
  const hasFilters = catFilter || priceFilter || sortBy !== 'newest'

  useEffect(() => { fetchListings() }, [listingType, catFilter, priceFilter, sortBy])
  useEffect(() => { fetchCategories() }, [listingType])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('listings').select('category').eq('status', 'active')
      .eq('listing_type', listingType === 'services' ? 'service' : 'item')
    if (data) {
      const unique = [...new Set(data.map(r => r.category).filter(Boolean))].sort()
      setCategories(unique)
    }
  }

  const fetchListings = async () => {
    setLoading(true)
    try {
      let query = supabase.from('listings').select('*').eq('status', 'active')
      if (listingType === 'items') query = query.eq('listing_type', 'item')
      if (listingType === 'services') query = query.eq('listing_type', 'service')
      if (catFilter) query = query.eq('category', catFilter)
      if (priceFilter) query = query.lte('price', Number(priceFilter))
      if (sortBy === 'price_asc') query = query.order('price', { ascending: true })
      else if (sortBy === 'price_desc') query = query.order('price', { ascending: false })
      else query = query.order('created_at', { ascending: false })
      const { data, error } = await query.limit(100)
      if (error) throw error
      setListings(data || [])
    } catch { toast.error('Could not load listings') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ padding: '16px', paddingBottom: 100 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['items', 'services'].map(t => (
          <button key={t} onClick={() => setParam('type', t)}
            style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none',
              background: listingType === t ? 'var(--red)' : 'var(--surface)',
              color: listingType === t ? 'white' : 'var(--text)',
              fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
            {t === 'items' ? '🛍️ Items' : '🛠️ Services'}
          </button>
        ))}
      </div>
      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 12, paddingBottom: 4 }}>
          <button onClick={() => setParam('category', '')}
            style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: 'none',
              background: !catFilter ? 'var(--red)' : 'var(--surface)',
              color: !catFilter ? 'white' : 'var(--text)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>All</button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setParam('category', cat === catFilter ? '' : cat)}
              style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: 'none',
                background: catFilter === cat ? 'var(--red)' : 'var(--surface)',
                color: catFilter === cat ? 'white' : 'var(--text)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{cat}</button>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <select value={priceFilter} onChange={e => setParam('price', e.target.value)}
          style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--text)', fontSize: 13, fontFamily: 'inherit' }}>
          {PRICE_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select value={sortBy} onChange={e => setParam('sort', e.target.value)}
          style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--text)', fontSize: 13, fontFamily: 'inherit' }}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      {hasFilters && (
        <button onClick={clearFilters}
          style={{ width: '100%', padding: '8px', marginBottom: 12, borderRadius: 8,
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          ✕ Clear all filters
        </button>
      )}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Loading...</div>
      ) : listings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontWeight: 600 }}>No listings found</div>
          {hasFilters && <div style={{ fontSize: 14, marginTop: 8 }}>Try clearing your filters</div>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {listings.map(item => (
            <div key={item.id} onClick={() => navigate(`/listing/${item.id}`)}
              style={{ background: 'var(--surface)', borderRadius: 12, overflow: 'hidden',
                cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <div style={{ aspectRatio: '1', background: 'var(--bg)', overflow: 'hidden' }}>
                {item.photo_urls?.[0] ? (
                  <img src={item.photo_urls[0]} alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>📦</div>
                )}
              </div>
              <div style={{ padding: '8px 10px 10px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {item.sale_price ? (
                    <>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--red)' }}>${item.sale_price}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>${item.price}</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--red)' }}>
                      {item.listing_type === 'service' ? `From $${item.price}` : `$${item.price}`}
                    </span>
                  )}
                </div>
                {item.category && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{item.category}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
