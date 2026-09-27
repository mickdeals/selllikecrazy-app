import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Gift, Check, Clock, CreditCard, Camera, Sparkles, X, Wand2, Image as ImageIcon, RefreshCw, AlertCircle } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { analyzeListingImage } from '../lib/aiListing'
import { publishListing, getGateStatus } from '../lib/listingGate'
import { getExpiryLabel } from '../lib/expiry'
import { geocodeAddress } from '../lib/geocoding'
import { MobileVerificationGate } from '../components/auth/MobileVerificationGate'
import toast from 'react-hot-toast'

const EXPERIENCE_LEVELS = ['Hobbyist', 'Trained', 'Qualified', 'Expert', 'Master']
const DELIVERY_OPTIONS = [
  { id: 'in_person',    label: 'In-person at my location', icon: '📍', desc: 'Client comes to you' },
  { id: 'mobile',       label: 'Mobile — I come to you',   icon: '🚗', desc: 'You travel to the client' },
  { id: 'online',       label: 'Online / Remote',          icon: '🌐', desc: 'Video call, phone or digital delivery' },
  { id: 'both',         label: 'In-person + Online',       icon: '📍🌐', desc: 'Client chooses' },
]
const SERVICE_CATEGORIES = [
  'Hair & Beauty', 'Scalp Micropigmentation', 'Tattoo & Body Art',
  'Personal Training', 'Health & Wellness', 'Photography',
  'Tutoring & Education', 'Music Lessons', 'Trades & Handyman',
  'Cleaning & Domestic', 'IT & Tech Support', 'Graphic Design',
  'Accounting & Finance', 'Legal Services', 'Pet Services',
  'Childcare & Babysitting', 'Event & Wedding', 'Catering & Chef',
  'Marketing & Social Media', 'Other Services',
]

function AIAnalyzing({ imagePreview }) {
  const steps = ['Identifying service...', 'Reading portfolio...', 'Writing description...', 'Suggesting price...', 'Almost done...']
  const [step, setStep] = useState(0)
  useState(() => {
    const iv = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 800)
    return () => clearInterval(iv)
  }, [])
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,15,0.85)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ background: 'white', borderRadius: 24, padding: 28, width: '100%', maxWidth: 340, textAlign: 'center' }}>
        {imagePreview && <div style={{ width: 90, height: 90, borderRadius: 16, overflow: 'hidden', margin: '0 auto 16px', border: '3px solid var(--border)' }}><img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#635BFF,#007AFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><Sparkles size={26} color="white" /></div>
        <h3 style={{ marginBottom: 6 }}>AI analysing your portfolio</h3>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 18 }}>{steps[step]}</p>
        <div style={{ background: 'var(--bg)', borderRadius: 20, height: 6, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'linear-gradient(135deg,#635BFF,#007AFF)', borderRadius: 20, width: `${((step+1)/steps.length)*100}%`, transition: 'width 0.6s ease' }} />
        </div>
      </div>
    </div>
  )
}

export default function ServiceListing() {
  const navigate = useNavigate()
  const { user, categories, addCategory, plan, freeListingsRemaining, freeServicesRemaining, useFreeService, isAdmin } = useAppStore()
  const fileInputRef = useRef()
  const cameraInputRef = useRef()

  const [showPhotoSheet, setShowPhotoSheet] = useState(false)
  const [images, setImages] = useState([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [analyzing, setAnalyzing] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [aiAccepted, setAiAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('annual')
  const [showMobileGate, setShowMobileGate] = useState(false)
  const [pendingListingData, setPendingListingData] = useState(null)

  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    packagePrice: '',
    packageDescription: '',
    experienceLevel: 'Trained',
    delivery: 'In-person',
    serviceArea: '',
    travelRadius: '',
    availability: '',
    qualifications: '',
    portfolioNote: '',
  })

  const update = (f, v) => setForm(prev => ({ ...prev, [f]: v }))

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 8) // more photos for portfolio
    const imgs = files.map(file => ({ file, preview: URL.createObjectURL(file), cleaned: null }))
    setImages(prev => [...prev, ...imgs].slice(0, 8))
    setActiveIdx(0)
    if (imgs.length > 0 && !aiResult) {
      toast('Photo added — enter a title then tap Re-analyse ✨', { duration: 3000 })
    }
  }

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
    if (activeIdx >= idx && activeIdx > 0) setActiveIdx(activeIdx - 1)
  }

  const runAI = async (file) => {
    setAnalyzing(true)
    setAiResult(null)
    setAiAccepted(false)
    try {
      const result = await analyzeListingImage(file, SERVICE_CATEGORIES, form.title)
      setAiResult({ ...result, isService: true })
    } catch {
      setAiResult({
        title: 'Professional service — book now',
        description: 'Experienced professional offering high-quality service. Fully trained with proven results. Contact to discuss your requirements and book a consultation.',
        category: 'Hair & Beauty',
        suggestedPrice: 120,
        condition: 'Expert',
        keywords: ['professional', 'qualified', 'experienced'],
        shippingNote: 'In-person service — contact to discuss location.',
        isService: true,
      })
      toast('Demo mode — add Claude API key for real AI analysis', { icon: '🤖', duration: 4000 })
    } finally {
      setAnalyzing(false)
    }
  }

  const acceptAI = () => {
    if (!aiResult) return
    update('title', aiResult.title)
    update('description', aiResult.description)
    update('category', aiResult.category)
    update('price', String(aiResult.suggestedPrice))
    update('experienceLevel', aiResult.condition || 'Trained')
    if (aiResult.category) addCategory(aiResult.category)
    setAiAccepted(true)
    toast.success('AI details applied — edit anything you like ✏️')
  }

  const doPublish = async (listingData) => {
    await publishListing(listingData, { id: user.id, plan, freeListingsRemaining, freeServicesRemaining, isAdmin }, {
      onSuccess: (listing, meta) => {
        setSubmitting(false)
        if (meta.usedFree) useFreeService()
        toast.success('Service listed! ⚡')
        navigate('/dashboard')
      },
      onNeedsPayment: (checkoutUrl) => {
        setSubmitting(false)
        if (checkoutUrl) { window.location.href = checkoutUrl }
        else { toast.success('Demo: Service listed ⚡'); navigate('/dashboard') }
      },
      onError: (msg) => { setSubmitting(false); toast.error(msg) },
    })
  }

  const handleSubmit = async () => {
    if (!user) { toast.error('Please log in'); navigate('/login'); return }
    if (!form.title || !form.price || !form.category) { toast.error('Fill in title, category and price'); return }
    if (form.category) addCategory(form.category)

    // Geocode the service area for geo-filtering
    let geoData = null
    if (form.serviceArea) {
      toast.loading('Locating your service area...', { id: 'geocode' })
      geoData = await geocodeAddress(form.serviceArea)
      toast.dismiss('geocode')
    }

    const listingData = {
      title: form.title,
      category: form.category,
      description: `${form.description}${form.qualifications ? '\n\nQualifications: ' + form.qualifications : ''}${form.availability ? '\n\nAvailability: ' + form.availability : ''}`,
      price: parseFloat(form.price),
      bundle_price: form.packagePrice ? parseFloat(form.packagePrice) : null,
      shipping_option: form.delivery,
      location: form.serviceArea,
      condition: form.experienceLevel,
      listing_type: 'service',
      service_area: form.serviceArea,
      travel_radius: form.travelRadius,
      delivery_method: form.delivery,
      ai_assisted: !!aiResult,
      // Geo coordinates for distance filtering
      lat: geoData?.lat || null,
      lng: geoData?.lng || null,
      country_code: geoData?.countryCode || null,
      state: geoData?.state || null,
    }

    // ── Mobile verification gate for first free service listing ──
    // Check if phone is verified (from Supabase profile)
    if (!isAdmin && freeServicesRemaining > 0 && plan !== 'annual') {
      try {
        const { data: profile } = await (await import('../lib/supabase')).supabase
          .from('profiles').select('phone_verified').eq('id', user.id).single()
        if (!profile?.phone_verified) {
          setPendingListingData(listingData)
          setShowMobileGate(true)
          return
        }
      } catch {
        // Demo mode — show gate anyway for first free service
        if (freeServicesRemaining > 0) {
          setPendingListingData(listingData)
          setShowMobileGate(true)
          return
        }
      }
    }

    setSubmitting(true)
    await doPublish(listingData)
  }

  const handleMobileVerified = async () => {
    setShowMobileGate(false)
    if (pendingListingData) {
      setSubmitting(true)
      await doPublish(pendingListingData)
      setPendingListingData(null)
    }
  }

  const currentPreview = images[activeIdx] ? images[activeIdx].preview : null
  const gate = getGateStatus({ plan, freeListingsRemaining, freeServicesRemaining, isAdmin }, 'service')

  return (
    <div className="page">
      {analyzing && <AIAnalyzing imagePreview={images[0]?.preview} />}

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #635BFF, #007AFF)', padding: '22px 20px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <h2 style={{ color: 'white' }}>List a service</h2>
          <span style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Sparkles size={10} /> AI POWERED
          </span>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Hair, tattoo, SMP, trades, tutoring — any service</p>
      </div>

      {/* Free listings banner */}
      <div style={{ margin: 14, background: '#FFF9E6', border: '1.5px solid var(--yellow)', borderRadius: 16, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Gift size={22} color="#CC9900" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: 12, color: '#664400', lineHeight: 1.5 }}>
          {freeServicesRemaining > 0
            ? <><strong style={{ color: '#CC6600' }}>1 free service listing</strong> — try it out, no card needed.</>
            : <>Free service listing used. Choose a plan to keep listing.</>
          }
        </p>
      </div>

      {/* Plans */}
      <div style={{ padding: '0 14px 14px' }}>
        <div className="plan-grid">
          <div className={`plan-card ${selectedPlan === 'per_listing' ? 'selected' : ''}`} onClick={() => setSelectedPlan('per_listing')}>
            <div className="plan-name">Pay per listing</div>
            <div className="plan-price">$1<span>/listing</span></div>
            <div className="plan-features">Pay as you go<br />No commitment<br /><b>Casual providers</b></div>
          </div>
          <div className={`plan-card best-value ${selectedPlan === 'annual' ? 'selected' : ''}`} onClick={() => setSelectedPlan('annual')}>
            <div className="plan-name">Annual unlimited selling</div>
            <div className="plan-price">$50<span>/year</span></div>
            <div className="plan-features">Unlimited selling<br />Bundle packages<br /><b>Pro providers ⚡</b></div>
          </div>
        </div>
      </div>

      {/* Portfolio photos */}
      <div style={{ padding: '0 14px 14px' }}>
        <div className="section-label" style={{ padding: 0, marginBottom: 12 }}>Portfolio photos — AI reads your work and writes the listing</div>

        {currentPreview ? (
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: 10, background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <img src={currentPreview} alt="Portfolio" style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, display: 'flex', gap: 8 }}>
              <button onClick={() => runAI(images[activeIdx].file)}
                style={{ flex: 1, background: 'rgba(10,10,15,0.8)', color: 'white', border: 'none', borderRadius: 10, padding: '9px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <Wand2 size={13} /> Re-analyse
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowPhotoSheet(true)}
            style={{ width: '100%', height: 180, background: 'var(--bg)', border: '2px dashed var(--border)', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer', marginBottom: 10 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#635BFF,#007AFF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={26} color="white" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Add portfolio photos</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Before/after, your work, certificates ✨</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg,#635BFF,#007AFF)', color: 'white', borderRadius: 10, padding: '8px 20px', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={13} /> Add photos
            </div>
          </button>
        )}

        {images.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            {images.map((img, idx) => (
              <div key={idx} onClick={() => setActiveIdx(idx)}
                style={{ position: 'relative', width: 56, height: 56, borderRadius: 10, overflow: 'hidden', border: `2px solid ${activeIdx === idx ? '#635BFF' : 'var(--border)'}`, cursor: 'pointer', flexShrink: 0 }}>
                <img src={img.preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={e => { e.stopPropagation(); removeImage(idx) }}
                  style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                  <X size={10} />
                </button>
              </div>
            ))}
            {images.length < 8 && (
              <button onClick={() => setShowPhotoSheet(true)}
                style={{ width: 56, height: 56, borderRadius: 10, border: '2px dashed var(--border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--muted)', flexShrink: 0, fontSize: 22 }}>+</button>
            )}
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageUpload} />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleImageUpload} />
      </div>

      {/* Photo action sheet */}
      {showPhotoSheet && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300 }}>
          <div onClick={() => setShowPhotoSheet(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: 'white', borderRadius: '20px 20px 0 0', padding: '12px 16px 32px' }}>
            <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 20px' }} />
            <h3 style={{ marginBottom: 16, textAlign: 'center' }}>Add portfolio photos</h3>
            <button onClick={() => { setShowPhotoSheet(false); cameraInputRef.current?.click() }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'linear-gradient(135deg,#F0F0FF,#E8F0FF)', border: '1.5px solid #C0C0FF', borderRadius: 16, cursor: 'pointer', marginBottom: 10, fontFamily: 'inherit' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#635BFF,#007AFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Camera size={24} color="white" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>Take photo now</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Opens camera — AI analyses instantly</div>
              </div>
            </button>
            <button onClick={() => { setShowPhotoSheet(false); fileInputRef.current?.click() }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 16, cursor: 'pointer', fontFamily: 'inherit' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'white', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ImageIcon size={24} color="var(--muted)" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>Choose from library</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Pick up to 8 portfolio photos</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* AI result */}
      {aiResult && !aiAccepted && (
        <div style={{ margin: '0 14px 14px', background: 'linear-gradient(135deg,#F0F0FF,#F5F0FF)', border: '1.5px solid #635BFF', borderRadius: 16, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Sparkles size={16} color="#635BFF" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#635BFF' }}>AI suggested details</span>
            <span style={{ marginLeft: 'auto', background: 'var(--green)', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>READY TO EDIT</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            <div style={{ background: 'white', borderRadius: 10, padding: '8px 10px' }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, marginBottom: 2 }}>EXPERIENCE</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{aiResult.condition}</div>
            </div>
            <div style={{ background: 'white', borderRadius: 10, padding: '8px 10px' }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, marginBottom: 2 }}>SUGGESTED PRICE</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#635BFF' }}>${aiResult.suggestedPrice}</div>
            </div>
          </div>
          {aiResult.keywords?.length > 0 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
              {aiResult.keywords.map(k => <span key={k} style={{ background: 'rgba(99,91,255,0.1)', color: '#635BFF', borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 600 }}>#{k}</span>)}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={acceptAI} style={{ flex: 1, background: 'linear-gradient(135deg,#635BFF,#007AFF)', color: 'white', border: 'none', borderRadius: 10, padding: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>✓ Use these details</button>
            <button onClick={() => images.length > 0 && runAI(images[activeIdx].file)} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', cursor: 'pointer', color: 'var(--muted)' }}><RefreshCw size={14} /></button>
          </div>
        </div>
      )}

      {aiAccepted && (
        <div style={{ margin: '0 14px 14px', background: '#F0FFF4', border: '1px solid #D6FFE4', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Check size={15} color="var(--green)" /><span style={{ fontSize: 12, color: '#1A7A30', fontWeight: 600 }}>AI details applied — edit anything</span>
        </div>
      )}

      {/* Service form */}
      <div style={{ padding: '0 14px 14px' }}>
        <div className="section-label" style={{ padding: 0, marginBottom: 14 }}>Service details</div>

        <div className="form-group">
          <label className="input-label">Service title</label>
          <input className="input" value={form.title} onChange={e => update('title', e.target.value)}
            placeholder="e.g. Scalp Micropigmentation — Full Head Treatment" />
        </div>

        <div className="form-group">
          <label className="input-label">Category — type to create new</label>
          <input className="input" value={form.category} onChange={e => update('category', e.target.value)}
            list="svcats" placeholder="Hair & Beauty, SMP, Tattoo..." />
          <datalist id="svcats">
            {SERVICE_CATEGORIES.map(c => <option key={c} value={c} />)}
          </datalist>
          {form.category && !SERVICE_CATEGORIES.find(c => c.toLowerCase() === form.category.toLowerCase()) && (
            <p style={{ fontSize: 11, color: '#635BFF', marginTop: 4 }}>✨ New category "{form.category}" will be created</p>
          )}
        </div>

        <div className="form-group">
          <label className="input-label">Experience level</label>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {EXPERIENCE_LEVELS.map(l => (
              <button key={l} onClick={() => update('experienceLevel', l)}
                style={{ background: form.experienceLevel === l ? '#F0F0FF' : 'var(--bg)', border: `1.5px solid ${form.experienceLevel === l ? '#635BFF' : 'var(--border)'}`, borderRadius: 9, padding: '7px 12px', fontSize: 11, color: form.experienceLevel === l ? '#635BFF' : 'var(--muted)', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="input-label">Description</label>
          <textarea className="input" value={form.description} onChange={e => update('description', e.target.value)}
            placeholder="Describe your service, what's included, your experience, and what to expect..." rows={4} />
        </div>

        <div className="form-group">
          <label className="input-label">Qualifications / Certifications</label>
          <input className="input" value={form.qualifications} onChange={e => update('qualifications', e.target.value)}
            placeholder="e.g. Certified SMP artist, 3 years experience, 200+ clients" />
        </div>

        <div className="form-row form-group">
          <div>
            <label className="input-label">Price (AUD)</label>
            <input className="input" type="number" value={form.price} onChange={e => update('price', e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <label className="input-label">Package price</label>
            <input className="input" type="number" value={form.packagePrice} onChange={e => update('packagePrice', e.target.value)} placeholder="Optional" />
          </div>
        </div>

        {form.packagePrice && (
          <div className="form-group">
            <label className="input-label">Package description</label>
            <input className="input" value={form.packageDescription} onChange={e => update('packageDescription', e.target.value)}
              placeholder="e.g. Full head + 1 touch-up session" />
          </div>
        )}

        <div className="form-group">
          <label className="input-label">How you deliver</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DELIVERY_OPTIONS.map(opt => (
              <button key={opt.id} onClick={() => update('delivery', opt.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', background: form.delivery === opt.id ? '#F0F0FF' : 'var(--bg)', border: `1.5px solid ${form.delivery === opt.id ? '#635BFF' : 'var(--border)'}`, borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s' }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{opt.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: form.delivery === opt.id ? '#635BFF' : 'var(--text)' }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{opt.desc}</div>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${form.delivery === opt.id ? '#635BFF' : 'var(--border)'}`, background: form.delivery === opt.id ? '#635BFF' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {form.delivery === opt.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="form-row form-group">
          <div>
            <label className="input-label">Service area</label>
            <input className="input" value={form.serviceArea} onChange={e => update('serviceArea', e.target.value)}
              placeholder="Ballajura, Perth WA" />
          </div>
          <div>
            <label className="input-label">Travel radius</label>
            <input className="input" value={form.travelRadius} onChange={e => update('travelRadius', e.target.value)}
              placeholder="e.g. 30km" />
          </div>
        </div>

        <div className="form-group">
          <label className="input-label">Availability</label>
          <input className="input" value={form.availability} onChange={e => update('availability', e.target.value)} placeholder="e.g. Weekdays 9am-5pm, weekends by appointment" />
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>(
              <button key={d} type="button" onClick={()=>{const days=form.availability?form.availability.split(',').map(x=>x.trim()).filter(Boolean):[];const idx=days.indexOf(d);if(idx>-1)days.splice(idx,1);else days.push(d);update('availability',days.join(', '));}}
                style={{padding:'7px 14px',borderRadius:20,border:'1.5px solid '+(form.availability&&form.availability.includes(d)?'#635BFF':'var(--border)'),background:form.availability&&form.availability.includes(d)?'#F0F0FF':'white',color:form.availability&&form.availability.includes(d)?'#635BFF':'var(--muted)',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
                {d}
              </button>
            ))}
          </div>
      
        </div>

      {/* Identity verification */}
      <div className="section-label">Identity verification</div>
      <div style={{ margin: '0 14px 14px' }}>
        <div className="verify-box">
          <div className="verify-row"><div className="verify-icon verify-done"><Check size={15} /></div><div><div className="verify-title">Email verified</div><div className="verify-sub">{user?.email || 'Sign in to verify'}</div></div></div>
          <div className="verify-row"><div className="verify-icon verify-done"><Check size={15} /></div><div><div className="verify-title">Mobile verified</div><div className="verify-sub">+61 4xx xxx xxx</div></div></div>
          <div className="verify-row"><div className="verify-icon verify-pending"><Clock size={15} /></div><div><div className="verify-title">Government ID required</div><div className="verify-sub">Driver's licence or passport to publish</div></div></div>
          <div className="verify-row"><div className="verify-icon verify-pending"><CreditCard size={15} /></div><div><div className="verify-title">Payment via Stripe</div><div className="verify-sub">We never store your card details</div></div></div>
        </div>
      </div>

      {/* Expiry info */}
      <div style={{ margin: '0 14px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Clock size={14} color="var(--muted)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          <strong style={{ color: 'var(--text)' }}>{getExpiryLabel(plan, 'service', isAdmin)}</strong>
          {plan !== 'annual' && !isAdmin && ' — renew for $1 or upgrade to annual unlimited selling'}
        </div>
      </div>
<div style={{margin:'0 14px 12px',background:'#FFF9E6',border:'1px solid #FFE4A0',borderRadius:12,padding:'10px 14px'}}>
        <div style={{fontSize:12,fontWeight:700,color:'#664400',marginBottom:3}}>📱 Show your social links on this listing</div>
        <div style={{fontSize:11,color:'#664400',lineHeight:1.6}}>Add your Instagram, Facebook and website in <strong>Profile → Edit profile</strong> — they will automatically appear on all your service listings.</div>
      </div>
      {/* Gate status */}
      <div style={{ margin: '0 14px 12px', background: 'var(--bg)', border: `1.5px solid ${gate.color}22`, borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: gate.color, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: gate.color }}>{gate.label}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{gate.sublabel}</div>
        </div>
      </div>

      <div style={{ padding: '0 14px 24px' }}>
        <button className="btn-primary" onClick={handleSubmit} disabled={submitting}
          style={{ background: 'linear-gradient(135deg, #635BFF, #007AFF)', boxShadow: '0 4px 14px rgba(99,91,255,0.3)' }}>
          {submitting ? 'Publishing...' : freeServicesRemaining > 0 || plan === 'annual' || isAdmin ? 'Publish service ⚡' : 'Pay $1 & publish ⚡'}
        </button>
      </div>

      {showMobileGate && (
        <MobileVerificationGate
          onVerified={handleMobileVerified}
          onDismiss={() => { setShowMobileGate(false); setPendingListingData(null) }}
        />
      )}
    </div>
  )
}
