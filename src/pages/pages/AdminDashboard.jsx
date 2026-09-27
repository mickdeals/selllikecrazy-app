import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Users, Package, Flag, DollarSign, Eye, Trash2, Check, X, ChevronRight, TrendingUp, Zap, Ban, UserX } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

function StatBox({ icon: Icon, color, bg, label, value, sub }) {
  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 12px', textAlign: 'center' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: color, fontWeight: 600, marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, isAdmin } = useAppStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [reports, setReports] = useState([])
  const [flagged, setFlagged] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdmin) return
    const fetchAll = async () => {
      setLoading(true)

      // Stats: count queries
      const [
        { count: totalUsers },
        { count: totalListings },
        { count: activeListings },
        { count: pendingReports },
        { count: servicesListings },
        { count: newToday },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('listings').select('*', { count: 'exact', head: true }),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('listing_type', 'service').eq('status', 'active'),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 86400000).toISOString()),
      ])

      setStats({
        totalUsers: totalUsers || 0,
        totalListings: totalListings || 0,
        activeListings: activeListings || 0,
        pendingReports: pendingReports || 0,
        servicesListings: servicesListings || 0,
        newToday: newToday || 0,
      })

      // Reports: pending, joined with listing title and reporter profile
      const { data: reportsData } = await supabase
        .from('reports')
        .select('id, reason, status, created_at, listing_id, reporter_id, listings(title, price, category, seller_id), reporter:profiles!reporter_id(display_name, username)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50)

      setReports((reportsData || []).map(r => {
        const listing = r.listings || {}
        const reporter = r.reporter || {}
        const hoursAgo = Math.floor((Date.now() - new Date(r.created_at).getTime()) / 3600000)
        const timeStr = hoursAgo < 1 ? 'Just now' : hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`
        return {
          id: r.id,
          listing_id: r.listing_id,
          listing: listing.title || 'Unknown listing',
          reporter: reporter.display_name || reporter.username || 'Anonymous',
          reason: r.reason,
          status: r.status,
          time: timeStr,
        }
      }))

      // Flagged listings: listings where flagged = true
      const { data: flaggedData } = await supabase
        .from('listings')
        .select('id, title, price, category, seller_id, profiles!seller_id(username)')
        .eq('flagged', true)
        .eq('status', 'active')
        .limit(50)

      if (flaggedData && flaggedData.length > 0) {
        setFlagged(flaggedData.map(l => ({
          id: l.id,
          title: l.title,
          price: l.price,
          category: l.category,
          seller: l.profiles?.username || l.seller_id,
          reason: 'Flagged for review',
        })))
      } else {
        // Fall back: derive from reports joined with listings
        const { data: reportedListings } = await supabase
          .from('reports')
          .select('listing_id, reason, listings(id, title, price, category, seller_id, profiles!seller_id(username))')
          .eq('status', 'pending')
          .limit(20)

        const seen = new Set()
        const derived = []
        for (const r of (reportedListings || [])) {
          const l = r.listings
          if (l && !seen.has(l.id)) {
            seen.add(l.id)
            derived.push({
              id: l.id,
              title: l.title,
              price: l.price,
              category: l.category,
              seller: l.profiles?.username || l.seller_id,
              reason: r.reason,
            })
          }
        }
        setFlagged(derived)
      }

      // Recent users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, email, username, plan, created_at, is_verified')
        .order('created_at', { ascending: false })
        .limit(10)

      // Get listing counts for recent users
      const userIds = (usersData || []).map(u => u.id)
      let listingCounts = {}
      if (userIds.length > 0) {
        const { data: lcData } = await supabase
          .from('listings')
          .select('seller_id')
          .in('seller_id', userIds)
        for (const row of (lcData || [])) {
          listingCounts[row.seller_id] = (listingCounts[row.seller_id] || 0) + 1
        }
      }

      setRecentUsers((usersData || []).map(u => {
        const daysAgo = Math.floor((Date.now() - new Date(u.created_at).getTime()) / 86400000)
        const joined = daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : daysAgo < 7 ? `${daysAgo} days ago` : `${Math.floor(daysAgo / 7)} week${Math.floor(daysAgo / 7) !== 1 ? 's' : ''} ago`
        return {
          id: u.id,
          email: u.email || u.username || u.id,
          plan: u.plan || 'free',
          listings: listingCounts[u.id] || 0,
          joined,
          verified: u.is_verified || false,
        }
      }))

      setLoading(false)
    }
    fetchAll()
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
        <Shield size={50} color="var(--muted)" style={{ marginBottom: 16, opacity: 0.3 }} />
        <h2 style={{ marginBottom: 8 }}>Admin only</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 24 }}>You don't have admin access.</p>
        <button className="btn-secondary" onClick={() => navigate('/')}>Go home</button>
      </div>
    )
  }

  const handleReport = async (id, action) => {
    const report = reports.find(r => r.id === id)
    setReports(r => r.filter(x => x.id !== id))
    if (action === 'remove' && report?.listing_id) {
      await supabase.from('listings').update({ status: 'removed' }).eq('id', report.listing_id)
      await supabase.from('reports').update({ status: 'resolved' }).eq('id', id)
      setFlagged(f => f.filter(x => x.id !== report.listing_id))
      toast.success('Listing removed')
    } else {
      await supabase.from('reports').update({ status: 'dismissed' }).eq('id', id)
      toast.success('Report dismissed')
    }
  }

  const handleRemoveListing = async (id) => {
    await supabase.from('listings').update({ status: 'removed' }).eq('id', id)
    setFlagged(f => f.filter(x => x.id !== id))
    toast.success('Listing removed from marketplace')
  }

  const TABS = [
    { id: 'overview',  label: 'Overview' },
    { id: 'reports',   label: `Reports ${reports.length > 0 ? `(${reports.length})` : ''}` },
    { id: 'listings',  label: 'Listings' },
    { id: 'users',     label: 'Users' },
  ]

  return (
    <div className="page">

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #635BFF, #007AFF)', padding: '22px 20px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Shield size={20} color="white" />
          <h2 style={{ color: 'white' }}>Admin dashboard</h2>
          <span style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 20, padding: '2px 10px', fontSize: 10, fontWeight: 700 }}>
            ⚡ ADMIN
          </span>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Sell Like Crazy control centre</p>
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: activeTab === t.id ? '#635BFF' : 'var(--muted)', borderBottom: `2px solid ${activeTab === t.id ? '#635BFF' : 'transparent'}`, whiteSpace: 'nowrap', marginBottom: -1 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div style={{ padding: 14 }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--muted)', padding: 20 }}>Loading stats...</p>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
                <StatBox icon={Users}    color="#635BFF" bg="#F0F0FF" label="Total users"    value={stats?.totalUsers ?? '—'}    sub={`+${stats?.newToday ?? 0} today`} />
                <StatBox icon={Package}  color="var(--red)" bg="#FFF0F3" label="Total listings" value={stats?.totalListings ?? '—'} sub={`${stats?.servicesListings ?? 0} services`} />
                <StatBox icon={DollarSign} color="var(--green)" bg="#E8F8EC" label="Revenue AUD"  value="—" sub="Subscriptions + listings" />
                <StatBox icon={Flag}     color="var(--orange)" bg="#FFF5F0" label="Pending reports" value={stats?.pendingReports ?? '—'} sub="Needs review" />
              </div>

              {/* Revenue breakdown */}
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TrendingUp size={16} color="#635BFF" /> Revenue breakdown
                </div>
                {[
                  { label: 'Annual plans ($50/yr)', amount: null, count: null },
                  { label: 'Per-listing fees ($1)', amount: null, count: null },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{r.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>—</div>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--green)' }}>—</div>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Quick actions</div>
                {[
                  { label: 'View all reports', sub: `${reports.length} pending`, icon: Flag, action: () => setActiveTab('reports') },
                  { label: 'Manage listings', sub: `${stats?.activeListings ?? 0} active`, icon: Package, action: () => setActiveTab('listings') },
                  { label: 'Manage users', sub: `${stats?.totalUsers ?? 0} total`, icon: Users, action: () => setActiveTab('users') },
                ].map(a => (
                  <button key={a.label} onClick={a.action}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                    <a.icon size={18} color="var(--muted)" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{a.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{a.sub}</div>
                    </div>
                    <ChevronRight size={16} color="var(--muted)" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Reports */}
      {activeTab === 'reports' && (
        <div>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--muted)', padding: 20 }}>Loading reports...</p>
          ) : reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--muted)' }}>
              <Check size={44} color="var(--green)" style={{ margin: '0 auto 12px' }} />
              <h3>All clear — no pending reports</h3>
            </div>
          ) : reports.map(r => (
            <div key={r.id} style={{ background: 'white', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{r.listing}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>
                    Reported by {r.reporter} · {r.time}
                  </div>
                  <span style={{ background: '#FFF0F3', color: 'var(--red)', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>{r.reason}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button onClick={() => handleReport(r.id, 'remove')}
                  style={{ flex: 1, background: 'var(--red)', color: 'white', border: 'none', borderRadius: 10, padding: '9px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Remove listing
                </button>
                <button onClick={() => handleReport(r.id, 'dismiss')}
                  style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--muted)' }}>
                  Dismiss
                </button>
                <button onClick={() => r.listing_id && navigate(`/listing/${r.listing_id}`)}
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 12px', cursor: 'pointer', color: 'var(--muted)' }}>
                  <Eye size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Listings */}
      {activeTab === 'listings' && (
        <div>
          <div style={{ padding: '10px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)' }}>
            Flagged listings requiring review
          </div>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--muted)', padding: 20 }}>Loading flagged listings...</p>
          ) : flagged.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
              <Check size={40} color="var(--green)" style={{ margin: '0 auto 12px' }} />
              <p>No flagged listings</p>
            </div>
          ) : flagged.map(l => (
            <div key={l.id} style={{ background: 'white', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{l.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{l.category} · ${l.price} · by {l.seller}</div>
                  <div style={{ fontSize: 11, color: 'var(--orange)', marginTop: 4 }}>⚠️ {l.reason}</div>
                </div>
                <button onClick={() => handleRemoveListing(l.id)}
                  style={{ background: '#FFF0F3', border: '1px solid #FFD0D8', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, fontFamily: 'inherit' }}>
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Users */}
      {activeTab === 'users' && (
        <div>
          <div style={{ padding: '10px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)' }}>
            Suspend or delete accounts that violate platform rules
          </div>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--muted)', padding: 20 }}>Loading users...</p>
          ) : recentUsers.map(u => (
            <div key={u.id} style={{ background: 'white', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--red), var(--orange))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                  {u.email[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                    {u.listings} listings · Joined {u.joined}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 20, background: u.plan === 'annual' ? '#FFF0F3' : 'var(--bg)', color: u.plan === 'annual' ? 'var(--red)' : 'var(--muted)', border: `1px solid ${u.plan === 'annual' ? '#FFD0D8' : 'var(--border)'}` }}>
                    {u.plan === 'annual' ? '⚡ Annual' : u.plan === 'per_listing' ? '$1/listing' : 'Free'}
                  </span>
                  {u.verified && <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 20, background: '#E8F8EC', color: '#1A7A30', border: '1px solid #D6FFE4' }}>✓ ID</span>}
                </div>
              </div>
              {/* Admin actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => navigate(`/admin/users/${u.id}/listings`)}
                  style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Eye size={13} /> View listings
                </button>
                <button onClick={async () => {
                  try {
                    await supabase.auth.admin.updateUserById(u.id, { ban_duration: '876600h' })
                  } catch {}
                  toast.success(`${u.email} suspended`)
                }}
                  style={{ flex: 1, background: '#FFF9E6', border: '1px solid #FFD080', borderRadius: 10, padding: '8px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: '#CC6600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <Ban size={13} /> Suspend
                </button>
                <button onClick={async () => {
                  if (!window.confirm(`Permanently delete ${u.email}? This cannot be undone.`)) return
                  try {
                    await supabase.auth.admin.deleteUser(u.id)
                  } catch {}
                  toast.success(`${u.email} deleted`)
                }}
                  style={{ background: '#FFF0F3', border: '1px solid #FFD0D8', borderRadius: 10, padding: '8px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
