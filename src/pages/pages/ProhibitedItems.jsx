import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Shield, AlertTriangle, Check } from 'lucide-react'

const PROHIBITED = [
  {
    category: 'Weapons and dangerous goods',
    icon: '🔫',
    color: '#FF2D55',
    bg: '#FFF0F3',
    items: [
      'Firearms, ammunition and firearm parts — licensed dealers only, never on this platform',
      'Knives with blades over 10cm, flick knives, butterfly knives, disguised knives',
      'Tasers, pepper spray and other prohibited weapons',
      'Crossbows and prohibited archery equipment',
      'Explosive materials, fireworks and pyrotechnics',
      'Swords, machetes and replica weapons',
    ]
  },
  {
    category: 'Illegal and regulated items',
    icon: '🚫',
    color: '#FF2D55',
    bg: '#FFF0F3',
    items: [
      'Illegal drugs, drug paraphernalia and controlled substances',
      'Prescription medications and pharmaceutical drugs',
      'Stolen goods or items obtained illegally',
      'Counterfeit goods — fake designer brands, replica electronics',
      'Pirated software, games, movies or music',
      'Items that violate Australian customs and import laws',
      'Products containing restricted chemicals or substances',
    ]
  },
  {
    category: 'Adult and explicit content',
    icon: '🔞',
    color: '#FF6B00',
    bg: '#FFF5F0',
    items: [
      'Explicit adult content, pornography or sexual material',
      'Sex toys or adult products — unless sold by a licensed retailer with appropriate age verification',
      'Any content involving minors in any capacity',
      'Escort or adult services of any kind',
    ]
  },
  {
    category: 'Animals',
    icon: '🐾',
    color: '#FF6B00',
    bg: '#FFF5F0',
    items: [
      'Endangered or protected species under Australian law',
      'Wild-caught native Australian animals',
      'Any animal sold without appropriate health checks and documentation',
      'Animals from unregistered breeders where registration is legally required',
      'Ivory, rhino horn or products made from protected animals',
    ]
  },
  {
    category: 'Financial and identity',
    icon: '💳',
    color: '#635BFF',
    bg: '#F0F0FF',
    items: [
      'Credit cards, bank account details or financial credentials',
      'Government IDs, passports, driver licences — real or fake',
      'Social media accounts, email accounts or online service accounts',
      'Lottery tickets, raffle entries or gambling products',
      'Pyramid schemes, multi-level marketing recruitment',
      'Fake reviews, followers, likes or engagement',
    ]
  },
  {
    category: 'Hazardous materials',
    icon: '☢️',
    color: '#FF9500',
    bg: '#FFF9E6',
    items: [
      'Asbestos-containing products',
      'Recalled or unsafe products — check productrecall.gov.au',
      'Items that do not meet Australian safety standards',
      'Chemicals classified as dangerous goods under Australian regulations',
      'Used syringes, medical waste or biohazard materials',
    ]
  },
  {
    category: 'Prohibited services',
    icon: '🛠️',
    color: '#007AFF',
    bg: '#F0F5FF',
    items: [
      'Services that require an Australian licence being offered without one (electrical, plumbing, gas fitting)',
      'Services that are illegal in Australia',
      'Hacking, data breach or cybersecurity attack services',
      'Doxxing, stalking or harassment services',
      'Contract cheating or academic fraud services',
      'Fake document creation or forgery services',
    ]
  },
  {
    category: 'Other prohibited items',
    icon: '⚠️',
    color: '#FF9500',
    bg: '#FFF9E6',
    items: [
      'Human body parts, organs or bodily fluids',
      'Items promoting hate, racism or discrimination',
      'Surveillance or tracking devices intended for illegal use',
      'Lock picks, master keys or burglary tools',
      'Any item or service prohibited by Australian federal or state law',
    ]
  },
]

const ALLOWED_NOTE = [
  'Legally owned and registered firearms (WA licence holders) — must follow all state laws',
  'Alcohol sold by licensed retailers in accordance with WA Liquor Control Act',
  'Prescription eyewear listed by registered optometrists',
  'Approved self-defence products where legal in the seller\'s state',
]

export default function ProhibitedItems() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <div style={{ background: 'linear-gradient(135deg, var(--red), var(--orange))', padding: '20px 16px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
            <ArrowLeft size={22} />
          </button>
          <div>
            <h2 style={{ color: 'white', marginBottom: 2 }}>Prohibited items</h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>What you cannot sell on Sell Like Crazy</p>
          </div>
        </div>
      </div>

      <div style={{ padding: 16 }}>

        {/* Warning banner */}
        <div style={{ background: '#FFF0F3', border: '1.5px solid var(--red)', borderRadius: 16, padding: '14px 16px', marginBottom: 20, display: 'flex', gap: 12 }}>
          <AlertTriangle size={22} color="var(--red)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--red)', marginBottom: 4 }}>Listing prohibited items will result in account suspension</div>
            <div style={{ fontSize: 12, color: '#990020', lineHeight: 1.6 }}>
              We review all listings and reports. Listings that violate this policy are removed immediately. Repeated violations or deliberate listings of prohibited items result in permanent account suspension and may be referred to Australian authorities.
            </div>
          </div>
        </div>

        {/* Prohibited categories */}
        {PROHIBITED.map(section => (
          <div key={section.category} style={{ marginBottom: 16 }}>
            <div style={{ background: section.bg, border: `1.5px solid ${section.color}33`, borderRadius: 16, overflow: 'hidden' }}>
              {/* Category header */}
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${section.color}22`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>{section.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: section.color }}>{section.category}</span>
              </div>
              {/* Items */}
              <div style={{ padding: '10px 16px 14px' }}>
                {section.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < section.items.length - 1 ? 8 : 0 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: section.color, flexShrink: 0, marginTop: 6 }} />
                    <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Edge cases — what IS allowed */}
        <div style={{ background: '#F0FFF4', border: '1.5px solid #D6FFE4', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Check size={18} color="var(--green)" />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1A7A30' }}>Edge cases that ARE allowed</span>
          </div>
          <div style={{ fontSize: 12, color: '#1A7A30', marginBottom: 8, lineHeight: 1.5 }}>
            The following items may be listed under strict conditions:
          </div>
          {ALLOWED_NOTE.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < ALLOWED_NOTE.length - 1 ? 8 : 0 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0, marginTop: 6 }} />
              <span style={{ fontSize: 12, color: '#1A7A30', lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Reporting */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={16} color="#635BFF" /> See something that shouldn't be here?
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 12 }}>
            Open the listing and tap "Report this listing" at the bottom of the page. We review all reports within 24 hours.
          </p>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
            For urgent safety concerns — weapons, drugs, scams targeting vulnerable people — email us directly at{' '}
            <strong style={{ color: 'var(--text)' }}>sales@selllikecrazy.app</strong>
          </p>
        </div>

        {/* Legal note */}
        <div style={{ padding: '8px 0 24px', textAlign: 'center', fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>
          This policy is in addition to our{' '}
          <button onClick={() => navigate('/legal/terms')}
            style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', textDecoration: 'underline' }}>
            Terms of Service
          </button>
          . Items prohibited by Australian law are also prohibited on this platform regardless of whether they appear on this list. Last updated August 2026.
        </div>
      </div>
    </div>
  )
}
