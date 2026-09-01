import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), { apiVersion: '2023-10-16' })
const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' } })
  try {
    const { listing_id, listing_title, listing_price, shipping_cost, buyer_id, seller_id, success_url, cancel_url } = await req.json()
    const priceInCents = Math.round(parseFloat(listing_price) * 100)
    const shippingInCents = shipping_cost ? Math.round(parseFloat(shipping_cost) * 100) : 0
    const lineItems = [{ price_data: { currency: 'aud', product_data: { name: listing_title || 'Listing' }, unit_amount: priceInCents }, quantity: 1 }]
    if (shippingInCents > 0) lineItems.push({ price_data: { currency: 'aud', product_data: { name: 'Postage' }, unit_amount: shippingInCents }, quantity: 1 })
    const session = await stripe.checkout.sessions.create({ mode: 'payment', payment_method_types: ['card'], line_items: lineItems, success_url: success_url || 'https://selllikecrazy.app/?payment=success', cancel_url: cancel_url || 'https://selllikecrazy.app/', metadata: { listing_id, buyer_id, seller_id: seller_id || '', type: 'buy_listing' } })
    return new Response(JSON.stringify({ url: session.url }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
  } catch (err) {
    console.error('Error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
  }
})
