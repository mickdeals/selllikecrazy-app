/**
 * Social sharing — Sell Like Crazy
 * Share listings to Instagram, TikTok, Facebook, WhatsApp, SMS
 */

/**
 * Generate a shareable listing URL
 */
export function getListingShareUrl(listingId) {
  return `${window.location.origin}/listing/${listingId}`
}

/**
 * Generate share text for a listing
 */
export function getShareText(listing, symbol = '$') {
  return `Check out this listing on Sell Like Crazy!\n\n${listing.title} — ${symbol}${listing.price}\n\n${getListingShareUrl(listing.id)}`
}

/**
 * Share via Web Share API (native share sheet on mobile)
 * Falls back to copy link if not supported
 */
export async function shareNative(listing, symbol = '$') {
  const url = getListingShareUrl(listing.id)
  const text = `${listing.title} — ${symbol}${listing.price} on Sell Like Crazy`

  if (navigator.share) {
    try {
      await navigator.share({
        title: listing.title,
        text,
        url,
      })
      return { method: 'native', success: true }
    } catch (err) {
      if (err.name !== 'AbortError') {
        // Fall through to clipboard
      }
      return { method: 'native', success: false, aborted: true }
    }
  }

  // Fallback — copy to clipboard
  return copyLink(listing)
}

/**
 * Copy listing link to clipboard
 */
export async function copyLink(listing) {
  const url = getListingShareUrl(listing.id)
  try {
    await navigator.clipboard.writeText(url)
    return { method: 'clipboard', success: true }
  } catch {
    return { method: 'clipboard', success: false }
  }
}

/**
 * Share to specific platforms
 * Note: Deep links to Instagram/TikTok camera aren't possible from web
 * These open the apps/sites with pre-filled content where supported
 */
export const SHARE_PLATFORMS = {
  facebook: (listing, symbol) => {
    const url = encodeURIComponent(getListingShareUrl(listing.id))
    return `https://www.facebook.com/sharer/sharer.php?u=${url}`
  },
  twitter: (listing, symbol) => {
    const text = encodeURIComponent(`${listing.title} — ${symbol}${listing.price} on Sell Like Crazy`)
    const url = encodeURIComponent(getListingShareUrl(listing.id))
    return `https://twitter.com/intent/tweet?text=${text}&url=${url}`
  },
  whatsapp: (listing, symbol) => {
    const text = encodeURIComponent(getShareText(listing, symbol))
    return `https://wa.me/?text=${text}`
  },
  sms: (listing, symbol) => {
    const text = encodeURIComponent(getShareText(listing, symbol))
    return `sms:?body=${text}`
  },
  email: (listing, symbol) => {
    const subject = encodeURIComponent(`Check out this listing: ${listing.title}`)
    const body = encodeURIComponent(getShareText(listing, symbol))
    return `mailto:?subject=${subject}&body=${body}`
  },
}

export function openSharePlatform(platform, listing, symbol = '$') {
  const url = SHARE_PLATFORMS[platform]?.(listing, symbol)
  if (url) window.open(url, '_blank', 'noopener,noreferrer')
}
