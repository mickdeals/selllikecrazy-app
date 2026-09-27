import { useState } from 'react'
import { X, Flag, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const REPORT_REASONS = [
  { id: 'scam',        label: 'Scam or fraud',              sub: 'This looks like a fake listing or scam' },
  { id: 'wrong_cat',   label: 'Wrong category',             sub: 'Listed in the wrong category' },
  { id: 'prohibited',  label: 'Prohibited item',            sub: 'This item is not allowed on the platform' },
  { id: 'misleading',  label: 'Misleading description',     sub: 'Photos or description are inaccurate' },
  { id: 'duplicate',   label: 'Duplicate listing',          sub: 'Same seller has posted this multiple times' },
  { id: 'offensive',   label: 'Offensive content',          sub: 'Contains offensive or inappropriate content' },
  { id: 'other',       label: 'Other',                      sub: 'Something else is wrong with this listing' },
]

export function ReportModal({ listing, user, onClose }) {
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!selected) { toast.error('Please select a reason'); return }
    setSubmitting(true)
    try {
      await supabase.from('reports').insert({
        listing_id: listing.id,
        reporter_id: user?.id || 'anonymous',
        reason: selected,
        detail: detail || null,
        status: 'pending',
      })
      setSubmitted(true)
    } catch {
      // Demo mode
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: 'white', borderRadius: '20px 20px 0 0', padding: '16px 20px 36px', maxHeight: '85vh', overflow: 'auto' }}>
        <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 16px' }} />

        {!submitted ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Flag size={18} color="var(--red)" />
                <h3>Report listing</h3>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}><X size={20} /></button>
            </div>

            <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: 'var(--muted)' }}>
              📦 Reporting: <strong style={{ color: 'var(--text)' }}>{listing.title}</strong>
            </div>

            <div style={{ marginBottom: 16 }}>
              {REPORT_REASONS.map(r => (
                <div key={r.id} onClick={() => setSelected(r.id)}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: selected === r.id ? '#FFF0F3' : 'var(--bg)', border: `1.5px solid ${selected === r.id ? 'var(--red)' : 'var(--border)'}`, borderRadius: 12, marginBottom: 8, cursor: 'pointer', transition: 'all 0.15s' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selected === r.id ? 'var(--red)' : 'var(--border)'}`, background: selected === r.id ? 'var(--red)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    {selected === r.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{r.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="form-group">
              <label className="input-label">Additional detail (optional)</label>
              <textarea className="input" rows={3} value={detail} onChange={e => setDetail(e.target.value)}
                placeholder="Tell us more about the issue..." />
            </div>

            <button className="btn-primary" onClick={handleSubmit} disabled={submitting || !selected}>
              {submitting ? 'Submitting...' : 'Submit report'}
            </button>
            <button className="btn-secondary mt-8" onClick={onClose}>Cancel</button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Check size={32} color="white" />
            </div>
            <h3 style={{ marginBottom: 8 }}>Report submitted</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 20 }}>
              Thanks for letting us know. We review all reports within 24 hours and will take action if needed.
            </p>
            <button className="btn-primary" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  )
}
