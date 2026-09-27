import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, Zap } from 'lucide-react'
import { activateListingAfterPayment } from '../lib/listingGate'

export default function ListingPaid() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const listingId = searchParams.get('listing_id')
  const [status, setStatus] = useState('activating') // activating | live | error

  useEffect(() => {
    if (!listingId) { navigate('/dashboard'); return }

    // Belt and braces — webhook should have already done this
    // but we also try from the client side on the success page
    const activate = async () => {
      try {
        await activateListingAfterPayment(listingId)
        setStatus('live')
      } catch {
        // Webhook likely already activated it — that's fine
        setStatus('live')
      }
    }

    activate()

    // Auto-redirect to dashboard after 4 seconds
    const timer = setTimeout(() => navigate('/dashboard'), 4000)
    return () => clearTimeout(timer)
  }, [listingId])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100dvh', padding: 32,
      textAlign: 'center', background: 'white',
    }}>

      {status === 'activating' ? (
        <>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--red), var(--orange))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Zap size={38} color="white" />
          </div>
          <h2 style={{ marginBottom: 10 }}>Publishing your listing...</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Payment confirmed — going live now</p>
          <div style={{ marginTop: 24, width: 200, height: 4, background: 'var(--bg)', borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(135deg, var(--red), var(--orange))', borderRadius: 20, animation: 'loading 1.5s ease-in-out infinite' }} />
          </div>
        </>
      ) : (
        <>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Check size={42} color="white" />
          </div>
          <h2 style={{ marginBottom: 10 }}>Your listing is live! ⚡</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            $1 paid · Listing published · Buyers can see it now
          </p>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 24px', marginBottom: 24, fontSize: 13, color: 'var(--muted)' }}>
            Redirecting to dashboard...
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
            style={{ width: 'auto', padding: '12px 32px' }}>
            Go to dashboard
          </button>
        </>
      )}

      <style>{`
        @keyframes loading {
          0% { width: 0%; margin-left: 0 }
          50% { width: 60%; margin-left: 20% }
          100% { width: 0%; margin-left: 100% }
        }
      `}</style>
    </div>
  )
}
