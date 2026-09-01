/**
 * Offer System — Sell Like Crazy
 * Buyer makes offer → seller accepts/counters/declines
 * Accepted offer locks listing for 6 hours
 */

import { supabase } from './supabase'
import { showLocalNotification, NOTIFICATION_TYPES } from './notifications'

export const OFFER_STATUS = {
  PENDING:   'pending',   // waiting for seller response
  ACCEPTED:  'accepted',  // seller accepted — 6hr payment window
  DECLINED:  'declined',  // seller declined
  COUNTERED: 'countered', // seller countered with different price
  EXPIRED:   'expired',   // 6hr window passed without payment
  PAID:      'paid',      // buyer paid — done
}

/**
 * Buyer makes an offer on a listing
 */
export async function makeOffer(listingId, buyerId, offerAmount, message = '') {
  const { data, error } = await supabase
    .from('offers')
    .insert({
      listing_id: listingId,
      buyer_id: buyerId,
      amount: offerAmount,
      message,
      status: OFFER_STATUS.PENDING,
      expires_at: null, // set when accepted
    })
    .select()
    .single()

  if (error) throw error

  // Notify seller via Supabase Edge Function
  await supabase.functions.invoke('send-notification', {
    body: {
      type: 'NEW_OFFER',
      listing_id: listingId,
      offer_amount: offerAmount,
      offer_id: data.id,
    },
  })

  return data
}

/**
 * Seller responds to an offer
 */
export async function respondToOffer(offerId, sellerId, action, counterAmount = null) {
  const updates = { status: action }

  if (action === OFFER_STATUS.ACCEPTED) {
    // Lock listing for 6 hours
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)
    updates.expires_at = expiresAt.toISOString()

    // Lock the listing
    const { data: offer } = await supabase
      .from('offers')
      .select('listing_id')
      .eq('id', offerId)
      .single()

    if (offer) {
      await supabase
        .from('listings')
        .update({ locked_until: expiresAt.toISOString(), status: 'reserved' })
        .eq('id', offer.listing_id)
        .eq('seller_id', sellerId)
    }
  }

  if (action === OFFER_STATUS.COUNTERED && counterAmount) {
    updates.counter_amount = counterAmount
    updates.status = OFFER_STATUS.COUNTERED
  }

  const { data, error } = await supabase
    .from('offers')
    .update(updates)
    .eq('id', offerId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get all offers for a seller's listings
 */
export async function getSellerOffers(sellerId) {
  const { data, error } = await supabase
    .from('offers')
    .select(`
      *,
      listings!inner(title, price, seller_id, emoji),
      profiles!buyer_id(display_name, email, rating)
    `)
    .eq('listings.seller_id', sellerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get all offers a buyer has made
 */
export async function getBuyerOffers(buyerId) {
  const { data, error } = await supabase
    .from('offers')
    .select(`
      *,
      listings(title, price, emoji, location),
      profiles!seller_id(display_name, rating)
    `)
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export function getOfferStatusLabel(status) {
  const map = {
    pending:   { label: 'Awaiting response', color: '#FF9500', bg: '#FFF3E0' },
    accepted:  { label: 'Accepted — pay within 6hrs', color: '#34C759', bg: '#E8F8EC' },
    declined:  { label: 'Declined', color: '#FF2D55', bg: '#FFF0F3' },
    countered: { label: 'Counter offer received', color: '#007AFF', bg: '#F0F5FF' },
    expired:   { label: 'Expired', color: '#AEAEB2', bg: '#F5F5F7' },
    paid:      { label: 'Paid ✓', color: '#34C759', bg: '#E8F8EC' },
  }
  return map[status] || map.pending
}
