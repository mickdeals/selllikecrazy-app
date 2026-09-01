import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronUp, Send, Check, MessageSquare, FileText, Shield } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const FAQS = [
  {
    category: 'Getting started',
    icon: '⚡',
    questions: [
      {
        q: 'How do I start selling?',
        a: 'Tap Sell → choose a category → take a photo → AI writes the listing for you. Your first 10 item listings and 1 service listing are free. No card needed to start.'
      },
      {
        q: 'How do I get paid?',
        a: 'You connect your bank account via Stripe Connect (Profile → Stripe payout setup). When a buyer pays, the money goes directly to your Stripe account — we never hold your money. Payouts reach your bank within 2 business days.'
      },
      {
        q: 'What does it cost to sell?',
        a: 'First 10 item listings and 1 service listing are free. After that: $1 per listing (30-day duration) or $50/year for unlimited selling. We take zero commission on sales — 100% goes to you.'
      },
      {
        q: 'How long does a listing stay live?',
        a: 'Free and $1 item listings are active for 30 days. Free service listings last 90 days. Annual plan listings last 365 days. You get a 7-day warning email before expiry and can relist in one tap.'
      },
    ]
  },
  {
    category: 'Offers and payments',
    icon: '💰',
    questions: [
      {
        q: 'How do offers work?',
        a: 'Buyers can make an offer on any listing. As the seller you can Accept, Counter or Decline. Accepted offers lock the listing for 6 hours while the buyer arranges payment. If payment is not received within 6 hours the offer lapses and the listing becomes available again.'
      },
      {
        q: 'Is my payment protected?',
        a: 'Yes. All payments are processed by Stripe — bank-grade encryption, PCI DSS Level 1 certified. Your card details are never stored on our platform. If there is a dispute, contact us within 7 days of the transaction.'
      },
      {
        q: 'Can I get a refund?',
        a: 'Refunds are between buyers and sellers directly. If you cannot resolve a dispute, contact us at sales@selllikecrazy.app within 7 days and we will assist. Listing fees ($1 and $50/year) are non-refundable once the listing has been published.'
      },
      {
        q: 'How do I cancel my annual plan?',
        a: 'Profile → Billing → Cancel subscription. You keep access until the end of your paid year. Your listings remain active until they expire individually. No partial refunds on annual plans.'
      },
    ]
  },
  {
    category: 'Listings and services',
    icon: '📦',
    questions: [
      {
        q: 'What can I sell?',
        a: 'Almost anything legal in Australia — vehicles, property, electronics, clothing, furniture, tools, pets, sporting goods, baby items, and more. Services including SMP, hair, trades, tutoring, photography, personal training and anything you do professionally. See our Prohibited Items list for what is not allowed.'
      },
      {
        q: 'Why does my service listing require mobile verification?',
        a: 'Mobile verification prevents abuse of the free service listing. One phone number = one free service listing across all accounts. It takes less than a minute and only happens once.'
      },
      {
        q: 'Can I edit my listing after publishing?',
        a: 'Yes. Dashboard → tap your listing → Edit. You can change the title, description, price, photos and shipping options at any time. Editing the price down automatically notifies anyone who has saved the listing.'
      },
      {
        q: 'What is a bump listing?',
        a: 'A bump ($2) moves your listing to the top of search results for 7 days. Annual plan holders get one free bump per week. Bumped listings show a ⚡ badge. Great for listings that have been live for a while and need more visibility.'
      },
    ]
  },
  {
    category: 'Trust and safety',
    icon: '🛡️',
    questions: [
      {
        q: 'How do I report a listing?',
        a: 'Open any listing → scroll to the bottom → tap "Report this listing." Choose a reason and add details. We review all reports within 24 hours and remove listings that violate our policies.'
      },
      {
        q: 'Someone is sending me abusive messages — what do I do?',
        a: 'Open the message thread → tap Block in the top right. They will no longer be able to contact you. You can also report them to us via the contact form below. We take abusive behaviour seriously and will suspend accounts that violate our community standards.'
      },
      {
        q: 'How do I know a seller is legitimate?',
        a: 'Look for the Verified Seller badge — this means the seller has completed email verification, mobile verification, and government ID verification. Power Seller badge means they also have 10+ reviews and a 4.5★+ rating. You can view any seller\'s storefront, reviews and sales history before buying.'
      },
      {
        q: 'I think I\'ve been scammed — what do I do?',
        a: 'Contact us immediately at sales@selllikecrazy.app with your order details. If payment was made via the platform contact Stripe support directly for a chargeback. Report the listing and the user\'s account using the in-app report tools. Do not send money outside the platform — all legitimate transactions go through Stripe.'
      },
    ]
  },
  {
    category: 'Account',
    icon: '👤',
    questions: [
      {
        q: 'How do I change my email or password?',
        a: 'Profile → Change password sends a reset link to your registered email. To change your email address, contact us at sales@selllikecrazy.app — email changes require identity verification for security.'
      },
      {
        q: 'How do I delete my account?',
        a: 'Contact us at sales@selllikecrazy.app and request account deletion. We will remove your account and all associated data within 30 days in accordance with the Australian Privacy Act. Active listings will be removed immediately. Completed transaction records are retained for 7 years for legal compliance.'
      },
      {
        q: 'I forgot my password and can\'t get in — help.',
        a: 'Go to the login screen → tap "Forgot password?" → enter your email. A reset link is sent immediately. Check your spam folder if you don\'t see it. If you still can\'t get in, contact us at sales@selllikecrazy.app with your account email and we\'ll verify your identity and restore access.'
      },
    ]
  },
]

const CONTACT_CATEGORIES = [
  'I need help with a listing',
  'I have a payment or billing issue',
  'I want to report a user',
  'I found a bug in the app',
  'I have a question about my account',
  'I want to request account deletion',
  'Something else',
]

export default function HelpCentre() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const [openQ, setOpenQ] = useState(null)
  const [activeTab, setActiveTab] = useState('faq') // faq | contact
  const [form, setForm] = useState({ category: '', message: '', email: user?.email || '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const toggleQ = (key) => setOpenQ(openQ === key ? null : key)

  const handleSubmit = async () => {
    if (!form.category) { toast.error('Please select a category'); return }
    if (!form.message.trim()) { toast.error('Please describe your issue'); return }
    if (!form.email) { toast.error('Please enter your email'); return }
    setSubmitting(true)
    try {
      // Send via Supabase edge function
      await supabase.functions.invoke('send-notification', {
        body: {
          type: 'SUPPORT_REQUEST',
          recipient_email: 'sales@selllikecrazy.app',
          data: {
            from: form.email,
            category: form.category,
            message: form.message,
            userId: user?.id || 'not logged in',
          }
        }
      })
      setSubmitted(true)
    } catch {
      // Demo / fallback
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div style={{ background: 'linear-gradient(135deg, #007AFF, #635BFF)', padding: '20px 16px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
            <ArrowLeft size={22} />
          </button>
          <div>
            <h2 style={{ color: 'white', marginBottom: 2 }}>Help centre</h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>FAQs and contact us</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 4, gap: 4 }}>
          {[
            { id: 'faq',     label: '❓ FAQs' },
            { id: 'contact', label: '✉️ Contact us' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ flex: 1, padding: '9px', borderRadius: 9, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: activeTab === t.id ? 'white' : 'transparent', color: activeTab === t.id ? '#007AFF' : 'rgba(255,255,255,0.9)', transition: 'all 0.15s' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ tab */}
      {activeTab === 'faq' && (
        <div style={{ padding: 16 }}>
          {FAQS.map(section => (
            <div key={section.category} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{section.icon}</span>{section.category}
              </div>
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                {section.questions.map((item, i) => {
                  const key = `${section.category}-${i}`
                  const isOpen = openQ === key
                  return (
                    <div key={key} style={{ borderBottom: i < section.questions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <button onClick={() => toggleQ(key)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                        <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{item.q}</div>
                        {isOpen ? <ChevronUp size={16} color="var(--muted)" /> : <ChevronDown size={16} color="var(--muted)" />}
                      </button>
                      {isOpen && (
                        <div style={{ padding: '0 16px 14px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, borderTop: '1px solid var(--border)' }}>
                          <div style={{ paddingTop: 12 }}>{item.a}</div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Prohibited items link */}
          <button onClick={() => navigate('/prohibited')}
            style={{ width: '100%', background: '#FFF0F3', border: '1.5px solid #FFD0D8', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 16 }}>
            <Shield size={20} color="var(--red)" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--red)' }}>Prohibited items list</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>What you cannot sell on Sell Like Crazy</div>
            </div>
            <ChevronDown size={16} color="var(--red)" style={{ transform: 'rotate(-90deg)' }} />
          </button>

          <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Can't find your answer?</p>
            <button onClick={() => setActiveTab('contact')} className="btn-primary" style={{ width: 'auto', padding: '11px 28px' }}>
              Contact us
            </button>
          </div>
        </div>
      )}

      {/* Contact tab */}
      {activeTab === 'contact' && (
        <div style={{ padding: 16 }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Check size={36} color="white" />
              </div>
              <h2 style={{ marginBottom: 8 }}>Message sent!</h2>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 24 }}>
                We've received your message and will get back to you at {form.email} within 24 hours.
              </p>
              <button className="btn-primary" onClick={() => { setSubmitted(false); setForm({ ...form, message: '', category: '' }) }}>
                Send another message
              </button>
            </div>
          ) : (
            <>
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                  <MessageSquare size={20} color="#007AFF" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>We usually respond within 24 hours</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>Mon–Fri · sales@selllikecrazy.app</div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="input-label">Your email</label>
                  <input className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="your@email.com" type="email" />
                </div>

                <div className="form-group">
                  <label className="input-label">What do you need help with?</label>
                  <div style={{ position: 'relative' }}>
                    <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      style={{ appearance: 'none', paddingRight: 36, cursor: 'pointer' }}>
                      <option value="">Select a category...</option>
                      {CONTACT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={16} color="var(--muted)" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="input-label">Describe your issue</label>
                  <textarea className="input" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Give us as much detail as possible — listing ID, transaction date, screenshots if relevant..."
                    rows={5} />
                </div>

                <button className="btn-primary" onClick={handleSubmit} disabled={submitting}
                  style={{ background: 'linear-gradient(135deg, #007AFF, #635BFF)', boxShadow: '0 4px 14px rgba(0,122,255,0.3)' }}>
                  {submitting ? 'Sending...' : 'Send message ✉️'}
                </button>
              </div>

              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 16px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
                For urgent matters including scams, fraud or safety concerns email us directly at{' '}
                <strong style={{ color: 'var(--text)' }}>sales@selllikecrazy.app</strong>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
