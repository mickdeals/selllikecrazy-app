import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const TERMS = {
  title: 'Terms of Service',
  lastUpdated: 'August 2026',
  sections: [
    {
      heading: '1. Introduction',
      content: 'Welcome to Sell Like Crazy ("we", "us", "our"). By accessing or using the Sell Like Crazy platform available at selllikecrazy.app, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.',
    },
    {
      heading: '2. The Platform',
      content: 'Sell Like Crazy is a marketplace platform that connects buyers and sellers of physical goods and services. We do not buy, sell, or take possession of any items or services listed on the platform. We are not a party to any transaction between buyers and sellers.',
    },
    {
      heading: '3. Seller Accounts and Age Requirement',
      content: 'Sell Like Crazy is an 18+ platform. You must be 18 years of age or older to create an account, buy, or sell on this platform. By creating an account you confirm you are 18 or over. This confirmation is recorded on your account. To list items or services, sellers must also verify their email address, verify their mobile number, and provide valid government-issued photo identification. We reserve the right to suspend any account where we have reason to believe the user is under 18.',
    },
    {
      heading: '4. Seller Responsibility and Liability',
      content: 'Sellers are solely responsible for: the accuracy of all listing information including title, description, photos, price and condition; ensuring items are legal to sell in Australia and the buyer\'s country; complying with all applicable laws including consumer protection laws; the safe delivery or provision of goods or services; resolving disputes with buyers directly. Sell Like Crazy takes no responsibility for any transaction, dispute, loss, damage, or harm arising from listings or transactions on the platform.',
    },
    {
      heading: '5. Prohibited Items and Services',
      content: 'The following are strictly prohibited on Sell Like Crazy: illegal goods or services; dangerous weapons or substances; counterfeit or stolen goods; adult content or services; animals (live); recalled or unsafe products; any item or service prohibited by Australian law. Sell Like Crazy reserves the right to remove any listing and suspend any account at any time without notice.',
    },
    {
      heading: '6. Buyer Responsibility',
      content: 'Buyers are responsible for: conducting their own due diligence before purchasing; understanding import duties and customs charges applicable in their country; communicating directly with sellers to resolve any issues. Sell Like Crazy is not responsible for the quality, safety, legality or availability of any listed item or service.',
    },
    {
      heading: '7. International Purchases',
      content: 'International buyers may incur customs duties, taxes, and import charges. These charges are the sole responsibility of the buyer. Sell Like Crazy makes no representations about the customs requirements of any country. Buyers should check their country\'s import conditions before purchasing.',
    },
    {
      heading: '8. Payments',
      content: 'Seller subscription fees ($1 per listing or $50 per year) are charged by Sell Like Crazy via Stripe. Annual subscriptions auto-renew each year unless cancelled. Transaction payments between buyers and sellers are processed directly via Stripe Connect. Sell Like Crazy takes no commission on sales between buyers and sellers.',
    },
    {
      heading: '9. Intellectual Property',
      content: 'Sellers retain ownership of their listing content. By posting content, you grant Sell Like Crazy a non-exclusive licence to display, reproduce and distribute your content for the purposes of operating the platform.',
    },
    {
      heading: '10. Limitation of Liability',
      content: 'To the maximum extent permitted by Australian law, Sell Like Crazy, its directors, employees and agents shall not be liable for any indirect, incidental, special, consequential or punitive damages arising from your use of the platform or any transaction conducted through the platform.',
    },
    {
      heading: '11. Governing Law',
      content: 'These Terms are governed by the laws of Western Australia, Australia. Any disputes shall be subject to the exclusive jurisdiction of the courts of Western Australia.',
    },
    {
      heading: '12. Changes to Terms',
      content: 'We may update these Terms at any time. Continued use of the platform after changes constitutes acceptance of the updated Terms.',
    },
    {
      heading: '13. Contact',
      content: 'For any questions about these Terms, contact us at: sales@aussietoys.au',
    },
  ],
}

const PRIVACY = {
  title: 'Privacy Policy',
  lastUpdated: 'August 2026',
  sections: [
    {
      heading: '1. Information We Collect',
      content: 'We collect information you provide directly: name, email address, mobile number, government ID (for seller verification), payment information (processed by Stripe — we do not store card details), listing content including photos and descriptions, messages between users, and location information for listings.',
    },
    {
      heading: '2. How We Use Your Information',
      content: 'We use your information to: operate and improve the platform; verify seller identities; process payments via Stripe; send notifications about offers, messages and listing activity; detect and prevent fraud; comply with legal obligations.',
    },
    {
      heading: '3. Information Sharing',
      content: 'We do not sell your personal information. We share information with: Stripe (payment processing); Supabase (data storage, hosted in Australia); push notification providers; law enforcement when required by law. Seller usernames, ratings and listing information are publicly visible.',
    },
    {
      heading: '4. Data Storage',
      content: 'Your data is stored on Supabase servers. We select Australian data regions where available. We retain your data for as long as your account is active or as required by law.',
    },
    {
      heading: '5. Your Rights',
      content: 'Under the Australian Privacy Act 1988, you have the right to: access your personal information; correct inaccurate information; request deletion of your account and data; opt out of marketing communications. Contact us at sales@aussietoys.au to exercise these rights.',
    },
    {
      heading: '6. Cookies',
      content: 'We use essential cookies and local storage to keep you logged in and remember your preferences. We do not use advertising cookies or share data with advertising networks.',
    },
    {
      heading: '7. Security',
      content: 'We implement industry-standard security measures including HTTPS encryption, Supabase Row Level Security, and Stripe\'s PCI DSS Level 1 certified payment processing. No method of transmission or storage is 100% secure.',
    },
    {
      heading: '8. Children',
      content: 'Sell Like Crazy is not intended for users under 18 years of age. We do not knowingly collect personal information from minors.',
    },
    {
      heading: '9. Changes',
      content: 'We may update this Privacy Policy from time to time. We will notify you of significant changes via email or in-app notification.',
    },
    {
      heading: '10. Contact',
      content: 'For privacy enquiries: sales@aussietoys.au\n\nSell Like Crazy\nBallajura, Perth WA 6066\nAustralia',
    },
  ],
}

export default function Legal() {
  const navigate = useNavigate()
  const { type } = useParams()
  const doc = type === 'privacy' ? PRIVACY : TERMS

  return (
    <div className="page">
      <div style={{ background: 'linear-gradient(135deg, var(--red), var(--orange))', padding: '20px 16px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
            <ArrowLeft size={22} />
          </button>
          <div>
            <h2 style={{ color: 'white', marginBottom: 2 }}>{doc.title}</h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Last updated: {doc.lastUpdated}</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Toggle between Terms and Privacy */}
        <div style={{ display: 'flex', background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: 4, marginBottom: 20 }}>
          <button onClick={() => navigate('/legal/terms')}
            style={{ flex: 1, padding: '9px', borderRadius: 9, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: type !== 'privacy' ? 'linear-gradient(135deg, var(--red), var(--orange))' : 'transparent', color: type !== 'privacy' ? 'white' : 'var(--muted)' }}>
            Terms of Service
          </button>
          <button onClick={() => navigate('/legal/privacy')}
            style={{ flex: 1, padding: '9px', borderRadius: 9, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: type === 'privacy' ? 'linear-gradient(135deg, var(--red), var(--orange))' : 'transparent', color: type === 'privacy' ? 'white' : 'var(--muted)' }}>
            Privacy Policy
          </button>
        </div>

        {doc.sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{s.heading}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{s.content}</div>
          </div>
        ))}

        <div style={{ marginTop: 24, padding: '16px', background: 'var(--bg)', borderRadius: 14, fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
          By using Sell Like Crazy you agree to these terms. For questions contact <strong>sales@aussietoys.au</strong>
        </div>
      </div>
    </div>
  )
}
