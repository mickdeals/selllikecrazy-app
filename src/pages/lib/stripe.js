import { loadStripe } from '@stripe/stripe-js'

// Replace with your Stripe publishable key from dashboard.stripe.com
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_KEY_HERE'

export const stripePromise = loadStripe(stripeKey)

export const PLANS = {
  PER_LISTING: {
    id: 'per_listing',
    name: 'Pay per listing',
    price: 1,
    currency: 'AUD',
    description: 'Pay $1 per listing. No commitment.',
    // Replace with your Stripe Price ID from dashboard.stripe.com
    stripePriceId: 'price_PER_LISTING_ID',
  },
  ANNUAL: {
    id: 'annual',
    name: 'Annual unlimited',
    price: 50,
    currency: 'AUD',
    description: 'Unlimited selling for $50/year. Auto-renews annually.',
    // Replace with your Stripe Price ID from dashboard.stripe.com
    stripePriceId: 'price_ANNUAL_ID',
  },
}
