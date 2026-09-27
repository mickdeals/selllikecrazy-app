/**
 * Listing Expiry System — Sell Like Crazy
 *
 * Expiry rules:
 *   $1 per listing   → 30 days
 *   Free item listing → 30 days
 *   Free service      → 90 days
 *   Annual plan       → 365 days (matches subscription)
 *   Admin             → never expires
 *
 * On expiry:
 *   1. Supabase scheduled function flips status → 'expired'
 *   2. send-notification fires expiry email + push
 *   3. Seller can relist in one tap (another $1 or free if annual)
 *   4. Expired listings hidden from browse but kept in dashboard
 */

import { supabase } from './supabase'

export const EXPIRY_DAYS = {
  per_listing:    30,
  free_item:      30,
  free_service:   90,
  annual:         365,
  admin:          null, // never
}

export function getExpiryDate(plan, listingType = 'item', isAdmin = false) {
  if (isAdmin) return null

  let days
  if (plan === 'annual') {
    days = EXPIRY_DAYS.annual
  } else if (listingType === 'service') {
    days = EXPIRY_DAYS.free_service
  } else {
    days = EXPIRY_DAYS.free_item // same as per_listing
  }

  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

export function getExpiryLabel(plan, listingType = 'item', isAdmin = false) {
  if (isAdmin) return 'Never expires'
  if (plan === 'annual') return 'Active for 365 days'
  if (listingType === 'service') return 'Active for 90 days'
  return 'Active for 30 days'
}

export function getDaysRemaining(expiresAt) {
  if (!expiresAt) return null
  const now = new Date()
  const expiry = new Date(expiresAt)
  const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

export function getExpiryStatus(expiresAt) {
  if (!expiresAt) return { label: 'No expiry', color: '#635BFF', urgent: false }
  const days = getDaysRemaining(expiresAt)
  if (days === 0) return { label: 'Expires today', color: 'var(--red)', urgent: true }
  if (days <= 3)  return { label: `${days} day${days !== 1 ? 's' : ''} left`, color: 'var(--red)', urgent: true }
  if (days <= 7)  return { label: `${days} days left`, color: 'var(--orange)', urgent: false }
  return { label: `${days} days left`, color: 'var(--green)', urgent: false }
}

/**
 * Relist an expired listing — charges $1 or uses annual plan
 */
export async function relistExpiredListing(listingId, sellerId, plan, isAdmin) {
  const newExpiry = getExpiryDate(plan, 'item', isAdmin)

  const { error } = await supabase
    .from('listings')
    .update({
      status: 'active',
      expires_at: newExpiry,
      relisted_at: new Date().toISOString(),
    })
    .eq('id', listingId)
    .eq('seller_id', sellerId)

  if (error) throw error
  return newExpiry
}
