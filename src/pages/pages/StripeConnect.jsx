import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CreditCard, Check, AlertCircle, ExternalLink, Zap, DollarSign, Shield, Clock } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { createSellerStripeAccount, checkSellerStripeStatus } from '../lib/stripeConnect'
import toast from 'react-hot-toast'

function StatusRow({ icon: Icon, title, sub, done, pending }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: done ? '#E8F8EC' : pending ? '#FFF3E0' : 'var(--bg)' }}>
        <Icon size={15} color={done ? 'var(--green)' : pending ? '#FF9500' : 'var(--muted)'} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{sub}</div>
      </div>
      {done && <Check size={16} color="var(--green)" />}
      {pending && <Clock size={16} color="#FF9500" />}
    </div>
  )
}

export default function StripeConnect() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAppStore()

  const [status, setStatus] = useState('idle') // idle | loading | connected | pending
  const [connectReady, setConnectReady] = useState(false)

  // Check if returning from Stripe onboarding
  useEffect(() => {
    const returned = searchParams.get('setup') === 'complete'
    if (returned) {
      setStatus('pending')
      toast.success('Stripe setup submitted! We\'re verifying your account.')
      // In production, poll checkSellerStripeStatus here
    }
  }, [searchParams])

  const handleConnect = async () => {
    if (!user) { navigate('/login'); return }
    setStatus('loading')
    try {
      const { onboardingUrl } = await createSellerStripeAccount(user.id, user.email)
      // Redirect to Stripe's hosted onboarding
      window.location.href = onboardingUrl
    } catch (err) {
      // Demo mode fallback
      toast('Demo mode — in production this redirects to Stripe onboarding', { icon: '💳', duration: 4000 })
      setStatus('pending')
      setConnectReady(true)
    }
  }

  return (
    <div className="page">

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--red), var(--orange))', padding: '20px 16px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
            <ArrowLeft size={22} />
          </button>
          <h2 style={{ color: 'white', flex: 1 }}>Stripe payout setup</h2>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
          Connect your bank account to receive payments directly from buyers.
        </p>
      </div>

      {/* How it works */}
      <div style={{ margin: 14, background: 'white', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 14px 10px', fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>How payments work</div>
        <StatusRow icon={DollarSign} title="Buyer pays seller directly" sub="100% of the sale goes straight to you — we take nothing" done />
        <StatusRow icon={Shield} title="Powered by Stripe" sub="Bank-grade security — we never see your card or bank details" done />
        <StatusRow icon={CreditCard} title="Your subscription is separate" sub="$1/listing or $50/year is charged separately to Sell Like Crazy" done />
        <StatusRow icon={Zap} title="Fast payouts" sub="Money hits your bank account within 2 business days" done />
      </div>

      {/* Stripe Connect card */}
      {!connectReady ? (
        <div style={{ margin: '0 14px 14px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: '#635BFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 14px rgba(99,91,255,0.3)' }}>
            <CreditCard size={30} color="white" />
          </div>
          <h3 style={{ marginBottom: 8 }}>Connect your bank account</h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 20 }}>
            Stripe will guide you through entering your bank details and verifying your identity. Takes about 5 minutes. Done once — works forever.
          </p>

          <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 14, marginBottom: 20, textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: 'var(--text)' }}>You'll need:</div>
            {['Your bank account BSB and account number', 'Australian drivers licence or passport', 'Your ABN (if selling as a business — optional)', 'Takes about 5 minutes'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 7, fontSize: 12, color: 'var(--muted)' }}>
                <span style={{ color: 'var(--green)', flexShrink: 0, marginTop: 1 }}>✓</span> {item}
              </div>
            ))}
          </div>

          <button
            onClick={handleConnect}
            disabled={status === 'loading'}
            style={{ width: '100%', background: '#635BFF', color: 'white', border: 'none', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: status === 'loading' ? 0.7 : 1 }}>
            <CreditCard size={16} />
            {status === 'loading' ? 'Connecting...' : 'Set up Stripe payouts'}
            {status !== 'loading' && <ExternalLink size={14} />}
          </button>

          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 12 }}>
            Secured by Stripe · We never store your bank details · Stripe's fees: 1.7% + 30¢ per transaction (Australian cards)
          </p>
        </div>
      ) : (
        /* Connected state */
        <div style={{ margin: '0 14px 14px', background: '#F0FFF4', border: '1.5px solid #D6FFE4', borderRadius: 16, padding: 20, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Check size={32} color="white" />
          </div>
          <h3 style={{ color: '#1A7A30', marginBottom: 8 }}>Stripe connected!</h3>
          <p style={{ fontSize: 13, color: '#2E7D32', lineHeight: 1.6, marginBottom: 16 }}>
            Your bank account is set up. Buyers can now pay you directly — money hits your account within 2 business days of a sale.
          </p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">Go to dashboard</button>
        </div>
      )}

      {/* Pending state */}
      {status === 'pending' && !connectReady && (
        <div style={{ margin: '0 14px 14px', background: '#FFF9E6', border: '1.5px solid var(--yellow)', borderRadius: 14, padding: 14, display: 'flex', gap: 12 }}>
          <AlertCircle size={18} color="#CC9900" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#664400', marginBottom: 3 }}>Verification in progress</div>
            <div style={{ fontSize: 12, color: '#664400', lineHeight: 1.5 }}>Stripe is verifying your details. This usually takes a few minutes. You'll be notified when you're ready to receive payments.</div>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div style={{ margin: '0 14px 14px', background: 'white', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 14px 10px', fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Common questions</div>
        {[
          { q: 'Does Sell Like Crazy take a cut of my sales?', a: 'No — zero. You keep 100% of every sale. We only charge for your seller plan ($1/listing or $50/year).' },
          { q: 'What does Stripe charge?', a: '1.7% + 30¢ per successful card transaction (Australian cards). International cards are slightly higher. Stripe\'s fee, not ours.' },
          { q: 'Can I change my bank account later?', a: 'Yes — log into your Stripe dashboard anytime at dashboard.stripe.com to update bank details.' },
          { q: 'Is my bank info safe?', a: 'Stripe is PCI DSS Level 1 certified — the highest security standard. Your details are never stored by Sell Like Crazy.' },
        ].map(({ q, a }) => (
          <div key={q} style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{q}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{a}</div>
          </div>
        ))}
      </div>

    </div>
  )
}
