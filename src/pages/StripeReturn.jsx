import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'

// Stripe redirects here after seller completes onboarding
export default function StripeReturn() {
  const navigate = useNavigate()

  useEffect(() => {
    // Auto-redirect to connect page with success flag after 3 seconds
    const timer = setTimeout(() => {
      navigate('/stripe/connect?setup=complete')
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: 32, textAlign: 'center', background: 'white' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--red), var(--orange))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, animation: 'pulse 1s ease-in-out' }}>
        <Check size={38} color="white" />
      </div>
      <h2 style={{ marginBottom: 10 }}>Stripe setup complete!</h2>
      <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
        Your account is being verified. Redirecting you back...
      </p>
      <style>{`@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }`}</style>
    </div>
  )
}
