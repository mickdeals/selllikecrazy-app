import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Bell, BellOff, Trash2, Plus, SlidersHorizontal } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { saveSearch, deleteSavedSearch, toggleSearchNotifications } from '../lib/savedSearches'
import toast from 'react-hot-toast'

const DEMO_SEARCHES = [
  { id: 1, query: 'vintage camera', filters: '{"maxPrice":500}', notifications_enabled: true, match_count: 3, created_at: '2026-07-28' },
  { id: 2, query: 'macbook pro', filters: '{"maxPrice":1500,"location":"Perth"}', notifications_enabled: true, match_count: 7, created_at: '2026-07-25' },
  { id: 3, query: 'surfboard', filters: '{}', notifications_enabled: false, match_count: 1, created_at: '2026-07-20' },
]

const PRICE_OPTIONS = [null, 10, 20, 50, 100, 200, 500, 1000, 2000]

export default function SavedSearches() {
  const navigate = useNavigate()
  const { user, categories } = useAppStore()

  const [searches, setSearches] = useState(DEMO_SEARCHES)
  const [showNew, setShowNew] = useState(false)
  const [newQuery, setNewQuery] = useState('')
  const [maxPrice, setMaxPrice] = useState(null)
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!newQuery.trim()) { toast.error('Enter a search term'); return }
    setSaving(true)
    try {
      const filters = {}
      if (maxPrice) filters.maxPrice = maxPrice
      if (category) filters.category = category
      if (location) filters.location = location

      await saveSearch(user?.id || 'demo', newQuery, filters)

      const newSearch = {
        id: Date.now(),
        query: newQuery,
        filters: JSON.stringify(filters),
        notifications_enabled: true,
        match_count: 0,
        created_at: new Date().toISOString().split('T')[0],
      }
      setSearches(s => [newSearch, ...s])
      setNewQuery('')
      setMaxPrice(null)
      setCategory('')
      setLocation('')
      setShowNew(false)
      toast.success('Search saved! You\'ll be notified of new matches 🔔')
    } catch {
      toast.error('Failed to save search')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteSavedSearch(id, user?.id || 'demo')
      setSearches(s => s.filter(x => x.id !== id))
      toast.success('Search removed')
    } catch {
      setSearches(s => s.filter(x => x.id !== id))
      toast.success('Search removed')
    }
  }

  const handleToggleNotif = async (id, current) => {
    try {
      await toggleSearchNotifications(id, user?.id || 'demo', !current)
      setSearches(s => s.map(x => x.id === id ? { ...x, notifications_enabled: !current } : x))
      toast.success(!current ? 'Notifications on 🔔' : 'Notifications off')
    } catch {
      setSearches(s => s.map(x => x.id === id ? { ...x, notifications_enabled: !current } : x))
    }
  }

  const parseFilters = (f) => {
    try { return typeof f === 'string' ? JSON.parse(f) : f } catch { return {} }
  }

  return (
    <div className="page">

      <div style={{ background: 'linear-gradient(135deg, var(--red), var(--orange))', padding: '20px 16px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
            <ArrowLeft size={22} />
          </button>
          <h2 style={{ color: 'white', flex: 1 }}>Saved searches</h2>
          <button onClick={() => setShowNew(s => !s)}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10, padding: '7px 12px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}>
            <Plus size={14} /> New alert
          </button>
        </div>
      </div>

      {/* New search form */}
      {showNew && (
        <div style={{ background: 'white', padding: 16, borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Create search alert</div>

          <div className="form-group">
            <label className="input-label">Search term</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input className="input" value={newQuery} onChange={e => setNewQuery(e.target.value)}
                placeholder="vintage camera, macbook, surfboard..." style={{ paddingLeft: 38 }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <SlidersHorizontal size={14} color="var(--muted)" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>Filters (optional)</span>
          </div>

          <div className="form-row" style={{ marginBottom: 10 }}>
            <div>
              <label className="input-label">Max price</label>
              <select className="input" value={maxPrice || ''} onChange={e => setMaxPrice(e.target.value ? parseInt(e.target.value) : null)}>
                <option value="">Any price</option>
                {PRICE_OPTIONS.filter(Boolean).map(p => <option key={p} value={p}>${p}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Category</label>
              <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">Any category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Location</label>
            <input className="input" value={location} onChange={e => setLocation(e.target.value)}
              placeholder="Perth, Sydney... (optional)" />
          </div>

          <div style={{ background: '#FFF9E6', border: '1px solid var(--yellow)', borderRadius: 10, padding: '8px 12px', marginBottom: 14, fontSize: 11, color: '#664400' }}>
            🔔 You'll get a push notification whenever a new listing matches this search
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>
              {saving ? 'Saving...' : 'Save alert'}
            </button>
            <button className="btn-secondary" onClick={() => setShowNew(false)} style={{ flex: 1 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Saved searches list */}
      {searches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--muted)' }}>
          <Search size={44} style={{ margin: '0 auto 14px', opacity: 0.3 }} />
          <h3 style={{ marginBottom: 8 }}>No saved searches yet</h3>
          <p style={{ fontSize: 13 }}>Save a search and get notified when matching listings appear</p>
          <button className="btn-primary" style={{ marginTop: 20, width: 'auto', padding: '11px 24px' }}
            onClick={() => setShowNew(true)}>Create first alert</button>
        </div>
      ) : (
        <div>
          {searches.map(s => {
            const filters = parseFilters(s.filters)
            const filterTags = [
              filters.maxPrice ? `Under $${filters.maxPrice}` : null,
              filters.category || null,
              filters.location || null,
            ].filter(Boolean)

            return (
              <div key={s.id} style={{ background: 'white', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #FFF0F3, #FFF5F0)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Search size={18} color="var(--red)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                        "{s.query}"
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button onClick={() => handleToggleNotif(s.id, s.notifications_enabled)}
                          style={{ background: s.notifications_enabled ? '#FFF9E6' : 'var(--bg)', border: `1px solid ${s.notifications_enabled ? 'var(--yellow)' : 'var(--border)'}`, borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: s.notifications_enabled ? '#CC9900' : 'var(--muted)' }}>
                          {s.notifications_enabled ? <Bell size={14} /> : <BellOff size={14} />}
                        </button>
                        <button onClick={() => handleDelete(s.id)}
                          style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--red)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {filterTags.length > 0 && (
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 6 }}>
                        {filterTags.map(tag => (
                          <span key={tag} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20, padding: '2px 8px', fontSize: 10, color: 'var(--muted)', fontWeight: 500 }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--muted)' }}>
                      {s.match_count > 0 && (
                        <button onClick={() => navigate(`/browse?q=${encodeURIComponent(s.query)}`)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', fontSize: 11, fontWeight: 700, padding: 0, fontFamily: 'inherit' }}>
                          {s.match_count} listing{s.match_count !== 1 ? 's' : ''} match →
                        </button>
                      )}
                      <span style={{ marginLeft: 'auto' }}>
                        {s.notifications_enabled ? '🔔 Alerts on' : '🔕 Alerts off'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
