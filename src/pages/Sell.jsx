import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Gift, Check, Clock, CreditCard, Camera, Sparkles, X, RefreshCw, Wand2, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { analyzeListingImage, removeBackground } from '../lib/aiListing'
import { publishListing, getGateStatus } from '../lib/listingGate'
import { getExpiryLabel } from '../lib/expiry'
import { getCategoryGroupById, CATEGORY_GROUPS } from '../lib/categories'
import { CategoryFields } from '../components/listings/CategoryFields'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const SHIPPING_OPTIONS = [
  { id: 'free_shipping',   label: 'Free shipping',          icon: '📦', desc: 'You cover postage' },
  { id: 'buyer_pays',      label: 'Buyer pays shipping',    icon: '💸', desc: 'Buyer covers postage' },
  { id: 'pickup_only',     label: 'Local pickup only',      icon: '🚗', desc: 'Collect in person — no posting' },
  { id: 'shipping_pickup', label: 'Shipping + pickup',      icon: '📦🚗', desc: 'Buyer chooses either' },
  { id: 'international',   label: 'International',          icon: '🌍', desc: 'Ships worldwide' },
]
const CONDITIONS = ['New', 'Like new', 'Good', 'Fair', 'For parts']

function AIAnalyzing({ imagePreview }) {
  const [step, setStep] = useState(0)
  const steps = ['Identifying item...', 'Assessing condition...', 'Writing description...', 'Estimating value...', 'Almost done...']
  useState(() => {
    const iv = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 800)
    return () => clearInterval(iv)
  }, [])
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,15,0.85)', zIndex: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ background: 'white', borderRadius: 24, padding: 28, width: '100%', maxWidth: 340, textAlign: 'center' }}>
        {imagePreview && <div style={{ width: 90, height: 90, borderRadius: 16, overflow: 'hidden', margin: '0 auto 16px', border: '3px solid var(--border)' }}><img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,var(--red),var(--orange))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><Sparkles size={26} color="white" /></div>
        <h3 style={{ marginBottom: 6 }}>AI analysing your item</h3>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 18 }}>{steps[step]}</p>
        <div style={{ background: 'var(--bg)', borderRadius: 20, height: 6, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'linear-gradient(135deg,var(--red),var(--orange))', borderRadius: 20, width: `${((step+1)/steps.length)*100}%`, transition: 'width 0.6s ease' }} />
        </div>
      </div>
    </div>
  )
}

export default function Sell() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const groupId = searchParams.get('group') || 'general'
  const categoryGroup = getCategoryGroupById(groupId)

  const { user, categories, addCategory, plan, freeListingsRemaining, useFreeListings, isAdmin } = useAppStore()
  const fileInputRef = useRef()
  const cameraInputRef = useRef()
  const [showPhotoSheet, setShowPhotoSheet] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('annual')
  const [shipping, setShipping] = useState('free_shipping')
  const [pickupSuburb, setPickupSuburb] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [images, setImages] = useState([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [removingBg, setRemovingBg] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [aiAccepted, setAiAccepted] = useState(false)
  const [form, setForm] = useState({ title: '', category: '', description: '', price: '', bundlePrice: '', condition: 'Good', location: '' })
  const [categoryFields, setCategoryFields] = useState({})
  const update = (f, v) => setForm(prev => ({ ...prev, [f]: v }))

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 5)
    const imgs = files.map(file => ({ file, preview: URL.createObjectURL(file), cleaned: null }))
    setImages(prev => [...prev, ...imgs].slice(0, 5))
    setActiveIdx(0)
    // Don't auto-run AI — wait for seller to enter title first
    toast('Photo added — enter a title then tap Generate with AI ✨', { duration: 3000 })
  }

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_,i) => i !== idx))
    if (activeIdx >= idx && activeIdx > 0) setActiveIdx(activeIdx - 1)
  }

  const runAI = async () => {
    if (!form.title.trim()) {
      toast.error('Enter a title first so AI knows what you\'re selling')
      return
    }
    if (images.length === 0) {
      toast.error('Add a photo first')
      return
    }
    setAnalyzing(true)
    setAiResult(null)
    setAiAccepted(false)
    try {
      const result = await analyzeListingImage(images[activeIdx].file, categories, form.title)
      setAiResult(result)
    } catch {
      setAiResult({
        title: form.title,
        description: `${form.title} in good condition. Well maintained and ready to use. All accessories included. Feel free to ask any questions.`,
        category: categoryGroup?.categories?.[0] || 'General',
        suggestedPrice: 50,
        condition: 'Good',
        keywords: ['bargain', 'forsale'],
      })
      toast('AI suggestion ready — edit anything you like', { icon: '✨', duration: 3000 })
    } finally {
      setAnalyzing(false)
    }
  }

  const acceptAI = () => {
    if (!aiResult) return
    // Don't overwrite title — seller already typed it
    if (!form.title && aiResult.title) update('title', aiResult.title)
    update('description', aiResult.description)
    update('category', aiResult.category)
    update('price', String(aiResult.suggestedPrice))
    update('condition', aiResult.condition)
    if (aiResult.category) addCategory(aiResult.category)
    setAiAccepted(true)
    toast.success('AI details applied — edit anything you like ✏️')
  }

  const handleRemoveBg = async () => {
    if (!images[activeIdx]) return
    setRemovingBg(true)
    try {
      const url = await removeBackground(images[activeIdx].file)
      setImages(prev => prev.map((img,i) => i === activeIdx ? { ...img, cleaned: url } : img))
      toast.success('Background removed!')
    } catch {
      toast.error('Add PhotoRoom API key in .env to enable')
    } finally {
      setRemovingBg(false)
    }
  }

  const handleSubmit = async () => {
    if (!user) { toast.error('Please log in'); navigate('/login'); return }
    if (!form.title || !form.price || !form.category) { toast.error('Fill in title, category and price'); return }
    if (form.category) addCategory(form.category)
    setSubmitting(true)

    const listingData = {
      title: form.title,
      category: form.category || categoryGroup?.categories?.[0] || 'General',
      description: form.description,
      price: parseFloat(form.price),
      bundle_price: form.bundlePrice ? parseFloat(form.bundlePrice) : null,
      shipping_option: shipping,
      pickup_suburb: pickupSuburb || null,
      location: form.location || pickupSuburb,
      condition: form.condition,
      ai_assisted: !!aiResult,
      category_group: categoryGroup?.id || 'general',
      category_fields: Object.keys(categoryFields).length > 0 ? JSON.stringify(categoryFields) : null,
    }

    const sellerProfile = {
      id: user.id,
      plan,
      freeListingsRemaining,
      stripeConnectReady: user.stripe_connect_ready || false,
      isAdmin,
    }

    await publishListing(listingData, sellerProfile, {
      onSuccess: (listing, meta) => {
        setSubmitting(false)
        if (meta.usedFree) {
          useFreeListings()
          toast.success(`Listing published! ${freeListingsRemaining - 1} free listings remaining ⚡`)
        } else {
          toast.success('Listing published! ⚡')
        }
        navigate('/dashboard')
      },
      onNeedsPayment: (checkoutUrl, listingId) => {
        setSubmitting(false)
        if (checkoutUrl) {
          toast('Redirecting to payment — $1 to publish', { icon: '💳' })
          window.location.href = checkoutUrl
        } else {
          // Demo mode — no Stripe configured
          toast.success('Demo: Listing saved — add Stripe keys to enable $1 payment ⚡')
          navigate('/dashboard')
        }
      },
      onError: (msg) => {
        setSubmitting(false)
        toast.error(msg || 'Failed to publish listing')
      },
    })
  }

  const currentPreview = images[activeIdx] ? (images[activeIdx].cleaned || images[activeIdx].preview) : null

  return (
    <div className="page">
      {analyzing && <AIAnalyzing imagePreview={images[0]?.preview} />}

      <div style={{ background: `linear-gradient(135deg, ${categoryGroup?.id !== 'general' && categoryGroup?.color ? categoryGroup.color : 'var(--red)'}, var(--orange))`, padding: '22px 20px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 22 }}>{categoryGroup?.icon || '📦'}</span>
          <h2 style={{ color: 'white' }}>{categoryGroup?.id !== 'general' ? `List ${categoryGroup?.label}` : 'List an item'}</h2>
          <span style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><Sparkles size={10} /> AI POWERED</span>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{freeListingsRemaining > 0 ? `${freeListingsRemaining} free listings remaining` : 'Choose a plan to keep selling'}</p>
      </div>

      {freeListingsRemaining > 0 && (
        <div style={{ margin: 14, background: '#FFF9E6', border: '1.5px solid var(--yellow)', borderRadius: 16, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Gift size={22} color="#CC9900" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: '#664400', lineHeight: 1.5 }}><strong style={{ color: '#CC6600' }}>{freeListingsRemaining} free listings remaining.</strong> After that, choose a plan.</p>
        </div>
      )}

      <div style={{ padding: '0 14px 14px' }}>
        <div className="plan-grid">
          <div className={`plan-card ${selectedPlan==='per_listing'?'selected':''}`} onClick={() => setSelectedPlan('per_listing')}>
            <div className="plan-name">Pay per listing</div><div className="plan-price">$1<span>/listing</span></div>
            <div className="plan-features">Pay as you go<br/>No commitment<br/><b>Casual sellers</b></div>
          </div>
          <div className={`plan-card best-value ${selectedPlan==='annual'?'selected':''}`} onClick={() => setSelectedPlan('annual')}>
            <div className="plan-name">Annual unlimited</div><div className="plan-price">$50<span>/year</span></div>
            <div className="plan-features">Unlimited selling<br/>Bundle deals<br/><b>Power sellers ⚡</b></div>
          </div>
        </div>
      </div>

      {/* IMAGE UPLOAD */}
      <div style={{ padding: '0 14px 14px' }}>
        <div className="section-label" style={{ padding: 0, marginBottom: 12 }}>Photos — AI auto-fills details from your first photo</div>

        {currentPreview ? (
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: 10, background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <img src={currentPreview} alt="Listing" style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, display: 'flex', gap: 8 }}>
              <button onClick={() => runAI(images[activeIdx].file)} style={{ flex: 1, background: 'rgba(10,10,15,0.8)', color: 'white', border: 'none', borderRadius: 10, padding: '9px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}><Wand2 size={13} /> Re-analyse</button>
              <button onClick={handleRemoveBg} disabled={removingBg} style={{ flex: 1, background: 'rgba(255,255,255,0.92)', color: 'var(--text)', border: 'none', borderRadius: 10, padding: '9px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}><ImageIcon size={13} /> {removingBg ? 'Processing...' : 'Remove BG'}</button>
            </div>
            {images[activeIdx]?.cleaned && <div style={{ position: 'absolute', top: 10, right: 10, background: 'var(--green)', color: 'white', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>✓ BG REMOVED</div>}
          </div>
        ) : (
          <button onClick={() => setShowPhotoSheet(true)} style={{ width: '100%', height: 200, background: 'var(--bg)', border: '2px dashed var(--border)', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer', marginBottom: 10 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,var(--red),var(--orange))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Camera size={26} color="white" /></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Upload photos</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>AI auto-fills title, description & price ✨</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg,var(--red),var(--orange))', color: 'white', borderRadius: 10, padding: '8px 20px', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><Sparkles size={13} /> Choose photos</div>
          </button>
        )}

        {images.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            {images.map((img,idx) => (
              <div key={idx} onClick={() => setActiveIdx(idx)} style={{ position: 'relative', width: 60, height: 60, borderRadius: 10, overflow: 'hidden', border: `2px solid ${activeIdx===idx?'var(--red)':'var(--border)'}`, cursor: 'pointer', flexShrink: 0 }}>
                <img src={img.cleaned||img.preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={e => { e.stopPropagation(); removeImage(idx) }} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}><X size={10} /></button>
              </div>
            ))}
            {images.length < 5 && <button onClick={() => setShowPhotoSheet(true)} style={{ width: 60, height: 60, borderRadius: 10, border: '2px dashed var(--border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--muted)', flexShrink: 0, fontSize: 24 }}>+</button>}
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageUpload} />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleImageUpload} />
        <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5 }}><ImageIcon size={11} /> Background removal powered by PhotoRoom API</div>
      </div>

      {/* Photo action sheet */}
      {showPhotoSheet && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300 }}>
          {/* Backdrop */}
          <div onClick={() => setShowPhotoSheet(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          {/* Sheet */}
          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: 'white', borderRadius: '20px 20px 0 0', padding: '12px 16px 32px' }}>
            <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 20px' }} />
            <h3 style={{ marginBottom: 16, textAlign: 'center' }}>Add photos</h3>

            {/* Take photo */}
            <button onClick={() => { setShowPhotoSheet(false); cameraInputRef.current?.click() }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '16px', background: 'linear-gradient(135deg, #FFF0F3, #FFF5F0)', border: '1.5px solid #FFD0D8', borderRadius: 16, cursor: 'pointer', marginBottom: 10, fontFamily: 'inherit' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, var(--red), var(--orange))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Camera size={24} color="white" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>Take photo now</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Opens camera — AI analyses it instantly</div>
              </div>
            </button>

            {/* Choose from library */}
            <button onClick={() => { setShowPhotoSheet(false); fileInputRef.current?.click() }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '16px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 16, cursor: 'pointer', fontFamily: 'inherit' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'white', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ImageIcon size={24} color="var(--muted)" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>Choose from library</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Pick up to 5 photos from your phone</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* AI RESULT */}
      {aiResult && !aiAccepted && (
        <div style={{ margin: '0 14px 14px', background: 'linear-gradient(135deg,#FFF0F3,#FFF5F0)', border: '1.5px solid var(--red)', borderRadius: 16, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Sparkles size={16} color="var(--red)" />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--red)' }}>AI suggested details</span>
            <span style={{ marginLeft: 'auto', background: 'var(--green)', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>READY TO EDIT</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            <div style={{ background: 'white', borderRadius: 10, padding: '8px 10px' }}><div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, marginBottom: 2 }}>CONDITION</div><div style={{ fontSize: 13, fontWeight: 600 }}>{aiResult.condition}</div></div>
            <div style={{ background: 'white', borderRadius: 10, padding: '8px 10px' }}><div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, marginBottom: 2 }}>SUGGESTED PRICE</div><div style={{ fontSize: 13, fontWeight: 700, color: 'var(--red)' }}>${aiResult.suggestedPrice} AUD</div></div>
          </div>
          {aiResult.shippingNote && <div style={{ background: 'white', borderRadius: 10, padding: '8px 10px', marginBottom: 10, fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 6 }}><AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />{aiResult.shippingNote}</div>}
          {aiResult.keywords?.length > 0 && <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>{aiResult.keywords.map(k => <span key={k} style={{ background: 'rgba(255,45,85,0.1)', color: 'var(--red)', borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 600 }}>#{k}</span>)}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={acceptAI} style={{ flex: 1, background: 'linear-gradient(135deg,var(--red),var(--orange))', color: 'white', border: 'none', borderRadius: 10, padding: '10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>✓ Use these details</button>
            <button onClick={() => images.length > 0 && runAI(images[activeIdx].file)} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', cursor: 'pointer', color: 'var(--muted)' }}><RefreshCw size={14} /></button>
          </div>
        </div>
      )}

      {aiAccepted && (
        <div style={{ margin: '0 14px 14px', background: '#F0FFF4', border: '1px solid #D6FFE4', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Check size={15} color="var(--green)" /><span style={{ fontSize: 12, color: '#1A7A30', fontWeight: 600 }}>AI details applied — review and edit below</span>
        </div>
      )}

      {/* FORM */}
      <div style={{ padding: '0 14px 14px' }}>

        {/* Category group banner */}
        {categoryGroup && categoryGroup.id !== 'general' && (
          <div style={{ background: categoryGroup.bg, border: `1.5px solid ${categoryGroup.border}`, borderRadius: 14, padding: '12px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>{categoryGroup.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: categoryGroup.color }}>{categoryGroup.label} listing</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Fields tailored for {categoryGroup.label.toLowerCase()}</div>
            </div>
            <button onClick={() => navigate('/sell')}
              style={{ fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Change ›
            </button>
          </div>
        )}

        <div className="section-label" style={{ padding: 0, marginBottom: 14 }}>Listing details</div>
        <div className="form-group">
          <label className="input-label">Title — what are you selling?</label>
          <input className="input" value={form.title} onChange={e => update('title', e.target.value)}
            placeholder="e.g. iPhone 14 Pro 256GB Space Black" />
          {/* Generate with AI button — shows once photo is added and title entered */}
          {images.length > 0 && (
            <button onClick={runAI} disabled={analyzing || !form.title.trim()}
              style={{ marginTop: 8, width: '100%', background: form.title.trim() ? 'linear-gradient(135deg, #635BFF, #007AFF)' : 'var(--bg)', border: `1.5px solid ${form.title.trim() ? '#635BFF' : 'var(--border)'}`, borderRadius: 12, padding: '10px', fontSize: 13, fontWeight: 700, cursor: form.title.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit', color: form.title.trim() ? 'white' : 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s', boxShadow: form.title.trim() ? '0 4px 12px rgba(99,91,255,0.3)' : 'none' }}>
              <Sparkles size={16} />
              {analyzing ? 'Generating...' : form.title.trim() ? '✨ Generate description, price & condition with AI' : 'Enter a title above to use AI'}
            </button>
          )}
          {images.length === 0 && (
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>Add a photo above, then enter your title to generate listing details with AI</p>
          )}
        </div>
        <div className="form-group">
          <label className="input-label">Category</label>
          {categoryGroup && categoryGroup.id !== 'general' ? (
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {categoryGroup.categories.map(cat => (
                <button key={cat} onClick={() => update('category', cat)}
                  style={{ background: form.category === cat ? categoryGroup.bg : 'var(--bg)', border: `1.5px solid ${form.category === cat ? categoryGroup.color : 'var(--border)'}`, borderRadius: 20, padding: '6px 12px', fontSize: 12, color: form.category === cat ? categoryGroup.color : 'var(--muted)', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
                  {cat}
                </button>
              ))}
            </div>
          ) : (
            <>
              <input className="input" value={form.category} onChange={e => update('category', e.target.value)} list="cats" placeholder="Electronics, Clothing... or type your own" />
              <datalist id="cats">{categories.map(c => <option key={c} value={c} />)}</datalist>
              {form.category && !categories.find(c => c.toLowerCase() === form.category.toLowerCase()) && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>✨ New category "{form.category}" will be created</p>}
            </>
          )}
        </div>

        {/* Category-specific fields */}
        {categoryGroup && categoryGroup.fields.length > 0 && (
          <CategoryFields
            group={categoryGroup}
            values={categoryFields}
            onChange={setCategoryFields}
          />
        )}

        <div className="form-group">
          <label className="input-label">Condition</label>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {CONDITIONS.map(c => <button key={c} onClick={() => update('condition', c)} style={{ background: form.condition===c?'#FFF0F3':'var(--bg)', border: `1.5px solid ${form.condition===c?'var(--red)':'var(--border)'}`, borderRadius: 9, padding: '7px 12px', fontSize: 11, color: form.condition===c?'var(--red)':'var(--muted)', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>{c}</button>)}
          </div>
        </div>
        <div className="form-group"><label className="input-label">Description</label><textarea className="input" value={form.description} onChange={e => update('description', e.target.value)} placeholder="Condition, brand, size, any details..." rows={4} /></div>
        <div className="form-row form-group">
          <div><label className="input-label">Price (AUD)</label><input className="input" type="number" value={form.price} onChange={e => update('price', e.target.value)} placeholder="0.00" /></div>
          <div><label className="input-label">Bundle price</label><input className="input" type="number" value={form.bundlePrice} onChange={e => update('bundlePrice', e.target.value)} placeholder="Optional" /></div>
        </div>
        <div className="form-group">
          <label className="input-label">Shipping & pickup</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
            {SHIPPING_OPTIONS.map(opt => (
              <button key={opt.id} onClick={() => setShipping(opt.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', background: shipping === opt.id ? '#FFF0F3' : 'var(--bg)', border: `1.5px solid ${shipping === opt.id ? 'var(--red)' : 'var(--border)'}`, borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s' }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{opt.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: shipping === opt.id ? 'var(--red)' : 'var(--text)' }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{opt.desc}</div>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${shipping === opt.id ? 'var(--red)' : 'var(--border)'}`, background: shipping === opt.id ? 'var(--red)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {shipping === opt.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                </div>
              </button>
            ))}
          </div>

          {/* Pickup suburb — shown when pickup is selected */}
          {(shipping === 'pickup_only' || shipping === 'shipping_pickup') && (
            <div style={{ background: '#FFF9E6', border: '1.5px solid var(--yellow)', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#664400', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                🚗 Pickup location
              </div>
              <input className="input" value={pickupSuburb} onChange={e => setPickupSuburb(e.target.value)}
                placeholder="Suburb, State (e.g. Ballajura, Perth WA)"
                style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 11, color: '#664400', lineHeight: 1.5 }}>
                Only your <strong>suburb and state</strong> is shown publicly. Your full address is shared privately via messages once you agree on a sale.
              </p>
            </div>
          )}

          {/* Duty warning */}
          {shipping === 'international' && (
            <div className="duty-warning" style={{ marginTop: 8 }}>
              ⚠️ International buyers may incur customs duties and taxes. Please ensure buyers check their country's import conditions before purchasing.
            </div>
          )}
        </div>
        <div className="form-group"><label className="input-label">Location</label><input className="input" value={form.location} onChange={e => update('location', e.target.value)} placeholder="Suburb, State, Country" /></div>
      </div>

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
          <strong style={{ color: 'var(--text)' }}>{getExpiryLabel(plan, 'item', isAdmin)}</strong>
          {plan !== 'annual' && !isAdmin && ' — renew for $1 or upgrade to annual unlimited selling'}
        </div>
      </div>

      {/* Gate status — tells seller exactly what happens on publish */}
      {(() => {
        const gate = getGateStatus({ plan, freeListingsRemaining, isAdmin })
        return (
          <div style={{ margin: '0 14px 12px', background: 'var(--bg)', border: `1.5px solid ${gate.color}22`, borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: gate.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: gate.color }}>{gate.label}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{gate.sublabel}</div>
            </div>
          </div>
        )
      })()}

      <div style={{ padding: '0 14px 24px' }}>
        <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Processing...' : freeListingsRemaining > 0 || plan === 'annual' ? 'Publish listing ⚡' : 'Pay $1 & publish ⚡'}
        </button>
      </div>
    </div>
  )
}
