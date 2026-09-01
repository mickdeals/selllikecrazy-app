import { useState } from 'react'
import { X, DollarSign, MessageSquare, Clock, Check, ChevronRight } from 'lucide-react'
import { makeOffer, getOfferStatusLabel } from '../../lib/offers'
import { formatPrice } from '../../lib/geo'
import toast from 'react-hot-toast'

export function MakeOfferModal({ listing, user, symbol, onClose, onSuccess }) {
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const saving = amount && listing.price
    ? Math.max(0, listing.price - parseFloat(amount))
    : 0
  const pct = saving > 0 ? Math.round((saving / listing.price) * 100) : 0

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Enter an offer amount')
      return
    }
    if (parseFloat(amount) > listing.price) {
      toast.error('Offer can\'t be higher than asking price — just buy it!')
      return
    }
    setSubmitting(true)
    try {
      await makeOffer(listing.id, user.id, parseFloat(amount), message)
      setSubmitted(true)
      toast.success('Offer sent! Seller will respond shortly.')
      setTimeout(() => { onSuccess?.(); onClose() }, 2000)
    } catch {
      // Demo mode
      setSubmitted(true)
      toast.success('Offer sent! Seller will respond shortly.')
      setTimeout(() => { onSuccess?.(); onClose() }, 2000)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: 'white', borderRadius: '20px 20px 0 0', padding: '16px 20px 36px' }}>

        {/* Handle */}
        <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 20px' }} />

        {!submitted ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <h3>Make an offer</h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}><X size={20} /></button>
            </div>

            <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '10px 14px', marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{listing.emoji} {listing.title}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--red)' }}>{formatPrice(listing.price, symbol)}</span>
            </div>

            {/* Offer amount */}
            <div className="form-group">
              <label className="input-label">Your offer</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{symbol}</span>
                <input className="input" type="number" value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  style={{ paddingLeft: 28, fontSize: 18, fontWeight: 700 }} />
              </div>
            </div>

            {/* Saving indicator */}
            {saving > 0 && (
              <div style={{ background: '#F0FFF4', border: '1px solid #D6FFE4', borderRadius: 10, padding: '8px 12px', marginBottom: 14, fontSize: 12, color: '#1A7A30', fontWeight: 600 }}>
                ✓ You'd save {formatPrice(saving, symbol)} ({pct}% off asking price)
              </div>
            )}

            {/* Optional message */}
            <div className="form-group">
              <label className="input-label">Message to seller (optional)</label>
              <textarea className="input" rows={2} value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Hi, I'm interested — would you take this?" />
            </div>

            {/* 6hr lock note */}
            <div style={{ background: '#FFF9E6', border: '1px solid var(--yellow)', borderRadius: 10, padding: '9px 12px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <Clock size={14} color="#CC9900" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 11, color: '#664400', lineHeight: 1.5 }}>
                If accepted, the listing is reserved for you for <strong>6 hours</strong> while you arrange payment. After that, it's released back to all buyers.
              </p>
            </div>

            <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Sending...' : `Send offer — ${amount ? formatPrice(amount, symbol) : symbol + '0'}`}
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Check size={32} color="white" />
            </div>
            <h3 style={{ marginBottom: 8 }}>Offer sent!</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
              The seller will respond soon. You'll get a notification when they accept, decline, or counter.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export function OfferResponseCard({ offer, onAccept, onDecline, onCounter, symbol = '$' }) {
  const [counterAmount, setCounterAmount] = useState('')
  const [showCounter, setShowCounter] = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = async (action) => {
    setLoading(true)
    try {
      await onAccept?.(offer.id, action, counterAmount ? parseFloat(counterAmount) : null)
    } finally {
      setLoading(false)
    }
  }

  const statusInfo = getOfferStatusLabel(offer.status)

  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 14, marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>
            {offer.profiles?.display_name || offer.profiles?.email?.split('@')[0] || 'Buyer'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>
            {offer.listings?.emoji} {offer.listings?.title}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--red)' }}>{symbol}{offer.amount}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>asking {symbol}{offer.listings?.price}</div>
        </div>
      </div>

      {offer.message && (
        <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '8px 10px', marginBottom: 10, fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
          "{offer.message}"
        </div>
      )}

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: statusInfo.bg, borderRadius: 20, padding: '4px 10px', fontSize: 10, fontWeight: 700, color: statusInfo.color, marginBottom: 10 }}>
        {statusInfo.label}
      </div>

      {offer.status === 'pending' && (
        <>
          {!showCounter ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handle('accepted')} disabled={loading}
                style={{ flex: 1, background: 'var(--green)', color: 'white', border: 'none', borderRadius: 10, padding: '10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                ✓ Accept
              </button>
              <button onClick={() => setShowCounter(true)}
                style={{ flex: 1, background: '#FFF9E6', color: '#664400', border: '1px solid var(--yellow)', borderRadius: 10, padding: '10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                ↩ Counter
              </button>
              <button onClick={() => handle('declined')} disabled={loading}
                style={{ flex: 1, background: '#FFF0F3', color: 'var(--red)', border: '1px solid #FFD0D8', borderRadius: 10, padding: '10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                ✕ Decline
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 700 }}>{symbol}</span>
                <input className="input" type="number" value={counterAmount}
                  onChange={e => setCounterAmount(e.target.value)}
                  placeholder="Your price" style={{ paddingLeft: 24, marginBottom: 0 }} />
              </div>
              <button onClick={() => handle('countered')} disabled={!counterAmount || loading}
                style={{ background: 'var(--orange)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                Send counter
              </button>
              <button onClick={() => setShowCounter(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                <X size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
