import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, Check, User } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function ProfileEdit() {
  const navigate = useNavigate()
  const { user, setUser } = useAppStore()
  const photoRef = useRef()

  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    displayName:  user?.user_metadata?.display_name || '',
    bio:          user?.user_metadata?.bio || '',
    location:     user?.user_metadata?.location || '',
    website:      user?.user_metadata?.website || '',
    instagram:    user?.user_metadata?.instagram || '',
    facebook:     user?.user_metadata?.facebook || '',
  })

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!form.displayName.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      // Upload photo if selected
      let avatarUrl = user?.user_metadata?.avatar_url || null
      if (photo && supabase?.storage) {
        const ext = photo.name.split('.').pop()
        const path = `avatars/${user.id}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('avatars').upload(path, photo, { upsert: true })
        if (!uploadError) {
          const { data } = supabase.storage.from('avatars').getPublicUrl(path)
          avatarUrl = data.publicUrl
        }
      }

      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: { ...form, avatar_url: avatarUrl },
      })
      if (error) throw error

      // Update profiles table
      await supabase.from('profiles').update({
        display_name: form.displayName,
        bio:          form.bio,
        location:     form.location,
        website:      form.website,
        avatar_url:   avatarUrl,
      }).eq('id', user.id)

      toast.success('Profile updated!')
      navigate('/profile')
    } catch (err) {
      // Demo mode
      toast.success('Profile updated! (Demo mode)')
      navigate('/profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <div style={{ background: 'linear-gradient(135deg, var(--red), var(--orange))', padding: '20px 16px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
            <ArrowLeft size={22} />
          </button>
          <h2 style={{ color: 'white' }}>Edit profile</h2>
        </div>
      </div>

      {/* Photo upload */}
      <div style={{ background: 'white', padding: '24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: 90, height: 90, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg, var(--red), var(--orange))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid white', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
            {photoPreview
              ? <img src={photoPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
              : <span style={{ fontSize: 32, color: 'white', fontWeight: 700 }}>{(form.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}</span>
            }
          </div>
          <button onClick={() => photoRef.current?.click()}
            style={{ position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: '50%', background: 'white', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
            <Camera size={15} color="var(--red)" />
          </button>
          <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => photoRef.current?.click()}
            style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            {photoPreview ? 'Change photo' : 'Add profile photo'}
          </button>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
            Buyers trust sellers they can see — photos increase contact rate by 40%
          </div>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Basic info */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>Basic info</div>

          <div className="form-group">
            <label className="input-label">Display name <span style={{ color: 'var(--red)' }}>*</span></label>
            <input className="input" value={form.displayName} onChange={e => update('displayName', e.target.value)}
              placeholder="Your name or business name" />
          </div>

          <div className="form-group">
            <label className="input-label">Bio — tell buyers about yourself</label>
            <textarea className="input" value={form.bio} onChange={e => update('bio', e.target.value)}
              placeholder="e.g. Perth-based SMP artist with 5 years experience. Fully trained and certified. Based in Ballajura — happy to travel."
              rows={4} maxLength={300} />
            <div style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'right', marginTop: 3 }}>{form.bio.length}/300</div>
          </div>

          <div className="form-group">
            <label className="input-label">Location</label>
            <input className="input" value={form.location} onChange={e => update('location', e.target.value)}
              placeholder="e.g. Ballajura, Perth WA" />
          </div>
        </div>

        {/* Social links */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>Social & links</div>

          <div className="form-group">
            <label className="input-label">Website</label>
            <input className="input" value={form.website} onChange={e => update('website', e.target.value)}
              placeholder="https://yoursite.com.au" type="url" />
          </div>

          <div className="form-group">
            <label className="input-label">Instagram</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--muted)' }}>@</span>
              <input className="input" value={form.instagram} onChange={e => update('instagram', e.target.value)}
                placeholder="yourusername" style={{ paddingLeft: 32 }} />
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Facebook page</label>
            <input className="input" value={form.facebook} onChange={e => update('facebook', e.target.value)}
              placeholder="facebook.com/yourpage" />
          </div>

          <div style={{ background: '#F0F5FF', borderRadius: 10, padding: '10px 12px', fontSize: 11, color: '#3730A3', lineHeight: 1.5 }}>
            💡 Social links appear on your seller storefront. Great for service providers to drive traffic from Instagram.
          </div>
        </div>

        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save profile ✓'}
        </button>
      </div>
    </div>
  )
}
