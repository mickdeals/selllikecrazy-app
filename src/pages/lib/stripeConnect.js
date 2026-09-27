/**
 * Stripe Connect — Sell Like Crazy
 *
 * Flow:
 * 1. Seller clicks "Connect Stripe" in dashboard
 * 2. We call our Supabase Edge Function which creates a Stripe Connect account
 * 3. Seller is redirected to Stripe's hosted onboarding (they enter bank details, ID etc)
 * 4. Stripe redirects back to selllikecrazy.app/stripe/return
 * 5. Seller is now set up — buyers can pay them directly
 *
 * Money flow:
 * Buyer pays → Stripe splits → Seller gets 100% → You get subscription fee separately
 *
 * No platform fee on sales (launch strategy — volume first)
 */

export const STRIPE_CONNECT_CONFIG = {
  // Your Stripe publishable key
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_KEY',

  // Plans — no transaction fee, just subscription
  plans: {
    per_listing: {
      id: 'per_listing',
      name: 'Pay per listing',
      amount: 100, // $1.00 AUD in cents
      currency: 'aud',
      type: 'payment', // one-time
      stripePriceId: import.meta.env.VITE_STRIPE_PRICE_PER_LISTING || 'price_PER_LISTING_ID',
      description: 'List one item for $1. No commitment.',
    },
    annual: {
      id: 'annual',
      name: 'Annual unlimited',
      amount: 5000, // $50.00 AUD in cents
      currency: 'aud',
      type: 'subscription', // recurring
      interval: 'year',
      stripePriceId: import.meta.env.VITE_STRIPE_PRICE_ANNUAL || 'price_ANNUAL_ID',
      description: 'Unlimited selling for $50/year. Auto-renews annually.',
    },
  },
}

/**
 * Create a Stripe Connect account for a new seller
 * Calls a Supabase Edge Function which talks to Stripe server-side
 */
export async function createSellerStripeAccount(userId, email) {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-connect-create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          user_id: userId,
          email,
          return_url: `${window.location.origin}/stripe/return`,
          refresh_url: `${window.location.origin}/stripe/refresh`,
        }),
      }
    )

    if (!res.ok) throw new Error('Failed to create Stripe account')
    const data = await res.json()

    // data.onboarding_url — redirect seller here to complete Stripe setup
    return { onboardingUrl: data.onboarding_url, accountId: data.account_id }
  } catch (err) {
    console.error('Stripe Connect error:', err)
    throw err
  }
}

/**
 * Check if a seller's Stripe account is fully set up
 */
export async function checkSellerStripeStatus(stripeAccountId) {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-connect-status`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ account_id: stripeAccountId }),
      }
    )
    const data = await res.json()
    return {
      isReady: data.charges_enabled && data.payouts_enabled,
      chargesEnabled: data.charges_enabled,
      payoutsEnabled: data.payouts_enabled,
      requirements: data.requirements,
    }
  } catch {
    return { isReady: false, chargesEnabled: false, payoutsEnabled: false }
  }
}

/**
 * Create a Stripe Checkout session for a seller plan subscription
 * Seller pays $1/listing or $50/year — money goes to YOU (Sell Like Crazy)
 * This is separate from buyer→seller payments which go direct via Connect
 */
export async function createPlanCheckout(userId, planId) {
  try {
    const plan = STRIPE_CONNECT_CONFIG.plans[planId]
    if (!plan) throw new Error('Invalid plan')

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          user_id: userId,
          price_id: plan.stripePriceId,
          plan_id: planId,
          success_url: `${window.location.origin}/dashboard?plan=success`,
          cancel_url: `${window.location.origin}/sell`,
        }),
      }
    )

    if (!res.ok) throw new Error('Failed to create checkout')
    const data = await res.json()
    return data.checkout_url
  } catch (err) {
    console.error('Checkout error:', err)
    throw err
  }
}
