/**
 * Supabase Edge Function: stripe-checkout
 * Creates a Stripe Checkout session for seller plan ($1/listing or $50/year)
 * This money goes to YOU (Sell Like Crazy) — not to sellers
 *
 * Deploy: supabase functions deploy stripe-checkout
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
    const { user_id, price_id, plan_id, success_url, cancel_url } = await req.json()

    const isSubscription = plan_id === 'annual'

    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? 'subscription' : 'payment',
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
        user_id,
        plan_id,
      },
      // Australian tax settings
      automatic_tax: { enabled: true },
      customer_creation: 'always',
    })

    // Update profile plan on success via webhook (see stripe-webhook function)
    return new Response(
      JSON.stringify({ checkout_url: session.url }),
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
      { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  }
})
