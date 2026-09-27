/**
 * Listing Gate — Sell Like Crazy
 *
 * Before any listing publishes, this module decides what happens:
 *
 * Priority order:
 * 1. Free listings remaining > 0  → publish immediately, decrement counter
 * 2. Plan === 'annual'            → publish immediately (unlimited)
 * 3. Plan === 'per_listing'       → save as draft, trigger $1 Stripe checkout
 * 4. No plan                      → save as draft, show plan picker, trigger checkout
 *
 * After $1 Stripe payment confirms:
 * → Webhook fires → listing status flips from 'draft' to 'active'
 */

import { supabase } from './supabase'
import { getExpiryDate } from './expiry'

export const LISTING_STATUS = {
  DRAFT:   'draft',    // saved but not visible
  PENDING: 'pending',  // awaiting payment
  ACTIVE:  'active',   // live and visible
  SOLD:    'sold',
  PAUSED:  'paused',
  REMOVED: 'removed',
}

/**
 * Main gate function — call this when seller taps "Publish"
 *
 * @param {Object} listingData - all form fields
 * @param {Object} sellerProfile - { id, plan, freeListingsRemaining, stripeConnectReady }
 * @param {Function} onNeedsPayment - called with checkoutUrl when $1 payment needed
 * @param {Function} onSuccess - called with listing when published immediately
 * @param {Function} onError - called with error message
 */
export async function publishListing(listingData, sellerProfile, { onNeedsPayment, onSuccess, onError }) {
  const { id: sellerId, plan, freeListingsRemaining, freeServicesRemaining, stripeConnectReady, isAdmin } = sellerProfile
  const isService = listingData.listing_type === 'service'

  // ── Admin bypass — always free, no limits ──
  const freeRemaining = isService ? (freeServicesRemaining ?? 1) : freeListingsRemaining
  const hasFreeListings = freeRemaining > 0
  const isAnnual = plan === 'annual'
  const isPerListing = plan === 'per_listing'
  const publishImmediately = isAdmin || hasFreeListings || isAnnual

  try {
    if (publishImmediately) {
      // ── PATH A: Publish immediately ──
      const status = LISTING_STATUS.ACTIVE
      const isFree = hasFreeListings && !isAnnual
      const expiresAt = getExpiryDate(isAdmin ? 'admin' : isAnnual ? 'annual' : 'free', isService ? 'service' : 'item', isAdmin)

      const { data: listing, error } = await supabase
        .from('listings')
        .insert({
          ...listingData,
          seller_id: sellerId,
          status,
          free_listing: isFree,
          payment_status: 'not_required',
          expires_at: expiresAt,
        })
        .select()
        .single()

      if (error) throw error

      // Decrement correct free counter (never for admin or annual)
      if (isFree && !isAdmin) {
        if (isService) {
          await supabase.from('profiles')
            .update({ free_services_remaining: Math.max(0, (freeServicesRemaining ?? 1) - 1) })
            .eq('id', sellerId)
        } else {
          await supabase.from('profiles')
            .update({ free_listings_remaining: freeListingsRemaining - 1 })
            .eq('id', sellerId)
        }
      }

      onSuccess(listing, { usedFree: isFree && !isAdmin, plan: isAdmin ? 'admin' : isAnnual ? 'annual' : 'free' })

    } else {
      // ── PATH B: Save as draft, trigger $1 payment ──
      // 1. Save listing as pending payment
      const { data: listing, error: insertError } = await supabase
        .from('listings')
        .insert({
          ...listingData,
          seller_id: sellerId,
          status: LISTING_STATUS.PENDING,
          free_listing: false,
          payment_status: 'pending',
        })
        .select()
        .single()

      if (insertError) throw insertError

      // 2. Create Stripe checkout for $1 with listing ID in metadata
      const checkoutUrl = await createPerListingCheckout(sellerId, listing.id)

      // 3. Hand off to payment flow
      onNeedsPayment(checkoutUrl, listing.id)
    }

  } catch (err) {
    console.error('Publish gate error:', err)
    onError(err.message || 'Failed to publish listing')
  }
}

/**
 * Create a $1 Stripe checkout session for a specific listing
 * Listing ID is stored in metadata so webhook can publish it on success
 */
async function createPerListingCheckout(sellerId, listingId) {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-listing-checkout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          seller_id: sellerId,
          listing_id: listingId,
          price_id: import.meta.env.VITE_STRIPE_PRICE_PER_LISTING,
          success_url: `${window.location.origin}/listing/paid?listing_id=${listingId}`,
          cancel_url: `${window.location.origin}/sell?cancelled=true`,
        }),
      }
    )

    if (!res.ok) throw new Error('Checkout creation failed')
    const data = await res.json()
    return data.checkout_url
  } catch (err) {
    // Demo fallback
    console.warn('Stripe not configured — demo mode')
    return null
  }
}

/**
 * Check gate status for a seller
 * Returns what will happen when they try to publish
 */
export function getGateStatus(profile, listingType = 'item') {
  const { plan, freeListingsRemaining, freeServicesRemaining, isAdmin } = profile || {}
  const isService = listingType === 'service'
  const freeRemaining = isService ? (freeServicesRemaining ?? 1) : freeListingsRemaining

  // Admin — always free
  if (isAdmin) {
    return {
      type: 'admin',
      label: '⚡ Admin — unlimited free listings',
      sublabel: 'All listings publish immediately at no cost',
      color: '#635BFF',
      immediate: true,
    }
  }

  if (freeRemaining > 0) {
    return {
      type: 'free',
      label: isService
        ? `1 free service listing remaining`
        : `${freeRemaining} free listing${freeRemaining !== 1 ? 's' : ''} remaining`,
      sublabel: 'Publishes immediately — no payment needed',
      color: 'var(--green)',
      immediate: true,
    }
  }

  if (plan === 'annual') {
    return {
      type: 'annual',
      label: 'Annual plan — unlimited selling',
      sublabel: 'Publishes immediately',
      color: 'var(--red)',
      immediate: true,
    }
  }

  if (plan === 'per_listing') {
    return {
      type: 'per_listing',
      label: '$1 per listing',
      sublabel: 'You\'ll be taken to payment — listing publishes after',
      color: 'var(--orange)',
      immediate: false,
    }
  }

  return {
    type: 'none',
    label: 'Choose a plan to publish',
    sublabel: '$1 per listing or $50/year unlimited',
    color: 'var(--muted)',
    immediate: false,
  }
}

/**
 * After successful $1 payment — publish the pending listing
 * Called by the webhook handler AND the success page (belt and braces)
 */
export async function activateListingAfterPayment(listingId) {
  const { error } = await supabase
    .from('listings')
    .update({
      status: LISTING_STATUS.ACTIVE,
      payment_status: 'paid',
    })
    .eq('id', listingId)
    .eq('status', LISTING_STATUS.PENDING) // safety check

  if (error) throw error
}
