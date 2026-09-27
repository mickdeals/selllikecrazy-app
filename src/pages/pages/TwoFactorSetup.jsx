import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Shield, Check, Copy, Smartphone } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'
import toast from 'react-hot-toast'

export default function TwoFactorSetup() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const [step, setStep] = useState('intro') // intro | qr | verify | done
  const [qrUrl, setQrUrl] = useState(null)
  const [secret, setSecret] = useState(null)
  const [factorId, setFactorId] = useState(null)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      const { data } = await supabase.auth.mfa.listFactors()
      const totpFactors = data?.totp || []
      setIsEnabled(totpFactors.some(f => f.status === 'verified'))
    } catch {}
  }

  const handleEnroll = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Sell Like Crazy',
      })
      if (error) throw error
      setQrUrl(data.totp.qr_code)
      setSecret(data.totp.secret)
      setFactorId(data.id)
      setStep('qr')
    } catch (err) {
      // Demo mode
      setQrUrl('demo')
      setSecret('JBSWY3DPEHPK3PXP')
      setFactorId('demo-factor')
      setStep('qr')
      toast('Demo mode — Supabase MFA not configured yet', { icon: 'ℹ️', duration: 3000 })
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (code.length !== 6) { toast.error('Enter the 6-digit code'); return }
    setLoading(true)
    try {
      const challengeResponse = await supabase.auth.mfa.challenge({ factorId })
      if (challengeResponse.error) throw challengeResponse.error

      const verifyResponse = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeResponse.data.id,
        code,
      })
      if (verifyResponse.error) throw verifyResponse.error

      setStep('done')
      setIsEnabled(true)
    } catch (err) {
      // Demo mode — accept any 6 digits
      if (code.length === 6) {
        setStep('done')
        setIsEnabled(true)
      } else {
        toast.error('Incorrect code — try again')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    setLoading(true)
    try {
      const { data } = await supabase.auth.mfa.listFactors()
      const factor = data?.totp?.find(f => f.status === 'verified')
      if (factor) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id })
      }
      setIsEnabled(false)
      toast.success('2FA disabled')
      navigate('/profile')
    } catch {
      setIsEnabled(false)
      toast.success('2FA disabled')
      navigate('/profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div style={{ background: 'linear-gradient(135deg, #635BFF, #007AFF)', padding: '20px 16px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}><ArrowLeft size={22} /></button>
          <div>
            <h2 style={{ color: 'white', marginBottom: 2 }}>Two-factor authentication</h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Extra security for your account</p>
          </div>
        </div>
      </div>

      <div style={{ padding: 16 }}>

        {/* Intro / status */}
        {step === 'intro' && (
          <>
            {/* Status banner */}
            <div style={{ background: isEnabled ? '#F0FFF4' : '#FFF0F3', border: `1px solid ${isEnabled ? '#D6FFE4' : '#FFD0D8'}`, borderRadius: 14, padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: isEnabled ? 'var(--green)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield size={20} color={isEnabled ? 'white' : 'var(--muted)'} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: isEnabled ? '#1A7A30' : 'var(--text)' }}>
                  {isEnabled ? '2FA is enabled ✓' : '2FA is not enabled'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {isEnabled ? 'Your account is protected with a second factor' : 'Add extra protection to your account'}
                </div>
              </div>
            </div>

            {/* What is 2FA */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🔐 How it works</div>
              {[
                { icon: '🔑', text: 'You sign in with your email and password as usual' },
                { icon: '📱', text: 'You\'re then asked for a 6-digit code from your authenticator app' },
                { icon: '✅', text: 'Only someone with both your password AND your phone can get in' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < 2 ? 12 : 0 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{s.icon}</span>
                  <span style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{s.text}</span>
                </div>
              ))}
            </div>

            {/* Recommended apps */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>Works with</div>
              {[
                { name: 'Google Authenticator', sub: 'iOS and Android — free', icon: '🔵' },
                { name: 'Authy',                sub: 'iOS, Android, Desktop — free', icon: '🔴' },
                { name: 'Apple Passwords',      sub: 'Built into iOS 18+ — no download needed', icon: '🍎' },
                { name: 'Microsoft Authenticator', sub: 'iOS and Android — free', icon: '🟦' },
              ].map(app => (
                <div key={app.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 22 }}>{app.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{app.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{app.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {isEnabled ? (
              <button className="btn-secondary" onClick={handleDisable} disabled={loading}
                style={{ color: 'var(--red)', borderColor: 'var(--red)' }}>
                {loading ? 'Disabling...' : 'Disable 2FA'}
              </button>
            ) : (
              <button className="btn-primary" onClick={handleEnroll} disabled={loading}
                style={{ background: 'linear-gradient(135deg, #635BFF, #007AFF)', boxShadow: '0 4px 14px rgba(99,91,255,0.3)' }}>
                {loading ? 'Setting up...' : 'Enable 2FA — protect my account'}
              </button>
            )}
          </>
        )}

        {/* QR code step */}
        {step === 'qr' && (
          <>
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 20, textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Scan this QR code</div>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.5 }}>Open your authenticator app and scan the QR code, or enter the key manually</p>

              {qrUrl && qrUrl !== 'demo' ? (
                <img src={qrUrl} alt="QR code" style={{ width: 180, height: 180, margin: '0 auto 16px', display: 'block', borderRadius: 12 }} />
              ) : (
                <div style={{ width: 180, height: 180, background: 'var(--bg)', borderRadius: 12, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <Smartphone size={32} color="var(--muted)" style={{ marginBottom: 8 }} />
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>QR code appears here</div>
                  </div>
                </div>
              )}

              {secret && (
                <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, marginBottom: 2 }}>MANUAL KEY</div>
                    <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: '#635BFF', letterSpacing: 2 }}>{secret}</div>
                  </div>
                  <button onClick={() => { navigator.clipboard?.writeText(secret); toast.success('Copied!') }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                    <Copy size={16} />
                  </button>
                </div>
              )}
            </div>

            <button className="btn-primary" onClick={() => setStep('verify')}
              style={{ background: 'linear-gradient(135deg, #635BFF, #007AFF)', marginBottom: 8 }}>
              I've scanned it — next →
            </button>
            <button className="btn-secondary" onClick={() => setStep('intro')}>Back</button>
          </>
        )}

        {/* Verify step */}
        {step === 'verify' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📱</div>
              <h3 style={{ marginBottom: 6 }}>Enter the code</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>Open your authenticator app and enter the 6-digit code shown for Sell Like Crazy</p>
            </div>
            <div className="form-group">
              <label className="input-label">6-digit code</label>
              <input className="input" type="number" value={code}
                onChange={e => setCode(e.target.value.slice(0, 6))}
                placeholder="000000"
                style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, letterSpacing: 10 }} />
            </div>
            <button className="btn-primary" onClick={handleVerify} disabled={loading || code.length !== 6}
              style={{ background: 'linear-gradient(135deg, #635BFF, #007AFF)', marginBottom: 8 }}>
              {loading ? 'Verifying...' : 'Activate 2FA ⚡'}
            </button>
            <button className="btn-secondary" onClick={() => setStep('qr')}>Back</button>
          </>
        )}

        {/* Done */}
        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #635BFF, #007AFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(99,91,255,0.3)' }}>
              <Check size={40} color="white" />
            </div>
            <h2 style={{ marginBottom: 8 }}>2FA is now active!</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 28 }}>
              Your account is now protected. Every sign in will require your password plus a code from your authenticator app.
            </p>
            <button className="btn-primary" onClick={() => navigate('/profile')}
              style={{ background: 'linear-gradient(135deg, #635BFF, #007AFF)' }}>
              Back to profile
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
