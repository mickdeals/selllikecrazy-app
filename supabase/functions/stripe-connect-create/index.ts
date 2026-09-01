/**
 * Supabase Edge Function: stripe-connect-create
 *
 * Deploy this to Supabase:
 *   supabase functions deploy stripe-connect-create
 *
 * Set these secrets in Supabase dashboard → Functions → Secrets:
 *   STRIPE_SECRET_KEY = sk_live_... (or sk_test_... for testing)
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
    const { user_id, email, return_url, refresh_url } = await req.json()

    // 1. Create a Stripe Express account for the seller
    //    Express = Stripe handles all the compliance, ID verification, bank setup
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      country: 'AU',
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
      business_type: 'individual',
      metadata: { user_id },
    })

    // 2. Create the onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url,
      return_url,
      type: 'account_onboarding',
    })

    // 3. Save account ID to Supabase profiles
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    )

    await supabase
      .from('profiles')
      .update({ stripe_connect_id: account.id })
      .eq('id', user_id)

    return new Response(
      JSON.stringify({
        account_id: account.id,
        onboarding_url: accountLink.url,
      }),
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
