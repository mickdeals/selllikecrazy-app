import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), { apiVersion: '2023-10-16' })
const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
Deno.serve(async (req) => {
  const body = await req.text()
  let event
  try { event = JSON.parse(body) } catch { return new Response('bad json', { status: 400 }) }
  console.log('event:', event.type)
  if (event.type === 'checkout.session.completed') {
    const s = event.data.object
    const { listing_id, buyer_id, seller_id, type, user_id, plan_id } = s.metadata || {}
    console.log('meta:', JSON.stringify(s.metadata))
    if (type === 'buy_listing' && listing_id && buyer_id) {
      const { data: l } = await supabase.from('listings').select('title,price,shipping_cost,seller_id').eq('id', listing_id).single()
      await supabase.from('purchases').insert({ buyer_id, seller_id: l?.seller_id||seller_id||null, listing_id, listing_title: l?.title||'Listing', listing_price: l?.price||0, shipping_cost: l?.shipping_cost||0, total_paid: (s.amount_total||0)/100, stripe_session_id: s.id, stripe_payment_intent: s.payment_intent, status: 'completed' })
      await supabase.from('listings').update({ status: 'sold' }).eq('id', listing_id)
      console.log('Purchase recorded!')
    }
          if (type === 'bump_listing' && listing_id) {
        const bumpedUntil = new Date(Date.now() + 48 * 3600 * 1000).toISOString()
        await supabase.from('listings').update({ bumped_until: bumpedUntil }).eq('id', listing_id)
        console.log('Listing bumped until:', bumpedUntil)
      }
      if (type === 'per_listing' && listing_id) {
      await supabase.from('listings').update({ status: 'active', payment_status: 'paid' }).eq('id', listing_id).eq('seller_id', seller_id)
    }
    if (plan_id === 'annual' && user_id) {
      const exp = new Date(); exp.setFullYear(exp.getFullYear()+1)
      await supabase.from('profiles').update({ plan: 'annual', plan_expires_at: exp.toISOString(), free_listings_remaining: 999999 }).eq('id', user_id)
    }
  }
  return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })
})

