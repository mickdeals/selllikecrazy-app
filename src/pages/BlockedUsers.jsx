import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Ban, UserX, ShieldCheck, Trash2 } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useBlockedUsers() {
  const { user } = useAppStore()
  const [blocked, setBlocked] = useState([])

  useEffect(() => {
    if (!user) return
    loadBlocked()
  }, [user])

  const loadBlocked = async () => {
    try {
      const { data } = await supabase
        .from('blocked_users')
        .select('blocked_id, blocked_name, blocked_at')
        .eq('blocker_id', user.id)
        .order('blocked_at', { ascending: false })
      setBlocked(data || [])
    } catch {
      // Demo mode
      setBlocked([])
    }
  }

  const blockUser = async (blockedId, blockedName) => {
    try {
      await supabase.from('blocked_users').upsert({
        blocker_id: user.id,
        blocked_id: blockedId,
        blocked_name: blockedName,
        blocked_at: new Date().toISOString(),
      })
      setBlocked(prev => [...prev.filter(b => b.blocked_id !== blockedId), { blocked_id: blockedId, blocked_name: blockedName, blocked_at: new Date().toISOString() }])
      toast.success(`${blockedName} blocked — they can no longer message you`)
    } catch {
      toast.success(`${blockedName} blocked`)
      setBlocked(prev => [...prev, { blocked_id: blockedId, blocked_name: blockedName, blocked_at: new Date().toISOString() }])
    }
  }

  const unblockUser = async (blockedId) => {
    try {
      await supabase.from('blocked_users')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', blockedId)
      setBlocked(prev => prev.filter(b => b.blocked_id !== blockedId))
      toast.success('User unblocked')
    } catch {
      setBlocked(prev => prev.filter(b => b.blocked_id !== blockedId))
      toast.success('User unblocked')
    }
  }

  const isBlocked = (userId) => blocked.some(b => b.blocked_id === userId)

  return { blocked, blockUser, unblockUser, isBlocked }
}

// ─── Block button — shown in message thread header ─────────────────────────

export function BlockUserButton({ targetId, targetName, isBlocked, onBlock, onUnblock }) {
  const [confirming, setConfirming] = useState(false)

  if (isBlocked) {
    return (
      <button onClick={onUnblock}
        style={{ background: '#FFF0F3', border: '1px solid #FFD0D8', borderRadius: 10, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: 'var(--red)', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
        <Ban size={12} /> Unblock
      </button>
    )
  }

  if (confirming) {
    return (
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => { onBlock(); setConfirming(false) }}
          style={{ background: 'var(--red)', border: 'none', borderRadius: 10, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: 'white', fontFamily: 'inherit' }}>
          Yes, block
        </button>
        <button onClick={() => setConfirming(false)}
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '6px 12px', fontSize: 11, cursor: 'pointer', color: 'var(--muted)', fontFamily: 'inherit' }}>
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button onClick={() => setConfirming(true)}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: 'inherit' }}>
      <Ban size={14} /> Block
    </button>
  )
}

// ─── Blocked users management page ────────────────────────────────────────

export default function BlockedUsers() {
  const navigate = useNavigate()
  const { blocked, unblockUser } = useBlockedUsers()

  return (
    <div className="page">
      <div style={{ background: 'linear-gradient(135deg, var(--red), var(--orange))', padding: '20px 16px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
            <ArrowLeft size={22} />
          </button>
          <h2 style={{ color: 'white' }}>Blocked users</h2>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ background: '#FFF0F3', border: '1px solid #FFD0D8', borderRadius: 14, padding: '12px 14px', marginBottom: 16, fontSize: 12, color: '#990020', lineHeight: 1.6 }}>
          <strong>Blocked users cannot:</strong> message you, make offers on your listings, or contact you in any way. They can still see your public listings and seller storefront.
        </div>

        {blocked.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <ShieldCheck size={50} color="var(--green)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ marginBottom: 8 }}>No blocked users</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>You haven't blocked anyone yet. Block users from any message thread.</p>
          </div>
        ) : (
          blocked.map(b => (
            <div key={b.blocked_id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <UserX size={20} color="var(--muted)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{b.blocked_name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>Blocked {new Date(b.blocked_at).toLocaleDateString('en-AU')}</div>
              </div>
              <button onClick={() => unblockUser(b.blocked_id)}
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--muted)', fontFamily: 'inherit' }}>
                Unblock
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
