import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

/**
 * SmartBanner
 * Shows when someone lands on a listing from a shared link
 * Detects if they came from outside the app (referrer check)
 * Dismissible — remembers dismissal in sessionStorage
 */
export default function SmartBanner() {
  const [visible, setVisible] = useState(false)
  const [platform, setPlatform] = useState('web') // ios | android | web

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem('slc-banner-dismissed')) return

    // Detect platform
    const ua = navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(ua)) setPlatform('ios')
    else if (/android/.test(ua)) setPlatform('android')
    else setPlatform('web')

    // Show after short delay so page loads first
    const timer = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    sessionStorage.setItem('slc-banner-dismissed', '1')
    setVisible(false)
  }

  const handleGet = () => {
    if (platform === 'ios') {
      // Replace with your App Store URL when live
      window.open('https://apps.apple.com/app/sell-like-crazy/YOUR_APP_ID', '_blank')
    } else if (platform === 'android') {
      // Replace with your Play Store URL when live
      window.open('https://play.google.com/store/apps/details?id=app.selllikecrazy', '_blank')
    } else {
      // PWA install — scroll to top and show install prompt
      window.scrollTo({ top: 0, behavior: 'smooth' })
      // Trigger PWA install if available
      if (window._pwaInstallPrompt) {
        window._pwaInstallPrompt.prompt()
      } else {
        // Fallback — go to landing page
        window.location.href = '/welcome'
      }
    }
    handleDismiss()
  }

  if (!visible) return null

  const storeLabel = platform === 'ios'
    ? 'App Store'
    : platform === 'android'
    ? 'Google Play'
    : 'Add to home screen'

  const storeIcon = platform === 'ios' ? '🍎' : platform === 'android' ? '▶️' : '📲'

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 430,
      zIndex: 500,
      padding: '0 0 env(safe-area-inset-bottom)',
      animation: 'slideUp 0.3s ease-out',
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(100%); }
          to   { transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <div style={{
        background: 'white',
        borderTop: '1px solid var(--border)',
        borderRadius: '20px 20px 0 0',
        padding: '14px 16px 20px',
        boxShadow: '0 -8px 30px rgba(0,0,0,0.12)',
      }}>
        {/* Dismiss handle */}
        <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 14px' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

          {/* Logo */}
          <div style={{
            width: 52, height: 52, borderRadius: 14, overflow: 'hidden',
            background: 'linear-gradient(135deg, var(--red), var(--orange))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: '0 4px 12px rgba(255,45,85,0.3)',
          }}>
            <img src="/logo.png" alt="Sell Like Crazy"
              style={{ width: 48, height: 48, objectFit: 'contain' }}
              onError={e => { e.target.style.display = 'none'; e.target.parentNode.textContent = '⚡' }} />
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
              Sell Like Crazy
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
              Buy &amp; sell anything — free to download
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1,2,3,4,5].map(i => (
                <span key={i} style={{ color: '#FFD000', fontSize: 11 }}>★</span>
              ))}
              <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 2 }}>Free</span>
            </div>
          </div>

          {/* Dismiss */}
          <button onClick={handleDismiss}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4, flexShrink: 0 }}>
            <X size={18} />
          </button>
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button onClick={handleDismiss}
            style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '11px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--muted)' }}>
            Continue in browser
          </button>
          <button onClick={handleGet}
            style={{ flex: 1, background: 'linear-gradient(135deg, var(--red), var(--orange))', color: 'white', border: 'none', borderRadius: 12, padding: '11px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 12px rgba(255,45,85,0.3)' }}>
            {storeIcon} Get the app
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--muted)', marginTop: 10 }}>
          {storeIcon} Available on {storeLabel} · Free · Everything sells here ⚡
        </p>
      </div>
    </div>
  )
}
