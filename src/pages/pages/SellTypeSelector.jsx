import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Sparkles } from 'lucide-react'
import { CATEGORY_GROUPS } from '../lib/categories'

export default function SellTypeSelector() {
  const navigate = useNavigate()
  const [step, setStep] = useState('type') // type | category
  const [listingType, setListingType] = useState(null) // item | service

  const handleTypeSelect = (type) => {
    if (type === 'service') {
      navigate('/sell/service')
      return
    }
    setListingType(type)
    setStep('category')
  }

  const handleCategorySelect = (group) => {
    navigate(`/sell/item?group=${group.id}`)
  }

  if (step === 'category') {
    return (
      <div className="page">
        <div style={{ background: 'linear-gradient(135deg, var(--red), var(--orange))', padding: '22px 20px 20px', color: 'white' }}>
          <button onClick={() => setStep('type')}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: 20, padding: '5px 12px', fontSize: 12, cursor: 'pointer', marginBottom: 12, fontFamily: 'inherit' }}>
            ← Back
          </button>
          <h2 style={{ color: 'white', marginBottom: 4 }}>What are you listing?</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Pick a category to get the right fields</p>
        </div>

        <div style={{ padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
            {CATEGORY_GROUPS.map(group => (
              <button key={group.id} onClick={() => handleCategorySelect(group)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, padding: '16px 8px', background: 'white', border: `1.5px solid var(--border)`, borderRadius: 16, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = group.color; e.currentTarget.style.background = group.bg }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'white' }}>
                <span style={{ fontSize: 32 }}>{group.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', textAlign: 'center', lineHeight: 1.3 }}>{group.label}</span>
                <span style={{ fontSize: 9, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.3 }}>
                  {group.categories.slice(0, 2).join(', ')}{group.categories.length > 2 ? '...' : ''}
                </span>
              </button>
            ))}
          </div>

          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>AI auto-fills the details</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                Whichever you choose — take a photo and AI fills the title, description, price and category-specific fields automatically.
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 1 — item or service
  const TYPES = [
    {
      type: 'item',
      icon: '📦',
      label: 'Physical item',
      sub: 'Sell anything — cars, phones, clothes, furniture, pets, property and more',
      color: 'var(--red)',
      bg: '#FFF0F3',
      border: '#FFD0D8',
      freeNote: '10 free listings to start',
      categories: ['Cars 🚗', 'Property 🏠', 'Electronics 📱', 'Clothing 👗', 'Furniture 🛋️', 'Pets 🐾'],
    },
    {
      type: 'service',
      icon: '🛠️',
      label: 'Service',
      sub: 'Hair, SMP, trades, tutoring, photography — anything you do',
      color: '#635BFF',
      bg: '#F0F0FF',
      border: '#C0C0FF',
      freeNote: '1 free service listing to try',
      categories: ['Hair & Beauty 💈', 'SMP 💆', 'Trades 🔧', 'Tutoring 📚', 'Photography 📸', 'Training 💪'],
    },
  ]

  return (
    <div className="page">
      <div style={{ background: 'linear-gradient(135deg, var(--red), var(--orange))', padding: '28px 20px 24px', color: 'white' }}>
        <h2 style={{ color: 'white', marginBottom: 6 }}>What are you listing?</h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
          <Sparkles size={13} style={{ display: 'inline', marginRight: 4 }} />
          AI writes the listing for you — just take a photo
        </p>
      </div>

      <div style={{ padding: 16 }}>
        {TYPES.map(t => (
          <button key={t.type} onClick={() => handleTypeSelect(t.type)}
            style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 16, padding: 18, background: t.bg, border: `1.5px solid ${t.border}`, borderRadius: 18, cursor: 'pointer', marginBottom: 12, textAlign: 'left', fontFamily: 'inherit' }}>
            <div style={{ fontSize: 42, lineHeight: 1, flexShrink: 0 }}>{t.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: t.color }}>{t.label}</div>
                <div style={{ background: 'rgba(255,255,255,0.7)', border: `1px solid ${t.border}`, borderRadius: 20, padding: '2px 10px', fontSize: 10, color: t.color, fontWeight: 700 }}>
                  🎁 {t.freeNote}
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 10 }}>{t.sub}</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {t.categories.map(cat => (
                  <span key={cat} style={{ background: 'white', border: `1px solid ${t.border}`, borderRadius: 20, padding: '3px 9px', fontSize: 11, color: t.color, fontWeight: 600 }}>
                    {cat}
                  </span>
                ))}
              </div>
            </div>
            <ChevronRight size={20} color={t.color} style={{ flexShrink: 0, marginTop: 2 }} />
          </button>
        ))}

        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start', marginTop: 4 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>⚡</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>Zero commission on sales</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
              100% of every sale goes to you via Stripe. We charge only for listings — $1 each or $50/year unlimited selling.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
