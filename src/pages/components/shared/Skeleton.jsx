/**
 * Skeleton loading components — shimmer placeholders while content loads
 * Use instead of blank white space on initial load
 */

const shimmer = `
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
`

const skeletonStyle = {
  background: 'linear-gradient(90deg, #F0F0F5 25%, #E8E8EF 50%, #F0F0F5 75%)',
  backgroundSize: '400px 100%',
  animation: 'shimmer 1.4s ease-in-out infinite',
  borderRadius: 8,
}

export function SkeletonBox({ width = '100%', height = 16, radius = 8, style = {} }) {
  return (
    <>
      <style>{shimmer}</style>
      <div style={{ ...skeletonStyle, width, height, borderRadius: radius, ...style }} />
    </>
  )
}

export function SkeletonListingCard() {
  return (
    <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
      <style>{shimmer}</style>
      {/* Image placeholder */}
      <div style={{ ...skeletonStyle, height: 150, borderRadius: 0 }} />
      {/* Info */}
      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ ...skeletonStyle, height: 13, width: '85%' }} />
        <div style={{ ...skeletonStyle, height: 13, width: '60%' }} />
        <div style={{ ...skeletonStyle, height: 11, width: '40%' }} />
      </div>
    </div>
  )
}

export function SkeletonServiceCard() {
  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 14, marginBottom: 10 }}>
      <style>{shimmer}</style>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ ...skeletonStyle, width: 56, height: 56, borderRadius: 14, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ ...skeletonStyle, height: 14, width: '80%' }} />
          <div style={{ ...skeletonStyle, height: 11, width: '50%' }} />
          <div style={{ ...skeletonStyle, height: 11, width: '65%' }} />
        </div>
      </div>
    </div>
  )
}

export function SkeletonListingGrid({ count = 6 }) {
  return (
    <div className="listing-grid" style={{ paddingTop: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonListingCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonListingDetail() {
  return (
    <div className="page">
      <style>{shimmer}</style>
      {/* Image */}
      <div style={{ ...skeletonStyle, height: 280, borderRadius: 0 }} />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ ...skeletonStyle, height: 22, width: '75%' }} />
        <div style={{ ...skeletonStyle, height: 28, width: '35%' }} />
        <div style={{ ...skeletonStyle, height: 14, width: '55%' }} />
        <div style={{ ...skeletonStyle, height: 14, width: '90%' }} />
        <div style={{ ...skeletonStyle, height: 14, width: '80%' }} />
        <div style={{ ...skeletonStyle, height: 14, width: '70%' }} />
      </div>
    </div>
  )
}
