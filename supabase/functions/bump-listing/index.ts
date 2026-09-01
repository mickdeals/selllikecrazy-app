import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), { apiVersion: '2023-10-16' })
const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' } })
  try {
    const { listing_id, listing_title, seller_id, success_url, cancel_url } = await req.json()
    const priceId = Deno.env.get('STRIPE_PRICE_BUMP') || 'price_1U7TlKPHouocCowPDZhqvqIb'
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: success_url || 'https://selllikecrazy.app/my-listings?bumped=1',
      cancel_url: cancel_url || 'https://selllikecrazy.app/my-listings',
      metadata: { type: 'bump_listing', listing_id, seller_id: seller_id || '', listing_title: listing_title || 'Listing' },
    })
    return new Response(JSON.stringify({ url: session.url }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
  }
})
