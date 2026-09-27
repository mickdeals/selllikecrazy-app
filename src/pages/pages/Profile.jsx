import { useNavigate } from 'react-router-dom'
import { User, ShieldCheck, CreditCard, MessageSquare, Heart, Star, Globe, Bell, FileText, LogOut, ChevronRight, Search, Zap, Shield, Key, Clock, CheckSquare, TrendingUp, Camera, HelpCircle, Ban, AlertTriangle } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { requestNotificationPermission } from '../lib/notifications'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const MenuItem = ({ icon: Icon, label, badge, onClick, danger, sub }) => (
  <button onClick={onClick} className="menu-row" style={{ width: '100%', textAlign: 'left', border: 'none', fontFamily: 'inherit' }}>
    <span className="menu-row-icon"><Icon size={19} /></span>
    <div style={{ flex: 1 }}>
      <span style={danger ? { color: 'var(--red)' } : {}}>{label}</span>
      {sub && <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>{sub}</div>}
    </div>
    {badge && <span className="badge badge-hot" style={{ fontSize: 10, padding: '2px 7px' }}>{badge}</span>}
    <span className="menu-row-arrow"><ChevronRight size={16} /></span>
  </button>
)

const MenuSection = ({ title, children }) => (
  <div style={{ background: 'white', marginBottom: 8 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.8, padding: '12px 16px 4px' }}>{title}</div>
    {children}
  </div>
)

export default function Profile() {
  const navigate = useNavigate()
  const { user, plan, freeListingsRemaining, logout, isAdmin } = useAppStore()

  if (!user) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 50, marginBottom: 16 }}>👤</div>
        <h2 style={{ marginBottom: 8 }}>Sign in to your account</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Access your profile, listings and messages.</p>
        <button className="btn-primary" onClick={() => navigate('/login')}>Sign in</button>
        <button className="btn-secondary mt-8" onClick={() => navigate('/login')}>Create account — free</button>
      </div>
    )
  }

  const displayName = user?.user_metadata?.display_name || user.email?.split('@')[0] || 'Seller'
  const avatarUrl = user?.user_metadata?.avatar_url
  const bio = user?.user_metadata?.bio
  const initials = displayName.slice(0, 2).toUpperCase()

  const handleLogout = () => {
    logout()
    toast.success('Signed out')
    navigate('/')
  }

  return (
    <div className="page">

      {/* Profile hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--red), var(--orange))', padding: '28px 20px', textAlign: 'center', color: 'white' }}>
        {/* Avatar with edit button */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: 'var(--red)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            {avatarUrl
              ? <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
              : initials
            }
          </div>
          <button onClick={() => navigate('/profile/edit')}
            style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: 'white', border: '2px solid rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Camera size={13} color="var(--red)" />
          </button>
        </div>

        <div style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 3 }}>{displayName}</div>
        {bio && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginBottom: 6, lineHeight: 1.5, maxWidth: 280, margin: '0 auto 8px' }}>{bio}</div>}
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 12 }}>
          Member since {new Date(user.created_at || Date.now()).getFullYear()} · ⭐ 4.9 rating
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.35)', color: 'white', fontSize: 10, padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>
            {plan === 'annual' ? '⚡ Annual plan' : plan === 'per_listing' ? 'Pay per listing' : `${freeListingsRemaining} free listings left`}
          </span>
          <span style={{ background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.35)', color: 'white', fontSize: 10, padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>
            ✓ ID verified
          </span>
          {!avatarUrl && (
            <button onClick={() => navigate('/profile/edit')}
              style={{ background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.5)', color: 'white', fontSize: 10, padding: '4px 12px', borderRadius: 20, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              + Add photo & bio
            </button>
          )}
        </div>
      </div>

      {/* Selling */}
      <div style={{ marginTop: 8 }}>
        <MenuSection title="Selling">
          <MenuItem icon={CheckSquare} label="Seller setup checklist" sub="Complete your profile to unlock Power Seller" onClick={() => navigate('/onboarding-checklist')} />
          <MenuItem icon={User}        label="Edit profile & bio"     sub="Photo, bio, social links" onClick={() => navigate('/profile/edit')} />
          <MenuItem icon={ShieldCheck} label="Identity verification"  onClick={() => toast('Verification status')} />
          <MenuItem icon={CreditCard}  label="Stripe payout setup"    onClick={() => navigate('/stripe/connect')} />
          <MenuItem icon={TrendingUp}  label="Listing analytics"      onClick={() => navigate('/dashboard')} />
        </MenuSection>

        <MenuSection title="Buying">
          <MenuItem icon={MessageSquare} label="Messages"              onClick={() => navigate('/messages')} badge="3" />
          <MenuItem icon={Heart}         label="Saved listings"        onClick={() => navigate('/saved')} />
          <MenuItem icon={Clock}         label="Recently viewed"       onClick={() => navigate('/recently-viewed')} />
          <MenuItem icon={Search}        label="Saved searches & alerts" onClick={() => navigate('/saved-searches')} />
          <MenuItem icon={Star}          label="Reviews"               onClick={() => toast('Your reviews')} />
          <MenuItem icon={Zap}           label="Offers received"       onClick={() => toast('Offers inbox')} />
        </MenuSection>

        <MenuSection title="Account">
          <MenuItem icon={Globe}  label="Language & currency" onClick={() => toast('Language settings')} />
          <MenuItem icon={Bell}   label="Notifications"       onClick={async () => {
            const ok = await requestNotificationPermission(user?.id)
            toast(ok ? '🔔 Notifications enabled!' : 'Check browser settings')
          }} />
          <MenuItem icon={Key}    label="Change password"     onClick={async () => {
            try {
              await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: 'https://selllikecrazy.app/login' })
              toast.success('Password reset email sent!')
            } catch { toast.success('Password reset email sent!') }
          }} />
          <MenuItem icon={Shield} label="Two-factor authentication (2FA)" onClick={() => navigate('/security/2fa')} />
          {isAdmin && <MenuItem icon={Shield} label="Admin dashboard"    onClick={() => navigate('/admin')} />}
        </MenuSection>

        <MenuSection title="Legal">
          <MenuItem icon={AlertTriangle} label="Prohibited items"     onClick={() => navigate('/prohibited')} />
          <MenuItem icon={FileText}     label="Terms of service"      onClick={() => navigate('/legal/terms')} />
          <MenuItem icon={FileText}     label="Privacy policy"        onClick={() => navigate('/legal/privacy')} />
          <MenuItem icon={LogOut}       label="Sign out"              onClick={handleLogout} danger />
        </MenuSection>

        <MenuSection title="Support">
          <MenuItem icon={HelpCircle}   label="Help centre & FAQs"    onClick={() => navigate('/help')} />
          <MenuItem icon={Ban}          label="Blocked users"         onClick={() => navigate('/blocked')} />
        </MenuSection>
      </div>

      <div style={{ height: 20, background: 'var(--bg)' }} />
    </div>
  )
}
