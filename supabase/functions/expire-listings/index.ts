/**
 * Supabase Edge Function: expire-listings
 * Runs on a schedule (every hour via Supabase Cron)
 * Finds listings past their expiry date and marks them expired
 * Fires notification emails to sellers
 *
 * Deploy: supabase functions deploy expire-listings
 *
 * Schedule in Supabase dashboard → Database → Cron jobs:
 *   Name: expire-listings
 *   Schedule: 0 * * * *  (every hour)
 *   Command: SELECT net.http_post(
 *     url := 'https://YOUR_PROJECT.supabase.co/functions/v1/expire-listings',
 *     headers := '{"Authorization": "Bearer YOUR_SERVICE_KEY"}'::jsonb
 *   );
 *
 * Also set up a 7-day warning job:
 *   Name: expiry-warnings
 *   Schedule: 0 9 * * *  (every day at 9am)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
)

Deno.serve(async (req) => {
  const now = new Date().toISOString()

  try {
    // ── 1. Find and expire overdue listings ──
    const { data: expiredListings, error: expireError } = await supabase
      .from('listings')
      .update({ status: 'expired' })
      .lt('expires_at', now)
      .eq('status', 'active')
      .select('id, title, price, seller_id, listing_type, profiles!seller_id(email, display_name)')

    if (expireError) throw expireError

    console.log(`Expired ${expiredListings?.length || 0} listings`)

    // ── 2. Send expiry notifications ──
    for (const listing of expiredListings || []) {
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            type: 'LISTING_EXPIRED',
            recipient_id: listing.seller_id,
            recipient_email: listing.profiles?.email,
            data: {
              listingTitle: listing.title,
              listingId: listing.id,
              price: listing.price,
            },
          },
        })
      } catch (notifErr) {
        console.error(`Failed to notify seller ${listing.seller_id}:`, notifErr)
      }
    }

    // ── 3. Find listings expiring in 7 days — send warning ──
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    const sixDaysFromNow = new Date()
    sixDaysFromNow.setDate(sixDaysFromNow.getDate() + 6)

    const { data: expiringListings } = await supabase
      .from('listings')
      .select('id, title, price, seller_id, expires_at, profiles!seller_id(email)')
      .eq('status', 'active')
      .gt('expires_at', sixDaysFromNow.toISOString())
      .lt('expires_at', sevenDaysFromNow.toISOString())

    for (const listing of expiringListings || []) {
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            type: 'LISTING_EXPIRING_SOON',
            recipient_id: listing.seller_id,
            recipient_email: listing.profiles?.email,
            data: {
              listingTitle: listing.title,
              listingId: listing.id,
              daysLeft: 7,
            },
          },
        })
      } catch (notifErr) {
        console.error(`Failed to send warning to ${listing.seller_id}:`, notifErr)
      }
    }

    return new Response(
      JSON.stringify({
        expired: expiredListings?.length || 0,
        warned: expiringListings?.length || 0,
        timestamp: now,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Expiry job error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
