import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Check, Shield } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'
import toast from 'react-hot-toast'

// Social login button component
function SocialBtn({ provider, icon, label, color, bg, border, onClick }) {
  return (
    <button onClick={onClick}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: bg, border: `1.5px solid ${border}`, borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10, transition: 'opacity 0.15s' }}
      onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
      onMouseOut={e => e.currentTarget.style.opacity = '1'}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color, flex: 1, textAlign: 'left' }}>{label}</span>
    </button>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const { setUser, setSession, setIsAdmin } = useAppStore()

  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [ageError, setAgeError] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)

  // 2FA state
  const [show2FA, setShow2FA] = useState(false)
  const [tfaCode, setTfaCode] = useState('')
  const [tfaLoading, setTfaLoading] = useState(false)

  const finaliseLogin = async (user, session, isNew) => {
    setUser(user)
    if (session) setSession(session)
    try {
      const { data: profile } = await supabase
        .from('profiles').select('is_admin').eq('id', user.id).single()
      setIsAdmin(profile?.is_admin === true)
      if (isNew) {
        await supabase.from('profiles')
          .update({ age_confirmed: true, age_confirmed_at: new Date().toISOString() })
          .eq('id', user.id).catch(() => {})
      }
    } catch { setIsAdmin(false) }
    toast.success(isNew ? 'Welcome! 10 free listings awaiting ⚡' : 'Welcome back! ⚡')
    navigate(isNew ? '/onboarding' : '/')
  }

  // Social login — Google / Apple / Facebook
  const handleSocial = async (provider) => {
    if (mode === 'signup' && !ageConfirmed) {
      setAgeError(true)
      toast.error('Please confirm you are 18 or over first')
      return
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: provider === 'google' ? { access_type: 'offline', prompt: 'consent' } : undefined,
        },
      })
      if (error) throw error
      // OAuth redirects — no further action needed here
    } catch (err) {
      // Demo mode
      toast(`${provider} login — connect Supabase OAuth to enable`, { icon: 'ℹ️', duration: 3000 })
      const demoUser = { id: 'demo-' + provider, email: `demo@${provider}.com`, created_at: new Date().toISOString() }
      setUser(demoUser)
      setIsAdmin(false)
      navigate(mode === 'signup' ? '/onboarding' : '/')
    }
  }

  // Email + password login
  const handleEmailSubmit = async () => {
    if (!email || !password) { toast.error('Enter email and password'); return }
    if (mode === 'signup' && !ageConfirmed) { setAgeError(true); toast.error('You must be 18 or over'); return }
    setAgeError(false)
    setLoading(true)
    try {
      let result
      if (mode === 'login') {
        result = await supabase.auth.signInWithPassword({ email, password })
      } else {
        result = await supabase.auth.signUp({ email, password })
      }
      const { data, error } = result
      if (error) throw error

      // Check if 2FA is required
      if (data?.session?.user?.factors?.length > 0) {
        setShow2FA(true)
        setLoading(false)
        return
      }

      if (data.user) {
        await finaliseLogin(data.user, data.session, mode === 'signup')
      }
    } catch (err) {
      console.error('Login error:', err)
      // Only use demo mode if it's clearly a network/config issue
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.message?.includes('Load failed')) {
        const demoUser = { id: 'demo-user', email, created_at: new Date().toISOString() }
        const adminEmails = ['sales@aussietoys.au', 'michael@selllikecrazy.app']
        setUser(demoUser)
        setIsAdmin(adminEmails.includes(email.toLowerCase()))
        toast.success(mode === 'signup' ? 'Welcome! 10 free listings awaiting ⚡' : 'Welcome back! ⚡')
        navigate(mode === 'signup' ? '/onboarding' : '/')
      } else {
        toast.error(err.message || 'Login failed — please try again')
      }
    } finally {
      setLoading(false)
    }
  }

  // 2FA verification
  const handle2FA = async () => {
    if (tfaCode.length !== 6) { toast.error('Enter the 6-digit code'); return }
    setTfaLoading(true)
    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: (await supabase.auth.mfa.listFactors()).data?.totp?.[0]?.id,
        code: tfaCode,
      })
      if (error) throw error
      await finaliseLogin(data.user, data.session, false)
    } catch (err) {
      toast.error('Incorrect code — try again')
    } finally {
      setTfaLoading(false)
    }
  }

  // 2FA screen
  if (show2FA) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: 'white' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--red), var(--orange))', padding: '40px 20px 50px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, background: 'white', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
            <Shield size={32} color="var(--red)" />
          </div>
          <h1 style={{ color: 'white', fontSize: 22, marginBottom: 6 }}>Two-factor verification</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>Enter the code from your authenticator app</p>
        </div>
        <div style={{ flex: 1, padding: '0 20px 24px', marginTop: -20 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
            <div className="form-group">
              <label className="input-label">6-digit code</label>
              <input className="input" type="number" value={tfaCode}
                onChange={e => setTfaCode(e.target.value.slice(0, 6))}
                placeholder="000000"
                style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, letterSpacing: 10 }} />
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>Open Google Authenticator, Authy or Apple Passwords to get your code</p>
            </div>
            <button className="btn-primary" onClick={handle2FA} disabled={tfaLoading || tfaCode.length !== 6}>
              {tfaLoading ? 'Verifying...' : 'Verify and sign in ⚡'}
            </button>
            <button className="btn-secondary mt-8" onClick={() => setShow2FA(false)}>Back</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: 'white' }}>

      {/* Top gradient */}
      <div style={{ background: 'linear-gradient(135deg, var(--red), var(--orange))', padding: '40px 20px 50px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, background: 'white', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          <img src="/logo.png" alt="Sell Like Crazy" style={{ width: 58, height: 58, objectFit: 'contain' }}
            onError={e => { e.target.style.display = 'none'; e.target.parentNode.textContent = '⚡' }} />
        </div>
        <h1 style={{ color: 'white', fontSize: 24, marginBottom: 6 }}>Sell Like Crazy</h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>Everything sells here.</p>
      </div>

      <div style={{ flex: 1, padding: '0 20px 24px', marginTop: -20 }}>
        <div style={{ background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.1)', marginBottom: 16 }}>

          {/* Mode toggle */}
          <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 12, padding: 4, marginBottom: 24 }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setShowEmailForm(false) }}
                style={{ flex: 1, padding: '9px 0', borderRadius: 9, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: mode === m ? 'white' : 'transparent', color: mode === m ? 'var(--red)' : 'var(--muted)', boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}>
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {/* Age check — signup only, shown before social buttons */}
          {mode === 'signup' && (
            <div onClick={() => { setAgeConfirmed(a => !a); setAgeError(false) }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: ageError ? '#FFF0F3' : ageConfirmed ? '#F0FFF4' : 'var(--bg)', border: `1.5px solid ${ageError ? 'var(--red)' : ageConfirmed ? 'var(--green)' : 'var(--border)'}`, borderRadius: 12, cursor: 'pointer', marginBottom: 20 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${ageError ? 'var(--red)' : ageConfirmed ? 'var(--green)' : 'var(--border)'}`, background: ageConfirmed ? 'var(--green)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                {ageConfirmed && <Check size={13} color="white" strokeWidth={3} />}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: ageError ? 'var(--red)' : 'var(--text)', marginBottom: 2 }}>
                  I confirm I am 18 years of age or older
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
                  Sell Like Crazy is an 18+ platform. You must be an adult to buy, sell or use this marketplace.
                </div>
              </div>
            </div>
          )}

          {/* Social login buttons */}
          <SocialBtn provider="google"   icon="🔵" label={`${mode === 'signup' ? 'Sign up' : 'Sign in'} with Google`}   color="#1A1A2E" bg="white"     border="#E0E0E0" onClick={() => handleSocial('google')} />
          <SocialBtn provider="apple"    icon="🍎" label={`${mode === 'signup' ? 'Sign up' : 'Sign in'} with Apple`}    color="white"   bg="#0A0A0F"  border="#0A0A0F" onClick={() => handleSocial('apple')} />
          <SocialBtn provider="facebook" icon="📘" label={`${mode === 'signup' ? 'Sign up' : 'Sign in'} with Facebook`} color="white"   bg="#1877F2"  border="#1877F2" onClick={() => handleSocial('facebook')} />

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0 16px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>or use email</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Email form — collapsed by default */}
          {!showEmailForm ? (
            <button onClick={() => setShowEmailForm(true)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
              <Mail size={20} color="var(--muted)" />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{mode === 'signup' ? 'Sign up' : 'Sign in'} with email</span>
            </button>
          ) : (
            <>
              <div className="form-group">
                <label className="input-label">Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                  <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@email.com" style={{ paddingLeft: 38 }} autoFocus />
                </div>
              </div>
              <div className="form-group">
                <label className="input-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                  <input className="input" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" style={{ paddingLeft: 38, paddingRight: 38 }} />
                  <button onClick={() => setShowPw(s => !s)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button className="btn-primary" onClick={handleEmailSubmit} disabled={loading} style={{ marginTop: 4 }}>
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign in ⚡' : 'Create account — free ⚡'}
              </button>
            </>
          )}

          {mode === 'signup' && (
            <div style={{ marginTop: 14, background: '#FFF9E6', border: '1px solid var(--yellow)', borderRadius: 10, padding: '10px 12px', fontSize: 11, color: '#664400' }}>
              🎁 Sign up free and get:
              <div style={{ marginTop: 5, lineHeight: 1.8 }}>
                ✓ <strong>10 free item listings</strong> · ✓ <strong>1 free service listing</strong><br />
                ✓ AI listing tool · ✓ Seller checklist · ✓ Per-listing analytics<br />
                ✓ Price drop alerts · ✓ Recently viewed · ✓ Geo-filtered services
              </div>
            </div>
          )}
        </div>

        {mode === 'login' && showEmailForm && (
          <button onClick={async () => {
            if (!email) { toast.error('Enter your email first'); return }
            try {
              await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login` })
            } catch {}
            toast.success('Password reset email sent!')
          }}
            style={{ width: '100%', background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, cursor: 'pointer', textAlign: 'center', padding: '8px 0' }}>
            Forgot password?
          </button>
        )}

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', marginTop: 16, lineHeight: 1.6 }}>
          By continuing you agree to our{' '}
          <span onClick={() => navigate('/legal/terms')} style={{ color: 'var(--red)', cursor: 'pointer', textDecoration: 'underline' }}>Terms of Service</span>
          {' '}and{' '}
          <span onClick={() => navigate('/legal/privacy')} style={{ color: 'var(--red)', cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</span>.
          {' '}18+ platform only.
        </p>
      </div>
    </div>
  )
}
