import { useNavigate } from 'react-router-dom'
import { Check, ChevronRight, Zap } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

const STEPS = [
  {
    id: 'email',
    label: 'Verify email',
    sub: 'Confirm your email address',
    action: null, // already done on signup
    points: 10,
  },
  {
    id: 'mobile',
    label: 'Verify mobile number',
    sub: 'Add an extra layer of trust',
    action: '/profile',
    points: 15,
  },
  {
    id: 'photo',
    label: 'Add profile photo & bio',
    sub: 'Buyers trust sellers they can see',
    action: '/profile/edit',
    points: 20,
  },
  {
    id: 'stripe',
    label: 'Connect Stripe for payouts',
    sub: 'Get paid directly to your bank',
    action: '/stripe/connect',
    points: 20,
  },
  {
    id: 'first_listing',
    label: 'Publish your first listing',
    sub: 'Start selling — 10 free listings',
    action: '/sell',
    points: 15,
  },
  {
    id: 'first_sale',
    label: 'Make your first sale',
    sub: 'Your first ⚡ is the hardest',
    action: null,
    points: 10,
  },
  {
    id: 'first_review',
    label: 'Receive your first review',
    sub: 'Ask your buyer to leave feedback',
    action: null,
    points: 10,
  },
]

const POWER_SELLER_STEPS = [
  { id: 'annual',     label: 'Upgrade to annual plan', action: '/profile' },
  { id: 'reviews_10', label: 'Reach 10 reviews with 4.5★+', action: null },
  { id: 'id_verify',  label: 'Complete government ID verification', action: '/profile' },
]

export function SellerChecklist({ compact = false }) {
  const navigate = useNavigate()
  const { user, plan, isAdmin } = useAppStore()

  // Demo completion state — in production read from profile
  const completed = {
    email:         true,
    mobile:        false,
    photo:         false,
    stripe:        false,
    first_listing: true,
    first_sale:    false,
    first_review:  false,
  }

  const completedCount = Object.values(completed).filter(Boolean).length
  const totalSteps = STEPS.length
  const pct = Math.round((completedCount / totalSteps) * 100)
  const pointsEarned = STEPS.filter(s => completed[s.id]).reduce((sum, s) => sum + s.points, 0)
  const totalPoints = STEPS.reduce((sum, s) => sum + s.points, 0)

  if (compact) {
    return (
      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 14, marginBottom: 12, cursor: 'pointer' }}
        onClick={() => navigate('/onboarding-checklist')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Seller setup — {pct}% complete</div>
          <span style={{ fontSize: 11, color: 'var(--red)', fontWeight: 700 }}>View all →</span>
        </div>
        <div style={{ background: 'var(--bg)', borderRadius: 20, height: 8, overflow: 'hidden', marginBottom: 6 }}>
          <div style={{ height: '100%', background: 'linear-gradient(135deg, var(--red), var(--orange))', borderRadius: 20, width: `${pct}%`, transition: 'width 0.6s ease' }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
          {completedCount} of {totalSteps} steps · {pointsEarned}/{totalPoints} pts
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--red), var(--orange))', padding: '24px 20px', color: 'white' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, opacity: 0.8, marginBottom: 6, textTransform: 'uppercase' }}>Seller setup</div>
        <h2 style={{ color: 'white', marginBottom: 16 }}>Your path to first sale</h2>

        {/* Progress ring / bar */}
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{completedCount} of {totalSteps} complete</span>
            <span style={{ fontSize: 18, fontWeight: 700 }}>{pct}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, height: 10, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', background: 'white', borderRadius: 20, width: `${pct}%`, transition: 'width 0.6s ease' }} />
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
            {pointsEarned} / {totalPoints} points earned
          </div>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Core steps */}
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Getting started</div>
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
          {STEPS.map((step, i) => {
            const done = completed[step.id]
            return (
              <div key={step.id}
                onClick={() => step.action && !done && navigate(step.action)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: i < STEPS.length - 1 ? '1px solid var(--border)' : 'none', cursor: step.action && !done ? 'pointer' : 'default', background: done ? '#F8FFF8' : 'white' }}>

                {/* Step indicator */}
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: done ? 'var(--green)' : 'var(--bg)', border: `2px solid ${done ? 'var(--green)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {done
                    ? <Check size={16} color="white" strokeWidth={3} />
                    : <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>{i + 1}</span>
                  }
                </div>

                {/* Label */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: done ? 'var(--muted)' : 'var(--text)', textDecoration: done ? 'line-through' : 'none', marginBottom: 2 }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{step.sub}</div>
                </div>

                {/* Points + arrow */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, background: done ? '#E8F8EC' : '#FFF0F3', color: done ? '#1A7A30' : 'var(--red)', padding: '2px 8px', borderRadius: 20 }}>
                    {done ? '✓' : '+'}{step.points}pts
                  </span>
                  {step.action && !done && <ChevronRight size={16} color="var(--muted)" />}
                </div>
              </div>
            )
          })}
        </div>

        {/* Power Seller unlock */}
        <div style={{ background: 'linear-gradient(135deg, #FFF0F3, #FFF9E6)', border: '1.5px solid var(--orange)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Zap size={18} color="var(--orange)" />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#664400' }}>Unlock Power Seller ⚡</span>
          </div>
          <p style={{ fontSize: 12, color: '#664400', marginBottom: 12, lineHeight: 1.5 }}>
            Complete all steps above, then unlock the Power Seller badge for higher visibility and more buyer trust.
          </p>
          {POWER_SELLER_STEPS.map((step, i) => (
            <div key={step.id} onClick={() => step.action && navigate(step.action)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < POWER_SELLER_STEPS.length - 1 ? 10 : 0, cursor: step.action ? 'pointer' : 'default' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,149,0,0.15)', border: '1.5px solid var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--orange)' }}>{i + 1}</span>
              </div>
              <span style={{ fontSize: 12, color: '#664400', flex: 1 }}>{step.label}</span>
              {step.action && <ChevronRight size={14} color="var(--orange)" />}
            </div>
          ))}
        </div>

        {/* What you get */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>⚡ What Power Sellers get</div>
          {[
            'Lightning bolt badge on all listings',
            'Featured in search results above standard sellers',
            'Higher buyer trust — more messages, more sales',
            'Access to bundle deal linking (link multiple listings)',
            'Priority support from the SLC team',
          ].map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < 4 ? 8 : 0 }}>
              <Check size={14} color="var(--green)" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{b}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SellerChecklist
