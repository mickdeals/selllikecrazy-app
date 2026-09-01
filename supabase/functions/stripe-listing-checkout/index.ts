/**
 * Supabase Edge Function: stripe-listing-checkout
 * Creates a $1 Stripe Checkout for a single listing
 * Listing ID stored in metadata so webhook can activate it on payment
 *
 * Deploy: supabase functions deploy stripe-listing-checkout
 */

import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2023-10-16',
})

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    })
  }

  try {
    const { seller_id, listing_id, price_id, success_url, cancel_url } = await req.json()

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      success_url,
      cancel_url,
      metadata: {
        seller_id,
        listing_id,   // ← webhook uses this to activate the listing
        type: 'per_listing',
      },
      // Show what they're paying for
      custom_text: {
        submit: {
          message: 'Your listing will go live immediately after payment.',
        },
      },
      automatic_tax: { enabled: true },
    })

    return new Response(
      JSON.stringify({ checkout_url: session.url, session_id: session.id }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})
